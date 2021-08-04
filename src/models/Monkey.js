/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import Configuration from './Configuration'
import Repository from './Repository'
import UndoElement from '../commands/UndoElement'
import { logger } from '../helpers/logger'

class Monkey {
  constructor(rawConfigurations, scope, globalVariables, withUndo = true, intervalTime = 100, urlManager = false, inlineRuleManager = false, featureFlags = {}) {
    this.scope = scope
    this.globalVariables = globalVariables
    this.undo = []
    this.repository = new Repository({})
    this.withUndo = withUndo
    this.featureFlags = featureFlags

    this.intervalTime = intervalTime
    if (typeof this.intervalTime !== 'number' || this.intervalTime < 100) {
      logger('warn', 'Interval time is not well-defined: ', this.intervalTime).write()
      this.intervalTime = 100
    }
    this.intervals = []

    this.configurations = rawConfigurations.map((rawConfig) => {
      const config = new Configuration(rawConfig.content, this.repository, rawConfig.enabled === true, rawConfig.values, featureFlags, globalVariables)
      this.repository.addConfiguration(rawConfig.name, config)
      return [rawConfig.name, config]
    })
    this.urlManager = urlManager === false ? { add: () => {}, remove: () => {}, clear: () => {} } : urlManager
    this.inlineRuleManager = inlineRuleManager === false ? { add: () => {}, run: () => {}, clear: () => {} } : inlineRuleManager
    this.observers = []
  }

  addObserver(observer) {
    this.observers.push(observer)
  }

  notifyObservers(event) {
    this.observers.forEach(observer => observer.update(event))
  }

  getUndoLength() {
    return this.undo.length
  }

  countRunningConfigurations() {
    return this.intervals.length
  }

  isRunning() {
    return this.intervals.length > 0
  }

  addUndo(elements) {
    if (this.withUndo) {
      // Simple protection against loops that fill up the undo array.
      if (this.undo.length > 100000) {
        logger('warn', 'Too many undo elements, disabling undo feature. Your configuration might have a replacement loop.').write()
        this.withUndo = false
      }
      this.undo = this.undo.concat(elements)
    }
    this.notifyObservers({
      type: 'addUndo',
      elements
    })
  }

  applyOnce(configuration) {
    // Execute the commands for webRequest hooks only once
    this.addUndo(configuration.apply(this.urlManager, 'value', 'url'))
    this.addUndo(configuration.apply(this.inlineRuleManager, 'value', 'ajax'))
  }

  apply(configuration) {
    const t0 = this.scope.performance.now()
    const sum = {}
    // Some UIs provide corner cases we want to cover with DemoMonkey for ease of use
    // Most of them are text, that is shortened or split over multiple elements.
    // We do them early, because later modifications may cause problems to get them solved.
    this._cornerCases(configuration)

    sum.text = (this._applyOnXpathGroup(configuration, '//body//text()[ normalize-space(.) != ""]', 'text', 'data'))
    configuration.getTextAttributes().forEach(attribute => {
      sum.text += (this._applyOnXpathGroup(configuration, `//*[@${attribute}]`, 'text', attribute))
    })
    sum.input = (this._applyOnXpathGroup(configuration, '//body//input', 'input', 'value'))
    sum.image = (this._applyOnXpathGroup(configuration, '//body//img', 'image', 'src'))
    sum.image += (this._applyOnXpathGroup(configuration, '//body//div[contains(@ad-test-id, "dash-image-widget-renderer")]', 'image', 'style.backgroundImage'))
    sum.dashboard = (this._applyOnXpathGroup(configuration, '//body//div[contains(@class, "ads-dashboard-canvas-pane")]', 'ad-dashboard', 'style'))

    // Apply the text commands on the title element
    this.addUndo(configuration.apply(this.scope.document, 'title', 'text'))

    // Finally we can apply document commands on the document itself.
    this.addUndo(configuration.apply(this.scope.document, 'documentElement', 'document'))

    this.notifyObservers({
      type: 'applied',
      stats: {
        sum,
        runtime: this.scope.performance.now() - t0,
        intervalTime: this.intervalTime,
        undoLength: this.undo.length
      }
    })
  }

  _applyOnXpathGroup(configuration, xpath, groupName, key) {
    let text, i
    const texts = this.scope.document.evaluate(xpath, this.scope.document, null, 6, null)
    for (i = 0; (text = texts.snapshotItem(i)) !== null; i += 1) {
      this.addUndo(configuration.apply(text, key, groupName))
    }
    return i
  }

  _cornerCases(configuration) {
    const undos = []
    // On the flowmap nodes might be shorten by name, but the full name is still kept in the title.
    // We can use that knowledge to replace the shortened names
    this.scope.document.querySelectorAll('svg .adsFlowMapNode > title').forEach(title => {
      title.parentElement.querySelectorAll('.adsFlowMapTextContainer tspan').forEach(tspan => {
        if (tspan.textContent.includes('...')) {
          const pseudoNode = {
            value: title.textContent
          }
          configuration.apply(pseudoNode, 'value', 'text')
          const replacement = pseudoNode.value.length > 32 ? pseudoNode.value.substr(0, 15) + '...' + pseudoNode.value.substr(-15) : pseudoNode.value
          if (tspan.textContent !== replacement) {
            const original = tspan.textContent
            tspan.textContent = replacement
            undos.push(new UndoElement(tspan, 'textContent', original, tspan.textContent))
          }
        }
      })
    })

    // In AppDynamics Analytics the Tree widget view uses <tspan> in <text> to split
    // text over multiple lines. The full text is contained in a <title> tag.
    // So we search for the <title> in the <text> and check if tspans are contained.
    this.scope.document.querySelectorAll('svg text title').forEach(title => {
      const tspans = title.parentElement.querySelectorAll('tspan')
      if (tspans.length > 1) {
        let content = []
        tspans.forEach(function (tspan) {
          content = content.concat(tspan.textContent.split(' '))
        })
        const counter = content.length

        const pseudoNode = {
          value: content.join(' ')
        }

        configuration.apply(pseudoNode, 'value', 'text')

        let words = pseudoNode.value.split(' ')

        if (words.length > counter) {
          words = words.slice(0, counter)
          words[counter - 1] = '...'
        }
        let wordCounter = 0
        tspans.forEach(function (tspan) {
          const original = tspan.textContent
          tspan.textContent = words.slice(wordCounter,
            wordCounter + tspan.textContent.split(' ').length).join(' ')
          wordCounter += tspan.textContent.split(' ').length
          undos.push(new UndoElement(tspan, 'textContent', original, tspan.textContent))
        })
      }
    })

    // In AppDynamics Analytics the Business Journey view shortens labels over the milestones.
    // In the source it looks like the following: Case <text>Lon...<title>Long Text</title></text>
    this.scope.document.querySelectorAll('svg text title').forEach(title => {
      if (title.parentElement.textContent.includes('...')) {
        const [short, long] = title.parentElement.textContent.split('...')
        if (long.startsWith(short)) {
          const pseudoNode = {
            value: long
          }

          configuration.apply(pseudoNode, 'value', 'text')

          const result = pseudoNode.value.substring(0, short.length) + '...'

          const textNode = Array.from(title.parentElement.childNodes).filter(node => node.nodeType === 3)[0]

          const original = textNode.data
          textNode.data = result
          undos.push(new UndoElement(textNode, 'data', original, textNode.data))
        }
      }
    })

    // The Service Now Event Management Dashboard shortens words by space on a box
    // The full name is kept as "name" of the tspan
    this.scope.document.querySelectorAll('svg > g text > tspan[name]').forEach(tspan => {
      const pseudoNode = {
        value: tspan.attributes.name.value
      }
      configuration.apply(pseudoNode, 'value', 'text')

      const original = tspan.textContent
      tspan.textContent = pseudoNode.value.substring(0, tspan.textContent.length)

      undos.push(new UndoElement(tspan, 'textContent', original, tspan.textContent))
    })

    // The Experience Journey Map in AppDynamics shortens the labels but provides a "data-full-string"
    // property we can work with
    this.scope.document.querySelectorAll('eum-user-journey-map-label > div.eum-ui-user-journey-node-body').forEach(node => {
      const pseudoNode = {
        value: node.dataset.fullString
      }
      configuration.apply(pseudoNode, 'value', 'text')
      if (node.dataset.fullString !== pseudoNode.value) {
        const original = node.textContent
        const originalFullString = node.dataset.fullString
        const replacement = original.length < pseudoNode.value.length ? '...' + pseudoNode.value.substring(pseudoNode.value.length - original.length - 3) : pseudoNode.value
        node.dataset.fullString = pseudoNode.value
        node.textContent = replacement
        undos.push(new UndoElement(node, 'textContent', original, node.textContent))
        undos.push(new UndoElement(node.dataset, 'fullString', originalFullString, node.dataset.fullString))
      }
    })
    this.addUndo(undos)
  }

  run(configuration) {
    this.scope.setTimeout(() => {
      this.applyOnce(configuration)
    }, this.intervalTime)
    return this.scope.setInterval(() => {
      this.apply(configuration)
    }, this.intervalTime)
  }

  start() {
    this.intervals = this.runAll()
    return this.intervals.length
  }

  stop() {
    this.intervals.forEach((interval) => {
      this.scope.clearInterval(interval)
    })

    if (this.withUndo) {
      this.undo.reverse().forEach(undo => {
        if (typeof undo.apply === 'function') {
          undo.apply()
        }
      })
      this.undo = []
    }

    this.urlManager.clear()
    this.inlineRuleManager.clear()
  }

  runAll() {
    return this.configurations.reduce((result, cfg) => {
      const configuration = cfg[1]

      if (configuration.isEnabledForUrl(this.scope.location.href)) {
        result.push(this.run(configuration))
      }

      return result
    }, [])
  }
}

export default Monkey

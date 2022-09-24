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
import MatchRule from './MatchRule'

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
class NetRequestManager {
  constructor(declarativeNetRequest, tabsQuery, logger, onSave) {
    this.declarativeNetRequest = declarativeNetRequest
    this.tabsQuery = tabsQuery
    this.logger = logger
    this.list = {}
    this.tabs = {}
    this.index = 1
    this.onSave = onSave
  }

  load(list, tabs, index) {
    this.list = list
    this.tabs = tabs
    this.index = index
  }

  save() {
    this.onSave({
      list: this.list,
      tabs: this.tabs,
      index: this.index
    })
  }

  enable() {
    this.logger('debug', 'Enable net request manager').write()
    this.clear()
    this.tabsQuery({}, (tabs) => {
      tabs.forEach(tab => {
        if (tab.url) {
          this.updateTab(tab.id, tab.url)
        }
      })
    })
  }

  disable() {
    this.logger('debug', 'Disable net request manager').write()
    this.clear()
  }

  _getResourceType(type) {
    if (type === '*') {
      return ['csp_report', 'font', 'image', 'main_frame', 'media', 'object', 'other', 'ping', 'script', 'stylesheet', 'sub_frame', 'webbundle', 'websocket', 'webtransport', 'xmlhttprequest']
    }
    return type.split(',')
  }

  _getTabIds(includeRules, excludeRules) {
    return Object.keys(this.tabs).reduce((accumulator, id) => {
      // console.log(includeRules, excludeRules, this.tabs[id])
      if (new MatchRule(includeRules, excludeRules).test(this.tabs[id])) {
        accumulator.push(parseInt(id))
      }
      return accumulator
    }, [])
  }

  add(description) {
    this.logger('debug', 'Add web hook', description.id).write()

    const id = this.list[description.id] ? this.list[description.id].rule.id : this.index++

    const rule = {
      id,
      priority: 1,
      action: {
        type: description.action
      },
      condition: {
        resourceTypes: this._getResourceType(description.type),
        urlFilter: description.url,
        tabIds: this._getTabIds(description.includeRules, description.excludeRules)
      }
    }
    if (description.action === 'redirect') {
      rule.action.redirect = {
        url: description.options.redirect
      }
    }
    // console.log(description, rule)

    this.list[description.id] = {
      rule,
      includeRules: description.includeRules,
      excludeRules: description.excludeRules
    }

    // tab list must not be empty
    if (rule.condition.tabIds.length > 0) {
      this.declarativeNetRequest.updateSessionRules({
        addRules: [rule],
        removeRuleIds: [rule.id] // noop?
      })
    }

    this.save()
  }

  remove(id) {
    if (this.list[id]) {
      this.logger('debug', 'Remove web hook', id).write()
      const { rule } = this.list[id]
      this.declarativeNetRequest.updateDynamicRules(
        {
          removeRuleIds: [rule.id]
        }
      )
      delete this.list[id]
      this.save()
    }
  }

  removeTab(tabId) {
    delete this.tabs[tabId]
  }

  updateTab(tabId, url) {
    this.logger('debug', `Tab ${tabId} has new url ${url}, check for updates.`).write()
    this.tabs[tabId] = url
    Object.keys(this.list).forEach(id => {
      const { rule, includeRules, excludeRules } = this.list[id]
      // console.log(rule, includeRules, excludeRules)
      // check if new url matches the include/exclude rules
      if (new MatchRule(includeRules, excludeRules).test(url)) {
        // URL matches: the tab will be added to the rule
        if (!rule.condition.tabIds.includes(tabId)) {
          rule.condition.tabIds.push(tabId)
          this.declarativeNetRequest.updateSessionRules({
            addRules: [rule],
            removeRuleIds: [rule.id]
          })
        }
      } else {
        // URL does not match: the tab will be removed from the rule
        rule.condition.tabIds = rule.condition.tabIds.filter(id => id !== tabId)
        this.declarativeNetRequest.updateSessionRules({
          addRules: rule.condition.tabIds.length > 0 ? [rule] : [],
          removeRuleIds: [rule.id]
        })
      }
    })
    this.save()
  }

  clear() {
    this.logger('debug', 'Clear all web hooks').write()
    this.list = {}
    this.declarativeNetRequest.getSessionRules(rules => {
      this.declarativeNetRequest.updateSessionRules({
        removeRuleIds: rules.map(rule => rule.id)
      })
    })
    this.save()
  }
}

export default NetRequestManager

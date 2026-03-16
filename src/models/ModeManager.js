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
import ElementPicker from './ElementPicker'
import Command from '../commands/Command'

class ModeManager {
  constructor(
    scope,
    monkey,
    manifest,
    debugMode = false,
    debugBox = false,
    liveMode = false,
    analyticsSnippet = ''
  ) {
    this.monkey = monkey
    this.scope = scope
    this.manifest = manifest
    this.debugMode = debugMode
    this.debugBox = debugBox
    this.liveMode = liveMode
    this.analyticsSnippet = analyticsSnippet

    this.started = false

    this.avgRunTime = 0
    this.maxRunTime = 0
    this.runCount = 0

    this.monkey.addObserver(this)

    this.debugTooltip = null

    this.tooltipMouseEnter = (event) => {
      if (this.debugTooltip) {
        this.debugTooltip.innerHTML = event.target.dataset.demoMonkeyDebugSource
        const rect = event.target.getBoundingClientRect()
        this.debugTooltip.style.display = 'block'
        this.debugTooltip.style.left = rect.x + 'px'
        this.debugTooltip.style.top = rect.y + rect.height + 'px'
      }
    }
    this.tooltipMouseLeave = (event) => {
      if (this.debugTooltip) {
        this.debugTooltip.innerHTML = ''
        this.debugTooltip.style.display = 'none'
      }
    }
  }

  start() {
    this.updateMonkeyHead()
    this.started = true
  }

  reload(monkey, debugMode = false, debugBox = false, liveMode = false) {
    if (this.demoMonkeyPicker) {
      this.demoMonkeyPicker.close()
      delete this.demoMonkeyPicker
    }

    this.clearDebugAttributes()

    this.monkey = monkey
    this.debugMode = debugMode
    this.debugBox = debugBox
    this.liveMode = liveMode

    this.monkey.addObserver(this)

    if (this.started) {
      this.updateMonkeyHead()
    }
  }

  update(event) {
    if (event.type === 'applied') {
      this.updateDebugBox(event.stats.runtime, event.stats.sum, event.stats.undoLength)
    }
    if (event.type === 'addUndo' && this.debugMode) {
      event.elements.forEach((undoElement) => {
        if (!undoElement.target) {
          return
        }
        const isHidden =
          undoElement.key === 'style.display' && undoElement.replacement === 'none'
            ? undoElement.original
            : false
        const source = undoElement.source
        switch (undoElement.target.nodeType) {
          case 1:
            if (undoElement.target && undoElement.target.dataset) {
              this.addDebugAttribute(undoElement.target, isHidden, source)
            }
            break
          case 3:
            if (
              undoElement.target &&
              undoElement.target.parentElement &&
              undoElement.target.parentElement.dataset
            ) {
              this.addDebugAttribute(undoElement.target.parentElement, isHidden, source)
            }
            break
        }
      })
    }
  }

  addTooltipListeners(element) {
    element.addEventListener('mouseenter', this.tooltipMouseEnter)
    element.addEventListener('mouseleave', this.tooltipMouseLeave)
  }

  removeTooltipListeners(element) {
    element.removeEventListener('mouseenter', this.tooltipMouseEnter)
    element.removeEventListener('mouseleave', this.tooltipMouseLeave)
  }

  addDebugAttribute(element, isHidden, source) {
    // UndoElement(node, 'display.style', original, 'none')
    element.dataset.demoMonkeyDebug = true
    if (source instanceof Command) {
      element.dataset.demoMonkeyDebugSource = source.toString()
      this.addTooltipListeners(element)
    }
    if (isHidden !== false) {
      element.dataset.demoMonkeyDebugDisplay = isHidden === '' ? 'initial' : isHidden
      element.style.setProperty(
        '--data-demo-monkey-debug-display',
        isHidden === '' ? 'initial' : isHidden
      )
    }
  }

  clearDebugAttributes() {
    this.scope.document.querySelectorAll('[data-demo-monkey-debug]').forEach((element) => {
      delete element.dataset.demoMonkeyDebug
      delete element.dataset.demoMonkeyDebugDisplay
      delete element.dataset.demoMonkeyDebugSource
      this.removeTooltipListeners(element)
      element.style.removeProperty('--data-demo-monkey-debug-display')
    })
  }

  removeDebugElements() {
    ;[
      '#demo-monkey-debug-helper-svg',
      '#demo-monkey-debug-helper-style',
      '#demo-monkey-debug-box'
    ].forEach((id) => {
      const elem = this.scope.document.querySelector(id)
      if (elem) {
        elem.remove()
      }
    })
    this.clearDebugAttributes()
  }

  removeEditor() {
    const oldEditor = this.scope.document.getElementById('demo-monkey-editor')
    if (oldEditor) {
      oldEditor.remove()
    }
  }

  toggleDebugMode() {
    if (this.debugMode) {
      if (this.scope.document.getElementById('demo-monkey-debug-helper-style') === null) {
        this.scope.document.head.insertAdjacentHTML(
          'beforeend',
          `<style id="demo-monkey-debug-helper-style">
        [data-demo-monkey-debug] { background-color: rgba(255, 255, 0, 0.5); }
        svg [data-demo-monkey-debug] { filter: url(#dm-debug-filter-visible) }
        [data-demo-monkey-debug-display] { display: var(--data-demo-monkey-debug-display) !important; background-color: rgba(255, 0, 0, 0.5); }
        [data-demo-monkey-debug-display] * { display: var(--data-demo-monkey-debug-display) !important; background-color: rgba(255, 0, 0, 0.5); }
        svg [data-demo-monkey-debug-display] { display: var(--data-demo-monkey-debug-display) !important; filter: url(#dm-debug-filter-hidden) }
        #demo-monkey-debug-box { position: fixed; bottom: 0px; right: 0px; border: 1px solid rgb(168, 201, 135); backdrop-filter:blur(4px); background: rgb(168, 201, 135, 0.8); z-index: 99999; pointer-events: none; display: flex; flex-wrap: nowrap; justify-content: flex-end; border-radius: 6px 0px 0px 0px; font-family: Robot, arial, sans-serif; font-size: 10pt;  box-shadow: 0 0 2px 2px #ccc;}
        #demo-monkey-debug-box div { border-right: 1px solid  rgb(168, 201, 135); padding: 4px 16px 0px 16px; }
        #demo-monkey-debug-box button { pointer-events: auto; }
        div#demo-monkey-logo { pointer-events: auto; cursor: pointer; padding: 2px; border-right: 0 }
        #demo-monkey-debug-tooltip {
          border: 1px solid rgb(168, 201, 135);
          position: fixed;
          top: 80;
          left: 50;
          padding: 4px;
          border-radius: 4px;
          background: rgb(168, 201, 135, 1);
          box-shadow: 4px 4px 2px 2px rgb(128,128,128,0.4);
          font-family: Robot, arial, sans-serif; font-size: 10pt;
          z-index: 99999;
          display: none;
        }
        #demo-monkey-debug-tooltip:after, #demo-monkey-debug-tooltip:before {
          bottom: 100%;
          left: 8px;
          border: solid transparent;
          content: " ";
          height: 0;
          width: 0;
          position: absolute;
          pointer-events: none;
        }
        #demo-monkey-debug-tooltip:after {
          border-color: 0;
          border-bottom-color: rgb(168, 201, 135);
          border-width: 4px;
          margin-left: -4px;
        #demo-monkey-debug-tooltip:before {
          border-color: 0;
          border-bottom-color: rgb(168, 201, 135);
          border-width: 7px;
          margin-left: -7px;
        }
        </style>`
        )
      }
      if (this.scope.document.getElementById('demo-monkey-debug-helper-svg') === null) {
        this.scope.document.body.insertAdjacentHTML(
          'beforeend',
          `<svg id="demo-monkey-debug-helper-svg">
          <defs>
            <filter x="0" y="0" width="1" height="1" id="dm-debug-filter-visible">
              <feFlood flood-color="yellow" flood-opacity="0.5" />
              <feComposite in="SourceGraphic" />
            </filter>
            <filter x="0" y="0" width="1" height="1" id="dm-debug-filter-hidden">
              <feFlood flood-color="red" flood-opacity="0.5" />
              <feComposite in="SourceGraphic" />
            </filter>
          </defs>
        </svg>`
        )
      }
      if (this.scope.document.getElementById('demo-monkey-debug-box') === null) {
        this.scope.document.body.insertAdjacentHTML(
          'beforeend',
          `
        <div id="demo-monkey-debug-box">
          <div id="demo-monkey-logo" title="Click to minimize/maximize Demo Monkey Bar">
            <img src="${this.scope.chrome.runtime.getURL('icons/monkey_48.png')}" alt="DemoMonkey" width="20" height="20" style="display:block" />
          </div>
          <div class="demo-monkey-debug-box-inner">Runtime (ms): <span id="demo-monkey-last-runtime"></span></div>
          <div class="demo-monkey-debug-box-inner">Inspected: <span id="demo-monkey-elements-count"></span></div>
          <div class="demo-monkey-debug-box-inner" display="none" id="demo-monkey-ajax-count"></div>
          <div class="demo-monkey-debug-box-inner">Undo Length: <span id="demo-monkey-undo-length"></span></div>
          <button class="demo-monkey-debug-box-inner" id="demo-monkey-editor-toggle">Toggle <i>Right-Click</i> Editor</button>
        </div>
        <div id="demo-monkey-debug-tooltip"></div>`
        )
        this.debugTooltip = this.scope.document.getElementById('demo-monkey-debug-tooltip')
        this.demoMonkeyPicker = false
        this.boxVisible = true
        const logo = this.scope.document.getElementById('demo-monkey-logo')
        const inner = Array.from(
          this.scope.document.getElementsByClassName('demo-monkey-debug-box-inner')
        )
        const toggleBox = () => {
          // const box = document.getElementById('demo-monkey-debug-box')
          if (this.boxVisible) {
            // box.style.right = (-box.clientWidth + logo.clientWidth) + 'px'
            inner.forEach((e) => {
              e.style.display = 'none'
            })
          } else {
            // box.style.right = '0px'
            inner.forEach((e) => {
              e.style.display = 'block'
            })
          }
          this.boxVisible = !this.boxVisible
        }
        if (!this.debugBox) {
          toggleBox()
        }
        logo.addEventListener('click', toggleBox)
        this.scope.document
          .getElementById('demo-monkey-editor-toggle')
          .addEventListener('click', (e) => {
            const callback = (target, clickEvent, mouseEvent) => {
              this.removeEditor()

              // console.log(target, clickEvent, mouseEvent)

              const container = this.scope.document.createElement('div')
              container.style.position = 'absolute'
              container.id = 'demo-monkey-editor'
              container.style.top = clickEvent.clientY + 'px'
              container.style.left = clickEvent.clientX + 'px'
              container.style['z-index'] = 2147483647

              const apply = (event, search, replacement, command = false) => {
                event.preventDefault()
                this.scope.document.dispatchEvent(
                  new CustomEvent('demomonkey-inline-editing', {
                    detail: JSON.stringify({
                      search,
                      replacement,
                      command
                    })
                  })
                )
                container.remove()
              }

              const [editor, cb] = (() => {
                // Special handler for flow map icons
                if (target.classList.contains('adsFlowNodeTypeIcon')) {
                  try {
                    const label =
                      target.parentElement.parentElement.querySelector('title').textContent
                    const e = this.scope.document.createElement('select')
                    ;[
                      'java',
                      '.net',
                      'php',
                      'node.js',
                      'python',
                      'c++',
                      'webserver',
                      'wmb',
                      'go'
                    ].forEach((label) => {
                      const o = this.scope.document.createElement('option')
                      o.text = label
                      e.add(o, null)
                    })
                    e.addEventListener('change', (event) =>
                      apply(event, label, event.target.value, 'appdynamics.replaceFlowmapIcon')
                    )
                    return [e, false]
                  } catch (error) {
                    return [error.getMessage(), () => {}]
                  }
                }
                const text = target.textContent.trim()
                const e = this.scope.document.createElement('input')
                e.value = text
                e.size = text.length + 2 > 60 ? 60 : text.length + 2
                e.addEventListener('keyup', function (event) {
                  if (event.keyCode === 13) {
                    apply(event, text, e.value)
                  }
                })
                return [e, (event) => apply(event, text, e.value)]
              })()

              container.addEventListener('keyup', function (event) {
                if (event.keyCode === 27) {
                  container.remove()
                }
              })

              this.scope.document.body.appendChild(container)
              container.appendChild(editor)
              editor.focus()
              clickEvent.preventDefault()

              if (cb !== false) {
                const saveButton = this.scope.document.createElement('button')
                saveButton.innerHTML = 'Save'

                const cancelButton = this.scope.document.createElement('button')
                cancelButton.innerHTML = 'Cancel'

                cancelButton.addEventListener('click', (e) => container.remove())
                saveButton.addEventListener('click', cb)

                container.appendChild(saveButton)
                container.appendChild(cancelButton)
              }
            }

            if (this.demoMonkeyPicker) {
              this.demoMonkeyPicker.close()
              delete this.demoMonkeyPicker
            } else {
              this.demoMonkeyPicker = new ElementPicker({
                action: {
                  trigger: 'contextmenu',
                  callback
                }
              })
            }
          })
      }
    } else {
      this.removeDebugElements()
    }
  }

  _getDemoMonkeyMode() {
    if (this.debugMode) {
      return 'debug'
    }
    if (this.liveMode) {
      return 'live'
    }
    return 'unknown'
  }

  updateMonkeyHead() {
    if (this.monkey.isRunning()) {
      this.scope.document.head.dataset.demoMonkeyVersion = this.manifest.version()
      this.scope.document.head.dataset.demoMonkeyMode = this._getDemoMonkeyMode()
      if (this.analyticsSnippet) {
        const snippet = document.createRange().createContextualFragment(this.analyticsSnippet)
        this.scope.document.head.prepend(snippet)
      }
      this.toggleDebugMode()
    } else {
      delete this.scope.document.head.dataset.demoMonkeyVersion
      delete this.scope.document.head.dataset.demoMonkeyMode
      this.removeDebugElements()
    }
  }

  updateDebugBox(lastTime, sum, undoLength) {
    const e1 = this.scope.document.getElementById('demo-monkey-last-runtime')
    if (e1) {
      this.runCount++
      this.avgRunTime += (lastTime - this.avgRunTime) / this.runCount
      this.maxRunTime = Math.max(lastTime, this.maxRunTime)
      if (this.runCount % 10 === 0) {
        e1.innerHTML =
          lastTime.toFixed(2) +
          ' (avg: ' +
          this.avgRunTime.toFixed(2) +
          ', max: ' +
          this.maxRunTime.toFixed(2) +
          ')'
      }
    }
    const e2 = this.scope.document.getElementById('demo-monkey-undo-length')
    if (e2) {
      e2.innerHTML = undoLength
    }
    const e3 = this.scope.document.getElementById('demo-monkey-elements-count')
    if (e3) {
      e3.innerHTML = Object.keys(sum)
        .reduce((acc, key) => {
          if (sum[key] > 0) {
            return acc.concat(`${key}: ${sum[key]}`)
          }
          return acc
        }, [])
        .join(', ')
    }
  }
}

export default ModeManager

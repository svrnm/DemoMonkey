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
  constructor(scope, monkey, manifest, debugMode = false, debugBox = false, liveMode = false, analyticsSnippet = '') {
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

    this.tooltipMouseEnter = event => {
      if (this.debugTooltip) {
        this.debugTooltip.innerHTML = (event.target.dataset.demoMonkeyDebugSource)
        const rect = event.target.getBoundingClientRect()
        this.debugTooltip.style.display = 'block'
        this.debugTooltip.style.left = (rect.x) + 'px'
        this.debugTooltip.style.top = (rect.y + rect.height) + 'px'
      }
    }
    this.tooltipMouseLeave = event => {
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
      event.elements.forEach(undoElement => {
        if (!undoElement.target) {
          return
        }
        const isHidden = undoElement.key === 'style.display' && undoElement.replacement === 'none' ? undoElement.original : false
        const source = undoElement.source
        switch (undoElement.target.nodeType) {
          case 1:
            if (undoElement.target && undoElement.target.dataset) {
              this.addDebugAttribute(undoElement.target, isHidden, source)
            }
            break
          case 3:
            if (undoElement.target && undoElement.target.parentElement && undoElement.target.parentElement.dataset) {
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
      element.style.setProperty('--data-demo-monkey-debug-display', isHidden === '' ? 'initial' : isHidden)
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
    ['#demo-monkey-debug-helper-svg', '#demo-monkey-debug-helper-style', '#demo-monkey-debug-box'].forEach(id => {
      const elem = this.scope.document.querySelector(id)
      if (elem) {
        elem.remove()
      }
    })
    this.clearDebugAttributes()
  }

  removeEditor() {
    const oldEditor = this.scope.document.getElementById('demo-monkey-editor')
    if (oldEditor) { oldEditor.remove() }
  }

  toggleDebugMode() {
    if (this.debugMode) {
      if (this.scope.document.getElementById('demo-monkey-debug-helper-style') === null) {
        this.scope.document.head.insertAdjacentHTML('beforeend', `<style id="demo-monkey-debug-helper-style">
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
        </style>`)
      }
      if (this.scope.document.getElementById('demo-monkey-debug-helper-svg') === null) {
        this.scope.document.body.insertAdjacentHTML('beforeend', `<svg id="demo-monkey-debug-helper-svg">
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
        </svg>`)
      }
      if (this.scope.document.getElementById('demo-monkey-debug-box') === null) {
        this.scope.document.body.insertAdjacentHTML('beforeend', `
        <div id="demo-monkey-debug-box">
          <div id="demo-monkey-logo" title="Click to minimize/maximize Demo Monkey Bar">
            <svg version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="16px" height="16px" viewBox="0 0 469.4 469.4" style="enable-background:new 0 0 469.4 469.4;" xml:space="preserve"><g><path d="M469.4,218.45c0-33.8-27.5-61.4-61.4-61.4c-3.3,0-6.5,0.3-9.6,0.8c-12.3-86.8-81-153.2-163.9-153.2 c-82.9,0-151.6,66.4-163.9,153.2c-3-0.5-6.1-0.7-9.2-0.7c-33.8,0-61.4,27.5-61.4,61.4c0,33,26.2,60.1,59,61.3 c-2.4,10.2-3.7,20.601-3.7,31.2c0,21.199,4.9,41.8,14.7,61.1c9.3,18.4,22.4,34.8,39.1,48.8c33.6,28.2,78.2,43.801,125.3,43.801 c47.1,0,91.8-15.601,125.5-43.9c16.7-14,29.899-30.4,39.1-48.8c9.7-19.301,14.7-39.9,14.7-61.1c0-10.601-1.2-21-3.7-31.201 C442.9,278.75,469.4,251.65,469.4,218.45z M392.7,310.951c0,4.399-0.3,8.699-0.8,13h-50.4h-214H77.1c-0.5-4.301-0.8-8.601-0.8-13 c0-12,1.9-23.601,5.4-34.601c1.2-3.601,2.5-7.101,4-10.601c8-18.5,20.8-35.1,37-48.699c1.8-1.5,3.7-3,5.6-4.5 c-2.8-4.6-5.4-9.4-7.7-14.4c-19.3-43.1-8.1-85.1,25-93.8c4.1-1.1,8.4-1.6,12.7-1.6c27.3,0,57.8,20.7,76.1,51.8 c18.3-31.2,48.8-51.8,76.1-51.8c4.3,0,8.601,0.5,12.7,1.6c33.1,8.7,44.3,50.7,25,93.8c-2.3,5-4.8,9.9-7.7,14.4c2,1.6,4,3.2,6,4.8 c16.101,13.6,28.7,30,36.7,48.399c1.5,3.4,2.8,6.9,3.9,10.5C390.8,287.35,392.7,298.951,392.7,310.951z M155.5,344.951h158.101 H387.5c-17.899,56.8-79.6,98.699-153,98.699c-73.4,0-135.1-41.899-153-98.699H155.5L155.5,344.951z M61.4,258.85 c-22.3,0-40.4-18.101-40.4-40.4c0-22.3,18.1-40.4,40.4-40.4c2.5,0,5,0.2,7.4,0.7c-0.1,2.3-0.1,4.6-0.1,7c0,6,0.3,11.8,0.8,17.6 c-4.3-2.9-9.4-5.2-15.3-6.6c-5.6-1.3-11.3,2.2-12.6,7.8c-1.3,5.6,2.2,11.3,7.8,12.6c17.3,4.1,23,24.1,23.1,24.5 c0.2,0.801,0.5,1.5,0.8,2.2c-0.5,0.8-0.9,1.601-1.4,2.399c-2.2,4.101-4.2,8.201-5.9,12.301C64.5,258.75,63,258.85,61.4,258.85z M408,258.85c-1.7,0-3.3-0.101-5-0.3c-1.8-4.1-3.7-8.2-5.899-12.301c-0.7-1.299-1.5-2.6-2.2-4c0.1-0.199,0.1-0.399,0.2-0.6 c0.1-0.199,5.699-20.5,23.1-24.5c5.6-1.3,9.1-7,7.8-12.6c-1.3-5.6-7-9.1-12.6-7.8c-5.2,1.2-9.8,3.2-13.8,5.6 c0.5-5.5,0.699-11,0.699-16.6c0-2.3-0.1-4.6-0.1-6.9c2.5-0.5,5.1-0.8,7.8-0.8c22.3,0,40.4,18.1,40.4,40.4 C448.4,240.75,430.3,258.85,408,258.85z"/><path d="M214.5,263.35c-4.7-5.5-13-6.101-18.5-1.399c-5.5,4.699-6.1,13-1.4,18.5l12.1,14.1c2.6,3,6.3,4.6,10,4.6c3,0,6-1,8.5-3.1c5.5-4.7,6.1-13,1.4-18.5L214.5,263.35z"/><path d="M273,261.85c-5.5-4.7-13.8-4.101-18.5,1.399l-12.1,14.101c-4.7,5.5-4.1,13.8,1.4,18.5c2.5,2.101,5.5,3.101,8.5,3.101c3.699,0,7.399-1.601,10-4.601l12.1-14.101C279.2,274.85,278.5,266.55,273,261.85z"/><circle cx="191.2" cy="199.25" r="21.3"/><circle cx="277.801" cy="199.25" r="21.3"/></g></svg>
          </div>
          <div class="demo-monkey-debug-box-inner">Runtime (ms): <span id="demo-monkey-last-runtime"></span></div>
          <div class="demo-monkey-debug-box-inner">Inspected: <span id="demo-monkey-elements-count"></span></div>
          <div class="demo-monkey-debug-box-inner">Undo Length: <span id="demo-monkey-undo-length"></span></div>
          <button class="demo-monkey-debug-box-inner" id="demo-monkey-editor-toggle">Toggle <i>Right-Click</i> Editor</button>
        </div>
        <div id="demo-monkey-debug-tooltip"></div>`)
        this.debugTooltip = this.scope.document.getElementById('demo-monkey-debug-tooltip')
        this.demoMonkeyPicker = false
        this.boxVisible = true
        const logo = this.scope.document.getElementById('demo-monkey-logo')
        const inner = Array.from(this.scope.document.getElementsByClassName('demo-monkey-debug-box-inner'))
        const toggleBox = () => {
          // const box = document.getElementById('demo-monkey-debug-box')
          if (this.boxVisible) {
            // box.style.right = (-box.clientWidth + logo.clientWidth) + 'px'
            inner.forEach(e => { e.style.display = 'none' })
          } else {
            // box.style.right = '0px'
            inner.forEach(e => { e.style.display = 'block' })
          }
          this.boxVisible = !this.boxVisible
        }
        if (!this.debugBox) {
          toggleBox()
        }
        logo.addEventListener('click', toggleBox)
        this.scope.document.getElementById('demo-monkey-editor-toggle').addEventListener('click', (e) => {
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
              this.scope.document.dispatchEvent(new CustomEvent('demomonkey-inline-editing', {
                detail: JSON.stringify({
                  search,
                  replacement,
                  command
                })
              }))
              container.remove()
            }

            const [editor, cb] = (() => {
              // Special handler for flow map icons
              if (target.classList.contains('adsFlowNodeTypeIcon')) {
                try {
                  const label = target.parentElement.parentElement.querySelector('title').textContent
                  const e = this.scope.document.createElement('select');
                  ['java', '.net', 'php', 'node.js', 'python', 'c++', 'webserver', 'wmb', 'go'].forEach(label => {
                    const o = this.scope.document.createElement('option')
                    o.text = label
                    e.add(o, null)
                  })
                  e.addEventListener('change', (event) => apply(event, label, event.target.value, 'appdynamics.replaceFlowmapIcon'))
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

  updateMonkeyHead() {
    if (this.monkey.isRunning()) {
      this.scope.document.head.dataset.demoMonkeyVersion = this.manifest.version()
      this.scope.document.head.dataset.demoMonkeyMode = this.debugMode ? 'debug' : (this.liveMode ? 'live' : 'unknown')
      // this.scope.document.head.insertAdjacentHTML('afterbegin', this.analyticsSnippet)
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
        e1.innerHTML = lastTime.toFixed(2) + ' (avg: ' + this.avgRunTime.toFixed(2) + ', max: ' + this.maxRunTime.toFixed(2) + ')'
      }
    }
    const e2 = this.scope.document.getElementById('demo-monkey-undo-length')
    if (e2) {
      e2.innerHTML = undoLength
    }
    const e3 = this.scope.document.getElementById('demo-monkey-elements-count')
    if (e3) {
      e3.innerHTML = Object.keys(sum).reduce((acc, key) => {
        return acc.concat(`${key}: ${sum[key]}`)
      }, []).join(', ')
    }
  }
}

export default ModeManager

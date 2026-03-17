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
import Command from '../commands/Command'
import LiveEditor from './LiveEditor'

class ModeManager {
  constructor(
    scope,
    monkey,
    manifest,
    liveEditorEnabled = false,
    liveMode = false,
    analyticsSnippet = '',
    configs = [],
    autoOpenLiveEditor = false
  ) {
    this.monkey = monkey
    this.scope = scope
    this.manifest = manifest
    this.liveEditorEnabled = liveEditorEnabled
    this.liveMode = liveMode
    this.analyticsSnippet = analyticsSnippet
    this.configs = configs
    this.autoOpenLiveEditor = autoOpenLiveEditor

    this.started = false

    this.liveEditor = null

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

  reload(monkey, liveEditorEnabled = false, liveMode = false, configs = []) {
    this.clearDebugAttributes()

    this.monkey = monkey
    this.liveEditorEnabled = liveEditorEnabled
    this.liveMode = liveMode
    this.configs = configs

    this.monkey.addObserver(this)

    if (this.liveEditor) {
      if (!this.liveEditorEnabled) {
        this.liveEditor.destroy()
        this.liveEditor = null
      } else {
        this.liveEditor.monkey = monkey
        this.liveEditor.updateConfigs(configs)
      }
    }

    if (this.started) {
      this.updateMonkeyHead()
    }
  }

  update(event) {
    if (event.type === 'applied') {
      if (this.liveEditor) {
        this.liveEditor.updateStats(event.stats.runtime, event.stats.sum, event.stats.undoLength)
      }
    }
    if (event.type === 'addUndo' && this.liveEditorEnabled) {
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
    if (this.liveEditor) {
      this.liveEditor.destroy()
      this.liveEditor = null
    }
    this.clearDebugAttributes()
  }

  toggleLiveEditor() {
    if (this.liveEditorEnabled) {
      if (!this.liveEditor) {
        this.liveEditor = new LiveEditor(this.scope, this.monkey, this.manifest, this.configs)
        if (this.autoOpenLiveEditor) {
          this.liveEditor.open()
        }
      }
      try {
        if (this.scope.document.getElementById('demo-monkey-debug-helper-style') === null) {
          this.scope.document.head.insertAdjacentHTML(
            'beforeend',
            `<style id="demo-monkey-debug-helper-style">
          [data-demo-monkey-debug] { background-color: rgba(255, 255, 0, 0.5); }
          svg [data-demo-monkey-debug] { filter: url(#dm-debug-filter-visible) }
          [data-demo-monkey-debug-display] { display: var(--data-demo-monkey-debug-display) !important; background-color: rgba(255, 0, 0, 0.5); }
          [data-demo-monkey-debug-display] * { display: var(--data-demo-monkey-debug-display) !important; background-color: rgba(255, 0, 0, 0.5); }
          svg [data-demo-monkey-debug-display] { display: var(--data-demo-monkey-debug-display) !important; filter: url(#dm-debug-filter-hidden) }
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
        if (this.scope.document.getElementById('demo-monkey-debug-tooltip') === null) {
          this.scope.document.body.insertAdjacentHTML(
            'beforeend',
            '<div id="demo-monkey-debug-tooltip"></div>'
          )
        }
        this.debugTooltip = this.scope.document.getElementById('demo-monkey-debug-tooltip')
      } catch (e) {
        // Debug highlight helpers may fail on pages with strict CSP — the Live Editor still works
      }
    } else {
      this.removeDebugElements()
    }
  }

  _getDemoMonkeyMode() {
    if (this.liveEditorEnabled) {
      return 'live-editor'
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
    } else {
      delete this.scope.document.head.dataset.demoMonkeyVersion
      delete this.scope.document.head.dataset.demoMonkeyMode
      if (!this.liveEditorEnabled) {
        this.removeDebugElements()
      }
    }
    this.toggleLiveEditor()
  }

  updateConfigs(configs) {
    this.configs = configs
    if (this.liveEditor) {
      this.liveEditor.updateConfigs(configs)
    }
  }
}

export default ModeManager

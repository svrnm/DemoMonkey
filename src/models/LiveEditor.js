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
import LIVE_EDITOR_STYLES from './LiveEditorStyles'
import Configuration from './Configuration'
import commands from './LiveEditorCommands'
import registry from '../commands/CommandRegistry'

function _buildDSLHints() {
  const hints = []

  // @ options
  const options = [
    { name: '@include[]', desc: 'URL include rule', signature: ' = /regex/' },
    { name: '@exclude[]', desc: 'URL exclude rule', signature: ' = /regex/' },
    { name: '@namespace[]', desc: 'Import command namespace', signature: ' = namespace' },
    { name: '@textAttributes[]', desc: 'Text attribute to replace in', signature: ' = attribute' },
    { name: '@author[]', desc: 'Config author', signature: ' = name' },
    { name: '@blacklist[]', desc: 'Ignore pattern', signature: ' = pattern' },
    { name: '@whitelist[]', desc: 'Only process pattern', signature: ' = pattern' }
  ]
  options.forEach((o) => hints.push({ value: o.name, label: o.name, desc: o.desc }))

  // ! commands from registry
  registry.forEach((entry) => {
    if (entry.registry) {
      entry.registry.forEach((sub) => {
        const name = `!${entry.name}.${sub.name}`
        hints.push({ value: name, label: name, desc: sub.signature || '' })
        if (sub.aliases) {
          sub.aliases.forEach((a) => {
            const aliasName = `!${entry.name}.${a}`
            hints.push({ value: aliasName, label: aliasName, desc: 'alias for ' + sub.name })
          })
        }
      })
    } else {
      const name = `!${entry.name}`
      hints.push({ value: name, label: name, desc: entry.signature || '' })
      if (entry.aliases) {
        entry.aliases.forEach((a) => {
          const aliasName = `!${a}`
          hints.push({ value: aliasName, label: aliasName, desc: 'alias for ' + entry.name })
        })
      }
    }
  })

  // $ variable prefix
  hints.push({ value: '$', label: '$variableName', desc: 'Define a variable' })
  // + import
  hints.push({ value: '+', label: '+ConfigName', desc: 'Import another config' })

  return hints
}

const DSL_HINTS = _buildDSLHints()

const MONKEY_ICON_DATA =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAMAAABg3Am1AAAAilBMVEVMaXH39/ezs7MyMjIwMDAyMjJcXFxGRkYyMjLm5uaRkZHMzMyoqKgxMTE/Pz8yMjIyMjIwMDDv7+8wMDAyMjJpaWlMS0vc3NwxMTHBwcE0NDR4eHjU1NQzMzOCgoJTU1OdnZ1GRkUyMjL////+/v40NDQ2Njb8/PwnJycrKysuLi4iIiI6OjoSEhJIPXqzAAAAInRSTlMA/v4sWe/9A/z9/f792/2jtHD+DMn+/v0c/j/+/oj+/v36tq3OMgAAAAlwSFlzAAAuIwAALiMBeKU/dgAAA7tJREFUeJyNVmuXqjoMLQi0CCIi+H6dpklLxf//9+5K8cygzj1r8gHBlZ2dx05BiJ9MisNKSPF7kyKhw68RUkoha1oms19BJF8OLeKybhksfgj45r5LaoUK0xRXO/mM8D8AKcU6qVNCpbTWDGqT9Qdi4i9EskB2R/ZHrZBwkUxc5Jv/rkYavUdDpRRhvfty4mwm6NmCQi4vphQtvts1SY/9cRJ9QoPfiGk9uwV+hH+SYLv+rFjUFPyR6IuGnveKzu8UUiQhPmLv7j0GN/SO7zX/+ykU2TIAfX89Hq/Oo9boquP8cnUamaJ+n0UgQD/EFsDGlUfsjw0ARDetUaNWr8KSYklKox4KsNZaKEi7ixnvY85K0Zvc19widCVYA2AslPcsAgsA1sLFkVZYv81Acb3XCAwYawxEf0qwAW0hHzwqbF8zSlAhuRsHNWDAQpyDYWPE0SFiunsFcAl9wTG35TMVA3EcwKUj1Om0ailWpFBXOQNuZQGWw0NeznMuqPD4I8BvGrDQzE+cPqcSx7c9U51IfwC4hiegm8//ArJrHACoQw3fwpbiwOMZcvbMHmUYgIXt47FlwL5nxa6/djPscYoYirYwd9vAYCxUVfi5OVLYznjBRzss2zpFJDfnopuTMSY/FTlAnocmZzxrxLRdjSo/IxEFdW7GwUF+xPtddyFDC8W4R0RENSMSUsqzJDUyBVjYbrqyKOJuc2LGaCTondOKlkFF2m8G/pNcBzzb+R5YUVDMmaDZeNTor+Wt8qhmIkGNsc2zHtFX2xCyGbtkoYk4wT0D+higCKI9D+4CFrp+LBrG/gSz4xN0DskdgxMtxZLcHmDL20DPfhqYmoXYIboMWOjDF4DLyriHH2YhHzS5C0Qjw3ngTGzWj6yfZsBePfX7sYYzd5X2pmHAs4RPy3ry17isPFHCovA6q3rEfwFQ9/e7D4oSZ1Kq96SeKb2VzClFG4+KiJSihLVXEyIiYX/lLXth4QbbUd7ER+J4AK7PqVL1GVGfeLA8sb8NMhHr6eaIlqt2sXwef1KsZzMpW26dhWLcBhMuUBZgOKPn+kwWQopDqokpumMzjsNAc+zGdcCEnV5fbrzXfRYZyAea77d5vt1f+FiAAieH9+v5uiLXMSJ73FVV6fsjywFOlWdR/2RSJGnPPlHcVV5XXRyB2Vf+/Vh9OTHbviobA9DkeQQA24vXi398Q0ghk4XbzPe5NSbaxsfBLVafL+opQgp5WC78sLleN9iny8P641Pgh0c5S5LVKklmvPLv4f8Dj8ywplF/mFkAAAAASUVORK5CYII='

class LiveEditor {
  constructor(scope, monkey, manifest, configs, options = {}) {
    this.scope = scope
    this.monkey = monkey
    this.manifest = manifest
    this.configs = configs || []
    this.options = options
    this.picker = null
    this.panelOpen = false

    this.stats = {
      lastRuntime: 0,
      avgRunTime: 0,
      maxRunTime: 0,
      runCount: 0,
      undoLength: 0,
      inspected: ''
    }

    this._selectedConfigId = null
    this._history = []
    this._historyIndex = -1
    this._historyStash = ''

    this._createUI()
    this._initSelectedConfig()
  }

  _createUI() {
    this.host = this.scope.document.createElement('div')
    this.host.id = 'dm-live-editor-host'
    this.shadow = this.host.attachShadow({ mode: 'open' })

    const style = this.scope.document.createElement('style')
    style.textContent = LIVE_EDITOR_STYLES
    this.shadow.appendChild(style)

    const wrapper = this.scope.document.createElement('div')
    wrapper.className = 'dm-le-wrapper'

    // Panel
    this.panel = this.scope.document.createElement('div')
    this.panel.className = 'dm-le-panel'
    this.panel.addEventListener('click', (e) => {
      if (e.target !== this.configSelect && e.target.tagName !== 'BUTTON') {
        this.input.focus()
      }
    })
    this.panel.addEventListener('keydown', (e) => e.stopPropagation())
    this.panel.addEventListener('keyup', (e) => e.stopPropagation())
    this.panel.addEventListener('keypress', (e) => e.stopPropagation())

    // Header
    const header = this.scope.document.createElement('div')
    header.className = 'dm-le-header'

    this.configSelect = this.scope.document.createElement('select')
    this.configSelect.className = 'dm-le-config-select'
    this.configSelect.addEventListener('change', () => {
      if (this.configSelect.value === '__new__') {
        this._createNewConfig()
        return
      }
      this._selectedConfigId = this.configSelect.value || null
    })
    header.appendChild(this.configSelect)

    const pickBtn = this.scope.document.createElement('button')
    pickBtn.className = 'dm-le-header-btn'
    pickBtn.title = 'Pick element'
    pickBtn.innerHTML =
      '<svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">' +
      '<path d="M21 3L3 10.53v.98l6.84 2.65L12.48 21h.98L21 3z"/>' +
      '</svg>'
    pickBtn.addEventListener('click', (e) => {
      e.stopPropagation()
      // Delay so the click event finishes propagating before the picker starts listening
      setTimeout(() => this.handleInput('/pick'), 0)
    })
    header.appendChild(pickBtn)

    const closeBtn = this.scope.document.createElement('button')
    closeBtn.className = 'dm-le-close-btn'
    closeBtn.textContent = '\u00d7'
    closeBtn.addEventListener('click', () => this.close())
    header.appendChild(closeBtn)

    this.panel.appendChild(header)

    // Output
    this.output = this.scope.document.createElement('div')
    this.output.className = 'dm-le-output'
    this.panel.appendChild(this.output)

    // Hints dropdown
    this.hints = this.scope.document.createElement('div')
    this.hints.className = 'dm-le-hints'
    this.panel.appendChild(this.hints)

    // Input row
    const inputRow = this.scope.document.createElement('div')
    inputRow.className = 'dm-le-input-row'

    this.input = this.scope.document.createElement('input')
    this.input.className = 'dm-le-input'
    this.input.type = 'text'
    this.input.placeholder = 'Type a rule or /command...'
    this.input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        const selected = this.hints.querySelector('.dm-le-hint-active')
        if (selected) {
          this.input.value = selected.dataset.value + ' '
          this._hideHints()
          return
        }
        if (this.input.value.trim()) {
          this._history.push(this.input.value)
          this._historyIndex = -1
          this._historyStash = ''
          this.handleInput(this.input.value)
          this.input.value = ''
          this._hideHints()
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        if (this._hasVisibleHints()) {
          this._moveHint(-1)
        } else {
          this._historyNav(-1)
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        if (this._hasVisibleHints()) {
          this._moveHint(1)
        } else {
          this._historyNav(1)
        }
      } else if (e.key === 'Escape') {
        if (this._hasVisibleHints()) {
          this._hideHints()
        }
      } else if (e.key === 'Tab' && this._hasVisibleHints()) {
        e.preventDefault()
        const selected =
          this.hints.querySelector('.dm-le-hint-active') || this.hints.querySelector('.dm-le-hint')
        if (selected) {
          this.input.value = selected.dataset.value + ' '
          this._hideHints()
        }
      }
    })
    this.input.addEventListener('keyup', (e) => {
      if (!['ArrowUp', 'ArrowDown', 'Enter', 'Escape', 'Tab'].includes(e.key)) {
        this._updateHints()
      }
    })
    inputRow.appendChild(this.input)

    this.panel.appendChild(inputRow)

    wrapper.appendChild(this.panel)

    // FAB
    this.fab = this.scope.document.createElement('div')
    this.fab.className = 'dm-le-fab'
    const fabIcon = this.scope.document.createElement('img')
    fabIcon.src = MONKEY_ICON_DATA
    fabIcon.alt = 'DemoMonkey'
    fabIcon.style.width = '28px'
    fabIcon.style.height = '28px'
    this.fab.appendChild(fabIcon)
    this.fab.addEventListener('click', () => this.toggle())

    wrapper.appendChild(this.fab)

    this.shadow.appendChild(wrapper)
    this.scope.document.body.appendChild(this.host)

    this._populateConfigSelect()
    this.log('DemoMonkey Live Editor v' + this.manifest.version(), 'info')
    this.log('Type /help for available commands.', 'info')
  }

  _historyNav(direction) {
    if (this._history.length === 0) return
    if (this._historyIndex === -1 && direction === -1) {
      this._historyStash = this.input.value
      this._historyIndex = this._history.length - 1
    } else if (direction === -1 && this._historyIndex > 0) {
      this._historyIndex--
    } else if (direction === 1 && this._historyIndex < this._history.length - 1) {
      this._historyIndex++
    } else if (direction === 1) {
      this._historyIndex = -1
      this.input.value = this._historyStash
      return
    }
    this.input.value = this._history[this._historyIndex]
  }

  _hasVisibleHints() {
    return this.hints && this.hints.children.length > 0
  }

  _hideHints() {
    if (this.hints) {
      this.hints.innerHTML = ''
    }
  }

  _updateHints() {
    const val = this.input.value
    if (!val) {
      this._hideHints()
      return
    }

    let matches = []
    const parts = val.split(/\s/)
    const token = parts[0].toLowerCase()
    const argText = parts.length > 1 ? parts.slice(1).join(' ').toLowerCase() : null

    if (val.startsWith('/')) {
      // Check if user is typing arguments for a command that accepts config names
      if (argText !== null && commands[token] && commands[token].acceptsConfigArg) {
        const configs = this._getAvailableConfigs()
        matches = configs
          .filter((c) => !argText || c.name.toLowerCase().startsWith(argText))
          .map((c) => ({
            value: token + ' ' + c.name,
            label: c.name,
            desc: c.enabled ? 'enabled' : 'disabled'
          }))
      } else {
        matches = Object.keys(commands)
          .filter((cmd) => cmd.startsWith(token))
          .map((cmd) => ({ value: cmd, label: cmd, desc: commands[cmd].description }))
      }
    } else if (
      val.startsWith('!') ||
      val.startsWith('@') ||
      val.startsWith('$') ||
      val.startsWith('+')
    ) {
      matches = DSL_HINTS.filter((h) => h.value.toLowerCase().startsWith(token))
    }

    matches = matches.slice(0, 8)

    if (matches.length === 0 || (matches.length === 1 && matches[0].value === val.trim())) {
      this._hideHints()
      return
    }

    this.hints.innerHTML = ''
    matches.forEach((m) => {
      const hint = this.scope.document.createElement('div')
      hint.className = 'dm-le-hint'
      hint.dataset.value = m.value
      const cmdSpan = this.scope.document.createElement('span')
      cmdSpan.className = 'dm-le-hint-cmd'
      cmdSpan.textContent = m.label
      const descSpan = this.scope.document.createElement('span')
      descSpan.className = 'dm-le-hint-desc'
      descSpan.textContent = m.desc
      hint.appendChild(cmdSpan)
      hint.appendChild(descSpan)
      hint.addEventListener('click', () => {
        this.input.value = m.value
        this._hideHints()
        this.input.focus()
      })
      this.hints.appendChild(hint)
    })
  }

  _moveHint(direction) {
    const items = Array.from(this.hints.querySelectorAll('.dm-le-hint'))
    if (items.length === 0) return
    const active = this.hints.querySelector('.dm-le-hint-active')
    let idx = active ? items.indexOf(active) : -1
    if (active) active.classList.remove('dm-le-hint-active')
    idx += direction
    if (idx < 0) idx = items.length - 1
    if (idx >= items.length) idx = 0
    items[idx].classList.add('dm-le-hint-active')
  }

  _inferConfigName() {
    try {
      const hostname = this.scope.location.hostname
      const base =
        hostname
          .replace(/^www\./, '')
          .split('.')
          .slice(0, -1)
          .join('.') || hostname
      const existing = this.configs
        .map((c) => c.name)
        .filter(
          (n) =>
            n === base ||
            n.match(new RegExp('^' + base.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ' \\(\\d+\\)$'))
        )
      if (existing.length === 0) return base
      return base + ' (' + (existing.length + 1) + ')'
    } catch (e) {
      return 'New Config'
    }
  }

  _buildIncludePattern() {
    try {
      const u = new URL(this.scope.location.href)
      const protocol = ['https:', 'http:'].includes(u.protocol) ? 'https?:' : u.protocol
      const host = u.hostname.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return `@include[] = /^${protocol}\\/\\/${host}\\/.*$/`
    } catch (e) {
      return ''
    }
  }

  _createNewConfig(name) {
    const configName = name || this._inferConfigName()
    const configId = crypto.randomUUID()
    const include = this._buildIncludePattern()
    const content = include ? include + '\n' : ''

    this.scope.document.dispatchEvent(
      new CustomEvent('demomonkey-add-configuration', {
        detail: JSON.stringify({
          name: configName,
          id: configId,
          content,
          token: this.options.eventToken
        })
      })
    )

    this._selectedConfigId = configId
    this.log(`Created config: "${configName}"`, 'success')
  }

  _initSelectedConfig() {
    const available = this._getAvailableConfigs()
    const enabled = available.filter((c) => c.enabled)
    if (enabled.length > 0) {
      this._selectedConfigId = enabled[0].id
    } else if (available.length > 0) {
      this._selectedConfigId = available[0].id
    }
    if (this._selectedConfigId && this.configSelect) {
      this.configSelect.value = this._selectedConfigId
    }
  }

  _getAvailableConfigs() {
    if (this._availableConfigsCache) {
      return this._availableConfigsCache
    }
    const url = this.scope.location.href
    this._availableConfigsCache = this.configs.filter((c) => {
      const config = new Configuration(c.content, null, false, c.values)
      return config.isAvailableForUrl(url)
    })
    return this._availableConfigsCache
  }

  _populateConfigSelect() {
    if (!this.configSelect) return

    const currentValue = this._selectedConfigId
    this.configSelect.innerHTML = ''

    const available = this._getAvailableConfigs()

    const placeholder = this.scope.document.createElement('option')
    placeholder.value = ''
    placeholder.textContent = '-- Select Config --'
    this.configSelect.appendChild(placeholder)

    available.forEach((c) => {
      const opt = this.scope.document.createElement('option')
      opt.value = c.id
      opt.textContent = c.name + (c.enabled ? ' (enabled)' : ' (disabled)')
      this.configSelect.appendChild(opt)
    })

    const newOpt = this.scope.document.createElement('option')
    newOpt.value = '__new__'
    newOpt.textContent = 'New Config...'
    this.configSelect.appendChild(newOpt)

    if (currentValue) {
      this.configSelect.value = currentValue
    }
  }

  open() {
    this.panel.classList.add('dm-le-open')
    this.panelOpen = true
    this.input.focus()
  }

  close() {
    this.panel.classList.remove('dm-le-open')
    this.panelOpen = false
  }

  toggle() {
    if (this.panelOpen) {
      this.close()
    } else {
      this.open()
    }
  }

  destroy() {
    if (this._populateTimer) {
      clearTimeout(this._populateTimer)
      this._populateTimer = null
    }
    if (this.picker) {
      this.picker.close()
      this.picker = null
    }
    if (this.host && this.host.parentNode) {
      this.host.remove()
    }
  }

  handleInput(text) {
    if (!text.trim()) return

    if (text.startsWith('/')) {
      this.log('> ' + text, 'command')
      const parts = text.split(/\s+/)
      const cmd = parts[0].toLowerCase()
      const args = text.slice(cmd.length)

      if (cmd === '/new' || (this.configSelect && this.configSelect.value === '__new__')) {
        if (cmd !== '/new') {
          // User selected "New Config..." from dropdown, treat input as rule after creating
        }
      }

      if (commands[cmd]) {
        commands[cmd].handler(this, args)
      } else {
        this.log(`Unknown command: ${cmd}. Type /help for available commands.`, 'error')
      }
    } else {
      this._applyDSLRule(text)
    }
  }

  _applyDSLRule(text) {
    const configId = this.getSelectedConfigId()
    const eqIndex = text.indexOf('=')

    // Lines like !hide(selector) or @include[] = ... are valid without the search = replacement format
    if (eqIndex === -1) {
      if (
        text.startsWith('!') ||
        text.startsWith('@') ||
        text.startsWith('$') ||
        text.startsWith('+')
      ) {
        this.log('> ' + text, 'command')
        this.scope.document.dispatchEvent(
          new CustomEvent('demomonkey-inline-editing', {
            detail: JSON.stringify({
              search: text,
              replacement: '',
              command: false,
              configId,
              raw: true,
              token: this.options.eventToken
            })
          })
        )
      } else {
        this.log('Invalid rule. Use format: search = replacement', 'error')
      }
    } else {
      const search = text.slice(0, eqIndex).trim()
      const replacement = text.slice(eqIndex + 1).trim()

      if (!search) {
        this.log('Search pattern cannot be empty.', 'error')
        return
      }

      this.log('> ' + text, 'command')

      this.scope.document.dispatchEvent(
        new CustomEvent('demomonkey-inline-editing', {
          detail: JSON.stringify({
            search,
            replacement,
            command: false,
            configId,
            token: this.options.eventToken
          })
        })
      )

      this.log(`Applied: ${search} \u2192 ${replacement}`, 'success')
    }
  }

  log(message, type = 'info') {
    if (!this.output) return
    const line = this.scope.document.createElement('div')
    line.className = 'dm-le-output-line dm-le-' + type
    line.textContent = message
    this.output.appendChild(line)
    this.output.scrollTop = this.output.scrollHeight
  }

  clearOutput() {
    if (this.output) {
      this.output.innerHTML = ''
    }
  }

  setInput(text) {
    if (this.input) {
      this.input.value = text
      this.input.focus()
    }
  }

  updateConfigs(configs) {
    this.configs = configs || []
    this._availableConfigsCache = null
    if (this._populateTimer) {
      clearTimeout(this._populateTimer)
    }
    this._populateTimer = setTimeout(() => {
      this._populateConfigSelect()
    }, 200)
  }

  updateStats(runtime, sum, undoLength) {
    this.stats.runCount++
    this.stats.avgRunTime += (runtime - this.stats.avgRunTime) / this.stats.runCount
    this.stats.maxRunTime = Math.max(runtime, this.stats.maxRunTime)
    this.stats.lastRuntime = runtime
    this.stats.undoLength = undoLength
    this.stats.inspected = Object.keys(sum)
      .reduce((acc, key) => {
        if (sum[key] > 0) {
          return acc.concat(`${key}: ${sum[key]}`)
        }
        return acc
      }, [])
      .join(', ')
  }

  getStats() {
    return { ...this.stats }
  }

  getConfigs() {
    return this._getAvailableConfigs()
  }

  getSelectedConfigId() {
    return this._selectedConfigId
  }

  selectConfig(id) {
    this._selectedConfigId = id
    if (this.configSelect) {
      this.configSelect.value = id
    }
  }

  toggleConfig(id, enabled) {
    this.scope.document.dispatchEvent(
      new CustomEvent('demomonkey-toggle-configuration', {
        detail: JSON.stringify({ id, enabled, token: this.options.eventToken })
      })
    )
  }
}

export default LiveEditor

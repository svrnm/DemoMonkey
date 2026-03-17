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

function _truncate(str, max) {
  return str.length > max ? str.slice(0, max - 1) + '\u2026' : str
}

function _extractImageSrc(img) {
  const src = img.getAttribute('src') || ''
  if (!src) return null
  // For data URIs or very long URLs, use a unique short identifier
  if (src.startsWith('data:') || src.length > 120) {
    // Try to find a shorter identifier: filename from path, or alt text
    const alt = img.getAttribute('alt')
    if (alt && alt.length > 0 && alt.length < 80) return alt
    try {
      const url = new URL(src, window.location.href)
      const filename = url.pathname.split('/').pop()
      if (filename && filename.length > 0 && filename.length < 80) return filename
    } catch (e) {
      // ignore
    }
    // Last resort: use a CSS selector approach
    return null
  }
  return src
}

function _buildPickerRule(target) {
  const tag = target.tagName.toLowerCase()

  // Images
  if (tag === 'img' || tag === 'image') {
    const src = _extractImageSrc(target)
    if (src) {
      return '!replaceImage(' + src + ') = '
    }
    // Fallback: use CSS selector
    return '!replaceImage(' + _buildSelector(target) + ') = '
  }

  // SVG elements with an image child
  if (tag === 'svg' || target.closest('svg')) {
    const img =
      tag === 'svg' ? target.querySelector('image') : target.closest('svg').querySelector('image')
    if (img) {
      const src = _extractImageSrc(img)
      if (src) return '!replaceImage(' + src + ') = '
    }
  }

  // Background images
  const bgImage = window.getComputedStyle(target).backgroundImage
  if (bgImage && bgImage !== 'none') {
    const match = bgImage.match(/url\(["']?(.+?)["']?\)/)
    if (match && match[1] && !match[1].startsWith('data:') && match[1].length < 120) {
      return '!replaceImage(' + match[1] + ') = '
    }
  }

  // Text content
  const text = target.textContent.trim()
  if (text) {
    if (text.length > 80) {
      // Long text: use first distinctive portion
      const short = text.slice(0, 60).trim()
      return short + ' = '
    }
    return text + ' = '
  }

  // Element with no text — try style or hide
  return '!hide(' + _buildSelector(target) + ')'
}

function _buildSelector(el) {
  if (el.id) return '#' + el.id
  const tag = el.tagName.toLowerCase()
  const classes = Array.from(el.classList)
    .filter((c) => !c.startsWith('dm-'))
    .slice(0, 2)
  if (classes.length > 0) return tag + '.' + classes.join('.')
  return tag
}

function _resolveConfig(editor, args) {
  const name = args ? args.trim() : ''
  if (name) {
    const configs = editor.getConfigs()
    const match = configs.find((c) => c.name.toLowerCase() === name.toLowerCase())
    if (!match) {
      editor.log(`Config not found: "${name}"`, 'error')
      return null
    }
    return match
  }
  const configId = editor.getSelectedConfigId()
  if (!configId) {
    editor.log('No configuration selected.', 'error')
    return null
  }
  return editor.getConfigs().find((c) => c.id === configId) || null
}

const commands = {
  '/exit': {
    description: 'Close the Live Editor panel',
    handler(editor) {
      editor.close()
    }
  },

  '/help': {
    description: 'List available commands',
    handler(editor) {
      editor.log('Available commands:', 'info')
      Object.keys(commands).forEach((cmd) => {
        editor.log(`  ${cmd} — ${commands[cmd].description}`, 'info')
      })
      editor.log('', 'info')
      editor.log('Or type a DSL rule directly, e.g.: Old Text = New Text', 'info')
    }
  },

  '/clear': {
    description: 'Clear the output log',
    handler(editor) {
      editor.clearOutput()
    }
  },

  '/pick': {
    description: 'Activate element picker — click an element to pre-fill a replacement rule',
    handler(editor) {
      if (editor.picker) {
        editor.picker.close()
        editor.picker = null
        editor.log('Element picker deactivated.', 'info')
        return
      }

      editor.log('Element picker activated. Click on any element.', 'info')

      editor.picker = new ElementPicker({
        ignoreElements: [editor.scope.document.body, editor.host],
        action: {
          trigger: 'click',
          callback(target, clickEvent) {
            clickEvent.preventDefault()
            clickEvent.stopPropagation()

            const rule = _buildPickerRule(target)
            if (rule) {
              editor.setInput(rule)
              editor.log('Picked: ' + _truncate(rule, 80), 'info')
            } else {
              editor.log('Could not determine a rule for this element.', 'error')
            }

            if (editor.picker) {
              editor.picker.close()
              editor.picker = null
            }
          }
        }
      })
    }
  },

  '/new': {
    description: 'Create a new config for the current URL (optionally provide a name)',
    handler(editor, args) {
      const name = args.trim() || null
      editor._createNewConfig(name)
    }
  },

  '/switch': {
    description: 'Switch active config (list available if no argument)',
    acceptsConfigArg: true,
    handler(editor, args) {
      const name = args.trim()
      if (!name) {
        editor.log('Available configs:', 'info')
        const configs = editor.getConfigs()
        if (configs.length === 0) {
          editor.log('  (none matching current URL)', 'info')
        } else {
          configs.forEach((c) => {
            const marker = c.id === editor.getSelectedConfigId() ? ' *' : ''
            editor.log(`  ${c.name}${marker}`, 'info')
          })
        }
        return
      }
      const configs = editor.getConfigs()
      const match = configs.find((c) => c.name.toLowerCase() === name.toLowerCase())
      if (match) {
        editor.selectConfig(match.id)
        editor.log(`Switched to: ${match.name}`, 'success')
      } else {
        editor.log(`Config not found: "${name}"`, 'error')
      }
    }
  },

  '/enable': {
    description: 'Enable a config (by name, or the selected one)',
    acceptsConfigArg: true,
    handler(editor, args) {
      const config = _resolveConfig(editor, args)
      if (!config) return
      if (config.enabled) {
        editor.log(`"${config.name}" is already enabled.`, 'info')
        return
      }
      editor.toggleConfig(config.id, true)
      editor.log(`Enabled: ${config.name}`, 'success')
    }
  },

  '/disable': {
    description: 'Disable a config (by name, or the selected one)',
    acceptsConfigArg: true,
    handler(editor, args) {
      const config = _resolveConfig(editor, args)
      if (!config) return
      if (!config.enabled) {
        editor.log(`"${config.name}" is already disabled.`, 'info')
        return
      }
      editor.toggleConfig(config.id, false)
      editor.log(`Disabled: ${config.name}`, 'success')
    }
  },

  '/stats': {
    description: 'Show runtime/debug statistics',
    handler(editor) {
      const stats = editor.getStats()
      editor.log('--- Stats ---', 'info')
      editor.log(
        `  Runtime (ms): ${stats.lastRuntime.toFixed(2)} (avg: ${stats.avgRunTime.toFixed(2)}, max: ${stats.maxRunTime.toFixed(2)})`,
        'info'
      )
      editor.log(`  Run count: ${stats.runCount}`, 'info')
      editor.log(`  Undo length: ${stats.undoLength}`, 'info')
      editor.log(`  Inspected: ${stats.inspected}`, 'info')
    }
  }
}

export default commands

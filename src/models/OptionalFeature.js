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
import React from 'react'

const optionalFeatures = [
  {
    id: 'autoSave',
    group: 'Editor',
    defaultValue: true,
    label: 'Save configuration on line break',
    description: ''
  },
  {
    id: 'saveOnClose',
    group: 'Editor',
    defaultValue: true,
    label: 'Save configuration when it is closed',
    description: ''
  },
  {
    id: 'editorAutocomplete',
    group: 'Editor',
    defaultValue: true,
    label: 'Autocomplete',
    description:
      'The editor for configurations will display an auto completion for commands, options & imports.'
  },
  {
    id: 'keyboardHandlerVim',
    group: 'Editor',
    defaultValue: false,
    label: 'VIM Keyboard Handler',
    description: 'Use the vim keyboard handler for the editor.'
  },
  {
    id: 'autoReplace',
    group: 'Replacements',
    defaultValue: true,
    label: 'Automatically apply replacements',
    description: (
      <span>
        when configuration is saved. <i>(This will also disable undo)</i>
      </span>
    )
  },
  {
    id: 'undo',
    group: 'Replacements',
    defaultValue: true,
    label: 'Undo replacements',
    description: 'when configuration is disabled'
  },
  {
    id: 'webRequestHook',
    group: 'Replacements',
    defaultValue: false,
    label: 'Hook into Web Requests',
    description: (
      <span>
        Enable the commands !blockUrl and !redirectUrl.{' '}
        <b>This will allow DemoMonkey to block or redirect requests in-flight</b>. To learn what
        this means, read about{' '}
        <a
          target="blank"
          rel="noopener noreferer"
          href="https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/"
        >
          chrome.declarativeNetRequest
        </a>
      </span>
    )
  },
  {
    id: 'hookIntoAjax',
    group: 'Replacements',
    defaultValue: false,
    label: 'Hook into Ajax',
    description: (
      <span>
        Allow DemoMonkey to hook into Ajax calls and modify their response. Does not support{' '}
        <i>window.fetch</i>.
      </span>
    )
  },
  {
    id: 'withEvalCommand',
    group: 'Replacements',
    defaultValue: false,
    label: 'Allow !eval',
    description:
      'Use the command !eval which allows you to write arbitrary javascript code. Use with caution!'
  },
  {
    id: 'syncDarkMode',
    group: 'Appearance',
    defaultValue: true,
    label: 'Sync Dark/Light mode with OS',
    description: 'Automatically switch between dark and light mode.'
  },
  {
    id: 'preferDarkMode',
    group: 'Appearance',
    defaultValue: false,
    label: 'Use dark mode',
    description: (
      <span>
        Set <i>dark mode</i> as your preferred theme.
      </span>
    )
  },
  {
    id: 'onlyShowAvailableConfigurations',
    group: 'Appearance',
    defaultValue: true,
    label: 'Only show available configurations',
    description:
      'Set the default value for the popup toggle, which hides configurations that are not available for the current url.'
  },
  {
    id: 'debugBox',
    group: 'Appearance',
    defaultValue: false,
    label: 'Auto-open Live Editor',
    description: (
      <span>
        Automatically open the Live Editor panel when it is enabled, instead of showing only the
        floating button.
      </span>
    )
  },
  {
    id: 'keyboardShortcuts',
    group: 'General',
    defaultValue: true,
    label: 'Keyboard Shortcuts',
    description:
      'Single-key shortcuts for navigation: n (new), u (upload), , (settings), ? (help), b (backup), l (logs), / (search).'
  },
  {
    id: 'writeLogs',
    group: 'General',
    defaultValue: true,
    label: 'Write Logs',
    description: (
      <span>
        Have DemoMonkey logs accessible via the <b>Logs</b> navigation item.
      </span>
    )
  },
  {
    id: 'noWarningForMissingPermissions',
    group: 'General',
    defaultValue: false,
    label: 'No warning for missing permissions',
    description:
      "DemoMonkey requires permissions to interact with all sites, and will warn you if you don't provide those permissions. Turn this on to remove the warning."
  },
  {
    id: 'registerProtocolHandler',
    group: 'General',
    defaultValue: false,
    label: 'Register Protocol Handler',
    description: 'Register web+mnky to be handled by DemoMonkey.'
  }
]

class OptionalFeature {
  constructor(id, defaultValue, label, description, group) {
    this.id = id
    this.defaultValue = defaultValue
    this.label = label
    this.description = description
    this.group = group
    this.style = false
  }

  static getDefaultValues() {
    return optionalFeatures.reduce((result, obj) => {
      result[obj.id] = obj.defaultValue

      return result
    }, {})
  }

  static getAll(options = {}) {
    return optionalFeatures.map((obj) => {
      const of = new OptionalFeature(
        obj.id,
        obj.defaultValue,
        obj.label,
        obj.description,
        obj.group
      )
      if (options.styles && options.styles[obj.id]) {
        of.style = options.styles[obj.id]
      }
      return of
    })
  }

  static getGroups() {
    // Derive unique group names from optionalFeatures in declaration order
    return Array.from(new Set(optionalFeatures.map((obj) => obj.group)))
  }
}

export default OptionalFeature

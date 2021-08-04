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
    id: 'undo',
    defaultValue: true,
    label: 'Undo replacements',
    description: 'when configuration is disabled'
  },
  {
    id: 'autoReplace',
    defaultValue: true,
    label: 'Automatically apply replacements',
    description: <span>when configuration is saved. <i>(This will also disable undo)</i></span>
  },
  {
    id: 'autoSave',
    defaultValue: true,
    label: 'Save configuration on line break',
    description: ''
  },
  {
    id: 'saveOnClose',
    defaultValue: true,
    label: 'Save configuration when it is closed',
    description: ''
  },
  {
    id: 'editorAutocomplete',
    defaultValue: true,
    label: 'Autocomplete.',
    description: 'The editor for configurations will display an auto completion for commands, options & imports.'
  },
  {
    id: 'onlyShowAvailableConfigurations',
    defaultValue: true,
    label: 'Only show available configurations.',
    description: 'Set the default value for the popup toggle, which hides configurations that are not available for the current url.'
  },
  {
    id: 'webRequestHook',
    defaultValue: false,
    label: 'Hook into Web Requests.',
    description: <span>Turn this feature on, if you want to use the commands !delayUrl, !blockUrl and !redirectUrl. <b>This will allow DemoMonkey to intercept, block, or modify requests in-flight</b>. To learn what this means, read about <a target="blank" rel="noopener noreferer" href="https://developer.chrome.com/extensions/webRequest">chrome.webRequest</a></span>
  },
  {
    id: 'debugBox',
    defaultValue: false,
    label: 'Expand Debug Box',
    description: <span>Turn this feature on, to show the debug box with statistics in full length when running demo monkey in <i>debug mode</i></span>
  },
  {
    id: 'keyboardHandlerVim',
    defaultValue: false,
    label: 'VIM Keyboard Handler.',
    description: 'Turn this feature on, to use the vim keyboard handler for the editor.'
  },
  {
    id: 'withEvalCommand',
    defaultValue: false,
    label: 'Allow !eval.',
    description: 'By turning on this flag, you can use the command !eval which allows you to write arbitrary javascript code. Use with caution!'
  },
  {
    id: 'hookIntoAjax',
    defaultValue: false,
    label: 'Hook into Ajax.',
    description: 'Turn this feature on to allow DemoMonkey to hook into Ajax calls and modify their response.'
  },
  {
    id: 'hookIntoHyperGraph',
    defaultValue: true,
    label: 'Hook into HyperGraph.',
    description: 'Allow DemoMonkey to interact with hyper graph. If you do not know what hyper graph is, ignore it.'
  },
  {
    id: 'syncDarkMode',
    defaultValue: true,
    label: 'Sync Dark/Light mode with OS setting.',
    description: 'Automatically switch between dark and light mode.'
  },
  {
    id: 'preferDarkMode',
    defaultValue: false,
    // style: { display: this.props.settings.optionalFeatures.syncDarkMode ? 'none' : 'flex' },
    label: 'Use dark mode.',
    description: <span>Use this toggle to set <i>dark mode</i> as your preferred theme.</span>
  },
  {
    id: 'noWarningForMissingPermissions',
    defaultValue: false,
    label: 'No warning for missing permissions.',
    description: 'To work best, DemoMonkey requires permissions to interact with all sites, and will warn you if you don\'t provide those permissions. Turn this feature on to remove this warning.'
  },
  {
    id: 'registerProtocolHandler',
    defaultValue: false,
    label: 'Register Protocol Handler.',
    description: 'Turn this feature on to register web+mnky to be handled by demomonkey.'
  },
  {
    id: 'writeLogs',
    defaultValue: true,
    label: 'Write Logs.',
    description: <span>Turn this feature on to have a DemoMonkey logs accessible via the <b>Logs</b> navigation item.</span>
  }
]

class OptionalFeature {
  constructor(id, defaultValue, label, description) {
    this.id = id
    this.defaultValue = defaultValue
    this.label = label
    this.description = description
    this.style = false
  }

  static getDefaultValues() {
    return optionalFeatures.reduce((result, obj) => {
      result[obj.id] = obj.defaultValue

      return result
    }, {})
  }

  static getAll(options = {}) {
    return optionalFeatures.map(obj => {
      const of = new OptionalFeature(obj.id, obj.defaultValue, obj.label, obj.description)
      if (options.styles && options.styles[obj.id]) {
        of.style = options.styles[obj.id]
      }
      return of
    })
  }
}

export default OptionalFeature

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
import SearchAndReplace from './SearchAndReplace'
import ErrorCommand from './ErrorCommand'
import registry from './CommandRegistry'
import extractParameters from '../helpers/extractParameters'

class CommandBuilder {
  constructor(namespaces = [], includeRules, excludeRules, featureFlags = {}, logger = () => { return { write: () => {} } }) {
    this.namespaces = namespaces
    this.includeRules = includeRules
    this.excludeRules = excludeRules
    this.featureFlags = Object.assign({ withEvalCommand: false }, featureFlags)

    this.logger = logger

    this.commands = registry.reduce((result, current) => {
      // handle namespace
      if (current.registry) {
        result['_' + current.name] = {}
        current.registry.forEach(command => {
          result['_' + current.name][command.name] = command
          command.aliases && command.aliases.forEach(alias => {
            result.__[alias] = command
          })
        })
      }
      if (current.command) {
        result.__[current.name] = current
        current.aliases.forEach(alias => {
          result.__[alias] = current
        })
      }
      return result
    }, { __: {} })
  }

  _buildRegex(search, modifiers, replace) {
    // If the provided regular expression is invalid, an exception is thrown
    // We capture that exception and return an dummy command
    try {
      modifiers = typeof modifiers === 'string' ? modifiers : 'g'
      if (modifiers.includes('p')) {
        return new SearchAndReplace(
          new RegExp(search, modifiers.replace('p', '')),
          function (match) {
            if (match.toUpperCase() === match) {
              replace = replace.toUpperCase()
            }
            if (match.toLowerCase() === match) {
              replace = replace.toLowerCase()
            }
            return match.replace(new RegExp(search, modifiers.replace('p', '')), replace)
          })
      }
      return new SearchAndReplace(new RegExp(search, modifiers), replace)
    } catch (e) {
      return new ErrorCommand(e.message)
    }
  }

  _buildCustomCommand(namespace, name, parameters, value) {
    const location = typeof window === 'undefined' ? '' : window.location

    // Run namespaced command
    if (this.commands['_' + namespace] && this.commands['_' + namespace][name]) {
      return this.commands['_' + namespace][name].command.bind(this)(value, parameters, location, this.includeRules, this.excludeRules, this)
    }

    // Run command without namespace
    if (this.commands.__[name]) {
      return this.commands.__[name].command.bind(this)(value, parameters, location, this.includeRules, this.excludeRules, this)
    }

    for (let i = 0; i < this.namespaces.length; i++) {
      const ns = this.namespaces[i]
      if (this.commands['_' + ns] && this.commands['_' + ns][name]) {
        return this.commands['_' + ns][name].command.bind(this)(value, parameters, location, this.includeRules, this.excludeRules, this)
      }
    }

    return new ErrorCommand(`Command ${name} not found`)
  }

  _extractForCustomCommand(command) {
    if (typeof command !== 'string' || command === '') {
      return { extracted: false }
    }

    let namespace = ''
    let parameters = []

    if (command.indexOf('(') !== -1) {
      if (command.substr(-1) !== ')') {
        return { extracted: false }
      }
      parameters = extractParameters(command.slice(command.indexOf('(') + 1, -1))

      command = command.split('(')[0]
    }

    if (command.indexOf('.') !== -1) {
      namespace = command.slice(0, command.lastIndexOf('.'))
      command = command.slice(command.lastIndexOf('.') + 1)
    }

    return { extracted: true, command: command, namespace: namespace, parameters: parameters }
  }

  _buildCommand(key, value) {
    // handle regular expressions
    const regex = key.match(/^\/(.+)\/([gimp]+)?$/)
    if (regex !== null) {
      return this._buildRegex(regex[1], regex[2], value)
    }

    const rawCommand = this._extractForCustomCommand(key)

    if (rawCommand.extracted) {
      return this._buildCustomCommand(rawCommand.namespace, rawCommand.command, rawCommand.parameters, value)
    }
    return new ErrorCommand('Could not build command')
  }

  _innerBuild(key, value) {
    if (typeof key === 'undefined' || key === null) {
      key = ''
    }

    // Reverse of the replacement of \= defined in Ini.js
    if (typeof value === 'string') {
      value = value.replaceAll('\u2260', '=')
    }

    if (typeof key === 'string') {
      key = key.replaceAll('\u2260', '=')
    }

    if (key.charAt(0) === '!') {
      return this._buildCommand(key.substr(1), value)
    }

    if (key.charAt(0) === '\\') {
      key = key.substr(1)
    }

    return new SearchAndReplace(key, value)
  }

  build(key, value) {
    const cmd = this._innerBuild(key, value)

    if (!cmd.isAvailable(this.featureFlags)) {
      this.logger('warn', `Command requires the following feature flags: ${cmd.getRequiredFlags()}`).write()
      return new ErrorCommand(`Command requires the following feature flags: ${cmd.getRequiredFlags()}`, 'warning')
    }

    cmd.setSource(key, value)

    return cmd
  }
}

export default CommandBuilder

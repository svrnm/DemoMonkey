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
import Ini from './Ini'
import CommandBuilder from '../commands/CommandBuilder'
import UndoElement from '../commands/UndoElement'
import Variable from './Variable'
import MatchRule from './MatchRule'
import { logger } from '../helpers/logger'

class Configuration {
  constructor(iniFile, repository, enabled = true, values = {}, featureFlags = {}, globalVariables = []) {
    this.repository = repository
    this.rawContent = iniFile
    this.content = iniFile ? (new Ini(iniFile, repository)).parse() : []
    this.patterns = false
    this.options = false
    this.enabled = enabled
    this.values = values
    this.featureFlags = featureFlags

    this.globalVariables = Array.isArray(globalVariables) ? globalVariables : []
  }

  isTemplate() {
    return this.getOptions().template
  }

  isDisabled() {
    return this.isTemplate() || this.getOptions().deprecated
  }

  isRestricted() {
    return typeof this.getOptions().include !== 'undefined' || typeof this.getOptions().exclude !== 'undefined'
  }

  updateValues(values) {
    this.values = Object.assign(this.values, values)
    this.patterns = false
    return this
  }

  isAvailableForUrl(url) {
    if (this.isDisabled() || !this.isRestricted()) {
      return false
    }
    const options = this.getOptions()
    return new MatchRule(options.include, options.exclude).test(url)
  }

  isEnabledForUrl(url) {
    if (this.enabled === false || this.isDisabled() || !this.isRestricted()) {
      return false
    }
    const options = this.getOptions()
    return new MatchRule(options.include, options.exclude).test(url)
  }

  getTextAttributes() {
    const ta = this.getOptions().textAttributes
    const d = ['placeholder']
    // the chain after ta makes sure that lists are split by comma and spaces are removed.
    const result = !Array.isArray(ta) ? d : ta.map(e => e.split(',')).flat().map(e => e.trim()).filter(e => e !== '').concat(d)
    return result
  }

  isTagBlockListed(node) {
    let blocklist = this.getOptions().blocklist
    let allowlist = this.getOptions().allowlist

    if (!Array.isArray(blocklist)) {
      blocklist = []
    }

    if (!Array.isArray(allowlist)) {
      allowlist = []
    }

    blocklist.push('style', 'script')

    blocklist = blocklist.filter(x => !allowlist.includes(x))

    switch (node.nodeType) {
      // TEXT_NODE
      case 3:
        return typeof node.parentNode !== 'undefined' && node.parentNode !== null && blocklist.map(tag => tag.toLowerCase()).includes(node.parentNode.nodeName.toLowerCase())
      // ELEMENT_NODE
      case 1:
        return blocklist.map(tag => tag.toLowerCase()).includes(node.nodeName.toLowerCase())
    }

    return false
  }

  apply(node, key = 'value', groupName = '*') {
    if (this.isTagBlockListed(node)) {
      return []
    }

    const undos = this._getConfiguration().reduce(function (carry, command) {
      if (!command.isApplicableForGroup(groupName)) {
        return carry
      }

      // Break an error loop early.
      if (command.isFaulty()) {
        return carry
      }

      let undo

      try {
        undo = command.apply(node, key)
      } catch (e) {
        console.log(e)
        logger('error', e).write()
        command.updateErrorCounter()
        if (command.isFaulty()) {
          logger('warn', 'Command is marked as faulty and will be disabled', command.toString()).write()
        }
        return carry
      }

      if (undo === false) {
        return carry
      }

      if (Array.isArray(undo)) {
        undo.forEach(e => {
          if (e instanceof UndoElement) {
            e.setSource(command)
          }
        })
        return carry.concat(undo)
      }

      if (undo instanceof UndoElement) {
        undo.setSource(command)
      }
      carry.push(undo)
      return carry
    }, [])
    return undos
  }

  getOptions() {
    if (this.options === false) {
      const filterOption = function (content, section) {
        return function (result, key) {
          // By default ini.parse sets "true" as the value
          if (key.charAt(0) === '@' && key.length > 1) {
            let value = content[key]

            if (typeof value === 'string') {
              value = [value]
            }

            const option = key.substring(1)

            if (content[key] !== true || option === 'template' || option === 'deprecated') {
              if (Object.prototype.hasOwnProperty.call(result, option) && Array.isArray(result[option])) {
                result[option] = result[option].concat(value)
              } else {
                result[option] = value
              }
              return result
            }
          }

          if (typeof content[key] === 'object' && content[key] !== null) {
            return Object.keys(content[key]).reduce(filterOption(content[key], key), result)
          }
          return result
        }
      }
      this.options = Object.keys(this.content).reduce(filterOption(this.content, ''), {})
    }
    return this.options
  }

  getImports() {
    const maxDepth = 25
    const filterImport = function (content, depth = 0) {
      return function (result, key) {
        if (depth > maxDepth) {
          return result
        }

        if (key.charAt(0) === '+') {
          result.push(key.substring(1))
        }

        if (typeof content[key] === 'object' && content[key] !== null) {
          return result.concat(Object.keys(content[key]).reduce(filterImport(content[key], depth++), []))
        }

        return result
      }
    }
    return Object.keys(this.content).reduce(filterImport(this.content), [])
  }

  getValue(owner, name) {
    if (typeof this.values[name] !== 'undefined') {
      return this.values[name]
    }
    return this.values[owner + '::' + name]
  }

  getVariables(owner = '', bindValues = true) {
    const localNames = []

    const filterVariable = (content) => {
      return (result, key) => {
        // $ is not a legal variable name
        if (key.charAt(0) === '$' && key.length > 1) {
          // By default ini.parse sets "true" as the value
          const t = (content[key] === true || typeof content[key] !== 'string')
            ? ['', '']
            : ((value) => {
                const ar = value.split(/([^:])\/\//)
                if (ar.length > 1) {
                  const comment = ar.pop()
                  return [ar.join(''), comment]
                }
                // add an empty comment
                return ar.concat('')
              })(content[key])
          result.push(new Variable(key.substring(1), t[0], t[1] ? t[1] : '', owner))
          localNames.push(key.substring(1))
          return result
        }

        if (typeof this.repository === 'object' && key.charAt(0) === '+') {
          return result.concat(this.repository.findByName(key.substring(1)).getVariables(key.substring(1), false))
        }

        if (typeof content[key] === 'object' && content[key] !== null) {
          return result.concat(Object.keys(content[key]).reduce(filterVariable(content[key]), []))
        }

        return result
      }
    }

    // Variables are replaced longest first, to have a consistent behaviour for #35
    // Also, "local variables" are shadowing variables of imports
    const variables = Object.keys(this.content).reduce(filterVariable(this.content), this.globalVariables.map(v => new Variable(v.key, v.value, '', 'global')))
      .sort((a, b) => {
        return b.name.length - a.name.length
      }).reduce((carry, variable) => {
        if (localNames.includes(variable.name) && variable.owner !== owner) {
          return carry
        }
        return carry.concat(variable)
      }, [])

    if (bindValues) {
      return variables.map((variable) => {
        return variable.bind(this.getValue(variable.owner, variable.name))
      })
    }

    return variables
  }

  _getConfiguration() {
    if (this.patterns === false) {
      // get all variables upfront
      const variables = this.getVariables()
      const options = this.getOptions()

      const commandBuilder = new CommandBuilder(
        Array.isArray(options.namespace) ? options.namespace : [],
        Array.isArray(options.include) ? options.include : [],
        Array.isArray(options.exclude) ? options.exclude : [],
        this.featureFlags,
        logger
      )

      const filterConfiguration = (content) => {
        return (result, key) => {
          // skip all variables
          // '$' is not a variable, so we also check for the length of the variable.
          // '@' is not an option, so we also check for the length of the option
          if ((key.charAt(0) === '$' && key.length > 1) || (key.charAt(0) === '@' && key.length > 1)) {
            return result
          }

          if (key.charAt(0) === '+') {
            const configName = key.substring(1)
            const valuesFromVariables = variables.reduce((carry, variable) => {
              if (variable.owner === '') {
                carry[variable.name] = variable.value
              }
              return carry
            }, {})
            return result.concat(this.repository.findByName(configName).updateValues(Object.assign(this.values, valuesFromVariables))._getConfiguration())
          }

          // skip for non-commands
          if (key.charAt(0) !== '!' && content[key] === true) {
            return result
          }

          if (typeof content[key] === 'object' && content[key] !== null) {
            return result.concat(Object.keys(content[key]).reduce(filterConfiguration(content[key]), []))
          }

          const applyVariables = (target) => variables.reduce((value, variable) => {
            return variable.apply(value)
          }, target)

          // We apply the variables twice to allow dependencies like: $domain = $name.$tld
          const lhs = applyVariables(applyVariables(key))
          const rhs = applyVariables(applyVariables(content[key]))

          result.push(commandBuilder.build(lhs, rhs))

          return result
        }
      }

      this.patterns = Object.keys(this.content).reduce(filterConfiguration(this.content), [])
    }

    return this.patterns
  }
}

export default Configuration

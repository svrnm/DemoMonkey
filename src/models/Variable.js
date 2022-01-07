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
import * as changeCase from 'change-case'
import chance from 'chance'
import json5 from 'json5'

const randomGenerator = chance.Chance()

const stringFunctions = {
  toLowerCase: (str) => str.toLowerCase(),
  toUpperCase: (str) => str.toUpperCase(),
  camelCase: (str) => changeCase.camelCase(str),
  capitalCase: (str) => changeCase.capitalCase(str),
  constantCase: (str) => changeCase.constantCase(str),
  dotCase: (str) => changeCase.dotCase(str),
  headerCase: (str) => changeCase.headerCase(str),
  noCase: (str) => changeCase.noCase(str),
  paramCase: (str) => changeCase.paramCase(str),
  pascalCase: (str) => changeCase.pascalCase(str),
  pathCase: (str) => changeCase.pathCase(str),
  sentenceCase: (str) => changeCase.sentenceCase(str),
  snakeCase: (str) => changeCase.snakeCase(str),
  length: (str) => str.length + '',
  slice: (args) => args.string.slice(args.start, args.stop)
}

class Variable {
  constructor(name, placeholder, description, owner = '') {
    this.name = name
    this.value = placeholder
    this.description = description
    this.owner = owner
    this.id = this.owner === '' ? this.name : this.owner + '::' + this.name
  }

  static applyList(variables, str) {
    // make sure that we are not running forever
    let depth = 0
    let result = str
    let previous
    do {
      do {
        previous = result
        result = variables.reduce((value, variable) => {
          return variable.apply(value)
        }, previous)
        depth++
      } while (result !== previous && depth < 1000)
      result = Variable.evaluateFunctions(result)
    } while (result !== previous && depth < 1000)
    return result
  }

  bind(value) {
    return new Variable(this.name, typeof value === 'string' ? value : this.value, this.description, this.owner)
  }

  static evaluateFunctions(value) {
    if (typeof value !== 'string') {
      return value
    }
    // We want to process  recursively from back to front, so that inner use is processed later
    // We split the value first, and go through the string from back to front.
    const list = value.split(/\${(random|string)\./)
    return list.shift() + list.reverse().reduce((result, current, index) => {
      // We go from back to front, so the methods & arguments come before the namespace
      if (index % 2 === 0 || !['random', 'string'].includes(current)) {
        return (current + result)
      }
      return result.replace(/([a-zA-Z0-9_-]*)(?:\((.*?)\))?}/, (match, p1, p2) => {
        let args
        try {
          args = json5.parse(p2)
        } catch (e) {
          // Treat argument as string
          args = p2 + ''
        }
        if (current === 'random' && typeof randomGenerator[p1] === 'function') {
          try {
            return randomGenerator[p1](args)
          } catch (e) {
            return match
          }
        } else if (current === 'string' && typeof stringFunctions[p1] === 'function') {
          try {
            return stringFunctions[p1](args)
          } catch (e) {
            console.log(e)
            return match
          }
        }
        return match
      })
    }, [])
  }

  apply(value) {
    if (typeof value !== 'string') {
      return value
    }
    return value.replaceAll('$' + this.name, this.value).replace('${' + this.name + '}', this.value)
  }
}

export default Variable

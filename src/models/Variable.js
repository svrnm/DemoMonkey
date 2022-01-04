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
import chance from 'chance'
import json5 from 'json5'

const randomGenerator = chance.Chance()

class Variable {
  constructor(name, placeholder, description, owner = '') {
    this.name = name
    this.value = placeholder
    this.description = description
    this.owner = owner
    this.id = this.owner === '' ? this.name : this.owner + '::' + this.name
  }

  static applyList(variables, str) {
    let result = str
    let previous
    do {
      do {
        previous = result
        result = variables.reduce((value, variable) => {
          return variable.apply(value)
        }, previous)
      } while (result !== previous)
      result = Variable.evaluateFunctions(result)
    } while (result !== previous)
    return result
  }

  bind(value) {
    return new Variable(this.name, typeof value === 'string' ? value : this.value, this.description, this.owner)
  }

  static evaluateFunctions(value) {
    // We want to process  recursively from back to front, so that inner use is processed later
    // We split the value first, and go through the string from back to front.
    const list = value.split('${random.')
    return list.shift() + list.map(x => '${random.' + x).reverse().reduce((result, current) => {
      return current.replace(/\${random.([a-zA-Z0-9_-]*)(?:\((.*?)\))?}/, (match, p1, p2) => {
        let args
        try {
          args = json5.parse(p2)
        } catch (e) {
          args = ''
        }
        if (typeof randomGenerator[p1] === 'function') {
          try {
            return randomGenerator[p1](args)
          } catch (e) {
            return match
          }
        }
        return match
      }) + result
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

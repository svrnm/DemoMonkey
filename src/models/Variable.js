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
class Variable {
  constructor(name, placeholder, description, owner = '') {
    this.name = name
    this.value = placeholder
    this.description = description
    this.owner = owner
    this.id = this.owner === '' ? this.name : this.owner + '::' + this.name
  }

  bind(value) {
    return new Variable(this.name, typeof value === 'string' ? value : this.value, this.description, this.owner)
  }

  apply(value) {
    if (typeof value === 'string') {
      return value.replace('$' + this.name, this.value).replace('${' + this.name + '}', this.value)
    }
    return value
  }
}

export default Variable

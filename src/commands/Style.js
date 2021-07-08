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
import Command from './Command'
import UndoElement from './UndoElement'

class Style extends Command {
  constructor(search, property, nthParent, value) {
    super()
    this.search = search
    this.nthParent = parseInt(nthParent) || 1
    this.property = property
    this.value = value
  }

  apply(node, key = 'value') {
    if (typeof node[key] !== 'undefined' && node[key].trim() === this.search) {
      node = node.parentElement
      node = this._walk(node, this.nthParent)
      const original = node.style[this.property]
      node.style[this.property] = this.value
      if (original !== this.value) {
        return new UndoElement(node, 'style.' + this.property, original, this.value)
      }
    }
    return false
  }
}

export default Style

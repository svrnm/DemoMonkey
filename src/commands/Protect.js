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

class Protect extends Command {
  // Using '' as locationFilter and location as {} works with _checkLocation
  // since every string includes ''
  constructor(search, locationFilter = '', cssFilter = '', location = {}) {
    super()
    this.search = search
    this.locationFilter = locationFilter
    this.cssFilter = cssFilter
    this.location = location
  }

  _checkLocation() {
    return typeof this.location === 'object' &&
      this.location.toString().includes(this.locationFilter)
  }

  _checkCss(target) {
    if (this.cssFilter === '') {
      return true
    }
    return typeof target !== 'object' || target.parentNode === null || typeof target.parentNode !== 'object' || typeof target.parentNode.matches !== 'function' || target.parentNode.matches(this.cssFilter)
  }

  apply(target, key = 'value') {
    if (!this._checkLocation() || !this._checkCss(target)) {
      return false
    }

    if (typeof target[key] === 'undefined') {
      return false
    }

    const original = target[key].trim()
    if (this._match(original, this.search)) {
      target[key] = target[key].split('').join(String.fromCharCode(0x200B))
      return new UndoElement(target, key, original, target[key])
    }

    return false
  }

  toString() {
    return this.search.toString() + '/' + this.replace.toString()
  }
}

export default Protect

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

class SearchAndReplace extends Command {
  // Using '' as locationFilter and location as {} works with _checkLocation
  // since every string includes ''
  constructor(search, replace, locationFilter = '', cssFilter = '', property = '', location = {}) {
    super()
    this.search = search
    this.replace = replace
    this.locationFilter = locationFilter
    this.cssFilter = cssFilter
    this.location = location
    this.property = property
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

  _replaceByProperty(target) {
    target = this._walk(target, 1)
    let property = this.property
    if (property.startsWith('data-') && typeof target.dataset === 'object' && target.dataset !== null) {
      target = target.dataset
      property = property.substr(5)
    }
    if (target === false || typeof target[property] === 'undefined') {
      return false
    }
    const original = target[property]
    const replacement = original.replace(this.search, this.replace)
    console.log(replacement, original)
    if (replacement !== original) {
      target[property] = replacement
      return new UndoElement(target, property, original, replacement)
    }
    return false
  }

  apply(target, key = 'value') {
    if (!this._checkLocation() || !this._checkCss(target)) {
      return false
    }

    if (typeof this.property === 'string' && this.property !== '') {
      return this._replaceByProperty(target)
    }

    if (key.startsWith('data-') && typeof target.dataset === 'object' && target.dataset !== null) {
      target = target.dataset
      key = key.substr(5)
    }

    if (typeof target[key] === 'undefined') {
      return false
    }

    const original = target[key]
    const replacement = target[key].replace(this.search, this.replace)
    if (replacement !== original) {
      target[key] = replacement
      return new UndoElement(target, key, original, replacement)
    }
    return false
  }
}

export default SearchAndReplace

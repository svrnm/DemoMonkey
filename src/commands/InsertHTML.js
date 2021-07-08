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
import { v4 as uuidV4 } from 'uuid'

class InsertHTML extends Command {
  // Using '' as locationFilter and location as {} works with _checkLocation
  // since every string includes ''
  // cssFilter is not yet implemented
  constructor(position, search, insert, nthParent = 1, locationFilter = '', location = {}) {
    super()
    this.nthParent = nthParent
    this.position = position
    this.search = search
    this.insert = insert
    this.locationFilter = locationFilter
    this.location = location
    this.marker = uuidV4()
  }

  _checkLocation() {
    return typeof this.location === 'object' &&
      this.location.toString().includes(this.locationFilter)
  }

  _addMarker(string) {
    return string + '<!-- ' + this.marker + ' -->'
  }

  apply(target, key = 'value') {
    if (!this._checkLocation()) {
      return false
    }

    // Check if we can find search in the current node
    if (this.input !== '' && typeof target[key] !== 'undefined' && this._match(target[key].trim(), this.search, null) && this._checkLocation()) {
      const parentElement = this._walk(target, this.nthParent)
      if (parentElement && !parentElement.innerHTML.includes(this.marker)) {
        const original = parentElement.innerHTML
        parentElement.insertAdjacentHTML(this.position, this._addMarker(this.insert))
        return new UndoElement(parentElement, 'innerHTML', original, parentElement.innerHTML)
      }
    }
    return false
  }
}

export default InsertHTML

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

class ReplaceNeighbor extends Command {
  constructor(search, replace, nthParent, cssSelector, locationFilter = '', property = '', location = {}, cb = null) {
    super()
    this.search = search
    this.replace = replace
    this.nthParent = nthParent
    this.cssSelector = cssSelector
    this.locationFilter = locationFilter
    this.property = property
    this.location = location
    this.cb = cb
  }

  _checkLocation() {
    return typeof this.location === 'object' &&
      this.location.toString().includes(this.locationFilter)
  }

  apply(target, key = 'value') {
    if (typeof this.replace === 'undefined') {
      return false
    }

    if (!this._checkLocation()) {
      return false
    }

    // Check if we can find search in the current node
    if (typeof target[key] !== 'undefined' && this._match(target[key].trim(), this.search, null) && this._checkLocation()) {
      // Walk up some parent nodes
      const parentNode = this._walk(target, this.nthParent)
      // Check if the parent node exists and has a querySelector, _walk can return false
      if (parentNode && typeof parentNode.querySelector === 'function') {
        const neighbor = parentNode.querySelector(this.cssSelector)
        // Check if we found a proper neighbor:
        // - If cb is defined, we use it for updating the found neighbor
        // - Otherwise, if this neighbor has at least one childNode, we assume that the child is a textNode
        if (neighbor) {
          if (typeof this.cb === 'function') {
            return this.cb(this.search, this.replace, neighbor)
          } else if (this.property === 'src') {
            const original = neighbor.src
            // Make sure that also relative paths are matched
            if (original !== this.replace && !original.endsWith(this.replace)) {
              neighbor.src = this.replace
              return new UndoElement(neighbor, 'src', original, neighbor.src)
            }
          } else if (this.property === 'href.baseVal') {
            const original = neighbor.href.baseVal
            if (original !== this.replace && !original.endsWith(this.replace)) {
              neighbor.href.baseVal = this.replace
              return new UndoElement(neighbor, 'href.baseVal', original, neighbor.href)
            }
          } else if (this.property !== '') {
            const original = neighbor.style[this.property]
            if (original !== this.replace) {
              neighbor.style[this.property] = this.replace
              return new UndoElement(neighbor, 'style.' + this.property, original, neighbor.style[this.property])
            }
          } else if (neighbor.childNodes && neighbor.childNodes.length > 0) {
            const neighborText = Array.from(neighbor.childNodes).filter(node => node.nodeType === 3)[0]
            const original = neighborText.data
            if (original !== this.replace) {
              neighborText.data = this.replace
              return new UndoElement(neighborText, 'data', original, this.replace)
            }
          }
        }
      }
    }
    return false
  }
}

export default ReplaceNeighbor

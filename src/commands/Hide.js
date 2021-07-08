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

class Hide extends Command {
  // parameters:
  // 0 - search word
  // 1 - n-th parent (0 = self)
  // 2 - css-filter
  // 3 - href-filter
  // 4 - hash-filter
  // 5 - window.location object
  constructor(search, nthParent, cssFilter, hrefFilter, hashFilter, location, conditionCallback) {
    super()
    this.search = search
    this.nthParent = parseInt(nthParent) || 1
    this.cssFilter = typeof cssFilter === 'string' ? cssFilter : ''
    this.hrefFilter = typeof hrefFilter === 'string' ? hrefFilter : ''
    this.hashFilter = typeof hashFilter === 'string' ? hashFilter : ''
    this.location = location
    this.conditionCallback = typeof conditionCallback === 'function' ? conditionCallback : function () { return true }
  }

  _checkCss(node, className) {
    return node !== false &&
      node.style.display !== 'none' &&
        (
          (typeof node.className.includes === 'function' && node.className.includes(className)) ||
          (node.className.baseVal && typeof node.className.baseVal.includes === 'function' && node.className.baseVal.includes(className))
        )
  }

  _checkLocation() {
    return typeof this.location === 'object' &&
      typeof this.location.href === 'string' &&
      typeof this.location.hash === 'string' &&
      this.location.hash.includes(this.hashFilter) &&
      this.location.href.includes(this.hrefFilter)
  }

  apply(node, key) {
    if (typeof node[key] !== 'undefined' && this._match(node[key].trim(), this.search, null) && this._checkLocation()) {
      const parentNode = this._walk(node, this.nthParent)
      if (this._checkCss(parentNode, this.cssFilter) && this.conditionCallback(node, parentNode)) {
        return this._hideNode(parentNode)
      }
    }
    return false
  }
}

export default Hide

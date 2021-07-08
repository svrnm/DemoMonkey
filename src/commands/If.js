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

class Group extends Command {
  constructor(locationFilter = '', cssFilter = '', thenCmd, location) {
    super()
    this.locationFilter = locationFilter
    this.cssFilter = cssFilter
    this.thenCmd = thenCmd
    this.location = location
  }

  isApplicableForGroup(group) {
    return this.thenCmd.isApplicableForGroup(group)
  }

  /* Copy From OverwriteHTML, move to Command in a later stage */
  _checkLocation() {
    return typeof this.location === 'object' &&
      this.location.toString().includes(this.locationFilter)
  }

  /* This code is also an improvement for SearchAndReplace, might need to update */
  _checkCss(target) {
    if (this.cssFilter === '' || typeof target !== 'object' || typeof target.nodeType !== 'number') {
      return true
    }

    // For text nodes we check css on the parent node
    if (target.nodeType === 3) {
      return this._checkCss(target.parentNode)
    } else if (typeof target.matches === 'function') {
      return target.matches(this.cssFilter)
    }
    return false
  }

  apply(target, key) {
    if (!this._checkLocation() || !this._checkCss(target)) {
      return false
    }

    return this.thenCmd.apply(target, key)
  }
}

export default Group

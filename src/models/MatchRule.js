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
class MatchRule {
  constructor(includes = [], excludes = []) {
    this.includes = includes
    this.excludes = excludes
  }

  _testString(pattern, str) {
    if (pattern.startsWith('/') && pattern.endsWith('/')) {
      return (new RegExp(pattern.substr(1, pattern.length - 2))).test(str)
    }
    return str.includes(pattern)
  }

  _reducer(set, str) {
    return set.reduce((carry, pattern) => {
      try {
        return carry || this._testString(pattern, str)
      } catch (e) {
        return carry
      }
    }, false)
  }

  test(str) {
    const included = this.includes.length < 1 || this._reducer(this.includes, str)

    const excluded = this.excludes.length > 0 && this._reducer(this.excludes, str)

    return included && !excluded
  }
}

export default MatchRule

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
function match(original, search, replace) {
  // This also works with "startsWithNot" (see below)
  // !search === replace becomes search !== replace
  // original === replace is evaluated before the code below
  if (search === replace || original === replace) {
    return false
  }

  const regex = search.match(/^!\/(.+)\/([gimp]+)?$/)
  if (regex) {
    return (new RegExp(regex[1], regex[2])).test(original)
  }

  const startsWithNot = search.charAt(0) === '!'

  if (startsWithNot) {
    return !match(original, search.slice(1), replace)
  }

  // The '*' is at any other place (not start, not end, not both)
  if (search.includes('*')) {
    const parts = search.split('*').map(function (string) {
      // Copied from https://developer.mozilla.org/en/docs/Web/JavaScript/Guide/Regular_Expressions
      return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // $& meint den komplett erkannten String
    }).join('.*')
    return new RegExp(parts).test(original)
  }

  return original === search
}

export default match

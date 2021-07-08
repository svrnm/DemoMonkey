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
import deepIs from 'deep-is'

// Verify that two entries are not identical
function equal(entry1, entry2) {
  if (typeof entry2 === 'undefined') {
    return false
  }
  // Verify that there are no custom properties as differences
  if (!deepIs(Object.keys(entry1), Object.keys(entry2))) {
    // console.log('different keys', entry1, entry2)
    return false
  }
  const keys = Object.keys(entry1).filter(k => !['repeated', 'timestamp'].includes(k))
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i]
    if (!deepIs(entry1[key], entry2[key])) {
      // console.log('different', key, entry1, entry2)
      return false
    }
  }
  return true
}

const log = function (state = '', action) {
  const tabId = (action._sender && action._sender.tab) ? action._sender.tab.id : null
  switch (action.type) {
    case 'APPEND_LOG_ENTRIES':
      return state.concat(action.entries.map(e => Object.assign({}, { tabId, repeated: 0 }, e))).reduce((c, e) => {
        const p = c[c.length - 1]
        if (!equal(e, p)) {
          c.push(e)
        } else {
          p.repeated++
        }
        return c
      }, [])
    default:
      return state
  }
}

export default log

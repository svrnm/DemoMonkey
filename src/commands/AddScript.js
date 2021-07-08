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

class QuerySelector extends Command {
  constructor(attributes = [], body) {
    super()
    this.attributes = attributes
    this.body = body
    this.demoMonkeyId = `dmid-${uuidV4()}`
  }

  isApplicableForGroup(group) {
    return group === 'document' || group === '*'
  }

  apply(target, key = 'value') {
    if (target === null) {
      return false
    }

    if (target.querySelector(`[data-demo-monkey-id=${this.demoMonkeyId}]`)) {
      return false
    }

    const scriptTag = target.createElement('script')
    scriptTag.innerHTML = this.body
    scriptTag.dataset.demoMonkeyId = this.demoMonkeyId
    this.attributes.forEach(attribute => {
      const [key, value] = attribute.split('=')
      if (key && value) {
        scriptTag.setAttribute(key, value)
      }
    })
    target.head.append(scriptTag)

    return UndoElement.fromFunction(() => {
      scriptTag.remove()
      return true
    })
  }
}

export default QuerySelector

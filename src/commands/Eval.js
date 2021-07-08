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

// !eval(group)
class Eval extends Command {
  constructor(group = '*', parameters = [], script = '') {
    super()
    this.group = group
    this.parameters = parameters
    /* eslint no-new-func: "off" */
    this.func = new Function('target', 'key', 'parameters', 'UndoElement', script)
  }

  isApplicableForGroup(group) {
    return this.group === '*' || group === this.group
  }

  isAvailable(featureFlags) {
    return featureFlags.withEvalCommand === true
  }

  getRequiredFlags() {
    return 'Allow !eval'
  }

  apply(target, key = 'value') {
    const r = this.func(target, key, this.parameters, UndoElement)
    if (r instanceof UndoElement) {
      return r
    }
    if (Array.isArray(r)) {
      return r.reduce((carry, element) => element instanceof UndoElement ? carry.concat(element) : carry, [])
    }
    return false
  }
}

export default Eval

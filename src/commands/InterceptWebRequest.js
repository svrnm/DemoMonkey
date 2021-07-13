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

class InterceptWebRequest extends Command {
  constructor(search, value, action, type = '*', includeRules, excludeRules) {
    super()
    this.search = search
    this.action = action
    this.type = type
    this.includeRules = includeRules
    this.excludeRules = excludeRules

    this.options = {}

    if (this.action === 'block') {
      this.id = this.search + '-block' + '-type-' + this.type + '-includes-' + this.includeRules.join('--') + '-excludes-' + this.excludeRules.join('--')
    } else {
      this.options[this.action] = value
      this.id = this.search + '-' + this.action + '-' + value + '-type-' + this.type + '-includes-' + this.includeRules.join('--') + '-excludes-' + this.excludeRules.join('--')
    }
  }

  isApplicableForGroup(group) {
    return group === 'url' || group === '*'
  }

  isAvailable(featureFlags) {
    return featureFlags.webRequestHook === true
  }

  getRequiredFlags() {
    return 'Hook into Web Requests'
  }

  apply(target, key = 'value') {
    target.add({
      id: this.id,
      url: this.search,
      action: this.action,
      type: this.type,
      options: this.options,
      includeRules: this.includeRules,
      excludeRules: this.excludeRules
    })

    return {
      target: target,
      apply: () => {
        target.remove(this.id)
        return true
      }
    }
  }
}

export default InterceptWebRequest

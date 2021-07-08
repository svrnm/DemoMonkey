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

class ReplaceAjaxResponse extends Command {
  constructor(urlPattern, search = false, replace) {
    super()
    this.urlPattern = urlPattern
    this.search = search
    this.replace = replace
  }

  isApplicableForGroup(group) {
    return group === 'ajax' || group === '*'
  }

  isAvailable(featureFlags) {
    return featureFlags.hookIntoAjax === true
  }

  getRequiredFlags() {
    return 'Hook into Ajax'
  }

  apply(target, key) {
    target.add('replaceAjaxResponse', { urlPattern: this.urlPattern, search: this.search, replace: this.replace })
    return false
  }
}

export default ReplaceAjaxResponse

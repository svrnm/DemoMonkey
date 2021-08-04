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
class InlineRuleManager {
  constructor(scope, config = {
    hookIntoAjax: false,
    hookIntoHyperGraph: false
  }) {
    this.scope = scope
    this.enabled = config.hookIntoAjax
  }

  add (f, c) {
    if (!this.enabled) {
      return
    }
    this.scope.postMessage({
      task: 'add-inline-rule',
      rule: [f, c]
    })
  }

  clear() {
    if (!this.enabled) {
      return
    }
    this.scope.postMessage({
      task: 'clear-inline-rules'
    })
  }
}

export default InlineRuleManager

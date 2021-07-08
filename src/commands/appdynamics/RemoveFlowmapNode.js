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
import Command from '../Command'

class RemoveFlowmapNode extends Command {
  constructor(search) {
    super()
    this.search = search
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
    target.add(function (url, response, context) {
      if (url.match(/applicationFlowMapUiService/i)) {
        const j = JSON.parse(response)
        console.log(j.nodes)
        j.nodes = j.nodes.filter(node => node.name !== context.search)
        return JSON.stringify(j)
      }
      return response
    }, { search: this.search })
    return false
  }
}

export default RemoveFlowmapNode

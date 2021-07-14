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
import { logger } from '../helpers/logger'

class Stage extends Command {
  constructor(href, title, name) {
    super()
    this.name = name
    this.href = href
    this.title = title
  }

  isApplicableForGroup(group) {
    return group === 'document' || group === '*'
  }

  _match(location, title) {
    return location.href.includes(this.href) && title.includes(this.title)
  }

  apply(target, key = 'value') {
    const currentStage = target['demomonkey-current-stage']
    const currentStageTime = target['demomonkey-current-stage-time']
    if (currentStage !== this.name && this._match(target.location, target.title)) {
      if (typeof currentStage !== 'undefined') {
        const time = Math.round((Date.now() - currentStageTime) / 1000)
        logger('info', `Transition from stage "${currentStage}" to "${this.name} after ${time} seconds"`)
      } else {
        logger('info', `Starting with stage "${this.name}"`)
      }
      target['demomonkey-current-stage'] = this.name
      target['demomonkey-current-stage-time'] = Date.now()
    }
    return false
  }
}

export default Stage

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
import Stage from '../../src/commands/Stage'
import chai from 'chai'

const assert = chai.assert

// logger needs a global window object
global.window = {
  dmLogger: console.log
}

describe('Stage', function () {
  describe('#apply', function () {
    it('goes from stage to stage', function () {
      const stages = [
        new Stage('start.html', '', 'Start'),
        new Stage('step2.html', '', 'Step2'),
        new Stage('step3.html', '', 'Step3'),
        new Stage('end.html', '', 'End')
      ]
      const document = {
        location: new URL('http://test/start.html'),
        title: ''
      }

      stages.forEach(stage => stage.apply(document, 'key'))

      assert(document['demomonkey-current-stage'], 'Start')

      document.location = new URL('http://test/step2.html')

      stages.forEach(stage => stage.apply(document, 'key'))

      assert(document['demomonkey-current-stage'], 'Step2')

      document.location = new URL('http://test/step3.html')

      stages.forEach(stage => stage.apply(document, 'key'))

      assert(document['demomonkey-current-stage'], 'Step3')

      document.location = new URL('http://test/step4.html')

      stages.forEach(stage => stage.apply(document, 'key'))

      assert(document['demomonkey-current-stage'], 'Step3')
    })
  })
})

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
import UndoElement from '../../src/commands/UndoElement'
import chai from 'chai'

const assert = chai.assert

describe('UndoElement', function () {
  describe('#apply', function () {
    it('reverts a replacement on a node', function () {
      const node = {
        value: 'replacement'
      }
      const element = new UndoElement(node, 'value', 'original', 'replacement')
      assert.equal(node.value, 'replacement')
      assert.equal(element.apply(), true)
      assert.equal(node.value, 'original')
    })

    it('reverts a replacement on a node only if the replacement is still valide', function () {
      const node = {
        value: 'some other text'
      }
      const element = new UndoElement(node, 'value', 'original', 'replacement')
      assert.equal(node.value, 'some other text')
      assert.equal(element.apply(), false)
      assert.equal(node.value, 'some other text')
    })
  })
})

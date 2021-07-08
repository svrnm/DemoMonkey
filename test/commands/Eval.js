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
import Eval from '../../src/commands/Eval'
import UndoElement from '../../src/commands/UndoElement'
import chai from 'chai'

const assert = chai.assert

describe('Eval', function () {
  describe('#apply', function () {
    it('applies the given script on target', function () {
      const target = {
        key: 5
      }
      const cmd = new Eval('text', [], 'target[key] = 10')
      assert(!cmd.apply(target, 'key'))
      assert.equal(target.key, 10)
    })

    it('accepts parameters', function () {
      const target = {
        key: 5
      }
      const cmd = new Eval('text', [12], 'target[key] = parameters[0]')
      assert(!cmd.apply(target, 'key'))
      assert.equal(target.key, 12)
    })

    it('return false, UndoElement or an array of UndoElements', function () {
      assert(!(new Eval('text', [], '').apply()))
      assert.deepEqual(new Eval('text', [], 'return new UndoElement()').apply(), new UndoElement())
      assert(!(new Eval('text', [], 'return {}').apply()))
      assert.deepEqual(new Eval('text', [], 'return []').apply(), [])
      assert.deepEqual(new Eval('text', [], 'return [new UndoElement(), new UndoElement()]').apply(), [new UndoElement(), new UndoElement()])
      assert.deepEqual(new Eval('text', [], 'return [new UndoElement(), false, new UndoElement(), {}]').apply(), [new UndoElement(), new UndoElement()])
    })
  })
})

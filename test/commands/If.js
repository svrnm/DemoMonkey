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
import If from '../../src/commands/If'
import SearchAndReplace from '../../src/commands/SearchAndReplace'

const assert = require('assert')

const location = {
  toString: function () {
    return 'asdf'
  }
}
const locationAlt = {
  toString: function () {
    return 'xyz'
  }
}

describe('If', function () {
  describe('#apply', function () {
    it('should just work as noop if no condition is set', function () {
      const node = {
        value: 'asdf'
      }

      new If('', '', new SearchAndReplace('a', 'b'), location).apply(node, 'value')

      assert.equal(node.value, 'bsdf')
    })

    it('should only work if location matches', function () {
      const node = {
        value: 'asdf'
      }

      new If('asdf', '', new SearchAndReplace('a', 'b'), locationAlt).apply(node, 'value')

      assert.equal(node.value, 'asdf')
      new If('asdf', '', new SearchAndReplace('a', 'b'), location).apply(node, 'value')

      assert.equal(node.value, 'bsdf')
    })

    it('should only work if css selector matches', function () {
      const node = {
        nodeType: 4,
        value: 'asdf',
        matches(x) {
          return x === '.b'
        }
      }

      new If('asdf', '.a', new SearchAndReplace('a', 'b'), location).apply(node, 'value')
      assert.equal(node.value, 'asdf')

      new If('asdf', '.b', new SearchAndReplace('a', 'b'), location).apply(node, 'value')
      assert.equal(node.value, 'bsdf')
    })

    it('should only work if location AND css selector matches', function () {
      const node = {
        nodeType: 4,
        value: 'asdf',
        matches(x) {
          return x === '.b'
        }
      }

      new If('asdf', '.a', new SearchAndReplace('a', 'b'), locationAlt).apply(node, 'value')
      assert.equal(node.value, 'asdf')

      new If('asdf', '.a', new SearchAndReplace('a', 'b'), location).apply(node, 'value')
      assert.equal(node.value, 'asdf')

      new If('asdf', '.b', new SearchAndReplace('a', 'b'), locationAlt).apply(node, 'value')
      assert.equal(node.value, 'asdf')

      new If('asdf', '.b', new SearchAndReplace('a', 'b'), location).apply(node, 'value')
      assert.equal(node.value, 'bsdf')
    })
  })
})

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
import Variable from '../../src/models/Variable'
import assert from 'assert'

describe('Variable', function () {
  describe('#bind', function () {
    it('should return a new variable with the given value', function () {
      const v = new Variable('a', 'default', 'description')
      const o = v.bind('new')
      assert.strictEqual(v.value, 'default')
      assert.strictEqual(o.value, 'new')
    })
    it('should return a new variable with the pre-existing value if value is not a string', function () {
      const v = new Variable('a', 'default', 'description')
      const w = v.bind({})
      assert.strictEqual(w.value, 'default')
    })
  })

  describe('#apply', function () {
    it('should replace its $name with its value', function () {
      const v = new Variable('name', 'value', 'description')
      assert.strictEqual('value', v.apply('$name'))
    })

    it('should not touch booleans', function () {
      const v = new Variable('name', 'value', 'description')
      assert.strictEqual(true, v.apply(true))
    })
  })

  describe('#id', function () {
    it('a variable can have an `owner`', function () {
      const v1 = new Variable('name', 'value', 'description')
      const v2 = new Variable('name', 'value', 'description', 'owner')
      assert.strictEqual(v1.id, 'name')
      assert.strictEqual(v2.id, 'owner::name')
    })
  })
})

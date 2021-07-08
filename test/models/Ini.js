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
import Ini from '../../src/models/Ini'
import chai from 'chai'

const assert = chai.assert

describe('Ini', function () {
  describe('#parse', function () {
    it('parses an ini file', function () {
      assert.deepEqual(new Ini('').parse(), [])
      assert.deepEqual(new Ini('a = b').parse(), { a: 'b' })
      assert.deepEqual(new Ini('a = b; inline comment').parse(), { a: 'b' })
      assert.deepEqual(new Ini('a = "; no comment"').parse(), { a: '; no comment' })
      assert.deepEqual(new Ini('a[] = b\ra[] = c').parse(), { a: ['b', 'c'] })
      assert.deepEqual(new Ini('a = b\r[section]\ra=b\r;comment\rx = y').parse(), { a: 'b', section: { a: 'b', x: 'y' } })
      assert.deepEqual(new Ini('a = b\r[section]\r[section.subsection]\ra=b\r;comment\rx = y').parse(), { a: 'b', section: { subsection: { a: 'b', x: 'y' } } })
    })

    it('allows = to be escaped', function () {
      assert.deepEqual(new Ini('a = b = c').parse(), { a: 'b = c' })
      assert.deepEqual(new Ini('a \\= b = c').parse(), { 'a ≠ b': 'c' })
    })
  })
})

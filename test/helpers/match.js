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
import assert from 'assert'
import match from '../../src/helpers/match'

describe('#match', function () {
  it('should match test for `test`', function () {
    assert(match('test', 'test'))
  })
  it('should match longtest for `*test`', function () {
    assert(match('longtest', '*test'))
  })
  it('should match testlong for `test*`', function () {
    assert(match('longtest', '*test'))
  })
  it('should match longtestlong for `*test*`', function () {
    assert(match('longtest', '*test'))
  })
  it('should not match test for `!test`', function () {
    assert.strictEqual(match('test', '!test'), false)
  })
  it('should not match longtest for `!*test`', function () {
    assert.strictEqual(match('longtest', '!*test'), false)
  })
  it('should not match longtestlong for `!*test*`', function () {
    assert.strictEqual(match('longtestlong', '!*test*'), false)
  })
  it('should match nottastnot for `!*test*`', function () {
    assert(match('nottastnot', '!*test*'))
  })
  it('should match testSometest for `test*test`', function () {
    assert(match('testSometest', 'test*test'))
  })

  it('should match http://www.example.com/this/is/a/wildcard/test for `http://*.example.com/this/*/a/wildcard/*`', function () {
    assert(match('http://www.example.com/this/is/a/wildcard/test', 'http://*.example.com/this/*/a/wildcard/*'))
  })

  it('should not match 12345 for `[0-9]*`', function () {
    assert(!match('12345', '[0-9]*'))
  })

  it('should not match 12345 for `[0-9]*`', function () {
    assert(!match('12345', '[0-9]*'))
  })

  it('should return false if original equals replacement', function () {
    assert.strictEqual(match('test', 'test', 'test'), false)
  })
  it('should a match a regex for !/regex/modifiers', function () {
    assert(match('a', '!/[a-z]/'), true)
    assert(match('aAaA', '!/[A]*/i'), true)
    assert(match('1a7', '!/\\d\\w7/i'), true)
  })
})

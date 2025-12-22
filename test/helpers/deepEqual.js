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
import { expect } from 'chai'
import { deepEqual } from '../../src/helpers/deepEqual'

describe('deepEqual', function () {
  describe('primitives', function () {
    it('should return true for identical primitives', function () {
      expect(deepEqual(1, 1)).to.be.true
      expect(deepEqual('hello', 'hello')).to.be.true
      expect(deepEqual(true, true)).to.be.true
      expect(deepEqual(null, null)).to.be.true
      expect(deepEqual(undefined, undefined)).to.be.true
    })

    it('should return false for different primitives', function () {
      expect(deepEqual(1, 2)).to.be.false
      expect(deepEqual('hello', 'world')).to.be.false
      expect(deepEqual(true, false)).to.be.false
      expect(deepEqual(null, undefined)).to.be.false
    })

    it('should handle NaN correctly', function () {
      expect(deepEqual(NaN, NaN)).to.be.true
      expect(deepEqual(NaN, 1)).to.be.false
    })
  })

  describe('arrays', function () {
    it('should return true for identical arrays', function () {
      expect(deepEqual([1, 2, 3], [1, 2, 3])).to.be.true
      expect(deepEqual([], [])).to.be.true
      expect(deepEqual(['a', 'b'], ['a', 'b'])).to.be.true
    })

    it('should return false for different arrays', function () {
      expect(deepEqual([1, 2, 3], [1, 2, 4])).to.be.false
      expect(deepEqual([1, 2], [1, 2, 3])).to.be.false
      expect(deepEqual([1, 2, 3], [1, 2])).to.be.false
    })

    it('should handle nested arrays', function () {
      expect(
        deepEqual(
          [
            [1, 2],
            [3, 4]
          ],
          [
            [1, 2],
            [3, 4]
          ]
        )
      ).to.be.true
      expect(
        deepEqual(
          [
            [1, 2],
            [3, 4]
          ],
          [
            [1, 2],
            [3, 5]
          ]
        )
      ).to.be.false
    })
  })

  describe('objects', function () {
    it('should return true for identical objects', function () {
      expect(deepEqual({ a: 1, b: 2 }, { a: 1, b: 2 })).to.be.true
      expect(deepEqual({}, {})).to.be.true
    })

    it('should return false for different objects', function () {
      expect(deepEqual({ a: 1 }, { a: 2 })).to.be.false
      expect(deepEqual({ a: 1 }, { b: 1 })).to.be.false
      expect(deepEqual({ a: 1 }, { a: 1, b: 2 })).to.be.false
    })

    it('should handle nested objects', function () {
      expect(deepEqual({ a: { b: 1 } }, { a: { b: 1 } })).to.be.true
      expect(deepEqual({ a: { b: 1 } }, { a: { b: 2 } })).to.be.false
    })

    it('should handle objects with arrays', function () {
      expect(deepEqual({ a: [1, 2] }, { a: [1, 2] })).to.be.true
      expect(deepEqual({ a: [1, 2] }, { a: [1, 3] })).to.be.false
    })
  })

  describe('mixed types', function () {
    it('should return false for different types', function () {
      expect(deepEqual([], {})).to.be.false
      expect(deepEqual({}, [])).to.be.false
      expect(deepEqual(1, '1')).to.be.false
      expect(deepEqual(null, {})).to.be.false
      expect(deepEqual({}, null)).to.be.false
    })
  })

  describe('log entry comparison (real use case)', function () {
    it('should compare log entries correctly', function () {
      const entry1 = { level: 'info', message: ['test'], tabId: 1 }
      const entry2 = { level: 'info', message: ['test'], tabId: 1 }
      const entry3 = { level: 'warn', message: ['test'], tabId: 1 }

      expect(deepEqual(entry1, entry2)).to.be.true
      expect(deepEqual(entry1, entry3)).to.be.false
    })

    it('should handle error objects in messages', function () {
      const entry1 = {
        level: 'error',
        message: [{ fromError: true, message: 'fail', name: 'Error', stack: 'line1' }]
      }
      const entry2 = {
        level: 'error',
        message: [{ fromError: true, message: 'fail', name: 'Error', stack: 'line1' }]
      }
      const entry3 = {
        level: 'error',
        message: [{ fromError: true, message: 'different', name: 'Error', stack: 'line1' }]
      }

      expect(deepEqual(entry1, entry2)).to.be.true
      expect(deepEqual(entry1, entry3)).to.be.false
    })
  })
})

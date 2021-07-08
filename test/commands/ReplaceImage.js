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
import ReplaceImage from '../../src/commands/ReplaceImage'

const assert = require('assert')

describe('ReplaceImage', function () {
  describe('#apply', function () {
    it('should leave target unchanged for empty pattern', function () {
      const img = {
        src: 'asdf'
      }
      new ReplaceImage('', '').apply(img, 'src')
      assert.equal(img.src, 'asdf')
    })

    it('should replace src with exact match', function () {
      const img = {
        src: 'http://cdn.example.com/images/test.png'
      }
      new ReplaceImage('http://cdn.example.com/images/test.png', 'another.png').apply(img, 'src')
      assert.equal(img.src, 'another.png')
    })

    it('should replace src with prefix match', function () {
      const img = {
        src: 'http://cdn.example.com/images/test.png'
      }
      new ReplaceImage('http://cdn.example.com/*', 'another.png').apply(img, 'src')
      assert.equal(img.src, 'another.png')
    })

    it('should replace src with suffix match', function () {
      const img = {
        src: 'http://cdn.example.com/images/test.png'
      }
      new ReplaceImage('*/test.png', 'another.png').apply(img, 'src')
      assert.equal(img.src, 'another.png')
    })

    it('should replace src with "contains" match', function () {
      const img = {
        src: 'http://cdn.example.com/images/test.png'
      }
      new ReplaceImage('*example.com*', 'another.png').apply(img, 'src')
      assert.equal(img.src, 'another.png')
    })

    it('should replace src with "not" match', function () {
      const img = {
        src: 'http://cdn.example.net/images/test.png'
      }
      new ReplaceImage('!http://cdn.example.net/images/test.png', 'another.png').apply(img, 'src')
      assert.equal(img.src, 'http://cdn.example.net/images/test.png')
      new ReplaceImage('!http://cdn.example.com/images/test.png', 'another.png').apply(img, 'src')
      assert.equal(img.src, 'another.png')
    })

    it('should replace src with "contains" and "not" match', function () {
      const img = {
        src: 'http://cdn.example.net/images/test.png'
      }
      new ReplaceImage('!*example.net*', 'another.png').apply(img, 'src')
      assert.equal(img.src, 'http://cdn.example.net/images/test.png')
      new ReplaceImage('!*example.com*', 'another.png').apply(img, 'src')
      assert.equal(img.src, 'another.png')
    })

    it('should leave target unchanged for a mismatch', function () {
      const img = {
        src: 'http://cdn.example.com/images/test.png'
      }
      new ReplaceImage('http://cdn.example.net/images/test.png', 'another.png').apply(img, 'src')
      assert.equal(img.src, 'http://cdn.example.com/images/test.png')

      new ReplaceImage('http://cdn.example.net/*', 'another.png').apply(img, 'src')
      assert.equal(img.src, 'http://cdn.example.com/images/test.png')

      new ReplaceImage('*/test.gif', 'another.png').apply(img, 'src')
      assert.equal(img.src, 'http://cdn.example.com/images/test.png')

      new ReplaceImage('*example.net*', 'another.png').apply(img, 'src')
      assert.equal(img.src, 'http://cdn.example.com/images/test.png')
    })
  })
})

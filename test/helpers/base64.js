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
import { base64Encode, base64Decode } from '../../src/helpers/base64'

describe('base64', function () {
  describe('#base64Encode', function () {
    it('should encode a simple ASCII string', function () {
      expect(base64Encode('hello')).to.equal('aGVsbG8=')
    })

    it('should encode an empty string', function () {
      expect(base64Encode('')).to.equal('')
    })

    it('should encode a string with special characters', function () {
      const encoded = base64Encode('hello world!')
      expect(base64Decode(encoded)).to.equal('hello world!')
    })

    it('should handle Unicode characters', function () {
      const input = 'Hello, 世界! 🌍'
      const encoded = base64Encode(input)
      expect(base64Decode(encoded)).to.equal(input)
    })
  })

  describe('#base64Decode', function () {
    it('should decode a simple ASCII string', function () {
      expect(base64Decode('aGVsbG8=')).to.equal('hello')
    })

    it('should decode an empty string', function () {
      expect(base64Decode('')).to.equal('')
    })

    it('should roundtrip encode/decode', function () {
      const original = 'The quick brown fox jumps over the lazy dog'
      expect(base64Decode(base64Encode(original))).to.equal(original)
    })
  })
})

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
import Json2Ini from '../../src/models/Json2Ini'
import assert from 'assert'

describe('Json2Ini', function () {
  describe('#parse', function () {
    it('should return an empty string for null or an empty object', function () {
      assert.strictEqual('', Json2Ini.parse('{}'))
      assert.strictEqual('', Json2Ini.parse('null'))
    })

    it('should return a = b for object {a:"b"}', function () {
      assert.strictEqual(Json2Ini.parse('{"a":"b"}'), 'a = b')
    })

    it('should return a = b for object {a:"b", x:"y"}', function () {
      assert.strictEqual(Json2Ini.parse('{"a":"b", "x":"y"}'), 'a = b\r\nx = y')
    })

    it('should support trailing commas', function () {
      assert.strictEqual(Json2Ini.parse('{"a":"b", "x":"y",}'), 'a = b\r\nx = y')
    })

    it('should support comments', function () {
      assert.strictEqual(Json2Ini.parse('{//test\r\n"a":"b",\r\nx:"y"}'), 'a = b\r\nx = y')
    })

    it('should return a = b for object {a:{x:"y"}}', function () {
      assert.strictEqual(Json2Ini.parse('{"a":{"x":"y"}}'), '[a]\r\nx = y')
    })
  })
})

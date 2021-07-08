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
import JSON5 from 'json5'

class Json2Ini {
  static parse(json) {
    function parseObject(obj) {
      let ini = ''
      for (const key in obj) {
        if (typeof obj[key] === 'object') {
          ini += '[' + key + ']\r\n' + parseObject(obj[key])
        } else {
          ini += key + ' = ' + obj[key] + '\r\n'
        }
      }
      return ini.replace(/^\s+|\s+$/g, '')
    }

    return parseObject(JSON5.parse(json))
  }
}

export default Json2Ini

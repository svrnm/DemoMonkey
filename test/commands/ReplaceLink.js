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
import ReplaceLink from '../../src/commands/ReplaceLink'

const assert = require('assert')

describe('ReplaceLink', function () {
  describe('#apply', function () {
    it('should leave target unchanged for empty pattern', function () {
      const link = {
        href: 'asdf'
      }
      new ReplaceLink('', '').apply(link, 'href')
      assert.equal(link.href, 'asdf')
    })

    it('should replace the link url if href equals the search pattern', function () {
      const link = {
        href: 'asdf'
      }
      new ReplaceLink('asdf', 'xyz').apply(link, 'href')
      assert.equal(link.href, 'xyz')
    })

    it('should leave the target unchanged if the pattern does not match the href exactly', function () {
      const link = {
        href: 'asdf'
      }
      new ReplaceLink('asdfa', 'xyz').apply(link, 'href')
      assert.equal(link.href, 'asdf')
    })
  })
})

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
import OverwriteHTML from '../../src/commands/OverwriteHTML'

const assert = require('assert')

describe('OverwriteHTML', function () {
  describe('#_addMarker', function () {
    it('adds a unique marker to the end of an html string', function () {
      const cmd = new OverwriteHTML()
      assert.equal(cmd._addMarker('test'), 'test<!-- ' + cmd.marker + ' -->')
    })
  })

  describe('#apply', function () {
    it('should leave target unchanged for location mismatch', function () {
      const document = {
        documentElement: {
          innerHTML: 'asdf'
        }
      }
      new OverwriteHTML('another', '', '', { toString: () => 'here' }).apply(document, 'documentElement')
      assert.equal(document.documentElement.innerHTML, 'asdf')
    })

    it('should not fail on null as target', function () {
      assert.equal(new OverwriteHTML('here', '', '', { toString: () => 'here' }).apply(null, 'documentElement'), false)
      assert.equal(new OverwriteHTML('here', '', '', { toString: () => 'here' }).apply({
        documentElement: null
      }, 'documentElement'), false)
    })

    it('should overwrite target innerHTML', function () {
      const document = {
        documentElement: {
          innerHTML: 'asdf'
        }
      }
      const cmd = new OverwriteHTML('here', '', 'xyz', { toString: () => 'here' })
      cmd.apply(document, 'documentElement')
      assert.equal(document.documentElement.innerHTML, cmd._addMarker('xyz'))
    })

    it('should overwrite innerHTML on selected sub-node', function () {
      const sub = { innerHTML: 'test' }
      const document = {
        documentElement: {
          querySelectorAll: function (query) {
            if (query === '.css') {
              return [sub]
            }
          },
          innerHTML: 'asdf'
        }
      }
      const cmd = new OverwriteHTML('here', '.css', 'xyz', { toString: () => 'here' })
      cmd.apply(document, 'documentElement')
      assert.equal(sub.innerHTML, cmd._addMarker('xyz'))
    })
  })
})

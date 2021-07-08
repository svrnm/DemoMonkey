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
import Hide from '../../src/commands/Hide'
import UndoElement from '../../src/commands/UndoElement'
import chai from 'chai'

const assert = chai.assert
const expect = chai.expect

const location = {
  href: '/folder',
  hash: '#hash'
}

describe('Hide', function () {
  describe('#apply', function () {
    it('hides a text node', function () {
      const node = {
        value: 'test',
        parentElement: {
          style: {
            display: 'block'
          },
          className: '',
          parentElement: {
            style: {
              display: 'block'
            },
            className: ''
          }
        }
      }
      expect(new Hide('test', 1, '', '', '', location).apply(node, 'value')).to.be.an.instanceof(UndoElement)
      assert.equal(node.parentElement.style.display, 'none')
      expect(new Hide('test', 2, '', '', '', location).apply(node, 'value')).to.be.an.instanceof(UndoElement)
      assert.equal(node.parentElement.parentElement.style.display, 'none')
    })

    it('hides a text node with "contains" match', function () {
      const node = {
        value: 'abctestabc',
        parentElement: {
          style: {
            display: 'block'
          },
          className: '',
          parentElement: {
            style: {
              display: 'block'
            },
            className: ''
          }
        }
      }
      expect(new Hide('*test*', 1, '', '', '', location).apply(node, 'value')).to.be.an.instanceof(UndoElement)
      assert.equal(node.parentElement.style.display, 'none')
      expect(new Hide('*test*', 2, '', '', '', location).apply(node, 'value')).to.be.an.instanceof(UndoElement)
      assert.equal(node.parentElement.parentElement.style.display, 'none')
    })

    it('hides a text node with "not" match', function () {
      const node = {
        value: 'abcnotabc',
        parentElement: {
          style: {
            display: 'block'
          },
          className: '',
          parentElement: {
            style: {
              display: 'block'
            },
            className: ''
          }
        }
      }
      assert.equal(new Hide('!*not*', 1, '', '', '', location).apply(node, 'value'), false)
      assert.equal(node.parentElement.style.display, 'block')
      expect(new Hide('!*test*', 1, '', '', '', location).apply(node, 'value')).to.be.an.instanceof(UndoElement)
      assert.equal(node.parentElement.style.display, 'none')
      expect(new Hide('!*test*', 2, '', '', '', location).apply(node, 'value')).to.be.an.instanceof(UndoElement)
      assert.equal(node.parentElement.parentElement.style.display, 'none')
    })

    it('hides a text node if filter applies', function () {
      const node = {
        value: 'test',
        parentElement: {
          style: {
            display: 'block'
          },
          className: 'one'
        }
      }
      expect(new Hide('test', 1, 'one', '', '', location).apply(node, 'value')).to.be.an.instanceof(UndoElement)
      assert.equal(node.parentElement.style.display, 'none')

      node.parentElement.style.display = 'block'

      assert.equal(new Hide('test', 1, 'two', '', '', location).apply(node, 'value'), false)
      assert.equal(node.parentElement.style.display, 'block')

      node.parentElement.style.display = 'block'

      expect(new Hide('test', 1, '', 'old', '', location).apply(node, 'value')).to.be.an.instanceof(UndoElement)
      assert.equal(node.parentElement.style.display, 'none')

      node.parentElement.style.display = 'block'

      expect(new Hide('test', 1, '', '', 'ash', location).apply(node, 'value')).to.be.an.instanceof(UndoElement)
      assert.equal(node.parentElement.style.display, 'none')

      node.parentElement.style.display = 'block'

      assert.equal(new Hide('test', 1, '', 'new', '', location).apply(node, 'value'), false)
      assert.equal(node.parentElement.style.display, 'block')

      assert.equal(new Hide('test', 1, '', '', 'ush', location).apply(node, 'value'), false)
      assert.equal(node.parentElement.style.display, 'block')
    })
  })
})

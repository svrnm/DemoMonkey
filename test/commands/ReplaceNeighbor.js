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
import ReplaceNeighbor from '../../src/commands/ReplaceNeighbor'
import UndoElement from '../../src/commands/UndoElement'
import chai from 'chai'

const assert = chai.assert
const expect = chai.expect

const location = {
  href: '/folder',
  hash: '#hash'
}

describe('ReplaceNeighbor', function () {
  describe('#apply', function () {
    it('replaces text on a neighbor node', function () {
      const innerNode = { nodeType: 3, data: '1' }
      const node = {
        value: 'Order-Processing-Services',
        parentElement: {
          parentElement: {
            parentElement: {
              parentElement: {
                querySelector: function (selector) {
                  if (selector === 'text.adsNodeCountText') {
                    return {
                      childNodes: [
                        innerNode
                      ]
                    }
                  }
                }
              }
            }
          }
        }
      }
      const cmd = new ReplaceNeighbor('Order-Processing-Services', '13', 4, 'text.adsNodeCountText', '', '', location)

      expect(cmd.apply(node, 'value')).to.be.an.instanceof(UndoElement)

      assert.equal(innerNode.data, '13')
    })
  })
})

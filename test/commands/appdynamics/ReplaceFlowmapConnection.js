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
import ReplaceFlowmapConnection from '../../../src/commands/appdynamics/ReplaceFlowmapConnection'

const assert = require('assert')

const element = {
  className: {
    baseVal: 'adsNormalNodeColor'
  }
}

global.document = {
  getElementById: function (id) {
    return {
      parentElement: {
        childNodes: [
          element
        ]
      }
    }
  }
}

const node = {
  data: 'Inventory-Service',
  parentElement: {
    parentElement: {
      parentElement: {
        className: {
          baseVal: 'topLevelGraphics'
        },
        querySelectorAll: function (string) {
          if (string === 'g.adsFlowMapNode') {
            return [
              {
                id: 'BACKEND116_b481',
                querySelector: function (string) {
                  return { innerHTML: '2 JDBC backends' }
                }
              },
              {
                id: 'APPLICATION_COMPONENT115',
                querySelector: function (string) {
                  return { innerHTML: 'Inventory-Service' }
                }
              },
              {
                id: 'APPLICATION_COMPONENT114',
                querySelector: function (string) {
                  return { innerHTML: 'ECommerce-Service' }
                }
              }
            ]
          }
        }
      }
    }
  }
}

describe('ReplaceFlowmapConnection', function () {
  describe('#apply', function () {
    it('ignores unknown replacements', function () {
      new ReplaceFlowmapConnection('Inventory-Service', 'ECommerce-Service', 'Green').apply(node, 'data')
      assert.equal(element.className.baseVal, 'adsNormalNodeColor')
    })
    it('replaces the icon of a tier on the flowmap', function () {
      new ReplaceFlowmapConnection('Inventory-Service', 'ECommerce-Service', 'Critical').apply(node, 'data')
      assert.equal(element.className.baseVal, 'adsCriticalNodeColor')
    })
    it('replaces the icon of a tier on the flowmap (case insensitive)', function () {
      new ReplaceFlowmapConnection('Inventory-Service', 'ECommerce-Service', 'warning').apply(node, 'data')
      assert.equal(element.className.baseVal, 'adsWarningNodeColor')
    })
  })
})

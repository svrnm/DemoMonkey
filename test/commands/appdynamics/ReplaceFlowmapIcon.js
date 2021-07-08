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
import ReplaceFlowmapIcon from '../../../src/commands/appdynamics/ReplaceFlowmapIcon'

const assert = require('assert')

const href = {
  baseVal: 'images/icon_nodetype_java_100x100.png'
}

const node = {
  data: 'Inventory-Service',
  parentElement: {
    parentElement: {
      querySelector: function (string) {
        if (string === 'image.adsFlowNodeTypeIcon, image.adsFlowMapBackendImage') {
          return {
            href: href
          }
        }
      }
    }
  }
}

describe('ReplaceFlowmapIcon', function () {
  describe('#apply', function () {
    it('replaces the icon of a tier on the flowmap', function () {
      new ReplaceFlowmapIcon('Inventory-Service', 'php').apply(node, 'data')
      assert.equal(href.baseVal, 'images/icon_nodetype_php_100x100.png')
    })

    it('replaces the icon of a tier on the flowmap and is case insensetive', function () {
      new ReplaceFlowmapIcon('Inventory-Service', 'PYTHON').apply(node, 'data')
      assert.equal(href.baseVal, 'images/icon_nodetype_python_100x100.png')
    })

    it('leaves the icon unchanged for an unknown replace pattern', function () {
      new ReplaceFlowmapIcon('Inventory-Service', 'images/icon_nodetype_ruby_100x100.png').apply(node, 'data')
      assert.equal(href.baseVal, 'images/icon_nodetype_ruby_100x100.png')
    })
  })
})

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
import RecolorDashboard from '../../../src/commands/appdynamics/RecolorDashboard'

const assert = require('assert')

const location = {
  toString() {
    return '&dashboard=1'
  }
}

let attr1 = { fill: 'green' }
let attr2 = { stroke: 'green' }
let attr3 = { backgroundColor: 'green' }

const node = {
  querySelectorAll(query) {
    if (query === 'ad-widget-timeseries-graph svg') {
      return [{
        querySelectorAll(query) {
          if (query.includes('path[fill')) {
            return [{
              attributes: attr1,
              setAttribute(attr, value) {
                this.attributes[attr] = value
              }
            }]
          }
          return []
        }
      }, {
        querySelectorAll(query) {
          if (query.includes('path[stroke')) {
            return [{
              attributes: attr2,
              setAttribute(attr, value) {
                this.attributes[attr] = value
              }
            }]
          }
          return []
        }
      }]
    }
    if (query === 'ad-widget-label') {
      return [{
        querySelector(query) {
          return { style: { color: '#ff0000' } }
        },
        parentElement: {
          style: attr3
        }
      }]
    }
    return []
  }
}

describe('RecolorDashboard', function () {
  describe('#apply', function () {
    it('changes the colors of a dashboard', function () {
      [['green', 'blue'], ['#008000', '#0000ff'], ['008000', '0000ff'], ['rgb(0,128,0)', 'rgb(0,0,255)'], ['nocolor', 'nocolor']].forEach(pair => {
        const [search, replace] = pair

        attr1 = { fill: 'green' }
        attr2 = { stroke: 'green' }
        attr3 = { backgroundColor: 'green' }

        const result = new RecolorDashboard(search, replace, '1', location).apply(node, 'data')

        if (result !== false) {
          assert.equal(result.length, 3)
          assert.equal(attr1.fill, 'rgb(0, 0, 255)')
          assert.equal(attr2.stroke, 'rgb(0, 0, 255)')
          assert.equal(attr3.backgroundColor, 'rgb(0, 0, 255)')
        } else {
          assert.equal(search, 'nocolor')
        }
      })
    })

    it('does not change the colors of a dashboard if dashboard id does not match', function () {
      attr1 = { fill: 'green' }
      attr2 = { stroke: 'green' }
      attr3 = { backgroundColor: 'green' }

      new RecolorDashboard('green', 'blue', '2', location).apply(node, 'data')

      assert.equal(new RecolorDashboard('green', 'blue', '2', location).apply(node, 'data'), false)

      assert.equal(attr1.fill, 'green')
      assert.equal(attr2.stroke, 'green')
      assert.equal(attr3.backgroundColor, 'green')
    })
  })
})

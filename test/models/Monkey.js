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
import Monkey from '../../src/models/Monkey'
import Configuration from '../../src/models/Configuration'

const assert = require('assert')

let intervalId = 0
let timeoutId = 0

const tspans = [
  { textContent: 'test this' },
  { textContent: 'tspans' }
]

const node = {
  data: 'monkey-demo',
  parentNode: {
    tagName: 'title',
    parentNode: {
      tagName: 'text'
    }
  }
}

const scope = {
  chrome: {
    runtime: {
      getManifest: function () {
        return {

        }
      }
    }
  },
  performance: {
    now: function () {
      return 0
    }
  },
  setInterval: function (callback, interval) {
    callback()
    return intervalId++
  },
  setTimeout: function (callback, timeout) {
    callback()
    return timeoutId++
  },
  clearInterval: function (id) {
    intervalId--
  },
  clearTimeout: function (id) {
    timeoutId--
  },
  location: {
    href: 'https://monkey-demo.appdynamics.com/controller'
  },
  document: {
    title: 'demomonkeydemo',
    querySelectorAll: function (selector) {
      if (selector === 'svg text title') {
        return [{
          parentElement: {
            textContent: '',
            querySelectorAll(selector) {
              if (selector === 'tspan') {
                return tspans
              }
              return []
            }
          }
        }]
      }
      return []
    },
    evaluate: function (xpath) {
      return {
        snapshotItem: function (i) {
          if (xpath === '//body//text()[ normalize-space(.) != ""]' && i === 0) {
            return node
          }
          return null
        }
      }
    }
  }
}

describe('Monkey', function () {
  describe('#run', function () {
    it('should return an interval id', function () {
      const monkey = new Monkey([], scope)
      assert.equal(0, monkey.run(new Configuration()))
      assert.equal(1, monkey.run(new Configuration()))
    })
  })

  describe('#apply', function () {
    it('should change the found text nodes', function () {
      const monkey = new Monkey([], scope)
      monkey.apply(new Configuration('monkey = ape'))
      assert.equal(node.data, 'ape-demo')
      assert.equal(scope.document.title, 'demoapedemo')
    })

    it('should change the found text on svg nodes with tspans', function () {
      const monkey = new Monkey([], scope)
      monkey.apply(new Configuration('test this tspans = this is a success'))
      assert.equal(tspans[0].textContent, 'this is')
      assert.equal(tspans[1].textContent, '...')
    })
  })

  describe('#runAll', function () {
    it('should return an array of interval ids', function () {
      intervalId = 0
      let monkey = new Monkey([{
        content: '@include = ',
        name: 'a',
        enabled: true
      }, {
        content: '@include = ',
        name: 'b',
        enabled: true
      }, {
        content: '@include = ',
        name: 'c',
        enabled: false
      }], scope)
      assert.deepEqual([
        0, 1
      ], monkey.runAll(''))

      // Check also for matching excludes and includes
      intervalId = 0
      monkey = new Monkey([{
        content: '@exclude = monkey-demo',
        name: 'a',
        enabled: true
      }, {
        content: '@include = monkey-demo',
        name: 'b',
        enabled: true
      }], scope)
      assert.deepEqual([0], monkey.runAll(''))
    })
  })
  describe('#stop', function () {
    it('should clear all running intervals', function () {
      intervalId = 0
      scope.document.title = 'demomonkeydemo'
      node.data = 'monkey-demo'
      const monkey = new Monkey([{
        content: '@include = ',
        name: 'a',
        enabled: true
      }, {
        content: '@include = ',
        name: 'b',
        enabled: true
      }], scope)
      monkey.start()
      assert.equal(2, intervalId)
      monkey.stop()
      assert.equal(0, intervalId)
    })
    it('should undo all replacements', function () {
      const monkey = new Monkey([{
        content: 'monkey = ape\n@include = ',
        name: 'a',
        enabled: true
      }], scope)

      monkey.start()
      assert.equal(node.data, 'ape-demo')
      assert.equal(scope.document.title, 'demoapedemo')

      monkey.stop()
      assert.equal(node.data, 'monkey-demo')
      assert.equal(scope.document.title, 'demomonkeydemo')
    })
    it('should not undo all replacements with undo disabled', function () {
      const monkey = new Monkey([{
        content: 'monkey = ape\n@include = ',
        name: 'a',
        enabled: true
      }], scope, [], false)

      monkey.start()
      assert.equal(node.data, 'ape-demo')
      assert.equal(scope.document.title, 'demoapedemo')

      monkey.stop()
      assert.equal(node.data, 'ape-demo')
      assert.equal(scope.document.title, 'demoapedemo')
    })
  })
})

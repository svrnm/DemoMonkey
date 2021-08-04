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
import assert from 'assert'
import { obj2dom, dom2obj } from '../../src/helpers/obj2dom'

describe('#obj2dom', function () {
  it('should convert primitives', function () {
    assert.strictEqual(obj2dom({}), '<div data-type="object"></div>')
    assert.strictEqual(obj2dom([]), '<div data-type="array"></div>')
    assert.strictEqual(obj2dom(''), '')
    assert.strictEqual(obj2dom(1), '1')
    assert.strictEqual(obj2dom(1.0), '1')
    assert.strictEqual(obj2dom(null), 'null')
    assert.strictEqual(obj2dom(false), 'false')
    assert.strictEqual(obj2dom(true), 'true')
    assert.strictEqual(obj2dom(undefined), 'undefined')
  })

  it('should convert arrays with children', function () {
    assert.strictEqual(obj2dom([1, 2, 3]), '<div data-type="array"><div data-key="0">1</div><div data-key="1">2</div><div data-key="2">3</div></div>')
  })

  it('should convert objects with children', function () {
    assert.strictEqual(obj2dom({ a: 1, b: 2, c: 3 }), '<div data-type="object"><div data-key="a">1</div><div data-key="b">2</div><div data-key="c">3</div></div>')
  })

  it('should convert complex structures', function () {
    assert.strictEqual(obj2dom({
      i: 'h',
      v: [],
      e: []
    }), '<div data-type="object"><div data-key="i">h</div><div data-key="v"><div data-type="array"></div></div><div data-key="e"><div data-type="array"></div></div></div>')

    assert.deepStrictEqual(obj2dom({
      a: {
        b: {
          c: {
            d: [
              {
                e: [
                  {
                    f: 'g'
                  }
                ]
              }
            ]
          }
        }
      }
    }), '<div data-type="object"><div data-key="a"><div data-type="object"><div data-key="b"><div data-type="object"><div data-key="c"><div data-type="object"><div data-key="d"><div data-type="array"><div data-key="0"><div data-type="object"><div data-key="e"><div data-type="array"><div data-key="0"><div data-type="object"><div data-key="f">g</div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div>')

    assert.strictEqual(obj2dom({
      a: [1, 2, 3],
      b: {
        x: {},
        y: {},
        z: false
      },
      c: [
        'u',
        'v',
        {
          w: 1
        }
      ]
    }), '<div data-type="object"><div data-key="a"><div data-type="array"><div data-key="0">1</div><div data-key="1">2</div><div data-key="2">3</div></div></div><div data-key="b"><div data-type="object"><div data-key="x"><div data-type="object"></div></div><div data-key="y"><div data-type="object"></div></div><div data-key="z">false</div></div></div><div data-key="c"><div data-type="array"><div data-key="0">u</div><div data-key="1">v</div><div data-key="2"><div data-type="object"><div data-key="w">1</div></div></div></div></div></div>')
  })
})

describe('#dom2obj', function () {
  it('should convert primitives', function () {
    assert.deepStrictEqual(dom2obj('<div data-type="object"></div>'), {})
    assert.deepStrictEqual(dom2obj('<div data-type="array"></div>'), [])
    assert.strictEqual(dom2obj(''), '')
    assert.strictEqual(dom2obj('1'), 1)
    assert.strictEqual(dom2obj('null'), null)
    assert.strictEqual(dom2obj('false'), false)
    assert.strictEqual(dom2obj('true'), true)
    assert.strictEqual(dom2obj('undefined'), undefined)
  })

  it('should convert arrays with children', function () {
    assert.deepStrictEqual(dom2obj('<div data-type="array"><div data-key="0">1</div><div data-key="1">2</div><div data-key="2">3</div></div>'), [1, 2, 3])
  })

  it('should convert objects with children', function () {
    assert.deepStrictEqual(dom2obj('<div data-type="object"><div data-key="a">1</div><div data-key="b">2</div><div data-key="c">3</div></div>'), { a: 1, b: 2, c: 3 })
  })

  it('should convert complex structures', function () {
    assert.deepStrictEqual(dom2obj('<div data-type="object"><div data-key="i">h</div><div data-key="v"><div data-type="array"></div></div><div data-key="e"><div data-type="array"></div></div></div>'), {
      i: 'h',
      v: [],
      e: []
    })

    assert.deepStrictEqual(dom2obj('<div data-type="object"><div data-key="a"><div data-type="object"><div data-key="b"><div data-type="object"><div data-key="c"><div data-type="object"><div data-key="d"><div data-type="array"><div data-key="0"><div data-type="object"><div data-key="e"><div data-type="array"><div data-key="0"><div data-type="object"><div data-key="f">g</div></div></div></div></div></div></div></div></div></div></div></div></div></div></div></div>'), {
      a: {
        b: {
          c: {
            d: [
              {
                e: [
                  {
                    f: 'g'
                  }
                ]
              }
            ]
          }
        }
      }
    })

    assert.deepStrictEqual(dom2obj('<div data-type="object"><div data-key="a"><div data-type="array"><div data-key="0">1</div><div data-key="1">2</div><div data-key="2">3</div></div></div><div data-key="b"><div data-type="object"><div data-key="x"><div data-type="object"></div></div><div data-key="y"><div data-type="object"></div></div><div data-key="z">false</div></div></div><div data-key="c"><div data-type="array"><div data-key="0">u</div><div data-key="1">v</div><div data-key="2"><div data-type="object"><div data-key="w">1</div></div></div></div></div></div>'), {
      a: [1, 2, 3],
      b: {
        x: {},
        y: {},
        z: false
      },
      c: [
        'u',
        'v',
        {
          w: 1
        }
      ]
    })
  })
})

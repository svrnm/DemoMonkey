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

/*
eslint-disable no-template-curly-in-string
*/

import Variable from '../../src/models/Variable'
import assert from 'assert'

describe('Variable', function () {
  describe('#bind', function () {
    it('should return a new variable with the given value', function () {
      const v = new Variable('a', 'default', 'description')
      const o = v.bind('new')
      assert.strictEqual(v.value, 'default')
      assert.strictEqual(o.value, 'new')
    })
    it('should return a new variable with the pre-existing value if value is not a string', function () {
      const v = new Variable('a', 'default', 'description')
      const w = v.bind({})
      assert.strictEqual(w.value, 'default')
    })
  })

  describe('#apply', function () {
    it('should replace its $name with its value', function () {
      const v = new Variable('name', 'value', 'description')
      assert.strictEqual('value', v.apply('$name'))
    })

    it('should not touch booleans', function () {
      const v = new Variable('name', 'value', 'description')
      assert.strictEqual(true, v.apply(true))
    })
  })

  describe('#id', function () {
    it('a variable can have an `owner`', function () {
      const v1 = new Variable('name', 'value', 'description')
      const v2 = new Variable('name', 'value', 'description', 'owner')
      assert.strictEqual(v1.id, 'name')
      assert.strictEqual(v2.id, 'owner::name')
    })
  })

  describe('#evaluateFunctions', function () {
    it('evaluate predefined functions in variables`', function () {
      // random
      assert.strictEqual(
        Variable.evaluateFunctions(
          Variable.evaluateFunctions(
            'My magic numbers are ${random.integer({min: 7, max: 7})} and ${random.integer({min: 17, max: 17})}'
          )
        ),
        'My magic numbers are 7 and 17'
      )
      assert.strictEqual(
        Variable.evaluateFunctions('${random.character({pool: "b"})}'),
        'b'
      )
      assert(
        ['false', 'null', 'undefined', '0', 'NaN', ''].includes(
          Variable.evaluateFunctions('${random.falsy()}')
        )
      )
      assert.strictEqual(
        Variable.evaluateFunctions(
          '${lots} of $variables and symb$ols} { ${random.character({pool: ")"})} ) } { } $'
        ),
        '${lots} of $variables and symb$ols} { ) ) } { } $'
      )
      // string
      assert.strictEqual(
        Variable.evaluateFunctions('${string.toUpperCase(b)}'),
        'B'
      )
      assert.strictEqual(
        Variable.evaluateFunctions(
          '${string.slice({string: "${string.headerCase(${string.toUpperCase(this is a test)})}", start: 0, stop: 10 })}'
        ),
        'This-Is-A-'
      )
    })
  })

  describe('#applyList', function () {
    it('should apply a set of variables recursively', function () {
      const variables = [
        new Variable('c', '${random.integer({min: $b, max: 37})}'),
        new Variable('b', '37'),
        new Variable('number', '$b'),
        new Variable('prefix', 'WWW', 'description'),
        new Variable('suffix', 'example', 'description'),
        new Variable('tld', 'com', 'description'),
        new Variable(
          'name',
          '${string.toLowerCase($prefix)}.$suffix',
          'description'
        ),
        new Variable('domain', '$name.$tld', 'description'),
        new Variable(
          'argument',
          '${string.camelCase(demo monkey test)}',
          'description'
        ),
        new Variable(
          'path',
          '${random.integer({min: $number, max: ${random.integer({min: $c, max: 37})} })}'
        )
      ]
      assert.strictEqual(
        Variable.applyList(variables, 'https://$domain/$path/?id=$argument'),
        'https://www.example.com/37/?id=demoMonkeyTest'
      )

      // Test for endless loop.
      assert.strictEqual(
        Variable.applyList([new Variable('loop', '$loop.')], '$loop.'),
        '$loop.........................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................................'
      )
    })
  })
})

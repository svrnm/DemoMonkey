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
      assert.strictEqual(Variable.evaluateFunctions('${random.character({pool: "b"})}'), 'b')
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
      assert.strictEqual(Variable.evaluateFunctions('${string.toUpperCase(b)}'), 'B')
      assert.strictEqual(
        Variable.evaluateFunctions(
          '${string.slice({string: "${string.headerCase(${string.toUpperCase(this is a test)})}", start: 0, stop: 10 })}'
        ),
        'This-Is-A-'
      )
    })

    it('should handle all string case transformation functions', function () {
      // toLowerCase
      assert.strictEqual(
        Variable.evaluateFunctions('${string.toLowerCase(HELLO WORLD)}'),
        'hello world'
      )

      // toUpperCase
      assert.strictEqual(
        Variable.evaluateFunctions('${string.toUpperCase(hello world)}'),
        'HELLO WORLD'
      )

      // camelCase
      assert.strictEqual(
        Variable.evaluateFunctions('${string.camelCase(hello world test)}'),
        'helloWorldTest'
      )

      // capitalCase
      assert.strictEqual(
        Variable.evaluateFunctions('${string.capitalCase(hello world)}'),
        'Hello World'
      )

      // constantCase
      assert.strictEqual(
        Variable.evaluateFunctions('${string.constantCase(hello world)}'),
        'HELLO_WORLD'
      )

      // dotCase
      assert.strictEqual(
        Variable.evaluateFunctions('${string.dotCase(hello world)}'),
        'hello.world'
      )

      // noCase
      assert.strictEqual(Variable.evaluateFunctions('${string.noCase(helloWorld)}'), 'hello world')

      // pascalCase
      assert.strictEqual(
        Variable.evaluateFunctions('${string.pascalCase(hello world)}'),
        'HelloWorld'
      )

      // pathCase
      assert.strictEqual(
        Variable.evaluateFunctions('${string.pathCase(hello world)}'),
        'hello/world'
      )

      // sentenceCase
      assert.strictEqual(
        Variable.evaluateFunctions('${string.sentenceCase(hello world)}'),
        'Hello world'
      )

      // snakeCase
      assert.strictEqual(
        Variable.evaluateFunctions('${string.snakeCase(hello world)}'),
        'hello_world'
      )
    })

    it('should handle paramCase and kebabCase (aliases)', function () {
      // paramCase (legacy name, maps to kebabCase)
      assert.strictEqual(
        Variable.evaluateFunctions('${string.paramCase(hello world)}'),
        'hello-world'
      )

      // kebabCase (new name)
      assert.strictEqual(
        Variable.evaluateFunctions('${string.kebabCase(hello world)}'),
        'hello-world'
      )
    })

    it('should handle headerCase and trainCase (aliases)', function () {
      // headerCase (legacy name, maps to trainCase)
      assert.strictEqual(
        Variable.evaluateFunctions('${string.headerCase(hello world)}'),
        'Hello-World'
      )

      // trainCase (new name)
      assert.strictEqual(
        Variable.evaluateFunctions('${string.trainCase(hello world)}'),
        'Hello-World'
      )
    })

    it('should handle string.length function', function () {
      assert.strictEqual(Variable.evaluateFunctions('${string.length(hello)}'), '5')
      assert.strictEqual(Variable.evaluateFunctions('${string.length()}'), '0')
      assert.strictEqual(Variable.evaluateFunctions('${string.length(hello world)}'), '11')
    })

    it('should handle string.slice function', function () {
      assert.strictEqual(
        Variable.evaluateFunctions('${string.slice({string: "hello world", start: 0, stop: 5})}'),
        'hello'
      )
      assert.strictEqual(
        Variable.evaluateFunctions('${string.slice({string: "hello world", start: 6, stop: 11})}'),
        'world'
      )
      assert.strictEqual(
        Variable.evaluateFunctions('${string.slice({string: "hello", start: 1})}'),
        'ello'
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
        new Variable('name', '${string.toLowerCase($prefix)}.$suffix', 'description'),
        new Variable('domain', '$name.$tld', 'description'),
        new Variable('argument', '${string.camelCase(demo monkey test)}', 'description'),
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

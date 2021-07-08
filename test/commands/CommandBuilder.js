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
import SearchAndReplace from '../../src/commands/SearchAndReplace'
import Hide from '../../src/commands/Hide'
import Group from '../../src/commands/Group'
import If from '../../src/commands/If'
import ReplaceFlowmapIcon from '../../src/commands/appdynamics/ReplaceFlowmapIcon'
import ReplaceNeighbor from '../../src/commands/ReplaceNeighbor'
import Command from '../../src/commands/Command'
import CommandBuilder from '../../src/commands/CommandBuilder'
import chai from 'chai'

const assert = chai.assert
const expect = chai.expect

describe('Command', function () {
  describe('#_extractForCustomCommand', function () {
    it('should return extracted: false for an empty input', function () {
      assert.deepEqual(new CommandBuilder()._extractForCustomCommand(''), ({ extracted: false }))
    })

    it('should return a command without namespace for a simple string', function () {
      assert.deepEqual(new CommandBuilder()._extractForCustomCommand('cmd'), ({
        extracted: true,
        command: 'cmd',
        namespace: '',
        parameters: []
      }))
    })

    it('should return a command with namespace for a string with a dot', function () {
      assert.deepEqual(new CommandBuilder()._extractForCustomCommand('ns.cmd'), ({
        extracted: true,
        command: 'cmd',
        namespace: 'ns',
        parameters: []
      }))
    })

    it('extracts the command from the string after the last dot', function () {
      assert.deepEqual(new CommandBuilder()._extractForCustomCommand('this.is.a.long.ns.cmd'), ({
        extracted: true,
        command: 'cmd',
        namespace: 'this.is.a.long.ns',
        parameters: []
      }))
    })

    it('extracts a command until the first open (', function () {
      assert.deepEqual(new CommandBuilder()._extractForCustomCommand('ns.cmd()'), ({
        extracted: true,
        command: 'cmd',
        namespace: 'ns',
        parameters: ['']
      }))
    })

    it('should return extracted: false for an command with no closing )', function () {
      assert.deepEqual(new CommandBuilder()._extractForCustomCommand('ns.cmd('), ({ extracted: false }))
    })

    it('extracts everything after the first ( as parameters', function () {
      assert.deepEqual(new CommandBuilder()._extractForCustomCommand('ns.cmd(asdf)'), ({
        extracted: true,
        command: 'cmd',
        namespace: 'ns',
        parameters: ['asdf']
      }))
    })

    it('supports quoting for the parameter', function () {
      assert.deepEqual(new CommandBuilder()._extractForCustomCommand('ns.cmd("asdf")'), ({
        extracted: true,
        command: 'cmd',
        namespace: 'ns',
        parameters: ['asdf']
      }))
    })

    it('extracts and , seperated parameter lists', function () {
      assert.deepEqual(new CommandBuilder()._extractForCustomCommand('ns.cmd(a,s,d,f)'), ({
        extracted: true,
        command: 'cmd',
        namespace: 'ns',
        parameters: ['a', 's', 'd', 'f']
      }))
      assert.deepEqual(new CommandBuilder()._extractForCustomCommand('ns.cmd(a, s,  d ,f)'), ({
        extracted: true,
        command: 'cmd',
        namespace: 'ns',
        parameters: ['a', 's', 'd', 'f']
      }))
    })

    it('supports quoting for parameter lists', function () {
      assert.deepEqual(new CommandBuilder()._extractForCustomCommand(
        'ns.cmd("a,\'s",\' "d \',f,  g, (h), "i\')'),
      ({
        extracted: true,
        command: 'cmd',
        namespace: 'ns',
        parameters: ['a,\'s', ' "d ', 'f', 'g', '(h)', '"i\'']
      }))
    })
  })
  describe('#build', function () {
    it('should create a SearchAndReplace for simple strings', function () {
      expect(new CommandBuilder().build('a', 'b')).to.be.an.instanceof(SearchAndReplace)
    })

    it('should create a SearchAndReplace for regular expression command', function () {
      const command = new CommandBuilder().build('!/a/', 'b')
      expect(command).to.be.an.instanceof(SearchAndReplace)
      expect(command.search).to.be.an.instanceof(RegExp)
    })

    it('should create a SearchAndReplace for regular expression command with standard modifier', function () {
      const command = new CommandBuilder().build('!/a/i', 'b')
      expect(command).to.be.an.instanceof(SearchAndReplace)
      expect(command.search).to.be.an.instanceof(RegExp)
    })

    it('should create an no-op Command for an invalid regular expression', function () {
      const command = new CommandBuilder().build('!/??/i', 'b')
      expect(command).to.be.an.instanceof(Command)
    })

    it('should create a SearchAndReplace for regular expression command with p modifier', function () {
      const command = new CommandBuilder().build('!/TestCase/ip', 'CaseTested')
      expect(command).to.be.an.instanceof(SearchAndReplace)
      expect(command.search).to.be.an.instanceof(RegExp)
      expect(command.replace).to.be.a('function')

      const n1 = {
        value: 'TestCase'
      }

      const n2 = {
        value: 'TESTCASE'
      }

      command.apply(n1, 'value')
      command.apply(n2, 'value')

      assert.equal(n1.value, 'CaseTested')
      assert.equal(n2.value, 'CASETESTED')
    })

    it('should create a SearchAndReplace for a quoted ! at position 0', function () {
      expect(new CommandBuilder().build('\\!a', 'b')).to.be.an.instanceof(SearchAndReplace)
    })

    it('should create a Hide command for !hide("ASDF")', function () {
      expect(new CommandBuilder().build('!hide("ASDF")')).to.be.an.instanceof(Hide)
    })

    it('should create a ReplaceFlowmapIcon command for !appdynamics.replaceFlowmapIcon(Inventory-Service)',
      function () {
        expect(new CommandBuilder().build('!appdynamics.replaceFlowmapIcon(Inventory-Service)', 'php.png')).to
          .be.an.instanceof(ReplaceFlowmapIcon)
      })

    it(
      'should create a ReplaceFlowmapIcon command for !replaceFlowmapIcon(Inventory-Service) and namespaces [appdynamics]',
      function () {
        expect(new CommandBuilder(['appdynamics']).build('!replaceFlowmapIcon(Inventory-Service)', 'php.png'))
          .to.be.an.instanceof(ReplaceFlowmapIcon)
      })

    it(
      'should create a Group command for !hideApplication("ASDF") and namespaces [appdynamics]',
      function () {
        expect(new CommandBuilder(['appdynamics']).build('!hideApplication("ASDF")'))
          .to.be.an.instanceof(Group)
      })

    it('should create a (effect-less) Command for an unknown command', function () {
      const command = new CommandBuilder().build('!unknown', 'b')
      expect(command).to.be.an.instanceof(Command)
    })

    it('should create a group of commands for !replaceFlowmapNode and namespaces [appdynamics]', function () {
      const command = new CommandBuilder(['appdynamics']).build('!replaceFlowmapNode(service1)', 'new-name,php,5,critical,critical')
      expect(command).to.be.an.instanceof(Group)
      expect(command.helpers[0]).to.be.an.instanceof(ReplaceFlowmapIcon)
      expect(command.helpers[1]).to.be.an.instanceof(Group)
      expect(command.helpers[2]).to.be.an.instanceof(ReplaceNeighbor)
      expect(command.helpers[3]).to.be.an.instanceof(ReplaceNeighbor)
      expect(command.helpers[4]).to.be.an.instanceof(SearchAndReplace)
    })

    it('should create an If command with child for !if', function () {
      const command = new CommandBuilder(['appdynamics']).build('!if(test, .test, !replaceFlowmapIcon(service1))', 'service2')
      expect(command).to.be.an.instanceof(If)
      expect(command.thenCmd).to.be.an.instanceof(ReplaceFlowmapIcon)
    })
  })
})

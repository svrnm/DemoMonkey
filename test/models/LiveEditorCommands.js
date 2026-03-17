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

import { expect } from 'chai'
import commands from '../../src/models/LiveEditorCommands'

function createMockEditor() {
  const logs = []
  const calls = {}

  const track =
    (name) =>
    (...args) => {
      if (!calls[name]) calls[name] = []
      calls[name].push(args)
    }

  return {
    log: (...args) => {
      logs.push(args)
      track('log')(...args)
    },
    clearOutput: track('clearOutput'),
    close: track('close'),
    getStats: () => ({
      lastRuntime: 1.5,
      avgRunTime: 2.0,
      maxRunTime: 3.0,
      runCount: 10,
      undoLength: 5,
      inspected: 'text: 3'
    }),
    getConfigs: () => [
      { id: 'cfg-1', name: 'Demo Config', enabled: true },
      { id: 'cfg-2', name: 'Other Config', enabled: false }
    ],
    getSelectedConfigId: () => 'cfg-1',
    selectConfig: track('selectConfig'),
    toggleConfig: track('toggleConfig'),
    _createNewConfig: track('_createNewConfig'),
    setInput: track('setInput'),
    scope: {
      document: { dispatchEvent: track('dispatchEvent') },
      location: { href: 'https://example.com' }
    },
    host: {},
    picker: null,
    _logs: logs,
    _calls: calls
  }
}

describe('LiveEditorCommands', function () {
  const expectedCommands = [
    '/exit',
    '/help',
    '/clear',
    '/pick',
    '/new',
    '/switch',
    '/enable',
    '/disable',
    '/stats'
  ]

  it('should have all expected commands', function () {
    expectedCommands.forEach((name) => {
      expect(commands).to.have.property(name)
      expect(commands[name]).to.have.property('description').that.is.a('string')
      expect(commands[name]).to.have.property('handler').that.is.a('function')
    })
  })

  it('should not have unexpected commands', function () {
    Object.keys(commands).forEach((name) => {
      expect(expectedCommands).to.include(name)
    })
  })

  describe('/help', function () {
    it('should call editor.log multiple times', function () {
      const editor = createMockEditor()
      commands['/help'].handler(editor)
      expect(editor._logs.length).to.be.greaterThan(1)
    })

    it('should mention available commands in output', function () {
      const editor = createMockEditor()
      commands['/help'].handler(editor)
      const allOutput = editor._logs.map((args) => args.join(' ')).join('\n')
      expect(allOutput).to.include('Available commands')
    })
  })

  describe('/clear', function () {
    it('should call editor.clearOutput()', function () {
      const editor = createMockEditor()
      commands['/clear'].handler(editor)
      expect(editor._calls.clearOutput).to.have.lengthOf(1)
    })
  })

  describe('/exit', function () {
    it('should call editor.close()', function () {
      const editor = createMockEditor()
      commands['/exit'].handler(editor)
      expect(editor._calls.close).to.have.lengthOf(1)
    })
  })

  describe('/stats', function () {
    it('should log stats from editor.getStats()', function () {
      const editor = createMockEditor()
      commands['/stats'].handler(editor)
      const allOutput = editor._logs.map((args) => args.join(' ')).join('\n')
      expect(allOutput).to.include('1.5')
      expect(allOutput).to.include('2')
      expect(allOutput).to.include('3')
      expect(allOutput).to.include('10')
      expect(allOutput).to.include('5')
      expect(allOutput).to.include('text: 3')
    })
  })

  describe('/switch', function () {
    it('should have acceptsConfigArg set to true', function () {
      expect(commands['/switch'].acceptsConfigArg).to.be.true
    })

    it('should list configs when called without args', function () {
      const editor = createMockEditor()
      commands['/switch'].handler(editor, '')
      const allOutput = editor._logs.map((args) => args.join(' ')).join('\n')
      expect(allOutput).to.include('Demo Config')
      expect(allOutput).to.include('Other Config')
    })

    it('should call editor.selectConfig(id) when a matching name is given', function () {
      const editor = createMockEditor()
      commands['/switch'].handler(editor, 'Demo Config')
      expect(editor._calls.selectConfig).to.have.lengthOf(1)
      expect(editor._calls.selectConfig[0][0]).to.equal('cfg-1')
    })
  })

  describe('/enable', function () {
    it('should have acceptsConfigArg set to true', function () {
      expect(commands['/enable'].acceptsConfigArg).to.be.true
    })

    it('should call editor.toggleConfig(id, true) for a disabled config', function () {
      const editor = createMockEditor()
      commands['/enable'].handler(editor, 'Other Config')
      expect(editor._calls.toggleConfig).to.have.lengthOf(1)
      expect(editor._calls.toggleConfig[0][0]).to.equal('cfg-2')
      expect(editor._calls.toggleConfig[0][1]).to.equal(true)
    })
  })

  describe('/disable', function () {
    it('should have acceptsConfigArg set to true', function () {
      expect(commands['/disable'].acceptsConfigArg).to.be.true
    })

    it('should call editor.toggleConfig(id, false) for an enabled config', function () {
      const editor = createMockEditor()
      commands['/disable'].handler(editor, 'Demo Config')
      expect(editor._calls.toggleConfig).to.have.lengthOf(1)
      expect(editor._calls.toggleConfig[0][0]).to.equal('cfg-1')
      expect(editor._calls.toggleConfig[0][1]).to.equal(false)
    })
  })

  describe('acceptsConfigArg property', function () {
    const commandsWithConfigArg = ['/switch', '/enable', '/disable']
    const commandsWithoutConfigArg = ['/exit', '/help', '/clear', '/pick', '/new', '/stats']

    commandsWithConfigArg.forEach((name) => {
      it(`${name} should have acceptsConfigArg: true`, function () {
        expect(commands[name].acceptsConfigArg).to.be.true
      })
    })

    commandsWithoutConfigArg.forEach((name) => {
      it(`${name} should not have acceptsConfigArg: true`, function () {
        expect(commands[name].acceptsConfigArg).to.not.equal(true)
      })
    })
  })
})

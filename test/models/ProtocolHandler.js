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
import ProtocolHandler from '../../src/models/ProtocolHandler'
import { expect } from 'chai'

describe('ProtocolHandler', function () {
  let handler
  let originalFetch

  beforeEach(function () {
    handler = new ProtocolHandler('web+mnky:')
    originalFetch = globalThis.fetch
  })

  afterEach(function () {
    globalThis.fetch = originalFetch
  })

  describe('#handle', function () {
    it('should resolve false when no search parameter is provided', async function () {
      const result = await handler.handle('')
      expect(result).to.equal(false)
    })

    it('should resolve false when search parameter is missing', async function () {
      const result = await handler.handle('?foo=bar')
      expect(result).to.equal(false)
    })

    it('should reject when URL protocol does not match', async function () {
      try {
        await handler.handle('?s=https://example.com/config.mnky')
        expect.fail('should have rejected')
      } catch (error) {
        expect(error.message).to.include('does not start with expected protocol')
      }
    })

    it('should fetch and return configuration for a default URL', async function () {
      globalThis.fetch = async (url) => ({
        ok: true,
        status: 200,
        text: async () => '@include[] = /example.com/\nfoo = bar'
      })

      const result = await handler.handle('?s=web%2Bmnky%3A//example.com/config.mnky')
      expect(result).to.have.property('content', '@include[] = /example.com/\nfoo = bar')
      expect(result).to.have.property('id', 'new')
      expect(result).to.have.property('enabled', false)
      expect(result.name).to.include('Shared/')
    })

    it('should use author name in config name when @author is present', async function () {
      globalThis.fetch = async (url) => ({
        ok: true,
        status: 200,
        text: async () => '@author = John Doe\nfoo = bar'
      })

      const result = await handler.handle('?s=web%2Bmnky%3A//example.com/config.mnky')
      expect(result.name).to.equal('Shared/from John Doe')
    })

    it('should handle gist URLs by following redirect', async function () {
      globalThis.fetch = async (url) => {
        const parsed = new URL(url)
        if (parsed.hostname === 'gist.github.com' && !parsed.pathname.endsWith('/raw')) {
          return {
            ok: true,
            status: 200,
            url: 'https://gist.github.com/abc123',
            text: async () => '<html>gist page</html>'
          }
        }
        if (parsed.hostname === 'gist.github.com' && parsed.pathname.endsWith('/raw')) {
          return {
            ok: true,
            status: 200,
            text: async () => 'gist content here'
          }
        }
        throw new Error('unexpected URL: ' + url)
      }

      const result = await handler.handle('?s=web%2Bmnky%3A//gist/abc123')
      expect(result).to.have.property('content', 'gist content here')
      expect(result.name).to.equal('Shared/abc123')
    })

    it('should reject when fetch fails for a default URL', async function () {
      globalThis.fetch = async () => {
        throw new Error('network error')
      }

      try {
        await handler.handle('?s=web%2Bmnky%3A//example.com/config.mnky')
        expect.fail('should have rejected')
      } catch (error) {
        expect(error.message).to.include('Could not handle')
        expect(error.message).to.include('network error')
      }
    })

    it('should reject when fetch fails for a gist URL', async function () {
      globalThis.fetch = async () => {
        throw new Error('network error')
      }

      try {
        await handler.handle('?s=web%2Bmnky%3A//gist/abc123')
        expect.fail('should have rejected')
      } catch (error) {
        expect(error.message).to.include('Could not handle')
        expect(error.message).to.include('network error')
      }
    })

    it('should not resolve with a configuration when default URL returns non-ok response', async function () {
      globalThis.fetch = async () => ({
        ok: false,
        status: 404,
        text: async () => 'not found'
      })

      const result = await Promise.race([
        handler.handle('?s=web%2Bmnky%3A//example.com/config.mnky'),
        new Promise((resolve) => setTimeout(() => resolve('timeout'), 50))
      ])
      // The promise never settles when response is not ok — it neither resolves nor rejects
      expect(result).to.equal('timeout')
    })
  })

  describe('#_buildConfiguration', function () {
    it('should return a configuration object with the given name and content', function () {
      const result = handler._buildConfiguration('Test', 'foo = bar')
      expect(result).to.deep.equal({
        name: 'Test',
        id: 'new',
        enabled: false,
        content: 'foo = bar'
      })
    })

    it('should extract author from content', function () {
      const result = handler._buildConfiguration('Test', '@author = Jane Smith\nfoo = bar')
      expect(result.name).to.equal('Shared/from Jane Smith')
    })

    it('should extract author from array-style option', function () {
      const result = handler._buildConfiguration('Test', '@author[] = Jane Smith\nfoo = bar')
      expect(result.name).to.equal('Shared/from Jane Smith')
    })
  })
})

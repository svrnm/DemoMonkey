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
import chai from 'chai'
import base from './base'

const expect = chai.expect

describe('Integration (Simple)', function () {
  const url = 'https://github.com/svrnm/demomonkey'

  before('Start Webdriver', base.start)
  after('Quit Webdriver', base.quit)

  describe('Un-tampered webpage', function () {
    this.timeout(10000)
    it('github page of this project has demomonkey in its title', async function () {
      await base.getDriver().get(url)
      const title = await base.getDriver().getTitle()
      expect(title).to.include.string('DemoMonkey')
    })
  })

  describe('tampered webpage', function () {
    this.timeout(10000)
    this.retries(4)
    // Autocomplete & editing the editor via automation does not work
    it('will disable autoComplete', function () {
      return base.disableOptionalFeature('editorAutocomplete')
    })
    it('allows to create new configurations', function () {
      return base.createConfig('testape', 'DemoMonkey = testape\n@include = /.*/\n')
    })
    it('has toggle buttons on the popup menu', function () {
      return base.enableConfig('testape')
    })
    it('github page of this project will have testape in its title', async function () {
      await base.getDriver().get(url)
      await base.getDriver().sleep(1000)
      const title = await base.getDriver().getTitle()
      expect(title).to.include.string('testape')
    })
  })
})

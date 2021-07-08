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
import selenium from 'selenium-webdriver'
import chai from 'chai'
import base from './base'

const expect = chai.expect
const By = selenium.By
const until = selenium.until

describe('Integration', function () {
  before('Start Webdriver', base.start)
  after('Quit Webdriver', base.quit)

  this.timeout(20000)
  this.retries(4)

  describe('test page', function () {
    // Autocomplete & editing the editor via automation does not work
    it('will disable autoComplete', async function () {
      await base.getDriver().sleep(500)
      return base.disableOptionalFeature('editorAutocomplete')
    })

    it('will create a test configurations', async function () {
      await base.getDriver().sleep(500)
      await base.createConfig('GermanCities', 'San Francisco = Berlin\nSeattle = Köln')
      await base.createConfig('Test Config', '+GermanCities\n@include = /.*/\n!replaceUrl(*demomonkey*) = https://github.com/Appdynamics/api-commandline-tool')
      await base.createConfig('AppDynamics Config', '@textAttributes[] = data-label,data-another\n@include = /.*/\n@namespace[] = appdynamics\n!replaceFlowmapIcon(ECommerce-Services) = php\nECommerce = Selenium')
    })

    it('will enable the test configurations', async function () {
      await base.enableConfig('Test Config')
      await base.enableConfig('AppDynamics Config')
    })

    it('will enable webRequestHook', async function () {
      await base.enableOptionalFeature('webRequestHook')
    })

    it('will modify the test page', async function () {
      const driver = base.getDriver()
      await driver.get(base.testUrl)
      await driver.findElement(By.id('input')).sendKeys('San Francisco')
      await driver.wait(until.elementsLocated(By.id('later')))
      await driver.wait(until.elementsLocated(By.css('#APPLICATION_COMPONENT108_3f47 image.adsFlowNodeTypeIcon')))
      await base.getDriver().sleep(2000)
      expect(await driver.findElement(By.id('static')).getText()).to.include('Berlin')
      expect(await driver.findElement(By.id('later')).getText()).to.include('Köln')
      expect(await driver.findElement(By.id('ajax')).getText()).to.include('Command Line Tool')
      expect(await driver.findElement(By.css('#APPLICATION_COMPONENT108_3f47 image.adsFlowNodeTypeIcon')).getAttribute('xlink:href')).to.include('images/icon_nodetype_php_100x100.png')
      expect(await driver.findElement(By.css('#APPLICATION_COMPONENT108_3f47 > g.adsFlowMapTextContainer > text > tspan.adsFlowMapTextFace')).getText()).to.include('Selenium')
      // expect(driver.findElement(By.css('[data-label]')).getAttribute('data-label')).to.eventually.include('Berlin')
    })
  })
})

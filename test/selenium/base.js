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
import chrome from 'selenium-webdriver/chrome'
import chai from 'chai'
import fs from 'fs'

// const extensionID = 'hgegamnnggfbjfpjjalciinpfoghjcnj'
const extensionID = 'jppkhbnbdfkchpfplppanilmladmdfbf'

const assert = chai.assert
const expect = chai.expect
const By = selenium.By
const until = selenium.until
let driver

const Base = {
  dashboardUrl: 'chrome-extension://' + extensionID + '/options.html',
  popupUrl: 'chrome-extension://' + extensionID + '/popup.html',
  testUrl: 'chrome-extension://' + extensionID + '/test.html',
  getDriver: function () {
    return driver
  },
  start: function (done) {
    this.timeout(10000)
    const options = new chrome.Options()

    // The following is a hack to grant permissions in a testing environment
    // I didn't find a proper way to allow those permissions.
    const rawManifest = fs.readFileSync('./build/manifest.json', 'utf8')
    const manifest = JSON.parse(rawManifest)
    manifest.permissions.push('<all_urls>')
    manifest.permissions.push('webRequest')
    fs.writeFileSync('./build/manifest.json', JSON.stringify(manifest))

    options.addArguments('--load-extension=./build')

    driver = new selenium.Builder().forBrowser('chrome').setChromeOptions(options).build()
    driver.getWindowHandle().then(function () {
      // Revert the manifest file, important!
      fs.writeFileSync('./build/manifest.json', rawManifest)
      done()
    })
  },
  quit: function () {
    return driver.quit()
  },
  enableConfig: async function (title = 'Selenium Test') {
    const button = By.xpath('//*[contains(text(), "' + title + '")]/../preceding-sibling::div')
    const status = By.xpath('//*[contains(text(), "' + title + '")]/../preceding-sibling::div/input')
    await driver.get(this.popupUrl)
    await driver.wait(until.elementsLocated(By.className('toggle-group')))
    const currentStatus = await driver.findElement(status).getAttribute('value')
    if (currentStatus === 'false') {
      await driver.findElement(button).click()
    }
    const result = await driver.findElement(status).getAttribute('value')
    assert.equal(result, 'true')
  },
  enableOptionalFeature: async function (title = 'webRequestHook') {
    await driver.get(this.dashboardUrl)
    await driver.wait(until.elementsLocated(By.css("a[href='#settings']")))
    await driver.findElement(By.css("a[href='#settings']")).click()
    await driver.wait(until.elementsLocated(By.className('toggle-group')))
    const button = By.css(`#toggle-${title} > div`)
    const status = By.css(`#toggle-${title} > div > input`)
    await driver.findElement(button).click()
    const text = await driver.findElement(status).getAttribute('value')
    assert.equal(text, 'true')
  },
  disableOptionalFeature: async function (title = 'webRequestHook') {
    await driver.get(this.dashboardUrl)
    await driver.wait(until.elementsLocated(By.css("a[href='#settings']")))
    await driver.findElement(By.css("a[href='#settings']")).click()
    await driver.wait(until.elementsLocated(By.className('toggle-group')))
    const button = By.css(`#toggle-${title} > div`)
    const status = By.css(`#toggle-${title} > div > input`)
    await driver.findElement(button).click()
    const text = await driver.findElement(status).getAttribute('value')
    assert.equal(text, 'false')
  },
  createConfig: async function (title = 'Selenium Test', content = 'demomonkey = testape') {
    await driver.get(this.dashboardUrl)
    await driver.findElement(By.css("a[href='#configuration/new']")).click()
    await driver.findElement(By.id('configuration-title')).sendKeys(title)
    await driver.findElement(By.css('li#current-configuration-editor a')).click()
    const currentContent = await driver.findElement(By.id('contentarea')).getText()
    await driver.findElement(By.css('#contentarea > textarea')).sendKeys(new Array(currentContent.length + 1).join('\b'))
    // Slow down the input, since sometimes not all chars are send
    await driver.findElement(By.css('#contentarea > textarea')).sendKeys(';;;;\n')
    await driver.findElement(By.css('#contentarea > textarea')).sendKeys(content)
    await driver.findElement(By.css('#contentarea > textarea')).sendKeys('\n;;;;')
    await driver.findElement(By.className('save-button')).click()
    const testTitle = await driver.findElement(By.css('.navigation .items')).getText()
    expect(testTitle).to.have.string(title)
    const testContent = await driver.findElement(By.id('contentarea')).getText()
    expect(testContent).to.have.string(content)
  }
}

export default Base

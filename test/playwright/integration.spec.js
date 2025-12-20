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
import { test, expect } from './fixtures.js'

test.describe('Integration', () => {
  test.describe('test page', () => {
    test('will modify the test page', async ({ context, extensionPage }) => {
      const page = await context.newPage()

      // Disable autoComplete first (autocomplete interferes with automation)
      await extensionPage.disableOptionalFeature(page, 'editorAutocomplete')

      // Create test configurations
      await extensionPage.createConfig(page, 'GermanCities', 'San Francisco = Berlin\nSeattle = Köln')
      await extensionPage.createConfig(
        page,
        'Test Config',
        '+GermanCities\n@include = /.*/\n!replaceUrl(*demomonkey*) = https://github.com/Appdynamics/api-commandline-tool'
      )
      await extensionPage.createConfig(
        page,
        'AppDynamics Config',
        '@textAttributes[] = data-label,data-another\n@include = /.*/\n@namespace[] = appdynamics\n!replaceFlowmapIcon(ECommerce-Services) = php\nECommerce = Selenium'
      )

      // Enable the test configurations
      await extensionPage.enableConfig(page, 'Test Config')
      await extensionPage.enableConfig(page, 'AppDynamics Config')

      // Enable webRequestHook
      await extensionPage.enableOptionalFeature(page, 'webRequestHook')

      // Wait for the webRequestHook to be fully initialized
      await page.waitForTimeout(1000)

      // Navigate to test page first to let the extension set up the rules
      await extensionPage.gotoTestPage(page)

      // Wait for the monkey content script to fully initialize and set up URL rules
      await page.waitForTimeout(1000)

      // Hard reload the page using the browser's reload button behavior
      // This is more reliable than page.reload() for triggering the URL interception
      await page.evaluate(() => window.location.reload())
      await page.waitForLoadState('domcontentloaded')

      // Wait for the AJAX content to load with the intercepted URL
      await page.waitForTimeout(2000)

      await page.fill('#input', 'San Francisco')

      // Wait for dynamic elements
      await page.waitForSelector('#later')
      await page.waitForSelector('#APPLICATION_COMPONENT108_3f47 image.adsFlowNodeTypeIcon')

      // Give some time for all replacements to apply (especially AJAX)
      await page.waitForTimeout(3000)

      // Verify replacements
      await expect(page.locator('#static')).toContainText('Berlin')
      await expect(page.locator('#later')).toContainText('Köln')
      await expect(page.locator('#ajax')).toContainText('Command Line Tool', { timeout: 10000 })
      await expect(
        page.locator(
          '#APPLICATION_COMPONENT108_3f47 > g.adsFlowMapTextContainer > text > tspan.adsFlowMapTextFace'
        )
      ).toContainText('Selenium')
    })
  })
})

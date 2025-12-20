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

const GITHUB_URL = 'https://github.com/svrnm/demomonkey'

test.describe('Integration (Simple)', () => {
  test.describe('Un-tampered webpage', () => {
    test('github page of this project has demomonkey in its title', async ({ context }) => {
      const page = await context.newPage()
      await page.goto(GITHUB_URL)
      await expect(page).toHaveTitle(/DemoMonkey/)
    })
  })

  test.describe('tampered webpage', () => {
    test('github page of this project will have testape in its title', async ({
      context,
      extensionPage
    }) => {
      const page = await context.newPage()

      // Disable autoComplete first
      await extensionPage.disableOptionalFeature(page, 'editorAutocomplete')

      // Create and enable the test configuration
      await extensionPage.createConfig(page, 'testape', 'DemoMonkey = testape\n@include = /.*/\n')
      await extensionPage.enableConfig(page, 'testape')

      // Visit the GitHub page and verify the title is modified
      await page.goto(GITHUB_URL)
      await page.waitForTimeout(1000) // Wait for extension to apply changes
      await expect(page).toHaveTitle(/testape/)
    })
  })
})

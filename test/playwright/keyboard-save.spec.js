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

test.describe('Keyboard Save', () => {
  test('Ctrl+S saves configuration changes', async ({ context, extensionPage }) => {
    const page = await context.newPage()

    // Create a config to work with
    await extensionPage.createConfig(page, 'Keyboard Save Test', 'foo = bar')

    // Click on the config in navigation to open it in the editor
    await page.locator('.navigation .items').getByText('Keyboard Save Test').click()

    // Click the editor tab
    await page.click('li#current-configuration-editor a')
    await page.waitForSelector('#contentarea', { timeout: 5000 })
    await page.waitForTimeout(500)

    // Modify the content via ACE editor
    await page.evaluate(() => {
      if (window.editor) {
        window.editor.setValue(';;;;\nfoo = baz\n;;;;', 1)
      }
    })
    await page.waitForTimeout(200)

    // The save button should indicate unsaved changes
    const saveButton = page.locator('.save-button')
    await expect(saveButton).not.toHaveClass(/disabled/)

    // Press Ctrl+S to save
    await page.keyboard.press('Control+s')
    await page.waitForTimeout(500)

    // After saving, the save button should be disabled (no unsaved changes)
    await expect(saveButton).toHaveClass(/disabled/)

    // Navigate away and back to confirm the change persisted
    await page.locator('.navigation .items').getByText('Example').click()
    await page.waitForTimeout(300)
    await page.locator('.navigation .items').getByText('Keyboard Save Test').click()
    await page.waitForTimeout(300)

    // Click the editor tab
    await page.click('li#current-configuration-editor a')
    await page.waitForSelector('#contentarea', { timeout: 5000 })
    await page.waitForTimeout(500)

    // Verify the content was saved
    const content = await page.evaluate(() => {
      if (window.editor) {
        return window.editor.getValue()
      }
      return null
    })

    expect(content).toContain('foo = baz')
  })
})

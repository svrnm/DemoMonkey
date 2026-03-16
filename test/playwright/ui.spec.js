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

test.describe('UI', () => {
  test('has a dashboard', async ({ context, extensionPage }) => {
    const page = await context.newPage()
    await extensionPage.gotoDashboard(page)
    await expect(page).toHaveTitle('Demo Monkey Dashboard')
  })

  test('has a popup menu', async ({ context, extensionPage }) => {
    const page = await context.newPage()
    await extensionPage.gotoPopup(page)
    const dataApp = await page.locator('#app').getAttribute('data-app')
    expect(dataApp).toBe('PopupPageApp')
  })

  test('allows to create new configurations', async ({ context, extensionPage }) => {
    const page = await context.newPage()
    await extensionPage.createConfig(
      page,
      'Playwright Test',
      'demomonkey = testape\n@include = /.*/'
    )
  })

  test('allows to enable configurations', async ({ context, extensionPage }) => {
    const page = await context.newPage()
    // First create a config
    await extensionPage.createConfig(page, 'Enable Test', 'demomonkey = testape\n@include = /.*/')
    // Then enable it
    await extensionPage.enableConfig(page, 'Enable Test')
  })

  test('can delete configurations', async ({ context, extensionPage }) => {
    const page = await context.newPage()
    await extensionPage.gotoDashboard(page)

    // Click on Example configuration in the navigation
    await page.locator('.navigation .items').getByText('Example').click()

    // Wait for and click delete button in the editor toolbar (MUI Button)
    await page.locator('.current-view').getByRole('button', { name: 'Delete' }).waitFor()
    await page.locator('.current-view').getByRole('button', { name: 'Delete' }).click()

    // Confirm deletion
    await page.waitForSelector('#alert-dialog-confirm-button')
    await page.click('#alert-dialog-confirm-button')

    // Verify navigation to help and Example is gone from navigation
    await expect(page).toHaveURL(/#help/)
    await expect(page.locator('.navigation .items').getByText('Example')).not.toBeVisible()
  })
})

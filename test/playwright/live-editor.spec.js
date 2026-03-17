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

async function enableLiveEditor(page, extensionPage) {
  await extensionPage.gotoPopup(page)
  await page.waitForSelector('.popup-footer')
  const toggle = page.locator('.popup-footer input[type="checkbox"]')
  await toggle.click()
  await expect(toggle).toBeChecked()
}

test.describe('Live Editor', () => {
  test('can toggle Live Editor from popup', async ({ context, extensionPage }) => {
    const page = await context.newPage()
    await extensionPage.gotoPopup(page)
    await page.waitForSelector('.popup-footer')
    const toggle = page.locator('.popup-footer input[type="checkbox"]')
    await toggle.click()
    await expect(toggle).toBeChecked()
  })

  test('shows FAB on page when enabled', async ({ context, extensionPage }) => {
    const page = await context.newPage()
    await enableLiveEditor(page, extensionPage)

    await page.goto(extensionPage.testUrl)
    await page.waitForSelector('#dm-live-editor-host', { timeout: 5000 })
    const host = page.locator('#dm-live-editor-host')
    await expect(host).toBeAttached()
  })

  test('can open panel by clicking FAB', async ({ context, extensionPage }) => {
    const page = await context.newPage()
    await enableLiveEditor(page, extensionPage)

    await page.goto(extensionPage.testUrl)
    await page.waitForSelector('#dm-live-editor-host', { timeout: 5000 })

    await page.evaluate(() => {
      document.querySelector('#dm-live-editor-host').shadowRoot.querySelector('.dm-le-fab').click()
    })

    const panelOpen = await page.evaluate(() => {
      return !!document
        .querySelector('#dm-live-editor-host')
        .shadowRoot.querySelector('.dm-le-panel.dm-le-open')
    })
    expect(panelOpen).toBe(true)
  })

  test('can type /help command', async ({ context, extensionPage }) => {
    const page = await context.newPage()
    await enableLiveEditor(page, extensionPage)

    await page.goto(extensionPage.testUrl)
    await page.waitForSelector('#dm-live-editor-host', { timeout: 5000 })

    // Open panel
    await page.evaluate(() => {
      document.querySelector('#dm-live-editor-host').shadowRoot.querySelector('.dm-le-fab').click()
    })

    // Type /help and press Enter
    await page.evaluate(() => {
      const input = document
        .querySelector('#dm-live-editor-host')
        .shadowRoot.querySelector('.dm-le-input')
      input.value = '/help'
      input.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }))
    })

    // Check output
    const outputText = await page.evaluate(() => {
      const output = document
        .querySelector('#dm-live-editor-host')
        .shadowRoot.querySelector('.dm-le-output')
      return output ? output.textContent : ''
    })
    expect(outputText).toContain('Available commands')
  })
})

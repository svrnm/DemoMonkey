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
import { test as base, chromium, expect as baseExpect } from '@playwright/test'
import path from 'path'
import fs from 'fs'

/**
 * Custom test fixture that launches Chrome with the extension loaded
 */
export const test = base.extend({
  // Provide a browser context with the extension loaded
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const pathToExtension = path.resolve('./build')

    // Temporarily modify manifest to grant all permissions for testing
    const manifestPath = path.join(pathToExtension, 'manifest.json')
    const rawManifest = fs.readFileSync(manifestPath, 'utf8')
    const manifest = JSON.parse(rawManifest)
    manifest.host_permissions = ['<all_urls>']
    fs.writeFileSync(manifestPath, JSON.stringify(manifest))

    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${pathToExtension}`,
        `--load-extension=${pathToExtension}`
      ]
    })

    // Revert the manifest file
    fs.writeFileSync(manifestPath, rawManifest)

    await use(context)
    await context.close()
  },

  // Provide the dynamically detected extension ID
  extensionId: async ({ context }, use) => {
    // Wait for the service worker to be registered
    let serviceWorker

    // Try to get existing service worker or wait for one
    serviceWorker = context.serviceWorkers()[0]
    if (!serviceWorker) {
      serviceWorker = await context.waitForEvent('serviceworker')
    }

    // Extract extension ID from the service worker URL
    // Service worker URL format: chrome-extension://<extension-id>/background.js
    const extensionId = serviceWorker.url().split('/')[2]

    await use(extensionId)
  },

  // Provide extension-specific page utilities
  extensionPage: async ({ context, extensionId }, use) => {
    const dashboardUrl = `chrome-extension://${extensionId}/options.html`
    const popupUrl = `chrome-extension://${extensionId}/popup.html`
    const testUrl = `chrome-extension://${extensionId}/test.html`

    const extensionPage = {
      dashboardUrl,
      popupUrl,
      testUrl,
      extensionId,

      /**
       * Navigate to dashboard
       */
      async gotoDashboard(page) {
        await page.goto(dashboardUrl)
        await page.waitForLoadState('domcontentloaded')
      },

      /**
       * Navigate to popup
       */
      async gotoPopup(page) {
        await page.goto(popupUrl)
        await page.waitForLoadState('domcontentloaded')
      },

      /**
       * Navigate to test page
       */
      async gotoTestPage(page) {
        await page.goto(testUrl)
        await page.waitForLoadState('domcontentloaded')
      },

      /**
       * Enable a configuration by title
       */
      async enableConfig(page, title = 'Playwright Test') {
        await page.goto(popupUrl)
        await page.waitForSelector('.toggle-group')

        const toggle = page.locator(
          `xpath=//*[contains(text(), "${title}")]/../../descendant::input`
        )
        const isChecked = await toggle.isChecked()

        if (!isChecked) {
          await toggle.click()
        }

        await baseExpect(toggle).toBeChecked()
      },

      /**
       * Enable an optional feature
       */
      async enableOptionalFeature(page, title = 'webRequestHook') {
        await page.goto(dashboardUrl)
        await page.waitForSelector("a[href='#settings']")
        await page.click("a[href='#settings']")
        await page.waitForSelector('.feature-item')

        const toggle = page.locator(`#toggle-${title} input`)
        await toggle.click()
        await baseExpect(toggle).toBeChecked()
      },

      /**
       * Disable an optional feature
       */
      async disableOptionalFeature(page, title = 'webRequestHook') {
        await page.goto(dashboardUrl)
        await page.waitForSelector("a[href='#settings']")
        await page.click("a[href='#settings']")
        await page.waitForSelector('.feature-item')

        const toggle = page.locator(`#toggle-${title} input`)
        await toggle.click()
        await baseExpect(toggle).not.toBeChecked()
      },

      /**
       * Create a new configuration
       */
      async createConfig(page, title = 'Playwright Test', content = 'demomonkey = testape') {
        await page.goto(dashboardUrl)

        // Wait for the page to fully load
        await page.waitForLoadState('networkidle')

        await page.click("a[href='#configuration/new']")

        // Wait for the new configuration page to load
        await page.waitForSelector('#configuration-title')
        await page.fill('#configuration-title', title)

        // Click the editor tab (Configuration tab) to show the code editor
        await page.click('#current-configuration-editor')

        // Wait for ACE Editor to be ready - it creates a div with id="contentarea"
        await page.waitForSelector('#contentarea', { timeout: 5000 })

        // Wait a bit more for ACE to fully initialize
        await page.waitForTimeout(500)

        // Use JavaScript to directly set the ACE editor content
        // The editor is exposed as window.editor in CodeEditor.js
        const fullContent = `;;;;\n${content}\n;;;;`
        await page.evaluate((text) => {
          if (window.editor) {
            window.editor.setValue(text, 1)
          } else {
            throw new Error('window.editor is not defined')
          }
        }, fullContent)

        // Wait for React to process the change
        await page.waitForTimeout(200)

        // Click save button (MUI Button with "Save" text)
        await page.getByRole('button', { name: 'Save' }).click()

        // Wait for save to complete
        await page.waitForTimeout(500)

        // Verify the config was created
        await baseExpect(page.locator('.navigation .items')).toContainText(title)
      }
    }

    await use(extensionPage)
  }
})

export { expect } from '@playwright/test'

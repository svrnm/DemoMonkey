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
import fs from 'fs'
import path from 'path'
import os from 'os'

// Helper to safely remove a file if it exists
function safeUnlink(filePath) {
  try {
    if (filePath && fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }
  } catch {
    // Ignore cleanup errors
  }
}

test.describe('Download and Upload', () => {
  test('can download a configuration with Unicode content', async ({ context, extensionPage }) => {
    const page = await context.newPage()
    const tempDir = os.tmpdir()
    let downloadPath = null

    try {
      // Create a configuration with some content including Unicode
      const configName = 'Download Test'
      const configContent = 'Hello = World\nCity = München\nEmoji = 🚀'
      await extensionPage.createConfig(page, configName, configContent)

      // Navigate to the configuration
      await extensionPage.gotoDashboard(page)
      await page.locator('.navigation .items').getByText(configName).click()

      // Wait for editor to load
      await page.waitForSelector('#contentarea', { timeout: 5000 })

      // Set up download listener before clicking download
      const downloadPromise = page.waitForEvent('download')

      // Click the download button
      await page.click('button.download-button')

      // Wait for the download to complete
      const download = await downloadPromise

      // Verify the filename
      expect(download.suggestedFilename()).toBe(`${configName}.mnky`)

      // Save the file temporarily
      downloadPath = path.join(tempDir, download.suggestedFilename())
      await download.saveAs(downloadPath)

      // Read and verify the content
      const downloadedContent = fs.readFileSync(downloadPath, 'utf8')
      expect(downloadedContent).toContain('Hello = World')
      expect(downloadedContent).toContain('City = München')
      expect(downloadedContent).toContain('Emoji = 🚀')
    } finally {
      safeUnlink(downloadPath)
    }
  })

  test('can upload a .mnky file with Unicode content', async ({ context, extensionPage }) => {
    const page = await context.newPage()
    const tempDir = os.tmpdir()
    const testFilePath = path.join(tempDir, 'unicode-test.mnky')

    try {
      await extensionPage.gotoDashboard(page)

      // Create a temporary .mnky file with Unicode content
      const unicodeContent =
        ';;;;\n@include = /.*example.com.*/\nCompany = Société Générale\nGreeting = 你好世界\n;;;;'
      fs.writeFileSync(testFilePath, unicodeContent, 'utf8')

      // Find the Upload link/button in the navigation header
      // It's an MUI Button which renders as an anchor tag with href="#configuration/upload"
      const uploadButton = page.locator('a[href="#configuration/upload"]')

      // Click the Upload button to attach the change event listener to the file input
      await uploadButton.click()

      // Small delay to let the event listener attach
      await page.waitForTimeout(200)

      // Set the files on the input - Playwright will dispatch the change event
      const fileInput = page.locator('#upload')
      await fileInput.setInputFiles(testFilePath)

      // Wait for upload to process and navigation to update
      await page.waitForTimeout(1000)

      // Verify the configuration appears in navigation
      await expect(page.locator('.navigation .items')).toContainText('unicode-test', {
        timeout: 10000
      })

      // Click on it to verify content
      await page.locator('.navigation .items').getByText('unicode-test').click()
      await page.waitForSelector('#contentarea', { timeout: 5000 })
      await page.waitForTimeout(500)

      // Verify the Unicode content was preserved
      const editorContent = await page.evaluate(() => {
        if (window.editor) {
          return window.editor.getValue()
        }
        return ''
      })

      expect(editorContent).toContain('Société Générale')
      expect(editorContent).toContain('你好世界')
    } finally {
      safeUnlink(testFilePath)
    }
  })
})

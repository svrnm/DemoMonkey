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
import Badge from '../../src/models/Badge'
import chai from 'chai'

const assert = chai.assert

class BrowserAction {
  constructor(tabs) {
    this.tabs = tabs
  }

  getBadgeText({ tabId }, cb) {
    return cb(this.tabs[tabId].text)
  }

  setBadgeText({ text, tabId }) {
    this.tabs[tabId].text = text
  }

  setBadgeBackgroundColor({ color, tabId }) {
    this.tabs[tabId].color = color
  }
}

describe('Badge', function () {
  describe('#updateDemoCounter', function () {
    it('sets the badge text to 0 and color to green', function () {
      const tabs = [{ text: '', color: '' }]
      const badge = new Badge(new BrowserAction(tabs))
      badge.updateDemoCounter(0, 0)
      assert.equal(tabs[0].text, '0')
      assert.equal(tabs[0].color, '#5c832f')
    })

    it('sets the badge text to 5 and color to red', function () {
      const tabs = [{ text: '0', color: '#5c832f' }]
      const badge = new Badge(new BrowserAction(tabs))
      badge.updateDemoCounter(5, 0)
      assert.equal(tabs[0].text, '5')
      assert.equal(tabs[0].color, '#952613')
    })

    it('does not change the timer value', function () {
      const tabs = [{ text: '0/5', color: '#5c832f' }]
      const badge = new Badge(new BrowserAction(tabs), 5)
      badge.updateDemoCounter(5, 0)
      assert.equal(tabs[0].text, '5/5')
      assert.equal(tabs[0].color, '#952613')
    })
  })
  describe('#updateTimer', function () {
    it('sets the timer text to 0', function () {
      const tabs = [{ text: '', color: '' }]
      const badge = new Badge(new BrowserAction(tabs))
      badge.updateDemoCounter(0, 0)
      badge.updateTimer(0)
      assert.equal(tabs[0].text, '0/0')
    })

    it('sets the timer text to 5 and does not change the counter value', function () {
      const tabs = [{ text: '', color: '' }]
      const badge = new Badge(new BrowserAction(tabs))
      badge.updateDemoCounter(0, 0)
      badge.updateTimer(5)
      assert.equal(tabs[0].text, '0/5')
    })

    it('sets the timer text to 5 and updates all tabs on opening', function () {
      const tabs = [{ text: '0', color: '' }, { text: '4', color: '' }, { text: '8/8', color: '' }]
      const badge = new Badge(new BrowserAction(tabs))
      tabs.forEach((tab, id) => badge.updateDemoCounter(0, id))
      badge.updateTimer(5)
      assert.equal(tabs[0].text, '0/5')
      // fake open new tab: DemoCounter will be updated
      badge.updateDemoCounter(4, 1)
      assert.equal(tabs[1].text, '4/5')

      badge.updateDemoCounter(8, 2)
      assert.equal(tabs[2].text, '8/5')
    })
  })
  describe('#clearTimer', function () {
    it('ignores an empty text', function () {
      const tabs = [{ text: '', color: '' }]
      const badge = new Badge(new BrowserAction(tabs))
      badge.clearTimer(0)
      assert.equal(tabs[0].text, '')
    })

    it('ignores an empty timer value', function () {
      const tabs = [{ text: '13', color: '' }]
      const badge = new Badge(new BrowserAction(tabs))
      badge.clearTimer(0)
      assert.equal(tabs[0].text, '13')
    })

    it('clears the timer and updates all tabs on opening', function () {
      const tabs = [{ text: '0', color: '' }, { text: '4/13', color: '' }, { text: '8/8', color: '' }]
      const badge = new Badge(new BrowserAction(tabs))
      badge.clearTimer(0)
      assert.equal(tabs[0].text, '0')
      // fake open new tab: DemoCounter will be updated
      badge.updateDemoCounter(4, 1)
      assert.equal(tabs[1].text, '4')

      badge.updateDemoCounter(8, 2)
      assert.equal(tabs[2].text, '8')
    })
  })
})

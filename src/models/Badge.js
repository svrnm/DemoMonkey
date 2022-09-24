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
class Badge {
  constructor(browserAction, timer = -1, onSave) {
    this.timer = timer
    this.browserAction = browserAction
    this.tabs = []
    this.onSave = onSave
  }

  save() {
    this.onSave({
      timer: this.timer,
      tabs: this.tabs
    })
  }

  load(tabs, timer) {
    this.tabs.push(...tabs)
    this.timer = timer > 99 ? 99 : timer
  }

  removeTab(tabId) {
    this.tabs = this.tabs.filter(id => id !== tabId)
    this.save()
  }

  _updateBadgeText(tabId) {
    this.browserAction.getBadgeText({ tabId }, (text) => {
      text = this._updateText(text)
      this.browserAction.setBadgeText({ text, tabId })
    })
  }

  _updateText(oldText, newCount) {
    const oldCount = oldText.split('/')[0]
    const count = typeof newCount === 'string' ? newCount : oldCount
    const newText = this.timer === -1 ? count : count + '/' + this.timer
    return newText
  }

  updateDemoCounter(count, tabId) {
    if (!this.tabs.includes(tabId)) {
      this.tabs.push(tabId)
      this.save()
    }

    this.browserAction.getBadgeText({ tabId }, (oldText) => {
      // oldText can be undefined for a new tab, set it to ''
      const text = this._updateText(typeof oldText === 'undefined' ? '' : oldText, count + '')
      const color = (count === '!' || count > 0) ? '#952613' : '#5c832f'
      this.browserAction.setBadgeText({ text, tabId })
      this.browserAction.setBadgeBackgroundColor({
        color,
        tabId
      })
    })
  }

  clearTimer() {
    this.timer = -1
    this.save()
    this.tabs.forEach(tabId => this._updateBadgeText(tabId))
  }

  updateTimer(timer) {
    this.timer = timer > 99 ? 99 : timer
    this.tabs.forEach(tabId => this._updateBadgeText(tabId))
  }
}

export default Badge

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
class NetRequestManager {
  constructor(declarativeNetRequest, logger, onSave) {
    this.declarativeNetRequest = declarativeNetRequest
    this.logger = logger
  }

  load(list, tabs, index) {
    this.list = list
    this.tabs = tabs
    this.index = index
  }

  save() {
    this.onSave({
      list: this.list,
      tabs: this.tabs,
      index: this.index
    })
  }

  enable() {
    this.logger('debug', 'Enable net request manager').write()
    this.clear()
  }

  disable() {
    this.logger('debug', 'Disable net request manager').write()
    this.clear()
  }

  _getResourceType(type) {
    if (type === '*') {
      return [
        'csp_report',
        'font',
        'image',
        'main_frame',
        'media',
        'object',
        'other',
        'ping',
        'script',
        'stylesheet',
        'sub_frame',
        'webbundle',
        'websocket',
        'webtransport',
        'xmlhttprequest'
      ]
    }
    return type.split(',')
  }

  add(description, tabId) {
    this.declarativeNetRequest.getSessionRules((rules) => {
      const resourceTypes = this._getResourceType(description.type)
      const existingRule = rules.find(({ action, condition }) => {
        return (
          action.type === description.action &&
          condition.resourceTypes.join(',') === resourceTypes.join(',') &&
          condition.urlFilter === description.url &&
          (description.action !== 'redirect' ||
            action.redirect.url === description.options.redirect)
        )
      })
      if (existingRule) {
        this.logger(
          'debug',
          'Use existing rule for tab',
          tabId,
          'and rule ',
          description
        ).write()
        existingRule.condition.tabIds.push(tabId)
        this.declarativeNetRequest.updateSessionRules({
          addRules: [existingRule],
          removeRuleIds: [existingRule.id] // remove existing rule and then have it re-added
        })
      } else {
        this.logger(
          'debug',
          'Add a new rule for tab',
          tabId,
          'and rule ',
          description
        ).write()
        const rule = {
          id: rules.length + 1,
          priority: 1,
          action: {
            type: description.action
          },
          condition: {
            resourceTypes,
            urlFilter: description.url,
            tabIds: [tabId]
          }
        }
        if (description.action === 'redirect') {
          rule.action.redirect = {
            url: description.options.redirect
          }
        }
        this.declarativeNetRequest.updateSessionRules({
          addRules: [rule]
        })
      }
    })
  }

  remove(description, tabId) {
    this.declarativeNetRequest.getSessionRules((rules) => {
      const resourceTypes = this._getResourceType(description.type)
      this.logger(
        'debug',
        'Remove web hook from tab',
        tabId,
        ':',
        description
      ).write()
      const existingRule = rules.find(({ action, condition }) => {
        return (
          action.type === description.action &&
          condition.resourceTypes === resourceTypes &&
          condition.urlFilter === description.url &&
          (description.action !== 'redirect' ||
            action.redirect.url === description.options.redirect)
        )
      })
      if (existingRule) {
        existingRule.condition.tabIds = existingRule.condition.tabIds.filter(
          (id) => id !== tabId
        )
        if (existingRule.condition.tabIds.length > 0) {
          this.declarativeNetRequest.updateSessionRules({
            addRules: [existingRule],
            removeRuleIds: [existingRule.id] // remove existing rule and then have it re-added
          })
        } else {
          this.declarativeNetRequest.updateSessionRules({
            removeRuleIds: [existingRule.id]
          })
        }
      }
    })
  }

  removeTab(tabId) {
    this.declarativeNetRequest.getSessionRules((rules) => {
      const newRules = rules.reduce((result, current) => {
        current.condition.tabIds = current.condition.tabIds.filter(
          (id) => id !== tabId
        )
        if (current.condition.tabIds.length > 0) {
          result.push(current)
        }
        return result
      }, [])
      this.declarativeNetRequest.updateSessionRules({
        addRules: newRules,
        removeRuleIds: rules.map((rule) => rule.id)
      })
    })
  }

  clear() {
    this.logger('debug', 'Clear all web hooks').write()
    this.declarativeNetRequest.getSessionRules((rules) => {
      this.declarativeNetRequest.updateSessionRules({
        removeRuleIds: rules.map((rule) => rule.id)
      })
    })
  }
}

export default NetRequestManager

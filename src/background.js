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
import { createStore } from 'redux'
import { wrapStore } from 'webext-redux'
import reducers from './reducers'
import { v4 as uuidV4 } from 'uuid'
import Configuration from './models/Configuration'
import MatchRule from './models/MatchRule'
import Badge from './models/Badge'
import OptionalFeature from './models/OptionalFeature'
import match from './helpers/match.js'
// import remoteBackup from './helpers/remoteBackup.js'
import { logger, connectLogger } from './helpers/logger'
(function (scope) {
  'use strict'

  let enabledHotkeyGroup = -1

  const badge = new Badge(scope.chrome.browserAction)

  let liveModeInterval = -1
  let liveModeStartTime = -1

  function doLiveMode(liveMode) {
    if (liveMode && liveModeInterval < 0) {
      logger('info', 'Live Mode started').write()
      liveModeStartTime = Date.now()
      badge.updateTimer('0')
      liveModeInterval = setInterval(() => {
        const minutes = Math.floor((Date.now() - liveModeStartTime) / 60000)
        console.log(minutes)
        badge.updateTimer(minutes)
      }, 6000)
    } else if (!liveMode && liveModeInterval > 0) {
      const time = (Date.now() - liveModeStartTime)
      const hours = ('' + Math.floor(time / (3600000))).padStart(2, '0')
      const minutes = ('' + Math.floor((time % 3600000) / 60000)).padStart(2, '0')
      const seconds = ('' + Math.floor((time % 60000) / 1000)).padStart(2, '0')
      logger('info', `Live mode ended after ${hours}:${minutes}:${seconds}`).write()
      clearInterval(liveModeInterval)
      badge.clearTimer()
      liveModeInterval = -1
    }
  }

  let hookedIntoWebRequests = false

  let hookedUrls = {}

  const hooks = {
    block: () => { return { cancel: true } },
    delay: (options) => {
      let counter = 0
      for (let start = Date.now(); Date.now() - start < options.delay * 1000;) {
        counter++
        if (counter % 10000000 === 0) {
          console.log('Delay', counter)
        }
      }
      console.log('Done', counter)
      return {}
    },
    replace: (options) => {
      logger('info', `Redirecting to ${options.replace}`).write()
      return { redirectUrl: options.replace }
    }
  }

  function webRequestHook(details) {
    return Object.keys(hookedUrls).reduce((acc, id) => {
      const { url, type, action, options, includeRules, excludeRules } = hookedUrls[id]
      if (new MatchRule(includeRules, excludeRules).test(details.url) && match(details.url, url) && (type === '*' || type.split(',').map(e => e.trim()).includes(details.type))) {
        logger('info', `Applying hook ${action} on ${details.url} [${details.type}] (matching ${url})`).write()
        return Object.assign(acc, hooks[action](options))
      }
      return acc
    }, {})
  }

  // This place seems to throw the "background.html:1 Unchecked runtime.lastError: This function must be called during a user gesture"
  function hookIntoWebRequests(feature, running) {
    if (!hookedIntoWebRequests && feature && running) {
      console.log('Hooking into web requests')
      scope.chrome.permissions.request({
        permissions: ['webRequestBlocking', 'webRequest']
      }, function (granted) {
        if (granted) {
          scope.chrome.webRequest.onBeforeRequest.addListener(
            webRequestHook,
            { urls: ['<all_urls>'] },
            ['blocking']
          )
          hookedIntoWebRequests = true
          console.log('-- hooked')
        } else {
          logger('warn', 'Could not grant webRequest permissions')
        }
      })
    } else if (hookedIntoWebRequests && (!feature || !running)) {
      console.log('Remove hook into web requests')
      scope.chrome.permissions.remove({
        permissions: ['webRequestBlocking', 'webRequest']
      }, function (removed) {
        if (removed) {
          scope.chrome.webRequest.onBeforeRequest.removeListener(webRequestHook)
          hookedIntoWebRequests = false
          console.log('-- removed')
        } else {
          logger('warn', 'Could not remove webRequest permissions')
        }
      })
    }
  }

  // New tab created, initialize badge for given tab
  scope.chrome.tabs.onCreated.addListener(function (tab) {
    badge.updateDemoCounter(0, tab.id)
  })

  /*
   * The following replaces the declarative content scripts, which require
   * high host permissions.
   */
  scope.chrome.tabs.onUpdated.addListener(function (tabId, changeInfo) {
    if (changeInfo.status !== 'loading') {
      return
    }

    scope.chrome.tabs.get(tabId, (tab) => {
      if (tab.url) {
        scope.chrome.tabs.executeScript(tabId, {
          code: 'typeof window["demomonkey-F588C641-43BA-4E48-86F4-36100F9765E9"] === "boolean"',
          runAt: 'document_start',
          allFrames: true
        }, (result) => {
          if (result[0] === true) {
            console.log('Already injected.')
            return
          }
          scope.chrome.tabs.executeScript(tabId, {
            file: 'js/monkey.js',
            allFrames: true,
            runAt: 'document_start'
          }, () => {
            scope.chrome.tabs.executeScript(tabId, {
              code: 'window["demomonkey-F588C641-43BA-4E48-86F4-36100F9765E9"] = true;',
              allFrames: true,
              runAt: 'document_start'
            }, () => {
              console.log('Injection completed for', tabId, tab.url)
            })
          })
        })
      } else {
        console.log('Did not inject into tab ', tabId, 'Permission denied')
      }
    })
  })

  scope.chrome.tabs.onRemoved.addListener(function (tabId) {
    badge.removeTab(tabId)
  })

  scope.chrome.tabs.onActivated.addListener(function (tab) {
    scope.chrome.tabs.sendMessage(tab.tabId, { active: tab.tabId })
  })

  scope.chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.receiver && request.receiver === 'background') {
      if (typeof request.count === 'number' && typeof sender.tab === 'object' && typeof sender.tab.id === 'number') {
        badge.updateDemoCounter(request.count, sender.tab.id)
      }
      if (request.task && request.task === 'addUrl' && typeof request.url === 'object') {
        hookedUrls[request.url.id] = request.url
      }
      if (request.task && request.task === 'removeUrl' && typeof request.id === 'string') {
        delete hookedUrls[request.id]
      }
      if (request.task && request.task === 'clearUrls') {
        hookedUrls = {}
      }
    }
  })

  const persistentStates = {
    configurations: [{
      name: 'Example',
      content: require('../examples/one.mnky'),
      test: 'Inventory-Services\nCart\nCART\nSan Francisco',
      enabled: false,
      values: {},
      id: uuidV4()
    }, {
      name: 'templates/Cities',
      content: require('../examples/cities.mnky'),
      test: 'San Francisco\nSeattle\nLondon',
      enabled: false,
      values: {},
      id: uuidV4()
    }],
    settings: {
      baseTemplate: require('../examples/baseTemplate.mnky'),
      analyticsSnippet: '',
      optionalFeatures: OptionalFeature.getDefaultValues(),
      globalVariables: [
        {
          key: 'adPurple',
          value: '7e69d2'
        }
      ],
      debugMode: false,
      monkeyInterval: 100
    },
    monkeyID: uuidV4()
  }

  scope.chrome.storage.local.get(persistentStates, function (state) {
    // currentView is not persistent but should be defined to avoid
    // issues rendering the UI.
    // state.currentView = 'welcome'

    state.connectionState = 'unknown'

    state.settings.liveMode = false

    // We start with an empty log. Maybe in a later release persistance could be an idea..
    state.log = []

    run(state)
  })

  function updateStorage(store) {
    console.log('Updating Storage.')
    const configurations = store.getState().configurations
    const settings = store.getState().settings

    // Sync data back into chrome.storage
    scope.chrome.storage.local.set({
      configurations,
      settings,
      monkeyID: store.getState().monkeyID
    })
    hookIntoWebRequests(settings.optionalFeatures.webRequestHook, configurations.filter(c => c.enabled).length > 0)
  }

  function run(state, revisions = {}) {
    console.log('Background Script started')
    const store = createStore(reducers, state)
    wrapStore(store, { portName: 'DEMO_MONKEY_STORE' })

    // Make the store accessible from dev console.
    scope.store = store

    const settings = store.getState().settings

    if (settings.optionalFeatures.writeLogs) {
      connectLogger(store, { source: 'monkey.js' })
    }

    // Persist monkey ID. Shouldn't change after first start.
    scope.chrome.storage.local.set({ monkeyID: store.getState().monkeyID })

    hookIntoWebRequests(settings.optionalFeatures.webRequestHook, store.getState().configurations.filter(c => c.enabled).length > 0)

    store.subscribe(function () {
      const lastAction = store.getState().lastAction
      const settings = store.getState().settings
      console.log(lastAction.type)
      switch (lastAction.type) {
        case 'APPEND_LOG_ENTRIES':
          return
        case 'TOGGLE_LIVE_MODE':
          doLiveMode(settings.liveMode)
          break
        default:
          updateStorage(store)
      }
    })

    function toggleHotkeyGroup(group) {
      const toggle = enabledHotkeyGroup !== group

      enabledHotkeyGroup = toggle ? group : -1

      store.getState().configurations.forEach(function (c) {
        const config = (new Configuration(c.content, null, false, c.values))
        if (config.isTemplate() || !config.isRestricted()) {
          return
        }

        if (Array.isArray(c.hotkeys) && c.hotkeys.includes(group)) {
          store.dispatch({ type: 'TOGGLE_CONFIGURATION', id: c.id, enabled: toggle })
        } else if (c.enabled) {
          store.dispatch({ type: 'TOGGLE_CONFIGURATION', id: c.id })
        }
      })
    }

    scope.chrome.commands.onCommand.addListener(function (command) {
      console.log('Command:', command)
      if (command.startsWith('toggle-hotkey-group')) {
        const group = parseInt(command.split('-').pop())
        toggleHotkeyGroup(group)
      }
      if (command === 'live-mode') {
        store.dispatch({ type: 'TOGGLE_LIVE_MODE' })
      }
      if (command === 'debug-mode') {
        store.dispatch({ type: 'TOGGLE_DEBUG_MODE' })
      }
    })

    scope.chrome.contextMenus.create({
      title: 'Toggle Live Mode',
      contexts: ['browser_action'],
      onclick: function () {
        store.dispatch({ type: 'TOGGLE_LIVE_MODE' })
      }
    })

    scope.chrome.contextMenus.create({
      title: 'Toggle Debug Mode',
      contexts: ['browser_action'],
      onclick: function () {
        store.dispatch({ type: 'TOGGLE_DEBUG_MODE' })
      }
    })
  }
})(window)

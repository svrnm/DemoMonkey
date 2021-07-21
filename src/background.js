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
          key: 'myPurple',
          value: '7e69d2'
        },
        {
          key: 'dmLogo',
          value: 'data:image/png;base64,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ZQp79uzBNE0Op7XmACEEhwoEAhQVFck5c+akb9iwoaR///7poVCIJPAnT54sNm7cSD1rCvwEeNOyrL2O4/ADg8NYltUKeBcIUY927thJZmbmlp49e2ZxlIqKipg4cWLgk08+kYFAgAO01kSjUbKzs+nRowcFBQX06NGDjp06ktM8hxYtWlRVVFSUFRcXh4QQCCEwDEN888036fPmzasaOHBgcUZGRjpHYc2aNeVTpkwxRAz1LwwMBP7bcZxKDhIcQimVDnwInE0DiEQivPHGG+Tn55OokpISbrjher75ZhMHaK1Rqs/+Cy+4UF9w4YVpmZmZRnp6OkfgR6NRLxqNBubOncvcuXNZtmwZZWVlSClp2aolr77yKllZWSSirKyUq0eOZMf2HTSwx4EHbNvmAIODlFLE3AmMpYFUVVWxfv36nZdddpmICRAnrbV/9913i7Vr/4HvewweMoQnpz3JmDFjAt179AhGIhEZCASohjBigsEgnTp1YvDgwVx++eWelMJbs2aNUbKvhA0bNjBkyBCEEMRr0qRfsXLlKoQQJIsQAiEEcVLAC47jlBFjcJBlWdnAX4AQDaikpCQyatSoQAzxWrBggfv0008b7du358knn4yOGT3GyMrKIlHhcFj27dvXGDp0KJ9/voHFixfTtWtX2rZtS7xsewVr1qxBSsnR0FqjtaZr167eWWedJdu1a+cWFRVRXFwsDMOgDgLAPsuyFjiOg8mPxgBZ1EFVVRXl5eWkpaURjUbJyMggGbTWTJ06lfT0dOLlui7Tpk0LXHvttdx2221EIpEgSWJZFs888ywvv/wyv/3tbznnnHMwTZN43HrrraxYYfP55xtJlNaanj178uCDv6B16zbSNE1ijMrKSjFnzhymTJlCNBqlDu60bftXxBjEKKUE8DyQRw1c10WdoXjggQd45JFHmDBhAiNHjsT3fdavX4/WmkRprfm3fxvDlVf+K4lYtWol6enp/PznPycUCpFsUkr69OlDTNR1Xa9FixYGcTAMg/79z6mYMWOG9H1fECetNRdffHH5tGnT/JycXFNKKfieME2TLl26MGjQIN5++22qqqqoRdCyrELHcb4wiLEsSwH3A4JqeJ7v33LLz7j//gdE27ZtCQQCBAIBsrKy6N+/P/369ePDDz+sjEajJglo3rx55ZQpU81AIEAidu/e411yySUyhlTq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'
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

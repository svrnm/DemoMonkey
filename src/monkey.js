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
import Monkey from './models/Monkey'
import ModeManager from './models/ModeManager'
import Settings from './models/Settings'
import Manifest from './models/Manifest'
import InlineRuleManager from './models/InlineRuleManager'
import UrlManager from './models/UrlManager'
import { Store } from 'webext-redux'
import { logger, connectLogger } from './helpers/logger'

// Firefox does not display errors in the console, so we catch them ourselves and print them to console.
try {
  if (!window.demoMonkeyLoaded) {
    window.demoMonkeyLoaded = true;

    (function (scope) {
      'use strict'

      // For firefox content scripts chrome is not attached to "window", so we fix this here.
      if (!scope.chrome) {
        /* global chrome */
        scope.chrome = chrome
      }

      scope.chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
        if (request.active) {
          scope['demomonkey-active-tab'] = true
        }
      })

      const store = new Store({
        portName: 'DEMO_MONKEY_STORE' // communication port name
      })

      function isTopFrame() {
        try {
          return window.self === window.top
        } catch (e) {
          return false
        }
      }

      function onStart(count) {
        console.log('Updating Badge:', count)
        if (isTopFrame()) {
          scope.chrome.runtime.sendMessage({
            receiver: 'background',
            count: count
          })
        }
      }

      store.ready().then(() => {
        if (store.getState().settings.optionalFeatures.writeLogs) {
          connectLogger(store, { source: 'monkey.js' })
        }

        const settings = new Settings(store.getState().settings)

        const inlineConfig = {
          hookIntoAjax: settings.isFeatureEnabled('hookIntoAjax'),
          hookIntoHyperGraph: settings.isFeatureEnabled('hookIntoHyperGraph')
        }

        const inlineConfigScriptTag = scope.document.createElement('script')
        inlineConfigScriptTag.innerHTML = 'window.demoMonkeyConfig = ' + JSON.stringify(inlineConfig)
        scope.document.head.append(inlineConfigScriptTag)

        const inlineScriptTag = scope.document.createElement('script')
        inlineScriptTag.src = scope.chrome.extension.getURL('js/inline.js')
        scope.document.head.append(inlineScriptTag)

        // We don't use the redux store, since below we restart demo monkey
        // every time the store is updated, which would lead to a loop.
        const urlManager = new UrlManager(scope, isTopFrame())

        const inlineRuleManager = new InlineRuleManager(scope, inlineConfig)

        let $DEMO_MONKEY = new Monkey(store.getState().configurations, scope, settings.globalVariables, settings.isFeatureEnabled('undo'), settings.monkeyInterval, urlManager, inlineRuleManager, {
          withEvalCommand: settings.isFeatureEnabled('withEvalCommand'),
          hookIntoAjax: settings.isFeatureEnabled('hookIntoAjax'),
          webRequestHook: settings.isFeatureEnabled('webRequestHook')
        })
        onStart($DEMO_MONKEY.start())
        logger('debug', 'DemoMonkey enabled. Tampering the content. Interval: ', settings.monkeyInterval).write()

        const modeManager = new ModeManager(scope, $DEMO_MONKEY, new Manifest(scope.chrome), settings.isDebugEnabled(), settings.isFeatureEnabled('debugBox'), settings.isLiveModeEnabled(), settings.analyticsSnippet)

        function restart() {
          logger('debug', 'Restart DemoMonkey').write()
          // Update settings
          const settings = new Settings(store.getState().settings)
          const newMonkey = new Monkey(store.getState().configurations, scope, settings.globalVariables, settings.isFeatureEnabled('undo'), settings.monkeyInterval, urlManager, inlineRuleManager, {
            withEvalCommand: settings.isFeatureEnabled('withEvalCommand'),
            hookIntoAjax: settings.isFeatureEnabled('hookIntoAjax'),
            webRequestHook: settings.isFeatureEnabled('webRequestHook')
          })
          $DEMO_MONKEY.stop()
          onStart(newMonkey.start())
          $DEMO_MONKEY = newMonkey
          modeManager.reload($DEMO_MONKEY, settings.isDebugEnabled(), settings.isFeatureEnabled('debugBox'), settings.isLiveModeEnabled())
        }

        store.subscribe(function () {
          const lastAction = store.getState().lastAction
          // updating the current view does not require any updates
          if (['SET_CURRENT_VIEW', 'APPEND_LOG_ENTRIES'].includes(lastAction.type)) {
            return
          }
          if (settings.isFeatureEnabled('autoReplace')) {
            restart()
          }
        })

        scope.document.addEventListener('DOMContentLoaded', function (e) {
          modeManager.start()
        })

        scope.document.addEventListener('demomonkey-inline-editing', function (e) {
          let { search, replacement, command } = JSON.parse(e.detail)
          const configs = (store.getState().configurations.filter(config => config.enabled))
          const configuration = configs.length > 0 ? configs[0] : store.getState().configurations[0]
          if (command) {
            search = `!${command}(${search})`
          }
          configuration.content += '\n' + search + ' = ' + replacement
          store.dispatch({ type: 'SAVE_CONFIGURATION', id: configuration.id, configuration })
        })
      })
    })(window)
  }
} catch (e) {
  console.error(e)
}

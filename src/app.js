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
import '../styles/main.less'
import '../icons/monkey.png'
import '../icons/monkey-dev.png'

import React from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { Store } from '@eduardoac-skimlinks/webext-redux'
import OptionsPageApp from './components/options/OptionsPageApp'
import PopupPageApp from './components/popup/PopupPageApp'
import Manifest from './models/Manifest'
import ProtocolHandler from './models/ProtocolHandler'
import { logger, connectLogger } from './helpers/logger'

function updateCurrentView(v) {
  if (window.location.hash !== '#' + v) {
    const cv = typeof v === 'undefined' ? '' : v
    window.history.pushState(null, null, '#' + cv)
    window.dispatchEvent(new Event('viewchange'))
  }
}

function renderOptionsPageApp(root, store) {
  console.log('Render options page.')
  window.chrome.permissions.getAll(function (permissions) {
    console.log('All permissions fetched.')
    root.render(
      <Provider store={store}>
        <OptionsPageApp
          initialView={window.location.hash.substring(1)}
          onCurrentViewChange={(v) => updateCurrentView(v)}
          permissions={permissions}
        />
      </Provider>
    )
  })

  window.chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (
      request.receiver &&
      request.receiver === 'dashboard' &&
      typeof request.logMessage !== 'undefined'
    ) {
      console.log('Message received', request.logMessage)
      const msg =
        typeof request.logMessage === 'string'
          ? request.logMessage
          : JSON.stringify(request.logMessage)
      const mbox = document.getElementById('message-box')
      mbox.className = 'fade-to-visible'
      mbox.innerHTML = '(' + new Date().toLocaleTimeString() + ') ' + msg
      const timeoutid = setTimeout(function () {
        console.log(timeoutid, mbox.dataset.timeoutid)
        if (parseInt(mbox.dataset.timeoutid) === timeoutid) {
          mbox.className = 'fade-to-hidden'
        }
      }, 3000)
      mbox.dataset.timeoutid = timeoutid
    }
  })
}

function renderPopupPageApp(root, store, manifest) {
  window.chrome.tabs.query({ active: true, lastFocusedWindow: true }, function (tabs) {
    const currentUrl = tabs.length > 0 ? tabs[0].url : ''
    root.render(
      <Provider store={store}>
        <PopupPageApp currentUrl={currentUrl} manifest={manifest} />
      </Provider>
    )
    // The following is required to fix https://bugs.chromium.org/p/chromium/issues/detail?id=428044
    window.setTimeout(() => {
      document.body.style.minHeight = document.body.clientHeight + 1 + 'px'
    }, 200)
  })
}

const store = new Store({
  portName: 'DEMO_MONKEY_STORE' // communication port name
})

let commitHash = ''
fetch(window.chrome.runtime.getURL('COMMITHASH'))
  .then((r) => {
    return r.text()
  })
  .then((r) => {
    commitHash = r
  })
  .catch((e) => {
    // Could not fetch COMMITHASH, that should never happen, but we have a safeguard here.
    console.log(e)
  })
  .finally(() => {
    console.log('Loading redux store')
    store
      .ready()
      .then(() => {
        console.log('Store loaded.')
        document.getElementById('backup-message').remove()
        const rootElement = document.getElementById('app')

        window.store = store

        const app = rootElement.getAttribute('data-app')

        const root = createRoot(rootElement)

        if (store.getState().settings.optionalFeatures.writeLogs) {
          connectLogger(store, { source: 'monkey.js' })
        }

        // updateCurrentPage()

        const manifest = new Manifest(window.chrome, commitHash)

        logger('debug', `DemoMonkey ${manifest.version()}`).write()

        const protocolHandler = new ProtocolHandler('web+mnky:')
        protocolHandler
          .handle(window.location.search)
          .catch((error) => {
            logger('error', error).write()
            window.history.replaceState(
              {},
              document.title,
              window.location.pathname + window.location.hash
            )
          })
          .then((configuration) => {
            if (configuration) {
              const configurations = store.getState().configurations
              store.dispatch({ type: 'ADD_CONFIGURATION', configuration }).then(() => {
                const latest = configurations[configurations.length - 1]
                store.dispatch({
                  type: 'SET_CURRENT_VIEW',
                  view: `configuration/${latest.id}`
                })
              })
              window.history.replaceState(
                {},
                document.title,
                window.location.pathname + window.location.hash
              )
            }
          })
          .finally(() => {
            switch (app) {
              case 'OptionsPageApp':
                renderOptionsPageApp(root, store)
                break
              default:
                renderPopupPageApp(root, store, manifest)
            }
          })
      })
      .catch((e) => {
        console.log(e)
      })
  })

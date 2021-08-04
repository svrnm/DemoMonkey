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
import match from './helpers/match'
import { dom2obj, obj2dom } from './helpers/obj2dom'
import * as jsonpatch from 'fast-json-patch'
import JSON5 from 'json5'

(function (scope, config) {
  const rules = []

  window.dmRules = rules

  scope.addEventListener('message', function (event) {
    if (event.source !== window) {
      return
    }
    if (event.data.task) {
      switch (event.data.task) {
        case 'add-inline-rule':
          rules.push(event.data.rule)
          break
        case 'clear-inline-rules':
          rules.length = 0
          break
      }
    }
  })

  if (config.hookIntoHyperGraph) {
    const template = scope.document.createElement('template')
    template.setAttribute('id', 'demo-monkey-hyper-graph')
    scope.document.body.appendChild(template)
    setInterval(() => {
      if (typeof scope.DEV_DATA_HOOK_ORIGINAL_ === 'object') {
        Object.keys(scope.DEV_DATA_HOOK_ORIGINAL_).forEach(key => {
          let helperNode = document.getElementById(`demo-monkey-hyper-graph-helper-${key}`)
          if (helperNode) {
            scope.updateHyperGraphData[key](dom2obj(helperNode.innerHTML))
          } else {
            helperNode = scope.document.createElement('div')
            helperNode.innerHTML = obj2dom(scope.DEV_DATA_HOOK_ORIGINAL_[key])
            helperNode.setAttribute('id', `demo-monkey-hyper-graph-helper-${key}`)
            template.appendChild(helperNode)
          }
        })
      }
    }, 99)
  }

  if (config.hookIntoAjax) {
    const functions = {
      patchAjaxResponse: (url, response, context) => {
        const link = scope.document.createElement('a')
        link.href = url
        if (match(url, context.urlPattern) || match(link.href, context.urlPattern)) {
          const patch = typeof context.patch === 'string' ? JSON5.parse(context.patch) : context.patch
          const patched = jsonpatch.applyPatch(JSON5.parse(response), patch).newDocument
          return JSON.stringify(patched)
        }
        return response
      },
      replaceAjaxResponse: (url, response, context) => {
        const link = scope.document.createElement('a')
        link.href = url
        if (match(url, context.urlPattern) || match(link.href, context.urlPattern)) {
          if (context.search === false) {
            return context.replace
          }

          return response.replace(context.search, context.replace)
        }
        return response
      }
    }
    const openPrototype = XMLHttpRequest.prototype.open
    XMLHttpRequest.prototype.open = function () {
      const url = arguments[1]
      this.addEventListener('readystatechange', function (event) {
        if (this.readyState === 4) {
          const response = rules.filter(e => e[0].includes('AjaxResponse')).reduce((r, e) => {
            try {
              const r2 = functions[e[0]](url, r, e[1])
              return r2
            } catch (err) {
              console.warn(`Could not run ${e[0]}, because of an error:`)
              console.warn(err)
            }
            return r
          }, event.target.responseText)
          Object.defineProperty(this, 'response', { writable: true })
          Object.defineProperty(this, 'responseText', { writable: true })
          this.response = this.responseText = response
        }
      })
      return openPrototype.apply(this, arguments)
    }
  }
})(window, window.demoMonkeyConfig || { hookIntoAjax: false, hookIntoCanvas: false })

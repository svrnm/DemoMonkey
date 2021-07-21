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

/* eslint-disable no-template-curly-in-string */

import SearchAndReplace from './SearchAndReplace'
import Protect from './Protect'
import Style from './Style'
import Hide from './Hide'
import Group from './Group'
import ReplaceImage from './ReplaceImage'
import RecolorImage from './RecolorImage'
import ReplaceNeighbor from './ReplaceNeighbor'
import InsertHTML from './InsertHTML'
import OverwriteHTML from './OverwriteHTML'
import ReplaceFlowmapIcon from './appdynamics/ReplaceFlowmapIcon'
import ReplaceFlowmapConnection from './appdynamics/ReplaceFlowmapConnection'
import RecolorDashboard from './appdynamics/RecolorDashboard'
import SetDashboardBackground from './appdynamics/SetDashboardBackground'
import ReplaceGeoStatus from './appdynamics/ReplaceGeoStatus'
import RemoveFlowmapNode from './appdynamics/RemoveFlowmapNode'
import AddFlowmapNode from './appdynamics/AddFlowmapNode'
import InterceptWebRequest from './InterceptWebRequest'
import Eval from './Eval'
import Stage from './Stage'
import UndoElement from './UndoElement'
import QuerySelector from './QuerySelector'
import If from './If'
import AddScript from './AddScript'
import ReplaceAjaxResponse from './ReplaceAjaxResponse'
import PatchAjaxResponse from './PatchAjaxResponse'
import extractParameters from '../helpers/extractParameters'

export default [
  {
    name: 'addScript',
    signature: '(${1}) = ${3}',
    aliases: [],
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      return new AddScript(parameters, value)
    }
  },
  {
    name: 'replaceAjaxResponse',
    aliases: ['replaceAjax', 'replaceResponse'],
    signature: '(${1}, ${2}) = ${3}',
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      return new ReplaceAjaxResponse(parameters[0], parameters[1], value)
    }
  },
  {
    name: 'patchAjaxResponse',
    aliases: ['patchAjax', 'patchResponse'],
    signature: '(${1}) = ${3}',
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      return new PatchAjaxResponse(parameters[0], value)
    }
  },
  {
    name: 'if',
    aliases: [],
    signature: '(${1}, ${2}, ${3}) = ${4}',
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      const locationFilter = parameters.shift()
      const cssFilter = parameters.shift()
      return new If(locationFilter, cssFilter, cmdBuilder.build(parameters.join(','), value), location)
    }
  },
  {
    name: 'ifLocation',
    aliases: [],
    signature: '(${1}, ${2}) = ${3}',
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      const locationFilter = parameters.shift()
      return new If(locationFilter, '', cmdBuilder.build(parameters.join(','), value), location)
    }
  },
  {
    name: 'ifSelector',
    aliases: ['ifQuery', 'ifCss'],
    signature: '(${1}, ${2}) = ${3}',
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      const cssFilter = parameters.shift()
      return new If('', cssFilter, cmdBuilder.build(parameters.join(','), value), location)
    }
  },
  {
    name: 'replace',
    aliases: [],
    signature: '(${1}, ${2}, ${3}, ${4}) = ${5}',
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      return new SearchAndReplace(parameters[0], value, parameters[1], parameters[2], parameters[3], location)
    }
  },
  {
    name: 'replaceAttribute',
    aliases: [],
    signature: '(${1}, ${2}, ${3}, ${4}) = ${5}',
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      return new SearchAndReplace(parameters[0], value, parameters[2], parameters[3], parameters[1], location)
    }
  },
  {
    name: 'protect',
    aliases: [],
    signature: '(${1})',
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      return new Protect(parameters[0], parameters[1], parameters[2], location)
    }
  },
  {
    name: 'replaceNeighbor',
    aliases: [],
    signature: '(${1}, ${2}, ${3}, ${4}) = ${5}',
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      return new ReplaceNeighbor(parameters[0], value, parameters[1], parameters[2], parameters[3], parameters[4], location)
    }
  },
  {
    name: 'insertBefore',
    aliases: [],
    signature: '(${1}, ${2}, ${3}) = ${4}',
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      return new InsertHTML('afterbegin', parameters[0], value, parameters[1], parameters[2], location)
    }
  },
  {
    name: 'insertAfter',
    aliases: [],
    signature: '(${1}, ${2}, ${3}) = ${4}',
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      return new InsertHTML('beforeend', parameters[0], value, parameters[1], parameters[2], location)
    }
  },
  {
    name: 'style',
    aliases: [],
    signature: '(${1}, ${2}, ${3}) = ${4}',
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      return new Style(parameters[0], parameters[1], parameters[2], value)
    }
  },
  {
    name: 'querySelector',
    aliases: ['query'],
    signature: '(${1}, ${2}) = ${3}',
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      return new QuerySelector(parameters[0], parameters[1], value)
    }
  },
  {
    name: 'hide',
    aliases: [],
    signature: '(${1}, ${2}, ${3}, ${4})',
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      return new Hide(parameters[0], parameters[1], parameters[2], parameters[3], parameters[4], location)
    }
  },
  {
    name: 'replaceImage',
    aliases: [],
    signature: '(${1}) = ${2}',
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      return new ReplaceImage(value, parameters)
    }
  },
  {
    name: 'recolorImage',
    aliases: ['recolourImage'],
    signature: '(${1}) = ${2}',
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      return new RecolorImage(parameters[0], value)
    }
  },
  {
    name: 'replaceLink',
    aliases: [],
    signature: '(${1}) = ${2}',
    deprecated: true,
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      return new QuerySelector(`a[href="${parameters[0]}"]`, 'href', value)
    }
  },
  {
    name: 'blockUrl',
    aliases: [],
    signature: '(${1})',
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      return new InterceptWebRequest(parameters[0], value, 'block', parameters[1], includeRules, excludeRules)
    }
  },
  {
    name: 'delayUrl',
    aliases: [],
    signature: '(${1}) = ${2}',
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      return new InterceptWebRequest(parameters[0], value, 'delay', parameters[1], includeRules, excludeRules)
    }
  },
  {
    name: 'replaceUrl',
    aliases: ['redirectUrl'],
    signature: '(${1}) = ${2}',
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      return new InterceptWebRequest(parameters[0], value, 'replace', parameters[1], includeRules, excludeRules)
    }
  },
  {
    name: 'overwriteHTML',
    aliases: ['overwrite'],
    signature: '(${1}, ${2}) = ${3}',
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      return new OverwriteHTML(parameters[0], parameters[1], value, location)
    }
  },
  {
    name: 'overwritePage',
    aliases: [],
    signature: '(${1}, ${2}) = ${3}',
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      const iframeCode = '<head><title>' + parameters[1] + '</title><style>html {height:100%;}</style></head><body style="margin:0;padding:0;width:100%;height:100%;overflow:hidden;"><iframe src="' + value + '" style="width:100%;height:100%"></body>'
      return new OverwriteHTML(parameters[0], '', iframeCode, location)
    }
  },
  {
    name: 'eval',
    aliases: [],
    signature: '(${1}) = ${2}',
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      return new Eval(parameters.shift(), parameters, value)
    }
  },
  {
    name: 'stage',
    aliases: [],
    signature: '(${1}) = ${2}',
    command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
      return new Stage(parameters[0], parameters[1], value)
    }
  },
  {
    name: 'turbonomic',
    registry: [{
      name: 'hideListItem',
      signature: '(${1})',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        return new Hide(parameters[0], 17, 'list-group-item', '', '', location)
      }
    }]
  },
  {
    name: 'segment',
    registry: [{
      name: 'analyticsLoad',
      signature: '(${1})',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        const script = `  !function(){var analytics=window.analytics=window.analytics||[];if(!analytics.initialize)if(analytics.invoked)window.console&&console.error&&console.error("Segment snippet included twice.");else{analytics.invoked=!0;analytics.methods=["trackSubmit","trackClick","trackLink","trackForm","pageview","identify","reset","group","track","ready","alias","debug","page","once","off","on","addSourceMiddleware","addIntegrationMiddleware","setAnonymousId","addDestinationMiddleware"];analytics.factory=function(e){return function(){var t=Array.prototype.slice.call(arguments);t.unshift(e);analytics.push(t);return analytics}};for(var e=0;e<analytics.methods.length;e++){var key=analytics.methods[e];analytics[key]=analytics.factory(key)}analytics.load=function(key,e){var t=document.createElement("script");t.type="text/javascript";t.async=!0;t.src="https://cdn.segment.com/analytics.js/v1/" + key + "/analytics.min.js";var n=document.getElementsByTagName("script")[0];n.parentNode.insertBefore(t,n);analytics._loadOptions=e};analytics._writeKey="YOUR_WRITE_KEY";analytics.SNIPPET_VERSION="4.13.2";
        analytics.load(${value});
        analytics.page();
        }}();`
        return new AddScript([], script)
      }
    },
    {
      name: 'analyticsIdentify',
      signature: '(${1}, ${2}, ${3})',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        const script = `analytics.identify('${parameters[0]}', {
          name: '${parameters[1]}',
          email: '${parameters[2]}'
        });`
        return new AddScript([], script)
      }
    },
    {
      name: 'analyticsTrack',
      signature: '(${1}) = ${2}',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        const script = `analytics.identify('${parameters[0]}', ${JSON.stringify(value)});`
        return new AddScript([], script)
      }
    }]
  },
  {
    name: 'appdynamics',
    registry: [{
      name: 'replaceFlowmapIcon',
      aliases: [],
      signature: '(${1}) = ${2}',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        return new ReplaceFlowmapIcon(parameters[0], value)
      }
    },
    {
      name: 'replaceApplication',
      aliases: [],
      signature: '(${1}) = ${2}',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        return value === '' || value === true
          ? cmdBuilder._buildCustomCommand('appdynamics', 'hideApplication', parameters, value)
          : new SearchAndReplace(parameters[0], value)
      }
    },
    {
      name: 'hideApplication',
      aliases: [],
      signature: '(${1})',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        return new Group([
          new Hide(parameters[0], 4, 'ads-application-card', '', 'APPS_ALL_DASHBOARD', location),
          new Hide(parameters[0], 3, 'x-grid-row', '', 'APPS_ALL_DASHBOARD', location),
          new Hide(parameters[0], 3, 'ads-home-list-action-item', '', 'AD_HOME_OVERVIEW', location, function (node, parentNode) {
            return node.parentElement.hasAttribute('ad-test-id') && node.parentElement.getAttribute('ad-test-id').includes('home-screen-application-card-application-name')
          })
        ])
      }
    },
    {
      name: 'hideBrowserApplication',
      aliases: [],
      signature: '(${1})',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        return new Group([
          new Hide(parameters[0], 4, 'x-grid-row', '', 'EUM_WEB_ALL_APPS', location),
          new Hide(parameters[0], 2, 'ads-home-list-item', '', 'AD_HOME_OVERVIEW', location, function (_, parentNode) {
            return parentNode.getAttribute('ng-click').includes('ViewEumWebApplication')
          })
        ])
      }
    },
    {
      name: 'hideMobileApplication',
      aliases: [],
      signature: '(${1})',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        return new Group([
          new Hide(parameters[0], 4, 'ads-mobile-app-card', '', 'EUM_MOBILE_ALL_APPS', location),
          new Hide(parameters[0], 4, 'x-grid-row', '', 'EUM_MOBILE_ALL_APPS', location),
          new Hide(parameters[0], 5, 'x-grid-row', '', 'EUM_MOBILE_ALL_APPS', location),
          new Hide(parameters[0], 2, 'ads-home-list-item', '', 'AD_HOME_OVERVIEW', location, function (_, parentNode) {
            return parentNode.getAttribute('ng-click').includes('ViewEumMobileApplication')
          })
        ])
      }
    },
    {
      name: 'hideDB',
      aliases: ['hideDatabase'],
      signature: '(${1})',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        return new Group([
          new Hide(parameters[0], 9, 'ads-database-card', '', 'DB_MONITORING_SERVER_LIST', location),
          new Hide(parameters[0], 4, 'x-grid-row', '', 'DB_MONITORING_SERVER_LIST', location),
          new Hide(parameters[0], 2, 'ads-home-list-item', '', 'AD_HOME_OVERVIEW', location, function (_, parentNode) {
            return parentNode.getAttribute('ng-click').includes('ViewDbServer')
          })
        ])
      }
    },
    {
      name: 'hideBT',
      aliases: ['hideBusinessTransaction'],
      signature: '(${1})',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        return new Hide(parameters[0], 3, 'x-grid-row', '', 'APP_BT_LIST', location)
      }
    },
    {
      name: 'hideDashboard',
      aliases: [],
      signature: '(${1})',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        return new Group([
          new Hide(parameters[0], 2, 'ads-home-list-item', '', 'DASHBOARDS_REPORTS_HOME', location),
          new Hide(parameters[0], 3, 'x-grid-row', '', 'DASHBOARD_LIST', location, function (node, parentNode) {
            // Make sure that replacements with !not work on the dashboard list, so filter for the first cell
            return node.parentElement.parentElement.className.includes('x-grid-cell-first')
          }),
          new Hide(parameters[0], 2, 'ads-home-list-item', '', 'AD_HOME_OVERVIEW', location, function (_, parentNode) {
            return parentNode.getAttribute('ng-click').includes('ViewCustomDashboard')
          })
        ])
      }
    },
    {
      name: 'hideBusinessJourney',
      aliases: [],
      signature: '(${1})',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        return new Hide(parameters[0], 9, 'ads-analytics-business-outcomes-card-size', '', 'ANALYTICS_BUSINESS_OUTCOMES', location)
      }
    },
    {
      name: 'hideAnalyticsSearch',
      aliases: [],
      signature: '(${1})',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        return new Hide(parameters[0], 7, 'ui-grid-row', '', 'ANALYTICS_SEARCH_LIST', location)
      }
    },
    {
      name: 'hideRemoteService',
      aliases: [],
      signature: '(${1})',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        return new Hide(parameters[0], 3, 'x-grid-row', '', 'APP_BACKEND_LIST', location)
      }
    },
    {
      name: 'replaceFlowmapConnection',
      aliases: [],
      signature: '(${1}, ${2}) = ${3}',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        return new ReplaceFlowmapConnection(parameters[0], parameters[1], value, parameters[2])
      }
    },
    {
      name: 'hideFlowmapConnection',
      aliases: [],
      signature: '(${1}, ${2})',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        return new ReplaceFlowmapConnection(parameters[0], parameters[1], 'Hide')
      }
    },
    {
      name: 'hideBrowserPage',
      aliases: [],
      signature: '(${1})',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        return new Hide(parameters[0], 4, 'x-grid-row', '', 'EUM_PAGES_LIST', location)
      }
    },
    {
      name: 'replaceMobileScreenshot',
      aliases: [],
      signature: '() = ${1}',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        const thumbnailHtml = '<img src="' + value + '" height="152" width="84">'
        const screenshotHtml = '<img src="' + value + '" height="400" width="224">'
        return new Group([
          new OverwriteHTML('EUM_MOBILE_SESSION_DETAILS', 'ad-screenshot-tile-stitcher[ad-container-width="500"] > div', screenshotHtml, location),
          new OverwriteHTML('EUM_MOBILE_SESSION_DETAILS', 'ad-screenshot-tile-stitcher[ad-container-width="202"] > div', thumbnailHtml, location)
        ])
      }
    },
    {
      name: 'recolorDashboard',
      aliases: ['recolourDashboard'],
      signature: '(${1}, ${2}) = ${3}',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        return new RecolorDashboard(parameters[0], value, parameters[1], location)
      }
    },
    {
      name: 'setDashboardBackground',
      aliases: [],
      signature: '(${1:dashboardId}, ${2:opacity}) = ${3:imageUrl}',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        return new SetDashboardBackground(parameters[0], parameters[1], value, location)
      }
    },
    {
      name: 'replaceNodeCount',
      aliases: [],
      signature: '(${1}, ${2}) = ${3}',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        if (typeof value === 'string' && ['λ', 'lambda', 'otel', 'opentelemetry'].includes(value.toLowerCase())) {
          const imageName = ['λ', 'lambda'].includes(value.toLowerCase()) ? 'AWSLambda' : 'openTelemetry'
          return new Group([
            new ReplaceNeighbor(parameters[0], '', 2, 'text.adsNodeCountText', '', '', location),
            new ReplaceNeighbor(parameters[0], '', 2, 'text.adsNodeCountTextLarge', '', '', location),
            new ReplaceNeighbor(parameters[0], '', 2, 'text.adsNodeCountTextSmall', '', '', location),
            new ReplaceNeighbor(parameters[0], 'images/tierTypes/' + imageName + '.svg', 2, 'g.adsNodeCountContainer image', '', '', location, (search, replace, node) => {
              // <image transform="translate(-15, -15 )" width="30" height="30" xlink:href=""></image>
              const bg = node.parentElement.querySelector('.adsNodeCountBackground')
              if (bg && bg.style && bg.style.fill !== 'rgb(255, 255, 255)') {
                replace = 'images/tierTypes/' + imageName + '_white.svg'
              }
              if (node.href.baseVal !== replace) {
                const original = node.href.baseVal
                const originalWidth = node.width.baseVal.value
                const originalHeight = node.height.baseVal.value
                const originalTransform = node.transform
                node.href.baseVal = replace
                node.width.baseVal.value = 30
                node.height.baseVal.value = 30
                node.setAttribute('transform', 'translate(-15,-15)')
                return [
                  new UndoElement(node, 'href.baseVal', original, replace),
                  new UndoElement(node, 'width.baseVal.value', originalWidth, 30),
                  new UndoElement(node, 'height.baseVal.value', originalHeight, 30),
                  new UndoElement(node, 'transform', originalTransform, 'translate(-15,-15)')
                ]
              }
              return false
            })
          ])
        }
        if (typeof value === 'string' && value.includes(',')) {
          const [tierCount, nodeCount] = value.split(',')
          return new Group([
            new ReplaceNeighbor(parameters[0], tierCount, 2, 'g.adsApplicationNode text.adsNodeCountText:nth-of-type(1)', '', '', location),
            new ReplaceNeighbor(parameters[0], parseInt(tierCount) === 1 ? 'TIER' : 'TIERS', 2, 'g.adsApplicationNode text.adsNodeCountTextSmall:nth-of-type(2)', '', '', location),
            new ReplaceNeighbor(parameters[0], nodeCount, 2, 'g.adsApplicationNode text.adsNodeCountText:nth-of-type(3)', '', '', location),
            new ReplaceNeighbor(parameters[0], parseInt(nodeCount) === 1 ? 'NODE' : 'NODES', 2, 'g.adsApplicationNode text.adsNodeCountTextSmall:nth-of-type(4)', '', '', location)
          ])
        }
        return new Group([
          new ReplaceNeighbor(parameters[0], value, 2, 'g.adsTierNode text.adsNodeCountText', '', '', location),
          new ReplaceNeighbor(parameters[0], parseInt(value) === 1 ? 'Node' : 'Nodes', 2, 'g.adsTierNode text.adsNodeCountTextSmall', '', '', location),
          new ReplaceNeighbor(parameters[0], value, 2, 'g.adsApplicationNode text.adsNodeCountText:nth-of-type(3)', '', '', location),
          new ReplaceNeighbor(parameters[0], parseInt(value) === 1 ? 'NODE' : 'NODES', 2, 'g.adsApplicationNode text.adsNodeCountTextSmall:nth-of-type(4)', '', '', location)
        ])
      }
    },
    {
      name: 'replaceInnerNodeHealth',
      aliases: [],
      signature: '(${1}) = ${2}',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        if (value && ['normal', 'warning', 'critical'].includes(value.toLowerCase())) {
          value = { normal: 'rgb(0, 209, 128)', warning: 'rgb(255, 211, 1)', critical: 'rgb(255, 32, 46)' }[value.toLowerCase()]
        }
        return new ReplaceNeighbor(parameters[0], value, 2, '.adsNodeCountBackground', '', 'fill', location)
      }
    },
    {
      name: 'replaceOuterNodeHealth',
      aliases: [],
      signature: '(${1}, ${2}) = ${3}',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        if (value && ['normal', 'warning', 'critical'].includes(value.toLowerCase())) {
          value = { normal: 'rgb(0, 209, 128)', warning: 'rgb(255, 211, 1)', critical: 'rgb(255, 32, 46)' }[value.toLowerCase()]
        }
        if (parameters[1] && ['normal', 'warning', 'critical'].includes(parameters[1].toLowerCase())) {
          parameters[1] = { normal: '.adsNormalNodeColor', warning: '.adsWarningNodeColor', critical: '.adsCriticalNodeColor' }[parameters[1].toLowerCase()]
        } else {
          parameters[1] = '.adsNormalNodeColor'
        }
        return new ReplaceNeighbor(parameters[0], value, 2, parameters[1], '', 'fill', location)
      }
    },
    {
      name: 'replaceBusinessTransactionHealth',
      aliases: ['replaceBTHealth'],
      signature: '(${1}) = ${2}',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        // !appdynamics.replaceNeighbor(Homepage, 3, img.adsSvgIconSmall, ,src) = images/health/critical.svg
        if (value && ['normal', 'warning', 'critical'].includes(value.toLowerCase())) {
          value = { normal: 'images/health/normal.svg', warning: 'images/health/warning.svg', critical: 'images/health/critical.svg' }[value.toLowerCase()]
        }
        return new ReplaceNeighbor(parameters[0], value, 3, 'img.adsSvgIconSmall', '', 'src', location)
      }
    },
    {
      name: 'replaceFlowmapNode',
      aliases: [],
      signature: '(${1}) = ${2},${3},${4},${5},${6}',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        value = typeof value === 'string' ? extractParameters(value) : []
        const commands = [
          new ReplaceFlowmapIcon(parameters[0], value[1]),
          cmdBuilder._buildCustomCommand('appdynamics', 'replaceNodeCount', [parameters[0]], value[2]),
          cmdBuilder._buildCustomCommand('appdynamics', 'replaceInnerNodeHealth', [parameters[0]], value[3]),
          cmdBuilder._buildCustomCommand('appdynamics', 'replaceOuterNodeHealth', [parameters[0]], value[4])
        ].reduce((result, cmd, index) => {
          if (typeof value[index + 1] === 'string' && value[index + 1] !== '') {
            result.push(cmd)
          }
          return result
        }, [])
        return new Group(commands.concat(new SearchAndReplace(parameters[0], value[0])))
      }
    },
    {
      name: 'replaceBusinessTransactionOriginalName',
      aliases: ['replabeBTOriginalName'],
      signature: '(${1}) = ${2}',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        return new SearchAndReplace(parameters[0], value, 'APP_BT_LIST', 'tr td:nth-child(3) .x-grid-cell-inner', '', location)
      }
    },
    {
      name: 'replaceBT',
      aliases: ['replaceBusinessTransaction'],
      signature: '(${1}) = ${2}',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        if (typeof value !== 'string' || value === '') {
          return cmdBuilder._buildCustomCommand('appdynamics', 'hideBusinessTransaction', parameters, value)
        }
        value = extractParameters(value)
        const commands = [new SearchAndReplace(parameters[0], value[0])]
        if (typeof value[1] === 'string' && value[1] !== '') {
          commands.unshift(cmdBuilder._buildCustomCommand('appdynamics', 'replaceBusinessTransactionOriginalName', [parameters[0]], value[1]))
        }
        if (typeof value[1] === 'string' && value[2] !== '') {
          commands.unshift(cmdBuilder._buildCustomCommand('appdynamics', 'replaceBusinessTransactionHealth', [parameters[0]], value[2]))
        }
        return new Group(commands)
      }
    },
    {
      name: 'replaceIOTNumericWidget',
      aliases: [],
      signature: '(${1}) = ${2}',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        return new ReplaceNeighbor(parameters[0], value, 10, '.number-label', 'EUM_IOT_DEVICE_DASHBOARD', '', location)
      }
    },
    {
      name: 'replaceDrillDownHealth',
      aliases: ['replaceDrilldownHealth'],
      signature: '(${1}) = ${2}',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        const icon = (typeof value === 'string' && ['normal', 'warning', 'critical', 'unknown'].includes(value.toLowerCase())) ? 'images/health/' + value + '.svg' : 'images/health/unknown.svg'
        return new ReplaceNeighbor(parameters[0], icon, 2, '.ads-drill-down image', 'APP_SNAPSHOT_VIEW', 'href.baseVal', location)
      }
    },
    {
      name: 'replaceGeoStatus',
      aliases: [],
      signature: '(${1}) = ${2}',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        return new ReplaceGeoStatus(parameters[0], value)
      }
    },
    {
      name: 'removeFlowmapNode',
      aliases: [],
      signature: '(${1})',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        return new RemoveFlowmapNode(parameters[0])
      }
    },
    {
      name: 'addFlowmapNode',
      aliases: [],
      // constructor(name, type = 'java', nodeCount = 1, cpm = 50, art = 100, x = 400, y = 400) {
      signature: '(${1}, ${2}, ${3}, ${4}, ${5}, ${6}) = ${7}',
      command: function (value, parameters, location, includeRules, excludeRules, cmdBuilder) {
        return new AddFlowmapNode(value, parameters[0], parameters[1], parameters[2], parameters[3], parameters[4], parameters[5])
      }
    }
    ]
  }
]

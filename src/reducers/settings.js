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
import { v4 as uuidV4 } from 'uuid'

const optionalFeatures = function (state, action) {
  switch (action.type) {
    case 'TOGGLE_OPTIONAL_FEATURE':
      state[action.optionalFeature] = !state[action.optionalFeature]
      return state
    default:
      return state
  }
}

const connections = function (state, action) {
  switch (action.type) {
    case 'ADD_CONNECTION':
      if (action.connection.key === false) {
        return [
          ...state,
          Object.assign(action.connection, { key: uuidV4() })
        ]
      }
      return state.map(c => {
        if (c.key === action.connection.key) {
          return action.connection
        }
        return c
      })
    case 'REMOVE_CONNECTION':
      return state.filter(c => c.key !== action.key)
    default:
      return state
  }
}

const settings = function (state = '', action) {
  switch (action.type) {
    case 'SET_MONKEY_INTERVAL':
      return {
        ...state,
        monkeyInterval: action.monkeyInterval
      }
    case 'SET_DEMO_MONKEY_SERVER':
      return {
        ...state,
        demoMonkeyServer: action.demoMonkeyServer
      }
    case 'SET_BASE_TEMPLATE':
      return {
        ...state,
        baseTemplate: action.baseTemplate
      }
    case 'SET_ANALYTICS_SNIPPET':
      return {
        ...state,
        analyticsSnippet: action.analyticsSnippet
      }
    case 'SAVE_GLOBAL_VARIABLES':
      return {
        ...state,
        globalVariables: action.globalVariables
      }
    case 'TOGGLE_DEBUG_MODE':
      return {
        ...state,
        debugMode: !state.debugMode
      }
    case 'TOGGLE_LIVE_MODE':
      return {
        ...state,
        liveMode: !state.liveMode
      }
    case 'TOGGLE_OPTIONAL_FEATURE':
      return {
        ...state,
        optionalFeatures: optionalFeatures(state.optionalFeatures, action)
      }
    case 'ADD_CONNECTION':
    case 'REMOVE_CONNECTION':
      return {
        ...state,
        remoteConnections: connections(state.remoteConnections, action)
      }
    default:
      return state
  }
}

export default settings

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
import omit from 'lodash.omit'

function blocklist(object) {
  return omit(object, ['__v', 'owner', '_id'])
}

const configuration = (state, action) => {
  if (state && action.type === 'DELETE_CONFIGURATION_BY_PREFIX' && state.name.startsWith(action.prefix)) {
    return {
      ...state,
      enabled: false,
      updated_at: Date.now(),
      deleted_at: Date.now()
    }
  }
  if (state && state.id !== action.id) {
    return state
  }
  switch (action.type) {
    case 'TOGGLE_CONFIGURATION':
      return {
        ...state,
        enabled: typeof action.enabled !== 'undefined' ? action.enabled : !state.enabled
      }
    case 'ADD_CONFIGURATION':
      // id, created_at, updated_at can be overwritten by action.configuration
      // if it comes from a remote source.
      // We need to delete the action configuration if it is set to new, to make
      // this mechanism work properly.
      if (action.configuration.id === 'new') {
        delete action.configuration.id
      }
      return Object.assign({ id: uuidV4(), created_at: Date.now(), updated_at: Date.now() }, blocklist(action.configuration), { enabled: false })
    case 'SAVE_CONFIGURATION':
      // the last array is a hot fix for issue #16
      // saving the configuration should currently not include overwriting the enabled state
      return Object.assign({}, state, blocklist(action.configuration), { enabled: state.enabled, updated_at: action.sync === true ? action.configuration.updated_at : Date.now() })
    case 'DELETE_CONFIGURATION':
      return {
        ...state,
        enabled: false,
        updated_at: Date.now(),
        deleted_at: Date.now()
      }
    default:
      return state
  }
}

const configurations = function (state = [], action) {
  switch (action.type) {
    case 'TOGGLE_CONFIGURATION':
    case 'SAVE_CONFIGURATION':
    case 'DELETE_CONFIGURATION':
    case 'DELETE_CONFIGURATION_BY_PREFIX':
      return state.map(i =>
        configuration(i, action)
      )
    case 'BATCH_ADD_CONFIGURATION':
      return state.concat(action.configurations.map(c => configuration(undefined, { configuration: c, type: 'ADD_CONFIGURATION' })))
    case 'ADD_CONFIGURATION':
      // In the case of remote sync we have to protect ourselves against re-insertion
      if (action.sync === true && state.findIndex(c => c.id === action.configuration.id) !== -1) {
        return state
      }
      return [
        ...state,
        configuration(undefined, action)
      ]
    default:
      return state
  }
}

export default configurations

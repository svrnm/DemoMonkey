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

const configuration = (state, action) => {
  if (
    state &&
    action.type === 'DELETE_CONFIGURATION_BY_PREFIX' &&
    state.name.startsWith(action.prefix)
  ) {
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
      // We need to delete the action configuration if it is set to new, to make
      // this mechanism work properly.
      if (action.configuration.id === 'new') {
        delete action.configuration.id
      }
      return Object.assign(
        { id: uuidV4(), created_at: Date.now(), updated_at: Date.now() },
        action.configuration,
        { enabled: false }
      )
    case 'SAVE_CONFIGURATION':
      // the last array is a hot fix for issue #16
      // saving the configuration should currently not include overwriting the enabled state
      return Object.assign({}, state, action.configuration, {
        enabled: state.enabled,
        updated_at: Date.now()
      })
    case 'DELETE_CONFIGURATION':
      return {
        ...state,
        enabled: false,
        updated_at: Date.now(),
        deleted_at: Date.now()
      }
    case 'RESTORE_CONFIGURATION':
      const { deleted_at, ...rest } = state
      return {
        ...rest,
        enabled: false,
        updated_at: Date.now()
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
    case 'RESTORE_CONFIGURATION':
      return state.map((i) => configuration(i, action))
    case 'BATCH_ADD_CONFIGURATION':
      return state.concat(
        action.configurations.map((c) =>
          configuration(undefined, {
            configuration: c,
            type: 'ADD_CONFIGURATION'
          })
        )
      )
    case 'ADD_CONFIGURATION':
      return [...state, configuration(undefined, action)]
    case 'PERMANENTLY_DELETE_CONFIGURATION':
      return state.filter((c) => c.id !== action.id)
    case 'REMOVE_DELETED_CONFIGURATIONS':
      return state.filter((c) => !c.deleted_at)
    case 'REMOVE_DELETED_CONFIGURATIONS_AFTER_30_DAYS':
      return state.filter((c) => {
        if (!c.deleted_at) {
          return true
        }
        const deletedDate = new Date(c.deleted_at)
        const currentDate = new Date()
        const diffTime = Math.abs(currentDate - deletedDate)
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
        return diffDays < 30 // Keep configurations deleted less than 30 days
      })
    default:
      return state
  }
}

export default configurations

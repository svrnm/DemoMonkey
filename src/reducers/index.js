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
import { combineReducers } from 'redux'
import configurations from './configurations'
import connectionState from './connectionState'
import settings from './settings'
import monkeyID from './monkeyID'
import log from './log'

/*
This seems not to be the "way to go", but it fixes a lot of issues right now.
(https://github.com/reduxjs/redux/issues/580#issuecomment-133188511)
*/
const lastAction = function (state = '', action) {
  return action
}

const reducers = combineReducers({
  configurations,
  connectionState,
  settings,
  monkeyID,
  lastAction,
  log
})

export default reducers

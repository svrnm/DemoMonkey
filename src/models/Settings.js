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
class Settings {
  constructor(settings) {
    this.baseTemplate = typeof settings.baseTemplate === 'string' ? settings.baseTemplate : ''
    this.analyticsSnippet = typeof settings.analyticsSnippet === 'string' ? settings.analyticsSnippet : ''
    this.optionalFeatures = typeof settings.optionalFeatures === 'object' ? settings.optionalFeatures : {}
    this.connectors = typeof settings.connectors === 'object' ? settings.connectors : {}
    this.monkeyInterval = typeof settings.monkeyInterval === 'number' ? settings.monkeyInterval : parseInt(settings.monkeyInterval)
    this.debugMode = typeof settings.debugMode === 'boolean' ? settings.debugMode : false
    this.liveMode = typeof settings.liveMode === 'boolean' ? settings.liveMode : false
    this.globalVariables = Array.isArray(settings.globalVariables) ? settings.globalVariables : []
  }

  isFeatureEnabled(featureName) {
    return typeof this.optionalFeatures[featureName] !== 'undefined' && this.optionalFeatures[featureName] === true
  }

  isDebugEnabled() {
    return this.debugMode
  }

  isLiveModeEnabled() {
    return this.liveMode
  }
}

export default Settings

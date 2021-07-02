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

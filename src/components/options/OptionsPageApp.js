/* global chrome */
import React from 'react'
import Navigation from './navigation/Navigation'
import { connect } from 'react-redux'
import Popup from 'react-popup'
import Help from './Help'
import Settings from './settings/Settings'
import Logs from './Logs'
import Editor from './editor/Editor'
import Configuration from '../../models/Configuration'
import PropTypes from 'prop-types'
import Repository from '../../models/Repository'
import { Base64 } from 'js-base64'
import ErrorBox from '../shared/ErrorBox'
import WarningBox from '../shared/WarningBox'
import Page from '../shared/Page'
import JSZip from 'jszip'
import { logger } from '../../helpers/logger'

/* The OptionsPageApp will be defined below */
class App extends React.Component {
  static propTypes = {
    actions: PropTypes.objectOf(PropTypes.func).isRequired,
    configurations: PropTypes.arrayOf(PropTypes.object).isRequired,
    initialView: PropTypes.string.isRequired,
    onCurrentViewChange: PropTypes.func.isRequired,
    settings: PropTypes.object.isRequired,
    log: PropTypes.arrayOf(PropTypes.object).isRequired,
    permissions: PropTypes.object.isRequired
  }

  static getDerivedStateFromError(e) {
    return { withError: e }
  }

  constructor(props) {
    super(props)
    this.isSaving = false
    this.state = {
      isDarkMode: window.matchMedia('(prefers-color-scheme: dark)').matches,
      withError: false,
      permissions: this.props.permissions,
      currentView: this.props.initialView
    }
  }

  _getDarkMode() {
    if (this.props.settings.optionalFeatures.syncDarkMode) {
      return this.state.isDarkMode
    }
    return this.props.settings.optionalFeatures.preferDarkMode
  }

  componentDidMount() {
    this.mql = window.matchMedia('(prefers-color-scheme: dark)')
    this.darkModeUpdated = (e) => {
      this.setState({ isDarkMode: e.matches })
    }
    this.mql.addListener(this.darkModeUpdated)

    this.permissionsUpdated = () => {
      chrome.permissions.getAll((permissions) => {
        logger('info', 'Permissions updated:', permissions).write()
        this.setState({ permissions })
      })
    }

    if (chrome.permissions.onAdded) {
      chrome.permissions.onAdded.addListener(this.permissionsUpdated)
      chrome.permissions.onRemoved.addListener(this.permissionsUpdated)
    }
  }

  componentWillUnmount() {
    this.mql.removeListener(this.darkModeUpdated)
    if (chrome.permissions.onAdded) {
      chrome.permissions.onAdded.removeListener(this.permissionsUpdated)
      chrome.permissions.onRemoved.removeListener(this.permissionsUpdated)
    }
    window.removeListener('onpopstate', this.ops)
    delete this.mql
    delete this.permissionsUpdated
  }

  navigateTo(target) {
    this.setState({ currentView: target }, () => {
      this.props.onCurrentViewChange(target)
    })
  }

  downloadAll(event, cb = () => {}) {
    event.preventDefault()
    const zip = new JSZip()

    this.props.configurations.forEach((configuration) => {
      zip.file(configuration.name + '.mnky', configuration.content)
    })

    zip.generateAsync({ type: 'base64' })
      .then(function (content) {
        const link = document.createElement('a')
        link.href = 'data:application/zip;base64,' + content
        link.download = 'demomonkey-' + (new Date()).toISOString().split('T')[0] + '.zip'
        const event = document.createEvent('MouseEvents')
        event.initEvent('click', true, true)
        link.dispatchEvent(event)
        cb()
      })
  }

  deleteAll() {
    Popup.create({
      title: 'Please confirm',
      content: <span>Do you really want to delete all configurations?</span>,
      buttons: {
        left: [{
          text: 'Cancel',
          action: () => Popup.close()
        }],
        right: [{
          text: 'Delete',
          className: 'danger',
          action: () => {
            Popup.close()
            this.downloadAll(() => {
              this.props.configurations.forEach(config => {
                this.props.actions.deleteConfiguration(config.id)
              })
            })
          }
        }]
      }
    })
  }

  saveConfigurationUnguarded(configuration) {
    if (configuration.id === 'new') {
      return this.addConfiguration(configuration)
    } else {
      if (typeof configuration.values !== 'undefined') {
        const variables = (new Configuration(configuration.content, this.getRepository(), false, configuration.values)).getVariables().map(v => v.id)

        Object.keys(configuration.values).forEach(name => {
          if (!variables.includes(name)) {
            delete configuration.values[name]
          }
        })
      }

      // Auto Save on Enter can lead to some state-props-async issues
      // We make sure here that "saving" is finished when the state is
      // written.
      if (!this.isSaving) {
        this.isSaving = true
        this.props.actions.saveConfiguration(configuration.id, configuration).then(() => {
          this.isSaving = false
          console.log('Saved')
        })
      }
    }
  }

  saveConfiguration(configuration) {
    const configWithSameName = this.props.configurations.find(c => !c.deleted_at && c.name === configuration.name && c.id !== configuration.id)
    if (configWithSameName) {
      Popup.create({
        title: 'Please confirm',
        content: <span>A configuration with <b>{configuration.name} already exists. Do you really want to use this name</b>?</span>,
        buttons: {
          left: [{
            text: 'Cancel',
            action: () => Popup.close()
          }],
          right: [{
            text: 'Save',
            className: 'danger',
            action: () => {
              Popup.close()
              this.saveConfigurationUnguarded(configuration)
            }
          }]
        }
      })
    } else {
      this.saveConfigurationUnguarded(configuration)
    }
  }

  uploadConfiguration(upload) {
    if (Array.isArray(upload)) {
      this.props.actions.batchAddConfiguration(upload)
    } else {
      this.addConfiguration(upload)
    }
  }

  addConfiguration(configuration) {
    this.props.actions.addConfiguration(configuration).then(() => {
      const latest = this.props.configurations[this.props.configurations.length - 1]
      console.log(latest)
      this.navigateTo('configuration/' + latest.id)
    })
  }

  copyConfiguration(configuration) {
    const path = configuration.name.split('/')
    const name = 'Copy of ' + path.pop()
    this.addConfiguration({
      ...configuration,
      name: path.length > 0 ? (path.join('/') + '/' + name) : name,
      id: 'new',
      file_id: undefined,
      enabled: false,
      readOnly: false
    })
  }

  downloadConfiguration(configuration) {
    const link = document.createElement('a')
    link.href = 'data:text/octet-stream;base64,' + Base64.encode(configuration.content)
    link.download = configuration.name.split('/').pop() + '.mnky'
    const event = document.createEvent('MouseEvents')
    event.initEvent('click', true, true)
    link.dispatchEvent(event)
  }

  deleteConfiguration(configuration) {
    Popup.create({
      title: 'Please confirm',
      content: <span>Do you really want to remove <b>{configuration.name}</b>?</span>,
      buttons: {
        left: [{
          text: 'Cancel',
          action: () => Popup.close()
        }],
        right: [{
          text: 'Delete',
          className: 'danger',
          action: () => {
            Popup.close()
            this.navigateTo('help')
            // Delete all configurations within it if a directory is given
            logger('info', `Deleting ${configuration.name} (${configuration.nodeType})`).write()
            if (configuration.nodeType === 'directory') {
              this.props.actions.deleteConfigurationByPrefix(configuration.id.split('/').reverse().join('/'))
            } else {
              this.props.actions.deleteConfiguration(configuration.id)
            }
          }
        }]
      }
    })
  }

  getRepository() {
    return this._repo
  }

  updateRepository() {
    this._repo = new Repository(this.getConfigurations().reduce(function (repo, rawConfig) {
      repo[rawConfig.name] = new Configuration(rawConfig.content)
      return repo
    }, {}))
  }

  getConfigurations() {
    return this.props.configurations.filter((config) => typeof config.deleted_at === 'undefined' && typeof config._deleted === 'undefined')
  }

  getConfiguration(id) {
    if (id === 'create' || id === 'new') {
      return {
        name: '',
        content: this.props.settings.baseTemplate,
        id: 'new',
        hotkeys: []
      }
    }
    if (id === 'latest') {
      return this.props.configurations[this.props.configurations.length - 1]
    }
    return this.props.configurations.find((item) => item.id === id)
  }

  registerProtocolHandler() {
    const url = chrome.runtime.getURL('/options.html?s=%s')
    const method = this.props.settings.optionalFeatures.registerProtocolHandler ? 'registerProtocolHandler' : 'unregisterProtocolHandler'
    console.log(method)
    window.navigator[method](
      'web+mnky',
      url,
      'Demo Monkey Handler')
  }

  toggleOptionalFeature(feature) {
    this.props.actions.toggleOptionalFeature(feature).then(() => {
      if (feature === 'registerProtocolHandler') {
        this.registerProtocolHandler()
      }
    })
  }

  setBaseTemplate(baseTemplate) {
    this.props.actions.setBaseTemplate(baseTemplate)
  }

  saveGlobalVariables(globalVariables) {
    this.props.actions.saveGlobalVariables(globalVariables)
  }

  setMonkeyInterval(interval) {
    this.props.actions.setMonkeyInterval(interval)
  }

  getCurrentView() {
    if (this.state.withError) {
      return <ErrorBox error={this.state.withError} />
    }

    try {
      const segments = this.state.currentView.split('/')
      const configuration = this.getConfiguration(segments[1])

      this.updateRepository()

      switch (segments[0]) {
        case 'settings':
          return <Settings settings={this.props.settings}
            configurations={this.props.configurations}
            onToggleOptionalFeature={(feature) => this.toggleOptionalFeature(feature)}
            onSetBaseTemplate={(baseTemplate) => this.setBaseTemplate(baseTemplate)}
            onSaveGlobalVariables={(globalVariables) => this.saveGlobalVariables(globalVariables)}
            onSetMonkeyInterval={(value) => this.setMonkeyInterval(value)}
            onDownloadAll={(event) => this.downloadAll(event)}
            onDeleteAll={(event) => this.deleteAll(event)}
            onRequestExtendedPermissions={(revoke) => this.requestExtendedPermissions(revoke)}
            hasExtendedPermissions={this.hasExtendedPermissions()}
            isDarkMode={this._getDarkMode()}
            activeTab={segments[1]}
            onNavigate={(target) => this.navigateTo('settings/' + target)}
          />
        case 'configuration':
          // If an unknown ID is selected, we throw an error.
          if (typeof configuration === 'undefined') {
            return <ErrorBox error={{ message: `Unknown Configuration ${segments[1]}` }} />
          }
          return <Editor getRepository={() => this.getRepository()}
            currentConfiguration={configuration}
            globalVariables={this.props.settings.globalVariables}
            autoSave={this.props.settings.optionalFeatures.autoSave}
            saveOnClose={this.props.settings.optionalFeatures.saveOnClose}
            editorAutocomplete={this.props.settings.optionalFeatures.editorAutocomplete}
            keyboardHandler={this.props.settings.optionalFeatures.keyboardHandlerVim ? 'vim' : null}
            onDownload={(configuration, _) => this.downloadConfiguration(configuration)}
            onSave={(_, configuration) => this.saveConfiguration(configuration)}
            onCopy={(configuration, _) => this.copyConfiguration(configuration)}
            onDelete={(configuration, _) => this.deleteConfiguration(configuration)}
            toggleConfiguration={() => this.props.actions.toggleConfiguration(configuration.id)}
            featureFlags={{
              withEvalCommand: this.props.settings.optionalFeatures.withEvalCommand,
              hookIntoAjax: this.props.settings.optionalFeatures.hookIntoAjax,
              webRequestHook: this.props.settings.optionalFeatures.webRequestHook
            }}
            isDarkMode={this._getDarkMode()}
            activeTab={segments[2]}
            onNavigate={(target) => this.navigateTo('configuration/' + configuration.id + '/' + target)}
          />
        case 'logs':
          return <Logs entries={this.props.log} />
        default:
          return <Help />
      }
    } catch (e) {
      return <ErrorBox error={e} />
    }
  }

  hasExtendedPermissions() {
    const permissions = this.state.permissions
    if (Array.isArray(permissions.origins) && permissions.origins.length > 0) {
      return permissions.origins.includes('http://*/*') && permissions.origins.includes('https://*/*')
    }
    return false
  }

  requestExtendedPermissions(revoke = false) {
    console.log(revoke)
    if (revoke) {
      chrome.permissions.remove({
        origins: ['http://*/*', 'https://*/*']
      }, function (removed) {
        if (removed) {
          logger('info', 'Additional permissions removed')
        } else {
          logger('warn', 'Additional permissions not removed')
        }
      })
    } else {
      chrome.permissions.request({
        origins: ['http://*/*', 'https://*/*']
      }, function (granted) {
        if (granted) {
          logger('info', 'Additional permissions granted')
        } else {
          logger('warn', 'Additional permissions not granted')
        }
      })
    }
  }

  render() {
    const activeItem = this.state.currentView.indexOf('configuration/') === -1 ? false : this.state.currentView.split('/').pop()

    const withWarning = (!this.hasExtendedPermissions() && !this.props.settings.optionalFeatures.noWarningForMissingPermissions) ? ' with-warning' : ''

    // Add tags to all configurations
    const configurations = this.getConfigurations().map(c => {
      const nsPattern = /^@tags(?:\[\])?\s*=\s*(.*)$/mg
      let match
      c.tags = []
      while ((match = nsPattern.exec(c.content))) {
        c.tags = c.tags.concat(match[1].split(',').map(t => t.trim().toLowerCase()))
      }
      return c
    })

    return <Page className={`main-grid${withWarning}`} preferDarkMode={this.props.settings.optionalFeatures.preferDarkMode} syncDarkMode={this.props.settings.optionalFeatures.syncDarkMode}>
      <Popup className="popup" btnClass="popup__btn" />
      { withWarning !== ''
        ? <WarningBox onDismiss={() => this.toggleOptionalFeature('noWarningForMissingPermissions')}
          onRequestExtendedPermissions={() => this.requestExtendedPermissions()}
        />
        : <div id="has-extended-permissions" style={{ display: 'none' }}>GRANTED</div> }
      <div className="navigation">
        <Navigation onNavigate={(target) => this.navigateTo(target)}
          onUpload={(upload) => this.uploadConfiguration(upload)}
          onDelete={(configuration) => this.deleteConfiguration(configuration)}
          items={configurations}
          onDownloadAll={(event) => this.downloadAll(event)}
          active={activeItem}
          showLogs={this.props.settings.optionalFeatures.writeLogs === true}
        />
      </div>
      <div className="current-view">
        {this.getCurrentView()}
      </div>
    </Page>
  }
}

const OptionsPageApp = connect(
  // map state to props
  state => {
    return {
      configurations: state.configurations,
      settings: state.settings,
      log: state.log
    }
  },
  // map dispatch to props
  dispatch => ({
    actions: {
      setMonkeyInterval: (monkeyInterval) => {
        dispatch({ type: 'SET_MONKEY_INTERVAL', monkeyInterval })
      },
      toggleConfiguration: (id) => {
        dispatch({ type: 'TOGGLE_CONFIGURATION', id: id })
      },
      saveConfiguration: (id, configuration) => {
        return dispatch({ type: 'SAVE_CONFIGURATION', id, configuration })
      },
      deleteConfiguration: (id) => {
        dispatch({ type: 'DELETE_CONFIGURATION', id })
      },
      deleteConfigurationByPrefix: (prefix) => {
        dispatch({ type: 'DELETE_CONFIGURATION_BY_PREFIX', prefix })
      },
      batchAddConfiguration: (configurations) => {
        return dispatch({ type: 'BATCH_ADD_CONFIGURATION', configurations })
      },
      addConfiguration: (configuration) => {
        return dispatch({ type: 'ADD_CONFIGURATION', configuration })
      },
      setBaseTemplate: (baseTemplate) => {
        dispatch({ type: 'SET_BASE_TEMPLATE', baseTemplate })
      },
      saveGlobalVariables: (globalVariables) => {
        dispatch({ type: 'SAVE_GLOBAL_VARIABLES', globalVariables })
      },
      toggleOptionalFeature: (optionalFeature) => {
        return dispatch({ type: 'TOGGLE_OPTIONAL_FEATURE', optionalFeature })
      }
    }
  }))(App)

export default OptionsPageApp

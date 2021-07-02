import React from 'react'
import ToggleButton from 'react-toggle-button'
import PropTypes from 'prop-types'
import AceEditor from 'react-ace'
import Tabs from '../../shared/Tabs'
import Pane from '../../shared/Pane'
import GlobalVariables from './GlobalVariables'
import CodeEditor from '../editor/CodeEditor'

import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/theme-xcode'
import 'ace-builds/src-noconflict//theme-merbivore'
import 'ace-builds/src-noconflict/ext-searchbox'

import '../editor/ace/mnky'

class Settings extends React.Component {
  static propTypes = {
    settings: PropTypes.object.isRequired,
    configurations: PropTypes.arrayOf(PropTypes.object).isRequired,
    onSetBaseTemplate: PropTypes.func.isRequired,
    onSetAnalyticsSnippet: PropTypes.func.isRequired,
    getRepository: PropTypes.func.isRequired,
    onSaveGlobalVariables: PropTypes.func.isRequired,
    onSetMonkeyInterval: PropTypes.func.isRequired,
    onToggleOptionalFeature: PropTypes.func.isRequired,
    onDownloadAll: PropTypes.func.isRequired,
    onDeleteAll: PropTypes.func.isRequired,
    isDarkMode: PropTypes.bool.isRequired,
    hasExtendedPermissions: PropTypes.bool.isRequired,
    onRequestExtendedPermissions: PropTypes.func.isRequired,
    activeTab: PropTypes.string,
    onNavigate: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      analyticsSnippet: this.props.settings.analyticsSnippet,
      baseTemplate: this.props.settings.baseTemplate,
      monkeyInterval: this.props.settings.monkeyInterval,
      archiveValue: 30
    }
  }

  updateMonkeyInterval(e) {
    this.setState({
      monkeyInterval: e.target.value
    })
  }

  updateArchiveValue(e) {
    this.setState({
      archiveValue: e.target.value
    })
  }

  saveMonkeyInterval() {
    this.props.onSetMonkeyInterval(this.state.monkeyInterval)
  }

  updateAnalyticsSnippet(analyticsSnippet) {
    this.setState({
      analyticsSnippet
    })
  }

  updateBaseTemplate(baseTemplate) {
    this.setState({
      baseTemplate
    })
  }

  saveBaseTemplate() {
    this.props.onSetBaseTemplate(this.state.baseTemplate)
  }

  saveAnalyticsSnippet() {
    this.props.onSetAnalyticsSnippet(this.state.analyticsSnippet)
  }

  render() {
    const optionalFeatures = [
      {
        id: 'undo',
        label: 'Undo replacements',
        description: 'when configuration is disabled'
      },
      {
        id: 'autoReplace',
        label: 'Automatically apply replacements',
        description: <span>when configuration is saved. <i>(This will also disable undo)</i></span>
      },
      {
        id: 'autoSave',
        label: 'Save configuration on line break'
      },
      {
        id: 'saveOnClose',
        label: 'Save configuration when it is closed'
      },
      {
        id: 'editorAutocomplete',
        label: 'Autocomplete.',
        description: 'The editor for configurations will display an auto completion for commands, options & imports.'
      },
      {
        id: 'onlyShowAvailableConfigurations',
        label: 'Only show available configurations.',
        description: 'Set the default value for the popup toggle, which hides configurations that are not available for the current url.'
      },
      {
        id: 'webRequestHook',
        label: 'Hook into Web Requests.',
        description: <span>Turn this feature on, if you want to use the commands !delayUrl, !blockUrl and !redirectUrl. <b>This will allow DemoMonkey to intercept, block, or modify requests in-flight</b>. To learn what this means, read about <a target="blank" rel="noopener noreferer" href="https://developer.chrome.com/extensions/webRequest">chrome.webRequest</a></span>
      },
      {
        id: 'debugBox',
        label: 'Expand Debug Box',
        description: <span>Turn this feature on, to show the debug box with statistics in full length when running demo monkey in <i>debug mode</i></span>
      },
      {
        id: 'keyboardHandlerVim',
        label: 'VIM Keyboard Handler.',
        description: 'Turn this feature on, to use the vim keyboard handler for the editor.'
      },
      {
        id: 'withEvalCommand',
        label: 'Allow !eval.',
        description: 'By turning on this flag, you can use the command !eval which allows you to write arbitrary javascript code. Use with caution!'
      },
      {
        id: 'hookIntoAjax',
        label: 'Hook into Ajax.',
        description: '(Experimental) Turn this feature on, if you want to use commands !removeFlowmapNode, !addFlowmapNode, etc. Those commands are implemented by hooking into ajax calls, use with caution!'
      },
      {
        id: 'syncDarkMode',
        label: 'Sync Dark/Light mode with OS setting.',
        description: 'Automatically switch between dark and light mode.'
      },
      {
        id: 'preferDarkMode',
        style: { display: this.props.settings.optionalFeatures.syncDarkMode ? 'none' : 'flex' },
        label: 'Use dark mode.',
        description: <span>Use this toggle to set <i>dark mode</i> as your prefered theme.</span>
      },
      {
        id: 'noWarningForMissingPermissions',
        style: { display: this.props.hasExtendedPermissions ? 'none' : 'flex' },
        label: 'No warning for missing permissions.',
        description: 'To work best, DemoMonkey requires permissions to interact with all sites, and will warn you if you don\'t provide those permissions. Turn this feature on to remove this warning.'
      },
      {
        id: 'registerProtocolHandler',
        label: 'Register Protocol Handler.',
        description: 'Turn this feature on to register web+mnky to be handled by demomonkey.'
      },
      {
        id: 'writeLogs',
        label: 'Write Logs.',
        description: <span>Turn this feature on to have a DemoMonkey logs accessible via the <b>Logs</b> navigation item.</span>
      }
    ]

    return (
      <div className="content">
        <div className="settings">
          <h1>Settings</h1>
          <Tabs activeTab={this.props.activeTab} onNavigate={this.props.onNavigate}>
            <Pane label="Optional Features" name="optionalFeatures">
              <label>
                Optional features can be toggled on or off to influence the behaviour of DemoMonkey.
              </label>
              {
                optionalFeatures.map((feature, index) => {
                  return <div key={index} className="toggle-group" id={`toggle-${feature.id}`} style={feature.style ? feature.style : {}}>
                    <ToggleButton
                      onToggle={() => this.props.onToggleOptionalFeature(feature.id)}
                      value={this.props.settings.optionalFeatures[feature.id]}
                    />
                    <label>
                      <b>{feature.label}</b> {feature.description}
                    </label>
                  </div>
                })
              }
            </Pane>
            <Pane label="Base Template" name="baseTemplate">
                <label htmlFor="template">
                  <p>
                    This base template will be used for new configurations you create. It will auto-save while you edit it.
                  </p>
                  <p>
                    <button className="save-button" onClick={() => this.saveBaseTemplate()}>Save</button>
                    <span style={{ display: this.props.settings.baseTemplate === this.state.baseTemplate ? 'none' : 'inline' }} className="unsaved-warning">(Unsaved Changes)</span>
                  </p>
                </label>
                <CodeEditor value={this.state.baseTemplate}
                  onChange={(content) => this.updateBaseTemplate(content)}
                  annotations={(content) => {}}
                  getRepository={this.props.getRepository}
                  variables={[]}
                  onVimWrite={() => this.handleClick(null, 'save')}
                  onAutoSave={(event) => this.props.settings.optionalFeatures.autoSave ? this.saveBaseTemplate() : event.preventDefault() }
                  keyboardHandler={this.props.settings.optionalFeatures.keyboardHandlerVim ? 'vim' : null}
                  editorAutocomplete={this.props.settings.optionalFeatures.editorAutocomplete}
                  isDarkMode={this.props.isDarkMode}
                />
            </Pane>
            <Pane label="Global Variables" name="globalVariables">
              <GlobalVariables globalVariables={this.props.settings.globalVariables} onSaveGlobalVariables={this.props.onSaveGlobalVariables} isDarkMode={this.props.isDarkMode} />
            </Pane>
            <Pane label="Demo Analytics" name="analytics">
              <div>
                <label htmlFor="template">
                  <p>
                    If your demo team asks you to provide analytics on your usage of their platform, this is the right place!
                    Put a snippet of any end user monitoring or analytics solution (AppDynamics, Matamo, Plausible) into this box
                    and it will be injected when an @include[] in your demo configuration matches.
                  </p>
                  <p>
                    <button className="save-button" onClick={() => this.saveAnalyticsSnippet()}>Save</button>
                    <span style={{ display: this.props.settings.analyticsSnippet === this.state.analyticsSnippet ? 'none' : 'inline' }} className="unsaved-warning">(Unsaved Changes)</span>
                  </p>
                </label>
                <AceEditor
                  height="400px"
                  width="100%"
                  minLines={20}
                  theme={ this.props.isDarkMode ? 'merbivore' : 'xcode' }
                  mode="html"
                  value={this.state.analyticsSnippet}
                  name="template"
                  onChange={(content) => this.updateAnalyticsSnippet(content)}
                  editorProps={{ $blockScrolling: true }}
                  />
              </div>
            </Pane>
            <Pane label="More" name="more">
              <h2>{'Monkey\'s Behavior'}</h2>
              <label>Change this value if you experience performance issues with DemoMonkey. A higher value means less frequent updates. Default is 100.</label>
              <b>Update interval: </b>
              <input type="number" min="50" max="1000" value={this.state.monkeyInterval} onChange={(e) => this.updateMonkeyInterval(e)} />
              <button className="save-button" onClick={(e) => this.saveMonkeyInterval(e)}>save</button>
              <h2>Permissions</h2>
              For DemoMonkey to work optimal you have to grant permissions to access all websites.
              <div className="toggle-group" id="toggle-beta_configSync">
                <ToggleButton onToggle={() => this.props.onRequestExtendedPermissions(this.props.hasExtendedPermissions)} value={this.props.hasExtendedPermissions}/><label><b>Allow access on all sites.</b> Allow DemoMonkey to read and change data on all sites you visit.</label>
              </div>
              If you can not revoke permissions from here, go to the extensions page, choose Demo Monkey, click on <i>Details</i> and there set <i>Site Access</i> to <i>On click</i>
              <h2>Backup</h2>
              You can always open the <a href="backup.html">backup page</a> to download your files or manipulate your settings. Please use with caution!
              <button className="save-button" onClick={(event) => this.props.onDownloadAll(event)}>Download all configurations</button>
              <button className="delete-button" onClick={(event) => this.props.onDeleteAll(event)}>Download & Delete all configurations</button>
            </Pane>
          </Tabs>
        </div>
      </div>
    )
  }
}

export default Settings

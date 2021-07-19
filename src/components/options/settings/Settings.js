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
import React from 'react'
import ToggleButton from 'react-toggle-button'
import PropTypes from 'prop-types'
import AceEditor from 'react-ace'
import Tabs from '../../shared/Tabs'
import Pane from '../../shared/Pane'
import GlobalVariables from './GlobalVariables'
import CodeEditor from '../editor/CodeEditor'
import OptionalFeature from '../../../models/OptionalFeature'

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
    onReset: PropTypes.func.isRequired,
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
    const optionalFeatures = OptionalFeature.getAll({
      styles: {
        preferDarkMode: { display: this.props.settings.optionalFeatures.syncDarkMode ? 'none' : 'flex' }
      }
    })

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
              <button className="delete-button" onClick={(event) => this.props.onReset(event)}>Reset DemoMonkey</button>
            </Pane>
          </Tabs>
        </div>
      </div>
    )
  }
}

export default Settings

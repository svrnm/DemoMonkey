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
import Switch from '@mui/material/Switch'
import AceEditor from 'react-ace'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Tooltip from '@mui/material/Tooltip'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import TabPanel from '../../shared/TabPanel'
import GlobalVariables from './GlobalVariables'
import CodeEditor from '../editor/CodeEditor'
import OptionalFeature from '../../../models/OptionalFeature'
import Popup from '../../shared/Popup'

import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/theme-xcode'
import 'ace-builds/src-noconflict//theme-merbivore'
import 'ace-builds/src-noconflict/ext-searchbox'

import '../editor/ace/mnky'

const TAB_NAMES = [
  'optionalFeatures',
  'baseTemplate',
  'globalVariables',
  'analytics',
  'trash',
  'more'
]

class Settings extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      analyticsSnippet: this.props.settings.analyticsSnippet,
      baseTemplate: this.props.settings.baseTemplate,
      monkeyInterval: this.props.settings.monkeyInterval,
      archiveValue: 30,
      showResetPopup: false,
      showDeleteAllPopup: false,
      showTrashAllPopup: false
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

  onBeforeReset() {
    this.setState({ showResetPopup: true })
  }

  onCancelReset() {
    this.setState({ showResetPopup: false })
  }

  onCancelTrashAll() {
    this.setState({ showTrashAllPopup: false })
  }

  onBeforeTrashAll() {
    this.setState({ showTrashAllPopup: true })
  }

  onReset(event) {
    this.setState({ showResetPopup: false })
    this.props.onReset(event)
  }

  onBeforeDeleteAll() {
    this.setState({ showDeleteAllPopup: true })
  }

  onCancelDeleteAll() {
    this.setState({ showDeleteAllPopup: false })
  }

  onDeleteAll(event) {
    this.setState({ showDeleteAllPopup: false })
    this.props.onDeleteAll(event)
  }

  onTrashAll(event) {
    this.setState({ showTrashAllPopup: false })
    this.props.onTrashAll(event)
  }

  _getTabIndex() {
    const idx = TAB_NAMES.indexOf(this.props.activeTab)
    return idx >= 0 ? idx : 0
  }

  render() {
    const optionalFeatures = OptionalFeature.getAll({
      styles: {
        preferDarkMode: {
          display: this.props.settings.optionalFeatures.syncDarkMode ? 'none' : 'flex'
        }
      }
    })

    const hasDeletedConfigurations = this.props.configurations.some((c) => c.deleted_at)

    const tabIndex = this._getTabIndex()

    return (
      <div className="content">
        <div className="settings">
          <h1>Settings</h1>
          <Tabs
            value={tabIndex}
            onChange={(e, newValue) => this.props.onNavigate(TAB_NAMES[newValue])}
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="Optional Features" />
            <Tab label="Base Template" />
            <Tab label="Global Variables" />
            <Tab label="Demo Analytics" />
            <Tab label="Trash" />
            <Tab label="More" />
          </Tabs>
          <TabPanel value={tabIndex} index={0}>
            <p style={{ color: 'var(--help-text-color)', margin: '16px 0 20px' }}>
              Toggle features on or off to customize the behaviour of DemoMonkey.
            </p>
            {OptionalFeature.getGroups().map((group) => (
              <div key={group} className="feature-group">
                <h3 className="feature-group-title">{group}</h3>
                <div className="feature-group-items">
                  {optionalFeatures
                    .filter((f) => f.group === group)
                    .map((feature) => (
                      <div
                        key={feature.id}
                        className="feature-item"
                        id={`toggle-${feature.id}`}
                        style={feature.style ? feature.style : {}}
                      >
                        <div className="feature-item-toggle">
                          <Switch
                            size="small"
                            onChange={() => this.props.onToggleOptionalFeature(feature.id)}
                            checked={this.props.settings.optionalFeatures[feature.id]}
                          />
                        </div>
                        <div className="feature-item-text">
                          <div className="feature-item-label">{feature.label}</div>
                          {feature.description && (
                            <div className="feature-item-description">{feature.description}</div>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </TabPanel>
          <TabPanel value={tabIndex} index={1}>
            <label htmlFor="template">
              <p>
                This base template will be used for new configurations you create. It will auto-save
                while you edit it.
              </p>
              <p>
                <Button variant="contained" color="success" onClick={() => this.saveBaseTemplate()}>
                  Save
                </Button>
                <span
                  style={{
                    display:
                      this.props.settings.baseTemplate === this.state.baseTemplate
                        ? 'none'
                        : 'inline',
                    marginLeft: '8px'
                  }}
                  className="unsaved-warning"
                >
                  (Unsaved Changes)
                </span>
              </p>
            </label>
            <CodeEditor
              value={this.state.baseTemplate}
              onChange={(content) => this.updateBaseTemplate(content)}
              annotations={(content) => {}}
              getRepository={this.props.getRepository}
              variables={[]}
              onVimWrite={() => this.handleClick(null, 'save')}
              onAutoSave={(event) =>
                this.props.settings.optionalFeatures.autoSave
                  ? this.saveBaseTemplate()
                  : event.preventDefault()
              }
              keyboardHandler={
                this.props.settings.optionalFeatures.keyboardHandlerVim ? 'vim' : null
              }
              editorAutocomplete={this.props.settings.optionalFeatures.editorAutocomplete}
              isDarkMode={this.props.isDarkMode}
            />
          </TabPanel>
          <TabPanel value={tabIndex} index={2}>
            <GlobalVariables
              globalVariables={this.props.settings.globalVariables}
              onSaveGlobalVariables={this.props.onSaveGlobalVariables}
              isDarkMode={this.props.isDarkMode}
            />
          </TabPanel>
          <TabPanel value={tabIndex} index={3}>
            <div>
              <label htmlFor="template">
                <p>
                  If your demo team asks you to provide analytics on your usage of their platform,
                  this is the right place! Put a snippet of any end user monitoring or analytics
                  solution (AppDynamics, Matamo, Plausible) into this box and it will be injected
                  when an @include[] in your demo configuration matches.
                </p>
                <p>
                  <Button
                    variant="contained"
                    color="success"
                    onClick={() => this.saveAnalyticsSnippet()}
                    size="small"
                    sx={{ textTransform: 'none' }}
                  >
                    Save
                  </Button>
                  <span
                    style={{
                      display:
                        this.props.settings.analyticsSnippet === this.state.analyticsSnippet
                          ? 'none'
                          : 'inline',
                      marginLeft: '8px'
                    }}
                    className="unsaved-warning"
                  >
                    (Unsaved Changes)
                  </span>
                </p>
              </label>
              <AceEditor
                height="400px"
                width="100%"
                minLines={20}
                theme={this.props.isDarkMode ? 'merbivore' : 'xcode'}
                mode="html"
                value={this.state.analyticsSnippet}
                name="template"
                onChange={(content) => this.updateAnalyticsSnippet(content)}
                editorProps={{ $blockScrolling: true }}
              />
            </div>
          </TabPanel>
          <TabPanel value={tabIndex} index={4}>
            <div className="trash-header">
              <p style={{ color: 'var(--help-text-color)', margin: '16px 0 20px', flex: 1 }}>
                Deleted configurations are moved here. You can restore or permanently remove them.
              </p>
              {hasDeletedConfigurations && (
                <Button
                  variant="outlined"
                  color="error"
                  onClick={(event) => this.onBeforeTrashAll(event)}
                  size="small"
                  sx={{ textTransform: 'none', whiteSpace: 'nowrap', alignSelf: 'center' }}
                >
                  Empty Trash
                </Button>
              )}
            </div>
            <Popup
              title="Please Confirm"
              text={<span>Do you really want to empty the trash?</span>}
              open={this.state.showTrashAllPopup}
              onCancel={(event) => this.onCancelTrashAll(event)}
              onConfirm={(event) => this.onTrashAll(event)}
            />
            {this.props.configurations.filter((c) => c.deleted_at).length === 0 ? (
              <div className="trash-empty">
                <svg
                  style={{ width: 48, height: 48, opacity: 0.3 }}
                  viewBox="0 0 24 24"
                  fill="var(--navigation-text-color)"
                >
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                </svg>
                <p>Trash is empty</p>
              </div>
            ) : (
              <div className="feature-group-items">
                {this.props.configurations
                  .filter((c) => c.deleted_at)
                  .map((configuration, index) => (
                    <div key={index} className="trash-item">
                      <div className="trash-item-info">
                        <div className="feature-item-label">
                          {configuration.name.split('/').pop()}
                        </div>
                        <div className="feature-item-description">
                          {configuration.name.includes('/') && (
                            <span>{configuration.name.split('/').slice(0, -1).join('/')} / </span>
                          )}
                          Deleted{' '}
                          {new Date(configuration.deleted_at).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>
                      <div className="trash-item-actions">
                        <Tooltip title="Restore">
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => this.props.onRestoreConfiguration(configuration.id)}
                          >
                            <svg
                              style={{ width: 18, height: 18 }}
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M13 3a9 9 0 00-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0013 21a9 9 0 000-18z" />
                            </svg>
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Delete permanently">
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              this.props.onPermanentlyDeleteConfiguration(configuration.id)
                            }
                          >
                            <svg
                              style={{ width: 18, height: 18 }}
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                            </svg>
                          </IconButton>
                        </Tooltip>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </TabPanel>
          <TabPanel value={tabIndex} index={5}>
            <p style={{ color: 'var(--help-text-color)', margin: '16px 0 20px' }}>
              Advanced settings for performance, permissions, and data management.
            </p>

            <div className="feature-group">
              <h3 className="feature-group-title">Performance</h3>
              <div className="feature-group-items">
                <div className="feature-item">
                  <div className="feature-item-text" style={{ flex: 1 }}>
                    <div className="feature-item-label">Update interval</div>
                    <div className="feature-item-description">
                      How often DemoMonkey scans the page for replacements (in ms). Increase if you
                      experience performance issues. Default is 100.
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginLeft: 16 }}>
                    <TextField
                      type="number"
                      size="small"
                      slotProps={{ htmlInput: { min: 50, max: 1000 } }}
                      value={this.state.monkeyInterval}
                      onChange={(e) => this.updateMonkeyInterval(e)}
                      sx={{
                        width: '90px',
                        '& .MuiInputBase-input': {
                          background: 'var(--input-background-color)',
                          color: 'var(--mode-text-color)',
                          py: '6px'
                        }
                      }}
                    />
                    <Button
                      variant="contained"
                      color="success"
                      size="small"
                      sx={{ textTransform: 'none' }}
                      onClick={(e) => this.saveMonkeyInterval(e)}
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-group">
              <h3 className="feature-group-title">Permissions</h3>
              <div className="feature-group-items">
                <div className="feature-item">
                  <div className="feature-item-toggle">
                    <Switch
                      size="small"
                      onChange={() =>
                        this.props.onRequestExtendedPermissions(this.props.hasExtendedPermissions)
                      }
                      checked={this.props.hasExtendedPermissions}
                    />
                  </div>
                  <div className="feature-item-text">
                    <div className="feature-item-label">Allow access on all sites</div>
                    <div className="feature-item-description">
                      Allow DemoMonkey to read and change data on all sites you visit. If you cannot
                      revoke permissions from here, go to the extensions page, choose DemoMonkey,
                      click <i>Details</i> and set <i>Site Access</i> to <i>On click</i>.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="feature-group">
              <h3 className="feature-group-title">Backup</h3>
              <div className="feature-group-items">
                <div className="feature-item">
                  <div className="feature-item-text" style={{ flex: 1 }}>
                    <div className="feature-item-label">Download all configurations</div>
                    <div className="feature-item-description">
                      Export all configurations as a zip file. You can also use the{' '}
                      <a href="backup.html">backup page</a> for more options.
                    </div>
                  </div>
                  <Button
                    variant="outlined"
                    color="success"
                    size="small"
                    sx={{ textTransform: 'none', ml: 2, whiteSpace: 'nowrap', alignSelf: 'center' }}
                    onClick={(event) => this.props.onDownloadAll(event)}
                  >
                    Download
                  </Button>
                </div>
              </div>
            </div>

            <div className="feature-group">
              <h3 className="feature-group-title danger-title">Danger Zone</h3>
              <div className="feature-group-items danger-zone">
                <div className="feature-item">
                  <div className="feature-item-text" style={{ flex: 1 }}>
                    <div className="feature-item-label">Download & delete all configurations</div>
                    <div className="feature-item-description">
                      Export all configurations, then permanently remove them.
                    </div>
                  </div>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{ textTransform: 'none', ml: 2, whiteSpace: 'nowrap', alignSelf: 'center' }}
                    onClick={(event) => this.onBeforeDeleteAll(event)}
                  >
                    Delete All
                  </Button>
                </div>
                <div className="feature-item">
                  <div className="feature-item-text" style={{ flex: 1 }}>
                    <div className="feature-item-label">Reset DemoMonkey</div>
                    <div className="feature-item-description">
                      Remove all configurations and reset all settings to their defaults. This
                      cannot be undone.
                    </div>
                  </div>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    sx={{ textTransform: 'none', ml: 2, whiteSpace: 'nowrap', alignSelf: 'center' }}
                    onClick={(event) => this.onBeforeReset(event)}
                  >
                    Reset
                  </Button>
                </div>
              </div>
            </div>

            <Popup
              title="Please Confirm"
              text={<span>Do you really want to delete all configurations?</span>}
              open={this.state.showDeleteAllPopup}
              onCancel={(event) => this.onCancelDeleteAll(event)}
              onConfirm={(event) => this.onDeleteAll(event)}
            />
            <Popup
              title="Reset DemoMonkey"
              text={
                <span>
                  Do you really want to reset <b>all configurations and all settings</b>?
                  <br />
                  (This window will close.)
                </span>
              }
              open={this.state.showResetPopup}
              onCancel={(event) => this.onCancelReset(event)}
              onConfirm={(event) => this.onReset(event)}
            />
          </TabPanel>
        </div>
      </div>
    )
  }
}

export default Settings

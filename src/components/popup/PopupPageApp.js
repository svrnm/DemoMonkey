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
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import TabPanel from '../shared/TabPanel'
import Page from '../shared/Page'
import { connect } from 'react-redux'
import ConfigurationList from './ConfigurationList'

const TAB_NAMES = ['apply', 'help']

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      activeTab: 'apply',
      commitHash: false
    }
  }

  toggleLiveMode() {
    this.props.actions.toggleLiveMode()
  }

  updateActiveTab(activeTab) {
    this.setState({ activeTab })
  }

  _getTabIndex() {
    const idx = TAB_NAMES.indexOf(this.state.activeTab)
    return idx >= 0 ? idx : 0
  }

  render() {
    const manifest = this.props.manifest
    const configurations = this.props.configurations.filter(
      (config) => typeof config.deleted_at === 'undefined' && typeof config._deleted === 'undefined'
    )
    const tabIndex = this._getTabIndex()
    return (
      <Page
        preferDarkMode={this.props.settings.optionalFeatures.preferDarkMode}
        syncDarkMode={this.props.settings.optionalFeatures.syncDarkMode}
      >
        <Tabs
          value={tabIndex}
          onChange={(e, newValue) => {
            const nextTab = TAB_NAMES[newValue]
            if (nextTab) {
              this.updateActiveTab(nextTab)
            }
          }}
          sx={{
            minHeight: 36,
            borderBottom: '1px solid var(--highlight-background-color)',
            '& .MuiTab-root': { minHeight: 36, py: 0, fontSize: '13px', textTransform: 'none' }
          }}
        >
          <Tab label="Configurations" />
          <Tab label="About" />
          <Tab
            label="Dashboard"
            onClick={(e) => {
              e.preventDefault()
              window.chrome.runtime.openOptionsPage()
            }}
            component="a"
            href="#"
          />
        </Tabs>
        <TabPanel value={tabIndex} index={0} padding={0}>
          <ConfigurationList
            currentUrl={this.props.currentUrl}
            configurations={configurations}
            settings={this.props.settings}
            actions={this.props.actions}
          />
        </TabPanel>
        <TabPanel value={tabIndex} index={1} padding={0}>
          <div className="popup-about">
            <div className="popup-about-row">
              <span className="popup-about-label">Version</span>
              <span>{manifest.version()}</span>
            </div>
            <div className="popup-about-row">
              <span className="popup-about-label">Author</span>
              <span>{manifest.author()}</span>
            </div>
            <div className="popup-about-row">
              <span className="popup-about-label">Homepage</span>
              <span>{manifest.homepage()}</span>
            </div>
            <div className="popup-about-row">
              <span className="popup-about-label">Build</span>
              <span>{manifest.buildFromLink()}</span>
            </div>
            <div className="popup-about-row">
              <span className="popup-about-label">Support</span>
              <span>{manifest.supportLink()}</span>
            </div>
          </div>
        </TabPanel>
      </Page>
    )
  }
}

const PopupPageApp = connect(
  (state) => {
    return { configurations: state.configurations, settings: state.settings }
  },
  (dispatch) => ({
    actions: {
      setCurrentView: (key) => {
        dispatch({ type: 'SET_CURRENT_VIEW', view: key })
      },
      toggleConfiguration: (id) => {
        dispatch({ type: 'TOGGLE_CONFIGURATION', id })
      },
      toggleDebugMode: () => {
        dispatch({ type: 'TOGGLE_DEBUG_MODE' })
      },
      toggleLiveMode: () => {
        dispatch({ type: 'TOGGLE_LIVE_MODE' })
      }
    }
  })
)(App)

export default PopupPageApp

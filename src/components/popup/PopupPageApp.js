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
import Tabs from '../shared/Tabs'
import Pane from '../shared/Pane'
import Page from '../shared/Page'
import Manifest from '../../models/Manifest'
import { connect } from 'react-redux'
import ConfigurationList from './ConfigurationList'
import PropTypes from 'prop-types'

/* The PopupPageApp will be defined below */
class App extends React.Component {
  static propTypes = {
    currentUrl: PropTypes.string,
    actions: PropTypes.objectOf(PropTypes.func).isRequired,
    configurations: PropTypes.arrayOf(PropTypes.object).isRequired,
    settings: PropTypes.object.isRequired,
    manifest: PropTypes.instanceOf(Manifest).isRequired
  }

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

  render() {
    const manifest = this.props.manifest
    const configurations = this.props.configurations.filter((config) => typeof config.deleted_at === 'undefined' && typeof config._deleted === 'undefined')
    return <Page preferDarkMode={this.props.settings.optionalFeatures.preferDarkMode} syncDarkMode={this.props.settings.optionalFeatures.syncDarkMode}>
      <Tabs activeTab={this.state.activeTab} onNavigate={(e) => this.updateActiveTab(e)}>
        <Pane label="Apply" name="apply">
          <ConfigurationList currentUrl={this.props.currentUrl} configurations={configurations} settings={this.props.settings} actions={this.props.actions}/>
        </Pane>
        <Pane label="Help" name="help">
          <div>
            <b>Author:&nbsp;
            </b>
            {manifest.author()}
          </div>
          <div>
            <b>Homepage:&nbsp;
            </b>
            {manifest.homepage()}
          </div>
          <div>
            <b>Version:&nbsp;
            </b>
            {manifest.version()}
          </div>
          <div>
            <b>Build from </b>
            {manifest.buildFromLink()}
          </div>
          <div>
            <b>Report bugs at </b>
            {manifest.supportLink()}
          </div>
        </Pane>
        <Pane link={(e) => {
          e.preventDefault()
          window.chrome.runtime.openOptionsPage()
        }} label="Dashboard"/>
      </Tabs>
    </Page>
  }
}

const PopupPageApp = connect(
  // map state to props
  state => {
    return { configurations: state.configurations, settings: state.settings }
  },
  // map dispatch to props
  dispatch => ({
    actions: {
      setCurrentView: (key) => {
        dispatch({ type: 'SET_CURRENT_VIEW', view: key })
      },
      toggleConfiguration: (id) => {
        dispatch({ type: 'TOGGLE_CONFIGURATION', id: id })
      },
      toggleDebugMode: () => {
        dispatch({ type: 'TOGGLE_DEBUG_MODE' })
      },
      toggleLiveMode: () => {
        dispatch({ type: 'TOGGLE_LIVE_MODE' })
      }
    }
  }))(App)

export default PopupPageApp

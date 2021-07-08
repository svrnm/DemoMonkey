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
import PropTypes from 'prop-types'
import Configuration from '../../models/Configuration'
import ToggleConfiguration from '../shared/ToggleConfiguration'
import ErrorBox from '../shared/ErrorBox'

class ConfigurationList extends React.Component {
  static propTypes = {
    settings: PropTypes.object.isRequired,
    currentUrl: PropTypes.string,
    configurations: PropTypes.arrayOf(PropTypes.object).isRequired,
    actions: PropTypes.objectOf(PropTypes.func).isRequired
  }

  constructor(props) {
    super(props)
    this.currentDirectory = ''
    this.state = {
      search: '',
      onlyShowActivated: false,
      onlyShowAvailable: props.settings.optionalFeatures.onlyShowAvailableConfigurations === true
    }
  }

  handleSearchUpdate(event) {
    this.setState({ search: event.target.value.toLowerCase() })
  }

  toggleOnlyShowAvailable() {
    this.setState({ onlyShowAvailable: !this.state.onlyShowAvailable })
  }

  toggleOnlyShowActivated() {
    this.setState({ onlyShowActivated: !this.state.onlyShowActivated })
  }

  toggleDebugMode() {
    this.props.actions.toggleDebugMode()
  }

  renderPath(configuration, index) {
    return <div key={configuration.id}>{this.renderItem(configuration, index)}</div>
  }

  renderItem(configuration, index) {
    const tmpConfig = (new Configuration(configuration.content, null, false, configuration.values))

    if ((this.state.onlyShowAvailable && !tmpConfig.isAvailableForUrl(this.props.currentUrl)) ||
    (this.state.onlyShowActivated && !configuration.enabled) ||
    tmpConfig.isTemplate() ||
    !tmpConfig.isRestricted() ||
    configuration.name.toLowerCase().startsWith('zzz_archive/')) {
      return <div></div>
    }

    return <div><ToggleConfiguration
      onlyShowAvailable={this.state.onlyShowAvailable}
      currentUrl={this.props.currentUrl}
      index={index}
      actions={this.props.actions}
      configuration={configuration}/></div>
  }

  getConfigurations() {
    return this.props.configurations.filter(c => {
      return c.name.toLowerCase().indexOf(this.state.search) > -1
    })
  }

  getLatest() {
    return this.getConfigurations().sort((a, b) => {
      return a.updated_at < b.updated_at ? 1 : -1
    }).slice(0, 3)
  }

  getList() {
    return this.getConfigurations().sort((a, b) => {
      return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
    })
  }

  renderLatest() {
    if (this.getConfigurations().length < 12) {
      return
    }
    return <div className="latest-configurations">
      <div className="latest-title">Latest</div>
      {this.getLatest().map((configuration, index) => this.renderPath(configuration, index))}
    </div>
  }

  renderList() {
    return <div>
      {this.renderLatest()}
      <div>
        {this.getList().map((configuration, index) => this.renderPath(configuration, index))}
      </div>
    </div>
  }

  renderEmpty() {
    return <i>
      No configuration found. Open the <a href="#" onClick={(e) => {
      e.preventDefault()
      window.chrome.runtime.openOptionsPage()
    }}>Dashboard</a> to create configurations
    </i>
  }

  buildIncludeRegex() {
    if (this.props.currentUrl) {
      const u = new URL(this.props.currentUrl)

      const protocol = ['https:', 'http:'].includes(u.protocol) ? 'https?:' : u.protocol

      const host = u.hostname

      return '/^' + protocol + '//' + host + '/.*$/'
    }
    return ''
  }

  render() {
    // If the rendering of the list throws any exception we display an error and the user should still be able to access the options page.
    try {
      return <div>
        <div><b>Copy the following, to add current page to a configuration:</b></div>
        <div><code>@include[]&nbsp;=&nbsp;{this.buildIncludeRegex()}</code></div>
        <div><input type="text" onChange={(event) => this.handleSearchUpdate(event)} value={this.state.search} placeholder="Search..." className="searchBox" /></div>
        <div><input type="checkbox" checked={this.state.onlyShowAvailable} onChange={(event) => this.toggleOnlyShowAvailable()} /> Only show configurations available for the current url</div>
        <div><input type="checkbox" checked={this.state.onlyShowActivated} onChange={(event) => this.toggleOnlyShowActivated()} /> Only show activated configurations</div>
        <div><input type="checkbox" checked={this.props.settings.debugMode} onChange={(event) => this.toggleDebugMode()} /> Run in <i>Debug Mode</i></div>
        <div className="configurations-list">
          {this.getConfigurations().length < 1 ? this.renderEmpty() : this.renderList() }
        </div>
      </div>
    } catch (e) {
      return <ErrorBox error={e} />
    }
  }
}

export default ConfigurationList

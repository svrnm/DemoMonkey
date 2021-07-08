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

class ToggleConfiguration extends React.Component {
  static propTypes = {
    currentUrl: PropTypes.string,
    onlyShowAvailable: PropTypes.bool.isRequired,
    actions: PropTypes.objectOf(PropTypes.func).isRequired,
    configuration: PropTypes.object,
    index: PropTypes.number,
    className: PropTypes.string
  }

  toggle(id) {
    this.props.actions.toggleConfiguration(id)
  }

  render() {
    return <div className={'toggle-group ' + this.props.className}>
      <ToggleButton colors={{ active: { base: '#5c832f', hover: '#90c256' } }} value={this.props.configuration.enabled} onToggle={() => { this.toggle(this.props.configuration.id) }}/>
      <label>
        <a href={`/options.html#configuration/${this.props.configuration.id}`} target="_blank" rel="noopener noreferrer">{this.props.configuration.name}</a>
      </label>
    </div>
  }
}

export default ToggleConfiguration

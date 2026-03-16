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

class ToggleConfiguration extends React.Component {
  toggle(id) {
    this.props.actions.toggleConfiguration(id)
  }

  render() {
    const name = this.props.configuration.name
    const parts = name.split('/')
    const displayName = parts.pop()
    const folder = parts.length > 0 ? parts.join('/') + '/' : ''

    return (
      <div className={'toggle-group ' + (this.props.className || '')}>
        <Switch
          size="small"
          checked={this.props.configuration.enabled}
          onChange={() => {
            this.toggle(this.props.configuration.id)
          }}
        />
        <label>
          {folder && <span className="toggle-config-folder">{folder}</span>}
          <a
            href={`/options.html#configuration/${this.props.configuration.id}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {displayName}
          </a>
        </label>
      </div>
    )
  }
}

export default ToggleConfiguration

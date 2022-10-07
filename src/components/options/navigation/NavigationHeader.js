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

import ConfigurationUpload from '../../shared/ConfigurationUpload'
import { Button } from '@mui/material'

class NavigationHeader extends React.Component {
  static propTypes = {
    onUpload: PropTypes.func.isRequired,
    onNavigate: PropTypes.func.isRequired,
    onDownloadAll: PropTypes.func.isRequired,
    showLogs: PropTypes.bool.isRequired
  }

  handleClick(event, target) {
    event.preventDefault()
    this.props.onNavigate(target)
  }

  render() {
    return (
      <ul className="actions">
        <li>
          <Button href="#help" onClick={(event) => this.handleClick(event, 'help')}>
            Help
          </Button>
        </li>
        <li>
          <Button
            href={'#' + 'configuration/new'}
            onClick={(event) => this.handleClick(event, 'configuration/new')}
          >
            Create
          </Button>
        </li>
        <li>
          <ConfigurationUpload onUpload={this.props.onUpload} id="upload" />
        </li>
        <li>
          <Button href="#settings" onClick={(event) => this.handleClick(event, 'settings')}>
            Settings
          </Button>
        </li>
        <li>
          <Button href="#backup" onClick={this.props.onDownloadAll}>
            Backup
          </Button>
        </li>
        <li>
          {this.props.showLogs && (
            <Button href="#logs" onClick={(event) => this.handleClick(event, 'logs')}>
              Logs
            </Button>
          )}
        </li>
      </ul>
    )
  }
}

export default NavigationHeader

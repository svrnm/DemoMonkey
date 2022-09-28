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

class WarningBox extends React.Component {
  static propTypes = {
    onDismiss: PropTypes.func.isRequired,
    onRequestExtendedPermissions: PropTypes.func.isRequired
  }

  grantPermission(e) {
    e.preventDefault()
    this.props.onRequestExtendedPermissions()
  }

  dismiss(e) {
    e.preventDefault()
    this.props.onDismiss()
  }

  render() {
    return (
      <div className="warning-box fixed">
        <b>Warning:</b> For DemoMonkey to work optimal you have to grant permissions to access all
        websites.{' '}
        <a id="grant-permissions-button" href="#" onClick={(e) => this.grantPermission(e)}>
          Click here
        </a>{' '}
        to grant that permission or{' '}
        <a href="#" onClick={(e) => this.dismiss(e)}>
          {' '}
          dismiss
        </a>{' '}
        this warning and give access to DemoMonkey on demand. (
        <a
          href="https://developer.chrome.com/extensions/permission_warnings"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn more about site access
        </a>
        )
      </div>
    )
  }
}

export default WarningBox

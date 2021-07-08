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

class Page extends React.Component {
  static propTypes = {
    children: PropTypes.any,
    className: PropTypes.string,
    syncDarkMode: PropTypes.bool.isRequired,
    preferDarkMode: PropTypes.bool.isRequired
  }

  render() {
    if (this.props.syncDarkMode) {
      document.documentElement.classList.remove('dark-mode')
      document.documentElement.classList.remove('light-mode')
    } else if (this.props.preferDarkMode) {
      document.documentElement.classList.add('dark-mode')
      document.documentElement.classList.remove('light-mode')
    } else {
      document.documentElement.classList.remove('dark-mode')
      document.documentElement.classList.add('light-mode')
    }
    return (
      <div className={this.props.className}>
        {this.props.children}
      </div>
    )
  }
}

export default Page

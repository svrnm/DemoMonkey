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
import { logger } from '../../helpers/logger'

class ErrorBox extends React.Component {
  static propTypes = {
    error: PropTypes.object
  }

  render() {
    const e = this.props.error
    logger('error', e).write()
    return (
      <div className="error-box">
        <div className="error-title">Oops! Something went wrong: </div>
        <div className="error-message">Message: { e.message }</div>
        <div className="error-details"><pre>{ e.stack }</pre></div>
        <div className="error-report">
          <a href={`https://github.com/svrnm/DemoMonkey/issues/new?title=${e.message}&body=${e.stack}`} target="blank" rel="noopener noreferer">Report Issue</a>
            &nbsp;:&nbsp;
          <a href="backup.html">Open Backup Page</a>
        </div>
      </div>
    )
  }
}

export default ErrorBox

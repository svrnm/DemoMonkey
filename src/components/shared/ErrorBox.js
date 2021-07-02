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

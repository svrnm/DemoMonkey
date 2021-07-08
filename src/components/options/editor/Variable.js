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
import VariableModle from '../../../models/Variable'
import PropTypes from 'prop-types'
import AceEditor from 'react-ace'

import 'ace-builds/src-noconflict/theme-xcode'
import 'ace-builds/src-noconflict/theme-merbivore'
import 'ace-builds/src-noconflict/mode-html'

class Variable extends React.Component {
  static propTypes = {
    onValueUpdate: PropTypes.func.isRequired,
    variable: PropTypes.instanceOf(VariableModle),
    isDarkMode: PropTypes.bool.isRequired
  }

  updateVariable(value) {
    this.props.onValueUpdate(this.props.variable.id, value)
  }

  resetVariable(event) {
    event.preventDefault()
    this.updateVariable(null)
  }

  render() {
    return <div className="variable-box">
      <label htmlFor="variable-1">
        {this.props.variable.name}&nbsp;
        {this.props.variable.owner === '' ? '' : `(from: ${this.props.variable.owner})`}&nbsp;
        <small><a href="#" onClick={(e) => this.resetVariable(e)}>(reset value)</a></small>
      </label>
      <AceEditor height="4.5em" width="700px"
        name={this.props.variable.id}
        minLines={1}
        theme={ this.props.isDarkMode ? 'merbivore' : 'xcode' }
        mode="html"
        highlightActiveLine={false}
        showGutter={false}
        autoScrollEditorIntoView={true}
        value={this.props.variable.value}
        ref={(c) => { this.editor = c }}
        onChange={(v) => this.updateVariable(v)}
        editorProps={{ $blockScrolling: 'Infinity' }}
      />
      <div className="help">{this.props.variable.description}</div>
    </div>
  }
}

export default Variable

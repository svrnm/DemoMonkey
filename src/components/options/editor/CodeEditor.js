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
import AceEditor from 'react-ace'

import autocomplete from './ace/autocomplete.js'
import { logger } from '../../../helpers/logger'

import 'ace-builds/src-noconflict/ext-language_tools'
import 'ace-builds/src-noconflict/ext-searchbox'
import 'ace-builds/src-noconflict/theme-xcode'
import 'ace-builds/src-noconflict/theme-merbivore'

import vim from './ace/vim'
import './ace/mnky'

class CodeEditor extends React.Component {
  constructor(props) {
    super(props)
    this.bound = false
    vim(() => {
      props.onVimWrite()
    })
    // Make sure that an error in auto completion does not break the whole editor.
    try {
      autocomplete(props.getRepository, props.variables)
    } catch (e) {
      logger('error', e).write()
    }
  }

  static propTypes = {
    value: PropTypes.string.isRequired,
    getRepository: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onAutoSave: PropTypes.func.isRequired,
    onVimWrite: PropTypes.func.isRequired,
    readOnly: PropTypes.bool,
    editorAutocomplete: PropTypes.bool.isRequired,
    annotations: PropTypes.func.isRequired,
    keyboardHandler: PropTypes.string,
    isDarkMode: PropTypes.bool.isRequired,
    variables: PropTypes.array.isRequired
  }

  autoSave() {
    this.props.onAutoSave(event)
  }

  handleChange(content, event) {
    if (event) {
      event.preventDefault()
    }
    this.props.onChange(content)
    // annotations={annotations} on the AceEditor
    // does not work properly (probably due my misunderstanding of react;) )
    // the following works and also adds some soft delay on the annotation update
    setTimeout(() => this._updateAnnotations(), 150)
  }

  _updateAnnotations() {
    if (this.editor) {
      this.editor.session.setAnnotations(this.props.annotations(this.editor.getValue()))
    }
  }

  render() {
    return <div className="editor-box"><AceEditor
      value={this.props.value}
      onChange={(content) => this.handleChange(content)}
      onLoad={(editor) => {
        this.editor = editor
        window.editor = editor
        this._updateAnnotations()
      }}
      width="100%"
      height="calc(100% - 40px)"
      theme={ this.props.isDarkMode ? 'merbivore' : 'xcode' }
      mode="mnky"
      readOnly = {this.props.readOnly === true}
      className = {this.props.readOnly === true ? 'disabled' : ''}
      enableBasicAutocompletion={true}
      enableLiveAutocompletion={this.props.editorAutocomplete}
      enableSnippets={false}
      keyboardHandler={this.props.keyboardHandler}
      editorProps={{ $blockScrolling: 'Infinity' }}
      name="contentarea"
      commands={[
        {
          name: 'Toggle Comment',
          bindKey: { win: 'Ctrl-Shift-7', mac: 'Cmd-Shift-7' },
          exec: 'togglecomment'
        },
        {
          name: 'Save On Enter',
          bindKey: { win: 'Enter', mac: 'Enter' },
          exec: (editor) => {
            editor.insert('\n')
            this.autoSave()
          }
        }
      ]}
    />
    </div>
  }
}
export default CodeEditor

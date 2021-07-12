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
import VariableModel from '../../models/Variable'
import PropTypes from 'prop-types'
import AceEditor from 'react-ace'
import { Base64 } from 'js-base64'

import 'ace-builds/src-noconflict/theme-xcode'
import 'ace-builds/src-noconflict/theme-merbivore'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/mode-javascript'

class Variable extends React.Component {
  static propTypes = {
    onUpdate: PropTypes.func.isRequired,
    onDelete: PropTypes.func,
    variable: PropTypes.instanceOf(VariableModel),
    isDarkMode: PropTypes.bool.isRequired,
    isGlobal: PropTypes.bool.isRequired
  }

  constructor(props) {
    super(props)
    this.colorPicker = React.createRef()
    this.filePicker = React.createRef()
  }

  updateVariable(value) {
    this.props.onUpdate(this.props.variable.id, value)
  }

  deleteVariable(event) {
    event.preventDefault()
    if (typeof this.props.onDelete === 'function') {
      this.props.onDelete()
    }
  }

  resetVariable(event) {
    event.preventDefault()
    this.updateVariable(null)
  }

  showColorDialog(event) {
    event.preventDefault()
    this.colorPicker.current.addEventListener('change', (event) => {
      this.updateVariable(event.target.value)
    })
    this.colorPicker.current.click()
  }

  showUploadDialog(event, index, key) {
    event.preventDefault()
    const upload = this.filePicker.current
    const uploadForm = upload.parentElement

    upload.addEventListener('change', (event) => {
      const files = event.target.files
      const reader = new window.FileReader()
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i)
        reader.onloadend = () => {
          if (reader.result.startsWith('data:text/') || reader.result.startsWith('data:application/json;')) {
            this.updateVariable(Base64.decode(reader.result.split('base64,')[1]))
          } else {
            this.updateVariable(reader.result)
          }
        }
        reader.readAsDataURL(file)
      }
      uploadForm.reset()
    })

    upload.click()
  }

  render() {
    const variable = this.props.variable

    return <div className="variable-box">
      <label htmlFor="variable-1">
        {
          this.props.isGlobal
            ? <React.Fragment><input type="text" value={variable.name} onChange={(e) => this.props.onUpdate(e.target.value, variable.value)} />&nbsp;</React.Fragment>
            : <React.Fragment>{variable.name}&nbsp;{variable.owner === '' ? '' : `(from: ${variable.owner})`}&nbsp;</React.Fragment>
        }
        <form style={{ display: 'none' }}>
          <input multiple ref={this.filePicker} type="file" />
        </form>
        <small><a href="#" onClick={(e) => this.showUploadDialog(e)}>
          (from file)
        </a>&nbsp;</small>
        <input ref={this.colorPicker} type="color" style={{ display: 'none' }} />
        <small><a href="#" onClick={(e) => this.showColorDialog(e)}>
          (from color)
        </a>&nbsp;</small>
        {
          this.props.isGlobal
            ? <small><a href="#" onClick={(e) => this.deleteVariable(e)}>(delete)</a></small>
            : <small><a href="#" onClick={(e) => this.resetVariable(e)}>(reset value)</a></small>
        }
      </label>
      <AceEditor
        height={'150px'}
        width="calc(100%-80px)"
        style={{
          resize: 'vertical',
          overflow: 'auto'
        }}
        name={variable.id}
        minLines={1}
        maxLines={30}
        theme={this.props.isDarkMode ? 'merbivore' : 'xcode'}
        mode={typeof variable.value === 'string' && variable.value.startsWith('<') ? 'html' : 'javascript'}
        highlightActiveLine={false}
        showGutter={true}
        autoScrollEditorIntoView={true}
        value={variable.value}
        ref={(c) => { this.editor = c }}
        onChange={(v) => {
          this.updateVariable(v)
        }}
        editorProps={{ $blockScrolling: 'Infinity' }}
      />
      <div className="help">{variable.description}</div>
      <div>
        {
          typeof variable.value === 'string' && variable.value.startsWith('data:image')
            ? <img src={variable.value} style={{ height: '100px' }} />
            : ''
        }
      </div>
    </div>
  }
}

export default Variable

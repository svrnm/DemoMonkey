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
import AceEditor from 'react-ace'
import { base64Decode } from '../../helpers/base64'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import 'ace-builds/src-noconflict/theme-xcode'
import 'ace-builds/src-noconflict/theme-merbivore'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/mode-javascript'

const smallIconStyle = { width: 16, height: 16 }

class Variable extends React.Component {
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
          if (
            reader.result.startsWith('data:text/') ||
            reader.result.startsWith('data:application/json;')
          ) {
            this.updateVariable(base64Decode(reader.result.split('base64,')[1]))
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

  _isColor(value) {
    if (typeof value !== 'string') return false
    const v = value.trim()
    return (
      /^#(?:[0-9a-f]{3}|[0-9a-f]{4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(v) ||
      /^([0-9a-f]{3})$/i.test(v) ||
      /^([0-9a-f]{6})$/i.test(v) ||
      /^(rgb|rgba|hsl|hsla)\s*\(/.test(v) ||
      /^(red|blue|green|yellow|orange|purple|pink|black|white|gray|grey|cyan|magenta|brown|navy|teal|lime|aqua|maroon|olive|silver|fuchsia)$/i.test(
        v
      )
    )
  }

  _colorValue(value) {
    const v = value.trim()
    if (/^([0-9a-f]{3})$/i.test(v) || /^([0-9a-f]{6})$/i.test(v)) {
      return '#' + v
    }
    return v
  }

  _renderPreview(variable) {
    const value = variable.value
    if (typeof value !== 'string') return ''

    if (value.startsWith('data:image')) {
      return (
        <div className="variable-image-preview">
          <img src={value} alt="Variable image preview" />
        </div>
      )
    }

    if (this._isColor(value)) {
      const cssColor = this._colorValue(value)
      return (
        <div className="variable-color-preview">
          <span className="variable-color-swatch" style={{ background: cssColor }} />
          <span className="variable-color-value">{value.trim()}</span>
        </div>
      )
    }

    return ''
  }

  render() {
    const variable = this.props.variable

    return (
      <div className="variable-card">
        <div className="variable-card-header">
          <div className="variable-card-name">
            {this.props.isGlobal ? (
              <input
                type="text"
                className="variable-name-input"
                placeholder="Variable name"
                value={variable.name}
                onChange={(e) => this.props.onUpdate(e.target.value, variable.value)}
              />
            ) : (
              <span className="variable-name">
                <span className="variable-prefix">$</span>
                {variable.name}
                {variable.owner && <span className="variable-owner"> from {variable.owner}</span>}
              </span>
            )}
          </div>
          <div className="variable-card-actions">
            <form style={{ display: 'none' }}>
              <input multiple ref={this.filePicker} type="file" />
            </form>
            <input ref={this.colorPicker} type="color" style={{ display: 'none' }} />
            <Tooltip title="Upload from file">
              <IconButton size="small" onClick={(e) => this.showUploadDialog(e)}>
                <svg style={smallIconStyle} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 13.01l1.41 1.41L11 12.84V16h2v-3.16l1.59 1.59L16 13.01 12.01 9 8 13.01z" />
                </svg>
              </IconButton>
            </Tooltip>
            <Tooltip title="Pick color">
              <IconButton size="small" onClick={(e) => this.showColorDialog(e)}>
                <svg style={smallIconStyle} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9c.83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-1 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8zm-5.5 9c-.83 0-1.5-.67-1.5-1.5S5.67 9 6.5 9 8 9.67 8 10.5 7.33 12 6.5 12zm3-4C8.67 8 8 7.33 8 6.5S8.67 5 9.5 5s1.5.67 1.5 1.5S10.33 8 9.5 8zm5 0c-.83 0-1.5-.67-1.5-1.5S13.67 5 14.5 5s1.5.67 1.5 1.5S15.33 8 14.5 8zm3 4c-.83 0-1.5-.67-1.5-1.5S16.67 9 17.5 9s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z" />
                </svg>
              </IconButton>
            </Tooltip>
            {this.props.isGlobal ? (
              <Tooltip title="Delete variable">
                <IconButton size="small" color="error" onClick={(e) => this.deleteVariable(e)}>
                  <svg style={smallIconStyle} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
                  </svg>
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Reset to default">
                <IconButton size="small" onClick={(e) => this.resetVariable(e)}>
                  <svg style={smallIconStyle} viewBox="0 0 24 24" fill="currentColor">
                    <path d="M13 3a9 9 0 00-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42A8.954 8.954 0 0013 21a9 9 0 000-18z" />
                  </svg>
                </IconButton>
              </Tooltip>
            )}
          </div>
        </div>
        {variable.description && (
          <div className="variable-card-description">{variable.description}</div>
        )}
        <div className="variable-card-editor">
          <AceEditor
            height={'100px'}
            width="100%"
            style={{
              resize: 'vertical',
              overflow: 'auto',
              borderRadius: '4px'
            }}
            name={variable.id}
            minLines={1}
            maxLines={20}
            theme={this.props.isDarkMode ? 'merbivore' : 'xcode'}
            mode={
              typeof variable.value === 'string' && variable.value.startsWith('<')
                ? 'html'
                : 'javascript'
            }
            highlightActiveLine={false}
            showGutter={true}
            autoScrollEditorIntoView={true}
            value={variable.value}
            ref={(c) => {
              this.editor = c
            }}
            onChange={(v) => {
              this.updateVariable(v)
            }}
            editorProps={{ $blockScrolling: 'Infinity' }}
            setOptions={{ useWorker: false }}
          />
        </div>
        {this._renderPreview(variable)}
      </div>
    )
  }
}

export default Variable

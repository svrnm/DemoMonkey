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
import UploadFileIcon from '@mui/icons-material/UploadFile'
import PaletteIcon from '@mui/icons-material/Palette'
import DeleteIcon from '@mui/icons-material/Delete'
import RefreshIcon from '@mui/icons-material/Refresh'
import 'ace-builds/src-noconflict/theme-xcode'
import 'ace-builds/src-noconflict/theme-merbivore'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/mode-javascript'

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
              <IconButton
                size="small"
                aria-label="Upload from file"
                onClick={(e) => this.showUploadDialog(e)}
              >
                <UploadFileIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            <Tooltip title="Pick color">
              <IconButton
                size="small"
                aria-label="Pick color"
                onClick={(e) => this.showColorDialog(e)}
              >
                <PaletteIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            {this.props.isGlobal ? (
              <Tooltip title="Delete variable">
                <IconButton
                  size="small"
                  color="error"
                  aria-label="Delete variable"
                  onClick={(e) => this.deleteVariable(e)}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            ) : (
              <Tooltip title="Reset to default">
                <IconButton size="small" onClick={(e) => this.resetVariable(e)}>
                  <RefreshIcon fontSize="small" />
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

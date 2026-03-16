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
import Button from '@mui/material/Button'
import Variable from '../../../models/Variable'
import VariableEditor from '../../shared/Variable'

class GlobalVariables extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      globalVariables: props.globalVariables,
      hasUnsavedChanges: false
    }
  }

  addVariable() {
    this.setState({
      hasUnsavedChanges: true,
      globalVariables: this.state.globalVariables.concat({
        key: '',
        value: ''
      })
    })
  }

  showColorDialog(event, index, key) {
    event.preventDefault()
    const picker = document.getElementById('variable-color-' + index)
    picker.addEventListener('change', (event) => {
      this.updateVariable(index, key, event.target.value)
    })
    picker.click()
  }

  showUploadDialog(event, index, key) {
    event.preventDefault()
    const upload = document.getElementById('variable-upload-' + index)
    const uploadForm = document.getElementById('variable-form-' + index)

    upload.addEventListener('change', (event) => {
      const files = event.target.files
      const reader = new window.FileReader()
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i)
        reader.onloadend = () => {
          console.log(reader.result)
          this.updateVariable(index, key, reader.result)
        }
        reader.readAsDataURL(file)
      }
      uploadForm.reset()
    })

    upload.click()
  }

  deleteVariable(index) {
    const globalVariables = this.state.globalVariables.filter((v, i) => i !== index)

    this.setState({
      hasUnsavedChanges: true,
      globalVariables
    })
  }

  updateVariable(index, key, value) {
    const { globalVariables } = this.state
    globalVariables[index] = {
      key,
      value
    }
    this.setState({
      hasUnsavedChanges: true,
      globalVariables
    })
  }

  save() {
    const globalVariables = this.state.globalVariables.filter((v) => v.key !== '')
    this.props.onSaveGlobalVariables(globalVariables)
    this.setState({
      hasUnsavedChanges: false
    })
  }

  render() {
    const variables = this.state.globalVariables
      .filter((v) => v != null)
      .map((v) => new Variable(v.key, v.value))

    return (
      <div>
        <p style={{ color: 'var(--help-text-color)', margin: '16px 0 20px' }}>
          Global variables are available in all configurations. Use them for images, colors, or
          values you reuse across demos.
        </p>
        <div className="variables-actions">
          <Button
            variant="outlined"
            color="success"
            size="small"
            sx={{ textTransform: 'none' }}
            onClick={() => this.addVariable()}
            startIcon={
              <svg style={{ width: 16, height: 16 }} viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" />
              </svg>
            }
          >
            Add Variable
          </Button>
          <Button
            variant="contained"
            color="success"
            size="small"
            sx={{ textTransform: 'none' }}
            onClick={() => this.save()}
          >
            Save
          </Button>
          {this.state.hasUnsavedChanges && (
            <span className="unsaved-warning">(Unsaved Changes)</span>
          )}
        </div>
        {variables.length === 0 && (
          <div className="variables-empty">
            <svg
              style={{ width: 48, height: 48, opacity: 0.3 }}
              viewBox="0 0 24 24"
              fill="var(--navigation-text-color)"
            >
              <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" />
            </svg>
            <p>No variables defined</p>
          </div>
        )}
        <div className="variables-list">
          {variables.map((variable, index) => {
            return (
              <VariableEditor
                key={index}
                onUpdate={(name, value) => this.updateVariable(index, name, value)}
                onDelete={() => this.deleteVariable(index)}
                variable={variable}
                isGlobal={true}
                isDarkMode={this.props.isDarkMode}
              />
            )
          })}
        </div>
      </div>
    )
  }
}

export default GlobalVariables

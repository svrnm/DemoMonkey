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
import AddIcon from '@mui/icons-material/Add'
import LibraryAddIcon from '@mui/icons-material/LibraryAdd'
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
        <p style={{ color: 'var(--mui-palette-text-secondary)', margin: '16px 0 20px' }}>
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
            startIcon={<AddIcon fontSize="small" />}
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
            <LibraryAddIcon
              sx={{
                width: 48,
                height: 48,
                opacity: 0.3,
                color: 'var(--mui-palette-custom-navigation-text)'
              }}
            />
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

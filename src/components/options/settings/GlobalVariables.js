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
import Variable from '../../../models/Variable'
import VariableEditor from '../../shared/Variable'

import 'ace-builds/src-noconflict/theme-xcode'
import 'ace-builds/src-noconflict/theme-merbivore'
import 'ace-builds/src-noconflict/mode-html'

class GlobalVariables extends React.Component {
  static propTypes = {
    onSaveGlobalVariables: PropTypes.func.isRequired,
    globalVariables: PropTypes.array.isRequired,
    isDarkMode: PropTypes.bool.isRequired
  }

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
      key, value
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
    const variables = this.state.globalVariables.filter(v => v != null).map(v => new Variable(v.key, v.value))

    const unsaved = this.state.hasUnsavedChanges ? 'inline' : 'none'

    return (<div>
      <p>
        Global variables defined here can be used in all your configurations. You can store images and colors as variables to simplify the process of replacing them.
      </p>
      {variables.length > 0 ? '' : <div className="no-variables">No variables defined</div>}
      {variables.map((variable, index) => {
        return (<VariableEditor key={index} onUpdate={(name, value) => this.updateVariable(index, name, value)} onDelete={() => this.deleteVariable(index)} variable={variable} isGlobal={true} isDarkMode={this.props.isDarkMode} />)
      })}
      <button className="save-button" onClick={() => this.addVariable()}>Add Variable</button>
      <button className="save-button" onClick={() => this.save()}>Save</button>
      <span style={{ display: unsaved }} className="unsaved-warning">(Unsaved Changes)</span>
    </div>
    )
  }
}

export default GlobalVariables

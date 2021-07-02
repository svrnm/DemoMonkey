import React from 'react'
import PropTypes from 'prop-types'
import Variable from '../../../models/Variable'
import AceEditor from 'react-ace'

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

  deleteVariable(event, index) {
    event.preventDefault()
    const globalVariables = this.state.globalVariables.filter((v, i) => i !== index)

    console.log(globalVariables)

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

    return (<div>
      <p>
        Global variables defined here can be used in all your configurations. You can store images and colors as variables to simplify the process of replacing them.
      </p>
      {variables.length > 0 ? '' : <div className="no-variables">No variables defined</div>}
      {variables.map((variable, index) => {
        return (<div className="variable-box" key={index}>
          <label htmlFor="variable-1">
            <input type="text" value={variable.name} onChange={(e) => this.updateVariable(index, e.target.value, variable.value)} />&nbsp;
            <form id={'variable-form-' + index} style={{ display: 'none' }}>
              <input multiple id={'variable-upload-' + index} type="file" />
            </form>
            <small><a href="#" onClick={(e) => this.showUploadDialog(e, index, variable.name)}>
              (from image)
            </a>&nbsp;</small>
            <input type="color" id={'variable-color-' + index} style={{ display: 'none' }} />
            <small><a href="#" onClick={(e) => this.showColorDialog(e, index, variable.name)}>
              (from color)
            </a>&nbsp;</small>
            <small><a href="#" onClick={(e) => { e.preventDefault(); this.updateVariable(index, variable.name, '') }}>(reset)</a>&nbsp;</small>
            <small><a href="#" onClick={(e) => this.deleteVariable(e, index)}>(delete)</a></small>
          </label>
          <AceEditor height="4.5em" width="700px"
            name={variable.id}
            minLines={5}
            theme={this.props.isDarkMode ? 'merbivore' : 'xcode'}
            mode="html"
            wrapEnabled={true}
            highlightActiveLine={false}
            showGutter={false}
            autoScrollEditorIntoView={true}
            value={variable.value}
            ref={(c) => { this.editor = c }}
            onChange={(value) => this.updateVariable(index, variable.name, value)}
            editorProps={{ $blockScrolling: 'Infinity' }}
          />
          <div className="help">{variable.description}</div>
          <div>
            {
              variable.value.startsWith('data:image')
                ? <img src={variable.value} style={{ width: '100px', heigth: '100px' }} />
                : ''
            }
          </div>
        </div>)
      })}
      <button className="save-button" onClick={() => this.addVariable()}>Add Variable</button>
      <button className="save-button" onClick={() => this.save()}>Save</button>
      <span style={{ display: this.state.hasUnsavedChanges ? 'inline' : 'none' }} className="unsaved-warning">(Unsaved Changes)</span>
    </div>
    )
  }
}

export default GlobalVariables

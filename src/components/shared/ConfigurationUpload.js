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
import Json2Ini from '../../models/Json2Ini'
import PropTypes from 'prop-types'
import Popup from 'react-popup'
import JSZip from 'jszip'

class Prompt extends React.Component {
  static propTypes = {
    placeholder: PropTypes.string.isRequired,
    onChange: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)

    this.state = {
      value: ''
    }

    this.onChange = (e) => this._onChange(e)
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.value !== this.state.value) {
      this.props.onChange(this.state.value)
    }
  }

  _onChange(e) {
    const value = e.target.value

    this.setState({ value: value })
  }

  render() {
    return <React.Fragment>
      <label>In which folder do you want to upload these configurations? Leave empty to put them on the top level.</label>
      <input className="text-input" type="text" placeholder={this.props.placeholder} value={this.state.value} onChange={this.onChange} />
      </React.Fragment>
  }
}

class ConfigurationUpload extends React.Component {
  static propTypes = {
    id: PropTypes.string.isRequired,
    onUpload: PropTypes.func.isRequired
  }

  getIni(result, extension) {
    switch (extension) {
      case 'json':
        return Json2Ini.parse(result)
      default:
        return result
    }
  }

  showUploadDialog(event) {
    event.preventDefault()
    const upload = document.getElementById(this.props.id)
    const uploadForm = document.getElementById(this.props.id + 'Form')

    upload.addEventListener('change', (event) => {
      const files = event.target.files
      const reader = new window.FileReader()
      for (let i = 0; i < files.length; i++) {
        const file = files.item(i)

        const extension = file.name.split('.').pop()
        if (extension === 'mnky' || extension === 'ini' || extension === 'json') {
          reader.onloadend = () => {
            this.props.onUpload({
              name: file.name.replace(new RegExp('\\.' + extension + '$'), ''),
              content: this.getIni(reader.result, extension),
              test: '',
              enabled: false,
              id: 'new'
            })
          }
          reader.readAsText(file)
        } else if (extension === 'zip') {
          let folderName = ''
          const promptChange = (value) => {
            folderName = value
          }

          Popup.create({
            title: 'Batch upload into folder.',
            content: <Prompt onChange={promptChange} placeholder='Please provide a folder name.' />,
            buttons: {
              left: ['cancel'],
              right: [{
                text: 'Save',
                key: '⌘+s',
                className: 'success',
                action: () => {
                  console.log(folderName)
                  Popup.close()
                  JSZip.loadAsync(file).then((zip) => {
                    const zipPromises = []
                    zip.forEach((relativePath, zipEntry) => {
                      const extension = zipEntry.name.split('.').pop()
                      if (extension === 'mnky' || extension === 'ini' || extension === 'json') {
                        zipPromises.push(zipEntry.async('string').then((content) => {
                          return {
                            name: (folderName.replace(/\/$/, '') + '/' + zipEntry.name.replace(new RegExp('\\.' + extension + '$'), '')).replace(/^\//, ''),
                            content: this.getIni(content, extension),
                            test: '',
                            enabled: false,
                            id: 'new'
                          }
                        }))
                      }
                    })
                    Promise.all(zipPromises).then(results => {
                      this.props.onUpload(results)
                    })
                  })
                }
              }]
            }
          })
        } else {
          window.alert('Unknown extension: ' + extension + '! Please specify a .mnky or .json file!')
        }
      }
      uploadForm.reset()
    })
    upload.click()
  }

  render() {
    return <div>
      <form id={this.props.id + 'Form'} className="upload-form">
        <input multiple id={this.props.id} type="file"/>
      </form>
      <a href={'#configuration/upload'} onClick={(event) => this.showUploadDialog(event)}>
        Upload
      </a>
    </div>
  }
}

export default ConfigurationUpload

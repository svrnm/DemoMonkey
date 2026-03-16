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
import Dialog from '@mui/material/Dialog'
import JSZip from 'jszip'
import {
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip
} from '@mui/material'

class ConfigurationUpload extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      value: '',
      open: false,
      file: null
    }
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

        this.setState({ file })

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
          this.setState({ open: true })
        } else {
          window.alert(
            'Unknown extension: ' + extension + '! Please specify a .mnky or .json file!'
          )
        }
      }
      uploadForm.reset()
    })
    upload.click()
  }

  render() {
    const handleZipFileProcess = async () => {
      // return console.log(this.state.file)
      const file = this.state.file
      const folderName = this.state.value
      try {
        const zip = await JSZip.loadAsync(file)
        const zipPromises = []
        zip.forEach((relativePath, zipEntry) => {
          const extension = zipEntry.name.split('.').pop()
          if (extension === 'mnky' || extension === 'ini' || extension === 'json') {
            zipPromises.push(
              zipEntry.async('string').then((content) => {
                return {
                  name: (
                    folderName.replace(/\/$/, '') +
                    '/' +
                    zipEntry.name.replace(new RegExp('\\.' + extension + '$'), '')
                  ).replace(/^\//, ''),
                  content: this.getIni(content, extension),
                  test: '',
                  enabled: false,
                  id: 'new'
                }
              })
            )
          }
        })
        const results = await Promise.all(zipPromises)
        this.props.onUpload(results)
        this.setState({ open: false })
      } catch (error) {
        window.alert('Unable to process the uploaded file!')
      }
    }

    const handleOnChange = (e) => {
      this.setState({ value: e.target.value })
    }
    const handleClose = (e) => {
      this.setState({ open: false })
    }
    const uploadButton = this.props.icon ? (
      <Tooltip title="Upload configuration (u)">
        <IconButton
          sx={{ color: 'inherit', p: '6px' }}
          href="#configuration/upload"
          onClick={(event) => this.showUploadDialog(event)}
        >
          <svg
            style={{ width: 18, height: 18, verticalAlign: 'middle' }}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zM8 13.01l1.41 1.41L11 12.84V16h2v-3.16l1.59 1.59L16 13.01 12.01 9 8 13.01z" />
          </svg>
        </IconButton>
      </Tooltip>
    ) : (
      <Button
        style={{ textTransform: 'none', fontSize: '12px', lineHeight: '14px' }}
        href="#configuration/upload"
        onClick={(event) => this.showUploadDialog(event)}
      >
        Upload
      </Button>
    )

    return (
      <div style={this.props.icon ? { display: 'inline-flex' } : undefined}>
        <form id={this.props.id + 'Form'} className="upload-form">
          <input multiple id={this.props.id} type="file" />
        </form>

        {uploadButton}

        <Dialog open={this.state.open} onClose={handleClose}>
          <DialogTitle>Batch upload into folder.</DialogTitle>
          <DialogContent>
            <DialogContentText>
              In which folder do you want to upload these configurations? Leave empty to put them on
              the top level.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              id="name"
              label="Folder Name"
              type="text"
              fullWidth
              variant="standard"
              onChange={handleOnChange}
              value={this.state.value}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button onClick={handleZipFileProcess}>Save</Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }
}

export default ConfigurationUpload

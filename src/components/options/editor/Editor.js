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
import Variable from '../../shared/Variable'
import Popup from '../../shared/Popup'
import TabPanel from '../../shared/TabPanel'
import CodeEditor from './CodeEditor'
import Configuration from '../../../models/Configuration'
import Box from '@mui/material/Box'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import CommandBuilder from '../../../commands/CommandBuilder'
import ErrorCommand from '../../../commands/ErrorCommand'
import FormControlLabel from '@mui/material/FormControlLabel'
import Switch from '@mui/material/Switch'
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'
import ButtonGroup from '@mui/material/ButtonGroup'
import TextField from '@mui/material/TextField'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import CodeIcon from '@mui/icons-material/Code'
import TuneIcon from '@mui/icons-material/Tune'
import KeyboardIcon from '@mui/icons-material/Keyboard'

const TAB_NAMES = ['configuration', 'variables']

class Editor extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      currentConfiguration: props.currentConfiguration,
      unsavedChanges: false,
      showDeletePopup: false,
      showSavePopup: false
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.currentConfiguration.id !== prevProps.currentConfiguration.id) {
      if (prevProps.saveOnClose && prevState.unsavedChanges) {
        prevProps.onSave(prevProps.currentConfiguration, prevState.currentConfiguration)
      }
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (
      nextProps.currentConfiguration.id !== prevState.currentConfiguration.id ||
      nextProps.currentConfiguration.updated_at > prevState.currentConfiguration.updated_at
    ) {
      return {
        currentConfiguration: nextProps.currentConfiguration,
        unsavedChanges: false
      }
    }
    return null
  }

  handleUpdate(key, value, event = false) {
    if (event) {
      event.preventDefault()
    }
    const config = this.state.currentConfiguration
    config[key] = value
    this.setState({ currentConfiguration: config, unsavedChanges: true }, function () {
      if (key === 'hotkeys') {
        this.props.onSave(this.props.currentConfiguration, this.state.currentConfiguration)
        this.setState({ unsavedChanges: false })
      }
    })
  }

  handleHotkeysChange(event) {
    console.log(event)
    this.handleUpdate('hotkeys', event.target.value, null)
  }

  updateVariable(id, value) {
    const values = this.state.currentConfiguration.values
      ? this.state.currentConfiguration.values
      : {}
    if (value === null) {
      delete values[id]
    } else {
      values[id] = value
    }
    this.handleUpdate('values', values)
  }

  toggle() {
    this.props.toggleConfiguration()
  }

  _handleKeyDown = (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key === 's') {
      event.preventDefault()
      this.onBeforeSave()
    }
  }

  componentDidMount() {
    document.addEventListener('keydown', this._handleKeyDown)
  }

  componentWillUnmount() {
    document.removeEventListener('keydown', this._handleKeyDown)
  }

  handleClick(event, action) {
    if (event !== null) {
      event.preventDefault()
    }
    if (action === 'save') {
      this.setState({ unsavedChanges: false })
    }
    action = 'on' + action.charAt(0).toUpperCase() + action.substr(1)
    this.props[action](this.props.currentConfiguration, this.state.currentConfiguration)
  }

  _buildAnnotations(content) {
    const result = []

    const lines = content.split('\n')

    const nsPattern = /^@namespace(?:\[\])?\s*=\s*(.*)$/gm
    let match
    const namespaces = []
    while ((match = nsPattern.exec(content))) {
      namespaces.push(match[1])
    }

    const cb = new CommandBuilder(namespaces, [], [], this.props.featureFlags)

    lines.forEach((line, rowIdx) => {
      if ((line.replaceAll('\\=', '\u2260').match(/(?:^=)|(?:[^\\]=)/g) || []).length > 1) {
        result.push({
          row: rowIdx,
          column: 0,
          text: 'Your line contains multiple equals signs (=)!\nThe first will be used to separate search and replacement.\nQuote the equal signs that are part of your patterns.',
          type: 'warning'
        })
      }

      if (
        line.startsWith('+') &&
        line.length > 1 &&
        !this.props.getRepository().hasByName(line.substring(1))
      ) {
        result.push({
          row: rowIdx,
          column: 0,
          text: `There is no configuration called "${line.substring(
            1
          )}", this line will be ignored.`,
          type: 'warning'
        })
      }

      if (line.startsWith('!') && line.length > 1) {
        const [lhs, rhs] = line.replaceAll('\\=', '\u2260').split('=')
        const cmd = cb.build(lhs.trim(), typeof rhs === 'string' ? rhs.trim() : '')
        if (cmd instanceof ErrorCommand) {
          result.push({
            row: rowIdx,
            column: 0,
            text: cmd.reason,
            type: cmd.type
          })
        } else {
          cmd.validate().forEach((ve) => {
            result.push({
              row: rowIdx,
              column: 0,
              text: ve.rule.name,
              type: 'warning'
            })
          })
        }
      }

      if (line.includes('=')) {
        const [, rhs] = line.split(/=(.+)/, 2).map((e) => e.trim())
        if (typeof rhs === 'string' && rhs.startsWith('/') && rhs.endsWith('/')) {
          result.push({
            row: rowIdx,
            column: 0,
            text: 'expression = regex',
            type: 'info'
          })
        }
      }

      if (
        (!line.startsWith(';') && line.includes(';')) ||
        (!line.startsWith('#') && line.includes('#')) ||
        (!line.startsWith('//') && line.includes('[^:]//'))
      ) {
        result.push({
          row: rowIdx,
          column: 0,
          text: 'Semi-colon (;), double slash (//), and hash (#) are interpreted as inline comments.\nMake sure to quote your patterns to use them properly.',
          type: 'info'
        })
      }

      if (line.includes('=') && !['!', '@', '+', ';', '#', '[', '$'].includes(line.charAt(0))) {
        const [lhs, rhs] = line.split(/=(.+)/, 2).map((e) => e.trim())
        if (rhs && rhs.includes(lhs)) {
          result.push({
            row: rowIdx,
            column: 0,
            text: 'Your replacement includes the search pattern, which will lead to a replacement loop.',
            type: 'warning'
          })
        }
      }
    })

    return result
  }

  render() {
    return this.renderConfiguration()
  }

  onBeforeDelete() {
    this.setState({ showDeletePopup: true })
  }

  onBeforeSave() {
    if (!this.props.hasConfigurationWithSameName(this.state.currentConfiguration)) {
      this.handleClick(null, 'save')
    } else {
      this.setState({ showSavePopup: true })
    }
  }

  onCancelDelete() {
    this.setState({ showDeletePopup: false })
  }

  onCancelSave() {
    this.setState({ showSavePopup: false })
  }

  onSave(event) {
    this.setState({ showSavePopup: false })
    this.handleClick(event, 'save')
  }

  onDelete(event) {
    this.setState({ showDeletePopup: false })
    this.handleClick(event, 'delete')
  }

  _getTabIndex() {
    const idx = TAB_NAMES.indexOf(this.props.activeTab)
    return idx >= 0 ? idx : 0
  }

  renderConfiguration() {
    const current = this.state.currentConfiguration
    const tmpConfig = new Configuration(
      current.content,
      this.props.getRepository(),
      false,
      current.values,
      {},
      this.props.globalVariables
    )
    const variables = tmpConfig.getVariables()

    const hotkeyOptions = Array.from(Array(9).keys())

    const currentHotkeys = current.hotkeys ? current.hotkeys.filter((e) => e !== null) : []

    const autosave = current.id === 'new' ? false : this.props.autoSave

    const tabIndex = this._getTabIndex()

    const isNew = current.id === 'new'

    return (
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1,
            px: 2,
            py: 1,
            borderBottom: 1,
            borderColor: 'divider'
          }}
        >
          {!isNew && (
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={!!this.props.currentConfiguration.enabled}
                  onChange={() => {
                    this.toggle()
                  }}
                />
              }
              label={this.props.currentConfiguration.enabled ? 'On' : 'Off'}
              slotProps={{ typography: { variant: 'caption' } }}
              sx={{ mr: 0 }}
            />
          )}
          <TextField
            id="configuration-title"
            label="Name"
            placeholder="Use slashes (/) to create folders"
            value={current.name}
            onChange={(event) => this.handleUpdate('name', event.target.value, event)}
            sx={{ flexGrow: 1, minWidth: 150 }}
          />
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <Select
              renderValue={(selected) => {
                if (selected.length === 0) {
                  return <em>Shortcut Groups...</em>
                }
                return selected.map((e) => '#' + e).join(', ')
              }}
              displayEmpty
              value={currentHotkeys}
              multiple
              onChange={(event) => this.handleHotkeysChange(event)}
            >
              {hotkeyOptions.map((value) => (
                <MenuItem key={value} value={value}>
                  <span>#{value}</span>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <ButtonGroup
            variant="contained"
            sx={{
              alignSelf: 'stretch',
              '& .MuiButtonGroup-grouped': { borderColor: 'var(--mui-palette-divider)' }
            }}
          >
            <Button
              color="success"
              disabled={!this.state.unsavedChanges}
              onClick={() => this.onBeforeSave()}
            >
              Save
            </Button>
            {!isNew && (
              <Button color="success" onClick={(event) => this.handleClick(event, 'copy')}>
                Duplicate
              </Button>
            )}
            {!isNew && (
              <Button color="success" onClick={(event) => this.handleClick(event, 'download')}>
                Download
              </Button>
            )}
            {!isNew && (
              <Button color="error" onClick={() => this.onBeforeDelete()}>
                Delete
              </Button>
            )}
          </ButtonGroup>
          <Popup
            open={this.state.showSavePopup}
            onCancel={(event) => this.onCancelSave(event)}
            onConfirm={(event) => this.onSave(event)}
            title="Please confirm"
            text={
              <span>
                A configuration with{' '}
                <b>{current.name} already exists. Do you really want to use this name</b>?
              </span>
            }
          />
          <Popup
            open={this.state.showDeletePopup}
            onCancel={(event) => this.onCancelDelete(event)}
            onConfirm={(event) => this.onDelete(event)}
            title="Please confirm"
            text={
              <span>
                Do you really want to remove <b>{current.name}</b>?
              </span>
            }
          />
        </Box>
        {!tmpConfig.isTemplate() && !tmpConfig.isRestricted() && (
          <Alert severity="warning" sx={{ borderRadius: 0 }}>
            Without <b>@include</b> or <b>@exclude</b> defined, your configuration can not be
            enabled. You can only import it as template. Add <b>@template</b> to remove this
            warning.
          </Alert>
        )}
        <Box sx={{ flexGrow: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
          <Tabs
            value={tabIndex}
            onChange={(e, newValue) => {
              const target = TAB_NAMES[newValue]
              if (typeof target === 'string') {
                this.props.onNavigate(target)
              }
            }}
            sx={{ px: 1 }}
          >
            <Tab
              icon={<CodeIcon />}
              iconPosition="start"
              label="Configuration"
              id="current-configuration-editor"
            />
            <Tab icon={<TuneIcon />} iconPosition="start" label="Variables" />
            <Tab
              icon={<KeyboardIcon />}
              iconPosition="start"
              label="Shortcuts"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                window.open('https://github.com/svrnm/DemoMonkey/blob/master/SHORTCUTS.md')
              }}
              component="a"
              href="https://github.com/svrnm/DemoMonkey/blob/master/SHORTCUTS.md"
            />
          </Tabs>
          <Box sx={{ flexGrow: 1, minHeight: 0, p: 1 }}>
            <TabPanel value={tabIndex} index={0} padding={0}>
              <CodeEditor
                value={current.content}
                getRepository={this.props.getRepository}
                onChange={(content) => this.handleUpdate('content', content)}
                readOnly={current.readOnly === true}
                annotations={(content) => this._buildAnnotations(content)}
                onVimWrite={() => this.onBeforeSave()}
                onAutoSave={() => {
                  if (autosave) {
                    this.onBeforeSave()
                  }
                }}
                keyboardHandler={this.props.keyboardHandler}
                editorAutocomplete={this.props.editorAutocomplete}
                isDarkMode={this.props.isDarkMode}
                variables={variables}
              />
            </TabPanel>
            <TabPanel value={tabIndex} index={1} padding={0}>
              <p
                style={{
                  color: 'var(--mui-palette-text-secondary)',
                  margin: '8px 0 12px',
                  fontSize: '13px'
                }}
              >
                Define variables with <code>$variableName = value//description</code> and update
                their values here. Variables from imported configurations are also shown.
              </p>
              <div className="scrolling-pane">
                {variables.length === 0 && (
                  <div className="variables-empty" style={{ padding: '24px 0' }}>
                    <svg
                      style={{ width: 36, height: 36, opacity: 0.3 }}
                      viewBox="0 0 24 24"
                      fill="var(--mui-palette-custom-navigation-text)"
                    >
                      <path d="M4 6H2v14c0 1.1.9 2 2 2h14v-2H4V6zm16-4H8c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-1 9h-4v4h-2v-4H9V9h4V5h2v4h4v2z" />
                    </svg>
                    <p>No variables defined</p>
                  </div>
                )}
                <div className="variables-list">
                  {variables.map((variable) => {
                    return (
                      <Variable
                        isGlobal={false}
                        key={variable.id}
                        onUpdate={(id, value) => this.updateVariable(id, value)}
                        variable={variable}
                        isDarkMode={this.props.isDarkMode}
                      />
                    )
                  })}
                </div>
              </div>
            </TabPanel>
          </Box>
        </Box>
      </Box>
    )
  }
}

export default Editor

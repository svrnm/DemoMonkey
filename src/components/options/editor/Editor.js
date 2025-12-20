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
import Tabs from '../../shared/Tabs'
import Pane from '../../shared/Pane'
import Variable from '../../shared/Variable'
import Popup from '../../shared/Popup'
import CodeEditor from './CodeEditor'
import Configuration from '../../../models/Configuration'
import PropTypes from 'prop-types'
import Mousetrap from 'mousetrap'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import CommandBuilder from '../../../commands/CommandBuilder'
import ErrorCommand from '../../../commands/ErrorCommand'
import Switch from '@mui/material/Switch'

class Editor extends React.Component {
  static propTypes = {
    currentConfiguration: PropTypes.object.isRequired,
    globalVariables: PropTypes.array.isRequired,
    getRepository: PropTypes.func.isRequired,
    onSave: PropTypes.func.isRequired,
    onCopy: PropTypes.func.isRequired,
    onDownload: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    autoSave: PropTypes.bool.isRequired,
    saveOnClose: PropTypes.bool.isRequired,
    editorAutocomplete: PropTypes.bool.isRequired,
    toggleConfiguration: PropTypes.func.isRequired,
    keyboardHandler: PropTypes.string,
    isDarkMode: PropTypes.bool.isRequired,
    featureFlags: PropTypes.objectOf(PropTypes.bool).isRequired,
    activeTab: PropTypes.string,
    onNavigate: PropTypes.func.isRequired,
    hasConfigurationWithSameName: PropTypes.func.isRequired
  }

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

  componentDidMount() {
    Mousetrap.prototype.stopCallback = function (e, element, combo) {
      if (combo === 'mod+s') {
        return false
      }
      if ((' ' + element.className + ' ').indexOf(' mousetrap ') > -1) {
        return false
      }
      return (
        element.tagName === 'INPUT' ||
        element.tagName === 'SELECT' ||
        element.tagName === 'TEXTAREA' ||
        (element.contentEditable && element.contentEditable === 'true')
      )
    }

    Mousetrap.bind('mod+s', (event) => {
      event.preventDefault()
      this.onBeforeSave()
      return false
    })
  }

  componentWillUnmount() {
    Mousetrap.unbind('mod+s')
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

    // Capture namespaces for the command builder.
    const nsPattern = /^@namespace(?:\[\])?\s*=\s*(.*)$/gm
    let match
    const namespaces = []
    while ((match = nsPattern.exec(content))) {
      namespaces.push(match[1])
    }

    const cb = new CommandBuilder(namespaces, [], [], this.props.featureFlags)

    lines.forEach((line, rowIdx) => {
      // Process each line and add infos, warnings, errors
      // Multiple = signs can lead to issues, add an info
      if ((line.replaceAll('\\=', '\u2260').match(/(?:^=)|(?:[^\\]=)/g) || []).length > 1) {
        result.push({
          row: rowIdx,
          column: 0,
          text: 'Your line contains multiple equals signs (=)!\nThe first will be used to separate search and replacement.\nQuote the equal signs that are part of your patterns.',
          type: 'warning'
        })
      }

      // Check if an imported configuration is available
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
          // `Command "${command}" not found.\nPlease check the spelling and\nif all required namespaces are loaded.`
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
        /* if (cmd === 'Eval') {
          result.push({ row: rowIdx, column: 0, text: '!eval allows you to inject arbitrary javascript code in a page, please use with caution!', type: 'warning' })
        } */
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
        /* the ^: is so that URL's are not interpreted as comments */
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

  renderConfiguration() {
    const current = this.state.currentConfiguration
    const hiddenIfNew = current.id === 'new' ? { display: 'none' } : {}
    const tmpConfig = new Configuration(
      current.content,
      this.props.getRepository(),
      false,
      current.values,
      {},
      this.props.globalVariables
    )
    const variables = tmpConfig.getVariables()

    const showTemplateWarning =
      tmpConfig.isTemplate() || tmpConfig.isRestricted() ? 'no-warning-box' : 'warning-box'

    const hotkeyOptions = Array.from(Array(9).keys())

    const currentHotkeys = current.hotkeys ? current.hotkeys.filter((e) => e !== null) : []

    const autosave = current.id === 'new' ? false : this.props.autoSave

    return (
      <div className="editor">
        <div className="title">
          <div className="toggle-configuration" style={hiddenIfNew}>
            <Switch
              checked={!!this.props.currentConfiguration.enabled}
              onChange={() => {
                this.toggle()
              }}
              height={20}
              width={48}
            />
          </div>
          <b>Name</b>
          <input
            type="text"
            className="text-input"
            id="configuration-title"
            placeholder="Please provide a name. You can use slashes (/) in it to create folders."
            value={current.name}
            onChange={(event) => this.handleUpdate('name', event.target.value, event)}
          />
          <div className="select-hotkeys">
            <FormControl sx={{ m: 1, width: '95%' }} size="small">
              <Select
                style={{
                  background: 'var(--input-background-color)',
                  color: 'var(--mode-text-color)'
                }}
                renderValue={(selected) => {
                  if (selected.length === 0) {
                    return <em>Shortcut Groups...</em>
                  }
                  return selected.map((e) => '#' + e).join(', ')
                }}
                displayEmpty
                value={currentHotkeys}
                multiple
                width="100%"
                onChange={(event) => this.handleHotkeysChange(event)}
              >
                {hotkeyOptions.map((value) => (
                  <MenuItem key={value} value={value}>
                    <span>#{value}</span>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </div>
          <button
            className={'save-button ' + (this.state.unsavedChanges ? '' : 'disabled')}
            onClick={() => this.onBeforeSave()}
          >
            Save
          </button>
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
          <button
            className="copy-button"
            style={hiddenIfNew}
            onClick={(event) => this.handleClick(event, 'copy')}
          >
            Duplicate
          </button>
          <button
            className="download-button"
            style={hiddenIfNew}
            onClick={(event) => this.handleClick(event, 'download')}
          >
            Download
          </button>
          <button
            className="delete-button"
            style={hiddenIfNew}
            onClick={(event) => this.onBeforeDelete()}
          >
            Delete
          </button>
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
        </div>
        <div className={showTemplateWarning}>
          <b>Warning:</b> Without <b>@include</b> or <b>@exclude</b> defined, your configuration can
          not be enabled. You can only import it as template into another configuration. If this is
          intended, add <b>@template</b> to remove this warning.
        </div>
        <Tabs activeTab={this.props.activeTab} onNavigate={this.props.onNavigate}>
          <Pane label="Configuration" name="configuration" id="current-configuration-editor">
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
          </Pane>
          <Pane label="Variables" name="variables">
            <div>
              Introduce variables in your configuration with a line{' '}
              <code>$variableName = variableValue//description</code>. You can quickly update the
              values of variables here. Note, that you also can see the variables of imported
              configurations and set their value accordingly. If you define a variable with the same
              name here and in the important, your local variable has precedence.
            </div>
            <div className="scrolling-pane">
              {variables.length > 0 ? '' : <div className="no-variables">No variables defined</div>}
              {variables.map((variable, index) => {
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
          </Pane>
          {/* <Pane label="Access Control" name="acl">
            <AccessControl for={current} />
          </Pane> */}
          <Pane
            link={(e) => {
              e.preventDefault()
              window.open('https://github.com/svrnm/DemoMonkey/blob/master/SHORTCUTS.md')
            }}
            label="Shortcuts"
          />
        </Tabs>
      </div>
    )
  }
}

export default Editor

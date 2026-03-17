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
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Switch from '@mui/material/Switch'
import Chip from '@mui/material/Chip'
import Tooltip from '@mui/material/Tooltip'
import IconButton from '@mui/material/IconButton'
import Configuration from '../../models/Configuration'
import ToggleConfiguration from '../shared/ToggleConfiguration'
import ErrorBox from '../shared/ErrorBox'

class ConfigurationList extends React.Component {
  constructor(props) {
    super(props)
    this.currentDirectory = ''
    this.state = {
      search: '',
      onlyShowActivated: false,
      onlyShowAvailable: props.settings.optionalFeatures.onlyShowAvailableConfigurations === true
    }
  }

  handleSearchUpdate(event) {
    this.setState({ search: event.target.value.toLowerCase() })
  }

  toggleOnlyShowAvailable() {
    this.setState({ onlyShowAvailable: !this.state.onlyShowAvailable })
  }

  toggleOnlyShowActivated() {
    this.setState({ onlyShowActivated: !this.state.onlyShowActivated })
  }

  toggleLiveEditor() {
    this.props.actions.toggleLiveEditor()
  }

  renderItem(configuration) {
    const tmpConfig = new Configuration(configuration.content, null, false, configuration.values)

    if (
      (this.state.onlyShowAvailable && !tmpConfig.isAvailableForUrl(this.props.currentUrl)) ||
      (this.state.onlyShowActivated && !configuration.enabled) ||
      tmpConfig.isTemplate() ||
      !tmpConfig.isRestricted() ||
      configuration.name.toLowerCase().startsWith('zzz_archive/')
    ) {
      return null
    }

    return (
      <ToggleConfiguration
        key={configuration.id}
        onlyShowAvailable={this.state.onlyShowAvailable}
        currentUrl={this.props.currentUrl}
        actions={this.props.actions}
        configuration={configuration}
      />
    )
  }

  getConfigurations() {
    return this.props.configurations.filter((c) => {
      return c.name.toLowerCase().indexOf(this.state.search) > -1
    })
  }

  getLatest() {
    return this.getConfigurations()
      .sort((a, b) => {
        return a.updated_at < b.updated_at ? 1 : -1
      })
      .slice(0, 3)
  }

  getList() {
    return this.getConfigurations().sort((a, b) => {
      return a.name.toLowerCase() > b.name.toLowerCase() ? 1 : -1
    })
  }

  renderLatest() {
    if (this.getConfigurations().length < 12) {
      return null
    }
    const items = this.getLatest()
      .map((c) => this.renderItem(c))
      .filter(Boolean)
    if (items.length === 0) return null
    return (
      <div className="latest-configurations">
        <div className="latest-title">Recent</div>
        {items}
      </div>
    )
  }

  renderList() {
    const latestIds =
      this.getConfigurations().length >= 12 ? new Set(this.getLatest().map((c) => c.id)) : new Set()
    const items = this.getList()
      .filter((c) => !latestIds.has(c.id))
      .map((c) => this.renderItem(c))
      .filter(Boolean)
    return (
      <div>
        {this.renderLatest()}
        {items.length > 0 || latestIds.size > 0 ? (
          items
        ) : (
          <div className="popup-empty">No matching configurations</div>
        )}
      </div>
    )
  }

  renderEmpty() {
    return (
      <div className="popup-empty">
        No configurations found.{' '}
        <a
          href="#"
          onClick={(e) => {
            e.preventDefault()
            window.chrome.runtime.openOptionsPage()
          }}
        >
          Open Dashboard
        </a>
      </div>
    )
  }

  buildIncludeRegex() {
    if (this.props.currentUrl) {
      const u = new URL(this.props.currentUrl)
      const protocol = ['https:', 'http:'].includes(u.protocol) ? 'https?:' : u.protocol
      const host = u.hostname
      const escapedHost = host.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
      return '@include[] = /^' + protocol + '\\/\\/' + escapedHost + '\\/.*$/'
    }
    return ''
  }

  async copyIncludeRegex() {
    const text = this.buildIncludeRegex()
    if (!text) {
      return
    }

    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard &&
      typeof navigator.clipboard.writeText === 'function'
    ) {
      try {
        await navigator.clipboard.writeText(text)
      } catch (err) {
        // Handle clipboard write failure to avoid unhandled promise rejections
        // You may want to surface this to the user instead of just logging.
        console.error('Failed to copy include regex to clipboard:', err)
      }
    }
  }

  render() {
    try {
      return (
        <div className="popup-content">
          <div className="popup-include-hint">Copy this to add the current page to a config:</div>
          <div className="popup-include-bar">
            <code className="popup-include-code">{this.buildIncludeRegex()}</code>
            <Tooltip title="Copy to clipboard">
              <IconButton size="small" onClick={() => this.copyIncludeRegex()}>
                <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="currentColor">
                  <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
                </svg>
              </IconButton>
            </Tooltip>
          </div>
          <div className="popup-search">
            <TextField
              size="small"
              fullWidth
              onChange={(event) => this.handleSearchUpdate(event)}
              value={this.state.search}
              placeholder="Search configurations..."
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <svg
                        style={{ width: 16, height: 16 }}
                        viewBox="0 0 24 24"
                        fill="var(--mui-palette-text-secondary)"
                      >
                        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                      </svg>
                    </InputAdornment>
                  )
                }
              }}
              sx={{
                '& .MuiInputBase-input': {
                  background: 'transparent',
                  color: 'var(--mui-palette-text-primary)',
                  py: '6px',
                  fontSize: '13px'
                },
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  background: 'var(--mui-palette-custom-highlight)',
                  '& fieldset': { borderColor: 'transparent' },
                  '&:hover fieldset': {
                    borderColor: 'var(--mui-palette-text-secondary)',
                    opacity: 0.3
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: 'var(--mui-palette-custom-base)',
                    borderWidth: '1px'
                  }
                }
              }}
            />
          </div>
          <div className="popup-list-header">
            <div className="popup-filters">
              <span className="popup-filter-label">Show:</span>
              <Chip
                label="Available for this page"
                size="small"
                variant={this.state.onlyShowAvailable ? 'filled' : 'outlined'}
                color={this.state.onlyShowAvailable ? 'success' : 'default'}
                onClick={() => this.toggleOnlyShowAvailable()}
                icon={
                  this.state.onlyShowAvailable ? (
                    <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  ) : undefined
                }
                sx={{ fontSize: '11px', height: 22 }}
              />
              <Chip
                label="Active only"
                size="small"
                variant={this.state.onlyShowActivated ? 'filled' : 'outlined'}
                color={this.state.onlyShowActivated ? 'success' : 'default'}
                onClick={() => this.toggleOnlyShowActivated()}
                icon={
                  this.state.onlyShowActivated ? (
                    <svg style={{ width: 14, height: 14 }} viewBox="0 0 24 24" fill="currentColor">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </svg>
                  ) : undefined
                }
                sx={{ fontSize: '11px', height: 22 }}
              />
            </div>
          </div>
          <div className="configurations-list">
            {this.getConfigurations().length < 1 ? this.renderEmpty() : this.renderList()}
          </div>
          <div className="popup-footer">
            <Tooltip title="Opens an interactive Live Editor overlay on the page" placement="top">
              <span className="popup-debug-label">Live Editor</span>
            </Tooltip>
            <Switch
              size="small"
              checked={!!(this.props.settings.liveEditorEnabled ?? this.props.settings.debugMode)}
              onChange={() => this.toggleLiveEditor()}
            />
          </div>
        </div>
      )
    } catch (e) {
      return <ErrorBox error={e} />
    }
  }
}

export default ConfigurationList

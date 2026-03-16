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

import ConfigurationUpload from '../../shared/ConfigurationUpload'
import { Button, IconButton, Tooltip } from '@mui/material'

const iconSx = { color: 'inherit', p: '6px' }
const svgStyle = { width: 18, height: 18, verticalAlign: 'middle' }

function NavigationHeader({
  onNavigate,
  onUpload,
  onDownloadAll,
  showLogs,
  syncDarkMode,
  preferDarkMode,
  onToggleOptionalFeature
}) {
  function handleClick(event, target) {
    event.preventDefault()
    onNavigate(target)
  }

  // Cycle: System → Dark → Light → System
  async function cycleTheme() {
    if (syncDarkMode) {
      // System → Dark: disable sync, then enable dark
      await onToggleOptionalFeature('syncDarkMode')
      if (!preferDarkMode) {
        await onToggleOptionalFeature('preferDarkMode')
      }
    } else if (preferDarkMode) {
      // Dark → Light: disable dark
      await onToggleOptionalFeature('preferDarkMode')
    } else {
      // Light → System: enable sync
      await onToggleOptionalFeature('syncDarkMode')
    }
  }

  const themeMode = syncDarkMode ? 'system' : preferDarkMode ? 'dark' : 'light'
  const themeLabel = syncDarkMode ? 'System' : preferDarkMode ? 'Dark' : 'Light'

  return (
    <div className="top-bar">
      <div className="top-bar-left">
        {/* NoteAdd */}
        <Tooltip title="Create new configuration (n)">
          <Button
            sx={{
              color: 'inherit',
              textTransform: 'none',
              borderRadius: '20px',
              px: 1.5,
              py: 0.5,
              fontSize: '13px',
              lineHeight: 1.2,
              minWidth: 0,
              background: 'rgba(255,255,255,0.12)',
              '&:hover': { background: 'rgba(255,255,255,0.22)' }
            }}
            href="#configuration/new"
            onClick={(event) => handleClick(event, 'configuration/new')}
            startIcon={
              <svg style={svgStyle} viewBox="0 0 24 24" fill="currentColor">
                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 14h-3v3h-2v-3H8v-2h3v-3h2v3h3v2zm-3-7V3.5L18.5 9H13z" />
              </svg>
            }
          >
            Create
          </Button>
        </Tooltip>
        {/* UploadFile */}
        <ConfigurationUpload onUpload={onUpload} id="upload" icon />
        <div className="top-bar-divider" />
        {/* Settings */}
        <Tooltip title="Settings (,)">
          <IconButton
            sx={iconSx}
            href="#settings"
            onClick={(event) => handleClick(event, 'settings')}
          >
            <svg style={svgStyle} viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.488.488 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.44.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6A3.6 3.6 0 1115.6 12 3.611 3.611 0 0112 15.6z" />
            </svg>
          </IconButton>
        </Tooltip>
        {/* HelpCenter */}
        <Tooltip title="Help (?)">
          <IconButton
            sx={iconSx}
            href="#help"
            onClick={(event) => handleClick(event, 'help')}
            aria-label="Help"
          >
            <svg style={svgStyle} viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 18h2v-2h-2v2zm1-16C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
            </svg>
          </IconButton>
        </Tooltip>
      </div>
      <div className="top-bar-right">
        {/* Download */}
        <Tooltip title="Backup all configurations (b)">
          <IconButton
            sx={iconSx}
            href="#backup"
            onClick={onDownloadAll}
            aria-label="Backup all configurations"
          >
            <svg style={svgStyle} viewBox="0 0 24 24" fill="currentColor">
              <path d="M5 20h14v-2H5v2zM19 9h-4V3H9v6H5l7 7 7-7z" />
            </svg>
          </IconButton>
        </Tooltip>
        {/* TextSnippet */}
        {showLogs && (
          <Tooltip title="Logs (l)">
            <IconButton sx={iconSx} href="#logs" onClick={(event) => handleClick(event, 'logs')}>
              <svg style={svgStyle} viewBox="0 0 24 24" fill="currentColor">
                <path d="M14.17 5L19 9.83V19H5V5h9.17M14.17 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V9.83c0-.53-.21-1.04-.59-1.41l-4.83-4.83c-.37-.38-.88-.59-1.41-.59zM7 15h10v2H7v-2zm0-4h10v2H7v-2zm0-4h7v2H7V7z" />
              </svg>
            </IconButton>
          </Tooltip>
        )}
        <div className="top-bar-divider" />
        {/* Theme toggle */}
        <Tooltip title={`Theme: ${themeLabel} (click to cycle)`}>
          <IconButton sx={iconSx} onClick={cycleTheme}>
            {themeMode === 'system' && (
              <svg style={svgStyle} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 22c5.52 0 10-4.48 10-10S17.52 2 12 2 2 6.48 2 12s4.48 10 10 10zm1-17.93c3.94.49 7 3.85 7 7.93s-3.05 7.44-7 7.93V4.07z" />
              </svg>
            )}
            {themeMode === 'dark' && (
              <svg style={svgStyle} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z" />
              </svg>
            )}
            {themeMode === 'light' && (
              <svg style={svgStyle} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5zM2 13h2c.55 0 1-.45 1-1s-.45-1-1-1H2c-.55 0-1 .45-1 1s.45 1 1 1zm18 0h2c.55 0 1-.45 1-1s-.45-1-1-1h-2c-.55 0-1 .45-1 1s.45 1 1 1zM11 2v2c0 .55.45 1 1 1s1-.45 1-1V2c0-.55-.45-1-1-1s-1 .45-1 1zm0 18v2c0 .55.45 1 1 1s1-.45 1-1v-2c0-.55-.45-1-1-1s-1 .45-1 1zM5.99 4.58a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0s.39-1.03 0-1.41L5.99 4.58zm12.37 12.37a.996.996 0 00-1.41 0 .996.996 0 000 1.41l1.06 1.06c.39.39 1.03.39 1.41 0a.996.996 0 000-1.41l-1.06-1.06zm1.06-10.96a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06zM7.05 18.36a.996.996 0 000-1.41.996.996 0 00-1.41 0l-1.06 1.06c-.39.39-.39 1.03 0 1.41s1.03.39 1.41 0l1.06-1.06z" />
              </svg>
            )}
          </IconButton>
        </Tooltip>
        {/* GitHub */}
        <Tooltip title="GitHub repository">
          <IconButton
            sx={iconSx}
            component="a"
            href="https://github.com/svrnm/DemoMonkey"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg style={svgStyle} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1.27a11 11 0 00-3.48 21.46c.55.09.73-.28.73-.55v-1.84c-3.03.64-3.67-1.46-3.67-1.46-.55-1.29-1.28-1.65-1.28-1.65-.92-.65.1-.65.1-.65 1.1 0 1.73 1.1 1.73 1.1.92 1.65 2.57 1.2 3.21.92a2.16 2.16 0 01.64-1.47c-2.47-.27-5.04-1.19-5.04-5.5 0-1.1.46-2.1 1.2-2.84a3.76 3.76 0 010-2.93s.91-.28 3.11 1.1c1.8-.49 3.7-.49 5.5 0 2.1-1.38 3.02-1.1 3.02-1.1a3.76 3.76 0 010 2.93c.74.74 1.2 1.74 1.2 2.84 0 4.31-2.58 5.23-5.06 5.5.45.37.82.92.82 2.02v3.03c0 .27.18.64.73.55A11 11 0 0012 1.27" />
            </svg>
          </IconButton>
        </Tooltip>
        {/* Chrome Web Store */}
        <Tooltip title="Chrome Web Store">
          <IconButton
            sx={iconSx}
            component="a"
            href="https://chromewebstore.google.com/detail/demomonkey/jgbhioialphpgjgofopnplfibkeehgjd"
            target="_blank"
            rel="noopener noreferrer"
          >
            <svg style={svgStyle} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8z" />
              <circle cx="12" cy="12" r="4" />
            </svg>
          </IconButton>
        </Tooltip>
      </div>
    </div>
  )
}

export default NavigationHeader

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
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import SettingsIcon from '@mui/icons-material/Settings'
import HelpOutlineIcon from '@mui/icons-material/HelpOutline'
import DownloadIcon from '@mui/icons-material/Download'
import DescriptionIcon from '@mui/icons-material/Description'
import ContrastIcon from '@mui/icons-material/Contrast'
import DarkModeIcon from '@mui/icons-material/DarkMode'
import LightModeIcon from '@mui/icons-material/LightMode'
import GitHubIcon from '@mui/icons-material/GitHub'
import ExtensionIcon from '@mui/icons-material/Extension'

const iconSx = { color: 'inherit', p: '6px' }

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
            startIcon={<NoteAddIcon fontSize="small" />}
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
            <SettingsIcon fontSize="small" />
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
            <HelpOutlineIcon fontSize="small" />
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
            <DownloadIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        {/* TextSnippet */}
        {showLogs && (
          <Tooltip title="Logs (l)">
            <IconButton sx={iconSx} href="#logs" onClick={(event) => handleClick(event, 'logs')}>
              <DescriptionIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <div className="top-bar-divider" />
        {/* Theme toggle */}
        <Tooltip title={`Theme: ${themeLabel} (click to cycle)`}>
          <IconButton sx={iconSx} onClick={cycleTheme}>
            {themeMode === 'system' && <ContrastIcon fontSize="small" />}
            {themeMode === 'dark' && <DarkModeIcon fontSize="small" />}
            {themeMode === 'light' && <LightModeIcon fontSize="small" />}
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
            <GitHubIcon fontSize="small" />
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
            <ExtensionIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  )
}

export default NavigationHeader

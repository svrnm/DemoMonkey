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
import React, { useState, useCallback } from 'react'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { formatRelativeTime, formatISO } from '../../../helpers/timeFormat'
import Popup from '../../shared/Popup'
import FolderIcon from '@mui/icons-material/Folder'
import DescriptionIcon from '@mui/icons-material/Description'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import TaskIcon from '@mui/icons-material/Task'
import DeleteIcon from '@mui/icons-material/Delete'
import DownloadIcon from '@mui/icons-material/Download'

function ItemHeader({ node, style: styleProp, onDelete, onDownload }) {
  const [optionsVisible, setOptionsVisible] = useState(false)
  const [showDeletePopup, setShowDeletePopup] = useState(false)
  const [contextMenu, setContextMenu] = useState(null)

  const handleMenu = useCallback(
    (e) => {
      e.preventDefault()
      setContextMenu(contextMenu === null ? { mouseX: e.clientX, mouseY: e.clientY } : null)
    },
    [contextMenu]
  )

  const handleCloseMenu = useCallback(() => {
    setContextMenu(null)
  }, [])

  const handleDelete = useCallback(
    (event) => {
      setShowDeletePopup(false)
      handleCloseMenu()
      onDelete(event, node)
    },
    [node, onDelete, handleCloseMenu]
  )

  const isDirectory = !!node.children
  const isTemplate =
    !isDirectory && typeof node.content === 'string' && /^@template\b/m.test(node.content)
  const base = isDirectory ? styleProp.folder : styleProp.item
  const updatedAt = node.updated_at
  const label = node.name === '%' ? <i>Snippets</i> : node.name === '' ? <i>(empty)</i> : node.name

  function hasEnabledDescendant(n) {
    if (n.enabled) return true
    if (Array.isArray(n.children)) return n.children.some(hasEnabledDescendant)
    return false
  }

  const isEnabled = isDirectory ? hasEnabledDescendant(node) : node.enabled

  const iconSx = {
    fontSize: 14,
    mr: '4px',
    flexShrink: 0,
    verticalAlign: 'middle',
    color: isEnabled
      ? 'var(--mui-palette-success-main)'
      : 'var(--mui-palette-custom-navigation-text)'
  }

  function renderIcon() {
    if (isDirectory) {
      return <FolderIcon sx={iconSx} />
    }
    if (isTemplate) {
      return <DescriptionIcon sx={{ ...iconSx, opacity: isEnabled ? 1 : 0.6 }} />
    }
    if (node.enabled) {
      return <TaskIcon sx={iconSx} />
    }
    return <InsertDriveFileIcon sx={iconSx} />
  }

  function renderTimeStamp() {
    if (node.updated_at) {
      const isoTime = formatISO(updatedAt)
      return (
        <time dateTime={isoTime} title={isoTime}>
          {formatRelativeTime(updatedAt, true)}
        </time>
      )
    }
    return ''
  }

  return (
    <div
      style={base}
      onMouseEnter={() => setOptionsVisible(true)}
      onMouseLeave={() => setOptionsVisible(false)}
      onContextMenu={handleMenu}
      className={node.readOnly === true ? 'navigation-item read-only-item' : 'navigation-item'}
    >
      <div style={{ ...styleProp.title, display: 'inline-flex', alignItems: 'center' }}>
        {renderIcon()}
        <a href={'#configuration/' + node.id} onClick={(event) => event.preventDefault()}>
          {label}
        </a>
      </div>
      <div className="configuration-updated-at" style={styleProp.timestamp}>
        {renderTimeStamp()}
      </div>
      <div
        className="configuration-options"
        style={{
          visibility: optionsVisible ? 'visible' : 'hidden'
        }}
      >
        {!isDirectory && (
          <button
            className="download-configuration"
            onClick={(event) => onDownload(event, node)}
            title="Download"
            aria-label="Download"
          >
            <DownloadIcon sx={{ fontSize: 12, verticalAlign: 'middle' }} />
          </button>
        )}
        <button
          className="delete-configuration"
          onClick={() => setShowDeletePopup(true)}
          title="Delete"
          aria-label="Delete"
        >
          <DeleteIcon sx={{ fontSize: 12, verticalAlign: 'middle' }} />
        </button>
      </div>
      <Menu
        open={contextMenu !== null}
        onClose={handleCloseMenu}
        anchorReference="anchorPosition"
        anchorPosition={
          contextMenu !== null ? { top: contextMenu.mouseY, left: contextMenu.mouseX } : undefined
        }
      >
        {!isDirectory && (
          <MenuItem
            onClick={(event) => {
              onDownload(event, node)
              handleCloseMenu()
            }}
          >
            Download
          </MenuItem>
        )}
        <MenuItem
          onClick={() => {
            setShowDeletePopup(true)
            handleCloseMenu()
          }}
        >
          Delete
        </MenuItem>
      </Menu>
      <Popup
        open={showDeletePopup}
        onCancel={() => setShowDeletePopup(false)}
        onConfirm={(event) => handleDelete(event)}
        title="Please confirm"
        text={
          <span>
            Do you really want to remove <b>{label}</b>?
          </span>
        }
      />
    </div>
  )
}

export default ItemHeader

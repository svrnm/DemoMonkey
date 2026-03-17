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

  const iconSize = 14
  const iconStyle = {
    width: iconSize,
    height: iconSize,
    marginRight: 4,
    flexShrink: 0,
    verticalAlign: 'middle'
  }

  function renderIcon() {
    const iconColor = isEnabled
      ? 'var(--mui-palette-success-main)'
      : 'var(--mui-palette-custom-navigation-text)'
    if (isDirectory) {
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill={iconColor}>
          <path d="M10 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2h-8l-2-2z" />
        </svg>
      )
    }
    if (isTemplate) {
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill={iconColor} opacity={isEnabled ? 1 : 0.6}>
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zM9 13h6v2H9v-2zm0 4h6v2H9v-2z" />
        </svg>
      )
    }
    if (node.enabled) {
      // Task icon — file with checkmark
      return (
        <svg style={iconStyle} viewBox="0 0 24 24" fill={iconColor}>
          <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-2.7 6.7L8.5 12.9l1.1-1.1 1.7 1.7 3.6-3.6 1.1 1.1-4.7 4.7z" />
        </svg>
      )
    }
    return (
      <svg style={iconStyle} viewBox="0 0 24 24" fill={iconColor}>
        <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13z" />
      </svg>
    )
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
          >
            <svg
              style={{ width: 12, height: 12, verticalAlign: 'middle' }}
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z" />
            </svg>
          </button>
        )}
        <button
          className="delete-configuration"
          onClick={() => setShowDeletePopup(true)}
          title="Delete"
        >
          <svg
            style={{ width: 12, height: 12, verticalAlign: 'middle' }}
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
          </svg>
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

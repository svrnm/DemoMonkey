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
import Table from '@mui/material/Table'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableRow from '@mui/material/TableRow'
import TableCell from '@mui/material/TableCell'
import { formatRelativeTime, formatISO } from '../../helpers/timeFormat'

const levelColors = {
  error: 'var(--danger-color)',
  warn: 'var(--warning-color)'
}

function Logs({ entries }) {
  function renderElement(m) {
    if (typeof m === 'object' && m.fromError === true) {
      return (
        <span title={m.stack}>
          <b>{m.name}:</b> {m.message}
        </span>
      )
    }
    if (typeof m === 'object') {
      return JSON.stringify(m)
    }
    return m
  }

  function openTab(event, tabId) {
    event.preventDefault()
    window.chrome.tabs.update(tabId, { active: true, highlighted: true })
  }

  function renderTabButton(tabId) {
    if (!tabId) {
      return ''
    }
    return (
      <a href="#" onClick={(event) => openTab(event, tabId)}>
        Open Tab
      </a>
    )
  }

  return (
    <div className="content">
      <div className="logs">
        <h1>Logs</h1>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold' }}>Time</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Source</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Level</TableCell>
              <TableCell sx={{ fontWeight: 'bold' }}>Message</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {entries
              .slice()
              .reverse()
              .map(({ timestamp, source, level, message, tabId, repeated }, index) => {
                const isoTime = formatISO(timestamp)
                const color = levelColors[level]
                return (
                  <TableRow key={index} sx={color ? { color } : undefined}>
                    <TableCell sx={color ? { color: 'inherit' } : undefined}>
                      <time dateTime={isoTime} title={isoTime}>
                        {formatRelativeTime(timestamp, true)}
                      </time>
                    </TableCell>
                    <TableCell sx={color ? { color: 'inherit' } : undefined}>
                      {source} {renderTabButton(tabId)}
                    </TableCell>
                    <TableCell sx={color ? { color: 'inherit' } : undefined}>{level}</TableCell>
                    <TableCell sx={color ? { color: 'inherit' } : undefined}>
                      {message.map((m, k) => {
                        return <span key={k}>{renderElement(m)} </span>
                      })}
                      <i>{repeated > 0 ? ` (message repeated ${repeated} times)` : ''}</i>
                    </TableCell>
                  </TableRow>
                )
              })}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default Logs

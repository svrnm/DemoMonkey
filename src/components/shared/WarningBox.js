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
import Alert from '@mui/material/Alert'
import Button from '@mui/material/Button'

function WarningBox({ onRequestExtendedPermissions, onDismiss }) {
  return (
    <Alert
      severity="warning"
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        borderRadius: 0,
        py: 0,
        zIndex: 1000
      }}
      action={
        <>
          <Button
            color="inherit"
            size="small"
            id="grant-permissions-button"
            onClick={(e) => {
              e.preventDefault()
              onRequestExtendedPermissions()
            }}
          >
            Grant
          </Button>
          <Button
            color="inherit"
            size="small"
            onClick={(e) => {
              e.preventDefault()
              onDismiss()
            }}
          >
            Dismiss
          </Button>
        </>
      }
    >
      For DemoMonkey to work optimally you have to grant permissions to access all websites.{' '}
      <a
        href="https://developer.chrome.com/extensions/permission_warnings"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn more
      </a>
    </Alert>
  )
}

export default WarningBox

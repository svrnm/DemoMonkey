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
import AlertTitle from '@mui/material/AlertTitle'
import { logger } from '../../helpers/logger'

function ErrorBox({ error }) {
  logger('error', error).write()
  return (
    <Alert severity="error" sx={{ m: 1, mt: 0 }}>
      <AlertTitle>Oops! Something went wrong:</AlertTitle>
      <strong>Message:</strong> {error.message}
      {error.stack && <pre style={{ whiteSpace: 'pre-wrap', fontSize: '11px' }}>{error.stack}</pre>}
      <div>
        <a
          href={`https://github.com/svrnm/DemoMonkey/issues/new?title=${encodeURIComponent(error.message || '')}&body=${encodeURIComponent(error.stack || '')}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Report Issue
        </a>
        &nbsp;:&nbsp;
        <a href="backup.html">Open Backup Page</a>
      </div>
    </Alert>
  )
}

export default ErrorBox

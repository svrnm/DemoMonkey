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
import React, { useMemo } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { lightTheme, darkTheme } from '../../theme'

function Page({ syncDarkMode, preferDarkMode, className, children }) {
  if (syncDarkMode) {
    document.documentElement.classList.remove('dark-mode')
    document.documentElement.classList.remove('light-mode')
  } else if (preferDarkMode) {
    document.documentElement.classList.add('dark-mode')
    document.documentElement.classList.remove('light-mode')
  } else {
    document.documentElement.classList.remove('dark-mode')
    document.documentElement.classList.add('light-mode')
  }

  const isDark = syncDarkMode
    ? window.matchMedia('(prefers-color-scheme: dark)').matches
    : !!preferDarkMode

  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <div className={className}>{children}</div>
    </ThemeProvider>
  )
}

export default Page

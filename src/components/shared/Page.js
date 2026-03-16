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
import React, { useMemo, useState, useEffect } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { lightTheme, darkTheme } from '../../theme'

function Page({ syncDarkMode, preferDarkMode, className, children }) {
  const [isDark, setIsDark] = useState(() =>
    syncDarkMode ? false : !!preferDarkMode
  )

  useEffect(() => {
    if (syncDarkMode && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

      // Set initial value based on current OS preference
      setIsDark(mediaQuery.matches)

      const handleChange = (event) => {
        setIsDark(event.matches)
      }

      if (typeof mediaQuery.addEventListener === 'function') {
        mediaQuery.addEventListener('change', handleChange)
      } else if (typeof mediaQuery.addListener === 'function') {
        mediaQuery.addListener(handleChange)
      }

      return () => {
        if (typeof mediaQuery.removeEventListener === 'function') {
          mediaQuery.removeEventListener('change', handleChange)
        } else if (typeof mediaQuery.removeListener === 'function') {
          mediaQuery.removeListener(handleChange)
        }
      }
    } else {
      setIsDark(!!preferDarkMode)
    }
  }, [syncDarkMode, preferDarkMode])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }

    const root = document.documentElement

    if (syncDarkMode) {
      root.classList.remove('dark-mode')
      root.classList.remove('light-mode')
    } else if (isDark) {
      root.classList.add('dark-mode')
      root.classList.remove('light-mode')
    } else {
      root.classList.remove('dark-mode')
      root.classList.add('light-mode')
    }
  }, [syncDarkMode, isDark])

  const theme = useMemo(() => (isDark ? darkTheme : lightTheme), [isDark])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <div className={className}>{children}</div>
    </ThemeProvider>
  )
}

export default Page

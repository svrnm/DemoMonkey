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
import React, { useState, useEffect } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from '../../theme'

function Page({ syncDarkMode, preferDarkMode, className, children }) {
  const [isDark, setIsDark] = useState(() => {
    if (syncDarkMode && typeof window !== 'undefined' && window.matchMedia) {
      try {
        return window.matchMedia('(prefers-color-scheme: dark)').matches
      } catch {
        // If matchMedia throws for any reason, fall back to explicit preference
      }
    }
    return !!preferDarkMode
  })

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
    const colorScheme = isDark ? 'dark' : 'light'

    // Set MUI color scheme attribute — drives cssVariables mode
    root.setAttribute('data-mui-color-scheme', colorScheme)
  }, [syncDarkMode, isDark])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <div className={className}>{children}</div>
    </ThemeProvider>
  )
}

export default Page

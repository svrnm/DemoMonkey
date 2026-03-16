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
import { createTheme } from '@mui/material/styles'

const commonPalette = {
  success: { main: '#284907' },
  error: { main: '#952613' },
  warning: { main: '#ff9632' }
}

const sharedComponents = {
  MuiButton: {
    defaultProps: {
      size: 'small',
      disableElevation: true
    },
    styleOverrides: {
      root: {
        textTransform: 'none'
      }
    }
  },
  MuiButtonGroup: {
    defaultProps: {
      size: 'small',
      disableElevation: true
    }
  },
  MuiTab: {
    styleOverrides: {
      root: {
        textTransform: 'none',
        minHeight: 36,
        paddingTop: 4,
        paddingBottom: 4
      }
    }
  },
  MuiTabs: {
    styleOverrides: {
      root: {
        minHeight: 36
      }
    }
  },
  MuiTextField: {
    defaultProps: {
      size: 'small'
    }
  },
  MuiSwitch: {
    styleOverrides: {
      track: {
        backgroundColor: 'var(--mode-text-color)'
      }
    }
  },
  MuiMenu: {
    styleOverrides: {
      paper: {
        backgroundColor: 'var(--input-background-color)',
        color: 'var(--mode-text-color)'
      }
    }
  },
  MuiCssBaseline: {
    styleOverrides: {
      body: {
        fontSize: '12px'
      }
    }
  }
}

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    ...commonPalette,
    background: {
      default: '#fff',
      paper: '#fff'
    },
    text: {
      primary: '#111'
    }
  },
  components: sharedComponents
})

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    ...commonPalette,
    success: { main: '#4a7a1a' },
    error: { main: '#c4543f' },
    background: {
      default: '#000',
      paper: '#000'
    },
    text: {
      primary: '#eee'
    }
  },
  components: sharedComponents
})

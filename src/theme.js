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

export const theme = createTheme({
  cssVariables: true,
  colorSchemes: {
    light: {
      palette: {
        primary: { main: '#284907' },
        success: { main: '#4a8c1c' },
        error: { main: '#952613' },
        warning: { main: '#ff9632' },
        background: {
          default: '#fff',
          paper: '#fefefe'
        },
        text: {
          primary: '#111',
          secondary: '#666'
        },
        custom: {
          base: '#284907',
          topbar: '#284907',
          'base-link': '#284907',
          'darker-base': '#001900',
          'lighter-base': '#f2ffe6',
          'hover-link': '#4b7b2a',
          highlight: '#eee',
          'navigation-background': '#e8ede4',
          'navigation-read-only': '#4b7b2a',
          'navigation-item': 'rgb(241, 247, 236)',
          'navigation-active': '#a8c987',
          'navigation-text': '#284907',
          'editor-title-background': '#fff',
          'editor-comment': '#a50',
          'editor-group': '#a00',
          'editor-option': '#f50',
          'editor-search': '#00f',
          'editor-function': '#708',
          'editor-import': '#31b404',
          'editor-variable': '#bf00ff',
          'editor-disabled': '#f3f3f3',
          'editor-string-url': '#0cc8ed',
          'table-header': '#ccc',
          'table-2n': '#f0f0f0',
          'warning-background': '#fff5eb',
          download: '#d8caa8'
        }
      }
    },
    dark: {
      palette: {
        primary: { main: '#a8c987' },
        success: { main: '#6abf2a' },
        error: { main: '#c4543f' },
        warning: { main: '#ff9632' },
        background: {
          default: '#000',
          paper: '#444'
        },
        text: {
          primary: '#eee',
          secondary: '#aaa'
        },
        custom: {
          base: '#000000',
          topbar: '#262626',
          'base-link': '#eee',
          'darker-base': '#333',
          'lighter-base': '#404040',
          'hover-link': '#aaa',
          highlight: '#444',
          'navigation-background': '#303030',
          'navigation-read-only': '#333',
          'navigation-item': '#222',
          'navigation-active': '#444',
          'navigation-text': '#eee',
          'editor-title-background': '#030303',
          'editor-comment': '#09ffe7',
          'editor-group': '#0b0',
          'editor-option': '#0af',
          'editor-search': '#ff0',
          'editor-function': '#f79580',
          'editor-import': '#d060f8',
          'editor-variable': '#40ff00',
          'editor-disabled': '#0c0c0c',
          'editor-string-url': '#0cc8ed',
          'table-header': '#666',
          'table-2n': '#333',
          'warning-background': '#4d3000',
          download: '#d8caa8'
        }
      }
    }
  },
  components: {
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
    MuiChip: {
      styleOverrides: {
        colorDefault: {
          borderColor: 'var(--mui-palette-text-secondary)'
        }
      }
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          minHeight: 36,
          paddingTop: 4,
          paddingBottom: 4,
          color: 'var(--mui-palette-text-primary)',
          '&.Mui-selected': {
            color: 'var(--mui-palette-primary-main)'
          }
        }
      }
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 36
        },
        indicator: {
          backgroundColor: 'var(--mui-palette-primary-main)'
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
        switchBase: {
          '&.Mui-checked': {
            color: 'var(--mui-palette-success-main)',
            '& + .MuiSwitch-track': {
              backgroundColor: 'var(--mui-palette-success-main)'
            }
          }
        },
        track: {
          backgroundColor: 'var(--mui-palette-text-primary)'
        }
      }
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: 'var(--mui-palette-primary-main)'
          }
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
})

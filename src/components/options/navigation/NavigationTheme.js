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
export default {
  subtree: {
    listStyle: 'none',
    paddingLeft: '19px'
  },
  tree: {
    base: {
      listStyle: 'none',
      backgroundColor: 'unset',
      margin: 0,
      padding: 0,
      color: '#284907'
    },
    node: {
      base: {
        position: 'relative'
      },
      link: {
        cursor: 'pointer',
        borderRadius: '7px',
        padding: '10px',
        width: '100%',
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center'
      },
      activeLink: {
        background: 'var(--button-active-color)'
      },
      toggle: {
        base: {
          marginLeft: '-5px',
          marginRight: '5px',
          height: '24px',
          width: '24px',
          display: 'flex',
          justifyContent: 'center'
        },
        wrapper: {
          display: 'flex',
          alignSelf: 'center',
          marginTop: '4px',
          height: '14px'
        },
        height: 14,
        width: 14,
        arrow: {
          fill: '#9DA5AB',
          strokeWidth: 0
        }
      },
      header: {
        folder: {
          color: 'var(--navigation-text-color)'
        },
        item: {
          color: 'var(--navigation-text-color)',
          width: '100%'
        },
        connector: {
          width: '2px',
          height: '12px',
          borderLeft: 'solid 2px black',
          borderBottom: 'solid 2px black',
          position: 'absolute',
          top: '0px',
          left: '-21px'
        },
        title: {
          lineHeight: '24px',
          verticalAlign: 'middle'
        },
        timestamp: {
          color: '#888888',
          fontSize: '80%'
        }
      },
      loading: {
        color: '#E2C089'
      }
    }
  }
}

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
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import ItemHeader from './ItemHeader'
import navigationTheme from './NavigationTheme'
import ErrorBox from '../../shared/ErrorBox'
import merge from 'deepmerge'
import arrayMerge from '../../../helpers/arrayMerge'
import { SimpleTreeView } from '@mui/x-tree-view/SimpleTreeView'
import { TreeItem } from '@mui/x-tree-view/TreeItem'

class Navigation extends React.Component {
  // This implementation is not very performant
  // Probably in the long run, the underyling datamodel needs to be changed
  static buildTree(items, state) {
    let tree = []
    let cursor = {}
    let find = () => true
    if (state.search !== '') {
      const words = state.search.split(' ')
      find = (item) => {
        return words.some((word) => {
          return (
            item.name.toLowerCase().indexOf(word) !== -1 ||
            item.tags.includes(word) ||
            (word === 'enabled' && item.enabled)
          )
        })
      }
    }
    items.forEach((orig, index) => {
      const item = Object.assign({}, orig)
      if (!find(item)) {
        return
      }
      const currentIsActive = state.active === item.id
      if (currentIsActive) {
        item.active = true
        cursor = item
      }
      item.nodeType = 'item'
      const path = ('./' + item.name).split('/')
      item.name = path.pop()
      const sub = path.reverse().reduce((acc, dir, index) => {
        const id = '/' + path.slice(index, -1).join('/')
        const result = {
          name: dir,
          nodeType: 'directory',
          id,
          enabled: item.enabled,
          children: [acc]
        }
        // This is required, since the merge might prefer a false from a previous element
        if (currentIsActive || state.toggled[id]) {
          result.toggled = true
        }
        return result
      }, item)
      tree = merge(tree, sub.children, { arrayMerge })
    })
    return { tree, cursor }
  }

  constructor(props) {
    super(props)
    const { tree, cursor } = Navigation.buildTree(this.props.items, {
      active: props.active,
      search: '',
      toggled: {}
    })
    this.state = {
      data: tree,
      cursor,
      active: props.active,
      toggled: {},
      search: ''
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { tree, cursor } = Navigation.buildTree(nextProps.items, {
      ...prevState,
      active: nextProps.active
    })
    return { data: tree, cursor }
  }

  handleClick(id, isDirectory = false) {
    this.props.onNavigate('configuration/' + id)
  }

  handleSearchUpdate(event) {
    this.setState({ search: event.target.value.toLowerCase() }, function () {
      const { tree, cursor } = Navigation.buildTree(this.props.items, this.state)
      this.setState({ data: tree, cursor })
    })
  }

  onToggle(event, nodeId) {
    // console.log(event, nodeId)
    if (typeof nodeId === 'string' && !nodeId.startsWith('/')) {
      this.handleClick(nodeId)
    }
  }

  onDelete(event, node) {
    event.preventDefault()
    this.props.onDelete(node)
  }

  onDownload(event, node) {
    event.preventDefault()
    this.props.onDownload(node)
  }

  _renderTreeFromData(node) {
    return (
      <TreeItem
        key={node.id}
        itemId={node.id}
        label={
          <ItemHeader
            node={node}
            style={navigationTheme.tree.node.header}
            onDelete={(event, node) => this.onDelete(event, node)}
            onDownload={(event, node) => this.onDownload(event, node)}
          />
        }
      >
        {Array.isArray(node.children)
          ? node.children.map((node) => this._renderTreeFromData(node))
          : null}
      </TreeItem>
    )
  }

  _safeRenderTree() {
    // console.log(this.state.data)
    try {
      return (
        <SimpleTreeView
          onItemExpansionToggle={(event, nodeId) => this.onToggle('toggle', nodeId)}
          onItemClick={(event, nodeId) => this.onToggle('select', nodeId)}
          sx={{
            '& .MuiTreeItem-content': { pl: 0.5 },
            '& .MuiTreeItem-groupTransition': { ml: 2 }
          }}
        >
          {this.state.data.map((item) => this._renderTreeFromData(item))}
        </SimpleTreeView>
      )
    } catch (e) {
      return <ErrorBox error={e} />
    }
  }

  render() {
    return (
      <div>
        <div className="navigation-search">
          <TextField
            size="small"
            fullWidth
            onChange={(event) => this.handleSearchUpdate(event)}
            value={this.state.search}
            placeholder="Search... (/ or ⌘K)"
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <svg
                      style={{ width: 16, height: 16 }}
                      viewBox="0 0 24 24"
                      fill="var(--mui-palette-custom-navigation-text)"
                    >
                      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                  </InputAdornment>
                )
              }
            }}
            sx={{
              '& .MuiInputBase-input': {
                background: 'transparent',
                color: 'var(--mui-palette-custom-navigation-text)',
                py: '6px',
                px: '4px',
                fontSize: '13px'
              },
              '& .MuiOutlinedInput-root': {
                borderRadius: '4px',
                background: 'var(--mui-palette-custom-navigation-active)',
                '& fieldset': { borderColor: 'transparent' },
                '&:hover fieldset': {
                  borderColor: 'var(--mui-palette-custom-navigation-text)',
                  opacity: 0.3
                },
                '&.Mui-focused fieldset': {
                  borderColor: 'var(--mui-palette-custom-base)',
                  borderWidth: '1px'
                }
              }
            }}
          />
        </div>
        <div className="tree items">{this._safeRenderTree()}</div>
      </div>
    )
  }
}

export default Navigation

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
import PropTypes from 'prop-types'
import NavigationHeader from './NavigationHeader'
import ItemHeader from './ItemHeader'
import navigationTheme from './NavigationTheme'
import ErrorBox from '../../shared/ErrorBox'
import merge from 'deepmerge'
import arrayMerge from '../../../helpers/arrayMerge'
import TreeView from '@mui/lab/TreeView'
import TreeItem from '@mui/lab/TreeItem'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import { createTheme, TextField, ThemeProvider } from '@mui/material'

class Navigation extends React.Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.object).isRequired,
    onNavigate: PropTypes.func.isRequired,
    active: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]).isRequired,
    onUpload: PropTypes.func.isRequired,
    onDelete: PropTypes.func.isRequired,
    onDownloadAll: PropTypes.func.isRequired,
    showLogs: PropTypes.bool.isRequired
  }

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

  _renderTreeFromData(node) {
    return (
      <TreeItem
        key={node.id}
        nodeId={node.id}
        label={
          <ItemHeader
            node={node}
            style={navigationTheme.tree.node.header}
            onDelete={(event, node) => this.onDelete(event, node)}
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
        <TreeView
          defaultCollapseIcon={<ExpandMoreIcon color="action" />}
          defaultExpandIcon={<ChevronRightIcon color="action" />}
          onNodeToggle={(event, nodeId) => this.onToggle('toggle', nodeId)}
          onNodeSelect={(event, nodeId) => this.onToggle('select', nodeId)}
        >
          {this.state.data.map((item) => this._renderTreeFromData(item))}
        </TreeView>
      )
    } catch (e) {
      return <ErrorBox error={e} />
    }
  }

  render() {
    /*
    decorators.Header = (props) => {
      return <ItemHeader
        style={props.style}
        node={props.node}
        onDelete={(event, node) => this.onDelete(event, node)}
      />
    }
    */

    const theme = createTheme({
      palette: {
        mode: 'dark'
      }
    })

    return (
      <div>
        <div className="navigation-header">
          <NavigationHeader
            onUpload={this.props.onUpload}
            onDownloadAll={this.props.onDownloadAll}
            onNavigate={this.props.onNavigate}
            showLogs={this.props.showLogs}
          />
          <div className="searchBox">
            <ThemeProvider theme={theme}>
              <TextField
                id="outlined-basic"
                sx={{ width: '100%' }}
                label="Search"
                variant="outlined"
                type="text"
                onChange={(event) => this.handleSearchUpdate(event)}
                value={this.state.search}
                placeholder="Search..."
              />
            </ThemeProvider>
          </div>
        </div>
        <div className="tree items">{this._safeRenderTree()}</div>
      </div>
    )
  }
}

export default Navigation

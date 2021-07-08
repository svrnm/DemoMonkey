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
import moment from 'moment'

class ItemHeader extends React.Component {
  static propTypes = {
    style: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired,
    onDelete: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props)
    this.state = {
      optionsVisible: false,
      contextMenuVisible: false,
      x: '0px',
      y: '0px'
    }
    this.handleOutsideClick = (e) => {
      if (this.node && this.node.contains(event.target)) {
        return
      }
      console.log(e)
      this.setState({
        contextMenuVisible: false,
        x: '0px',
        y: '0px'
      })
      document.removeEventListener('mousedown', this.handleOutsideClick, false)
    }
  }

  handleMenu(e) {
    this.setState({
      contextMenuVisible: true,
      x: e.clientX + 'px',
      y: e.clientY + 'px'
    })
    document.addEventListener('mousedown', this.handleOutsideClick, false)
    e.preventDefault()
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', this.handleOutsideClick, false)
  }

  handleHover(mouseEnter) {
    this.setState({
      optionsVisible: mouseEnter
    })
  }

  render() {
    const style = Object.assign({}, this.props.style)

    const isDirectory = !!this.props.node.children

    const base = isDirectory ? style.folder : style.item

    const updatedAt = moment(this.props.node.updated_at)

    const label = this.props.node.name === '%' ? (<i>Snippets</i>) : this.props.node.name

    return (
      <div style={base} onMouseEnter={(e) => this.handleHover(true)} onMouseLeave={(e) => this.handleHover(false)} onContextMenu={(e) => this.handleMenu(e)} className={this.props.node.readOnly === true ? 'navigation-item read-only-item' : 'navigation-item'} ref={node => { this.node = node }}>
        <div style={style.title}>
          {/* the onclick event is disabled since the interaction is managed by the navigation */}
          <a href={'#configuration/' + this.props.node.id} onClick={(event) => event.preventDefault()}>{label}</a>
        </div>
        <div className="configuration-updated-at" style={style.timestamp}>
          {
            this.props.node.enabled
              ? <span style={{ color: 'red' }}>enabled</span>
              : (this.props.node.updated_at
                  ? <time dateTime={updatedAt.format()} title={updatedAt.format()}>
                  {updatedAt.fromNow(true)}
                </time>
                  : ''
                )
          }
        </div>
        <div className="configuration-options" style={{ visibility: this.state.optionsVisible ? 'visible' : 'hidden' }}>
          <button className="delete-configuration" onClick={(event) => this.props.onDelete(event, this.props.node)}>x</button>
        </div>
        <ul className="context-menu" style={{ display: this.state.contextMenuVisible ? 'block' : 'none', top: this.state.y, left: this.state.x }}>
          <li>
            <a href="#" onClick={(event) => this.props.onDelete(event, this.props.node)}>Delete</a>
          </li>
        </ul>
      </div>
    )
  }
}

export default ItemHeader

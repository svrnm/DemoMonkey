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
import React, { Component, Fragment } from 'react'
import PropTypes from 'prop-types'

class DropDownMenu extends Component {
  constructor() {
    super()
    this.state = {
      visible: false
    }
  }

  static propTypes = {
    children: PropTypes.arrayOf(PropTypes.object).isRequired,
    buttonClassName: PropTypes.string.isRequired,
    menuClassName: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired
  }

  _toggle(event) {
    event.preventDefault()
    this.setState({ visible: !this.state.visible })
  }

  componentWillUnmount() {
    document.removeEventListener('mousedown', (e) => this.handleClick(e), false)
  }

  componentDidMount() {
    document.addEventListener('mousedown', (e) => this.handleClick(e), false)
  }

  handleClick(event) {
    if (this.buttonNode.contains(event.target) || this.menuNode.contains(event.target)) {
      return
    }
    this.setState({ visible: false })
  }

  render() {
    const menuStyle = {
      display: this.state.visible ? 'inline-block' : 'none'
    }

    return <Fragment>
      <button ref={node => { this.buttonNode = node }} className={this.props.buttonClassName} onClick={(e) => this._toggle(e)}>{this.props.label}</button>
      <ul ref={node => { this.menuNode = node }} className={this.props.menuClassName} style={menuStyle}>
        {this.props.children.map((child, index) => {
          return <li key={index}>{child}</li>
        }) }
      </ul>
    </Fragment>
  }
}

export default DropDownMenu

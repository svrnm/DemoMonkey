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
import { Button } from '@mui/material'

class Tabs extends React.Component {
  static propTypes = {
    children: PropTypes.arrayOf(PropTypes.object).isRequired,
    activeTab: PropTypes.string,
    onNavigate: PropTypes.func.isRequired
  }

  _getSelected() {
    this.tabNames = this.props.children.map((child) => child.props.name)
    return this.props.activeTab && this.tabNames.indexOf(this.props.activeTab) > -1
      ? this.tabNames.indexOf(this.props.activeTab)
      : 0
  }

  _renderContent() {
    return <div className="tabs__content">{this.props.children[this._getSelected()]}</div>
  }

  handleClick(index, event) {
    event.preventDefault()
    // this.setState({ selected: index })
    this.props.onNavigate(this.tabNames[index])
  }

  _renderTitles() {
    function labels(child, index) {
      if (child.props.visible === false) {
        return null
      }
      if (child.props.link) {
        return (
          <li key={index} style={child.props.style}>
            <Button
              sx={{ textTransform: 'none' }}
              href="#"
              onClick={child.props.link}
              variant="contained"
            >
              {child.props.label}
            </Button>
          </li>
        )
      } else {
        const activeClass = this._getSelected() === index ? true : false
        return (
          <li key={index} id={child.props.id} style={child.props.style}>
            <Button
              sx={{
                textTransform: 'none'
              }}
              href="#"
              onClick={this.handleClick.bind(this, index)}
              variant="contained"
              color={activeClass ? 'success' : 'primary'}
            >
              {child.props.label}
            </Button>
          </li>
        )
      }
    }

    return <ul className="tabs__labels">{this.props.children.map(labels.bind(this))}</ul>
  }

  render() {
    return (
      <div className="tabs">
        {this._renderTitles()}
        {this._renderContent()}
      </div>
    )
  }
}

export default Tabs

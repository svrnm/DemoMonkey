import React from 'react'
import PropTypes from 'prop-types'
import TimeAgo from 'react-timeago'

class ItemHeader extends React.Component {
  static propTypes = {
    style: PropTypes.object.isRequired,
    node: PropTypes.object.isRequired
  }

  formatTime(value, unit, suffix, date, defaultFormatter) {
    var r = defaultFormatter()
    return r.substr(0, r.length - 4)
  }

  render() {
    var style = Object.assign({}, this.props.style)

    var base = this.props.node.children ? style.folder : style.item

    return (
      <div style={base} className="navigation-item">
        <div style={style.title}>
          {/* the onclick event is disabled since the interaction is managed by the navigation */}
          <a className={this.props.node.readOnly === true ? 'read-only-item' : ''} href={'#configuration/' + this.props.node.id} onClick={(event) => event.preventDefault()}>{this.props.node.name}</a>
        </div>
        <div className="configuration-updated-at" style={style.timestamp}>
          <TimeAgo formatter={(value, unit, suffix, date, defaultFormatter) => this.formatTime(value, unit, suffix, date, defaultFormatter)} date={this.props.node.updated_at} minPeriod="60" />
        </div>
      </div>
    )
  }
}

export default ItemHeader

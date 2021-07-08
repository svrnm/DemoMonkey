import React from 'react'
import marked from 'marked'
import highlight from 'highlight.js'

class Help extends React.Component {
  constructor(props) {
    super(props)

    this.fallback = require('../../../USAGE.md')

    this.state = {
      usage: null,
      loaded: false
    }
  }

  componentDidMount() {
    // We try to fetch USAGE.md from github directly, this allows to update
    // the inline usage docs without having to make a release every time
    // on the google chrome webstore.
    fetch('https://raw.githubusercontent.com/svrnm/DemoMonkey/main/USAGE.md')
      .then(response => response.text())
      .then(data => this.setState({ usage: data, loaded: true }))
      .catch(() => {
        this.setState({
          loaded: true,
          usage: this.fallback
        })
      })
  }

  render() {
    const usage = this.state.loaded ? this.state.usage : this.fallback
    const html = marked(usage, {
      gfm: true,
      headerIds: true,
      highlight: (code, lang) => {
        const language = highlight.getLanguage(lang) ? lang : 'plaintext'
        return highlight.highlight(code, { language }).value
      }
    })

    return (
      <div className="content">
        <div className="welcome" dangerouslySetInnerHTML={{ __html: html }}></div>
      </div>
    )
  }
}

export default Help

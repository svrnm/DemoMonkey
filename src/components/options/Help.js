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

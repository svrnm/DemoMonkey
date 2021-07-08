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
import axios from 'axios'

class ProtocolHandler {
  constructor(protocol) {
    this.protocol = protocol
  }

  handle(search) {
    return new Promise((resolve, reject) => {
      const s = new URLSearchParams(search).get('s')
      if (typeof s !== 'string') {
        return resolve(false)
      }

      let url = new URL(s)
      if (url.protocol !== this.protocol) {
        reject(new Error(`Presented url '${url}' does not start with expected protocol ${this.protocol}`))
      }

      // Right now new URL with custom protocol puts everything into the pathname, so we fix this early
      url = new URL(url.href.replace(this.protocol, 'http:'))

      console.log(url.host)

      if (url.host === 'gist' || url.host === 'g') {
        const id = url.pathname.substr(1)
        return this._handleGist(id, resolve, reject)
      }

      this._handleDefault(url, resolve, reject)
    })
  }

  _buildConfiguration(name, content) {
    if (content.includes('@author')) {
      const match = content.match(/@author(?:\[\])?\s*=\s*([^<\r\n]*)/)
      if (match[1]) {
        name = `Shared/from ${match[1]}`
      }
    }
    return {
      name,
      id: 'new',
      enabled: false,
      content
    }
  }

  _handleDefault(url, resolve, reject) {
    axios({ url }).then(response => {
      if (response.status === 200 && typeof response.data === 'string') {
        resolve(this._buildConfiguration(`Shared/${url.href}`, response.data))
      }
    }).catch(error => {
      error.message = `Could not handle ${url}, error was: ${error.message}`
      reject(error)
    })
  }

  _handleGist(id, resolve, reject) {
    const url = `https://gist.github.com/${id}/`
    axios({
      url
    }).then(response => {
      if (response.status === 200) {
        const url = response.request.responseURL + '/raw'
        axios({
          url
        }).then(response => {
          resolve(this._buildConfiguration(`Shared/${id}`, response.data))
        }).catch(error => {
          error.message = `Could not handle ${url}, error was: ${error.message}`
          reject(error)
        })
      }
    }).catch(error => {
      error.message = `Could not handle ${url}, error was: ${error.message}`
      reject(error)
    })
  }
}

export default ProtocolHandler

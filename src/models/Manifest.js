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

class Manifest {
  constructor(chrome, commitHash) {
    this.manifestVersion = chrome.runtime.getManifest().version
    this.manifestAuthor = chrome.runtime.getManifest().author
    this.homepageUrl = chrome.runtime.getManifest().homepage_url
    this.commitHash = commitHash
  }

  authorMail() {
    return this.manifestAuthor.split('<')[1].replace('>', '')
  }

  authorName() {
    return this.manifestAuthor.split('<')[0]
  }

  author() {
    return <a href={'mailto:' + this.authorMail()}>{this.authorName()}</a>
  }

  url() {
    return this.homepageUrl
  }

  supportUrl() {
    return this.homepageUrl + 'issues/new'
  }

  homepage() {
    return <a href={this.url()} target="_blank" rel='noopener noreferrer'>{this.url()}</a>
  }

  supportLink() {
    return <a href={this.supportUrl()} target="_blank" rel='noopener noreferrer'>{this.supportUrl()}</a>
  }

  version() {
    return this.manifestVersion
  }

  buildFromUrl() {
    return this.homepageUrl + 'commit/' + this.commitHash
  }

  buildFromLink() {
    return <a href={this.buildFromUrl()} target="_blank" rel='noopener noreferrer'>{this.commitHash}</a>
  }
}

export default Manifest

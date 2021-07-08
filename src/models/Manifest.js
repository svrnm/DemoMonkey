import React from 'react'

class Manifest {
  constructor(chrome) {
    this.manifestVersion = chrome.runtime.getManifest().version
    this.manifestAuthor = chrome.runtime.getManifest().author
    this.homepageUrl = chrome.runtime.getManifest().homepage_url
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
}

export default Manifest

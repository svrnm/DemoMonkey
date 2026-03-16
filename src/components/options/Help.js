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
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { marked } from 'marked'

const renderer = new marked.Renderer()
const originalCode = renderer.code.bind(renderer)
renderer.code = function (...args) {
  const html = originalCode(...args)
  return `<div class="code-block-wrapper">${html}<button class="code-copy-btn" title="Copy to clipboard">Copy</button></div>`
}

function Help() {
  const fallback = require('../../../USAGE.md')
  const [usage, setUsage] = useState(null)
  const [loaded, setLoaded] = useState(false)
  const contentRef = useRef(null)

  useEffect(() => {
    fetch('https://raw.githubusercontent.com/svrnm/DemoMonkey/main/USAGE.md')
      .then((response) => {
        return response.text()
      })
      .then((data) => {
        setUsage(data)
        setLoaded(true)
        return null
      })
      .catch(() => {
        setUsage(fallback)
        setLoaded(true)
      })
  }, [fallback])

  const handleClick = useCallback((e) => {
    if (e.target.classList.contains('code-copy-btn')) {
      const wrapper = e.target.closest('.code-block-wrapper')
      const code = wrapper.querySelector('code')
      if (code) {
        navigator.clipboard
          .writeText(code.textContent)
          .then(() => {
            e.target.textContent = 'Copied!'
            setTimeout(() => {
              e.target.textContent = 'Copy'
            }, 2000)
            return null
          })
          .catch(() => {})
      }
    }
  }, [])

  const content = loaded ? usage : fallback
  const html = marked(content, {
    gfm: true,
    headerIds: true,
    renderer
  })

  return (
    <div className="content">
      <div
        className="welcome"
        ref={contentRef}
        onClick={handleClick}
        dangerouslySetInnerHTML={{ __html: html }}
      ></div>
    </div>
  )
}

export default Help

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
class UndoElement {
  constructor(target, key, original, replacement, source = {}) {
    this.target = target
    this.key = key
    this.original = original
    this.replacement = replacement
    this.source = source
    this.callback = false
  }

  static fromFunction(func) {
    const undoElement = new UndoElement()
    undoElement.callback = func
    return undoElement
  }

  setSource(source) {
    this.source = source
  }

  update(target, key, original, replacement) {
    this.target = target
    this.key = key
    this.original = original
    this.replacement = replacement
  }

  apply() {
    if (typeof this.callback === 'function') {
      return this.callback()
    }

    if (typeof this.target === 'undefined') {
      return false
    }

    let target = this.target
    if (typeof target === 'string' && target.startsWith('dmid-')) {
      target = document.querySelector(`[data-demo-monkey-id=${target}]`)
    }

    let key = this.key

    if (key.includes('.')) {
      const path = key.split('.')
      key = path.pop()
      // Note that there is no proper error handling, so if the path is broken, strange things can happen.
      path.forEach(k => {
        if (target && target[k]) {
          target = target[k]
        }
      })
    }

    if (target[key] === this.replacement) {
      // Fix for transform attribute of SVGElement which is read-only
      if (key === 'transform' && target instanceof SVGElement) {
        target.setAttribute(key, this.original)
      }
      target[key] = this.original
      return true
    }
    return false
  }
}

export default UndoElement

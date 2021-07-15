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
import Command from './Command'
import UndoElement from './UndoElement'

class ReplaceImage extends Command {
  constructor(replace, parameters) {
    super()
    let search = ''
    let withRatio = false
    if (parameters.length > 1) {
      // check if the last parameter is 'withRatio'
      const lastParameter = parameters.pop()
      if (['false', 'true', '0', '1'].includes(lastParameter.toLowerCase())) {
        withRatio = lastParameter
      } else {
        // Put last parameter back
        parameters.push(lastParameter)
      }
      // it could happen that a data image URL contains a , and the
      // command builder is doing a split, we revert this here.
      search = parameters.join(',')
    } else {
      search = parameters[0]
    }

    this.search = search
    this.replace = replace
    this.withRatio = withRatio === '1' || withRatio === 'true'
  }

  isApplicableForGroup(group) {
    return group === 'image' || group === '*'
  }

  apply(target, key = 'value') {
    const original = key === 'style.backgroundImage' ? target.style.backgroundImage : target[key]

    const search = this._lookupImage(this.search)

    // An empty replacement seems to break the image, so we ignore it.
    if (this.replace === '') {
      return false
    }

    if (this._match(original, search, this.replace)) {
      const result = []
      if (this.withRatio && typeof target.width === 'number' && typeof target.height === 'number') {
        const oldWidth = target.width
        const oldHeight = target.height
        const undoPlaceholder = new UndoElement()
        const el = function (e) {
          const widthFactor = this.naturalWidth / oldWidth
          const heightFactor = this.naturalHeight / oldHeight
          if (this.naturalWidth > this.naturalHeight) {
            const originalHeight = this.style.height
            this.style.height = (oldHeight * heightFactor / widthFactor) + 'px'
            undoPlaceholder.update(this, 'style.height', originalHeight, this.style.height)
          } else {
            const originalWidth = this.style.width
            this.style.width = (oldWidth * widthFactor / heightFactor) + 'px'
            undoPlaceholder.update(this, 'style.height', originalWidth, this.style.width)
          }
          this.removeEventListener('load', el)
        }
        target.addEventListener('load', el)
        result.push(undoPlaceholder)
      }

      if (key === 'style.backgroundImage') {
        target.style.backgroundImage = `url("${this.replace}")`
        console.log(new UndoElement(target, key, original, `url("${this.replace}")`))
        result.push(new UndoElement(target, key, original, `url("${this.replace}")`))
      } else {
        target[key] = this.replace
        result.push(new UndoElement(target, key, original, this.replace))
      }

      return result
    }
    return false
  }

  toString() {
    return this.search.toString() + '/' + this.replace.toString()
  }
}

export default ReplaceImage

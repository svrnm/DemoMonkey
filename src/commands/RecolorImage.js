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
import { v4 as uuidV4 } from 'uuid'

class RecolorImage extends Command {
  constructor(search, replace) {
    super()
    this.search = search
    this.replace = typeof replace === 'string' ? Command._getColorFromValue(replace) : false
  }

  isApplicableForGroup(group) {
    return group === 'image' || group === '*'
  }

  apply(target, key = 'value') {
    if (!this.replace) {
      return false
    }

    const search = this._lookupImage(this.search)

    if (this._match(target[key], search) && !target.style.filter.includes('#demomonkey-color-')) {
      const original = target.style.filter
      const colorId = 'demomonkey-color-' + uuidV4()
      // Note: For some reason it does not work to add the SVG first and apply the filter second.
      target.style.filter += `url(#${colorId})`
      target.dataset.demoMonkeyId = `dmid-${uuidV4()}`
      const [red, green, blue] = this.replace.rgb().color.map(v => v / 255)
      const alpha = this.replace.rgb().valpha
      target.parentElement.innerHTML += `<svg height="0px" width="0px"><defs><filter id="${colorId}"><feColorMatrix type="matrix" values="0 0 0 0 ${red} 0 0 0 0 ${green} 0 0 0 0 ${blue} 0 0 0 ${alpha} 0"/></filter></defs></svg>`
      return new UndoElement(target.dataset.demoMonkeyId, 'style.filter', original, target.style.filter)
    }
    return false
  }

  toString() {
    return this.search.toString() + '/' + this.replace.toString()
  }
}

export default RecolorImage

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
import Command from '../Command'
import UndoElement from '../UndoElement'

class ReplaceFlowmapConnection extends Command {
  constructor(tier1, tier2, value, force) {
    super()
    this.tier1 = tier1
    this.tier2 = tier2
    this.value = value
    this.force = force === '1' || force === 'true'
  }

  apply(node, key) {
    // It would be probably more efficient to run the following directly on the document
    // and search for the connection. This is currently not possible with DemoMonkey
    // An "advantage" of this approach is, that by going from the node "up" makes sure that we are within the (right) flowmap
    if (typeof node[key] === 'string' && node[key].trim() === this.tier1) {
      const topLevelGraphics = this._walk(node, 3)
      if (topLevelGraphics.className.baseVal === 'topLevelGraphics') {
        let tier1id = ''
        let tier2id = ''
        const nodes = topLevelGraphics.querySelectorAll('g.adsFlowMapNode')
        nodes.forEach((node) => {
          const id = node.id
          const text = node.querySelector('title').innerHTML
          if (text === this.tier1) {
            tier1id = id
          }
          if (text === this.tier2) {
            tier2id = id
          }
        })

        let flowmapid = ''
        // Check if this is Appd4.3+ and we have a "flowmapid"
        if (tier1id.split('_').length === 3) {
          flowmapid = '_' + tier1id.split('_').pop()
          tier1id = tier1id.substring(0, tier1id.lastIndexOf('_'))
          tier2id = tier2id.substring(0, tier2id.lastIndexOf('_'))
        }

        const g = document.getElementById(tier1id + '_' + tier2id + flowmapid)
        if (g && g.parentElement) {
          const r = []
          g.parentElement.childNodes.forEach(
            (node, index) => {
              this.value.split(',').forEach(replacement => {
                const originalReplacement = replacement
                replacement = replacement.charAt(0).toUpperCase() + replacement.slice(1).toLowerCase()
                if (['Normal', 'Critical', 'Warning', 'UnknownFlowMap'].includes(replacement)) {
                  const searchPattern = this.force ? /ads((Normal|Critical|Warning)Node|UnknownFlowMap)Color/ : /ads(Normal|Critical|Warning)NodeColor/
                  const newValue = node.className.baseVal.replace(
                    searchPattern, 'ads' + replacement + 'NodeColor')
                  if (newValue !== node.className.baseVal) {
                    const original = node.className.baseVal
                    node.className.baseVal = newValue
                    r.push(new UndoElement(node, 'className.baseVal', original, newValue))
                  }
                } else if (replacement === 'Async') {
                  // Dash the line between the nodes.
                  if (node.hasAttribute('stroke-dasharray')) {
                    const origstroke = node.attributes['stroke-dasharray'].value
                    if (origstroke !== '5,5') {
                      node.attributes['stroke-dasharray'].value = '5,5'
                      r.push(new UndoElement(node, 'attributes.stroke-dasharray.value', origstroke, '5,5'))
                    }
                  }
                  if (node.className.baseVal.includes('adsFlowMapStatsDetails') && !node.innerHTML.includes('(async)')) {
                    const innerHTML = node.innerHTML
                    node.innerHTML += ' (async)'
                    r.push(new UndoElement(node, 'innerHTML', innerHTML, node.innerHTML))
                  }
                } else if (replacement === 'Sync') {
                  // Turn the dashes into a solid line
                  if (node.hasAttribute('stroke-dasharray')) {
                    const origstroke = node.attributes['stroke-dasharray'].value
                    if (origstroke === '5,5') {
                      node.attributes['stroke-dasharray'].value = ''
                      r.push(new UndoElement(node, 'attributes.stroke-dasharray.value', origstroke, ''))
                    }
                  }
                  if (node.className.baseVal.includes('adsFlowMapStatsDetails') && node.innerHTML.includes('(async)')) {
                    Array.from(node.children).forEach(tspan => {
                      const innerHTML = tspan.innerHTML
                      tspan.innerHTML = tspan.innerHTML.replace('(async)', '')
                      r.push(new UndoElement(tspan, 'innerHTML', innerHTML, tspan.innerHTML))
                    })
                  }
                } else if (replacement === 'Hide') {
                  if (node.style.display !== 'none') {
                    const oldDisplay = node.style.display
                    node.style.display = 'none'
                    r.push(new UndoElement(node, 'style.display', oldDisplay, node.style.display))
                  }
                } else {
                  if (node.className.baseVal.includes('adsFlowMapText')) {
                    Array.from(node.children).forEach(tspan => {
                      const innerHTML = tspan.innerHTML
                      tspan.innerHTML = originalReplacement
                      r.push(new UndoElement(tspan, 'innerHTML', innerHTML, tspan.innerHTML))
                    })
                  }
                }
              })
            }
          )
          return r
        }
      }
    }
    return false
  }
}

export default ReplaceFlowmapConnection

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
import Color from 'color'
import colorString from 'color-string'
import UndoElement from '../UndoElement'

class RecolorDashboard extends Command {
  constructor(search, replace, dashboardId = '', location) {
    super()
    this.dashboardId = dashboardId
    this.search = typeof search === 'string' ? Command._getColorFromValue(search) : false
    this.replace = typeof replace === 'string' ? Command._getColorFromValue(replace) : false
    this.location = location
  }

  _checkDashboardId() {
    return typeof this.location === 'object' && this.location.toString().includes('dashboard=' + this.dashboardId)
  }

  isApplicableForGroup(group) {
    return group === 'ad-dashboard' || group === '*'
  }

  _recolorTimeseriesGraph(node) {
    const svgs = node.querySelectorAll('ad-widget-timeseries-graph svg')

    const r = []

    svgs.forEach((svg) => {
      const dots = svg.querySelectorAll('path[fill="' + this.search.hex() + '"], path[fill="' + this.search.hex().toLowerCase() + '"], path[fill="' + this.search.rgb().string() + '"]')

      const rects = svg.querySelectorAll('rect[fill="' + this.search.hex() + '"], rect[fill="' + this.search.hex().toLowerCase() + '"], rect[fill="' + this.search.rgb().string() + '"]')

      const lines = svg.querySelectorAll('path[stroke="' + this.search.hex() + '"], path[stroke="' + this.search.hex().toLowerCase() + '"], path[stroke="' + this.search.rgb().string() + '"]')

      const stops = svg.querySelectorAll('stop[stop-color="' + this.search.hex() + '"], stop[stop-color="' + this.search.hex().toLowerCase() + '"], stop[stop-color="' + this.search.rgb().string() + '"]')

      dots.forEach(path => {
        path.setAttribute('fill', this.replace.rgb().toString())
        r.push(new UndoElement(path.attributes.fill, 'value', this.search.rgb().toString(), this.replace.rgb().toString()))
      })

      rects.forEach(rect => {
        rect.setAttribute('fill', this.replace.rgb().toString())
        r.push(new UndoElement(rect.attributes.fill, 'value', this.search.rgb().toString(), this.replace.rgb().toString()))
      })

      lines.forEach(path => {
        path.setAttribute('stroke', this.replace.rgb().toString())
        r.push(new UndoElement(path.attributes.stroke, 'value', this.search.rgb().toString(), this.replace.rgb().toString()))
      })

      stops.forEach(stop => {
        stop.setAttribute('stop-color', this.replace.rgb().toString())
        r.push(new UndoElement(stop.attributes['stop-color'], 'value', this.search.rgb().toString(), this.replace.rgb().toString()))
      })
    })

    return r
  }

  _recolorLabels(node) {
    const labels = node.querySelectorAll('ad-widget-label')
    const r = []

    labels.forEach((label) => {
      const currentBackgroundColor = Color(label.parentElement.style.backgroundColor)

      if (this.search.rgb().toString() === currentBackgroundColor.rgb().toString()) {
        const original = label.parentElement.style.backgroundColor
        label.parentElement.style.backgroundColor = this.replace.rgb().toString()
        r.push(new UndoElement(label.parentElement.style, 'backgroundColor', original, label.parentElement.style.backgroundColor))
      }

      const textLabel = label.querySelector('.ad-widget-label')
      if (textLabel !== null) {
        const currentTextColor = Color(textLabel.style.color)

        if (this.search.rgb().toString() === currentTextColor.rgb().toString()) {
          const original2 = textLabel.style.color
          textLabel.style.color = this.replace.rgb().toString()
          r.push(new UndoElement(textLabel.style, 'color', original2, textLabel.style.color))
        }
      }
    })
    return r
  }

  _recolorImages(node) {
    const images = node.querySelectorAll('ad-widget-image')

    const r = []

    images.forEach((image) => {
      const img = image.querySelector('img:not([class])')
      if (!img || !img.src.includes('<svg')) {
        return
      }
      const original = img.src

      img.src = img.src.replace(new RegExp('(fill|stroke)="(%23|#)' + (this.search.hex().slice(1)) + '"', 'gi'), '$1="$2' + this.replace.hex().slice(1) + '"')
      // Rerun with short color code
      const shortHex = colorString.to.hex(this.search.array()).split('').filter((_, i) => [1, 3, 5, 7].includes(i)).join('')
      img.src = img.src.replace(new RegExp('(fill|stroke)="(%23|#)' + (shortHex) + '"', 'gi'), '$1="$2' + this.replace.hex().slice(1) + '"')

      if (original !== img.src) {
        r.push(new UndoElement(img, 'src', original, img.src))
      }
    })

    return r
  }

  _recolorAnalytics(node) {
    const analyticsWidgets = node.querySelectorAll('ad-widget-analytics')

    const r = []

    analyticsWidgets.forEach((widget) => {
      const currentBackgroundColor = Color(widget.parentElement.style.backgroundColor)
      if (this.search.rgb().toString() === currentBackgroundColor.rgb().toString()) {
        Array.from(widget.querySelectorAll('[style*="background-color"]')).concat(widget.parentElement).forEach(element => {
          const original = element.style.backgroundColor
          element.style.backgroundColor = this.replace.rgb().toString()
          r.push(new UndoElement(element.style, 'backgroundColor', original, element.style.backgroundColor))
        })
      }
    })

    return r
  }

  apply(node, key = 'value') {
    if (!this._checkDashboardId() || !this.search || !this.replace) {
      return false
    }
    const tsg = this._recolorTimeseriesGraph(node)
    const labels = this._recolorLabels(node)
    const images = this._recolorImages(node)
    const analytics = this._recolorAnalytics(node)

    return tsg.concat(labels).concat(images).concat(analytics)
  }
}

export default RecolorDashboard

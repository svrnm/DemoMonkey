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
import fastXmlParser from 'fast-xml-parser'
const ARRAY_OPEN = '<div data-type="array">'
const ARRAY_CLOSE = '</div>'
const OBJECT_OPEN = '<div data-type="object">'
const OBJECT_CLOSE = '</div>'

function obj2dom(obj) {
  if (obj === null || obj === false || obj === true || obj === undefined) {
    return obj + ''
  }

  if (Array.isArray(obj)) {
    return obj.reduce((result, current, key) => {
      result += `<div data-key="${key}">${(obj2dom(current))}</div>`
      return result
    }, ARRAY_OPEN) + ARRAY_CLOSE
  }

  if (typeof obj === 'object') {
    return Object.keys(obj).reduce((result, key) => {
      result += `<div data-key="${key}">${(obj2dom(obj[key]))}</div>`
      return result
    }, OBJECT_OPEN) + OBJECT_CLOSE
  }

  return obj + ''
}

function _parsed2obj(obj) {
  if (typeof obj === 'object' && obj.attr && obj.attr['data-type']) {
    const result = obj.attr['data-type'] === 'object' ? {} : []
    if (!Object.prototype.hasOwnProperty.call(obj, 'div')) {
      return result
    }
    if (!Array.isArray(obj.div)) {
      obj.div = [obj.div]
    }
    obj.div.forEach(element => {
      if (Object.prototype.hasOwnProperty.call(element, '#text')) {
        result[element.attr['data-key']] = _parsed2obj(element['#text'])
      } else {
        result[element.attr['data-key']] = _parsed2obj(element.div)
      }
    })
    return result
  }
  if (obj === 'undefined') {
    return undefined
  }
  return obj
}

function dom2obj(str) {
  if (str === 'undefined') {
    return undefined
  }
  if (str === 'true' || str === 'false' || str === 'null') {
    return JSON.parse(str)
  }
  if (!isNaN(str) && !isNaN(parseFloat(str))) {
    return parseFloat(str)
  }
  if (str.startsWith('<div')) {
    const options = {
      attributeNamePrefix: '',
      attrNodeName: 'attr',
      textNodeName: '#text',
      ignoreAttributes: false
    }
    return _parsed2obj(fastXmlParser.parse(str, options).div)
  }
  return str
}

export { obj2dom, dom2obj }

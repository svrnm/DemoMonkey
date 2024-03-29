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
import merge from 'deepmerge'

function arrayMerge(dst, src, opt) {
  const i = dst.findIndex(
    (e) => e.name === src[0].name && e.nodeType === src[0].nodeType && e.nodeType === 'directory'
  )
  if (i !== -1) {
    dst[i] = merge(dst[i], src[0], { arrayMerge })
  } else {
    dst = dst.concat(src)
  }
  return dst.sort((a, b) => {
    return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
  })
}

export default arrayMerge

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
function extractParameters(params) {
  const parameters = []
  // parameters = command.slice(command.indexOf('(') + 1, -1).split(/\s*,\s*/).filter(elem => elem !== '')
  let index = 0
  parameters.push('')
  let open = ''
  params.split('').forEach(letter => {
    if (open !== '\'' && letter === '"') {
      open = open === '"' ? '' : letter
    }
    if (open !== '"' && letter === '\'') {
      open = open === '\'' ? '' : letter
    }
    if (open === '' && letter === ',') {
      index++
      parameters.push('')
      return
    }
    parameters[index] += letter
  })
  return parameters.map(e => e.trim().replace(/"(.*)"|'(.*)'/, '$1$2')) // .filter(e => e !== '')
}

export default extractParameters

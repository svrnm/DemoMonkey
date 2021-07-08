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
import Configuration from './Configuration'

class Repository {
  constructor(configurations) {
    this.configurations = configurations
  }

  addConfiguration(name, configuration) {
    this.configurations[name] = configuration
  }

  findByName(name) {
    if (typeof this.configurations[name] === 'object') {
      return this.configurations[name]
    }
    return new Configuration('', null, false, {})
  }

  getNames() {
    return Object.keys(this.configurations)
  }

  hasByName(name) {
    if (typeof this.configurations[name] === 'object') {
      return true
    }
    return false
  }
}

export default Repository

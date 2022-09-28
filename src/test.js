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
;(function () {
  const later = document.getElementById('later')
  const interval = document.getElementById('interval')
  // Load some page elements deferred
  setTimeout(function () {
    later.innerHTML =
      'This is just a test, if tampermonkey works as expected. Some cities: Seattle, London, New York!'
  }, 100)
  let counter = 0
  // Page elements that are updated every few milliseconds
  setInterval(function () {
    const cities = [
      ['Amsterdam', 'Berlin', 'Paris'],
      ['Peking', 'Beijing', 'Singapore'],
      ['Cairo', 'Johannesburg', 'Lagos']
    ]
    let text = 'This is another test, which is re-updated every 250ms. Some more cities: '
    for (let i = 0; i < 1000; i++) {
      text += '<div>' + cities[counter % 3] + '</div>'
    }
    interval.innerHTML = text
    counter++
    // document.getElementById('monkey-stats').innerHTML = 'Undo Length: ' + window.$DEMO_MONKEY.getUndoLength()
  }, 3000)
  fetch('https://github.com/svrnm/demomonkey')
    .then(function (response) {
      return response.text()
    })
    .then(function (response) {
      document.getElementById('ajax').innerHTML = response.split(/<\/?title>/)[1]
    })
})()

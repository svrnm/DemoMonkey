/* JavaScript for dedicated test page */
(function () {
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
  fetch('https://github.com/svrnm/demomonkey').then(function (response) {
    return response.text()
  }).then(function (response) {
    document.getElementById('ajax').innerHTML = response.split(/<\/?title>/)[1]
  })
})()

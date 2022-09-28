/* eslint-disable */
/* Dedicated Javascript for backup. This is a fallback if a version of
   DemoMonkey is broken and user want to extract their scripts.

   This also includes capabilities to directly manipulate the chrome storage.
 */
;(function () {
  window.chrome.storage.local.get(null, function (storage) {
    var list = document.getElementById('configurations')
    storage.configurations.forEach(function (configuration, index) {
      list.innerHTML +=
        '<li style="margin-bottom: 8px"><a class="config" href="#' +
        index +
        '">' +
        configuration.name +
        '</a>' +
        ' (<a class="config-json" href="#' +
        index +
        '">JSON</a>)</li>'
    })

    document.querySelectorAll('.config').forEach(function (link) {
      link.onclick = function (event) {
        event.preventDefault()
        var config = storage.configurations[link.href.split('#')[1]]
        window.chrome.downloads.download({
          url: 'data:text/octet-stream;base64,' + window.btoa(config.content),
          filename: config.name + '.mnky' // Optional
        })
      }
    })

    document.querySelectorAll('.config-json').forEach(function (link) {
      link.onclick = function (event) {
        event.preventDefault()
        var config = storage.configurations[link.href.split('#')[1]]
        console.log(tojson(config.content))
        window.chrome.downloads.download({
          url: 'data:text/octet-stream;base64,' + window.btoa(tojson(config.content)),
          filename: config.name + '.json' // Optional
        })
      }
    })

    var loaded = false
    document.getElementById('load-storage').onclick = function () {
      document.getElementById('storage-box').value = JSON.stringify(storage, null, 1)
      document.getElementById('save-storage').style.display = 'inline-block'
      loaded = true
    }

    document.getElementById('save-storage').onclick = function () {
      if (loaded) {
        var newStorage = null
        try {
          newStorage = JSON.parse(document.getElementById('storage-box').value)
        } catch (e) {
          alert('Could not parse JSON. Please validate your input.')
        }
        if (newStorage !== null) {
          loaded = false
          window.chrome.storage.local.set(newStorage, function () {
            window.location.reload()
          })
        }
      }
    }
  })

  function tojson(ini) {
    var json = decode(ini)
    var result = {}
    for (var key in json) {
      console.log(key)
      if (key !== '' && key.match(/^[+@]/) === null) {
        result[key] = json[key]
      }
    }
    return JSON.stringify(result, null, 1)
  }

  /* COPY AND PASTE FROM ini.js */
  function dotSplit(str) {
    return str
      .replace(/\1/g, '\u0002LITERAL\\1LITERAL\u0002')
      .replace(/\\\./g, '\u0001')
      .split(/\./)
      .map(function (part) {
        return part.replace(/\1/g, '\\.').replace(/\2LITERAL\\1LITERAL\2/g, '\u0001')
      })
  }

  function decode(str) {
    var out = {},
      p = out,
      section = null,
      state = 'START',
      // section     |key = value
      re = /^\[([^\]]*)\]$|^([^=]+)(=(.*))?$/i,
      lines = str.split(/[\r\n]+/g),
      section = null

    lines.forEach(function (line, _, __) {
      if (!line || line.match(/^\s*[;#]/)) return
      var match = line.match(re)
      if (!match) return
      /*if (match[1] !== undefined) {
        section = unsafe(match[1])
        p = out[section] = out[section] || {}
        return
      }*/
      var key = unsafe(match[2]),
        value = match[3] ? unsafe(match[4] || '') : true
      switch (value) {
        case 'true':
        case 'false':
        case 'null':
          value = JSON.parse(value)
      }

      // Convert keys with '[]' suffix to an array
      if (key.length > 2 && key.slice(-2) === '[]') {
        key = key.substring(0, key.length - 2)
        if (!p[key]) {
          p[key] = []
        } else if (!Array.isArray(p[key])) {
          p[key] = [p[key]]
        }
      }

      // safeguard against resetting a previously defined
      // array by accidentally forgetting the brackets
      if (Array.isArray(p[key])) {
        p[key].push(value)
      } else {
        p[key] = value
      }
    })

    // {a:{y:1},"a.b":{x:2}} --> {a:{y:1,b:{x:2}}}
    // use a filter to return the keys that have to be deleted.
    Object.keys(out)
      .filter(function (k, _, __) {
        if (!out[k] || typeof out[k] !== 'object' || Array.isArray(out[k])) return false
        // see if the parent section is also an object.
        // if so, add it to that, and mark this one for deletion
        var parts = dotSplit(k),
          p = out,
          l = parts.pop(),
          nl = l.replace(/\\\./g, '.')
        parts.forEach(function (part, _, __) {
          if (!p[part] || typeof p[part] !== 'object') p[part] = {}
          p = p[part]
        })
        if (p === out && nl === l) return false
        p[nl] = out[k]
        return true
      })
      .forEach(function (del, _, __) {
        delete out[del]
      })

    return out
  }

  function isQuoted(val) {
    return (
      (val.charAt(0) === '"' && val.slice(-1) === '"') ||
      (val.charAt(0) === "'" && val.slice(-1) === "'")
    )
  }

  function safe(val) {
    return typeof val !== 'string' ||
      val.match(/[=\r\n]/) ||
      val.match(/^\[/) ||
      (val.length > 1 && isQuoted(val)) ||
      val !== val.trim()
      ? JSON.stringify(val)
      : val.replace(/;/g, '\\;').replace(/#/g, '\\#')
  }

  function unsafe(val, doUnesc) {
    val = (val || '').trim()
    if (isQuoted(val)) {
      // remove the single quotes before calling JSON.parse
      if (val.charAt(0) === "'") {
        val = val.substr(1, val.length - 2)
      }
      try {
        val = JSON.parse(val)
      } catch (_) {}
    } else {
      // walk the val to find the first not-escaped ; character
      var esc = false
      var unesc = ''
      for (var i = 0, l = val.length; i < l; i++) {
        var c = val.charAt(i)
        if (esc) {
          if ('\\;#'.indexOf(c) !== -1) unesc += c
          else unesc += '\\' + c
          esc = false
        } else if (';#'.indexOf(c) !== -1) {
          break
        } else if (c === '\\') {
          esc = true
        } else {
          unesc += c
        }
      }
      if (esc) unesc += '\\'
      return unesc
    }
    return val
  }
})()

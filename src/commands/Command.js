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
import UndoElement from './UndoElement'
import Color from 'color'
import match from '../helpers/match.js'

class Command {
  constructor() {
    this.errorCounter = 0
  }

  apply() {
    return false
  }

  updateErrorCounter() {
    this.errorCounter++
  }

  isFaulty() {
    return this.errorCounter > 100
  }

  isApplicableForGroup(group) {
    return group === 'text' || group === 'input' || group === '*'
  }

  _walk(node, count) {
    if (count === 0) {
      return node
    }

    if (node.parentElement !== null && typeof node.parentElement !== 'undefined') {
      return this._walk(node.parentElement, count - 1)
    }

    return false
  }

  isAvailable(featureFlags) {
    return true
  }

  validate() {
    return []
  }

  getRequiredFlags() {
    return ''
  }

  static _getColorFromValue(value) {
    // There are some "magic" colors for appdynamics dashboards
    const magicColors = {
      'ad-purple': Color('#7e69d2'),
      'ad-cyan': Color('#01CEDA'),
      'ad-blue': Color('#0084E5'),
      'ad-green': Color('#33C561'),
      'ad-turquoise': Color('#00ced9'),
      'ad-lightgray': Color('#eaeaea'),
      'ad-lightgrey': Color('#eaeaea'),
      'ad-darkgray': Color('#404040'),
      'ad-darkgrey': Color('#404040'),
      'ad-pink': Color('#e38ead'),
      'ad-red': Color('#ff3333')
    }
    if (Object.prototype.hasOwnProperty.call(magicColors, value.toLowerCase())) {
      return magicColors[value.toLowerCase()]
    }

    // We want to accept colors from hex 'xxxxxx(aa)' and 'xxx(a)'
    if (value.match(/^(?:[0-9a-f]{3,4}|(?:[0-9a-f]{6}(?:[0-9a-f]{2})?))$/i) !== null) {
      value = '#' + value
    }
    let color = false
    try {
      color = Color(value)
    } catch (e) {
      console.log(e.message)
    }
    return color
  }

  _lookupImage(search) {
    if (search.toLowerCase().startsWith('ad-')) {
      if (search.toLowerCase() === 'ad-travel-logo') {
        return '*KrWyISlFdy1qVbrMGFpGsS4/Yqzqu/nbYo0scxvvw1gPR3put2ZUlyH+vO+OriDzmLNV7RRH5+12P58JUQLKxKz04i6Zw1qxiXY/UuRFZVKy/aJg8H2kxqg3RpM37r24/6lHU1UZD7W6K1rGOTynbO/KGqnhGmmY90AEBscAhrXpXlugayu/vzvjdNZTycF9D/+hIHApRGamhg+kqll+bHOirJ4EKSBnPp1oDo3azxG2Mh0xqjHtY9UI0RaTrUsfl9mmLdcIKqlGSxfP0UEDenTXGIGo13oaIfN9fERHncc3D/R0+1/Gdwmz7o4Xz7Y/k/3nnQP7inQ/lL92x58jlOx5ILdxxX//VHbuDGnRXQ0bLha267TpY7w3XonIPopUG1J2MhzDuYduL0JS6Ws86vmbw3eX4YKWuNdDszwO5iXdmk0f6uzP9+sfeKpsZ4wtPdmdiR4vjJxV5Sd/GmF0u1K2gbdM/bxOfmwvaZv1zh/iuKWJ837E6E93fe9Rb4bP2rx33ipDh01rher6p8Fnu9g/mVjx+KNdYZuWsHznnoRQDLyzruJ1Z2x6jhnMGyYzSzRCvdHzR9aTfHyECpUghMfjeWe6+SiFi3MOZpT5fzzpu2t7xxELTuc34Meu+4QVEktCKkww31RCR3KHuzIJs/Dc3FQwxEGlJ2pulO9S8/u7hHrkcfv/LOyciheuHbvtw3ishGalgVZWzuIaV7oDABUT2FddFQET0jX58TRGQdJVts1IcSnNKhJgMlrGmGfew3w2lCnq963jWtH3a5fOH91EGT5IpTlvryio1ts/Lda9c2jfQ/RzSl6UPbu2IedAgx5UGOVvN+pHWmKswSg8Yd9iAeMWiyQuqhjnsdKTMtaj3nnGPyvW0VU7YjCqW+ny967g8h1I9tD0+aDq3xTp69RtfQAQyD9ZZbqnhhU1/uP1Ot2MkIyZrqhZ+TqKq9bCNa2tzQ03V4b5bFpAK4yFReS0jSncM4x61u3guKZa+3dQuftdxN+ODrr0P/f4UXC4jYa8DLR7vL6EvH/NoGSIiPLJ+hxVPnbhkyaKTXTOltBLCQhv1u89emR8RVRqQfeuhgMqMh0zK/FkNOe5hcdJduVxomiK2ltOYBFHHZdfmotze8vig9G6YOBi0gEyeO7D0aM+xVzX3SQ43Antc/NZp3HlWNoCOBg4tNiKl5IYDZRqQfetprKDMeMgZ5etGG/c448LzSztoZIOq41nFKBB11kpXlFdjH26TKYa+/rX4sM8Y2uHKElQnLtlNQ57VPk9j7iQj6RmHDUjWj3du2KRNOR87jGqfZ/1dvY9YnTWZkvdpJuR1XN1eZHJOVxtrMU1qtCtuZgNlw4+bePpGwsGeY2ICXjvPloHT1+46nvUq3fnSw9jqw8TCZWnBTcmGV4TAbg+BeDgWEGU8RBXEhhv3EFlday3a2vGNqAsLObA67iDNihq6y8TBoATk4eJEwRS3dJWcA8usVVs7IOnE+nE8C9dCI7JFX0Q/96DMjhsKF9uUwsS21We6jkUajYr3aUqpX6UQ6PVQx9cMvteYWEjeqzp5ICIKaxO31OCqQzFVrR+x/sRu5IZWfOXmqlXuZ2bcEBF3IyBgS0RqhUCHro6bshVUTMoovZmSJ8vEwaAEpL87E9OKcyCgmGAydutH/3YymdCPXFbDG/lml+lPZ8Kf/wxqZUKgQ17Hpyx4LbzzwyZeDaJbfRf6C1oxZfo2uQhE15c6Z6JjnXoyIhdX6rYP53MOG0LV*'
      }
      if (search.toLowerCase() === 'ad-logo') {
        return '*D388TVB+NNK4sfNrxDu/muj8YWe72plAlqshv9Bwc9Wn+bxhg0MuCfMX/eLTLfU9ber5OHs9eAa98k/MiZ3kALcNO6ldPithIGYAS9Z/7GTwDalPig59hKVNC44HfevK28j/r3uFjrVRdnsrbndNR8t3y1htu3cg3cTfSDTfXQcT9cJECuQpack075FqBdn4XgZBYBAQ6fM66GP7OIWDYyfzROQJv5rrzJdy0cBPMsH6aVf17/We5329nLn1d5ySHV42zkOQaZ751eM1NzwD9d3zbxgfEfYAp1qxCcRr0PjJmL1cLp8r/vC4BzxxMNDH6sAS2H9dVm5ldv9riso749fRoYtJPH+kqu15Vv8yJ5bhk/9stMWRnrGrib4A069bem2+wNuRJ7KwdRaiTfArQ7Ye9F4mRiB3Da3LG8HKiLyg/QJXj2Blw+361ayHfh2RJky0srjQ3kOU67h5LfK67jy839VpH7WWGxKQrkTYCJ1FSczssLgDFZ48wxdvbmLQCMMJ603MCgxI8Gv7Nh/bS0fC28NMmPel7YoYFBWzLXxWXIQ67Xy+a4MuyRmWKc18Oe6lF+t0k1MUiykN67RSBdUl+KQkq65wKYsHP6vAqA0+eQtR/uNdcC5Dtg6vnpvcYGNb5lY4w8Z/M2MRz0Tnt/uI4vEtM+8j9n1cgGjP8AU2Dt+vxxqxcGYMT5rlp4+nxHAJw73vfR5rm9Ej8OuHvr+TsqeWGHBgbtyZrLinOYV89xL81apjQejToWTaaJQaaFdIeCIGfBJwSKNgAmX2f3cv8obKYBGEHlh3uNFUAr+c5mOagrVy2HfFXLmzbG4CAjL9bJr+PeV2jO9/p6tpEP/pg3V8IAcFlJcm2Gmsl6BDB2LdwLw2THTs8pATh3LOmjvTX+Ej+bFxRXwZ8l3ePi+20vn62y5iQNDG6W28qQ226ZK9aXGo/uJhTrTIWGB6uQMJmHTY0ZybcA8v7UrDPUFDYwAow6n1zFj4NypaKPZYMP8G6+m8BiiNoYOCRfvX7TRm11mtqOk++LyL0OZpP7eLVPH7kbxRZvmYKDPBn/AS6faxP8jhnmAOaswNg28sr0eHENAGON8w191hKaF5wlUTMD33GbPmfMSxoYTCK33WIPzMuYtLrUf2ASTQwydt6z8RFyFqlhM2M68i1AU3r1xGg0AgIYN/+/PKCtqTmesQL4KOct48ehYPkOSFOnJXzbxths3ib9Opj1oPHyQfLfX1N6MP4DqE0PUxI1MzNeAWPz3H+C8xMhAODMeVgrY0kJzQtGNfFmBr7ndvXZcpMGBpPKa9fcu7e+xph08yYGwwPfPuH14AEI5GTjSz6fhQCgfkk2gqyHiWGJBBvCbV4EGN9wKKiWt/16+xHwu3xXhkXeGvKdQ5HQUK025K5a6rVjWbskIvc6mLeKn1/zpG9gYDMfGP8BJiLDXqWXteuV8QpoUO+5/3Q0dOgUgMuOJX0DH1Xzggt6tVZcJvR9+67bzGnZ5ioaGEwzp5W4bCODMuSpq1yvdze+KftI/IDSJgqQxLkKB2sA2jD5ecGbSdpaTAHanVcOD22L8RdoIOfJd0Dmeq21Zga9DcMkehOrMXtkw1pan/gjlCQH8MD4D6Cumkrt9Hq+u04QV7UeMDbNEKeT330PANQ+BzvXer/bzhxov46JrBNrYECqHCUEk81nJS5zBnZ97aY6dzeOZfZNCDZRQN4kri*'
      }
      if (search.toLowerCase() === 'ad-devops-bg-1') {
        return '*LXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUuNSAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3RDNCNzk3RThENzMxMUU2QTUyNkZFNzFCNUI2NDMzMSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3RDNCNzk3RjhENzMxMUU2QTUyNkZFNzFCNUI2NDMzMSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjdEM0I3OTdDOEQ3MzExRTZBNTI2RkU3MUI1QjY0MzMxIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjdEM0I3OTdEOEQ3MzExRTZBNTI2RkU3MUI1QjY0MzMxIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+eWrFrAAAAWZJREFUeNrs0gEJADAIAMG5qLawobFsIQh3EZ6Pyn5wx5cAy4JlwbJYFiwLlsWyYFmwLJYFy4JlsSxYFiyLZcGyYFksC5YFy2JZsCxYFsuCZcGyWBYsC5YFy2JZsCxYFsuCZcGyWBYsC5bFsmBZsCyWBcuCZbEsWBYsi2XBsmBZLAuWBctiWbAsWBYsi2XBsmBZLAuWBctiWbAsWBbLgmXBslgWLAuWxbJgWbAslgXLgmWxLFgWLItlwbJgWbAslgXLgmWxLFgWLItlwbJgW*'
      }
      if (search.toLowerCase() === 'ad-devops-bg-2') {
        return '*VFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTMyIDc5LjE1OTI4NCwgMjAxNi8wNC8xOS0xMzoxMzo0MCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUuNSAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3RDNCNzk3QThENzMxMUU2QTUyNkZFNzFCNUI2NDMzMSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3RDNCNzk3QjhENzMxMUU2QTUyNkZFNzFCNUI2NDMzMSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjdEM0I3OTc4OEQ3MzExRTZBNTI2RkU3MUI1QjY0MzMxIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjdEM0I3OTc5OEQ3MzExRTZBNTI2RkU3MUI1QjY0MzMxIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+92QqTQAAAWZJREF*'
      }
      if (search.toLowerCase() === 'ad-devops-bg-3') {
        return '*UCBDb3JlIDUuNi1jMTMyIDc5LjE1OTI4NCwgMjAxNi8wNC8xOS0xMzoxMzo0MCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUuNSAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo2RUJDQzdGRDhENzMxMUU2QTUyNkZFNzFCNUI2NDMzMSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo2RUJDQzdGRThENzMxMUU2QTUyNkZFNzFCNUI2NDMzMSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjZFQkNDN0ZCOEQ3MzExRTZBNTI2RkU3MUI1QjY0MzMxIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjZFQkNDN0ZDOEQ3MzExRTZBNTI2RkU3MUI1QjY0MzMxIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+y0FkcwAAAWZJREFUeNrs0gEJADAIAMG5Yta2j0VsIQh3EZ6Prnxwx5cAy4JlwbJYFiwLlsWyYFmwLJYFy4JlsSxYFiyLZcGyYFksC5YFy2JZsCxYFsuCZcGyWBYsC5YFy2JZsCxYFsuCZcGyWBYsC5bFsmBZsCyWBcuCZbEsWBYsi2XBsmBZLAuWBctiWbAsWBYsi2*'
      }
      if (search.toLowerCase() === 'ad-devops-bg-4') {
        return '*Y2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTMyIDc5LjE1OTI4NCwgMjAxNi8wNC8xOS0xMzoxMzo0MCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUuNSAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDo3RDNCNzk3NjhENzMxMUU2QTUyNkZFNzFCNUI2NDMzMSIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDo3RDNCNzk3NzhENzMxMUU2QTUyNkZFNzFCNUI2NDMzMSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjZFQkNDN0ZGOEQ3MzExRTZBNTI2RkU3MUI1QjY0MzMxIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjZFQkNDODAwOEQ3MzExRTZBNTI2RkU3MUI1QjY0MzMxIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+Ysqw2AAAAWZJREFUeNrs0gEJADAIAMG5hjYzmZlsIQh3EZ6P6nxwx5cAy4JlwbJYFiwLlsWyYFmwLJYFy4JlsSxYFiyLZcGyYFksC5YFy2JZsCxYFsuCZcGyWBYsC5YFy2JZsCx*'
      }
      if (search.toLowerCase() === 'ad-devops-bg-5') {
        return '*HD9AMEggKGGSxFJAKG6QcIBAUMM1iKSAQM0w8QCAoYZrAUkQgYph8gEBQwzGApIhEwTD9AIChgmMFSRCJgmH6AQFDAMIOliETAMP0AgaCAYQZLEYmAYfoBAkEBwwyWIhIBw/QDBIIChhksRSQChukHCAQFDDNYikgEDNMPEAgKGGawFJEIGKYfIBAUMMxgKSIRMEw/QCAoYJjBUkQiYJh+gEBQwDCDpYhEwDD9AIGggGEGSxGJgGH6AQJBAcMMliISAcP0AwSCAoYZLEUkAobpBwgEBQwzWIpIBAzTDxAIChhmsBSRCBimHyAQFDDMYCkiETBMP0AgKGCYwVJEImCYfoBAUMAwg6WIRMAw/QCBoIBhBksRiYBh+gECQQHDDJYiEgHD9AMEggKGGSxFJAKG6QcIBAUMM1iKSAQM0w8QCAoYZrAUkQgYph8gEBQwzGApIhEwTD9AIChgmMFSRCJgmH6AQFDAMIOliETAMP0AgaCAYQZLEYmAYfoBAkEBwwyWIhIBw/QDBIIChhksRSQChukHCAQFDDNYikgEDNMPEAgKGGawFJEIGKYfIBAUMMxgKSIRMEw/QCAoYJjBUkQiYJh+gEBQwDCDpYhEwDD9AIGggGEGSxGJgGH6AQJBAcMMliISAcP0AwSCAoYZLEUkAobpBwgEBQwzWIpIBAzTDxAIChhmsBSRCBimHyAQFDDMYCkiETBMP0AgKGCYwVJEImCYfoBAUMAwg6WIRMAw/QCBoIBhBksRiYBh+gECQQHDDJYiEgHD9AMEggKGGSxFJAKG6QcIBAUMM1iKSAQM0w8QCAoYZrAUkQgYph8gEBQwzGApIhEwTD9AIChgmMFSRCJgmH6AQFDAMIOliETAMP0AgaCAYQZLEYmAYfoBAkEBwwyWIhIBw/QDBIIChhksRSQChukHCAQFDDNYikgEDNMPEAgKGGawFJEIG*'
      }
    }
    return search
  }

  _match(original, search, replace) {
    return match(original, search, replace)
  }

  _hideNode(node) {
    const original = node.style.display
    node.style.display = 'none'
    if (original !== node.style.display) {
      return new UndoElement(node, 'style.display', original, 'none')
    }
    return false
  }

  setSource(key, value) {
    this.sourceString = `${key} = ${value}`
  }

  toString() {
    // We need to apply "protection" so demo monkey does not run over this itself ;-)
    return this.sourceString ? this.sourceString.split('').join(String.fromCharCode(0x200B)) : ''
  }
}

export default Command

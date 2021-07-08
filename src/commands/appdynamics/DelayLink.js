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

class DelayLink extends Command {
  constructor(search, delay, window) {
    super()
    this.search = search
    this.delay = parseInt(delay)
    this.window = window
  }

  isApplicableForGroup(group) {
    return group === 'link' || group === '*'
  }

  apply(target, key = 'value') {
    const document = this.window.document

    if (this._match(target[key], this.search)) {
      const delayFunction = (event) => {
        event.preventDefault()
        const icons = [
          'data:image/gif;base64,R0lGODlhEgASAPUAAFpuhGNvgXF6iHuJnFyJu2SErHuMo2uMtH2cvGaOwmaSxHucw3SczXKe0nOi1Xyj1Hqm242WoYqcs5WqvIOgxIujxIqmy5usw4yr04Or26O93Kq925294p/C7aHH9rvW+8TS4czX49Pf+NTi9Nrm9N3p9tPl+93s/d31/+fr7+3u7+Xs9OPu/Onv+e/09uT1/+31/OX4//T09Pn09fL1+vn1+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAQHAAAAIf4gQ3JvcHBlZCB3aXRoIGV6Z2lmLmNvbSBHSUYgbWFrZXIAIf8LTkVUU0NBUEUyLjADAQAAACwAAAAAEgASAAAGkUCZUEhz0Wiw5KtWdLlUQ9mxFQkMLqKj0xWVOUmBwyKh0KBgyG4RFuJgHhCKpZWOzma12gsGmjwaG3tdd3kwLzElDwwVJjBdakUfCAwejo9ELikuKBQMGZaXRzQyLxcKDqCPoqQXBKihoqMvBgUYqUOxRycABx23RLkrAhIjo6q5MCssaLC5SL/HR0mX1NXWQ0EAOw==',
          'data:image/gif;base64,R0lGODlhEgASAPUAAFNsimNvgWRzjHuJnFuGum6Go3uMo3SNq3WRrWOLu3WStHqWulqKxGOTzHucw3SczXGe2HSgz32q3JKdroObtYqcs4KdupWlu4qmy5usw4Or25O03KS1y6q906O93LrF1rLF2pzI9aHH9tTf7dHf9MXg/czk/dPp/931/+3u7+Xs9OPu/P7v8+/09uT1/+31/PT09Pn09fL1+vn1+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAQHAAAALAAAAAASABIAAAaQQJhQRiwSX8iXsJUaGp/IFkwqrFaRF8EGVbR6VS+DwYFJeqszIunyeHhQyrPztdI8LKa43FpSPEJ6ZzExQigLERKBVTKLLy4ZDRBUXoyERI8MknJEQy8oBwQak1acMDIvJgAJInpGTi4uBQAVJ6RdUy0rAwAIHS62pC0fARQcSCx7pi0jEyBwL8jJ0sktozBBADs=',
          'data:image/gif;base64,R0lGODlhEgASAPUAAD1soVNsiltxikttlEJtnUtzo0p1qlJ8rHuMo3SNq2OJtWGHumOLu2ySvXWStFWJw2uUxGOTzHOaxXSczW2f2XKe0nKh2n2q3IObtYKdup6ptpWlu5SsxJusw52xxIOr25u006zD3LTE1bLF2pzF+avF46HH9tTf7czk/drm9NPl+9Pp/93s/d31//Pz7+vv9O/09uT1/+31/PT09PL1+vn1+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAQHAAAALAAAAAASABIAAAZ5wJlwSBTSYMVk8qhszmIxGs1ZHHleU+qQcADFtEOIJKMCC1GOCklmbqUvbCpNFutELHGlayajcx4UeU1zLQkLH4JKfSgBECaJRH0xLAoFGStONX0qCAMNIS2DNCgYAAYOIDCQQqobAgwTJS19VCcaIikwSFqSMbpDQQA7',
          'data:image/gif;base64,R0lGODlhEgASAPUAAD1soVNsikJtnWRzjGh7lEtzo0p1qnuJnHWRrWKGtGOJtWuMtGGHumySvXWStFWJw2aSxGuUxGOTzG2d1HKe0oSVq4WarIKduoyju5Wlu5WqvKKuvISlzJ2xxJuyzIOr25O03J2727zK2avF46HH9szX48zd8tHf9Mzk/drm9N3p9t31//Pz7+/09uT1/+31/PT09Pn09fL1+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAQHAAAALAAAAAASABIAAAZ0QJhwSCzCZMakcslstprF18v1ggpfpY3KCnMRDCCuqxL5iDWSyRPq0jzUTeQKwfhUlzEhKhAh3YcsLEdSLi4KBRcoSYIwUicHAg0jK0ZIJhkcCwAGDiFSSTIEAwkLEBSTn0UtLR0WGB4iKatKLTKFty+zQkEAOw==',
          'data:image/gif;base64,R0lGODlhEgASAPUAAD1soVNsikJtnVJwlFN0nEtzo1l8o3OGnFWBtFqEtHSKo2OJtWOLu3OTu3qWumaSxGuUxHKWw3SczXqfzHOi1YObtYKduoShupyrvJSsxJuyzIOr252727XBzrTE1bzK2ZzE9KvF463L7s3b7cPY8M7p/9rm9N3s/d31/+Ll7Ofr7+Xs9Ovv9O/09uT1/+31/PT09PL1+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAQHAAAALAAAAAASABIAAAZxQJhwSCwaj8ikcslsOp+wWFT6TLGcLw/g0Wq6MAhKl4lSMDbUJSkAAaWjr1cs3nq5EgVLidhlreYvLSMHAhAhKEQxLAYDCxMTCwAFDRxxRC8qBA4SEQsMEBIiKJZFJh0ZFRcaHyctY0YuLyizKLGuQ0EAOw==',
          'data:image/gif;base64,R0lGODlhEgASAPUBAD1soVRrhEJtnVN0nGh7lERypEp1qmmGq3uMo2OLu2ySvXWStGaSxGuUxGqVynSczXKe0nyj1IybrYObtYKduoShuoyju5usw5WyzYKm05u006S71qzD3LrF1qvF47vN4rXO79Tf7dHf9M7h9drm9N3p9tPl+931/9z4/+vv9O/09uT1/+31/PT09PL1+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAQHAAAALAAAAAASABIAAAZwwJZwSCwaj8ikcslsOp8tl9TlpKqeLpbWqV2xmNTVZQAiSpGjwMEjlH42Xq18lShQTFdXKkCQhOQsIggCChwreSoTEw4NDBEZCQAGCxpbbScbEBAPDQkJDQ8eJ5ZEJB0YFhUYHSUqV0daKCezXq5DQQA7',
          'data:image/gif;base64,R0lGODlhEgASAPUAAD1soVpuhF11lEp1qnuJnG6Go3SNq3WRrXuSrGOLu36atX2cvGaOwmuUxGOTzHSczW2d1G2f2XKe0nOi1YObtYShuoyju5Wlu6qwuompzJSsxIOr252724Sx5rTE1bLF2qvF493f4c7h9czk/c7p/9Ti9Nnn+tXz/931/+Ll7O/09uT1/+31/OX4//T09PL1+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAQHAAAALAAAAAASABIAAAZuQJdwSCwaj8ikcslsOp/Q5Iv1ejlDmJS1iRBYUFWmxkAhhZejAqSDWrGo05XcpRK2NJDIRfSulggBHipbLCoZCxEODBMbDQADByAuhCwnHHkSDQkJDQ8gKJNGJR4aFQoaHyYqdUWrciiwbSurQ0EAOw==',
          'data:image/gif;base64,R0lGODlhEgASAPUAAFN0nFl8o3ODlVyCrGSDpmSErHCHpWOJtXWStH6atX2cvGaSxGuUxGOTzHucw3SczW2d1G2f2X2q3IShuoyju46sxISlzJSsxJquyoKm04Sq1JWy052726u1xLK/04Sx5p294rTE1bLF2rXO793f4czd8szk/dnn+t3s/dXz/931/+/09uT1/+31/PT09PL1+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAQHAAAALAAAAAASABIAAAZtQJdwSCwaj8ikcslsOomtaMvZEZCmzUAhhGUCFJ6usjV4bFSv17KlYShMaabJAPmoWNHVK2pkYSAQFCV8aWpFLysWDhANCxIZBwQjRisrKSAREQ8MBwcIHEonIhcTCRUiKJWUKywsKq93LapCQQA7',
          'data:image/gif;base64,R0lGODlhEgASAPUAAFN0nG91gnF6iERypFl8o1qEtG6Go2SErHSKo2ySvWuUxGOTzHOaxXucw3SczXqfzG2d1G2f2YObtYKdupWlu5yrvI6sxISlzImpzJStypWyzZuyzIKm04Ou45294q7D1azD3LLF2s3b7cPY8Nvj7c7h9cXg/c7p/93p9t3s/dXz/931/+Xs9Onv+eT1/+31/PT09PL1+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAQHAAAALAAAAAASABIAAAZqQJhwSCwaj8ikcnl8tV4vppAUELCkLwxAksISDhsXdqAAiZmvAcOMLTg0q1hs+eIoJic502SAdFwuUEorGRAQFCKCSS8sFw0RCwkPIS56RVAqHoYOCggjlkZQJR8WEhUooJcvgCsrgKkwQQA7',
          'data:image/gif;base64,R0lGODlhEgASAPUAAFRrhEltm1N0nGNvgURypFl8o1qEtGWIrnSKo2uMtHOTu32cvGaSxGuUxG2bzXOaxXucw3SczW2d1HKe0pKdroKduoyju5Wlu5yrvISlzJStypuyzIOr25Wy05O03IOu45294rTE1bLF2s3T28zX483b7d3f4cnf+s7h9czk/dTi9NXz/931/9z4/+vv9Onv+e/09uT1/+31/PT09PL1+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAQHAAAALAAAAAASABIAAAZ5wJmQRhQaj8gZLckUymiy6LJppLkoA5NMSZ3FLgHF6DltogAJj6vchGUEi9SSnYQVDp1WsSsjNEQxXUZ9D4CCTgYRHSx7VDIcDRVydEwnCBIfMTFQXTEaEhIYJY1MNC8ZEBMMG4FURCsgDhMWm4JRKiEkW7ZRMVFUQQA7',
          'data:image/gif;base64,R0lGODlhEgASAPUAAFRrhExynUJtokluokRypEp1qlyCrFqEtG6Go3SNq3uSrGOJtWOLu32cvGuUxHSczXKe0o2WoZyrvImpzJSsxJStypWyzYOr25Wy05u006S1y6q904uz5KzD3LvN4tTf7c7h9czk/c7p/9rm9NPp/93s/d31/9z4/+/09uT1/+31/OX4//T09PL1+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAQHAAAALAAAAAASABIAAAZ4QFZLyFIZVaykcklsjSSRz5CpVLVMmsIA0bFSk0YF4PDIlIxfVooicFBC6DQLBGBwSKn4tzUJNOBIckIGCxYnemktBA4dKYJKig+Nj0pkGCaUSRcODSKZLCEJEBxTjykVDxAomSooGx4tpXKxKykosoIouquZuplBADs=',
          'data:image/gif;base64,R0lGODlhEgASAPUAAFRrhFNsikxynWRzjGh7lEJtokRypEp1qlyCrFqEtFuGumySvX2cvGaOwm2bzXOaxXSczYGWs4KdupGitZyrvJSsxJusw52xxJWyzZuyzISq1Ju006SyxKS1y4Ou467D1azD3JzE9LHG4szX48zk/dTi9NPl+9Pp/93s/d31/9z4/+/09uT1/+31/OX4//T09PL1+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAQHAAAALAAAAAASABIAAAZ2wJcQBmuxjkehcvlqwUoUAmDQYSpbrVTGcFA4JBursLWKBBQQT0h0esGsrkqhYTFhVyvxiwRQeFAsd3owGgIMJFh6SjAICRgqTopjBg4gLJJXBhAfLphCKwgPF52eKxoLEymebigcI5eeMEgtq262b7VDubu8QQA7',
          'data:image/gif;base64,R0lGODlhEgASAPUBAD1soVRrhFNsikxynUJtoktzo0p1qll8o3OGnFqEtFuGunSKo2OJtXqUtHOTu3aZvn2cvGaOwmaSxG2bzXucw3SczW2d1H2q3KKuvJusw5StyoKm05Wy04Ou44Sx5rTE1ZXC9ZzE9LvN4szX49Tf7dvj7cXg/czk/d3p9tPl+93s/d31/+/09uT1/+31/PT09PL1+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAQHAAAALAAAAAASABIAAAZuwJcQBnO5WsiWUchkFkkYRCCwwJSaQhdspSEYFJKJxeHAvowNgaLiCYEulI25lQFEMikji7XEngIKHSpKLkMwWDAbBRAmWmaICQwcK0WPTTADDx8tlogHDyKcnU0oI32jWUaFqKytrk6vQ7Gzr0EAOw==',
          'data:image/gif;base64,R0lGODlhEgASAPUAAFRrhFNsiltxikttlEJtnURypHOGnFqEtFuGumWIrnSKo2OLu36atVqKxGuUxGOTzHSczW2d1HKe0nGe2HKh2oKdupyrvIujxJSsxJusw5Styp2xxJKv04ux3Zu004Ou44Sx5qzD3JzE9JzF+a3L7rXO79Tf7czk/dTi9Nrm9NPl+9Pp/93s/d31/+/09uT1/+31/OX4//T09PL1+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAQHAAAALAAAAAASABIAAAZuQJlwNnvBYq8kDDYTOoezlEUhABgsJuKT+NIUCghHRPJoeFqupoxZCRwgH9EINKFUMDL1K0NYZFRLSygbFRdpQioCBx0sRoFJJSdLQhwDDCtaTlpqQiQJIS+ZUDMuT6anqKmqq6ytrq+wsbKzs0EAOw==',
          'data:image/gif;base64,R0lGODlhEgASAPUAAFRrhFNsiltxikJtnUJtokRypFuGum6Go3CHpWOJtWuMtH2cvFWJw2OTzGqVynSczW2d1G2f2XKe0nqm24SVq4ybrYObtYqcs5yrvKKuvISlzJusw5Styp2xxJWy05O03LO8yqq904Sx5ouz5JXC9ZzE9MTS4czX49Tf7dHf9NTi9Nrm9NPl+9nn+t31/+/09uT1/+31/PT09Pn09fL1+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAQHAAAALAAAAAASABIAAAZyQJmMRozFYEjYkTibCYW02CqDEAAOGBXxCYVxCAWDAwJpMDyuGE34elkChseoRBJBIguNURgDDRQbLEZGLB0SECExfCYJHy5KgzAuExAXLXyDTy9QNCoUFSiYUVycMCknMKSqq6ytrq+wsbKztLW2tzJBADs=',
          'data:image/gif;base64,R0lGODlhEgASAPUAAFRrhFtxikttlHSJnluGumOLu3qUtHOTu32cvFqKxGuUxGOTzG2bzXucw3SczW2d1G2f2XKe0nyj1HKh2pWlu5yrvKKuvIOgxJquyoyr04Or25Kv052724Sx5pXC9ZzE9KTC5bvN4tvj7czk/drm9NPl+931/9z4/+Xs9Ovv9O/09uT1/+31/PT09PL1+gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAQHAAAALAAAAAASABIAAAZuwJZQyGKtjsihcoiyDACBQYWkWiovAoKCwVgkNiaWywo6aD6eTiTSyKTGy6KcVcI8IJwTfOjqu4orJhMPCCN7VkQsIwYOHyyISmImBhEaj5CRFAoSl5hEFQWcnkMsIhQhh5h/R6mjrq+wsbKzS0EAOw=='
        ]
        let counter = 0

        // <div style="position: fixed; bottom:0; left:0; background: #f2f2f2; border: 1px solid #b3b3b3; font-size: 10px; padding: 1px; border-radius: 2px">Waiting for ...</div>
        const loading = document.createElement('div')
        loading.setAttribute('style', 'position: fixed; bottom:0; left:0; width: 480px; background: #f2f2f2; border: 1px solid #b3b3b3; font-size: 10px; padding: 1px; border-radius: 2px')
        loading.innerHTML = 'Waiting for ' + target[key] + '...'
        document.getElementsByTagName('body')[0].append(loading)

        document.querySelectorAll('link[rel="icon"]').forEach((e) => e.remove())
        const favicon = document.createElement('link')
        // '<link rel="icon" href="' + icons[counter] + '">'
        favicon.setAttribute('rel', 'icon')
        document.getElementsByTagName('head')[0].appendChild(favicon)
        const updateFavicon = function () {
          favicon.href = icons[(++counter) % (icons.length)]
          setTimeout(updateFavicon, 75)
        }
        updateFavicon()
        setTimeout(() => {
          window.location.href = target[key]
        }, this.delay * 1000)
        return false
      }
      const original = target.onclick
      target.onclick = delayFunction
      return new UndoElement(target, 'onClick', original, delayFunction)
    }
    return false
  }
}

export default DelayLink

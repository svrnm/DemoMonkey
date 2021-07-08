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
import Group from '../../src/commands/Group'
import Hide from '../../src/commands/Hide'

const assert = require('assert')

const window = {
  location: {
    href: '',
    hash: '#/location=APPS_ALL_DASHBOARD&timeRange=last_15_minutes.BEFORE_NOW.-1.-1.15'
  }
}

const appNode = {
  style: {
    display: 'block'
  },
  className: 'ads-application-card'
}

const appNode2 = {
  style: {
    display: 'block'
  },
  className: 'x-grid-row'
}

const node = {
  data: ' UserOffers ',
  parentElement: {
    data: 'inner',
    parentElement: {
      parentElement: {
        style: {
          display: 'block'
        },
        className: 'ng-scope',
        parentElement: appNode
      }
    }
  }
}

const node2 = {
  data: ' UserOffers ',
  parentElement: {
    data: 'inner',
    parentElement: {
      parentElement: appNode2
    }
  }
}

/*
 This test is a conversion from the old HideApplication command test. For the time being this is an easy way to
 check if group is working
 */
class HideApplication {
  constructor(appName, location) {
    this.group = new Group([
      new Hide(appName, 4, 'ads-application-card', '', 'APPS_ALL_DASHBOARD', location),
      new Hide(appName, 3, 'x-grid-row', '', 'APPS_ALL_DASHBOARD', location),
      new Hide(appName, 2, 'ads-home-list-item', '', 'AD_HOME_OVERVIEW', location, function (_, parentNode) {
        return parentNode.getAttribute('ng-click').includes('ViewApplicationDashboard')
      })
    ])
  }

  apply(node, key) {
    return this.group.apply(node, key)
  }
}

describe('Group', function () {
  beforeEach(function () {
    appNode.style.display = 'block'
    appNode.className = 'ads-application-card'
    appNode2.style.display = 'block'
  })

  describe('#apply', function () {
    it('hides an application in grid view', function () {
      new HideApplication('UserOffers', window.location).apply(node, 'data')
      assert.equal(appNode.style.display, 'none')
    })
  })

  describe('#apply', function () {
    it('hides an application in list view', function () {
      new HideApplication('UserOffers', window.location).apply(node2, 'data')
      assert.equal(appNode2.style.display, 'none')
    })
  })

  describe('#apply', function () {
    it('does not break on other nodes', function () {
      new HideApplication('UserOffers', window.location.hash).apply(node.parentElement, 'data')
      assert.equal(appNode.style.display, 'block')
    })
  })

  describe('#apply', function () {
    it('hides only applications', function () {
      appNode.className = 'not-an-application-card'
      new HideApplication('UserOffers', window.location.hash).apply(node, 'data')
      assert.equal(appNode.style.display, 'block')
    })
  })

  describe('#apply', function () {
    it('hides only on applications overview page', function () {
      new HideApplication('UserOffers', 'another-context').apply(node2, 'data')
      assert.equal(appNode2.style.display, 'block')
    })
  })
})

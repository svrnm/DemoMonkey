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
import { expect } from 'chai'
import { formatRelativeTime, formatISO } from '../../src/helpers/timeFormat'

describe('timeFormat', function () {
  describe('#formatISO', function () {
    it('should format a Date object to ISO string', function () {
      const date = new Date('2025-12-21T12:00:00.000Z')
      expect(formatISO(date)).to.equal('2025-12-21T12:00:00.000Z')
    })

    it('should format a timestamp number to ISO string', function () {
      const timestamp = new Date('2025-12-21T12:00:00.000Z').getTime()
      expect(formatISO(timestamp)).to.equal('2025-12-21T12:00:00.000Z')
    })

    it('should format a date string to ISO string', function () {
      const result = formatISO('2025-12-21T12:00:00.000Z')
      expect(result).to.equal('2025-12-21T12:00:00.000Z')
    })
  })

  describe('#formatRelativeTime', function () {
    it('should return relative time for recent timestamps', function () {
      const now = new Date()
      const fiveMinutesAgo = new Date(now - 5 * 60 * 1000)
      const result = formatRelativeTime(fiveMinutesAgo)
      expect(result).to.include('minute')
    })

    it('should return relative time without suffix when withoutSuffix is true', function () {
      const now = new Date()
      const twoHoursAgo = new Date(now - 2 * 60 * 60 * 1000)
      const result = formatRelativeTime(twoHoursAgo, true)
      expect(result).to.include('hour')
      expect(result).to.not.include('ago')
    })

    it('should handle days', function () {
      const now = new Date()
      const threeDaysAgo = new Date(now - 3 * 24 * 60 * 60 * 1000)
      const result = formatRelativeTime(threeDaysAgo, true)
      expect(result).to.include('day')
    })
  })
})

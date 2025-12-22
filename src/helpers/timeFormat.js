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

const DIVISIONS = [
  { amount: 60, name: 'seconds' },
  { amount: 60, name: 'minutes' },
  { amount: 24, name: 'hours' },
  { amount: 7, name: 'days' },
  { amount: 4.34524, name: 'weeks' },
  { amount: 12, name: 'months' },
  { amount: Number.POSITIVE_INFINITY, name: 'years' }
]

const rtf = new Intl.RelativeTimeFormat('en', { numeric: 'auto' })

/**
 * Format a timestamp as relative time (e.g., "2 hours ago", "3 days ago")
 * @param {Date|number|string} date - The date to format
 * @param {boolean} withoutSuffix - If true, omit "ago" (returns "2 hours" instead of "2 hours ago")
 * @returns {string} The formatted relative time
 */
export function formatRelativeTime(date, withoutSuffix = false) {
  const timestamp = date instanceof Date ? date : new Date(date)
  let duration = (timestamp - new Date()) / 1000

  for (let i = 0; i < DIVISIONS.length; i++) {
    const division = DIVISIONS[i]
    if (Math.abs(duration) < division.amount) {
      const formatted = rtf.format(Math.round(duration), division.name)
      if (withoutSuffix) {
        // Remove "ago" or "in" prefix/suffix for compatibility with moment's fromNow(true)
        return formatted
          .replace(/ ago$/, '')
          .replace(/^in /, '')
          .replace(/^yesterday$/, '1 day')
          .replace(/^tomorrow$/, '1 day')
      }
      return formatted
    }
    duration /= division.amount
  }
  return ''
}

/**
 * Format a date to ISO 8601 string
 * @param {Date|number|string} date - The date to format
 * @returns {string} ISO 8601 formatted string
 */
export function formatISO(date) {
  const timestamp = date instanceof Date ? date : new Date(date)
  return timestamp.toISOString()
}

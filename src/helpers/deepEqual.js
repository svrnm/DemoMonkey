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

/**
 * Deep equality comparison for objects, arrays, and primitives.
 * Handles NaN correctly (NaN === NaN returns true).
 *
 * @param {*} a - First value to compare
 * @param {*} b - Second value to compare
 * @returns {boolean} - True if values are deeply equal
 */
export function deepEqual(a, b) {
  // Same reference or identical primitives
  if (a === b) {
    return true
  }

  // Handle NaN (NaN !== NaN in JavaScript, but we want them equal)
  if (typeof a === 'number' && typeof b === 'number' && Number.isNaN(a) && Number.isNaN(b)) {
    return true
  }

  // If either is null/undefined or not an object, they're not equal
  if (a === null || b === null || typeof a !== 'object' || typeof b !== 'object') {
    return false
  }

  // Handle arrays
  if (Array.isArray(a) !== Array.isArray(b)) {
    return false
  }

  if (Array.isArray(a)) {
    if (a.length !== b.length) {
      return false
    }
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) {
        return false
      }
    }
    return true
  }

  // Handle objects
  const keysA = Object.keys(a)
  const keysB = Object.keys(b)

  if (keysA.length !== keysB.length) {
    return false
  }

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) {
      return false
    }
    if (!deepEqual(a[key], b[key])) {
      return false
    }
  }

  return true
}

export default deepEqual

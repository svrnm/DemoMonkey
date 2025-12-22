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
 * Encode a string to Base64 (Unicode-safe)
 * @param {string} str - The string to encode
 * @returns {string} Base64 encoded string
 */
export function base64Encode(str) {
  // Use TextEncoder for proper Unicode handling
  const bytes = new TextEncoder().encode(str)
  const binString = Array.from(bytes, (byte) => String.fromCodePoint(byte)).join('')
  return btoa(binString)
}

/**
 * Decode a Base64 string (Unicode-safe)
 * @param {string} base64 - The Base64 string to decode
 * @returns {string} Decoded string
 */
export function base64Decode(base64) {
  // Use TextDecoder for proper Unicode handling
  const binString = atob(base64)
  const bytes = Uint8Array.from(binString, (char) => char.codePointAt(0))
  return new TextDecoder().decode(bytes)
}

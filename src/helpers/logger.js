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

function logger() {
  const timestamp = Date.now()
  const message = [...arguments]
  const level = message.shift()
  const out = console[['error', 'info', 'warn', 'debug', 'log'].includes(level) ? level : 'log']
  if (globalThis && globalThis.dmLogger) {
    globalThis.dmLogger({
      level,
      // we need to make sure that errors are converted into objects early,
      // since they are not stringified properly. JSON.stringify(new Error()) => {}
      message: message.map((e) => {
        if (e instanceof Error) {
          return {
            fromError: true,
            message: e.message,
            name: e.name,
            stack: e.stack
          }
        }
        return e
      }),
      timestamp
    })
  }
  return {
    write: out.bind.apply(out, [console, `[logged: ${level}]`].concat(message))
  }
}

function connectLogger(store, extras = {}) {
  globalThis.dmLogEntries = []
  // Log messages are written to the store periodically to avoid lags.
  setInterval(() => {
    if (globalThis.dmLogEntries.length > 0) {
      store.dispatch({
        type: 'APPEND_LOG_ENTRIES',
        entries: globalThis.dmLogEntries
      })
      globalThis.dmLogEntries = []
    }
  }, 2000)
  globalThis.dmLogger = function (entry) {
    // We don't write debug messages to the log
    if (entry.level === 'debug') {
      return
    }
    globalThis.dmLogEntries.push(Object.assign({}, extras, entry))
  }
}

export { logger, connectLogger }

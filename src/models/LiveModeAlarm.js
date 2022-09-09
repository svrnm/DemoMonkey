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

class LiveModeAlarm {
  static ALARM_NAME = 'liveModeAlarm'
  static PERIOD_IN_MINUTES = 1 / 15

  constructor(alarms, logger, badge, storage) {
    this.alarms = alarms
    this.logger = logger
    this.badge = badge
    this.storage = storage
  }

  _getLiveModeStartTime(cb) {
    this.storage.get({ liveModeData: { startTime: 0 } }, ({ liveModeData }) => {
      if (liveModeData.startTime === 0) {
        const now = Date.now()
        this.storage.set({ liveModeData: { startTime: now } }, () => {
          cb(now)
        })
      } else {
        cb(liveModeData.startTime)
      }
    })
  }

  registerAlarmListener() {
    this.logger('debug', 'Register Alarm Listener')
    this.alarms.onAlarm.addListener((alarm) => {
      if (alarm.name === LiveModeAlarm.ALARM_NAME) {
        this._getLiveModeStartTime((liveModeStartTime) => {
          const minutes = Math.floor((Date.now() - liveModeStartTime) / 60000)
          this.logger('debug', 'Live Mode Minutes', minutes).write()
          this.badge.updateTimer(minutes)
        })
      }
    })
  }

  toggle() {
    this.alarms.get(LiveModeAlarm.ALARM_NAME, (existingAlarm) => {
      if (existingAlarm) {
        this.logger('debug', 'Disable live mode alarm.').write()
        this._disable()
      } else {
        this.logger('debug', 'Enable live mode alarm.').write()
        this._enable()
      }
    })
  }

  _enable() {
    this.alarms.create(LiveModeAlarm.ALARM_NAME, {
      periodInMinutes: LiveModeAlarm.PERIOD_IN_MINUTES
    })
    // Set the badge counter to 0, because the alarm will be triggered
    // only after LiveModeAlarm.PERIOD_IN_MINUTES minutes
    this.badge.updateTimer(0)
  }

  _disable() {
    this.alarms.clear(LiveModeAlarm.ALARM_NAME, () => {
      this._getLiveModeStartTime((liveModeStartTime) => {
        const time = (Date.now() - liveModeStartTime)
        const hours = ('' + Math.floor(time / (3600000))).padStart(2, '0')
        const minutes = ('' + Math.floor((time % 3600000) / 60000)).padStart(2, '0')
        const seconds = ('' + Math.floor((time % 60000) / 1000)).padStart(2, '0')

        this.logger('info', `Live mode ended after ${hours}:${minutes}:${seconds}`).write()

        this.storage.remove('liveModeData')
        this.badge.clearTimer()
      })
    })
  }
}
export default LiveModeAlarm

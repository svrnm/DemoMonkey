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
const LIVE_EDITOR_STYLES = `
  :host {
    all: initial;
    position: fixed;
    bottom: 16px;
    right: 16px;
    z-index: 2147483647;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    font-size: 13px;
    line-height: 1.4;
    color: #1a1a1a;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  .dm-le-wrapper {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
  }

  .dm-le-fab {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid #a8c987;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transition: box-shadow 0.2s ease, transform 0.2s ease;
  }

  .dm-le-fab:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    transform: scale(1.05);
  }

  .dm-le-fab svg {
    width: 28px;
    height: 28px;
  }

  .dm-le-panel {
    display: none;
    width: 420px;
    max-height: 480px;
    background: #fff;
    border: 1px solid #d0d0d0;
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    flex-direction: column;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .dm-le-panel.dm-le-open {
    display: flex;
  }

  .dm-le-header {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    background: #f5f5f5;
    border-bottom: 1px solid #e0e0e0;
    gap: 8px;
  }

  .dm-le-config-select {
    flex: 1;
    padding: 4px 8px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 12px;
    font-family: inherit;
    background: #fff;
    color: #1a1a1a;
    outline: none;
  }

  .dm-le-config-select:focus {
    border-color: #a8c987;
  }

  .dm-le-header-btn {
    background: none;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    color: #555;
    padding: 3px 5px;
    line-height: 1;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .dm-le-header-btn:hover {
    background: #e0e0e0;
    color: #333;
    border-color: #bbb;
  }

  .dm-le-close-btn {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    color: #666;
    padding: 2px 6px;
    border-radius: 4px;
    line-height: 1;
  }

  .dm-le-close-btn:hover {
    background: #e0e0e0;
    color: #333;
  }

  .dm-le-output {
    flex: 1;
    overflow-y: auto;
    padding: 8px 12px;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Courier New', monospace;
    font-size: 12px;
    min-height: 120px;
    max-height: 320px;
    background: #fafafa;
  }

  .dm-le-output-line {
    padding: 2px 0;
    word-break: break-word;
    white-space: pre-wrap;
  }

  .dm-le-output-line.dm-le-info {
    color: #555;
  }

  .dm-le-output-line.dm-le-success {
    color: #2e7d32;
  }

  .dm-le-output-line.dm-le-error {
    color: #c62828;
  }

  .dm-le-output-line.dm-le-command {
    color: #1565c0;
  }

  .dm-le-input-row {
    display: flex;
    border-top: 1px solid #e0e0e0;
    background: #fff;
  }

  .dm-le-input {
    flex: 1;
    padding: 8px 12px;
    border: none;
    outline: none;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Courier New', monospace;
    font-size: 12px;
    background: transparent;
    color: #1a1a1a;
  }

  .dm-le-input::placeholder {
    color: #999;
  }

  .dm-le-hints {
    border-top: 1px solid #e0e0e0;
  }

  .dm-le-hints:empty {
    display: none;
  }

  .dm-le-hint {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 4px 12px;
    cursor: pointer;
    font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Courier New', monospace;
    font-size: 12px;
  }

  .dm-le-hint:hover,
  .dm-le-hint.dm-le-hint-active {
    background: #eef3ff;
  }

  .dm-le-hint-cmd {
    color: #1565c0;
    font-weight: 600;
    min-width: 60px;
  }

  .dm-le-hint-desc {
    color: #777;
    font-size: 11px;
  }
`

export default LIVE_EDITOR_STYLES

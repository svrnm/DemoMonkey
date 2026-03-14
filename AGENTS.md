# AGENTS.md - AI Assistant Guide for DemoMonkey

This file provides context for AI coding assistants (Claude, GPT, Copilot, Gemini, etc.)
working on the DemoMonkey codebase.

## Project Overview

DemoMonkey is a **Chrome/Firefox browser extension** (Manifest V3) that lets users customize
web application UIs for prospect-specific demos. Users write INI-based configuration files
with text/visual replacement rules, and the extension applies them to live web pages in
real time.

- **License:** Apache 2.0
- **Language:** JavaScript (ES6+) with JSX
- **UI Framework:** React 19 + Redux + Material-UI (MUI)
- **Build Tool:** Webpack 5 + Babel 7
- **Tests:** Mocha/Chai (unit), Playwright (E2E)
- **Linting:** ESLint 9 (flat config) + Prettier

## Quick Reference Commands

```bash
npm install          # Install dependencies
npm start            # Dev build with watch mode (output: build/)
npm run build        # One-off dev build
npm test             # Run unit tests (mocha)
npm run test:e2e     # Run E2E tests (playwright)
npm run test:all     # Run unit + E2E tests
npm run lint         # Check linting errors
npm run lint:fix     # Auto-fix linting errors
npm run format       # Check formatting (prettier)
npm run format:fix   # Auto-fix formatting
npm run release      # Production build + ZIP for Chrome Web Store
```

## Project Structure

```text
src/
  app.js              # UI entry point (popup + options page)
  monkey.js           # Content script (injected into web pages, applies configs)
  background.js       # Service worker (extension lifecycle, messaging)
  inline.js           # Injected script for AJAX request interception
  backup.js           # Configuration backup utility

  models/             # Core business logic
    Monkey.js         # Main replacement engine (DOM walking, undo tracking)
    Configuration.js  # Parses INI configs, manages variables/options
    CommandBuilder.js # Builds Command objects from config patterns
    Repository.js     # Handles config imports and dependencies
    Settings.js       # Global extension settings
    Variable.js       # Template variable substitution
    MatchRule.js      # URL include/exclude matching
    ...

  commands/           # 40+ replacement/manipulation commands
    Command.js        # Base class for all commands
    CommandBuilder.js # Registry + factory for command instances
    SearchAndReplace.js, Hide.js, Style.js, ReplaceImage.js, ...
    appdynamics/      # AppDynamics-specific commands

  components/         # React UI
    options/          # Dashboard/options page (editor, navigation, settings)
    popup/            # Browser action popup
    shared/           # Reusable UI components

  reducers/           # Redux state (configurations, settings, log)
  helpers/            # Utility functions
  styles/             # LESS stylesheets
  pages/              # HTML templates

test/
  commands/           # Command unit tests
  models/             # Model unit tests
  helpers/            # Helper unit tests
  playwright/         # E2E browser tests
```

## Architecture

### Data Flow

```text
INI config text
  -> Ini.js (parse to key-value pairs)
  -> Configuration.js (extract options, variables, imports)
  -> CommandBuilder.js (create Command instances)
  -> Monkey.js (walk DOM, apply commands at intervals)
  -> UndoElement tracking (for reverting changes)
```

### Extension Components

| Entry Point         | Role                                               |
| ------------------- | -------------------------------------------------- |
| `src/app.js`        | Renders React UI for popup and options page        |
| `src/monkey.js`     | Content script: applies configurations to page DOM |
| `src/background.js` | Service worker: manages tabs, messaging, requests  |
| `src/inline.js`     | Injected into pages for AJAX/XHR interception      |

### State Management

Redux with **webext-redux** to sync state between the background service worker
and content scripts via message passing. Key reducers: `configurations`, `settings`,
`log`, `connectionState`.

### INI Configuration Format

```ini
; Options
@include[] = /regex/         ; URL include rules
@exclude[] = /regex/         ; URL exclude rules
@namespace[] = appdynamics   ; Import command namespaces

; Simple replacement
search_text = replacement_text

; Commands (prefix with !)
!hide(selector)
!style(selector) = color: red
!/regex/i = replacement

; Variables (prefix with $)
$customer = Acme Corp//Customer name

; Imports (prefix with +)
+SharedConfig
```

## Code Conventions

### File Headers (Required)

Every `.js` file in `src/` and `test/` must start with the Apache 2.0 license header:

```javascript
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
```

This is enforced by ESLint (`header/header` rule) and will fail CI if missing.

### Style Rules

- **No semicolons** (neostandard / standard style)
- **Single quotes** for strings
- **2-space indentation**
- **Trailing commas** in multiline
- Function paren spacing: `anonymous: always`, `named: ignore`, `asyncArrow: ignore`
- Run `npm run lint:fix && npm run format:fix` before committing

### Pre-commit Hooks

Husky + lint-staged run on every commit:

- ESLint on staged `.js` files
- Prettier on all staged files
- markdownlint on staged `.md` files

### Testing

- Unit tests use **Mocha + Chai** (expect style)
- Test files mirror the source structure under `test/`
- Chai property assertions are used (`expect(x).to.be.true`), so `no-unused-expressions` is disabled in test files
- E2E tests use **Playwright** and live in `test/playwright/`
- Always run `npm test` after modifying commands or models

### Adding a New Command

1. Create a class extending `Command` in `src/commands/YourCommand.js`
2. Import it in `src/commands/CommandBuilder.js`
3. Add the factory in `_buildCustomCommand()` above the marker comment
4. Return `UndoElement` from `apply()` to support undo
5. Add unit tests in `test/commands/`

See [CONTRIBUTE.md](CONTRIBUTE.md) for a detailed walkthrough.

## Key Gotchas

- **Manifest V3**: Uses service workers (not background pages). No persistent state
  in the background script — use `chrome.storage` or Redux via webext-redux.
- **Content script isolation**: `monkey.js` runs in an isolated world. To intercept
  page-level APIs (like XHR), `inline.js` is injected into the page context.
- **Undo system**: Commands must return `UndoElement` instances for reversibility.
  Without this, disabling a config won't revert changes.
- **Webpack entries**: There are 4 separate entry points (`app`, `background`,
  `monkey`, `inline`). Changes to shared code may affect multiple bundles.
- **webext-redux port**: The content script connects to the background store via port
  name `DEMO_MONKEY_STORE`. Breaking this contract breaks state sync.

## Related Documentation

- [README.md](README.md) — Project overview and installation
- [USAGE.md](USAGE.md) — Comprehensive usage guide for end users
- [CONTRIBUTE.md](CONTRIBUTE.md) — Developer setup and custom command tutorial
- [SHORTCUTS.md](SHORTCUTS.md) — Ace editor keyboard shortcuts
- [SECURITY.md](SECURITY.md) — Vulnerability reporting policy
- [CHANGELOG.md](CHANGELOG.md) — Version history

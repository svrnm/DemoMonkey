# Dependency Upgrade Plan

**Created:** December 20, 2025  
**Status:** In Progress

## Completed Upgrades ✅

| Package | From | To | Notes |
|---------|------|-----|-------|
| chance | 1.1.11 | 1.1.12 | Patch |
| js-base64 | 3.7.7 | 3.7.8 | Patch |
| color-name | 1.1.4 | 2.0.0 | Major, no changes needed |
| sharp | 0.33.5 | 0.34.2 | Minor |
| less | 4.2.0 | 4.3.0 | Minor |
| less-loader | 12.2.0 | 12.3.0 | Minor |
| highlight.js | 11.10.0 | 11.11.1 | Minor |
| axios | 1.7.9 | 1.10.0 | Minor |
| prettier | 3.4.1 | 3.6.1 | Minor |
| postcss | 8.4.49 | 8.5.6 | Minor |
| mini-css-extract-plugin | 2.9.2 | 2.10.0 | Minor |
| html-webpack-plugin | 5.6.3 | 5.6.5 | Patch |
| eslint-plugin-react | 7.37.2 | 7.37.5 | Patch |
| eslint-plugin-import | 2.31.0 | 2.32.0 | Minor |
| @babel/* | various | latest | Minor updates |
| webpack | 5.96.1 | 5.104.1 | Minor |
| stylelint | 16.10.0 | 16.26.1 | Minor |
| @emotion/react | 11.x | latest | Minor |
| @emotion/styled | 11.x | latest | Minor |
| @mui/icons-material | 6.x | 6.5.0 | Minor |
| @mui/material | 6.x | 6.5.0 | Minor |
| @mui/lab | 6.x | latest | Minor |
| @mui/x-tree-view | 7.22.1 | 7.29.10 | Minor |
| @commitlint/* | 19.6.0 | 19.8.1 | Minor |
| lint-staged | 15.2.10 | 15.5.2 | Minor |
| ace-builds | 1.x | latest | Minor |
| marked | 14.x | 15.0.12 | Minor |
| fast-xml-parser | 4.5.0 | 4.5.3 | Patch |
| ini | 5.0.0 | 6.0.0 | Major, no changes needed |
| uuid | 11.1.0 | 13.0.0 | Major, no changes needed |
| mocha | 10.8.2 | 11.7.4 | Major, no changes needed |
| chai | 4.5.0 | 6.2.1 | Major, no changes needed |

---

## Remaining Upgrades

### Phase 1: Build Tools 🟢 Low Risk

| Package | Current | Latest | Notes |
|---------|---------|--------|-------|
| babel-loader | 9.2.1 | 10.0.0 | Only drops Node 16 support. No code changes needed. |
| copy-webpack-plugin | 12.0.2 | 13.0.1 | Only drops Node 18.12.0 support (requires 18.18.0+). No code changes. |
| webpack-cli | 5.1.4 | 6.0.1 | Drops Node 18.12.0 support, removes deprecated commands. Standard commands still work. |

**Action:** Install and test. No code changes expected.

---

### Phase 2: Dev Tooling 🟢 Low Risk

| Package | Current | Latest | Notes |
|---------|---------|--------|-------|
| @commitlint/cli | 19.8.1 | 20.2.0 | Only Node.js 20+ required. No config changes. |
| @commitlint/config-conventional | 19.8.1 | 20.2.0 | Only Node.js 20+ required. No config changes. |
| lint-staged | 15.5.2 | 16.2.7 | Only Node.js 20+ required. Config format unchanged. |
| markdownlint | 0.36.1 | 0.40.0 | Minor API updates, CLI usage unchanged. |
| markdownlint-cli | 0.42.0 | 0.47.0 | Just uses newer markdownlint. No changes needed. |
| stylelint-config-standard | 36.0.1 | 39.0.1 | Updates rules. May cause new lint warnings but no code changes. |

**Action:** Install and test. May need to fix new lint warnings.

---

### Phase 3: Utilities 🟢 Low Risk

| Package | Current | Latest | Notes |
|---------|---------|--------|-------|
| color | 4.2.3 | 5.0.3 | ESM-only in v5. Usage `new Color(input)` unchanged. Should work with webpack. |
| color-string | 1.9.1 | 2.1.4 | API unchanged, just requires color v5. |
| marked | 15.0.12 | 17.0.1 | v16 removed `use()`. v17 changed async. Usage `marked.parse(text)` should work. |

**Action:** Install and test. No code changes expected.

---

### Phase 4: ESLint 9 Migration 🟡 Medium Risk

| Package | Current | Latest | Notes |
|---------|---------|--------|-------|
| eslint | 8.57.1 | 9.39.2 | **Major work required** |
| eslint-plugin-json | 3.1.0 | 4.0.1 | Requires ESLint 9 flat config |
| eslint-plugin-promise | 6.6.0 | 7.2.1 | Requires ESLint 9 flat config |

**Required Changes:**
1. Rewrite `.eslintrc.js` to new flat config format (`eslint.config.js`)
2. Update all plugin configurations to flat config syntax
3. Update `eslint-plugin-react`, `eslint-plugin-import`, `@babel/eslint-parser` for ESLint 9 compatibility
4. Test all lint commands

**Current `.eslintrc.js` structure to migrate:**
- Parser: `@babel/eslint-parser`
- Plugins: `react`, `promise`, `json`, `import`
- Extends: `eslint:recommended`, `plugin:react/recommended`, `plugin:import/recommended`
- Custom rules for React, import order, etc.

---

### Phase 5: State Management 🟡 Medium Risk

| Package | Current | Latest | Notes |
|---------|---------|--------|-------|
| redux | 4.2.1 | 5.0.1 | Must upgrade first |
| react-redux | 8.1.3 | 9.2.0 | Requires Redux 5+ |

**Analysis:**
- Uses `createStore` with `combineReducers` and `applyMiddleware`
- Uses `Provider` component and `connect()` HOC
- `createStore` is "legacy" but still works in Redux 5
- Consider future migration to Redux Toolkit

**Action:** Upgrade redux first, then react-redux. Test all connected components.

---

### Phase 6: Other Medium Risk 🟡

| Package | Current | Latest | Notes |
|---------|---------|--------|-------|
| change-case | 4.1.2 | 5.4.4 | ESM-only, function renames |
| fast-xml-parser | 4.5.3 | 5.3.3 | API changes |

**change-case Required Changes:**
- `paramCase` → `kebabCase` (used in `src/commands/appdynamics/ReplaceFlowmapIcon.js`)
- Other functions (`capitalCase`, `noCase`, `camelCase`, `pascalCase`, `snakeCase`, `sentenceCase`) are unchanged

**fast-xml-parser Analysis:**
- Used in `src/models/ProtocolHandler.js`
- Uses `XMLParser` with options: `ignoreAttributes: false`, `attributeNamePrefix: '@_'`
- Need to verify v5 API compatibility

---

### Phase 7: React 19 Ecosystem 🔴 High Risk

| Package | Current | Latest | Notes |
|---------|---------|--------|-------|
| react | 18.3.1 | 19.2.3 | Major changes |
| react-dom | 18.3.1 | 19.2.3 | Major changes |
| react-ace | 13.0.0 | 14.0.1 | May require React 19 |
| @mui/icons-material | 6.5.0 | 7.3.6 | Major MUI update |
| @mui/lab | 6.0.0-dev | 7.0.1-beta | Major MUI update |
| @mui/material | 6.5.0 | 7.3.6 | Major MUI update |
| @mui/x-tree-view | 7.29.10 | 8.22.0 | Major update |

**Prerequisites:**
- Verify react-ace 14 supports React 19
- Verify MUI 7 supports React 19
- All ecosystem packages must be compatible

**React 19 Breaking Changes to Review:**
- `ref` is now a regular prop (no `forwardRef` needed)
- Removed `propTypes` runtime checking
- New hooks: `use()`, `useFormStatus`, `useOptimistic`
- Stricter hydration errors
- Changes to Suspense behavior

**MUI 7 Migration:**
- Use official codemods: `npx @mui/codemod@latest v7.0.0/preset-safe`
- Theme structure changes
- Component API updates

**Action:** This should be done last, as a dedicated effort. All packages in this phase should be upgraded together after verifying compatibility.

---

## Summary

| Phase | Risk | Packages | Estimated Effort |
|-------|------|----------|------------------|
| 1. Build Tools | 🟢 Low | 3 | 15 minutes |
| 2. Dev Tooling | 🟢 Low | 6 | 30 minutes |
| 3. Utilities | 🟢 Low | 3 | 15 minutes |
| 4. ESLint 9 | 🟡 Medium | 3 | 1-2 hours |
| 5. State Management | 🟡 Medium | 2 | 30 minutes |
| 6. Other Medium | 🟡 Medium | 2 | 30 minutes |
| 7. React 19 + MUI 7 | 🔴 High | 7 | 2-4 hours |

---

## Notes

- Always run `npm run build && npm test && npm run test:e2e` after each upgrade
- The e2e tests use Playwright and cover UI functionality
- 3 npm audit vulnerabilities exist (1 moderate, 2 high) - may be resolved by these upgrades

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
import js from '@eslint/js'
import globals from 'globals'
import neostandard from 'neostandard'
import pluginReact from 'eslint-plugin-react'
import pluginImport from 'eslint-plugin-import'
import pluginPromise from 'eslint-plugin-promise'
import pluginHeader from '@tony.ganchev/eslint-plugin-header'
import babelParser from '@babel/eslint-parser'

const headerPattern =
  '\\* Licensed under the Apache License, Version 2\\.0 \\(the "License"\\);[\\r\\n]+ \\* you may not use this file except in compliance with the License\\.[\\r\\n]+ \\* You may obtain a copy of the License at[\\r\\n]+ \\*[\\r\\n]+ \\*      https:\\/\\/www\\.apache\\.org\\/licenses\\/LICENSE-2\\.0[\\r\\n]+ \\*[\\r\\n]+ \\* Unless required by applicable law or agreed to in writing, software[\\r\\n]+ \\* distributed under the License is distributed on an "AS IS" BASIS,[\\r\\n]+ \\* WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied\\.[\\r\\n]+ \\* See the License for the specific language governing permissions and[\\r\\n]+ \\* limitations under the License\\.'

const headerTemplate =
  '*\n * Licensed under the Apache License, Version 2.0 (the "License");\n * you may not use this file except in compliance with the License.\n * You may obtain a copy of the License at\n *\n *      https://www.apache.org/licenses/LICENSE-2.0\n *\n * Unless required by applicable law or agreed to in writing, software\n * distributed under the License is distributed on an "AS IS" BASIS,\n * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.\n * See the License for the specific language governing permissions and\n * limitations under the License.\n '

export default [
  // Ignore patterns (replaces .eslintignore)
  {
    ignores: [
      'scripts/**/*.js',
      'build/**/*.js',
      'node_modules/**/*.js',
      'webpack.config.js',
      'playwright.config.js',
      'eslint.config.js'
    ]
  },

  // Base JS recommended rules
  js.configs.recommended,

  // Neostandard (ESLint 9 compatible replacement for eslint-config-standard)
  ...neostandard(),

  // Main configuration for source files
  {
    files: ['src/**/*.js', 'test/**/*.js'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      parser: babelParser,
      parserOptions: {
        requireConfigFile: false,
        ecmaFeatures: {
          jsx: true
        },
        babelOptions: {
          presets: ['@babel/preset-react']
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.mocha
      }
    },
    plugins: {
      react: pluginReact,
      import: pluginImport,
      promise: pluginPromise,
      header: pluginHeader
    },
    settings: {
      react: {
        version: 'detect'
      },
      'import/resolver': {
        node: {
          extensions: ['.js', '.jsx']
        }
      }
    },
    rules: {
      // React rules
      ...pluginReact.configs.recommended.rules,
      'react/jsx-uses-vars': 'warn',
      // PropTypes are legacy; project uses no runtime type checking
      'react/prop-types': 'off',
      // Catch deprecated unsafe lifecycle methods (UNSAFE_componentWillMount, etc.)
      'react/no-unsafe': 'error',

      // Import rules
      // Disabled: ESLint import resolver can't resolve all npm modules
      // without eslint-import-resolver-webpack. Webpack handles resolution at build time.
      'import/no-unresolved': 'off',
      'import/named': 'error',

      // Promise rules
      ...pluginPromise.configs.recommended.rules,
      // Keep off: This rule bans native Promises (for old bluebird compatibility)
      'promise/no-native': 'off',
      // Keep off: This rule bans `new Promise()` which is sometimes necessary
      'promise/avoid-new': 'off',

      // Disable stylistic rules from neostandard that conflict with prettier
      '@stylistic/space-before-function-paren': 'off',
      '@stylistic/multiline-ternary': 'off',

      // Space before function paren - project style
      'space-before-function-paren': [
        'error',
        {
          anonymous: 'always',
          named: 'ignore',
          asyncArrow: 'ignore'
        }
      ],

      // Header rule
      'header/header': [
        'error',
        'block',
        {
          pattern: headerPattern,
          template: headerTemplate
        }
      ]
    }
  },

  // Test files - allow chai property assertions
  {
    files: ['test/**/*.js'],
    rules: {
      // Chai uses property assertions like .to.be.true which look like unused expressions
      'no-unused-expressions': 'off'
    }
  },

  // JSON files
  {
    files: ['**/*.json'],
    plugins: {
      // json plugin for ESLint 9 handles this differently
    },
    rules: {}
  }
]

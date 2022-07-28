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
const fs = require('fs')
const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const { GitRevisionPlugin } = require('git-revision-webpack-plugin')
const ZipPlugin = require('zip-webpack-plugin')
// const ExtensionReloader = require('webpack-extension-reloader')

const manifest = JSON.parse(fs.readFileSync('./manifest.json'))

module.exports = env => {
  let outputDirectory = 'build'
  let isRelease = false
  let releaseSuffix = 'local'
  if (env.RELEASE) {
    outputDirectory = 'build-release'
    isRelease = true
    releaseSuffix = env.RELEASE
  }

  const plugins = [
    new HtmlWebpackPlugin({
      chunks: ['app'],
      title: 'Demo Monkey Dashboard',
      template: 'pages/template.html',
      filename: 'options.html',
      appname: 'OptionsPageApp',
      inject: 'head',
      htmlClass: ''
    }),
    new HtmlWebpackPlugin({
      chunks: ['app'],
      title: 'Demo Monkey Popup',
      template: 'pages/template.html',
      filename: 'popup.html',
      appname: 'PopupPageApp',
      inject: 'head',
      htmlClass: 'popup-app'
    }),
    new HtmlWebpackPlugin({
      chunks: ['app'],
      title: 'Demo Monkey Toolbar',
      template: 'pages/template.html',
      filename: 'devtools.html',
      inject: 'head',
      appname: 'DevToolsPageApp',
      htmlClass: ''
    }),
    new HtmlWebpackPlugin({
      chunks: ['background'],
      title: 'Demo Monkey Background',
      template: 'pages/template.html',
      filename: 'background.html',
      inject: 'head',
      appname: '',
      htmlClass: '',
      background: true
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'manifest.json',
          to: '.',
          transform: content => {
            if (releaseSuffix === 'dev-channel') {
              return Buffer.from(content.toString()
                .replace(/"name": "([^"]*)"/g, '"name": "$1 (dev-channel)"')
                .replace(/"(default_icon|16|48|128)": "([^_]*)([^"]*)"/g, '"$1": "$2-dev$3"')
              )
            }
            return content
          }
        },
        { from: 'README.md', to: '.' },
        { from: 'USAGE.md', to: '.' },
        { from: 'LICENSE', to: '.' },
        { from: 'src/test.js', to: '.' },
        { from: 'pages/test.html', to: '.' },
        { from: 'src/backup.js', to: '.' },
        { from: 'pages/backup.html', to: '.' }
      ]
    }),
    new MiniCssExtractPlugin({
      filename: 'css/[name].css'
    }),
    new GitRevisionPlugin()
  ]

  if (isRelease) {
    plugins.push(new ZipPlugin({
      filename: `DemoMonkey-${manifest.version}-${releaseSuffix}.zip`,
      path: '..'
    }))
  } else {
    /*plugins.push(new ExtensionReloader({
      reloadPage: true, // Force the reload of the page also
      entries: { // The entries used for the content/background scripts or extension pages
        contentScript: 'monkey',
        background: 'background',
        extensionPage: 'app'
      }
    }))*/
  }

  return {
    devtool: false,
    entry: {
      app: './src/app.js',
      background: './src/background.js',
      monkey: './src/monkey.js',
      inline: './src/inline.js'
    },
    output: {
      filename: 'js/[name].js',
      path: path.resolve(__dirname, outputDirectory)
    },
    plugins,
    // this is currently _only_ needed for the google-apis
    /*
    resolve: {
      fallback: {
        fs: false,
        http2: false,
        tls: false,
        net: false,
        child_process: false,
        crypto: require.resolve('crypto-browserify'),
        querystring: require.resolve('querystring-es3'),
        stream: require.resolve('stream-browserify'),
        zlib: require.resolve('browserify-zlib'),
        path: require.resolve('path-browserify'),
        os: require.resolve('os-browserify/browser'),
        util: require.resolve('util/'),
        url: require.resolve('url/'),
        assert: require.resolve('assert/')
      }
    },
    */
    module: {
      rules: [
        {
          test: /\.(jpe?g|png|webp)$/i,
          use: {
            loader: 'responsive-loader',
            options: {
              sizes: [16, 48, 128],
              outputPath: 'icons/',
              name: '[name]_[width].[ext]'
            }
          }
        },
        {
          test: /\.m?js$/,
          exclude: /(node_modules|bower_components)/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env'],
              plugins: ['@babel/plugin-proposal-object-rest-spread']
            }
          }
        },
        {
          test: /\.less$/i,
          use: [
            MiniCssExtractPlugin.loader,
            'css-loader',
            'less-loader'
          ]
        },
        {
          test: /\.md$/,
          use: [
            {
              loader: 'raw-loader',
              options: {
                esModule: false
              }
            }
          ]
        },
        {
          test: /\.mnky$/,
          use: [
            {
              loader: 'raw-loader',
              options: {
                esModule: false
              }
            }
          ]
        }
      ]
    }
  }
}

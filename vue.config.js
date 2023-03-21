const webpack = require('webpack')
const CopyPlugin = require('copy-webpack-plugin')
const PACKAGE = require('./package.json')

const banner = `${PACKAGE.name} - ${PACKAGE.version} | ${
  PACKAGE.author
} ${new Date().getFullYear()}`

module.exports = {
  publicPath: '',
  configureWebpack: {
    plugins: [
      new webpack.DefinePlugin({
        VERSION: JSON.stringify(PACKAGE.version),
        'process.execArgv': JSON.stringify(process.execArgv),
      }),
      new CopyPlugin({
        patterns: [
          {
            from: 'public/index.*.html',
            to: "[name][ext]",
          },
          {
            from: 'node_modules/vue/dist/vue.js',
            to: "[name][ext]",
          },
        ],
      }),
      new webpack.BannerPlugin({
        banner,
        raw: false,
        entryOnly: true,
      }),
    ],
    resolve: {
      alias: {
        flatbush: 'flatbush/flatbush',
      },
      fallback: {
        "child_process": false,
        "fs": false,
        "path": false,
      },
    },
  },
  transpileDependencies: [
    'mapshaper',
    'flatqueue',
    'flatbush',
    'xmldom',
    'xpath',
    'spacetime',
  ],
}

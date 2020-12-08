const webpack = require('webpack');
const CopyPlugin = require('copy-webpack-plugin');
const PACKAGE = require('./package.json');

const banner =
  `${PACKAGE.name
  } - ${
    PACKAGE.version
  } | ${
    PACKAGE.author
  } ${
    new Date().getFullYear()}`;

module.exports = {
  configureWebpack: {
    plugins: [
      new CopyPlugin({
        patterns: [
          {
            from: 'public/index.??.html',
            flatten: true,
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
    },
  },
  transpileDependencies: ['mapshaper', 'flatqueue', 'flatbush', 'xmldom', 'xpath'],
};

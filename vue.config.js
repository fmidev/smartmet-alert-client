const webpack = require('webpack');
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

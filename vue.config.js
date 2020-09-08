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
  pluginOptions: {
    i18n: {
      locale: 'fi',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false,
    },
  },
  configureWebpack: {
    plugins: [
      new webpack.BannerPlugin({
        banner,
        raw: false,
        entryOnly: true,
      }),
    ],
  },
};

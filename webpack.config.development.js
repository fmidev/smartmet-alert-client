const webpack = require('webpack');
const I18nPlugin = require('i18n-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');
const languages = {
  fi: require('./locales/fi.json'),
};
const PACKAGE = require('./package.json');
const banner =
  PACKAGE.name +
  ' - ' +
  PACKAGE.version +
  ' | ' +
  PACKAGE.author +
  ' ' +
  new Date().getFullYear();

module.exports = Object.keys(languages).map(function(language) {
  return {
    name: language,
    entry: './js/SmartAlertClient.js',
    output: {
      library: ['fmi', language],
      libraryTarget: 'umd',
      path: path.join(__dirname, './dist/development/lib'),
      filename: 'js/' + language + '.smart-alert-client.development.js',
      publicPath: 'lib/',
    },
    module: {
      noParse: /node_modules\/proj4\/dist\/proj4.js/,
      loaders: [
        {
          test: /\.js$/,
          exclude: /(node_modules|metoclient\.js)/,
          loader: 'babel',
        },
        {
          test: /.css$/,
          loader: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: 'css-loader',
            publicPath: '../',
          }),
        },
        {
          test: /.less$/,
          loader: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: 'css-loader!less-loader',
            publicPath: '../',
          }),
        },
        {
          test: /\.json$/,
          loader: 'json',
        },
        {
          test: /\.mustache$/,
          loader: 'mustache',
        },
        {
          test: /\.woff(\?v=\d+\.\d+\.\d+)?$/,
          loader:
            'url?limit=10000&mimetype=application/font-woff&name=./webpack-assets/[name]/[hash].[ext]',
        },
        {
          test: /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
          loader:
            'url?limit=10000&mimetype=application/font-woff&name=./webpack-assets/[name]/[hash].[ext]',
        },
        {
          test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
          loader:
            'url?limit=10000&mimetype=application/octet-stream&name=./webpack-assets/[name]/[hash].[ext]',
        },
        {
          test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'file?&name=./webpack-assets/[name]/[hash].[ext]',
        },
        {
          test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          loader:
            'url?limit=10000&mimetype=image/svg+xml&name=./webpack-assets/[name]/[hash].[ext]',
        },
        {
          test: /\.gif(\?v=\d+\.\d+\.\d+)?$/,
          loader:
            'url?limit=10000&mimetype=image/gif&name=./webpack-assets/[name]/[hash].[ext]',
        },
        {
          test: require.resolve('snapsvg'),
          loader: 'imports?this=>window,fix=>module.exports=0',
        },
      ],
    },
    resolve: {
      // Directory names to be searched for modules
      modules: [__dirname, 'js', 'node_modules'],

      // Replace modules with other modules or paths for compatibility or convenience
      alias: {
        underscore: 'lodash',
      },
    },
    resolveLoader: {
      moduleExtensions: ['-loader'],
    },
    watch: false,
    plugins: [
      // Ignore all locale files of moment.js
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        _: 'underscore',
        Backbone: 'backbone',
        moment: 'moment-timezone',
        he: 'he',
        proj4: 'proj4',
        numeral: 'numeral',
        Snap: 'snapsvg',
        replace: 'str-replace',
        xor: 'exclusive-or',
      }),
      new ExtractTextPlugin('css/style.css'),
      new webpack.DefinePlugin({
        CONFIG_PATH: '"development"',
      }),
      new CleanWebpackPlugin(['dist/development/lib'], {
        verbose: true,
      }),
      new CopyWebpackPlugin([
        {
          from: 'img',
          to: 'img',
        },
        {
          from: 'fonts',
          to: 'fonts',
        },
      ]),
      new I18nPlugin(languages[language]),
      new webpack.BannerPlugin({
        banner: banner,
        raw: false,
        entryOnly: true,
      }),
    ],
  };
});

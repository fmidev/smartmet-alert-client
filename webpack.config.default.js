const webpack = require('webpack');
const I18nPlugin = require('i18n-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const languages = {
  fi: require('./locales/fi.json'),
  sv: require('./locales/sv.json'),
  en: require('./locales/en.json'),
};
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
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
      globalObject: 'this',
      libraryTarget: 'umd',
      path: './dist/default/lib',
      filename: 'js/' + language + '.smart-alert-client.js',
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
          loader: ExtractTextPlugin.extract('style-loader', 'css-loader', {
            publicPath: '../',
          }),
        },
        {
          test: /.less$/,
          loader: ExtractTextPlugin.extract(
            'style-loader',
            'css-loader!less-loader',
            {
              publicPath: '../',
            }
          ),
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
    closureLoader: {
      paths: [__dirname + '/js/lib/metoclient'],
      es6mode: true,
      watch: false,
    },
    resolve: {
      // Absolute path that contains modules
      root: __dirname,

      // Directory names to be searched for modules
      modulesDirectories: ['js', 'node_modules'],

      // Replace modules with other modules or paths for compatibility or convenience
      alias: {
        underscore: 'lodash',
      },
    },
    watch: true,
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
      new BundleAnalyzerPlugin({
        // Can be `server`, `static` or `disabled`.
        // In `server` mode analyzer will start HTTP server to show bundle report.
        // In `static` mode single HTML file with bundle report will be generated.
        // In `disabled` mode you can use this plugin to just generate Webpack Stats JSON file by setting `generateStatsFile` to `true`.
        analyzerMode: 'static',
        // Host that will be used in `server` mode to start HTTP server.
        analyzerHost: '127.0.0.1',
        // Port that will be used in `server` mode to start HTTP server.
        analyzerPort: 8888,
        // Path to bundle report file that will be generated in `static` mode.
        // Relative to bundles output directory.
        reportFilename: 'js/report.html',
        // Module sizes to show in report by default.
        // Should be one of `stat`, `parsed` or `gzip`.
        // See "Definitions" section for more information.
        defaultSizes: 'parsed',
        // Automatically open report in default browser
        openAnalyzer: false,
        // If `true`, Webpack Stats JSON file will be generated in bundles output directory
        generateStatsFile: false,
        // Name of Webpack Stats JSON file that will be generated if `generateStatsFile` is `true`.
        // Relative to bundles output directory.
        statsFilename: 'stats.json',
        // Options for `stats.toJson()` method.
        // For example you can exclude sources of your modules from stats file with `source: false` option.
        // See more options here: https://github.com/webpack/webpack/blob/webpack-1/lib/Stats.js#L21
        statsOptions: null,
        // Log level. Can be 'info', 'warn', 'error' or 'silent'.
        logLevel: 'info',
      }),
      new webpack.DefinePlugin({
        CONFIG_PATH: '"default"',
      }),
      new CleanWebpackPlugin(['dist/default/lib'], {
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
      new webpack.BannerPlugin(banner, {
        raw: false,
        entryOnly: true,
      }),
    ],
  };
});

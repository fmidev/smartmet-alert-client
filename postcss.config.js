const PrefixWrap = require('postcss-prefixwrap')
const postcssurl = require('postcss-url')

module.exports = {
  plugins: [
    PrefixWrap('div#fmi-warnings div', {
      ignoredSelectors: ['#fmi-warnings'],
    }),
    postcssurl({
      url: 'inline',
    }),
  ],
}

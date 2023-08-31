const PrefixWrap = require('postcss-prefixwrap')

module.exports = {
  plugins: [
    PrefixWrap('div#fmi-warnings div', {
      ignoredSelectors: ['#fmi-warnings'],
    }),
  ],
}

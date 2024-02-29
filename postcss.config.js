import PrefixWrap from 'postcss-prefixwrap'
import postcssurl from 'postcss-url'

export default {
  plugins: [
    PrefixWrap('div#fmi-warnings div', {
      ignoredSelectors: ['#fmi-warnings'],
    }),
    postcssurl({
      url: 'inline',
    }),
  ],
}

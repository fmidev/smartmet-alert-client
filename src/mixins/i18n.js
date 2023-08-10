import en from '../locales/en.json'
import fi from '../locales/fi.json'
import sv from '../locales/sv.json'

export default {
  methods: {
    t(key) {
      if (this.language == null || key == null) {
        return ''
      }
      switch (this.language) {
        case 'en':
          return en[key] ?? ''
        case 'fi':
          return fi[key] ?? ''
        case 'sv':
          return sv[key] ?? ''
        default:
          return ''
      }
    },
  },
}

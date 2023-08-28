import * as DOMPurify from 'dompurify'

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
          return DOMPurify.sanitize(en[key]) ?? ''
        case 'fi':
          return DOMPurify.sanitize(fi[key]) ?? ''
        case 'sv':
          return DOMPurify.sanitize(sv[key]) ?? ''
        default:
          return ''
      }
    },
  },
}

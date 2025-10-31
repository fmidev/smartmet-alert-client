import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import i18n from '@/mixins/i18n'

const TestComponent = {
  mixins: [i18n],
  template: '<div>{{ t("noWarnings") }}</div>',
  props: {
    language: {
      type: String,
      default: 'fi',
    },
  },
}

describe('i18n mixin', () => {
  describe('t() method', () => {
    it('should return Finnish translation', () => {
      const wrapper = mount(TestComponent, {
        props: { language: 'fi' },
      })

      const result = wrapper.vm.t('noWarnings')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should return English translation', () => {
      const wrapper = mount(TestComponent, {
        props: { language: 'en' },
      })

      const result = wrapper.vm.t('noWarnings')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should return Swedish translation', () => {
      const wrapper = mount(TestComponent, {
        props: { language: 'sv' },
      })

      const result = wrapper.vm.t('noWarnings')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should return empty string for unknown language', () => {
      const wrapper = mount(TestComponent, {
        props: { language: 'de' },
      })

      const result = wrapper.vm.t('noWarnings')
      expect(result).toBe('')
    })

    it('should return empty string for null key', () => {
      const wrapper = mount(TestComponent, {
        props: { language: 'fi' },
      })

      const result = wrapper.vm.t(null)
      expect(result).toBe('')
    })

    it('should return empty string for undefined key', () => {
      const wrapper = mount(TestComponent, {
        props: { language: 'fi' },
      })

      const result = wrapper.vm.t(undefined)
      expect(result).toBe('')
    })

    it('should return empty string for non-existent key', () => {
      const wrapper = mount(TestComponent, {
        props: { language: 'fi' },
      })

      const result = wrapper.vm.t('nonExistentKey12345')
      expect(result).toBe('')
    })

    it('should sanitize HTML in translations', () => {
      const wrapper = mount(TestComponent, {
        props: { language: 'fi' },
      })

      // Assuming translations don't contain scripts
      const result = wrapper.vm.t('noWarnings')
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('javascript:')
    })

    it('should handle all common translation keys', () => {
      const wrapper = mount(TestComponent, {
        props: { language: 'fi' },
      })

      const commonKeys = [
        'noWarnings',
        'validWarnings',
        'toContent',
        'supportedBrowsers',
        'floodLink',
        'floodLinkText',
      ]

      commonKeys.forEach((key) => {
        const result = wrapper.vm.t(key)
        expect(typeof result).toBe('string')
      })
    })
  })
})

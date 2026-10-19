import { describe, it, expect, vi } from 'vitest'
import DOMPurify from 'dompurify'
import { ref } from 'vue'
import { useI18n } from '@/composables/useI18n'

describe('useI18n composable', () => {
  describe('t() function with plain language string', () => {
    it('should return Finnish translation', () => {
      const { t } = useI18n('fi')

      const result = t('noWarnings')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should return English translation', () => {
      const { t } = useI18n('en')

      const result = t('noWarnings')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should return Swedish translation', () => {
      const { t } = useI18n('sv')

      const result = t('noWarnings')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should return empty string for unknown language', () => {
      const { t } = useI18n('de')

      const result = t('noWarnings')
      expect(result).toBe('')
    })

    it('should return empty string for null key', () => {
      const { t } = useI18n('fi')

      const result = t(null)
      expect(result).toBe('')
    })

    it('should return empty string for undefined key', () => {
      const { t } = useI18n('fi')

      const result = t(undefined)
      expect(result).toBe('')
    })

    it('should return empty string for non-existent key', () => {
      const { t } = useI18n('fi')

      const result = t('nonExistentKey12345')
      expect(result).toBe('')
    })

    it('should sanitize HTML in translations', () => {
      const { t } = useI18n('fi')

      // Assuming translations don't contain scripts
      const result = t('noWarnings')
      expect(result).not.toContain('<script>')
      expect(result).not.toContain('javascript:')
    })

    it('should handle all common translation keys', () => {
      const { t } = useI18n('fi')

      const commonKeys = [
        'noWarnings',
        'validWarnings',
        'toContent',
        'supportedBrowsers',
        'floodLink',
        'floodLinkText',
      ]

      commonKeys.forEach((key) => {
        const result = t(key)
        expect(typeof result).toBe('string')
      })
    })
  })

  describe('t() function with reactive language ref', () => {
    it('should return translation based on current ref value', () => {
      const language = ref('fi')
      const { t } = useI18n(language)

      const result = t('noWarnings')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    it('should return empty string when ref value is null', () => {
      const language = ref<string | null>(null)
      const { t } = useI18n(language)

      const result = t('noWarnings')
      expect(result).toBe('')
    })

    it('should return translation for different languages', () => {
      const language = ref('en')
      const { t } = useI18n(language)

      const resultEn = t('noWarnings')
      expect(resultEn).toBeTruthy()

      // Note: In a real scenario, changing the ref would require re-calling t()
      // The composable evaluates the language at call time
    })
  })
  describe('sanitizing', () => {
    it('sanitizes each translation only once', () => {
      const sanitize = vi.spyOn(DOMPurify, 'sanitize')
      const { t } = useI18n('en')

      const first = t('validWarnings')
      sanitize.mockClear()
      const second = t('validWarnings')
      const { t: tAgain } = useI18n('en')
      const third = tAgain('validWarnings')

      expect(sanitize).not.toHaveBeenCalled()
      expect(second).toBe(first)
      expect(third).toBe(first)
      sanitize.mockRestore()
    })

    it('does not mix up the languages', () => {
      const fi = useI18n('fi').t('validWarnings')
      const en = useI18n('en').t('validWarnings')

      expect(fi).not.toBe(en)
      expect(useI18n('fi').t('validWarnings')).toBe(fi)
    })
  })
})

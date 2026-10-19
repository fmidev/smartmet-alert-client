/**
 * Internationalization composable
 *
 * Provides translation function for the alert client.
 */

import DOMPurify from 'dompurify'
import { isRef, type MaybeRef } from 'vue'
import type { Language } from '@/types'

import en from '@/locales/en.json'
import fi from '@/locales/fi.json'
import sv from '@/locales/sv.json'

type TranslationKey = keyof typeof fi | keyof typeof en | keyof typeof sv

const translations: Record<Language, Record<string, string>> = {
  en,
  fi,
  sv,
}

// Sanitizing is slow and the translations are static, so each translation is
// sanitized only once
const sanitized: Record<string, Map<string, string>> = {
  en: new Map(),
  fi: new Map(),
  sv: new Map(),
}

export interface UseI18nReturn {
  t: (key: string | null | undefined) => string
}

/**
 * i18n composable for translations
 *
 * @param language - Language code, can be a ref or plain string
 * @returns Object with translation function t()
 */
export function useI18n(
  language: MaybeRef<Language | string | null | undefined>
): UseI18nReturn {
  /**
   * Translate a key to the current language
   * Returns empty string if language or key is not set
   * Sanitizes output with DOMPurify to prevent XSS
   */
  function t(key: string | null | undefined): string {
    const langValue = isRef(language) ? language.value : language

    if (langValue == null || key == null) {
      return ''
    }

    const lang = langValue as Language
    const translationMap = translations[lang]

    if (!translationMap) {
      return ''
    }

    const cache = sanitized[lang] as Map<string, string>
    const cached = cache.get(key)
    if (cached !== undefined) {
      return cached
    }

    const translation = translationMap[key as TranslationKey]
    const result = translation ? DOMPurify.sanitize(translation) : ''
    cache.set(key, result)
    return result
  }

  return {
    t,
  }
}

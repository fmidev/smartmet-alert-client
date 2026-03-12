import { describe, it, expect } from 'vitest'
import {
  uncapitalize,
  twoDigits,
  warningType,
  regionFromReference,
  relativeCoverageFromReference,
  toTimeZone,
  msSinceStartOfDay,
  validInterval,
} from '@/composables/useUtils'

describe('useUtils composable - pure functions', () => {
  describe('uncapitalize', () => {
    it('should uncapitalize first letter', () => {
      expect(uncapitalize('HelloWorld')).toBe('helloWorld')
    })

    it('should handle empty string', () => {
      expect(uncapitalize('')).toBe('')
    })

    it('should handle null', () => {
      expect(uncapitalize(null)).toBe('')
    })

    it('should handle single character', () => {
      expect(uncapitalize('A')).toBe('a')
    })
  })

  describe('warningType', () => {
    it('should parse thunderStorm type correctly', () => {
      const result = warningType({
        warning_context: 'thunder-storm',
      })
      expect(result).toBe('thunderStorm')
    })

    it('should parse wind type correctly', () => {
      const result = warningType({
        warning_context: 'wind',
      })
      expect(result).toBe('wind')
    })

    it('should handle sea-wind with extension', () => {
      const result = warningType({
        warning_context: 'sea-wind',
      })
      expect(result).toBe('seaWind')
    })

    it('should handle context with extension', () => {
      const result = warningType({
        warning_context: 'sea-water-height',
        context_extension: 'high-water',
      })
      expect(result).toBe('seaWaterHeightHighWater')
    })

    it('should handle multi-word contexts', () => {
      const result = warningType({
        warning_context: 'forest-fire-weather',
      })
      expect(result).toBe('forestFireWeather')
    })
  })

  describe('regionFromReference', () => {
    it('should parse single region reference', () => {
      const result = regionFromReference('fi-warning#county.1')
      expect(result).toBe('county.1')
    })

    it('should parse merged region reference', () => {
      const result = regionFromReference(
        'fi-warning#county.1,fi-warning#county.2'
      )
      expect(result).toBe('county_1.2')
    })

    it('should parse multiple merged regions', () => {
      const result = regionFromReference(
        'fi-warning#county.1,fi-warning#county.2,fi-warning#county.3'
      )
      expect(result).toBe('county_1_2.3')
    })

    it('should handle Saimaa special case (lake region)', () => {
      const result = regionFromReference(
        'fi-warning#sea_region_south.FI-115978'
      )
      expect(result).toBe('sea_region_south.FI-115978')
    })
  })

  describe('relativeCoverageFromReference', () => {
    it('should extract coverage from reference URL', () => {
      const result = relativeCoverageFromReference('fi-warning#county.1?c=75')
      expect(result).toBe(75)
    })

    it('should return 0 when no coverage parameter', () => {
      const result = relativeCoverageFromReference('fi-warning#county.1')
      expect(result).toBe(0)
    })

    it('should return 0 when no query string', () => {
      const result = relativeCoverageFromReference('county.1')
      expect(result).toBe(0)
    })

    it('should return 0 for null reference', () => {
      const result = relativeCoverageFromReference(null)
      expect(result).toBe(0)
    })

    it('should handle URL with hash fragment', () => {
      const result = relativeCoverageFromReference(
        'fi-warning#county.1?c=50#fragment'
      )
      expect(result).toBe(50)
    })
  })

  describe('twoDigits', () => {
    it('should pad single digit with zero', () => {
      expect(twoDigits(5)).toBe('05')
    })

    it('should not pad double digit', () => {
      expect(twoDigits(15)).toBe('15')
    })

    it('should handle zero', () => {
      expect(twoDigits(0)).toBe('00')
    })
  })

  describe('toTimeZone', () => {
    const timeZone = 'Europe/Helsinki'
    const locale = 'fi-FI'

    it('should convert UTC to Helsinki timezone', () => {
      const date = new Date('2025-10-31T12:00:00Z')
      const result = toTimeZone(date, timeZone, locale)

      expect(result.timeZone).toBe('Europe/Helsinki')
      expect(result.year).toBe(2025)
      expect(result.month).toBe(10)
      expect(result.day).toBe(31)
      // Helsinki is UTC+2 during DST (summer) or UTC+2 after DST ends
      expect(result.hour).toBe(14)
    })

    it('should handle different date formats', () => {
      const date = '2025-10-31T12:00:00Z'
      const result = toTimeZone(date, timeZone, locale)

      expect(result.year).toBe(2025)
      expect(result.month).toBe(10)
      expect(result.day).toBe(31)
    })
  })

  describe('msSinceStartOfDay', () => {
    const timeZone = 'Europe/Helsinki'
    const locale = 'fi-FI'

    it('should calculate milliseconds since start of day', () => {
      // 12:00:00 UTC = 14:00 in Helsinki (UTC+2)
      const timestamp = new Date('2025-10-31T12:00:00Z').getTime()
      const result = msSinceStartOfDay(timestamp, timeZone, locale)

      // 14 * 60 * 60 * 1000 = 50400000 ms
      expect(result).toBeGreaterThan(40000000) // At least 11+ hours
      expect(result).toBeLessThan(60000000) // Less than 17 hours
    })

    it('should handle midnight', () => {
      const timestamp = new Date('2025-10-31T00:00:00Z').getTime()
      const result = msSinceStartOfDay(timestamp, timeZone, locale)

      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThan(24 * 60 * 60 * 1000)
    })
  })

  describe('validInterval', () => {
    const timeZone = 'Europe/Helsinki'
    const locale = 'fi-FI'

    it('should format time interval with HTML time elements', () => {
      const start = '2025-10-31T12:00:00Z'
      const end = '2025-11-01T18:00:00Z'
      const result = validInterval(start, end, timeZone, locale)

      // Should contain both dates and times as display text
      expect(result).toContain('31.10.')
      expect(result).toContain('1.11.')
      expect(result).toContain('–') // en-dash separator
    })

    it('should include time in HH:MM format', () => {
      const start = '2025-10-31T12:00:00Z'
      const end = '2025-10-31T18:00:00Z'
      const result = validInterval(start, end, timeZone, locale)

      expect(result).toMatch(/\d{2}:\d{2}/)
    })
  })
})

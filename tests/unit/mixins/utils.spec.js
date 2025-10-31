import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import utils from '@/mixins/utils'
import config from '@/mixins/config'
import geojsonsvg from '@/mixins/geojsonsvg'
import i18n from '@/mixins/i18n'
import {
  mockWeatherWarning,
  mockThunderStormWarning,
  mockSeaWindWarning,
  mockFloodWarning,
} from '../../fixtures/mockWarningData'

// Helper component to test mixins
const TestComponent = {
  mixins: [utils, config, geojsonsvg, i18n],
  template: '<div></div>',
  props: {
    currentTime: {
      type: Number,
      default: Date.now(),
    },
    startFrom: {
      type: String,
      default: '',
    },
    dailyWarningTypes: {
      type: Array,
      default: () => [],
    },
    geometryId: {
      type: Number,
      default: 2021,
    },
    visibleWarnings: {
      type: Array,
      default: () => [],
    },
    language: {
      type: String,
      default: 'fi',
    },
  },
  data() {
    return {
      timeOffset: 0,
      updatedAt: null,
      warnings: {},
      coverageRegions: {},
      coverageWarnings: [],
      index: 0,
      size: 'Large',
      strokeWidth: 1,
      theme: 'light-theme',
    }
  },
}

describe('utils mixin', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(TestComponent, {
      props: {
        currentTime: new Date('2025-10-31T12:00:00Z').getTime(),
      },
    })
  })

  describe('uncapitalize', () => {
    it('should uncapitalize first letter', () => {
      expect(wrapper.vm.uncapitalize('HelloWorld')).toBe('helloWorld')
    })

    it('should handle empty string', () => {
      expect(wrapper.vm.uncapitalize('')).toBe('')
    })

    it('should handle null', () => {
      expect(wrapper.vm.uncapitalize(null)).toBe('')
    })

    it('should handle single character', () => {
      expect(wrapper.vm.uncapitalize('A')).toBe('a')
    })
  })

  describe('warningType', () => {
    it('should parse thunderStorm type correctly', () => {
      const result = wrapper.vm.warningType({
        warning_context: 'thunder-storm',
      })
      expect(result).toBe('thunderStorm')
    })

    it('should parse wind type correctly', () => {
      const result = wrapper.vm.warningType({
        warning_context: 'wind',
      })
      expect(result).toBe('wind')
    })

    it('should handle sea-wind with extension', () => {
      const result = wrapper.vm.warningType({
        warning_context: 'sea-wind',
      })
      expect(result).toBe('seaWind')
    })

    it('should handle context with extension', () => {
      const result = wrapper.vm.warningType({
        warning_context: 'sea-water-height',
        context_extension: 'high-water',
      })
      expect(result).toBe('seaWaterHeightHighWater')
    })

    it('should handle multi-word contexts', () => {
      const result = wrapper.vm.warningType({
        warning_context: 'forest-fire-weather',
      })
      expect(result).toBe('forestFireWeather')
    })
  })

  describe('regionFromReference', () => {
    it('should parse single region reference', () => {
      const result = wrapper.vm.regionFromReference('fi-warning#county.1')
      expect(result).toBe('county.1')
    })

    it('should parse merged region reference', () => {
      const result = wrapper.vm.regionFromReference(
        'fi-warning#county.1,fi-warning#county.2'
      )
      expect(result).toBe('county_1.2')
    })

    it('should parse multiple merged regions', () => {
      const result = wrapper.vm.regionFromReference(
        'fi-warning#county.1,fi-warning#county.2,fi-warning#county.3'
      )
      expect(result).toBe('county_1_2.3')
    })

    it('should handle Saimaa special case (lake region)', () => {
      const result = wrapper.vm.regionFromReference(
        'fi-warning#sea_region_south.FI-115978'
      )
      expect(result).toBe('sea_region_south.FI-115978')
    })
  })

  describe('relativeCoverageFromReference', () => {
    it('should extract coverage from reference URL', () => {
      const result = wrapper.vm.relativeCoverageFromReference(
        'fi-warning#county.1?c=75'
      )
      expect(result).toBe(75)
    })

    it('should return 0 when no coverage parameter', () => {
      const result = wrapper.vm.relativeCoverageFromReference(
        'fi-warning#county.1'
      )
      expect(result).toBe(0)
    })

    it('should return 0 when no query string', () => {
      const result = wrapper.vm.relativeCoverageFromReference('county.1')
      expect(result).toBe(0)
    })

    it('should return 0 for null reference', () => {
      const result = wrapper.vm.relativeCoverageFromReference(null)
      expect(result).toBe(0)
    })

    it('should handle URL with hash fragment', () => {
      const result = wrapper.vm.relativeCoverageFromReference(
        'fi-warning#county.1?c=50#fragment'
      )
      expect(result).toBe(50)
    })
  })

  describe('twoDigits', () => {
    it('should pad single digit with zero', () => {
      expect(wrapper.vm.twoDigits(5)).toBe('05')
    })

    it('should not pad double digit', () => {
      expect(wrapper.vm.twoDigits(15)).toBe('15')
    })

    it('should handle zero', () => {
      expect(wrapper.vm.twoDigits(0)).toBe('00')
    })
  })

  describe('text', () => {
    it('should return physical value for sea-wind', () => {
      const result = wrapper.vm.text({
        warning_context: 'sea-wind',
        physical_value: '15',
      })
      expect(result).toBe('15')
    })

    it('should return empty string for other contexts', () => {
      const result = wrapper.vm.text({
        warning_context: 'wind',
        physical_value: '20',
      })
      expect(result).toBe('')
    })
  })

  describe('toTimeZone', () => {
    it('should convert UTC to Helsinki timezone', () => {
      const date = new Date('2025-10-31T12:00:00Z')
      const result = wrapper.vm.toTimeZone(date)

      expect(result.timeZone).toBe('Europe/Helsinki')
      expect(result.year).toBe(2025)
      expect(result.month).toBe(10)
      expect(result.day).toBe(31)
      // Helsinki is UTC+2 during DST (summer) or UTC+3 during winter
      // Oct 31 is after DST ends, so it should be UTC+2
      expect(result.hour).toBe(14)
    })

    it('should handle different date formats', () => {
      const date = '2025-10-31T12:00:00Z'
      const result = wrapper.vm.toTimeZone(date)

      expect(result.year).toBe(2025)
      expect(result.month).toBe(10)
      expect(result.day).toBe(31)
    })
  })

  describe('msSinceStartOfDay', () => {
    it('should calculate milliseconds since start of day', () => {
      // 12:00:00 = 12 * 60 * 60 * 1000 = 43200000 ms
      const timestamp = new Date('2025-10-31T12:00:00Z').getTime()
      const result = wrapper.vm.msSinceStartOfDay(timestamp)

      // In Helsinki timezone (UTC+2), 12:00 UTC = 14:00 local
      // 14 * 60 * 60 * 1000 = 50400000 ms
      expect(result).toBeGreaterThan(40000000) // At least 11+ hours
      expect(result).toBeLessThan(60000000) // Less than 17 hours
    })

    it('should handle midnight', () => {
      const timestamp = new Date('2025-10-31T00:00:00Z').getTime()
      const result = wrapper.vm.msSinceStartOfDay(timestamp)

      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThan(24 * 60 * 60 * 1000)
    })
  })

  describe('validInterval', () => {
    it('should format time interval correctly', () => {
      const start = '2025-10-31T12:00:00Z'
      const end = '2025-11-01T18:00:00Z'
      const result = wrapper.vm.validInterval(start, end)

      // Should contain both dates and times
      expect(result).toContain('31.10.')
      expect(result).toContain('1.11.')
      expect(result).toContain('–') // en-dash separator
    })

    it('should include time in HH:MM format', () => {
      const start = '2025-10-31T12:00:00Z'
      const end = '2025-10-31T18:00:00Z'
      const result = wrapper.vm.validInterval(start, end)

      expect(result).toMatch(/\d{2}:\d{2}/)
    })
  })

  describe('effectiveDays', () => {
    it('should return array of 5 boolean values', () => {
      const start = '2025-10-31T12:00:00Z'
      const end = '2025-11-01T12:00:00Z'
      const result = wrapper.vm.effectiveDays(start, end, false)

      expect(result).toHaveLength(5)
      expect(result.every((val) => typeof val === 'boolean')).toBe(true)
    })

    it('should mark first day as effective for current warning', () => {
      const now = new Date('2025-10-31T12:00:00Z').getTime()
      wrapper.vm.updatedAt = now

      const start = '2025-10-31T08:00:00Z'
      const end = '2025-10-31T20:00:00Z'
      const result = wrapper.vm.effectiveDays(start, end, false)

      expect(result[0]).toBe(true)
    })

    it('should mark no days for past warning', () => {
      const now = new Date('2025-10-31T12:00:00Z').getTime()
      wrapper.vm.updatedAt = now

      const start = '2025-10-29T08:00:00Z'
      const end = '2025-10-29T20:00:00Z'
      const result = wrapper.vm.effectiveDays(start, end, false)

      expect(result.every((val) => val === false)).toBe(true)
    })

    it('should mark multiple days for long warning', () => {
      const now = new Date('2025-10-31T12:00:00Z').getTime()
      wrapper.vm.updatedAt = now

      const start = '2025-10-31T08:00:00Z'
      const end = '2025-11-03T20:00:00Z'
      const result = wrapper.vm.effectiveDays(start, end, false)

      const effectiveDays = result.filter((val) => val === true)
      expect(effectiveDays.length).toBeGreaterThan(1)
    })
  })

  describe('createWeatherWarning', () => {
    it('should create wind warning object', () => {
      const result = wrapper.vm.createWeatherWarning(mockWeatherWarning)

      expect(result).toMatchObject({
        type: 'wind',
        id: 'test-warning-wind-1',
        severity: 3,
        direction: 180, // 270 - 90 for wind
        value: 25,
      })
      expect(result.effectiveDays).toHaveLength(5)
      expect(result.regions).toHaveProperty('county.1')
    })

    it('should create thunder storm warning object', () => {
      const result = wrapper.vm.createWeatherWarning(mockThunderStormWarning)

      expect(result).toMatchObject({
        type: 'thunderStorm',
        id: 'test-warning-thunder-1',
        severity: 4,
        direction: 0,
      })
    })

    it('should create sea wind warning with adjusted severity', () => {
      const levelOneSeaWind = {
        ...mockSeaWindWarning,
        properties: {
          ...mockSeaWindWarning.properties,
          severity: 'level-1',
        },
      }
      const result = wrapper.vm.createWeatherWarning(levelOneSeaWind)

      // Level-1 sea wind gets severity bumped by 1
      expect(result.severity).toBe(2)
      expect(result.type).toBe('seaWind')
    })

    it('should set text for sea wind warnings', () => {
      const result = wrapper.vm.createWeatherWarning(mockSeaWindWarning)

      expect(result.text).toBe('15')
    })

    it('should include info in all languages', () => {
      const result = wrapper.vm.createWeatherWarning(mockWeatherWarning)

      expect(result.info).toHaveProperty('fi')
      expect(result.info).toHaveProperty('sv')
      expect(result.info).toHaveProperty('en')
      expect(result.info.fi).toBe('Kovaa tuulta')
    })

    it('should initialize empty coverages', () => {
      const result = wrapper.vm.createWeatherWarning(mockWeatherWarning)

      expect(result.coveragesLarge).toEqual([])
      expect(result.coveragesSmall).toEqual([])
      expect(result.covRegions).toBeInstanceOf(Map)
      expect(result.covRegions.size).toBe(0)
    })
  })

  describe('createFloodWarning', () => {
    it('should create flood warning object', () => {
      const result = wrapper.vm.createFloodWarning(mockFloodWarning)

      expect(result).toMatchObject({
        type: 'floodLevel',
        id: 'test-warning-flood-1',
        severity: 3, // Severe = 3
        direction: 0,
        value: 0,
        text: '',
      })
    })

    it('should parse encoded description', () => {
      const result = wrapper.vm.createFloodWarning(mockFloodWarning)

      expect(result.info).toHaveProperty('fi')
      expect(result.info.fi).toBe('Tulvavaara')
    })

    it('should extract language from properties', () => {
      const result = wrapper.vm.createFloodWarning(mockFloodWarning)

      expect(result.info).toHaveProperty('fi')
    })

    it('should handle different severity levels', () => {
      const minorFlood = {
        ...mockFloodWarning,
        properties: {
          ...mockFloodWarning.properties,
          severity: 'Minor',
        },
      }
      const result = wrapper.vm.createFloodWarning(minorFlood)

      expect(result.severity).toBe(1)
    })

    it('should include flood link information', () => {
      const result = wrapper.vm.createFloodWarning(mockFloodWarning)

      expect(result.link).toBeDefined()
      expect(result.linkText).toBeDefined()
    })
  })

  describe('isValid', () => {
    it('should validate weather warning with level-2 severity', () => {
      const result = wrapper.vm.isValid(mockWeatherWarning)
      expect(result).toBe(true)
    })

    it('should validate sea wind with level-1 severity', () => {
      const result = wrapper.vm.isValid(mockSeaWindWarning)
      expect(result).toBe(true)
    })

    it('should validate flood warning', () => {
      const result = wrapper.vm.isValid(mockFloodWarning)
      expect(result).toBe(true)
    })

    it('should reject warning without properties', () => {
      const result = wrapper.vm.isValid({ type: 'Feature' })
      expect(result).toBe(false)
    })

    it('should reject warning with invalid region', () => {
      const invalidWarning = {
        ...mockWeatherWarning,
        properties: {
          ...mockWeatherWarning.properties,
          reference: 'fi-warning#nonexistent.999',
        },
      }
      const result = wrapper.vm.isValid(invalidWarning)
      expect(result).toBe(false)
    })

    it('should reject warning with level-1 severity (except sea-wind)', () => {
      const level1Warning = {
        ...mockWeatherWarning,
        properties: {
          ...mockWeatherWarning.properties,
          severity: 'level-1',
        },
      }
      const result = wrapper.vm.isValid(level1Warning)
      expect(result).toBe(false)
    })
  })

  describe('createDays', () => {
    it('should create 5 days', () => {
      wrapper.vm.updatedAt = new Date('2025-10-31T12:00:00Z').getTime()
      const result = wrapper.vm.createDays({})

      expect(result).toHaveLength(5)
    })

    it('should include date information', () => {
      wrapper.vm.updatedAt = new Date('2025-10-31T12:00:00Z').getTime()
      const result = wrapper.vm.createDays({})

      const firstDay = result[0]
      expect(firstDay).toHaveProperty('weekdayName')
      expect(firstDay).toHaveProperty('day')
      expect(firstDay).toHaveProperty('month')
      expect(firstDay).toHaveProperty('year')
      expect(firstDay.day).toBe(31)
      expect(firstDay.month).toBe(10)
      expect(firstDay.year).toBe(2025)
    })

    it('should include updated time', () => {
      wrapper.vm.updatedAt = new Date('2025-10-31T12:00:00Z').getTime()
      const result = wrapper.vm.createDays({})

      const firstDay = result[0]
      expect(firstDay.updatedDate).toMatch(/31\.10\.2025/)
      expect(firstDay.updatedTime).toMatch(/\d{2}:\d{2}/)
    })

    it('should calculate maximum severity per day', () => {
      wrapper.vm.updatedAt = new Date('2025-10-31T12:00:00Z').getTime()

      const warnings = {
        'warning-1': {
          effectiveDays: [true, true, false, false, false],
          severity: 3,
        },
        'warning-2': {
          effectiveDays: [true, false, false, false, false],
          severity: 4,
        },
      }

      const result = wrapper.vm.createDays(warnings)

      expect(result[0].severity).toBe(4) // Max of 3 and 4
      expect(result[1].severity).toBe(3)
      expect(result[2].severity).toBe(0)
    })
  })

  describe('getMaxSeverities', () => {
    it('should return max severity per warning type', () => {
      const warnings = {
        'warning-1': {
          type: 'wind',
          severity: 3,
          effectiveDays: [true, false, false, false, false],
        },
        'warning-2': {
          type: 'wind',
          severity: 2,
          effectiveDays: [true, false, false, false, false],
        },
        'warning-3': {
          type: 'thunderStorm',
          severity: 4,
          effectiveDays: [true, false, false, false, false],
        },
      }

      const result = wrapper.vm.getMaxSeverities(warnings)

      expect(result).toEqual({
        wind: 3,
        thunderStorm: 4,
      })
    })

    it('should ignore warnings not effective any day', () => {
      const warnings = {
        'warning-1': {
          type: 'wind',
          severity: 3,
          effectiveDays: [false, false, false, false, false],
        },
      }

      const result = wrapper.vm.getMaxSeverities(warnings)

      expect(result).toEqual({})
    })
  })

  describe('createLegend', () => {
    it('should create legend sorted by severity', () => {
      const severities = {
        wind: 2,
        thunderStorm: 4,
        rain: 3,
      }

      const result = wrapper.vm.createLegend(severities)

      expect(result).toHaveLength(3)
      expect(result[0].severity).toBe(4)
      expect(result[1].severity).toBe(3)
      expect(result[2].severity).toBe(2)
    })

    it('should set all warnings as visible', () => {
      const severities = {
        wind: 3,
        rain: 2,
      }

      const result = wrapper.vm.createLegend(severities)

      expect(result.every((item) => item.visible === true)).toBe(true)
    })

    it('should include warning type', () => {
      const severities = {
        wind: 3,
      }

      const result = wrapper.vm.createLegend(severities)

      expect(result[0]).toHaveProperty('type', 'wind')
      expect(result[0]).toHaveProperty('severity', 3)
    })
  })
})

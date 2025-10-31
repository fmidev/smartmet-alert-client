import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { mockWarningsData } from '../fixtures/mockWarningData'
import utils from '@/mixins/utils'
import config from '@/mixins/config'
import geojsonsvg from '@/mixins/geojsonsvg'
import i18n from '@/mixins/i18n'

const TestComponent = {
  mixins: [utils, config, geojsonsvg, i18n],
  template: '<div></div>',
  props: {
    currentTime: {
      type: Number,
      default: Date.now(),
    },
    geometryId: {
      type: Number,
      default: 2021,
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
      visibleWarnings: [],
      startFrom: '',
      dailyWarningTypes: [],
      staticDays: true,
      errors: [],
    }
  },
  methods: {
    handleError(error) {
      if (!this.errors.includes(error)) {
        this.errors.push(error)
      }
    },
    onDataError() {
      // Mock error handler
    },
  },
}

describe('Warning data flow integration', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(TestComponent, {
      props: {
        currentTime: new Date('2025-10-31T12:00:00Z').getTime(),
      },
    })
  })

  describe('Complete warning processing', () => {
    it('should process full warning dataset', () => {
      const result = wrapper.vm.handleMapWarnings(mockWarningsData)

      expect(result).toHaveProperty('warnings')
      expect(result).toHaveProperty('days')
      expect(result).toHaveProperty('regions')
      expect(result).toHaveProperty('parents')
      expect(result).toHaveProperty('legend')
    })

    it('should create 5 days from warnings', () => {
      const result = wrapper.vm.handleMapWarnings(mockWarningsData)

      expect(result.days).toHaveLength(5)
      result.days.forEach((day) => {
        expect(day).toHaveProperty('weekdayName')
        expect(day).toHaveProperty('day')
        expect(day).toHaveProperty('month')
        expect(day).toHaveProperty('year')
        expect(day).toHaveProperty('severity')
        expect(day).toHaveProperty('updatedDate')
        expect(day).toHaveProperty('updatedTime')
      })
    })

    it('should parse weather warnings correctly', () => {
      const result = wrapper.vm.handleMapWarnings(mockWarningsData)

      const windWarning = result.warnings['test-warning-wind-1']
      expect(windWarning).toBeDefined()
      expect(windWarning.type).toBe('wind')
      expect(windWarning.severity).toBe(3)
    })

    it('should parse flood warnings correctly', () => {
      const result = wrapper.vm.handleMapWarnings(mockWarningsData)

      const floodWarning = result.warnings['test-warning-flood-1']
      expect(floodWarning).toBeDefined()
      expect(floodWarning.type).toBe('floodLevel')
      expect(floodWarning.severity).toBe(3)
    })

    it('should create legend sorted by severity', () => {
      const result = wrapper.vm.handleMapWarnings(mockWarningsData)

      expect(result.legend.length).toBeGreaterThan(0)

      // Check that legend is sorted by severity (descending)
      for (let i = 0; i < result.legend.length - 1; i++) {
        expect(result.legend[i].severity).toBeGreaterThanOrEqual(
          result.legend[i + 1].severity
        )
      }
    })

    it('should create regions with warnings', () => {
      const result = wrapper.vm.handleMapWarnings(mockWarningsData)

      expect(result.regions).toHaveLength(5)
      result.regions.forEach((day) => {
        expect(day).toHaveProperty('land')
        expect(day).toHaveProperty('sea')
        expect(Array.isArray(day.land)).toBe(true)
        expect(Array.isArray(day.sea)).toBe(true)
      })
    })

    it('should handle missing weather data gracefully', () => {
      const incompleteData = {
        weather_update_time: mockWarningsData.weather_update_time,
        flood_update_time: mockWarningsData.flood_update_time,
        // Missing weather and flood warnings
      }

      const result = wrapper.vm.handleMapWarnings(incompleteData)
      expect(result).toBeDefined()
    })

    it('should set updatedAt timestamp', () => {
      const result = wrapper.vm.handleMapWarnings(mockWarningsData)

      expect(wrapper.vm.updatedAt).toBeDefined()
      expect(typeof wrapper.vm.updatedAt).toBe('number')
      expect(wrapper.vm.updatedAt).toBeGreaterThan(0)
    })

    it('should filter out invalid warnings', () => {
      const dataWithInvalid = {
        ...mockWarningsData,
        weather_finland_active_all: {
          features: [
            ...mockWarningsData.weather_finland_active_all.features,
            {
              type: 'Feature',
              properties: {
                identifier: 'invalid-warning',
                warning_context: 'wind',
                severity: 'level-1', // Invalid for wind
                effective_from: '2025-10-31T12:00:00Z',
                effective_until: '2025-11-01T12:00:00Z',
                reference: 'fi-warning#county.1',
              },
            },
          ],
        },
      }

      const result = wrapper.vm.handleMapWarnings(dataWithInvalid)

      expect(result.warnings).not.toHaveProperty('invalid-warning')
    })
  })

  describe('Region hierarchy', () => {
    it('should handle parent-child relationships', () => {
      const result = wrapper.vm.handleMapWarnings(mockWarningsData)

      // Check that parents object is created
      expect(result.parents).toBeDefined()
      expect(typeof result.parents).toBe('object')
    })
  })

  describe('Coverage handling', () => {
    it('should process coverage data when present', () => {
      const result = wrapper.vm.handleMapWarnings(mockWarningsData)

      const coverageWarning = result.warnings['test-warning-coverage-1']
      if (coverageWarning) {
        expect(coverageWarning.covRegions).toBeInstanceOf(Map)
      }
    })
  })

  describe('Multi-language support', () => {
    it('should include info in all languages for weather warnings', () => {
      const result = wrapper.vm.handleMapWarnings(mockWarningsData)

      const windWarning = result.warnings['test-warning-wind-1']
      expect(windWarning.info).toHaveProperty('fi')
      expect(windWarning.info).toHaveProperty('sv')
      expect(windWarning.info).toHaveProperty('en')
    })

    it('should decode HTML entities in warning info', () => {
      const result = wrapper.vm.handleMapWarnings(mockWarningsData)

      const windWarning = result.warnings['test-warning-wind-1']
      // HTML entities should be decoded by he.decode
      expect(windWarning.info.fi).not.toContain('&amp;')
      expect(windWarning.info.fi).not.toContain('&lt;')
    })
  })

  describe('Time calculations', () => {
    it('should calculate effective days correctly', () => {
      const result = wrapper.vm.handleMapWarnings(mockWarningsData)

      const windWarning = result.warnings['test-warning-wind-1']
      expect(windWarning.effectiveDays).toHaveLength(5)
      expect(windWarning.effectiveDays.some((day) => day === true)).toBe(true)
    })

    it('should format valid intervals correctly', () => {
      const result = wrapper.vm.handleMapWarnings(mockWarningsData)

      const windWarning = result.warnings['test-warning-wind-1']
      expect(windWarning.validInterval).toContain('–')
      expect(windWarning.validInterval).toMatch(/\d{1,2}\.\d{1,2}\./)
    })
  })

  describe('Severity calculations', () => {
    it('should calculate day severities from warnings', () => {
      const result = wrapper.vm.handleMapWarnings(mockWarningsData)

      const firstDay = result.days[0]
      // Should have severity based on active warnings
      expect(typeof firstDay.severity).toBe('number')
      expect(firstDay.severity).toBeGreaterThanOrEqual(0)
      expect(firstDay.severity).toBeLessThanOrEqual(4)
    })

    it('should show highest severity per day', () => {
      const result = wrapper.vm.handleMapWarnings(mockWarningsData)

      // Check that severity is the max of all warnings for that day
      result.days.forEach((day, dayIndex) => {
        const warningsForDay = Object.values(result.warnings).filter(
          (warning) => warning.effectiveDays[dayIndex]
        )

        if (warningsForDay.length > 0) {
          const maxSeverity = Math.max(...warningsForDay.map((w) => w.severity))
          expect(day.severity).toBe(maxSeverity)
        } else {
          expect(day.severity).toBe(0)
        }
      })
    })
  })

  describe('Edge cases and error handling', () => {
    it('should handle warnings with some missing properties', () => {
      const incompleteData = {
        weather_update_time: '2025-10-31T12:00:00Z',
        weather_finland_active_all: {
          features: [
            {
              type: 'Feature',
              properties: {
                identifier: 'incomplete-warning',
                warning_context: 'wind',
                severity: 'level-2',
                effective_from: '2025-10-31T12:00:00Z',
                effective_until: '2025-11-01T12:00:00Z',
                reference: 'fi-warning#county.1',
                // Missing descriptions, but has essential properties
              },
              geometry: {
                type: 'Point',
                coordinates: [25.0, 60.0],
              },
            },
          ],
        },
      }

      const result = wrapper.vm.handleMapWarnings(incompleteData)

      // Should process the warning even with missing descriptions
      expect(result).toBeDefined()
      expect(result.warnings).toBeDefined()
    })

    it('should handle malformed timestamps', () => {
      const badTimestampData = {
        weather_update_time: 'invalid-timestamp',
        flood_update_time: 'also-invalid',
        weather_finland_active_all: { features: [] },
      }

      const result = wrapper.vm.handleMapWarnings(badTimestampData)
      expect(result).toBeDefined()
      expect(result.days).toHaveLength(5)
    })

    it('should handle circular references in region hierarchy', () => {
      const dataWithCircular = {
        ...mockWarningsData,
        weather_finland_active_all: {
          features: mockWarningsData.weather_finland_active_all.features.map(
            (f) => ({
              ...f,
              properties: {
                ...f.properties,
                // Create potential circular reference
                reference: f.properties.identifier,
              },
            })
          ),
        },
      }

      expect(() => {
        wrapper.vm.handleMapWarnings(dataWithCircular)
      }).not.toThrow()
    })

    it('should handle very long warning descriptions', () => {
      const longDescription = 'A'.repeat(10000)
      const dataWithLongText = {
        ...mockWarningsData,
        weather_finland_active_all: {
          features: [
            {
              ...mockWarningsData.weather_finland_active_all.features[0],
              properties: {
                ...mockWarningsData.weather_finland_active_all.features[0]
                  .properties,
                description_fi: longDescription,
                description_sv: longDescription,
                description_en: longDescription,
              },
            },
          ],
        },
      }

      const result = wrapper.vm.handleMapWarnings(dataWithLongText)
      expect(result).toBeDefined()
      expect(result.warnings).toBeDefined()
    })

    it('should handle warnings spanning across midnight', () => {
      const midnightData = {
        weather_update_time: '2025-10-31T23:00:00Z',
        weather_finland_active_all: {
          features: [
            {
              type: 'Feature',
              properties: {
                identifier: 'midnight-warning',
                warning_context: 'wind',
                severity: 'level-2',
                effective_from: '2025-10-31T23:30:00Z',
                effective_until: '2025-11-01T01:30:00Z',
                reference: 'fi-warning#county.1',
                description_fi: 'Kova tuuli',
                description_sv: 'Hårt väder',
                description_en: 'Strong wind',
              },
              geometry: {
                type: 'Point',
                coordinates: [25.0, 60.0],
              },
            },
          ],
        },
      }

      const result = wrapper.vm.handleMapWarnings(midnightData)
      expect(result.warnings['midnight-warning']).toBeDefined()
      expect(result.warnings['midnight-warning'].effectiveDays).toBeDefined()
    })

    it('should handle duplicate warning identifiers', () => {
      const duplicateData = {
        weather_update_time: '2025-10-31T12:00:00Z',
        weather_finland_active_all: {
          features: [
            mockWarningsData.weather_finland_active_all.features[0],
            mockWarningsData.weather_finland_active_all.features[0], // Duplicate
          ],
        },
      }

      const result = wrapper.vm.handleMapWarnings(duplicateData)

      // Should handle duplicates gracefully
      expect(result).toBeDefined()
      expect(Object.keys(result.warnings).length).toBeGreaterThan(0)
    })

    it('should handle special characters in warning text', () => {
      const specialCharsData = {
        weather_update_time: '2025-10-31T12:00:00Z',
        weather_finland_active_all: {
          features: [
            {
              type: 'Feature',
              properties: {
                identifier: 'special-chars-warning',
                warning_context: 'wind',
                severity: 'level-2',
                effective_from: '2025-10-31T12:00:00Z',
                effective_until: '2025-11-01T12:00:00Z',
                reference: 'fi-warning#county.1',
                description_fi:
                  'Test &lt;script&gt;alert("xss")&lt;/script&gt; &amp; special chars',
                description_sv:
                  'Test &lt;script&gt;alert("xss")&lt;/script&gt; &amp; special chars',
                description_en:
                  'Test &lt;script&gt;alert("xss")&lt;/script&gt; &amp; special chars',
              },
              geometry: {
                type: 'Point',
                coordinates: [25.0, 60.0],
              },
            },
          ],
        },
      }

      const result = wrapper.vm.handleMapWarnings(specialCharsData)
      const warning = result.warnings['special-chars-warning']

      // HTML entities should be decoded
      expect(warning.info.fi).not.toContain('&lt;')
      expect(warning.info.fi).not.toContain('&gt;')
      expect(warning.info.fi).not.toContain('&amp;')
    })
  })
})

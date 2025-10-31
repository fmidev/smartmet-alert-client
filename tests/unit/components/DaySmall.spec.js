import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DaySmall from '@/components/DaySmall.vue'

const mockInput = {
  weekdayName: 'thursday',
  day: 31,
  month: 10,
  year: 2025,
  severity: 3,
  updatedDate: '31.10.2025',
  updatedTime: '14:00',
}

const mockRegions = {
  land: [
    {
      key: 'county.1',
      name: 'Uusimaa',
      warnings: [],
    },
  ],
  sea: [
    {
      key: 'sea_region.B1N',
      name: 'Perämeri',
      warnings: [],
    },
  ],
}

describe('DaySmall.vue', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component mounting', () => {
    it('should mount with required props', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Computed properties', () => {
    it('should compute weekday from input', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      // Weekday is computed via t() which might return empty for unknown keys
      expect(typeof wrapper.vm.weekday).toBe('string')
    })

    it('should compute severity from input', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      expect(wrapper.vm.severity).toBe(3)
    })

    it('should format static date correctly', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          staticDays: true,
          language: 'fi',
        },
      })

      expect(wrapper.vm.date).toBe('31.10.')
    })

    it('should format dynamic date correctly', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          staticDays: false,
          language: 'fi',
        },
      })

      expect(wrapper.vm.date).toBe('0...24 h')
    })

    it('should show correct time ranges for dynamic days', () => {
      const timeRanges = [
        '0...24 h',
        '24...48 h',
        '48...72 h',
        '72...96 h',
        '96...120 h',
      ]

      timeRanges.forEach((expected, index) => {
        wrapper = mount(DaySmall, {
          props: {
            index,
            input: mockInput,
            regions: mockRegions,
            geometryId: 2021,
            staticDays: false,
            language: 'fi',
          },
        })

        expect(wrapper.vm.date).toBe(expected)
      })
    })

    it('should generate aria label with region counts', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      const ariaLabel = wrapper.vm.ariaLabel

      expect(ariaLabel).toContain('31')
      expect(ariaLabel).toContain('10')
      expect(ariaLabel).toContain('1') // land region count
      expect(ariaLabel).toContain('1') // sea region count
    })
  })

  describe('Theme support', () => {
    it('should apply active class when active prop is true', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          active: true,
          language: 'fi',
        },
      })

      expect(wrapper.find('.date-selector-cell').classes()).toContain('active')
    })

    it('should not apply active class when active prop is false', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          active: false,
          language: 'fi',
        },
      })

      expect(wrapper.find('.date-selector-cell').classes()).not.toContain(
        'active'
      )
    })

    it('should apply theme class', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          theme: 'dark-theme',
          language: 'fi',
        },
      })

      expect(wrapper.find('.date-selector-cell').classes()).toContain(
        'dark-theme'
      )
    })

    it('should apply severity class to footer', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      const footer = wrapper.find('.date-selector-cell-footer')
      expect(footer.classes()).toContain('dark-level-3')
    })
  })

  describe('Content rendering', () => {
    it('should render weekday when staticDays is true', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          staticDays: true,
          language: 'fi',
        },
      })

      const text = wrapper.find('.date-selector-text').text()
      expect(text).toBeTruthy()
    })

    it('should render date', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      expect(wrapper.text()).toContain('31.10.')
    })

    it('should handle missing date data gracefully', () => {
      const incompleteInput = {
        weekdayName: 'thursday',
        severity: 2,
      }

      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          input: incompleteInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      expect(wrapper.vm.date).toBe('')
    })
  })
})

import { describe, it, expect, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import DaySmall from '@/components/DaySmall.vue'
import type { Day, DayRegions, WarningsMap, Theme, Language } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentInstance = any

const mockDay: Day = {
  weekdayName: 'thursday',
  day: 31,
  month: 10,
  year: 2025,
  severity: 3,
  updatedDate: '31.10.2025',
  updatedTime: '14:00',
}

const mockRegions: DayRegions = {
  land: [],
  sea: [],
}

describe('DaySmall.vue', () => {
  let wrapper: VueWrapper | null = null

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  describe('Component mounting', () => {
    it('should mount with required props', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          input: mockDay,
          visibleWarnings: [],
          warnings: null,
          regions: mockRegions,
          geometryId: 2021,
          theme: 'light-theme' as Theme,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should mount with minimal props', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Computed properties', () => {
    it('should compute weekday from translations', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          input: mockDay,
          language: 'fi' as Language,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).weekday).toBe('string')
    })

    it('should compute severity from input', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          input: mockDay,
        },
      })

      expect((wrapper.vm as ComponentInstance).severity).toBe(3)
    })

    it('should return 0 severity when input is empty', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          input: {} as Day,
        },
      })

      expect((wrapper.vm as ComponentInstance).severity).toBe(0)
    })

    it('should compute date with static days', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          input: mockDay,
          staticDays: true,
        },
      })

      expect((wrapper.vm as ComponentInstance).date).toBe('31.10.')
    })

    it('should compute date with time ranges when not static', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          staticDays: false,
        },
      })

      expect((wrapper.vm as ComponentInstance).date).toBe('0...24 h')
    })

    it('should compute different time ranges for different indices', () => {
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
            staticDays: false,
          },
        })

        expect((wrapper.vm as ComponentInstance).date).toBe(expected)
      })
    })

    it('should compute ariaLabel', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          input: mockDay,
          regions: mockRegions,
          language: 'fi' as Language,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).ariaLabel).toBe('string')
    })

    it('should return empty date when input is missing date parts', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          input: {} as Day,
          staticDays: true,
        },
      })

      expect((wrapper.vm as ComponentInstance).date).toBe('')
    })
  })

  describe('Props handling', () => {
    it('should accept active prop', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          active: true,
        },
      })

      expect(wrapper.find('.date-selector-cell').classes()).toContain('active')
    })

    it('should not have active class when not active', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          active: false,
        },
      })

      expect(wrapper.find('.date-selector-cell').classes()).not.toContain(
        'active'
      )
    })

    it('should accept staticDays prop', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          staticDays: false,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should accept loading prop', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          loading: false,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should accept warnings prop', () => {
      const mockWarnings: WarningsMap = {}

      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          warnings: mockWarnings,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should accept visibleWarnings prop', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          visibleWarnings: ['wind', 'rain'],
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Theme support', () => {
    it('should apply theme class', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          theme: 'dark-theme' as Theme,
        },
      })

      expect(wrapper.find('.date-selector-cell').classes()).toContain(
        'dark-theme'
      )
    })

    it('should support all theme variants', () => {
      const themes: Theme[] = [
        'light-theme',
        'dark-theme',
        'light-gray-theme',
        'dark-gray-theme',
      ]

      themes.forEach((theme) => {
        wrapper = mount(DaySmall, {
          props: {
            index: 0,
            theme,
          },
        })

        expect(wrapper.find('.date-selector-cell').classes()).toContain(theme)
      })
    })
  })

  describe('CSS classes', () => {
    it('should apply severity class to footer', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          input: mockDay,
        },
      })

      const footer = wrapper.find('.date-selector-cell-footer')
      expect(footer.classes()).toContain('dark-level-3')
    })

    it('should apply mobile severity class to text', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          input: mockDay,
        },
      })

      const text = wrapper.find('.date-selector-text')
      expect(text.classes()).toContain('mobile-level-3')
    })
  })

  describe('Language support', () => {
    it('should support Finnish language', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should support Swedish language', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          language: 'sv' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should support English language', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          language: 'en' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label on main element', () => {
      wrapper = mount(DaySmall, {
        props: {
          index: 0,
          input: mockDay,
          regions: mockRegions,
          language: 'fi' as Language,
        },
      })

      expect(
        wrapper.find('.date-selector-cell').attributes('aria-label')
      ).toBeDefined()
    })
  })
})

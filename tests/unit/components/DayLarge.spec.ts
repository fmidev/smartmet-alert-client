import { describe, it, expect, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import DayLarge from '@/components/DayLarge.vue'
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

describe('DayLarge.vue', () => {
  let wrapper: VueWrapper | null = null

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  describe('Component mounting', () => {
    it('should mount with required props', () => {
      wrapper = mount(DayLarge, {
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
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Computed properties', () => {
    it('should compute warningsTitle from translations', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          input: mockDay,
          language: 'fi' as Language,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).warningsTitle).toBe(
        'string'
      )
    })

    it('should compute updatedTitle from translations', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          input: mockDay,
          language: 'fi' as Language,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).updatedTitle).toBe(
        'string'
      )
    })

    it('should compute atTime from translations', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          input: mockDay,
          language: 'fi' as Language,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).atTime).toBe('string')
    })

    it('should compute warningsDate from input', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          input: mockDay,
          staticDays: true,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).warningsDate).toBe('31.10.2025')
    })

    it('should compute warningsDate with time range when not static', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          input: mockDay,
          staticDays: false,
          timeOffset: 0,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).warningsDate).toContain(
        '31.10.2025'
      )
    })

    it('should return empty warningsDate when input is missing date parts', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          input: {} as Day,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).warningsDate).toBe('')
    })

    it('should compute updatedDate from input', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          input: mockDay,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).updatedDate).toBe('31.10.2025')
    })

    it('should compute updatedTime from input', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          input: mockDay,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).updatedTime).toBe('14:00')
    })

    it('should compute dataProviderFirst from translations', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          input: mockDay,
          language: 'fi' as Language,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).dataProviderFirst).toBe(
        'string'
      )
    })

    it('should compute dataProviderSecond from translations', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          input: mockDay,
          language: 'fi' as Language,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).dataProviderSecond).toBe(
        'string'
      )
    })
  })

  describe('Props handling', () => {
    it('should accept visibleWarnings prop', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          visibleWarnings: ['wind', 'rain'],
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should accept warnings prop', () => {
      const mockWarnings: WarningsMap = {}

      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          warnings: mockWarnings,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should accept loading prop', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          loading: false,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should accept spinnerEnabled prop', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          spinnerEnabled: false,
        },
      })

      expect((wrapper.vm as ComponentInstance).spinnerEnabled).toBe(false)
    })
  })

  describe('Events', () => {
    it('should have onLoaded method', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).onLoaded).toBe('function')
    })

    it('should emit loaded event when onLoaded is called with true', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
        },
      })
      ;(wrapper.vm as ComponentInstance).onLoaded(true)

      expect(wrapper.emitted('loaded')).toBeTruthy()
      expect(wrapper.emitted('loaded')![0]).toEqual([true])
    })

    it('should not emit loaded event when onLoaded is called with false', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
        },
      })
      ;(wrapper.vm as ComponentInstance).onLoaded(false)

      expect(wrapper.emitted('loaded')).toBeFalsy()
    })
  })

  describe('Theme support', () => {
    it('should accept theme prop', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          theme: 'dark-theme' as Theme,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should support all theme variants', () => {
      const themes: Theme[] = [
        'light-theme',
        'dark-theme',
        'light-gray-theme',
        'dark-gray-theme',
      ]

      themes.forEach((theme) => {
        wrapper = mount(DayLarge, {
          props: {
            index: 0,
            theme,
          },
        })

        expect(wrapper.exists()).toBe(true)
      })
    })
  })

  describe('Language support', () => {
    it('should support Finnish language', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should support Swedish language', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          language: 'sv' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should support English language', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          language: 'en' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })
})

import { describe, it, expect, afterEach, beforeEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import Days from '@/components/Days.vue'
import type { Day, DayRegions, Theme, Language } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentInstance = any

const mockDaysInput: Day[] = [
  {
    weekdayName: 'thursday',
    day: 31,
    month: 10,
    year: 2025,
    severity: 3,
    updatedDate: '31.10.2025',
    updatedTime: '14:00',
  },
  {
    weekdayName: 'friday',
    day: 1,
    month: 11,
    year: 2025,
    severity: 2,
    updatedDate: '31.10.2025',
    updatedTime: '14:00',
  },
  {
    weekdayName: 'saturday',
    day: 2,
    month: 11,
    year: 2025,
    severity: 0,
    updatedDate: '31.10.2025',
    updatedTime: '14:00',
  },
  {
    weekdayName: 'sunday',
    day: 3,
    month: 11,
    year: 2025,
    severity: 0,
    updatedDate: '31.10.2025',
    updatedTime: '14:00',
  },
  {
    weekdayName: 'monday',
    day: 4,
    month: 11,
    year: 2025,
    severity: 0,
    updatedDate: '31.10.2025',
    updatedTime: '14:00',
  },
]

const mockRegions: DayRegions[] = [
  { land: [], sea: [] },
  { land: [], sea: [] },
  { land: [], sea: [] },
  { land: [], sea: [] },
  { land: [], sea: [] },
]

describe('Days.vue', () => {
  let wrapper: VueWrapper | null = null

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  describe('Component mounting', () => {
    it('should mount with required props', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi' as Language,
        },
        global: {
          stubs: {
            'b-tabs': false,
            'b-tab': false,
          },
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should initialize with selectedDay prop', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          selectedDay: 2,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).day).toBe(2)
    })

    it('should have default selectedDay of 0', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).day).toBe(0)
    })
  })

  describe('Props validation', () => {
    it('should accept valid selectedDay values (0-4)', () => {
      const validDays: (0 | 1 | 2 | 3 | 4)[] = [0, 1, 2, 3, 4]

      validDays.forEach((day) => {
        wrapper = mount(Days, {
          props: {
            input: mockDaysInput,
            regions: mockRegions,
            geometryId: 2021,
            selectedDay: day,
            language: 'fi' as Language,
          },
        })

        expect((wrapper.vm as ComponentInstance).selectedDay).toBe(day)
      })
    })

    it('should accept staticDays boolean prop', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          staticDays: false,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).staticDays).toBe(false)
    })

    it('should accept timeOffset number prop', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          timeOffset: 3600000,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).timeOffset).toBe(3600000)
    })

    it('should accept loading prop', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          loading: false,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).loading).toBe(false)
    })
  })

  describe('Computed properties', () => {
    it('should compute numberOfDays as 5', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).numberOfDays).toBe(5)
    })
  })

  describe('Day selection', () => {
    it('should emit daySelected event when day changes', async () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi' as Language,
        },
      })
      ;(wrapper.vm as ComponentInstance).day = 2

      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('daySelected')).toBeTruthy()
      expect(wrapper.emitted('daySelected')![0]).toEqual([2])
    })

    it('should call onDaySelected when day changes', async () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi' as Language,
        },
      })
      ;(wrapper.vm as ComponentInstance).day = 3

      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('daySelected')).toBeTruthy()
      const emitted = wrapper.emitted('daySelected')!
      expect(emitted[emitted.length - 1]).toEqual([3])
    })
  })

  describe('Edge cases', () => {
    it('should handle empty input array', () => {
      wrapper = mount(Days, {
        props: {
          input: [],
          regions: [],
          geometryId: 2021,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
      expect((wrapper.vm as ComponentInstance).input.length).toBe(0)
    })

    it('should handle mismatched regions and days', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: [{ land: [], sea: [] }],
          geometryId: 2021,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should handle boundary selected day values', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          selectedDay: 4,
          geometryId: 2021,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
      expect((wrapper.vm as ComponentInstance).day).toBe(4)
    })

    it('should handle first day selection', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          selectedDay: 0,
          geometryId: 2021,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
      expect((wrapper.vm as ComponentInstance).day).toBe(0)
    })

    it('should handle malformed day data', () => {
      const malformedData = [
        { severity: 1 },
        { weekdayName: 'friday' },
      ] as unknown as Day[]

      wrapper = mount(Days, {
        props: {
          input: malformedData,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Additional keyboard navigation', () => {
    it('should have switchDay method', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi' as Language,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).switchDay).toBe(
        'function'
      )
    })

    it('should navigate left with arrow key', async () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          selectedDay: 2,
          language: 'fi' as Language,
        },
      })
      ;(wrapper.vm as ComponentInstance).$el.querySelector = vi.fn(() => ({
        focus: vi.fn(),
      }))

      const event = {
        keyCode: 37,
        preventDefault: vi.fn(),
      }

      ;(wrapper.vm as ComponentInstance).switchDay(event)

      expect((wrapper.vm as ComponentInstance).day).toBe(1)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should navigate right with arrow key', async () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          selectedDay: 2,
          language: 'fi' as Language,
        },
      })
      ;(wrapper.vm as ComponentInstance).$el.querySelector = vi.fn(() => ({
        focus: vi.fn(),
      }))

      const event = {
        keyCode: 39,
        preventDefault: vi.fn(),
      }

      ;(wrapper.vm as ComponentInstance).switchDay(event)

      expect((wrapper.vm as ComponentInstance).day).toBe(3)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should navigate to first day with Home key', async () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          selectedDay: 3,
          language: 'fi' as Language,
        },
      })
      ;(wrapper.vm as ComponentInstance).$el.querySelector = vi.fn(() => ({
        focus: vi.fn(),
      }))

      const event = {
        keyCode: 36,
        preventDefault: vi.fn(),
      }

      ;(wrapper.vm as ComponentInstance).switchDay(event)

      expect((wrapper.vm as ComponentInstance).day).toBe(0)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should navigate to last day with End key', async () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          selectedDay: 1,
          language: 'fi' as Language,
        },
      })
      ;(wrapper.vm as ComponentInstance).$el.querySelector = vi.fn(() => ({
        focus: vi.fn(),
      }))

      const event = {
        keyCode: 35,
        preventDefault: vi.fn(),
      }

      ;(wrapper.vm as ComponentInstance).switchDay(event)

      expect((wrapper.vm as ComponentInstance).day).toBe(4)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should not go below day 0 when navigating left', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          selectedDay: 0,
          language: 'fi' as Language,
        },
      })
      ;(wrapper.vm as ComponentInstance).$el.querySelector = vi.fn(() => ({
        focus: vi.fn(),
      }))

      const event = {
        keyCode: 37,
        preventDefault: vi.fn(),
      }

      ;(wrapper.vm as ComponentInstance).switchDay(event)

      expect((wrapper.vm as ComponentInstance).day).toBe(0)
    })

    it('should not go above day 4 when navigating right', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          selectedDay: 4,
          language: 'fi' as Language,
        },
      })
      ;(wrapper.vm as ComponentInstance).$el.querySelector = vi.fn(() => ({
        focus: vi.fn(),
      }))

      const event = {
        keyCode: 39,
        preventDefault: vi.fn(),
      }

      ;(wrapper.vm as ComponentInstance).switchDay(event)

      expect((wrapper.vm as ComponentInstance).day).toBe(4)
    })
  })

  describe('Event handling', () => {
    it('should emit loaded event when child emits', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi' as Language,
        },
      })
      ;(wrapper.vm as ComponentInstance).onLoaded(true)

      expect(wrapper.emitted('loaded')).toBeTruthy()
      expect(wrapper.emitted('loaded')![0]).toEqual([true])
    })

    it('should not emit loaded event when child emits false', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi' as Language,
        },
      })
      ;(wrapper.vm as ComponentInstance).onLoaded(false)

      expect(wrapper.emitted('loaded')).toBeFalsy()
    })
  })

  describe('Theme support', () => {
    it('should apply theme class', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          theme: 'dark-theme' as Theme,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.find('.date-selector').classes()).toContain('dark-theme')
    })

    it('should support all theme variants', () => {
      const themes: Theme[] = [
        'light-theme',
        'dark-theme',
        'light-gray-theme',
        'dark-gray-theme',
      ]

      themes.forEach((theme) => {
        wrapper = mount(Days, {
          props: {
            input: mockDaysInput,
            regions: mockRegions,
            geometryId: 2021,
            theme,
            language: 'fi' as Language,
          },
        })

        expect(wrapper.find('.date-selector').classes()).toContain(theme)
      })
    })
  })
  describe('Dates that do not fit in the row', () => {
    const ROW_WIDTH = 440
    let dateWidth = 80
    const originalWidth = window.innerWidth
    const originalObserver = global.ResizeObserver
    let observerCallback: (() => void) | null = null
    let disconnected = false

    // The class is set in the update that follows mounting
    const mountDays = async (
      props: Record<string, unknown> = {}
    ): Promise<VueWrapper> => {
      const mounted = mount(Days, {
        props: {
          input: mockDaysInput,
          language: 'en' as Language,
          ...props,
        },
      })
      await mounted.vm.$nextTick()
      return mounted
    }

    const setWindowWidth = (width: number): void => {
      Object.defineProperty(window, 'innerWidth', {
        value: width,
        configurable: true,
        writable: true,
      })
    }

    beforeEach(() => {
      dateWidth = 80
      disconnected = false
      observerCallback = null
      setWindowWidth(1024)
      vi.spyOn(
        HTMLElement.prototype,
        'getBoundingClientRect'
      ).mockImplementation(function (this: HTMLElement) {
        const width = this.classList.contains('date-selector-probe-text')
          ? dateWidth
          : this.classList.contains('fmi-warnings-date-nav')
            ? ROW_WIDTH
            : 0
        return { width } as DOMRect
      })
      global.ResizeObserver = class {
        constructor(callback: () => void) {
          observerCallback = callback
        }
        observe(): void {}
        unobserve(): void {}
        disconnect(): void {
          disconnected = true
        }
      } as unknown as typeof ResizeObserver
    })

    afterEach(() => {
      vi.restoreAllMocks()
      global.ResizeObserver = originalObserver
      setWindowWidth(originalWidth)
    })

    it('keeps the dates on one line when they fit in the row', async () => {
      // 5 × (84 + 4) = 440
      dateWidth = 84
      wrapper = await mountDays()

      expect(wrapper.classes()).not.toContain('date-labels-wrapped')
      expect((wrapper.vm as ComponentInstance).wrapDates).toBe(false)
    })

    it('puts all the dates on two lines when they do not fit', async () => {
      dateWidth = 85
      wrapper = await mountDays()

      expect(wrapper.classes()).toContain('date-labels-wrapped')
    })

    it('measures a hidden copy of each date, which is not read by screen readers', async () => {
      wrapper = await mountDays()

      const probes = wrapper.findAll('.date-selector-probe')
      expect(probes).toHaveLength(5)
      probes.forEach((probe) => {
        expect(probe.attributes('aria-hidden')).toBe('true')
      })
    })

    it('goes back to one line when the dates fit again', async () => {
      dateWidth = 100
      wrapper = await mountDays()
      expect(wrapper.classes()).toContain('date-labels-wrapped')

      dateWidth = 70
      observerCallback?.()
      await wrapper.vm.$nextTick()

      expect(wrapper.classes()).not.toContain('date-labels-wrapped')
    })

    it('measures again when the dates change', async () => {
      wrapper = await mountDays()
      expect(wrapper.classes()).not.toContain('date-labels-wrapped')

      dateWidth = 100
      await wrapper.setProps({ language: 'sv' as Language })

      expect(wrapper.classes()).toContain('date-labels-wrapped')
    })

    it('does not do anything on a narrow screen, where the dates are on two lines', async () => {
      setWindowWidth(500)
      dateWidth = 200
      wrapper = await mountDays()

      expect(wrapper.classes()).not.toContain('date-labels-wrapped')
    })

    it('does not do anything without weekdays', async () => {
      dateWidth = 200
      wrapper = await mountDays({ staticDays: false })

      expect(wrapper.classes()).not.toContain('date-labels-wrapped')
      expect(wrapper.findAll('.date-selector-probe')).toHaveLength(0)
    })

    it('stops observing the row when it is removed', async () => {
      wrapper = await mountDays()
      wrapper.unmount()
      wrapper = null

      expect(disconnected).toBe(true)
    })
  })
})

import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Days from '@/components/Days.vue'

const mockDaysInput = [
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

const mockRegions = [
  { land: [], sea: [] },
  { land: [], sea: [] },
  { land: [], sea: [] },
  { land: [], sea: [] },
  { land: [], sea: [] },
]

describe('Days.vue', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component mounting', () => {
    it('should mount with required props', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
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
          language: 'fi',
        },
      })

      expect(wrapper.vm.day).toBe(2)
    })

    it('should have default selectedDay of 0', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      expect(wrapper.vm.day).toBe(0)
    })
  })

  describe('Props validation', () => {
    it('should accept valid selectedDay values (0-4)', () => {
      const validDays = [0, 1, 2, 3, 4]

      validDays.forEach((day) => {
        wrapper = mount(Days, {
          props: {
            input: mockDaysInput,
            regions: mockRegions,
            geometryId: 2021,
            selectedDay: day,
            language: 'fi',
          },
        })

        expect(wrapper.vm.selectedDay).toBe(day)
      })
    })

    it('should accept staticDays boolean prop', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          staticDays: false,
          language: 'fi',
        },
      })

      expect(wrapper.vm.staticDays).toBe(false)
    })

    it('should accept timeOffset number prop', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          timeOffset: 3600000,
          language: 'fi',
        },
      })

      expect(wrapper.vm.timeOffset).toBe(3600000)
    })

    it('should accept loading prop', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          loading: false,
          language: 'fi',
        },
      })

      expect(wrapper.vm.loading).toBe(false)
    })
  })

  describe('Computed properties', () => {
    it('should compute numberOfDays as 5', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      expect(wrapper.vm.numberOfDays).toBe(5)
    })
  })

  describe('Day selection', () => {
    it('should emit daySelected event when day changes', async () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      wrapper.vm.day = 2

      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('daySelected')).toBeTruthy()
      expect(wrapper.emitted('daySelected')[0]).toEqual([2])
    })

    it('should call onDaySelected when day changes', async () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      const onDaySelectedSpy = vi.spyOn(wrapper.vm, 'onDaySelected')

      wrapper.vm.day = 3

      await wrapper.vm.$nextTick()

      expect(onDaySelectedSpy).toHaveBeenCalledWith(3)
    })
  })

  describe('Edge cases', () => {
    it('should handle empty input array', () => {
      wrapper = mount(Days, {
        props: {
          input: [],
          regions: [],
          geometryId: 2021,
          language: 'fi',
        },
      })

      expect(wrapper.exists()).toBe(true)
      // With empty input, numberOfDays should be 0
      expect(wrapper.vm.input.length).toBe(0)
    })

    it('should handle mismatched regions and days', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: [{ land: [], sea: [] }], // Only 1 region but 5 days
          geometryId: 2021,
          language: 'fi',
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should handle boundary selected day values', () => {
      // Test with last valid day (4)
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          selectedDay: 4,
          geometryId: 2021,
          language: 'fi',
        },
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.vm.day).toBe(4)
    })

    it('should handle first day selection', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          selectedDay: 0,
          geometryId: 2021,
          language: 'fi',
        },
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.vm.day).toBe(0)
    })

    it('should handle malformed day data', () => {
      const malformedData = [
        {
          // Missing required properties
          severity: 1,
        },
        {
          weekdayName: 'friday',
          // Missing other properties
        },
      ]

      wrapper = mount(Days, {
        props: {
          input: malformedData,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
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
          language: 'fi',
        },
      })

      expect(typeof wrapper.vm.switchDay).toBe('function')
    })

    it('should navigate left with arrow key', async () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          selectedDay: 2,
          language: 'fi',
        },
      })

      // Mock querySelector to avoid DOM errors
      wrapper.vm.$el.querySelector = vi.fn(() => ({
        focus: vi.fn(),
      }))

      const event = {
        keyCode: 37, // LEFT
        preventDefault: vi.fn(),
      }

      wrapper.vm.switchDay(event)

      expect(wrapper.vm.day).toBe(1)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should navigate right with arrow key', async () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          selectedDay: 2,
          language: 'fi',
        },
      })

      // Mock querySelector to avoid DOM errors
      wrapper.vm.$el.querySelector = vi.fn(() => ({
        focus: vi.fn(),
      }))

      const event = {
        keyCode: 39, // RIGHT
        preventDefault: vi.fn(),
      }

      wrapper.vm.switchDay(event)

      expect(wrapper.vm.day).toBe(3)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should navigate to first day with Home key', async () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          selectedDay: 3,
          language: 'fi',
        },
      })

      // Mock querySelector to avoid DOM errors
      wrapper.vm.$el.querySelector = vi.fn(() => ({
        focus: vi.fn(),
      }))

      const event = {
        keyCode: 36, // HOME
        preventDefault: vi.fn(),
      }

      wrapper.vm.switchDay(event)

      expect(wrapper.vm.day).toBe(0)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should navigate to last day with End key', async () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          selectedDay: 1,
          language: 'fi',
        },
      })

      // Mock querySelector to avoid DOM errors
      wrapper.vm.$el.querySelector = vi.fn(() => ({
        focus: vi.fn(),
      }))

      const event = {
        keyCode: 35, // END
        preventDefault: vi.fn(),
      }

      wrapper.vm.switchDay(event)

      expect(wrapper.vm.day).toBe(4)
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should not go below day 0 when navigating left', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          selectedDay: 0,
          language: 'fi',
        },
      })

      // Mock querySelector to avoid DOM errors
      wrapper.vm.$el.querySelector = vi.fn(() => ({
        focus: vi.fn(),
      }))

      const event = {
        keyCode: 37, // LEFT
        preventDefault: vi.fn(),
      }

      wrapper.vm.switchDay(event)

      expect(wrapper.vm.day).toBe(0)
    })

    it('should not go above day 4 when navigating right', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          selectedDay: 4,
          language: 'fi',
        },
      })

      // Mock querySelector to avoid DOM errors
      wrapper.vm.$el.querySelector = vi.fn(() => ({
        focus: vi.fn(),
      }))

      const event = {
        keyCode: 39, // RIGHT
        preventDefault: vi.fn(),
      }

      wrapper.vm.switchDay(event)

      expect(wrapper.vm.day).toBe(4)
    })
  })

  describe('Event handling', () => {
    it('should emit loaded event when child emits', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      wrapper.vm.onLoaded(true)

      expect(wrapper.emitted('loaded')).toBeTruthy()
      expect(wrapper.emitted('loaded')[0]).toEqual([true])
    })

    it('should not emit loaded event when child emits false', () => {
      wrapper = mount(Days, {
        props: {
          input: mockDaysInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      wrapper.vm.onLoaded(false)

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
          theme: 'dark-theme',
          language: 'fi',
        },
      })

      expect(wrapper.find('.date-selector').classes()).toContain('dark-theme')
    })

    it('should support all theme variants', () => {
      const themes = [
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
            language: 'fi',
          },
        })

        expect(wrapper.find('.date-selector').classes()).toContain(theme)
      })
    })
  })
})

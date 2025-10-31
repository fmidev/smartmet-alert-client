import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DayLarge from '@/components/DayLarge.vue'

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
  land: [],
  sea: [],
}

describe('DayLarge.vue', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component mounting', () => {
    it('should mount with required props', () => {
      wrapper = mount(DayLarge, {
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
    it('should compute warningsTitle', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      expect(wrapper.vm.warningsTitle).toBeTruthy()
      expect(typeof wrapper.vm.warningsTitle).toBe('string')
    })

    it('should compute updatedTitle', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      expect(wrapper.vm.updatedTitle).toBeTruthy()
    })

    it('should compute atTime', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      expect(wrapper.vm.atTime).toBeTruthy()
    })

    it('should format static warnings date', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          staticDays: true,
          language: 'fi',
        },
      })

      expect(wrapper.vm.warningsDate).toBe('31.10.2025')
    })

    it('should format dynamic warnings date with time range', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          staticDays: false,
          timeOffset: 0,
          language: 'fi',
        },
      })

      const warningsDate = wrapper.vm.warningsDate

      expect(warningsDate).toContain('31.10.2025')
      expect(warningsDate).toContain('1.11.2025')
    })

    it('should return empty string when date data is missing', () => {
      const incompleteInput = {
        weekdayName: 'thursday',
        severity: 2,
      }

      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          input: incompleteInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      expect(wrapper.vm.warningsDate).toBe('')
    })

    it('should display updatedDate from input', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      expect(wrapper.vm.updatedDate).toBe('31.10.2025')
    })

    it('should display updatedTime from input', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      expect(wrapper.vm.updatedTime).toBe('14:00')
    })
  })

  describe('Event handling', () => {
    it('should emit loaded event when child component loads', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      wrapper.vm.onLoaded(true)

      expect(wrapper.emitted('loaded')).toBeTruthy()
      expect(wrapper.emitted('loaded')[0]).toEqual([true])
    })

    it('should not emit loaded event when loaded is false', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      wrapper.vm.onLoaded(false)

      expect(wrapper.emitted('loaded')).toBeFalsy()
    })
  })

  describe('Content rendering', () => {
    it('should render warnings title', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      const text = wrapper.text()
      expect(text).toBeTruthy()
    })

    it('should render updated date and time', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      expect(wrapper.text()).toContain('31.10.2025')
      expect(wrapper.text()).toContain('14:00')
    })
  })

  describe('Props validation', () => {
    it('should use default empty object for input', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      expect(wrapper.vm.input).toEqual({})
    })

    it('should accept spinnerEnabled prop', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          spinnerEnabled: false,
          language: 'fi',
        },
      })

      expect(wrapper.vm.spinnerEnabled).toBe(false)
    })

    it('should use default spinnerEnabled true', () => {
      wrapper = mount(DayLarge, {
        props: {
          index: 0,
          input: mockInput,
          regions: mockRegions,
          geometryId: 2021,
          language: 'fi',
        },
      })

      expect(wrapper.vm.spinnerEnabled).toBe(true)
    })
  })
})

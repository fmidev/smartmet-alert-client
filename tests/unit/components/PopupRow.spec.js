import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import PopupRow from '@/components/PopupRow.vue'

const mockWarning = {
  type: 'wind',
  severity: 3,
  direction: 270,
  text: '15',
  interval: '14:00 – 18:00',
}

describe('PopupRow.vue', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component mounting', () => {
    it('should mount with required props', () => {
      wrapper = mount(PopupRow, {
        props: {
          input: mockWarning,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should use default empty object for input prop', () => {
      wrapper = mount(PopupRow, {
        props: {
          input: {
            type: 'rain',
            severity: 2,
          },
        },
      })

      expect(wrapper.exists()).toBe(true)
      expect(wrapper.vm.input).toBeDefined()
    })
  })

  describe('Fields mixin integration', () => {
    it('should compute typeClass from warning type', () => {
      wrapper = mount(PopupRow, {
        props: {
          input: mockWarning,
        },
      })

      expect(wrapper.vm.typeClass).toBe('wind')
    })

    it('should compute typeClass for thunderStorm', () => {
      wrapper = mount(PopupRow, {
        props: {
          input: {
            type: 'thunderStorm',
            severity: 4,
          },
        },
      })

      expect(wrapper.vm.typeClass).toBe('thunder-storm')
    })

    it('should compute rotation from direction', () => {
      wrapper = mount(PopupRow, {
        props: {
          input: mockWarning,
        },
      })

      expect(wrapper.vm.rotation).toBe(270)
    })

    it('should compute invertedRotation', () => {
      wrapper = mount(PopupRow, {
        props: {
          input: mockWarning,
        },
      })

      expect(wrapper.vm.invertedRotation).toBe(90)
    })

    it('should compute severity', () => {
      wrapper = mount(PopupRow, {
        props: {
          input: mockWarning,
        },
      })

      expect(wrapper.vm.severity).toBe(3)
    })

    it('should return 0 for invalid severity', () => {
      wrapper = mount(PopupRow, {
        props: {
          input: {
            type: 'wind',
            severity: 1,
          },
        },
      })

      expect(wrapper.vm.severity).toBe(0)
    })
  })

  describe('Content rendering', () => {
    it('should render interval text', () => {
      wrapper = mount(PopupRow, {
        props: {
          input: mockWarning,
        },
      })

      expect(wrapper.text()).toContain('14:00 – 18:00')
    })

    it('should render warning text in symbol', () => {
      wrapper = mount(PopupRow, {
        props: {
          input: mockWarning,
        },
      })

      expect(wrapper.find('.symbol-text').text()).toBe('15')
    })

    it('should render empty text when not provided', () => {
      const warningNoText = {
        type: 'rain',
        severity: 2,
        interval: '10:00 – 12:00',
      }

      wrapper = mount(PopupRow, {
        props: {
          input: warningNoText,
        },
      })

      expect(wrapper.find('.symbol-text').text()).toBe('')
    })
  })

  describe('CSS classes', () => {
    it('should apply severity level class to symbol', () => {
      wrapper = mount(PopupRow, {
        props: {
          input: mockWarning,
        },
      })

      const symbol = wrapper.find('.popup-table-symbol-cell')
      expect(symbol.classes()).toContain('level-3')
    })

    it('should apply type class to symbol', () => {
      wrapper = mount(PopupRow, {
        props: {
          input: mockWarning,
        },
      })

      const symbol = wrapper.find('.popup-table-symbol-cell')
      expect(symbol.classes()).toContain('wind')
    })

    it('should apply rotation class', () => {
      wrapper = mount(PopupRow, {
        props: {
          input: mockWarning,
        },
      })

      const symbol = wrapper.find('.popup-table-symbol-cell')
      expect(symbol.classes()).toContain('transform-rotate-270')
    })

    it('should apply inverted rotation to text', () => {
      wrapper = mount(PopupRow, {
        props: {
          input: mockWarning,
        },
      })

      const text = wrapper.find('.symbol-text')
      expect(text.classes()).toContain('transform-rotate-90')
    })

    it('should apply text level class to interval cell', () => {
      wrapper = mount(PopupRow, {
        props: {
          input: mockWarning,
        },
      })

      const textCell = wrapper.find('.popup-table-text-cell')
      expect(textCell.classes()).toContain('text-level-3')
    })

    it('should hide level-0 warnings', () => {
      const warningLevel0 = {
        type: 'wind',
        severity: 0,
      }

      wrapper = mount(PopupRow, {
        props: {
          input: warningLevel0,
        },
      })

      // Level-0 warning images should have display: none via CSS
      const symbol = wrapper.find('.popup-table-symbol-cell')
      expect(symbol.classes()).toContain('level-0')
    })
  })

  describe('Table structure', () => {
    it('should render as table row', () => {
      wrapper = mount(PopupRow, {
        props: {
          input: mockWarning,
        },
      })

      expect(wrapper.find('.popup-table-row').exists()).toBe(true)
    })

    it('should have two table cells', () => {
      wrapper = mount(PopupRow, {
        props: {
          input: mockWarning,
        },
      })

      const cells = wrapper.findAll('.popup-table-cell')
      expect(cells).toHaveLength(2)
    })

    it('should have symbol cell and text cell', () => {
      wrapper = mount(PopupRow, {
        props: {
          input: mockWarning,
        },
      })

      expect(wrapper.find('.popup-table-symbol-cell').exists()).toBe(true)
      expect(wrapper.find('.popup-table-text-cell').exists()).toBe(true)
    })
  })
})

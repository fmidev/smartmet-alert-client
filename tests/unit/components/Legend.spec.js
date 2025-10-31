import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Legend from '@/components/Legend.vue'

const mockLegend = [
  {
    type: 'wind',
    severity: 4,
    visible: true,
  },
  {
    type: 'thunderStorm',
    severity: 3,
    visible: true,
  },
  {
    type: 'rain',
    severity: 2,
    visible: false,
  },
]

describe('Legend.vue', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component mounting', () => {
    it('should mount with required props', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegend,
          language: 'fi',
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should initialize with visible false', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegend,
          language: 'fi',
        },
      })

      expect(wrapper.vm.visible).toBe(false)
    })
  })

  describe('Computed properties', () => {
    it('should compute warnings from input', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegend,
          language: 'fi',
        },
      })

      expect(wrapper.vm.warnings).toEqual(mockLegend)
    })

    it('should compute warningSymbolsText', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegend,
          language: 'fi',
        },
      })

      expect(typeof wrapper.vm.warningSymbolsText).toBe('string')
    })

    it('should compute toggleLegendsText based on visibility', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegend,
          language: 'fi',
        },
      })

      const closedText = wrapper.vm.toggleLegendsText
      wrapper.vm.visible = true

      const openText = wrapper.vm.toggleLegendsText

      expect(closedText).not.toBe(openText)
    })
  })

  describe('Event handling', () => {
    it('should toggle visible state on legend toggle', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegend,
          language: 'fi',
        },
      })

      const initialVisible = wrapper.vm.visible
      wrapper.vm.onLegendToggle()

      expect(wrapper.vm.visible).toBe(!initialVisible)
    })

    it('should emit warningsToggled event', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegend,
          language: 'fi',
        },
      })

      const newVisibleWarnings = ['wind', 'rain']
      wrapper.vm.onWarningsToggled(newVisibleWarnings)

      expect(wrapper.emitted('warningsToggled')).toBeTruthy()
      expect(wrapper.emitted('warningsToggled')[0]).toEqual([
        newVisibleWarnings,
      ])
    })

    it('should emit themeChanged event', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegend,
          language: 'fi',
        },
      })

      wrapper.vm.onThemeChanged('dark-theme')

      expect(wrapper.emitted('themeChanged')).toBeTruthy()
      expect(wrapper.emitted('themeChanged')[0]).toEqual(['dark-theme'])
    })

    it('should not emit themeChanged if theme is same', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegend,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      wrapper.vm.onThemeChanged('light-theme')

      expect(wrapper.emitted('themeChanged')).toBeFalsy()
    })

    it('should emit warningsToggled with all warning types on showAll', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegend,
          language: 'fi',
        },
      })

      wrapper.vm.onShowAllWarnings()

      expect(wrapper.emitted('warningsToggled')).toBeTruthy()
      const emittedWarnings = wrapper.emitted('warningsToggled')[0][0]
      expect(emittedWarnings).toContain('wind')
      expect(emittedWarnings).toContain('thunderStorm')
      expect(emittedWarnings).toContain('rain')
    })
  })

  describe('Props validation', () => {
    it('should accept grayScaleSelector prop', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegend,
          grayScaleSelector: true,
          language: 'fi',
        },
      })

      expect(wrapper.vm.grayScaleSelector).toBe(true)
    })

    it('should use default grayScaleSelector false', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegend,
          language: 'fi',
        },
      })

      expect(wrapper.vm.grayScaleSelector).toBe(false)
    })

    it('should accept theme prop', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegend,
          theme: 'dark-theme',
          language: 'fi',
        },
      })

      expect(wrapper.vm.theme).toBe('dark-theme')
    })
  })

  describe('Window resize handling', () => {
    it('should initialize windowWidth', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegend,
          language: 'fi',
        },
      })

      expect(typeof wrapper.vm.windowWidth).toBe('number')
    })
  })
})

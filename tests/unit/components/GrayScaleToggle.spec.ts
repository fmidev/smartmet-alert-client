import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import GrayScaleToggle from '@/components/GrayScaleToggle.vue'
import type { Theme, Language } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentInstance = any

describe('GrayScaleToggle.vue', () => {
  let wrapper: VueWrapper | null = null

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  describe('Component mounting', () => {
    it('should mount with required props', () => {
      wrapper = mount(GrayScaleToggle, {
        props: {
          language: 'fi' as Language,
          grayScaleSelector: true,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should not render when grayScaleSelector is false', () => {
      wrapper = mount(GrayScaleToggle, {
        props: {
          language: 'fi' as Language,
          grayScaleSelector: false,
        },
      })

      expect(wrapper.find('#gray-scale-select-row').exists()).toBe(false)
    })

    it('should render when grayScaleSelector is true', () => {
      wrapper = mount(GrayScaleToggle, {
        props: {
          language: 'fi' as Language,
          grayScaleSelector: true,
        },
      })

      expect(wrapper.find('#gray-scale-select-row').exists()).toBe(true)
    })
  })

  describe('Computed properties', () => {
    it('should detect gray scale from theme', () => {
      wrapper = mount(GrayScaleToggle, {
        props: {
          language: 'fi' as Language,
          grayScaleSelector: true,
          theme: 'light-gray-theme' as Theme,
        },
      })

      expect((wrapper.vm as ComponentInstance).grayScale).toBe(true)
    })

    it('should detect non-gray theme', () => {
      wrapper = mount(GrayScaleToggle, {
        props: {
          language: 'fi' as Language,
          grayScaleSelector: true,
          theme: 'light-theme' as Theme,
        },
      })

      expect((wrapper.vm as ComponentInstance).grayScale).toBe(false)
    })

    it('should handle dark-gray theme', () => {
      wrapper = mount(GrayScaleToggle, {
        props: {
          language: 'fi' as Language,
          grayScaleSelector: true,
          theme: 'dark-gray-theme' as Theme,
        },
      })

      expect((wrapper.vm as ComponentInstance).grayScale).toBe(true)
    })

    it('should return false for empty theme', () => {
      wrapper = mount(GrayScaleToggle, {
        props: {
          language: 'fi' as Language,
          grayScaleSelector: true,
          theme: '' as Theme,
        },
      })

      expect((wrapper.vm as ComponentInstance).grayScale).toBe(false)
    })

    it('should return false for null theme', () => {
      wrapper = mount(GrayScaleToggle, {
        props: {
          language: 'fi' as Language,
          grayScaleSelector: true,
          theme: null as unknown as Theme,
        },
      })

      expect((wrapper.vm as ComponentInstance).grayScale).toBe(false)
    })

    it('should compute grayScaleText', () => {
      wrapper = mount(GrayScaleToggle, {
        props: {
          language: 'fi' as Language,
          grayScaleSelector: true,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).grayScaleText).toBe(
        'string'
      )
    })

    it('should show toggleOn text when gray scale is active', () => {
      wrapper = mount(GrayScaleToggle, {
        props: {
          language: 'fi' as Language,
          grayScaleSelector: true,
          theme: 'light-gray-theme' as Theme,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).toggleText).toBe('string')
    })

    it('should show toggleOff text when gray scale is inactive', () => {
      wrapper = mount(GrayScaleToggle, {
        props: {
          language: 'fi' as Language,
          grayScaleSelector: true,
          theme: 'light-theme' as Theme,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).toggleText).toBe('string')
    })
  })

  describe('Toggle functionality', () => {
    it('should emit themeChanged when toggling from normal to gray', () => {
      wrapper = mount(GrayScaleToggle, {
        props: {
          language: 'fi' as Language,
          grayScaleSelector: true,
          theme: 'light-theme' as Theme,
        },
      })

      const event = { preventDefault: vi.fn() }
      ;(wrapper.vm as ComponentInstance).toggleGrayScale(event)

      expect(wrapper.emitted('themeChanged')).toBeTruthy()
      expect(wrapper.emitted('themeChanged')![0]).toEqual(['light-gray'])
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should emit themeChanged when toggling from gray to normal', () => {
      wrapper = mount(GrayScaleToggle, {
        props: {
          language: 'fi' as Language,
          grayScaleSelector: true,
          theme: 'light-gray-theme' as Theme,
        },
      })

      const event = { preventDefault: vi.fn() }
      ;(wrapper.vm as ComponentInstance).toggleGrayScale(event)

      expect(wrapper.emitted('themeChanged')).toBeTruthy()
      expect(wrapper.emitted('themeChanged')![0]).toEqual(['light'])
    })

    it('should handle dark theme toggle', () => {
      wrapper = mount(GrayScaleToggle, {
        props: {
          language: 'fi' as Language,
          grayScaleSelector: true,
          theme: 'dark-theme' as Theme,
        },
      })

      const event = { preventDefault: vi.fn() }
      ;(wrapper.vm as ComponentInstance).toggleGrayScale(event)

      expect(wrapper.emitted('themeChanged')![0]).toEqual(['dark-gray'])
    })

    it('should not emit when theme is empty', () => {
      wrapper = mount(GrayScaleToggle, {
        props: {
          language: 'fi' as Language,
          grayScaleSelector: true,
          theme: '' as Theme,
        },
      })

      const event = { preventDefault: vi.fn() }
      ;(wrapper.vm as ComponentInstance).toggleGrayScale(event)

      expect(wrapper.emitted('themeChanged')).toBeFalsy()
    })

    it('should prevent default event', () => {
      wrapper = mount(GrayScaleToggle, {
        props: {
          language: 'fi' as Language,
          grayScaleSelector: true,
          theme: 'light-theme' as Theme,
        },
      })

      const event = { preventDefault: vi.fn() }
      ;(wrapper.vm as ComponentInstance).preventEvents(event)

      expect(event.preventDefault).toHaveBeenCalled()
    })
  })

  describe('CSS classes', () => {
    it('should apply gray-scale-selected class when active', () => {
      wrapper = mount(GrayScaleToggle, {
        props: {
          language: 'fi' as Language,
          grayScaleSelector: true,
          theme: 'light-gray-theme' as Theme,
        },
      })

      expect(wrapper.find('#gray-scale-select').classes()).toContain(
        'gray-scale-selected'
      )
    })

    it('should apply gray-scale-unselected class when inactive', () => {
      wrapper = mount(GrayScaleToggle, {
        props: {
          language: 'fi' as Language,
          grayScaleSelector: true,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.find('#gray-scale-select').classes()).toContain(
        'gray-scale-unselected'
      )
    })

    it('should apply theme class to container', () => {
      wrapper = mount(GrayScaleToggle, {
        props: {
          language: 'fi' as Language,
          grayScaleSelector: true,
          theme: 'dark-theme' as Theme,
        },
      })

      expect(wrapper.find('#gray-scale-select-row').classes()).toContain(
        'dark-theme'
      )
    })
  })

  describe('Accessibility', () => {
    it('should have correct ARIA attributes when inactive', () => {
      wrapper = mount(GrayScaleToggle, {
        props: {
          language: 'fi' as Language,
          grayScaleSelector: true,
          theme: 'light-theme' as Theme,
        },
      })

      const toggle = wrapper.find('#gray-scale-select')
      expect(toggle.attributes('role')).toBe('button')
      expect(toggle.attributes('tabindex')).toBe('0')
      expect(toggle.attributes('aria-pressed')).toBe('false')
    })

    it('should have correct ARIA attributes when active', () => {
      wrapper = mount(GrayScaleToggle, {
        props: {
          language: 'fi' as Language,
          grayScaleSelector: true,
          theme: 'light-gray-theme' as Theme,
        },
      })

      const toggle = wrapper.find('#gray-scale-select')
      expect(toggle.attributes('aria-pressed')).toBe('true')
    })

    it('should have aria-label', () => {
      wrapper = mount(GrayScaleToggle, {
        props: {
          language: 'fi' as Language,
          grayScaleSelector: true,
        },
      })

      const toggle = wrapper.find('#gray-scale-select')
      expect(toggle.attributes('aria-label')).toBeDefined()
    })
  })
})

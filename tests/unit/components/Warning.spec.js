import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Warning from '@/components/Warning.vue'

const mockWarning = {
  type: 'wind',
  severity: 3,
  visible: true,
}

describe('Warning.vue', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component mounting', () => {
    it('should mount with required props', () => {
      wrapper = mount(Warning, {
        props: {
          input: mockWarning,
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Computed properties', () => {
    it('should compute id from warning type', () => {
      wrapper = mount(Warning, {
        props: {
          input: mockWarning,
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(wrapper.vm.id).toBe('fmi-warnings-flag-wind')
    })

    it('should compute title from translation', () => {
      wrapper = mount(Warning, {
        props: {
          input: mockWarning,
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(typeof wrapper.vm.title).toBe('string')
    })

    it('should compute warningLevelText', () => {
      wrapper = mount(Warning, {
        props: {
          input: mockWarning,
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(typeof wrapper.vm.warningLevelText).toBe('string')
    })

    it('should compute toggleText based on visibility', () => {
      wrapper = mount(Warning, {
        props: {
          input: { ...mockWarning, visible: true },
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      const visibleText = wrapper.vm.toggleText

      wrapper = mount(Warning, {
        props: {
          input: { ...mockWarning, visible: false },
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      const hiddenText = wrapper.vm.toggleText

      expect(typeof visibleText).toBe('string')
      expect(typeof hiddenText).toBe('string')
    })
  })

  describe('Fields mixin computed properties', () => {
    it('should compute typeClass from warning type', () => {
      wrapper = mount(Warning, {
        props: {
          input: { type: 'thunderStorm', severity: 4, visible: true },
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(wrapper.vm.typeClass).toBe('thunder-storm')
    })

    it('should compute typeClass for sea wind', () => {
      wrapper = mount(Warning, {
        props: {
          input: { type: 'seaWind', severity: 3, visible: true },
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(wrapper.vm.typeClass).toBe('sea-wind')
    })

    it('should compute rotation from direction', () => {
      wrapper = mount(Warning, {
        props: {
          input: {
            type: 'wind',
            severity: 3,
            visible: true,
            direction: 90,
          },
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(wrapper.vm.rotation).toBe(90)
    })

    it('should round rotation to nearest 5 degrees', () => {
      wrapper = mount(Warning, {
        props: {
          input: {
            type: 'wind',
            severity: 3,
            visible: true,
            direction: 93,
          },
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(wrapper.vm.rotation).toBe(95)
    })

    it('should handle negative direction', () => {
      wrapper = mount(Warning, {
        props: {
          input: {
            type: 'wind',
            severity: 3,
            visible: true,
            direction: -45,
          },
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(wrapper.vm.rotation).toBeGreaterThanOrEqual(0)
      expect(wrapper.vm.rotation).toBeLessThan(360)
    })

    it('should compute invertedRotation', () => {
      wrapper = mount(Warning, {
        props: {
          input: {
            type: 'wind',
            severity: 3,
            visible: true,
            direction: 90,
          },
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(wrapper.vm.invertedRotation).toBe(270)
    })

    it('should compute severity from input', () => {
      wrapper = mount(Warning, {
        props: {
          input: mockWarning,
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(wrapper.vm.severity).toBe(3)
    })

    it('should return 0 for invalid severity levels', () => {
      const invalidSeverities = [0, 1, 5, 6]

      invalidSeverities.forEach((severity) => {
        wrapper = mount(Warning, {
          props: {
            input: { ...mockWarning, severity },
            hideable: true,
            language: 'fi',
            theme: 'light-theme',
          },
        })

        expect(wrapper.vm.severity).toBe(0)
      })
    })

    it('should accept valid severity levels 2-4', () => {
      const validSeverities = [2, 3, 4]

      validSeverities.forEach((severity) => {
        wrapper = mount(Warning, {
          props: {
            input: { ...mockWarning, severity },
            hideable: true,
            language: 'fi',
            theme: 'light-theme',
          },
        })

        expect(wrapper.vm.severity).toBe(severity)
      })
    })
  })

  describe('Toggle functionality', () => {
    it('should emit warningToggled when toggled on', () => {
      wrapper = mount(Warning, {
        props: {
          input: { ...mockWarning, visible: false },
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      const event = { preventDefault: vi.fn() }
      wrapper.vm.toggle(event)

      expect(wrapper.emitted('warningToggled')).toBeTruthy()
      expect(wrapper.emitted('warningToggled')[0][0]).toEqual({
        warning: 'wind',
        visible: true,
      })
      expect(event.preventDefault).toHaveBeenCalled()
    })

    it('should emit warningToggled when toggled off', () => {
      wrapper = mount(Warning, {
        props: {
          input: { ...mockWarning, visible: true },
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      const event = { preventDefault: vi.fn() }
      wrapper.vm.toggle(event)

      expect(wrapper.emitted('warningToggled')[0][0]).toEqual({
        warning: 'wind',
        visible: false,
      })
    })

    it('should call setWarningVisibility with correct value', () => {
      wrapper = mount(Warning, {
        props: {
          input: mockWarning,
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      wrapper.vm.setWarningVisibility(false)

      expect(wrapper.emitted('warningToggled')).toBeTruthy()
      expect(wrapper.emitted('warningToggled')[0][0].visible).toBe(false)
    })

    it('should prevent default event', () => {
      wrapper = mount(Warning, {
        props: {
          input: mockWarning,
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      const event = { preventDefault: vi.fn() }
      wrapper.vm.preventEvents(event)

      expect(event.preventDefault).toHaveBeenCalled()
    })
  })

  describe('CSS classes', () => {
    it('should apply severity level class', () => {
      wrapper = mount(Warning, {
        props: {
          input: mockWarning,
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      const image = wrapper.find('.warning-image')
      expect(image.classes()).toContain('level-3')
    })

    it('should apply type class', () => {
      wrapper = mount(Warning, {
        props: {
          input: mockWarning,
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      const image = wrapper.find('.warning-image')
      expect(image.classes()).toContain('wind')
    })

    it('should apply flag-selected class when visible', () => {
      wrapper = mount(Warning, {
        props: {
          input: { ...mockWarning, visible: true },
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      const toggle = wrapper.find('.symbol-list-select')
      expect(toggle.classes()).toContain('flag-selected')
    })

    it('should apply flag-unselected class when not visible', () => {
      wrapper = mount(Warning, {
        props: {
          input: { ...mockWarning, visible: false },
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      const toggle = wrapper.find('.symbol-list-select')
      expect(toggle.classes()).toContain('flag-unselected')
    })

    it('should apply theme class to container', () => {
      wrapper = mount(Warning, {
        props: {
          input: mockWarning,
          hideable: true,
          language: 'fi',
          theme: 'dark-theme',
        },
      })

      expect(wrapper.find('.symbol-list-table').classes()).toContain(
        'dark-theme'
      )
    })
  })

  describe('Accessibility', () => {
    it('should have correct ARIA attributes on toggle', () => {
      wrapper = mount(Warning, {
        props: {
          input: { ...mockWarning, visible: true },
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      const toggle = wrapper.find('.symbol-list-select')
      expect(toggle.attributes('role')).toBe('button')
      expect(toggle.attributes('tabindex')).toBe('0')
      expect(toggle.attributes('aria-pressed')).toBe('true')
    })

    it('should update aria-pressed when visibility changes', () => {
      wrapper = mount(Warning, {
        props: {
          input: { ...mockWarning, visible: false },
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      const toggle = wrapper.find('.symbol-list-select')
      expect(toggle.attributes('aria-pressed')).toBe('false')
    })

    it('should have aria-label on warning image', () => {
      wrapper = mount(Warning, {
        props: {
          input: mockWarning,
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      const image = wrapper.find('.warning-image')
      expect(image.attributes('aria-label')).toBeDefined()
    })
  })

  describe('Hideable prop', () => {
    it('should show toggle when hideable is true', () => {
      wrapper = mount(Warning, {
        props: {
          input: mockWarning,
          hideable: true,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      const toggle = wrapper.find('.symbol-list-select')
      expect(toggle.classes()).toContain('d-md-block')
    })

    it('should respect hideable prop', () => {
      wrapper = mount(Warning, {
        props: {
          input: mockWarning,
          hideable: false,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(wrapper.vm.hideable).toBe(false)
    })
  })
})

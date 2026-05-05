import { describe, it, expect, afterEach, vi } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import MapLarge from '@/components/MapLarge.vue'
import type { DayRegions, WarningsMap, Theme, Language } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentInstance = any

const mockRegions: DayRegions = {
  land: [],
  sea: [],
}

describe('MapLarge.vue', () => {
  let wrapper: VueWrapper | null = null

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  describe('Component mounting', () => {
    it('should mount with default props', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should mount with all props', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: true,
          theme: 'light-theme' as Theme,
          language: 'fi' as Language,
          spinnerEnabled: true,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Computed properties', () => {
    it('should compute zoomInText from translations', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          language: 'fi' as Language,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).zoomInText).toBe('string')
    })

    it('should compute zoomOutText from translations', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          language: 'fi' as Language,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).zoomOutText).toBe(
        'string'
      )
    })

    it('should compute moveText from translations', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          language: 'fi' as Language,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).moveText).toBe('string')
    })

    it('should compute tooltipStyle', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
        },
      })

      expect((wrapper.vm as ComponentInstance).tooltipStyle).toContain('left:')
      expect((wrapper.vm as ComponentInstance).tooltipStyle).toContain('top:')
    })

    it('should compute strokeWidth', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).strokeWidth).toBe(
        'string'
      )
    })

    it('should compute iconSize based on scale', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).iconSize).toBe('number')
    })

    it('should compute icons as array', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          input: mockRegions,
          warnings: null,
        },
      })

      expect(Array.isArray((wrapper.vm as ComponentInstance).icons)).toBe(true)
    })

    it('should compute coverageIcons as array', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
        },
      })

      expect(
        Array.isArray((wrapper.vm as ComponentInstance).coverageIcons)
      ).toBe(true)
    })
  })

  describe('Props handling', () => {
    it('should accept loading prop', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          loading: false,
        },
      })

      expect((wrapper.vm as ComponentInstance).loading).toBe(false)
    })

    it('should accept spinnerEnabled prop', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          spinnerEnabled: false,
        },
      })

      expect((wrapper.vm as ComponentInstance).spinnerEnabled).toBe(false)
    })

    it('should show spinner when loading and enabled', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          loading: true,
          spinnerEnabled: true,
        },
      })

      expect(wrapper.find('.spinner-container').exists()).toBe(true)
    })

    it('should hide spinner when spinnerEnabled is false', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          loading: true,
          spinnerEnabled: false,
        },
      })

      expect(wrapper.find('.spinner-container').exists()).toBe(false)
    })

    it('should accept warnings prop', () => {
      const mockWarnings: WarningsMap = {}

      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          warnings: mockWarnings,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should accept visibleWarnings prop', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          visibleWarnings: ['wind', 'rain'],
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should accept geometryId prop', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          geometryId: 2021,
        },
      })

      expect((wrapper.vm as ComponentInstance).geometryId).toBe(2021)
    })
  })

  describe('Zoom functionality', () => {
    it('should have zoomIn method', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).zoomIn).toBe('function')
    })

    it('should have zoomOut method', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).zoomOut).toBe('function')
    })

    it('should have scale property', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
        },
      })

      expect((wrapper.vm as ComponentInstance).scale).toBe(1)
    })
  })

  describe('Navigation methods', () => {
    it('should have moveWest method', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).moveWest).toBe('function')
    })

    it('should have moveEast method', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).moveEast).toBe('function')
    })

    it('should have moveNorth method', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).moveNorth).toBe(
        'function'
      )
    })

    it('should have moveSouth method', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).moveSouth).toBe(
        'function'
      )
    })
  })

  describe('Tooltip functionality', () => {
    it('should have closeTooltip method', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).closeTooltip).toBe(
        'function'
      )
    })

    it('should close tooltip when closeTooltip is called', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
        },
      })
      ;(wrapper.vm as ComponentInstance).showTooltip = true

      const event = { preventDefault: vi.fn() }
      ;(wrapper.vm as ComponentInstance).closeTooltip(event)

      expect((wrapper.vm as ComponentInstance).showTooltip).toBe(false)
      expect(event.preventDefault).toHaveBeenCalled()
    })
  })

  describe('Theme support', () => {
    it('should apply theme class', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          theme: 'dark-theme' as Theme,
        },
      })

      expect(wrapper.find('.map-large').classes()).toContain('dark-theme')
    })

    it('should support all theme variants', () => {
      const themes: Theme[] = [
        'light-theme',
        'dark-theme',
        'light-gray-theme',
        'dark-gray-theme',
      ]

      themes.forEach((theme) => {
        wrapper = mount(MapLarge, {
          props: {
            index: 0,
            theme,
          },
        })

        expect(wrapper.find('.map-large').classes()).toContain(theme)
      })
    })
  })

  describe('Events', () => {
    it('should emit loaded event when warnings are provided', async () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          warnings: {},
        },
      })

      // Wait for mounted hook
      await wrapper.vm.$nextTick()

      expect(wrapper.emitted('loaded')).toBeTruthy()
    })
  })

  describe('SVG structure', () => {
    it('should render SVG element', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
        },
      })

      expect(wrapper.find('svg#finland-large').exists()).toBe(true)
    })

    it('should have correct viewBox', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
        },
      })

      expect(wrapper.find('svg#finland-large').attributes('viewBox')).toBe(
        '0 0 440 550'
      )
    })
  })

  describe('Accessibility', () => {
    it('should have zoom in button with aria-label', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          language: 'fi' as Language,
        },
      })

      const zoomInButton = wrapper.find('#fmi-warnings-zoom-in')
      expect(zoomInButton.attributes('aria-label')).toBeDefined()
    })

    it('should have zoom out button with aria-label', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          language: 'fi' as Language,
        },
      })

      const zoomOutButton = wrapper.find('#fmi-warnings-zoom-out')
      expect(zoomOutButton.attributes('aria-label')).toBeDefined()
    })

    it('should have move button with aria-label', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          language: 'fi' as Language,
        },
      })

      const moveButton = wrapper.find('#fmi-warnings-move')
      expect(moveButton.attributes('aria-label')).toBeDefined()
    })
  })
})

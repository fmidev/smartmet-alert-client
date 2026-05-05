import { describe, it, expect, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import Legend from '@/components/Legend.vue'
import type { LegendItem, Theme, Language } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentInstance = any

const mockLegendItems: LegendItem[] = [
  { type: 'wind', severity: 3, visible: true },
  { type: 'rain', severity: 2, visible: true },
  { type: 'thunderStorm', severity: 4, visible: false },
]

describe('Legend.vue', () => {
  let wrapper: VueWrapper | null = null

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  describe('Component mounting', () => {
    it('should mount with default props', () => {
      wrapper = mount(Legend, {
        props: {},
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should mount with all props', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegendItems,
          language: 'fi' as Language,
          grayScaleSelector: true,
          theme: 'light-theme' as Theme,
          visibleWarnings: ['wind', 'rain'],
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Computed properties', () => {
    it('should compute warnings from input', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegendItems,
        },
      })

      expect((wrapper.vm as ComponentInstance).warnings).toEqual(
        mockLegendItems
      )
    })

    it('should compute warningSymbolsText from translations', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegendItems,
          language: 'fi' as Language,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).warningSymbolsText).toBe(
        'string'
      )
    })

    it('should compute toggleLegendsText based on visibility state', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegendItems,
          language: 'fi' as Language,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).toggleLegendsText).toBe(
        'string'
      )
    })
  })

  describe('Event handling', () => {
    it('should emit warningsToggled when onWarningsToggled is called', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegendItems,
          visibleWarnings: ['wind'],
        },
      })
      ;(wrapper.vm as ComponentInstance).onWarningsToggled(['wind', 'rain'])

      expect(wrapper.emitted('warningsToggled')).toBeTruthy()
      expect(wrapper.emitted('warningsToggled')![0]).toEqual([['wind', 'rain']])
    })

    it('should emit themeChanged when onThemeChanged is called with different theme', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegendItems,
          theme: 'light-theme' as Theme,
        },
      })
      ;(wrapper.vm as ComponentInstance).onThemeChanged('dark-theme')

      expect(wrapper.emitted('themeChanged')).toBeTruthy()
      expect(wrapper.emitted('themeChanged')![0]).toEqual(['dark-theme'])
    })

    it('should not emit themeChanged when theme is the same', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegendItems,
          theme: 'light-theme' as Theme,
        },
      })
      ;(wrapper.vm as ComponentInstance).onThemeChanged('light-theme')

      expect(wrapper.emitted('themeChanged')).toBeFalsy()
    })

    it('should emit all visible warnings on showAllWarnings', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegendItems,
          visibleWarnings: ['wind'],
        },
      })
      ;(wrapper.vm as ComponentInstance).onShowAllWarnings()

      expect(wrapper.emitted('warningsToggled')).toBeTruthy()
      expect(wrapper.emitted('warningsToggled')![0]![0]).toContain('wind')
      expect(wrapper.emitted('warningsToggled')![0]![0]).toContain('rain')
      expect(wrapper.emitted('warningsToggled')![0]![0]).toContain(
        'thunderStorm'
      )
    })

    it('should toggle legend visibility on onLegendToggle', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegendItems,
        },
      })

      expect((wrapper.vm as ComponentInstance).visible).toBe(false)
      ;(wrapper.vm as ComponentInstance).onLegendToggle()

      expect((wrapper.vm as ComponentInstance).visible).toBe(true)
      ;(wrapper.vm as ComponentInstance).onLegendToggle()

      expect((wrapper.vm as ComponentInstance).visible).toBe(false)
    })
  })

  describe('Props handling', () => {
    it('should accept grayScaleSelector prop', () => {
      wrapper = mount(Legend, {
        props: {
          grayScaleSelector: true,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should accept visibleWarnings prop', () => {
      wrapper = mount(Legend, {
        props: {
          visibleWarnings: ['wind', 'rain'],
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should default language to fi', () => {
      wrapper = mount(Legend, {
        props: {},
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Theme support', () => {
    it('should apply theme class to container', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegendItems,
          theme: 'dark-theme' as Theme,
        },
      })

      expect(wrapper.find('.sticky-top').classes()).toContain('dark-theme')
    })

    it('should support all theme variants', () => {
      const themes: Theme[] = [
        'light-theme',
        'dark-theme',
        'light-gray-theme',
        'dark-gray-theme',
      ]

      themes.forEach((theme) => {
        wrapper = mount(Legend, {
          props: {
            input: mockLegendItems,
            theme,
          },
        })

        expect(wrapper.find('.sticky-top').classes()).toContain(theme)
      })
    })
  })

  describe('Language support', () => {
    it('should support Finnish language', () => {
      wrapper = mount(Legend, {
        props: {
          language: 'fi' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should support Swedish language', () => {
      wrapper = mount(Legend, {
        props: {
          language: 'sv' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should support English language', () => {
      wrapper = mount(Legend, {
        props: {
          language: 'en' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Structure', () => {
    it('should render symbol list header', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegendItems,
        },
      })

      expect(wrapper.find('.symbol-list-header').exists()).toBe(true)
    })

    it('should render collapsible panel', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegendItems,
        },
      })

      // CollapsiblePanel component should be rendered
      expect(wrapper.findComponent({ name: 'CollapsiblePanel' }).exists()).toBe(
        true
      )
    })

    it('should render GrayScaleToggle components', () => {
      wrapper = mount(Legend, {
        props: {
          input: mockLegendItems,
          grayScaleSelector: true,
        },
      })

      // Should render GrayScaleToggle components
      expect(
        wrapper.findAllComponents({ name: 'GrayScaleToggle' }).length
      ).toBeGreaterThan(0)
    })
  })
})

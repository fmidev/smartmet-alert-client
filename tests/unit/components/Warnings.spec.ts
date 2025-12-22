import { describe, it, expect, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import Warnings from '@/components/Warnings.vue'
import type { LegendItem, Theme, Language } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentInstance = any

const mockWarnings: LegendItem[] = [
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

describe('Warnings.vue', () => {
  let wrapper: VueWrapper | null = null

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  describe('Component mounting', () => {
    it('should mount with required props', () => {
      wrapper = mount(Warnings, {
        props: {
          input: mockWarnings,
          visibleWarnings: ['wind', 'thunderStorm'],
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should mount with empty warnings', () => {
      wrapper = mount(Warnings, {
        props: {
          input: [],
          visibleWarnings: [],
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Computed properties', () => {
    it('should compute warnings from input', () => {
      wrapper = mount(Warnings, {
        props: {
          input: mockWarnings,
          visibleWarnings: [],
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect((wrapper.vm as ComponentInstance).warnings).toEqual(mockWarnings)
    })

    it('should detect hidden warnings', () => {
      wrapper = mount(Warnings, {
        props: {
          input: mockWarnings,
          visibleWarnings: ['wind'],
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect((wrapper.vm as ComponentInstance).hiddenWarnings).toBe(true)
    })

    it('should detect no hidden warnings when all visible', () => {
      wrapper = mount(Warnings, {
        props: {
          input: mockWarnings,
          visibleWarnings: ['wind', 'thunderStorm', 'rain'],
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect((wrapper.vm as ComponentInstance).hiddenWarnings).toBe(false)
    })

    it('should detect no warnings state', () => {
      wrapper = mount(Warnings, {
        props: {
          input: [],
          visibleWarnings: [],
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect((wrapper.vm as ComponentInstance).noWarnings).toBe(true)
    })

    it('should compute warningSymbolsText for warnings', () => {
      wrapper = mount(Warnings, {
        props: {
          input: mockWarnings,
          visibleWarnings: [],
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).warningSymbolsText).toBe(
        'string'
      )
    })

    it('should compute noWarnings text when empty', () => {
      wrapper = mount(Warnings, {
        props: {
          input: [],
          visibleWarnings: [],
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).warningSymbolsText).toBe(
        'string'
      )
    })

    it('should compute showWarningsText', () => {
      wrapper = mount(Warnings, {
        props: {
          input: mockWarnings,
          visibleWarnings: [],
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).showWarningsText).toBe(
        'string'
      )
    })

    it('should compute severity level texts', () => {
      wrapper = mount(Warnings, {
        props: {
          input: mockWarnings,
          visibleWarnings: [],
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      const vm = wrapper.vm as ComponentInstance
      expect(typeof vm.warningLevel1Text).toBe('string')
      expect(typeof vm.warningLevel2Text).toBe('string')
      expect(typeof vm.warningLevel3Text).toBe('string')
      expect(typeof vm.warningLevel4Text).toBe('string')
    })
  })

  describe('Event handling', () => {
    it('should emit warningsToggled when warning is toggled on', () => {
      wrapper = mount(Warnings, {
        props: {
          input: mockWarnings,
          visibleWarnings: ['wind'],
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })
      ;(wrapper.vm as ComponentInstance).onWarningToggled({
        warning: 'rain',
        visible: true,
      })

      expect(wrapper.emitted('warningsToggled')).toBeTruthy()
      const emittedWarnings = wrapper.emitted(
        'warningsToggled'
      )![0]![0] as string[]
      expect(emittedWarnings).toContain('wind')
      expect(emittedWarnings).toContain('rain')
    })

    it('should emit warningsToggled when warning is toggled off', () => {
      wrapper = mount(Warnings, {
        props: {
          input: mockWarnings,
          visibleWarnings: ['wind', 'rain'],
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })
      ;(wrapper.vm as ComponentInstance).onWarningToggled({
        warning: 'rain',
        visible: false,
      })

      expect(wrapper.emitted('warningsToggled')).toBeTruthy()
      const emittedWarnings = wrapper.emitted(
        'warningsToggled'
      )![0]![0] as string[]
      expect(emittedWarnings).toContain('wind')
      expect(emittedWarnings).not.toContain('rain')
    })

    it('should not add warning twice when already visible', () => {
      wrapper = mount(Warnings, {
        props: {
          input: mockWarnings,
          visibleWarnings: ['wind'],
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })
      ;(wrapper.vm as ComponentInstance).onWarningToggled({
        warning: 'wind',
        visible: true,
      })

      const emittedWarnings = wrapper.emitted(
        'warningsToggled'
      )![0]![0] as string[]
      expect(emittedWarnings.filter((w) => w === 'wind').length).toBe(1)
    })

    it('should emit showAllWarnings event', () => {
      wrapper = mount(Warnings, {
        props: {
          input: mockWarnings,
          visibleWarnings: [],
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })
      ;(wrapper.vm as ComponentInstance).showAll()

      expect(wrapper.emitted('showAllWarnings')).toBeTruthy()
    })
  })

  describe('Theme support', () => {
    it('should apply theme class', () => {
      wrapper = mount(Warnings, {
        props: {
          input: mockWarnings,
          visibleWarnings: [],
          language: 'fi' as Language,
          theme: 'dark-theme' as Theme,
        },
      })

      expect(wrapper.find('#fmi-warnings-view').classes()).toContain(
        'dark-theme'
      )
    })

    it('should support all theme variants', () => {
      const themes: Theme[] = [
        'light-theme',
        'dark-theme',
        'light-gray-theme',
        'dark-gray-theme',
      ]

      themes.forEach((theme) => {
        wrapper = mount(Warnings, {
          props: {
            input: mockWarnings,
            visibleWarnings: [],
            language: 'fi' as Language,
            theme,
          },
        })

        expect(wrapper.find('#fmi-warnings-view').classes()).toContain(theme)
      })
    })
  })

  describe('Content rendering', () => {
    it('should render Warning components for each warning', () => {
      wrapper = mount(Warnings, {
        props: {
          input: mockWarnings,
          visibleWarnings: [],
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      const warningComponents = wrapper.findAllComponents({ name: 'Warning' })
      expect(warningComponents).toHaveLength(mockWarnings.length)
    })

    it('should show no-warnings separator when no warnings', () => {
      wrapper = mount(Warnings, {
        props: {
          input: [],
          visibleWarnings: [],
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      const separator = wrapper.find('.legend-separator')
      expect(separator.classes()).toContain('no-warnings')
    })

    it('should not show no-warnings class when warnings exist', () => {
      wrapper = mount(Warnings, {
        props: {
          input: mockWarnings,
          visibleWarnings: [],
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      const separator = wrapper.find('.legend-separator')
      expect(separator.classes()).not.toContain('no-warnings')
    })
  })
})

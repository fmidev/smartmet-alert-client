import { describe, it, expect, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import DescriptionWarning from '@/components/DescriptionWarning.vue'
import type { Warning, Theme, Language } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentInstance = any

const mockWarning: Warning = {
  type: 'wind',
  id: 'test-warning-1',
  regions: { 'county.1': true },
  covRegions: new Map(),
  coveragesLarge: [],
  coveragesSmall: [],
  effectiveFrom: '2025-10-31T12:00:00Z',
  effectiveUntil: '2025-11-01T12:00:00Z',
  effectiveDays: [true, true, false, false, false],
  validInterval: '31.10.2025 14:00 – 1.11.2025 14:00',
  validIntervalAriaLabel: '31. lokakuuta 2025 14:00 – 1. marraskuuta 2025 14:00',
  severity: 3,
  direction: 270,
  value: 25,
  text: '25',
  info: {
    fi: 'Kovaa tuulta',
    sv: 'Hårt blåsväder',
    en: 'Strong wind',
  },
  link: 'https://example.com',
  linkText: 'Lisätietoja',
}

describe('DescriptionWarning.vue', () => {
  let wrapper: VueWrapper | null = null

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  describe('Component mounting', () => {
    it('should mount with required props', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Computed properties', () => {
    it('should compute warningTitle from translations', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).warningTitle).toBe(
        'string'
      )
    })

    it('should compute warningLevel from translations', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).warningLevel).toBe(
        'string'
      )
    })

    it('should compute warningDetails for wind with direction', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).warningDetails).toContain('m/s')
    })

    it('should return empty warningDetails when text is null', () => {
      const warningNoText: Warning = {
        ...mockWarning,
        text: '',
        direction: 0,
      }

      wrapper = mount(DescriptionWarning, {
        props: {
          input: warningNoText,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).warningDetails).toBe('')
    })

    it('should compute info based on language', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).info).toBe('Kovaa tuulta')
    })

    it('should compute info for Swedish', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'sv' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).info).toBe('Hårt blåsväder')
    })

    it('should compute info for English', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'en' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).info).toBe('Strong wind')
    })

    it('should compute validText from translations', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).validText).toBe('string')
    })

    it('should compute linkHidden when link is empty', () => {
      const warningNoLink: Warning = {
        ...mockWarning,
        link: '',
      }

      wrapper = mount(DescriptionWarning, {
        props: {
          input: warningNoLink,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).linkHidden).toBe(true)
    })

    it('should compute linkHidden as false when link exists', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).linkHidden).toBe(false)
    })

    it('should compute description from translations', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).description).toBe(
        'string'
      )
    })
  })

  describe('Fields mixin integration', () => {
    it('should compute severity', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).severity).toBe(3)
    })

    it('should compute typeClass', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).typeClass).toBe('wind')
    })

    it('should compute rotation', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).rotation).toBe(270)
    })

    it('should compute invertedRotation', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).invertedRotation).toBe(90)
    })
  })

  describe('Content rendering', () => {
    it('should render valid interval', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.html()).toContain(mockWarning.validInterval)
    })

    it('should render warning text in symbol', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.find('.symbol-text').text()).toBe('25')
    })

    it('should render link when provided', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      const link = wrapper.find('.ext-link')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe('https://example.com')
    })

    it('should hide link when not provided', () => {
      const warningNoLink: Warning = {
        ...mockWarning,
        link: '',
      }

      wrapper = mount(DescriptionWarning, {
        props: {
          input: warningNoLink,
          language: 'fi' as Language,
        },
      })

      const link = wrapper.find('.ext-link')
      expect(link.classes()).toContain('d-none')
    })
  })

  describe('CSS classes', () => {
    it('should apply severity level class to image', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      const image = wrapper.find('.current-description-image')
      expect(image.classes()).toContain('level-3')
    })

    it('should apply type class to image', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      const image = wrapper.find('.current-description-image')
      expect(image.classes()).toContain('wind')
    })

    it('should apply rotation class', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      const image = wrapper.find('.current-description-image')
      expect(image.classes()).toContain('transform-rotate-270')
    })

    it('should apply severity class to description rectangle', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      const rectangle = wrapper.find('.description-rectangle')
      expect(rectangle.classes()).toContain('level-3')
    })
  })

  describe('Theme support', () => {
    it('should apply theme class', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
          theme: 'dark-theme' as Theme,
        },
      })

      expect(wrapper.find('.current-description-row').classes()).toContain(
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
        wrapper = mount(DescriptionWarning, {
          props: {
            input: mockWarning,
            language: 'fi' as Language,
            theme,
          },
        })

        expect(wrapper.find('.current-description-row').classes()).toContain(
          theme
        )
      })
    })
  })
})

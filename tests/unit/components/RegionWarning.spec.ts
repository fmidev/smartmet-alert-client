import { describe, it, expect, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import RegionWarning from '@/components/RegionWarning.vue'
import type { WarningIconInput, Language } from '@/types'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentInstance = any

const mockWarning: WarningIconInput = {
  type: 'wind',
  severity: 3,
  direction: 270,
  text: '25',
}

describe('RegionWarning.vue', () => {
  let wrapper: VueWrapper | null = null

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  describe('Component mounting', () => {
    it('should mount with required props', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Computed properties', () => {
    it('should compute warningLevel from translations', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).warningLevel).toBe(
        'string'
      )
    })

    it('should compute warningTypeText from translations', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).warningTypeText).toBe(
        'string'
      )
    })

    it('should compute warningDetails for wind with direction', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).warningDetails).toContain('m/s')
      expect((wrapper.vm as ComponentInstance).warningDetails).toContain('°')
    })

    it('should return empty warningDetails when text is null', () => {
      const warningNoText: WarningIconInput = {
        type: 'rain',
        severity: 2,
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warningNoText,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).warningDetails).toBe('')
    })

    it('should return empty warningDetails when direction is null', () => {
      const warningNoDirection: WarningIconInput = {
        type: 'wind',
        severity: 3,
        text: '25',
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warningNoDirection,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).warningDetails).toBe('')
    })
  })

  describe('Fields mixin integration', () => {
    it('should compute severity', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).severity).toBe(3)
    })

    it('should compute typeClass', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).typeClass).toBe('wind')
    })

    it('should compute typeClass for thunderStorm', () => {
      const thunderWarning: WarningIconInput = {
        type: 'thunderStorm',
        severity: 4,
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: thunderWarning,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).typeClass).toBe('thunder-storm')
    })

    it('should compute rotation', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).rotation).toBe(270)
    })

    it('should compute invertedRotation', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).invertedRotation).toBe(90)
    })

    it('should return 0 rotation when direction is not set', () => {
      const warningNoDirection: WarningIconInput = {
        type: 'rain',
        severity: 2,
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warningNoDirection,
          language: 'fi' as Language,
        },
      })

      expect((wrapper.vm as ComponentInstance).rotation).toBe(0)
    })

    it('should return 0 for invalid severity', () => {
      const invalidSeverities = [0, 1, 5, 6]

      invalidSeverities.forEach((severity) => {
        const warning: WarningIconInput = {
          type: 'wind',
          severity: severity as 0 | 1 | 2 | 3 | 4,
        }

        wrapper = mount(RegionWarning, {
          props: {
            input: warning,
            language: 'fi' as Language,
          },
        })

        expect((wrapper.vm as ComponentInstance).severity).toBe(0)
      })
    })

    it('should accept valid severity levels 2-4', () => {
      const validSeverities = [2, 3, 4]

      validSeverities.forEach((severity) => {
        const warning: WarningIconInput = {
          type: 'wind',
          severity: severity as 2 | 3 | 4,
        }

        wrapper = mount(RegionWarning, {
          props: {
            input: warning,
            language: 'fi' as Language,
          },
        })

        expect((wrapper.vm as ComponentInstance).severity).toBe(severity)
      })
    })
  })

  describe('Content rendering', () => {
    it('should render warning text in symbol', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.find('.warning-symbol-text').text()).toBe('25')
    })

    it('should render empty text when not provided', () => {
      const warningNoText: WarningIconInput = {
        type: 'rain',
        severity: 2,
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warningNoText,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.find('.warning-symbol-text').text()).toBe('')
    })
  })

  describe('CSS classes', () => {
    it('should apply severity level class', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      const symbol = wrapper.find('.symbol-image')
      expect(symbol.classes()).toContain('level-3')
    })

    it('should apply type class', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      const symbol = wrapper.find('.symbol-image')
      expect(symbol.classes()).toContain('wind')
    })

    it('should apply rotation class', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      const symbol = wrapper.find('.symbol-image')
      expect(symbol.classes()).toContain('transform-rotate-270')
    })

    it('should apply symbol-rotate class', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      const symbol = wrapper.find('.symbol-image')
      expect(symbol.classes()).toContain('symbol-rotate-270')
    })

    it('should apply inverted rotation to text', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      const text = wrapper.find('.warning-symbol-text')
      expect(text.classes()).toContain('transform-rotate-90')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label on main element', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      const symbol = wrapper.find('.symbol-image')
      expect(symbol.attributes('aria-label')).toBeDefined()
    })

    it('should have aria-hidden on text span', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      const text = wrapper.find('.warning-symbol-text')
      expect(text.attributes('aria-hidden')).toBe('true')
    })
  })

  describe('Language support', () => {
    it('should support Finnish language', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should support Swedish language', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'sv' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should support English language', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'en' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })
})

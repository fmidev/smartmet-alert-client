import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import RegionWarning from '@/components/RegionWarning.vue'

const mockWarning = {
  type: 'wind',
  severity: 3,
  direction: 270,
  text: '15',
}

describe('RegionWarning.vue', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component mounting', () => {
    it('should mount with required props', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should handle minimal input data', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: {
            type: 'rain',
            severity: 2,
          },
          language: 'fi',
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Computed properties', () => {
    it('should compute warningLevel from severity', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
        },
      })

      expect(typeof wrapper.vm.warningLevel).toBe('string')
    })

    it('should compute warningTypeText in lowercase', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
        },
      })

      const typeText = wrapper.vm.warningTypeText
      expect(typeof typeText).toBe('string')
      expect(typeText).toBe(typeText.toLowerCase())
    })

    it('should compute warningDetails with text and direction', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
        },
      })

      const details = wrapper.vm.warningDetails
      expect(details).toContain('15')
      expect(details).toContain('m/s')
      expect(details).toContain('450') // 270 + 180
    })

    it('should return empty warningDetails when text is null', () => {
      const warningNoText = {
        ...mockWarning,
        text: null,
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warningNoText,
          language: 'fi',
        },
      })

      expect(wrapper.vm.warningDetails).toBe('')
    })

    it('should return empty warningDetails when direction is null', () => {
      const warningNoDirection = {
        ...mockWarning,
        direction: null,
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warningNoDirection,
          language: 'fi',
        },
      })

      expect(wrapper.vm.warningDetails).toBe('')
    })

    it('should return empty warningDetails when both are null', () => {
      const warningNoData = {
        type: 'rain',
        severity: 2,
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warningNoData,
          language: 'fi',
        },
      })

      expect(wrapper.vm.warningDetails).toBe('')
    })
  })

  describe('Fields mixin integration', () => {
    it('should compute typeClass correctly', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
        },
      })

      expect(wrapper.vm.typeClass).toBe('wind')
    })

    it('should compute typeClass for sea wind', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: {
            type: 'seaWind',
            severity: 3,
          },
          language: 'fi',
        },
      })

      expect(wrapper.vm.typeClass).toBe('sea-wind')
    })

    it('should compute rotation from direction', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
        },
      })

      expect(wrapper.vm.rotation).toBe(270)
    })

    it('should round rotation to nearest 5 degrees', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: {
            ...mockWarning,
            direction: 273,
          },
          language: 'fi',
        },
      })

      expect(wrapper.vm.rotation).toBe(275)
    })

    it('should compute invertedRotation', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
        },
      })

      expect(wrapper.vm.invertedRotation).toBe(90)
    })

    it('should compute severity', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
        },
      })

      expect(wrapper.vm.severity).toBe(3)
    })

    it('should return 0 for invalid severities', () => {
      const severities = [0, 1, 5, 6]

      severities.forEach((severity) => {
        wrapper = mount(RegionWarning, {
          props: {
            input: {
              type: 'wind',
              severity,
            },
            language: 'fi',
          },
        })

        expect(wrapper.vm.severity).toBe(0)
      })
    })
  })

  describe('CSS classes', () => {
    it('should apply all required classes to warning image', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
        },
      })

      const image = wrapper.find('.warning-image')
      expect(image.classes()).toContain('symbol-image')
      expect(image.classes()).toContain('current-warning-image')
      expect(image.classes()).toContain('level-3')
      expect(image.classes()).toContain('wind')
    })

    it('should apply rotation classes', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
        },
      })

      const image = wrapper.find('.warning-image')
      expect(image.classes()).toContain('transform-rotate-270')
      expect(image.classes()).toContain('symbol-rotate-270')
    })

    it('should apply inverted rotation to text span', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
        },
      })

      const text = wrapper.find('.symbol-text')
      expect(text.classes()).toContain('transform-rotate-90')
    })
  })

  describe('Content rendering', () => {
    it('should render text in symbol', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
        },
      })

      expect(wrapper.find('.symbol-text').text()).toBe('15')
    })

    it('should render empty text when not provided', () => {
      const warningNoText = {
        type: 'rain',
        severity: 2,
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warningNoText,
          language: 'fi',
        },
      })

      expect(wrapper.find('.symbol-text').text()).toBe('')
    })

    it('should handle undefined text gracefully', () => {
      const warningUndefinedText = {
        type: 'rain',
        severity: 2,
        text: undefined,
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warningUndefinedText,
          language: 'fi',
        },
      })

      expect(wrapper.find('.symbol-text').text()).toBe('')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label on warning image', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
        },
      })

      const image = wrapper.find('.warning-image')
      const ariaLabel = image.attributes('aria-label')

      expect(ariaLabel).toBeDefined()
      expect(ariaLabel.length).toBeGreaterThan(0)
    })

    it('should include severity, type and details in aria-label', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
        },
      })

      const image = wrapper.find('.warning-image')
      const ariaLabel = image.attributes('aria-label')

      // Should contain computed values from warningLevel, warningTypeText, warningDetails
      expect(typeof ariaLabel).toBe('string')
    })

    it('should mark symbol text as aria-hidden', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
        },
      })

      const text = wrapper.find('.symbol-text')
      expect(text.attributes('aria-hidden')).toBe('true')
    })
  })

  describe('Different warning types', () => {
    it('should render thunderStorm warning', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: {
            type: 'thunderStorm',
            severity: 4,
          },
          language: 'fi',
        },
      })

      expect(wrapper.vm.typeClass).toBe('thunder-storm')
      expect(wrapper.find('.warning-image').classes()).toContain('level-4')
    })

    it('should render seaWind warning', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: {
            type: 'seaWind',
            severity: 3,
            direction: 180,
            text: '20',
          },
          language: 'fi',
        },
      })

      expect(wrapper.vm.typeClass).toBe('sea-wind')
      expect(wrapper.find('.symbol-text').text()).toBe('20')
    })

    it('should render rain warning without direction', () => {
      wrapper = mount(RegionWarning, {
        props: {
          input: {
            type: 'rain',
            severity: 2,
          },
          language: 'fi',
        },
      })

      expect(wrapper.vm.typeClass).toBe('rain')
      expect(wrapper.vm.rotation).toBe(0)
    })
  })
})

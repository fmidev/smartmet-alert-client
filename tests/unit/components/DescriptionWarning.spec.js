import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import DescriptionWarning from '@/components/DescriptionWarning.vue'

const mockWarning = {
  type: 'wind',
  severity: 3,
  direction: 270,
  text: '15',
  validInterval: '31.10. 14:00 – 1.11. 14:00',
  info: {
    fi: 'Kovaa tuulta',
    sv: 'Hårt blåsväder',
    en: 'Strong wind',
  },
  link: 'https://example.com/warning',
  linkText: 'More info',
}

describe('DescriptionWarning.vue', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component mounting', () => {
    it('should mount with required props', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Computed properties', () => {
    it('should compute warningTitle from translation', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(typeof wrapper.vm.warningTitle).toBe('string')
    })

    it('should compute warningLevel from severity', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(typeof wrapper.vm.warningLevel).toBe('string')
    })

    it('should compute warningDetails with text and direction', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
          theme: 'light-theme',
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

      wrapper = mount(DescriptionWarning, {
        props: {
          input: warningNoText,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(wrapper.vm.warningDetails).toBe('')
    })

    it('should return empty warningDetails when direction is null', () => {
      const warningNoDirection = {
        ...mockWarning,
        direction: null,
      }

      wrapper = mount(DescriptionWarning, {
        props: {
          input: warningNoDirection,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(wrapper.vm.warningDetails).toBe('')
    })

    it('should compute info from correct language', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(wrapper.vm.info).toBe('Kovaa tuulta')
    })

    it('should compute info in Swedish', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'sv',
          theme: 'light-theme',
        },
      })

      expect(wrapper.vm.info).toBe('Hårt blåsväder')
    })

    it('should compute validText', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(typeof wrapper.vm.validText).toBe('string')
    })

    it('should hide link when link is null', () => {
      const warningNoLink = {
        ...mockWarning,
        link: null,
      }

      wrapper = mount(DescriptionWarning, {
        props: {
          input: warningNoLink,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(wrapper.vm.linkHidden).toBe(true)
    })

    it('should hide link when link is empty string', () => {
      const warningEmptyLink = {
        ...mockWarning,
        link: '',
      }

      wrapper = mount(DescriptionWarning, {
        props: {
          input: warningEmptyLink,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(wrapper.vm.linkHidden).toBe(true)
    })

    it('should show link when link exists', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(wrapper.vm.linkHidden).toBe(false)
    })

    it('should compute description from type and severity', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(typeof wrapper.vm.description).toBe('string')
    })
  })

  describe('Fields mixin integration', () => {
    it('should compute typeClass correctly', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(wrapper.vm.typeClass).toBe('wind')
    })

    it('should compute rotation from direction', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(wrapper.vm.rotation).toBe(270)
    })

    it('should compute invertedRotation', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(wrapper.vm.invertedRotation).toBe(90)
    })

    it('should compute severity', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(wrapper.vm.severity).toBe(3)
    })
  })

  describe('Content rendering', () => {
    it('should render warning title and interval', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      const text = wrapper.text()
      expect(text).toContain('31.10. 14:00 – 1.11. 14:00')
    })

    it('should render info text', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(wrapper.text()).toContain('Kovaa tuulta')
    })

    it('should render external link when present', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      const link = wrapper.find('a.ext-link')
      expect(link.exists()).toBe(true)
      expect(link.attributes('href')).toBe('https://example.com/warning')
      expect(link.text()).toBe('More info')
    })

    it('should hide link when not present', () => {
      const warningNoLink = {
        ...mockWarning,
        link: null,
      }

      wrapper = mount(DescriptionWarning, {
        props: {
          input: warningNoLink,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      const link = wrapper.find('a.ext-link')
      expect(link.classes()).toContain('d-none')
    })

    it('should render text in warning icon', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(wrapper.find('.symbol-text').text()).toBe('15')
    })
  })

  describe('CSS classes', () => {
    it('should apply severity level class', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      const image = wrapper.find('.warning-image')
      expect(image.classes()).toContain('level-3')
    })

    it('should apply type class', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      const image = wrapper.find('.warning-image')
      expect(image.classes()).toContain('wind')
    })

    it('should apply rotation class', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      const image = wrapper.find('.warning-image')
      expect(image.classes()).toContain('transform-rotate-270')
    })

    it('should apply theme class', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
          theme: 'dark-theme',
        },
      })

      expect(wrapper.find('.current-description-row').classes()).toContain(
        'dark-theme'
      )
    })
  })

  describe('Accessibility', () => {
    it('should have aria-label on warning image', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      const image = wrapper.find('.warning-image')
      expect(image.attributes('aria-label')).toBeDefined()
    })

    it('should mark symbol text as aria-hidden', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      expect(
        wrapper
          .find('.current-description-image-cell')
          .attributes('aria-hidden')
      ).toBe('true')
    })

    it('should open link in new tab', () => {
      wrapper = mount(DescriptionWarning, {
        props: {
          input: mockWarning,
          language: 'fi',
          theme: 'light-theme',
        },
      })

      const link = wrapper.find('a.ext-link')
      expect(link.attributes('target')).toBe('_blank')
    })
  })
})

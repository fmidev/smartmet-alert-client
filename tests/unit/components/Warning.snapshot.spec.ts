import { describe, it, expect, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import Warning from '@/components/Warning.vue'
import type { LegendItem, Theme, Language } from '@/types'

describe('Warning.vue Snapshots', () => {
  let wrapper: VueWrapper | null = null

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  describe('Warning type snapshots', () => {
    it('should render wind warning correctly', () => {
      const warning: LegendItem = {
        type: 'wind',
        severity: 3,
        visible: true,
      }

      wrapper = mount(Warning, {
        props: {
          input: warning,
          hideable: true,
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render thunderstorm warning correctly', () => {
      const warning: LegendItem = {
        type: 'thunderStorm',
        severity: 4,
        visible: true,
      }

      wrapper = mount(Warning, {
        props: {
          input: warning,
          hideable: true,
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render rain warning correctly', () => {
      const warning: LegendItem = {
        type: 'rain',
        severity: 2,
        visible: true,
      }

      wrapper = mount(Warning, {
        props: {
          input: warning,
          hideable: true,
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render sea wind warning correctly', () => {
      const warning: LegendItem = {
        type: 'seaWind',
        severity: 3,
        visible: true,
      }

      wrapper = mount(Warning, {
        props: {
          input: warning,
          hideable: true,
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render traffic weather warning correctly', () => {
      const warning: LegendItem = {
        type: 'trafficWeather',
        severity: 2,
        visible: true,
      }

      wrapper = mount(Warning, {
        props: {
          input: warning,
          hideable: true,
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render pedestrian safety warning correctly', () => {
      const warning: LegendItem = {
        type: 'pedestrianSafety',
        severity: 2,
        visible: true,
      }

      wrapper = mount(Warning, {
        props: {
          input: warning,
          hideable: true,
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render forest fire weather warning correctly', () => {
      const warning: LegendItem = {
        type: 'forestFireWeather',
        severity: 3,
        visible: true,
      }

      wrapper = mount(Warning, {
        props: {
          input: warning,
          hideable: true,
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render hot weather warning correctly', () => {
      const warning: LegendItem = {
        type: 'hotWeather',
        severity: 2,
        visible: true,
      }

      wrapper = mount(Warning, {
        props: {
          input: warning,
          hideable: true,
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render cold weather warning correctly', () => {
      const warning: LegendItem = {
        type: 'coldWeather',
        severity: 3,
        visible: true,
      }

      wrapper = mount(Warning, {
        props: {
          input: warning,
          hideable: true,
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render flood level warning correctly', () => {
      const warning: LegendItem = {
        type: 'floodLevel',
        severity: 3,
        visible: true,
      }

      wrapper = mount(Warning, {
        props: {
          input: warning,
          hideable: true,
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('Visibility state snapshots', () => {
    it('should render visible warning correctly', () => {
      const warning: LegendItem = {
        type: 'wind',
        severity: 3,
        visible: true,
      }

      wrapper = mount(Warning, {
        props: {
          input: warning,
          hideable: true,
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render hidden warning correctly', () => {
      const warning: LegendItem = {
        type: 'wind',
        severity: 3,
        visible: false,
      }

      wrapper = mount(Warning, {
        props: {
          input: warning,
          hideable: true,
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('Theme snapshots', () => {
    it('should render with light theme correctly', () => {
      const warning: LegendItem = {
        type: 'wind',
        severity: 3,
        visible: true,
      }

      wrapper = mount(Warning, {
        props: {
          input: warning,
          hideable: true,
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render with dark theme correctly', () => {
      const warning: LegendItem = {
        type: 'wind',
        severity: 3,
        visible: true,
      }

      wrapper = mount(Warning, {
        props: {
          input: warning,
          hideable: true,
          language: 'fi' as Language,
          theme: 'dark-theme' as Theme,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render with light-gray theme correctly', () => {
      const warning: LegendItem = {
        type: 'wind',
        severity: 3,
        visible: true,
      }

      wrapper = mount(Warning, {
        props: {
          input: warning,
          hideable: true,
          language: 'fi' as Language,
          theme: 'light-gray-theme' as Theme,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render with dark-gray theme correctly', () => {
      const warning: LegendItem = {
        type: 'wind',
        severity: 3,
        visible: true,
      }

      wrapper = mount(Warning, {
        props: {
          input: warning,
          hideable: true,
          language: 'fi' as Language,
          theme: 'dark-gray-theme' as Theme,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('Language snapshots', () => {
    it('should render in Finnish correctly', () => {
      const warning: LegendItem = {
        type: 'wind',
        severity: 3,
        visible: true,
      }

      wrapper = mount(Warning, {
        props: {
          input: warning,
          hideable: true,
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render in Swedish correctly', () => {
      const warning: LegendItem = {
        type: 'wind',
        severity: 3,
        visible: true,
      }

      wrapper = mount(Warning, {
        props: {
          input: warning,
          hideable: true,
          language: 'sv' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render in English correctly', () => {
      const warning: LegendItem = {
        type: 'wind',
        severity: 3,
        visible: true,
      }

      wrapper = mount(Warning, {
        props: {
          input: warning,
          hideable: true,
          language: 'en' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('Severity level snapshots', () => {
    it('should render severity level 2 correctly', () => {
      const warning: LegendItem = {
        type: 'wind',
        severity: 2,
        visible: true,
      }

      wrapper = mount(Warning, {
        props: {
          input: warning,
          hideable: true,
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render severity level 3 correctly', () => {
      const warning: LegendItem = {
        type: 'wind',
        severity: 3,
        visible: true,
      }

      wrapper = mount(Warning, {
        props: {
          input: warning,
          hideable: true,
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render severity level 4 correctly', () => {
      const warning: LegendItem = {
        type: 'wind',
        severity: 4,
        visible: true,
      }

      wrapper = mount(Warning, {
        props: {
          input: warning,
          hideable: true,
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('Hideable prop snapshots', () => {
    it('should render with hideable true correctly', () => {
      const warning: LegendItem = {
        type: 'wind',
        severity: 3,
        visible: true,
      }

      wrapper = mount(Warning, {
        props: {
          input: warning,
          hideable: true,
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render with hideable false correctly', () => {
      const warning: LegendItem = {
        type: 'wind',
        severity: 3,
        visible: true,
      }

      wrapper = mount(Warning, {
        props: {
          input: warning,
          hideable: false,
          language: 'fi' as Language,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})

import { describe, it, expect, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import RegionWarning from '@/components/RegionWarning.vue'
import type { WarningIconInput, Language } from '@/types'

describe('RegionWarning.vue Snapshots', () => {
  let wrapper: VueWrapper | null = null

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  describe('Warning type snapshots', () => {
    it('should render wind warning correctly', () => {
      const warning: WarningIconInput = {
        type: 'wind',
        severity: 3,
        direction: 270,
        text: '25',
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warning,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render thunderstorm warning correctly', () => {
      const warning: WarningIconInput = {
        type: 'thunderStorm',
        severity: 4,
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warning,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render rain warning correctly', () => {
      const warning: WarningIconInput = {
        type: 'rain',
        severity: 2,
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warning,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render sea wind warning correctly', () => {
      const warning: WarningIconInput = {
        type: 'seaWind',
        severity: 3,
        direction: 180,
        text: '15',
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warning,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render traffic weather warning correctly', () => {
      const warning: WarningIconInput = {
        type: 'trafficWeather',
        severity: 2,
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warning,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render pedestrian safety warning correctly', () => {
      const warning: WarningIconInput = {
        type: 'pedestrianSafety',
        severity: 2,
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warning,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render forest fire weather warning correctly', () => {
      const warning: WarningIconInput = {
        type: 'forestFireWeather',
        severity: 3,
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warning,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render hot weather warning correctly', () => {
      const warning: WarningIconInput = {
        type: 'hotWeather',
        severity: 2,
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warning,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render cold weather warning correctly', () => {
      const warning: WarningIconInput = {
        type: 'coldWeather',
        severity: 3,
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warning,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render flood level warning correctly', () => {
      const warning: WarningIconInput = {
        type: 'floodLevel',
        severity: 3,
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warning,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('Severity level snapshots', () => {
    it('should render severity level 2 correctly', () => {
      const warning: WarningIconInput = {
        type: 'wind',
        severity: 2,
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warning,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render severity level 3 correctly', () => {
      const warning: WarningIconInput = {
        type: 'wind',
        severity: 3,
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warning,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render severity level 4 correctly', () => {
      const warning: WarningIconInput = {
        type: 'wind',
        severity: 4,
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warning,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('Language snapshots', () => {
    it('should render in Finnish correctly', () => {
      const warning: WarningIconInput = {
        type: 'wind',
        severity: 3,
        direction: 270,
        text: '25',
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warning,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render in Swedish correctly', () => {
      const warning: WarningIconInput = {
        type: 'wind',
        severity: 3,
        direction: 270,
        text: '25',
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warning,
          language: 'sv' as Language,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render in English correctly', () => {
      const warning: WarningIconInput = {
        type: 'wind',
        severity: 3,
        direction: 270,
        text: '25',
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warning,
          language: 'en' as Language,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })
  })

  describe('Rotation snapshots', () => {
    it('should render with north direction correctly', () => {
      const warning: WarningIconInput = {
        type: 'wind',
        severity: 3,
        direction: 0,
        text: '20',
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warning,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render with east direction correctly', () => {
      const warning: WarningIconInput = {
        type: 'wind',
        severity: 3,
        direction: 90,
        text: '20',
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warning,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render with south direction correctly', () => {
      const warning: WarningIconInput = {
        type: 'wind',
        severity: 3,
        direction: 180,
        text: '20',
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warning,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })

    it('should render with west direction correctly', () => {
      const warning: WarningIconInput = {
        type: 'wind',
        severity: 3,
        direction: 270,
        text: '20',
      }

      wrapper = mount(RegionWarning, {
        props: {
          input: warning,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.html()).toMatchSnapshot()
    })
  })
})

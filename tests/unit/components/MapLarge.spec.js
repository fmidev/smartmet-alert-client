import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MapLarge from '@/components/MapLarge.vue'

const mockRegions = {
  land: [],
  sea: [],
}

describe('MapLarge.vue', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component mounting', () => {
    it('should mount with required props', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: false,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should render SVG element', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: false,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('should have correct SVG viewBox', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: false,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('viewBox')).toBe('0 0 440 550')
    })
  })

  describe('Loading state', () => {
    it('should show spinner when loading and spinnerEnabled', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: true,
          spinnerEnabled: true,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      expect(wrapper.find('.spinner-container').exists()).toBe(true)
    })

    it('should not show spinner when not loading', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: false,
          spinnerEnabled: true,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      expect(wrapper.find('.spinner-container').exists()).toBe(false)
    })

    it('should not show spinner when spinnerEnabled is false', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: true,
          spinnerEnabled: false,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      expect(wrapper.find('.spinner-container').exists()).toBe(false)
    })
  })

  describe('Theme support', () => {
    it('should apply theme class', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: false,
          theme: 'dark-theme',
          language: 'fi',
        },
      })

      expect(wrapper.find('.map-large').classes()).toContain('dark-theme')
    })
  })

  describe('Computed properties', () => {
    it('should compute mapText', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: false,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      expect(typeof wrapper.vm.mapText).toBe('string')
    })

    it('should have size Large', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: false,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      expect(wrapper.vm.size).toBe('Large')
    })

    it('should compute strokeWidth based on scale', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: false,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      // strokeWidth is computed: 1 - (scale - 1) / scale
      // Default scale is 1, so: 1 - (1-1)/1 = 1
      expect(wrapper.vm.strokeWidth).toBe('1')
    })

    it('should compute strokeOpacity based on scale', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: false,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      // strokeOpacity is also computed based on scale
      expect(typeof wrapper.vm.strokeOpacity).toBe('string')
    })
  })

  describe('Accessibility', () => {
    it('should have aria-labelledby on SVG', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: false,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('aria-labelledby')).toBe('finland-large-title')
    })

    it('should have role img on SVG', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: false,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('role')).toBe('img')
    })

    it('should be focusable', () => {
      wrapper = mount(MapLarge, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: false,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      const container = wrapper.find('.map-large')
      expect(container.attributes('tabindex')).toBe('0')
    })
  })
})

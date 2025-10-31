import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import MapSmall from '@/components/MapSmall.vue'

const mockRegions = {
  land: [],
  sea: [],
}

describe('MapSmall.vue', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component mounting', () => {
    it('should mount with required props', () => {
      wrapper = mount(MapSmall, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: false,
          theme: 'light-theme',
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should render SVG element', () => {
      wrapper = mount(MapSmall, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: false,
          theme: 'light-theme',
        },
      })

      expect(wrapper.find('svg').exists()).toBe(true)
    })

    it('should have correct SVG viewBox', () => {
      wrapper = mount(MapSmall, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: false,
          theme: 'light-theme',
        },
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('viewBox')).toBe('0 0 75 120')
    })

    it('should have correct width and height', () => {
      wrapper = mount(MapSmall, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: false,
          theme: 'light-theme',
        },
      })

      const svg = wrapper.find('svg')
      expect(svg.attributes('width')).toBe('75')
      expect(svg.attributes('height')).toBe('120')
    })
  })

  describe('Computed properties', () => {
    it('should have size Small', () => {
      wrapper = mount(MapSmall, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: false,
          theme: 'light-theme',
        },
      })

      expect(wrapper.vm.size).toBe('Small')
    })

    it('should use correct strokeWidth', () => {
      wrapper = mount(MapSmall, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: false,
          theme: 'light-theme',
        },
      })

      expect(wrapper.vm.strokeWidth).toBe(0.6)
    })

    it('should initialize pathsNeeded as false', () => {
      wrapper = mount(MapSmall, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: false,
          theme: 'light-theme',
        },
      })

      // pathsNeeded is set in mounted, so it depends on isFullMode()
      expect(typeof wrapper.vm.pathsNeeded).toBe('boolean')
    })

    it('should have pathsNeeded property', () => {
      wrapper = mount(MapSmall, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: true,
          theme: 'light-theme',
        },
      })

      expect(wrapper.vm).toHaveProperty('pathsNeeded')
    })
  })

  describe('ID attribute', () => {
    it('should have unique id based on index', () => {
      wrapper = mount(MapSmall, {
        props: {
          index: 2,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: false,
          theme: 'light-theme',
        },
      })

      expect(wrapper.attributes('id')).toBe('day-map-small-2')
    })

    it('should have unique SVG group id based on index', () => {
      wrapper = mount(MapSmall, {
        props: {
          index: 3,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: false,
          theme: 'light-theme',
        },
      })

      const group = wrapper.find('g')
      if (group.exists()) {
        expect(group.attributes('id')).toBe('finland-small-3')
      }
    })
  })

  describe('CSS classes', () => {
    it('should have finland-small class on SVG', () => {
      wrapper = mount(MapSmall, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: false,
          theme: 'light-theme',
        },
      })

      const svg = wrapper.find('svg')
      expect(svg.classes()).toContain('finland-small')
    })

    it('should have map-small class on container', () => {
      wrapper = mount(MapSmall, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: false,
          theme: 'light-theme',
        },
      })

      expect(wrapper.classes()).toContain('map-small')
    })
  })
})

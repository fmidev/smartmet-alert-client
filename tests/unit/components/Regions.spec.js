import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Regions from '@/components/Regions.vue'

const mockRegionsInput = [
  {
    land: [
      {
        key: 'county.1',
        regionIndex: 0,
        name: 'Uusimaa',
        warnings: [
          {
            type: 'wind',
            identifiers: ['warning-1'],
            coverage: 100,
          },
        ],
      },
      {
        key: 'county.2',
        regionIndex: 1,
        name: 'Varsinais-Suomi',
        warnings: [
          {
            type: 'rain',
            identifiers: ['warning-2'],
            coverage: 75,
          },
        ],
      },
    ],
    sea: [
      {
        key: 'sea_region.B1N',
        regionIndex: 10,
        name: 'Perämeri',
        warnings: [
          {
            type: 'seaWind',
            identifiers: ['warning-3'],
            coverage: 100,
          },
        ],
      },
    ],
  },
]

const mockWarnings = {
  'warning-1': {
    id: 'warning-1',
    type: 'wind',
    severity: 3,
  },
  'warning-2': {
    id: 'warning-2',
    type: 'rain',
    severity: 2,
  },
  'warning-3': {
    id: 'warning-3',
    type: 'seaWind',
    severity: 4,
  },
}

describe('Regions.vue', () => {
  let wrapper

  const mountComponent = (props) => {
    return mount(Regions, {
      props,
      global: {
        stubs: {
          Region: true,
        },
      },
    })
  }

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component mounting', () => {
    it('should mount with required props', () => {
      wrapper = mountComponent({
        input: mockRegionsInput,
        selectedDay: 0,
        warnings: mockWarnings,
        parents: {},
        geometryId: 2021,
        theme: 'light-theme',
        language: 'fi',
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Computed properties', () => {
    it('should compute landText', () => {
      wrapper = mountComponent({
        input: mockRegionsInput,
        selectedDay: 0,
        warnings: mockWarnings,
        parents: {},
        geometryId: 2021,
        theme: 'light-theme',
        language: 'fi',
      })

      expect(typeof wrapper.vm.landText).toBe('string')
    })

    it('should compute seaText', () => {
      wrapper = mountComponent({
        input: mockRegionsInput,
        selectedDay: 0,
        warnings: mockWarnings,
        parents: {},
        geometryId: 2021,
        theme: 'light-theme',
        language: 'fi',
      })

      expect(typeof wrapper.vm.seaText).toBe('string')
    })

    it('should filter regions with coverage criterion', () => {
      wrapper = mountComponent({
        input: mockRegionsInput,
        selectedDay: 0,
        warnings: mockWarnings,
        parents: {},
        geometryId: 2021,
        theme: 'light-theme',
        language: 'fi',
      })

      const regions = wrapper.vm.regions
      expect(regions).toHaveProperty('land')
      expect(regions).toHaveProperty('sea')
      expect(Array.isArray(regions.land)).toBe(true)
      expect(Array.isArray(regions.sea)).toBe(true)
    })

    it('should detect land warnings', () => {
      wrapper = mountComponent({
        input: mockRegionsInput,
        selectedDay: 0,
        warnings: mockWarnings,
        parents: {},
        geometryId: 2021,
        theme: 'light-theme',
        language: 'fi',
      })

      expect(wrapper.vm.anyLandWarnings).toBe(true)
    })

    it('should detect sea warnings', () => {
      wrapper = mountComponent({
        input: mockRegionsInput,
        selectedDay: 0,
        warnings: mockWarnings,
        parents: {},
        geometryId: 2021,
        theme: 'light-theme',
        language: 'fi',
      })

      expect(wrapper.vm.anySeaWarnings).toBe(true)
    })

    it('should return false for no land warnings', () => {
      const noLandInput = [
        {
          land: [],
          sea: [],
        },
      ]

      wrapper = mountComponent({
        input: noLandInput,
        selectedDay: 0,
        warnings: mockWarnings,
        parents: {},
        geometryId: 2021,
        theme: 'light-theme',
        language: 'fi',
      })

      expect(wrapper.vm.anyLandWarnings).toBe(false)
    })

    it('should compute fromLandToNextContentHref correctly with sea warnings', () => {
      wrapper = mountComponent({
        input: mockRegionsInput,
        selectedDay: 0,
        warnings: mockWarnings,
        parents: {},
        geometryId: 2021,
        theme: 'light-theme',
        language: 'fi',
      })

      expect(wrapper.vm.fromLandToNextContentHref).toBe(
        '#fmi-warnings-from-sea-to-next-content'
      )
    })

    it('should compute fromLandToNextContentHref correctly without sea warnings', () => {
      const noSeaInput = [
        {
          land: mockRegionsInput[0].land,
          sea: [],
        },
      ]

      wrapper = mountComponent({
        input: noSeaInput,
        selectedDay: 0,
        warnings: mockWarnings,
        parents: {},
        geometryId: 2021,
        theme: 'light-theme',
        language: 'fi',
      })

      expect(wrapper.vm.fromLandToNextContentHref).toBe(
        '#fmi-warnings-end-of-regions'
      )
    })
  })

  describe('Content rendering', () => {
    it('should render land region header when land warnings exist', () => {
      wrapper = mountComponent({
        input: mockRegionsInput,
        selectedDay: 0,
        warnings: mockWarnings,
        parents: {},
        geometryId: 2021,
        theme: 'light-theme',
        language: 'fi',
      })

      expect(wrapper.find('#header-land').exists()).toBe(true)
    })

    it('should render sea region header when sea warnings exist', () => {
      wrapper = mountComponent({
        input: mockRegionsInput,
        selectedDay: 0,
        warnings: mockWarnings,
        parents: {},
        geometryId: 2021,
        theme: 'light-theme',
        language: 'fi',
      })

      expect(wrapper.find('#header-sea').exists()).toBe(true)
    })

    it('should not render land header when no land warnings', () => {
      const noLandInput = [
        {
          land: [],
          sea: [],
        },
      ]

      wrapper = mountComponent({
        input: noLandInput,
        selectedDay: 0,
        warnings: mockWarnings,
        parents: {},
        geometryId: 2021,
        theme: 'light-theme',
        language: 'fi',
      })

      expect(wrapper.find('#header-land').exists()).toBe(false)
    })

    it('should render Region components', () => {
      wrapper = mountComponent({
        input: mockRegionsInput,
        selectedDay: 0,
        warnings: mockWarnings,
        parents: {},
        geometryId: 2021,
        theme: 'light-theme',
        language: 'fi',
      })

      const regionComponents = wrapper.findAllComponents({ name: 'Region' })
      expect(regionComponents.length).toBeGreaterThan(0)
    })
  })

  describe('Navigation methods', () => {
    it('should have fromLandToNextContentClicked method', () => {
      wrapper = mountComponent({
        input: mockRegionsInput,
        selectedDay: 0,
        warnings: mockWarnings,
        parents: {},
        geometryId: 2021,
        theme: 'light-theme',
        language: 'fi',
      })

      expect(typeof wrapper.vm.fromLandToNextContentClicked).toBe('function')
    })

    it('should have fromSeaToNextContentClicked method', () => {
      wrapper = mountComponent({
        input: mockRegionsInput,
        selectedDay: 0,
        warnings: mockWarnings,
        parents: {},
        geometryId: 2021,
        theme: 'light-theme',
        language: 'fi',
      })

      expect(typeof wrapper.vm.fromSeaToNextContentClicked).toBe('function')
    })
  })
})

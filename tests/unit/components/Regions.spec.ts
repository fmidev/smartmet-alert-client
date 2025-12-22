import { describe, it, expect, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import Regions from '@/components/Regions.vue'
import type {
  RegionsData,
  WarningsMap,
  Warning,
  Theme,
  Language,
} from '@/types'

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
  severity: 3,
  direction: 270,
  value: 25,
  text: '25',
  info: {
    fi: 'Kovaa tuulta',
    sv: 'Hårt blåsväder',
    en: 'Strong wind',
  },
  link: '',
  linkText: '',
}

const mockRegionsData: RegionsData = [
  {
    land: [
      {
        key: 'county.1',
        regionIndex: 1,
        name: 'Uusimaa',
        warnings: [
          {
            type: 'wind',
            identifiers: ['test-warning-1'],
            coverage: 100,
          },
        ],
      },
    ],
    sea: [
      {
        key: 'sea_region.B1N',
        regionIndex: 1,
        name: 'Northern Baltic',
        warnings: [
          {
            type: 'seaWind',
            identifiers: ['test-warning-sea-1'],
            coverage: 100,
          },
        ],
      },
    ],
  },
  { land: [], sea: [] },
  { land: [], sea: [] },
  { land: [], sea: [] },
  { land: [], sea: [] },
]

const mockWarnings: WarningsMap = {
  'test-warning-1': mockWarning,
}

describe('Regions.vue', () => {
  let wrapper: VueWrapper | null = null

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  describe('Component mounting', () => {
    it('should mount with default props', () => {
      wrapper = mount(Regions, {
        props: {},
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should mount with all props', () => {
      wrapper = mount(Regions, {
        props: {
          input: mockRegionsData,
          selectedDay: 0,
          warnings: mockWarnings,
          parents: {},
          geometryId: 2021,
          theme: 'light-theme' as Theme,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Computed properties', () => {
    it('should compute landText from translations', () => {
      wrapper = mount(Regions, {
        props: {
          language: 'fi' as Language,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).landText).toBe('string')
    })

    it('should compute seaText from translations', () => {
      wrapper = mount(Regions, {
        props: {
          language: 'fi' as Language,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).seaText).toBe('string')
    })

    it('should compute fromLandToNextContentText from translations', () => {
      wrapper = mount(Regions, {
        props: {
          input: mockRegionsData,
          selectedDay: 0,
          language: 'fi' as Language,
        },
      })

      expect(
        typeof (wrapper.vm as ComponentInstance).fromLandToNextContentText
      ).toBe('string')
    })

    it('should compute fromSeaToNextContentText from translations', () => {
      wrapper = mount(Regions, {
        props: {
          input: mockRegionsData,
          selectedDay: 0,
          language: 'fi' as Language,
        },
      })

      expect(
        typeof (wrapper.vm as ComponentInstance).fromSeaToNextContentText
      ).toBe('string')
    })

    it('should compute regions for selected day', () => {
      wrapper = mount(Regions, {
        props: {
          input: mockRegionsData,
          selectedDay: 0,
        },
      })

      const regions = (wrapper.vm as ComponentInstance).regions
      expect(regions).toBeDefined()
      expect(regions.land).toBeDefined()
      expect(regions.sea).toBeDefined()
    })

    it('should return empty regions for empty input', () => {
      wrapper = mount(Regions, {
        props: {
          input: [],
          selectedDay: 0,
        },
      })

      const regions = (wrapper.vm as ComponentInstance).regions
      expect(regions.land).toEqual([])
      expect(regions.sea).toEqual([])
    })

    it('should compute anyLandWarnings', () => {
      wrapper = mount(Regions, {
        props: {
          input: mockRegionsData,
          selectedDay: 0,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).anyLandWarnings).toBe(
        'boolean'
      )
    })

    it('should compute anySeaWarnings', () => {
      wrapper = mount(Regions, {
        props: {
          input: mockRegionsData,
          selectedDay: 0,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).anySeaWarnings).toBe(
        'boolean'
      )
    })

    it('should compute fromLandToNextContentHref based on sea warnings', () => {
      wrapper = mount(Regions, {
        props: {
          input: mockRegionsData,
          selectedDay: 0,
        },
      })

      expect(
        typeof (wrapper.vm as ComponentInstance).fromLandToNextContentHref
      ).toBe('string')
    })

    it('should compute fromSeaToNextContentId based on land warnings', () => {
      wrapper = mount(Regions, {
        props: {
          input: mockRegionsData,
          selectedDay: 0,
        },
      })

      expect(
        typeof (wrapper.vm as ComponentInstance).fromSeaToNextContentId
      ).toBe('string')
    })
  })

  describe('Methods', () => {
    it('should have anyRegionWarnings method', () => {
      wrapper = mount(Regions, {
        props: {
          input: mockRegionsData,
          selectedDay: 0,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).anyRegionWarnings).toBe(
        'function'
      )
    })

    it('should return true for land with warnings', () => {
      wrapper = mount(Regions, {
        props: {
          input: mockRegionsData,
          selectedDay: 0,
        },
      })

      expect((wrapper.vm as ComponentInstance).anyRegionWarnings('land')).toBe(
        true
      )
    })

    it('should return true for sea with warnings', () => {
      wrapper = mount(Regions, {
        props: {
          input: mockRegionsData,
          selectedDay: 0,
        },
      })

      expect((wrapper.vm as ComponentInstance).anyRegionWarnings('sea')).toBe(
        true
      )
    })

    it('should return false for day without warnings', () => {
      wrapper = mount(Regions, {
        props: {
          input: mockRegionsData,
          selectedDay: 1,
        },
      })

      expect((wrapper.vm as ComponentInstance).anyRegionWarnings('land')).toBe(
        false
      )
    })

    it('should have fromLandToNextContentClicked method', () => {
      wrapper = mount(Regions, {
        props: {},
      })

      expect(
        typeof (wrapper.vm as ComponentInstance).fromLandToNextContentClicked
      ).toBe('function')
    })

    it('should have fromSeaToNextContentClicked method', () => {
      wrapper = mount(Regions, {
        props: {},
      })

      expect(
        typeof (wrapper.vm as ComponentInstance).fromSeaToNextContentClicked
      ).toBe('function')
    })
  })

  describe('Props handling', () => {
    it('should accept selectedDay prop', () => {
      wrapper = mount(Regions, {
        props: {
          selectedDay: 2,
        },
      })

      expect((wrapper.vm as ComponentInstance).selectedDay).toBe(2)
    })

    it('should accept parents prop', () => {
      const parents = { 'county.1': [true, false, false, false, false] }

      wrapper = mount(Regions, {
        props: {
          parents,
        },
      })

      expect((wrapper.vm as ComponentInstance).parents).toEqual(parents)
    })

    it('should accept geometryId prop', () => {
      wrapper = mount(Regions, {
        props: {
          geometryId: 2021,
        },
      })

      expect((wrapper.vm as ComponentInstance).geometryId).toBe(2021)
    })

    it('should accept warnings prop', () => {
      wrapper = mount(Regions, {
        props: {
          warnings: mockWarnings,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Theme support', () => {
    it('should accept theme prop', () => {
      wrapper = mount(Regions, {
        props: {
          theme: 'dark-theme' as Theme,
        },
      })

      expect((wrapper.vm as ComponentInstance).theme).toBe('dark-theme')
    })

    it('should default to light-theme', () => {
      wrapper = mount(Regions, {
        props: {},
      })

      expect((wrapper.vm as ComponentInstance).theme).toBe('light-theme')
    })
  })

  describe('Language support', () => {
    it('should support Finnish language', () => {
      wrapper = mount(Regions, {
        props: {
          language: 'fi' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should support Swedish language', () => {
      wrapper = mount(Regions, {
        props: {
          language: 'sv' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should support English language', () => {
      wrapper = mount(Regions, {
        props: {
          language: 'en' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Structure', () => {
    it('should render region-warnings container', () => {
      wrapper = mount(Regions, {
        props: {},
      })

      expect(wrapper.find('#region-warnings').exists()).toBe(true)
    })

    it('should render land header when land warnings exist', () => {
      wrapper = mount(Regions, {
        props: {
          input: mockRegionsData,
          selectedDay: 0,
        },
      })

      expect(wrapper.find('#header-land').exists()).toBe(true)
    })

    it('should render sea header when sea warnings exist', () => {
      wrapper = mount(Regions, {
        props: {
          input: mockRegionsData,
          selectedDay: 0,
        },
      })

      expect(wrapper.find('#header-sea').exists()).toBe(true)
    })

    it('should not render land section when no land warnings', () => {
      wrapper = mount(Regions, {
        props: {
          input: mockRegionsData,
          selectedDay: 1,
        },
      })

      expect(wrapper.find('#header-land').exists()).toBe(false)
    })

    it('should not render sea section when no sea warnings', () => {
      wrapper = mount(Regions, {
        props: {
          input: mockRegionsData,
          selectedDay: 1,
        },
      })

      expect(wrapper.find('#header-sea').exists()).toBe(false)
    })

    it('should render accordion groups', () => {
      wrapper = mount(Regions, {
        props: {
          input: mockRegionsData,
          selectedDay: 0,
        },
      })

      expect(wrapper.find('#accordion-group-land').exists()).toBe(true)
      expect(wrapper.find('#accordion-group-sea').exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have skip link for land content', () => {
      wrapper = mount(Regions, {
        props: {
          input: mockRegionsData,
          selectedDay: 0,
        },
      })

      const skipLink = wrapper.find('#fmi-warnings-region-content')
      expect(skipLink.exists()).toBe(true)
      expect(skipLink.classes()).toContain('visually-hidden-focusable')
    })

    it('should have end of regions marker', () => {
      wrapper = mount(Regions, {
        props: {},
      })

      expect(wrapper.find('#fmi-warnings-end-of-regions').exists()).toBe(true)
    })
  })
})

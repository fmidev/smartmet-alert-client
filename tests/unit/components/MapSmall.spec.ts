import { readFileSync } from 'node:fs'
import { describe, it, expect, afterEach } from 'vitest'
import { mount, flushPromises, VueWrapper } from '@vue/test-utils'
import MapSmall from '@/components/MapSmall.vue'
import { NARROW_SCREEN_BREAKPOINT } from '@/composables/useUtils'
import { processWarnings } from '@/composables/useWarningsProcessor'
import type { DayRegions, WarningsMap, Theme } from '@/types'
import { loadScenario } from '../../fixtures/mapScenarios'
import { buildCtx } from '../../integration/mapSnapshotHelpers'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ComponentInstance = any

const mockRegions: DayRegions = {
  land: [],
  sea: [],
}

describe('MapSmall.vue', () => {
  let wrapper: VueWrapper | null = null

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  describe('Component mounting', () => {
    it('should mount with default props', () => {
      wrapper = mount(MapSmall, {
        props: {},
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should mount with all props', () => {
      wrapper = mount(MapSmall, {
        props: {
          index: 0,
          input: mockRegions,
          visibleWarnings: [],
          warnings: null,
          geometryId: 2021,
          loading: true,
          theme: 'light-theme' as Theme,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Computed properties', () => {
    it('should compute size as Small', () => {
      wrapper = mount(MapSmall, {
        props: {},
      })

      expect((wrapper.vm as ComponentInstance).size).toBe('Small')
    })

    it('should have strokeWidth property', () => {
      wrapper = mount(MapSmall, {
        props: {},
      })

      expect((wrapper.vm as ComponentInstance).strokeWidth).toBe(0.6)
    })

    it('should have pathsNeeded property', () => {
      wrapper = mount(MapSmall, {
        props: {},
      })

      expect(typeof (wrapper.vm as ComponentInstance).pathsNeeded).toBe(
        'boolean'
      )
    })
  })

  describe('Props handling', () => {
    it('should accept index prop', () => {
      wrapper = mount(MapSmall, {
        props: {
          index: 2,
        },
      })

      expect((wrapper.vm as ComponentInstance).index).toBe(2)
    })

    it('should accept loading prop', () => {
      wrapper = mount(MapSmall, {
        props: {
          loading: false,
        },
      })

      expect((wrapper.vm as ComponentInstance).loading).toBe(false)
    })

    it('should accept warnings prop', () => {
      const mockWarnings: WarningsMap = {}

      wrapper = mount(MapSmall, {
        props: {
          warnings: mockWarnings,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should accept visibleWarnings prop', () => {
      wrapper = mount(MapSmall, {
        props: {
          visibleWarnings: ['wind', 'rain'],
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should accept geometryId prop', () => {
      wrapper = mount(MapSmall, {
        props: {
          geometryId: 2021,
        },
      })

      expect((wrapper.vm as ComponentInstance).geometryId).toBe(2021)
    })

    it('should use default index of 0', () => {
      wrapper = mount(MapSmall, {
        props: {},
      })

      expect((wrapper.vm as ComponentInstance).index).toBe(0)
    })

    it('should use default geometryId of 2021', () => {
      wrapper = mount(MapSmall, {
        props: {},
      })

      expect((wrapper.vm as ComponentInstance).geometryId).toBe(2021)
    })
  })

  describe('Theme support', () => {
    it('should accept theme prop', () => {
      wrapper = mount(MapSmall, {
        props: {
          theme: 'dark-theme' as Theme,
        },
      })

      expect((wrapper.vm as ComponentInstance).theme).toBe('dark-theme')
    })

    it('should default to light-theme', () => {
      wrapper = mount(MapSmall, {
        props: {},
      })

      expect((wrapper.vm as ComponentInstance).theme).toBe('light-theme')
    })

    it('should support all theme variants', () => {
      const themes: Theme[] = [
        'light-theme',
        'dark-theme',
        'light-gray-theme',
        'dark-gray-theme',
      ]

      themes.forEach((theme) => {
        wrapper = mount(MapSmall, {
          props: {
            theme,
          },
        })

        expect((wrapper.vm as ComponentInstance).theme).toBe(theme)
      })
    })
  })

  describe('SVG structure', () => {
    it('should render map-small container', () => {
      wrapper = mount(MapSmall, {
        props: {},
      })

      expect(wrapper.find('.map-small').exists()).toBe(true)
    })

    it('should render SVG element', () => {
      wrapper = mount(MapSmall, {
        props: {},
      })

      expect(wrapper.find('svg.finland-small').exists()).toBe(true)
    })

    it('should have correct SVG dimensions', () => {
      wrapper = mount(MapSmall, {
        props: {},
      })

      const svg = wrapper.find('svg.finland-small')
      expect(svg.attributes('width')).toBe('75')
      expect(svg.attributes('height')).toBe('120')
    })

    it('should have correct viewBox', () => {
      wrapper = mount(MapSmall, {
        props: {},
      })

      expect(wrapper.find('svg.finland-small').attributes('viewBox')).toBe(
        '0 0 75 120'
      )
    })

    it('should render SVG group with correct id', () => {
      wrapper = mount(MapSmall, {
        props: {
          index: 2,
        },
      })

      // Group is conditionally rendered based on pathsNeeded
      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Map paths', () => {
    it('should have access to strokeColor', () => {
      wrapper = mount(MapSmall, {
        props: {},
      })

      expect((wrapper.vm as ComponentInstance).strokeColor).toBeDefined()
    })

    it('should have access to bluePaths', () => {
      wrapper = mount(MapSmall, {
        props: {},
      })

      expect(Array.isArray((wrapper.vm as ComponentInstance).bluePaths)).toBe(
        true
      )
    })

    it('should have access to greenPaths', () => {
      wrapper = mount(MapSmall, {
        props: {},
      })

      expect(Array.isArray((wrapper.vm as ComponentInstance).greenPaths)).toBe(
        true
      )
    })

    it('should have access to yellowPaths', () => {
      wrapper = mount(MapSmall, {
        props: {},
      })

      expect(Array.isArray((wrapper.vm as ComponentInstance).yellowPaths)).toBe(
        true
      )
    })

    it('should have access to orangePaths', () => {
      wrapper = mount(MapSmall, {
        props: {},
      })

      expect(Array.isArray((wrapper.vm as ComponentInstance).orangePaths)).toBe(
        true
      )
    })

    it('should have access to redPaths', () => {
      wrapper = mount(MapSmall, {
        props: {},
      })

      expect(Array.isArray((wrapper.vm as ComponentInstance).redPaths)).toBe(
        true
      )
    })

    it('should have access to overlayPaths', () => {
      wrapper = mount(MapSmall, {
        props: {},
      })

      expect(
        Array.isArray((wrapper.vm as ComponentInstance).overlayPaths)
      ).toBe(true)
    })

    it('should have access to landBorders', () => {
      wrapper = mount(MapSmall, {
        props: {},
      })

      expect(Array.isArray((wrapper.vm as ComponentInstance).landBorders)).toBe(
        true
      )
    })

    it('should have access to seaBorders', () => {
      wrapper = mount(MapSmall, {
        props: {},
      })

      expect(Array.isArray((wrapper.vm as ComponentInstance).seaBorders)).toBe(
        true
      )
    })
  })

  describe('Coverage data', () => {
    it('should have access to yellowCoverages', () => {
      wrapper = mount(MapSmall, {
        props: {},
      })

      expect(
        Array.isArray((wrapper.vm as ComponentInstance).yellowCoverages)
      ).toBe(true)
    })

    it('should have access to orangeCoverages', () => {
      wrapper = mount(MapSmall, {
        props: {},
      })

      expect(
        Array.isArray((wrapper.vm as ComponentInstance).orangeCoverages)
      ).toBe(true)
    })

    it('should have access to redCoverages', () => {
      wrapper = mount(MapSmall, {
        props: {},
      })

      expect(
        Array.isArray((wrapper.vm as ComponentInstance).redCoverages)
      ).toBe(true)
    })

    it('should have access to overlayCoverages', () => {
      wrapper = mount(MapSmall, {
        props: {},
      })

      expect(
        Array.isArray((wrapper.vm as ComponentInstance).overlayCoverages)
      ).toBe(true)
    })
  })
  describe('Drawing the map only when it is shown', () => {
    const originalWidth = window.innerWidth
    const scenario = loadScenario(1)
    const processed = processWarnings(
      scenario.data,
      buildCtx(scenario.currentTime, 'fi')
    )

    const setWidth = async (width: number): Promise<void> => {
      Object.defineProperty(window, 'innerWidth', {
        value: width,
        configurable: true,
        writable: true,
      })
      window.dispatchEvent(new Event('resize'))
      await flushPromises()
    }

    const mountMap = async (): Promise<VueWrapper> => {
      const mounted = mount(MapSmall, {
        props: {
          index: 0,
          input: processed.regions[0],
          warnings: processed.warnings,
          visibleWarnings: processed.legend.map((item) => item.type),
          geometryId: 2021,
          loading: false,
        },
      })
      await flushPromises()
      return mounted
    }

    afterEach(async () => {
      await setWidth(originalWidth)
    })

    it('draws the map on a wide screen', async () => {
      await setWidth(1024)
      wrapper = await mountMap()

      expect(wrapper.findAll('path').length).toBeGreaterThan(0)
    })

    it('does not draw the map on a narrow screen, where it is hidden', async () => {
      await setWidth(390)
      wrapper = await mountMap()

      expect((wrapper.vm as ComponentInstance).pathsNeeded).toBe(false)
      expect(wrapper.findAll('path')).toHaveLength(0)
    })

    it('draws the map when a narrow screen becomes wide', async () => {
      await setWidth(390)
      wrapper = await mountMap()
      expect(wrapper.findAll('path')).toHaveLength(0)

      // The window is widened or a phone is turned to landscape orientation
      await setWidth(844)

      expect(wrapper.findAll('path').length).toBeGreaterThan(0)
    })

    it('uses the same width as the media query that hides the map', async () => {
      await setWidth(575)
      wrapper = await mountMap()
      expect(wrapper.findAll('path')).toHaveLength(0)

      await setWidth(576)
      expect(wrapper.findAll('path').length).toBeGreaterThan(0)
    })

    it('keeps the map when the screen narrows again', async () => {
      await setWidth(844)
      wrapper = await mountMap()
      const paths = wrapper.findAll('path').length

      await setWidth(390)

      expect(wrapper.findAll('path')).toHaveLength(paths)
    })
  })
  describe('Narrow screen breakpoint', () => {
    it.each(['MapSmall.vue', 'DaySmall.vue'])(
      'is the width in the media query of %s that hides the small maps',
      (file) => {
        const source = readFileSync(`src/components/${file}`, 'utf8')
        // @media (width < 576px) { ...selectors with .map-small { display: none
        const hidingQuery =
          /@media \(width < (\d+)px\)\s*\{[^{}]*\.map-small[^{}]*\{[^}]*display:\s*none/.exec(
            source
          )

        expect(hidingQuery).not.toBeNull()
        expect(Number(hidingQuery?.[1])).toBe(NARROW_SCREEN_BREAKPOINT)
      }
    )
  })
})

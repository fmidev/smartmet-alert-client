import { describe, it, expect, afterEach } from 'vitest'
import { mount, VueWrapper } from '@vue/test-utils'
import Region from '@/components/Region.vue'
import type {
  RegionWarningItem,
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

const mockRegionWarnings: RegionWarningItem[] = [
  {
    type: 'wind',
    identifiers: ['test-warning-1'],
    coverage: 100,
  },
]

const mockWarnings: WarningsMap = {
  'test-warning-1': mockWarning,
}

describe('Region.vue', () => {
  let wrapper: VueWrapper | null = null

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
      wrapper = null
    }
  })

  describe('Component mounting', () => {
    it('should mount with required props', () => {
      wrapper = mount(Region, {
        props: {
          type: 'land',
          code: 'county.1',
          name: 'Uusimaa',
          input: mockRegionWarnings,
          warnings: mockWarnings,
          theme: 'light-theme' as Theme,
          language: 'fi' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should mount with minimal props', () => {
      wrapper = mount(Region, {
        props: {},
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Computed properties', () => {
    it('should compute identifier from code', () => {
      wrapper = mount(Region, {
        props: {
          code: 'county.1',
        },
      })

      expect((wrapper.vm as ComponentInstance).identifier).toBe(
        'accordion-item-county.1'
      )
    })

    it('should compute regionName from translations', () => {
      wrapper = mount(Region, {
        props: {
          name: 'Uusimaa',
          language: 'fi' as Language,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).regionName).toBe('string')
    })

    it('should compute warningsSummary from input and warnings', () => {
      wrapper = mount(Region, {
        props: {
          input: mockRegionWarnings,
          warnings: mockWarnings,
        },
      })

      const summary = (wrapper.vm as ComponentInstance).warningsSummary
      expect(Array.isArray(summary)).toBe(true)
      expect(summary.length).toBe(1)
    })

    it('should return empty warningsSummary when no warnings match', () => {
      wrapper = mount(Region, {
        props: {
          input: mockRegionWarnings,
          warnings: {},
        },
      })

      expect((wrapper.vm as ComponentInstance).warningsSummary).toEqual([])
    })

    it('should compute reducedWarnings from input and warnings', () => {
      wrapper = mount(Region, {
        props: {
          input: mockRegionWarnings,
          warnings: mockWarnings,
        },
      })

      const reduced = (wrapper.vm as ComponentInstance).reducedWarnings
      expect(Array.isArray(reduced)).toBe(true)
    })

    it('should compute ariaButton from translations', () => {
      wrapper = mount(Region, {
        props: {
          name: 'Uusimaa',
          language: 'fi' as Language,
        },
      })

      expect(typeof (wrapper.vm as ComponentInstance).ariaButton).toBe('string')
    })

    it('should compute ariaInfo from warnings', () => {
      wrapper = mount(Region, {
        props: {
          input: mockRegionWarnings,
          warnings: mockWarnings,
          language: 'fi' as Language,
        },
      })

      expect(Array.isArray((wrapper.vm as ComponentInstance).ariaInfo)).toBe(
        true
      )
    })
  })

  describe('State management', () => {
    it('should start with open state as false', () => {
      wrapper = mount(Region, {
        props: {},
      })

      expect((wrapper.vm as ComponentInstance).open).toBe(false)
    })

    it('should toggle open state on onRegionToggle', () => {
      wrapper = mount(Region, {
        props: {},
      })

      expect((wrapper.vm as ComponentInstance).open).toBe(false)
      ;(wrapper.vm as ComponentInstance).onRegionToggle()

      expect((wrapper.vm as ComponentInstance).open).toBe(true)
      ;(wrapper.vm as ComponentInstance).onRegionToggle()

      expect((wrapper.vm as ComponentInstance).open).toBe(false)
    })
  })

  describe('Props handling', () => {
    it('should accept type prop', () => {
      wrapper = mount(Region, {
        props: {
          type: 'sea',
        },
      })

      expect((wrapper.vm as ComponentInstance).type).toBe('sea')
    })

    it('should accept code prop', () => {
      wrapper = mount(Region, {
        props: {
          code: 'county.2',
        },
      })

      expect((wrapper.vm as ComponentInstance).code).toBe('county.2')
    })

    it('should accept name prop', () => {
      wrapper = mount(Region, {
        props: {
          name: 'Varsinais-Suomi',
        },
      })

      expect((wrapper.vm as ComponentInstance).name).toBe('Varsinais-Suomi')
    })

    it('should accept input prop', () => {
      wrapper = mount(Region, {
        props: {
          input: mockRegionWarnings,
        },
      })

      expect((wrapper.vm as ComponentInstance).input).toEqual(
        mockRegionWarnings
      )
    })

    it('should accept warnings prop', () => {
      wrapper = mount(Region, {
        props: {
          warnings: mockWarnings,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Theme support', () => {
    it('should accept theme prop', () => {
      wrapper = mount(Region, {
        props: {
          theme: 'dark-theme' as Theme,
        },
      })

      expect((wrapper.vm as ComponentInstance).theme).toBe('dark-theme')
    })

    it('should default to light-theme', () => {
      wrapper = mount(Region, {
        props: {},
      })

      expect((wrapper.vm as ComponentInstance).theme).toBe('light-theme')
    })
  })

  describe('Language support', () => {
    it('should support Finnish language', () => {
      wrapper = mount(Region, {
        props: {
          language: 'fi' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should support Swedish language', () => {
      wrapper = mount(Region, {
        props: {
          language: 'sv' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should support English language', () => {
      wrapper = mount(Region, {
        props: {
          language: 'en' as Language,
        },
      })

      expect(wrapper.exists()).toBe(true)
    })
  })

  describe('Accessibility', () => {
    it('should have accordion button with correct aria attributes', () => {
      wrapper = mount(Region, {
        props: {
          code: 'county.1',
        },
      })

      const button = wrapper.find('.accordion-trigger')
      expect(button.attributes('aria-expanded')).toBe('false')
      expect(button.attributes('aria-controls')).toBe(
        'accordion-section-county.1'
      )
    })

    it('should update aria-expanded when toggled', async () => {
      wrapper = mount(Region, {
        props: {
          code: 'county.1',
        },
      })
      ;(wrapper.vm as ComponentInstance).onRegionToggle()
      await wrapper.vm.$nextTick()

      const button = wrapper.find('.accordion-trigger')
      expect(button.attributes('aria-expanded')).toBe('true')
    })

    it('should have accordion panel with role region', () => {
      wrapper = mount(Region, {
        props: {
          code: 'county.1',
        },
      })

      const panel = wrapper.find('.accordion-panel')
      expect(panel.attributes('role')).toBe('region')
    })
  })

  describe('CSS classes', () => {
    it('should apply collapsed class when closed', () => {
      wrapper = mount(Region, {
        props: {},
      })

      const button = wrapper.find('.accordion-trigger')
      expect(button.classes()).toContain('collapsed')
    })

    it('should remove collapsed class when open', async () => {
      wrapper = mount(Region, {
        props: {},
      })
      ;(wrapper.vm as ComponentInstance).onRegionToggle()
      await wrapper.vm.$nextTick()

      const button = wrapper.find('.accordion-trigger')
      expect(button.classes()).not.toContain('collapsed')
    })

    it('should apply collapsed class to toggle icon when closed', () => {
      wrapper = mount(Region, {
        props: {},
      })

      const toggle = wrapper.find('.current-warning-toggle')
      expect(toggle.classes()).toContain('collapsed')
    })
  })
})

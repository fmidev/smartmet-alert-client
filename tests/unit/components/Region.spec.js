import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import Region from '@/components/Region.vue'

const mockWarningInput = [
  {
    type: 'wind',
    identifiers: ['warning-1', 'warning-2'],
    coverage: 100,
  },
  {
    type: 'rain',
    identifiers: ['warning-3'],
    coverage: 50,
  },
]

const mockWarnings = {
  'warning-1': {
    id: 'warning-1',
    type: 'wind',
    severity: 3,
    info: {
      fi: 'Tuulivaroitus',
      sv: 'Vindvarning',
      en: 'Wind warning',
    },
  },
  'warning-2': {
    id: 'warning-2',
    type: 'wind',
    severity: 4,
    info: {
      fi: 'Toinen tuulivaroitus',
      sv: 'Andra vindvarning',
      en: 'Second wind warning',
    },
  },
  'warning-3': {
    id: 'warning-3',
    type: 'rain',
    severity: 2,
    info: {
      fi: 'Sadevaroitus',
      sv: 'Regnvarning',
      en: 'Rain warning',
    },
  },
}

describe('Region.vue', () => {
  let wrapper

  afterEach(() => {
    if (wrapper) {
      wrapper.unmount()
    }
  })

  describe('Component mounting', () => {
    it('should mount with required props', () => {
      wrapper = mount(Region, {
        props: {
          type: 'land',
          code: 'county.1',
          name: 'Uusimaa',
          input: mockWarningInput,
          warnings: mockWarnings,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      expect(wrapper.exists()).toBe(true)
    })

    it('should initialize with open false', () => {
      wrapper = mount(Region, {
        props: {
          type: 'land',
          code: 'county.1',
          name: 'Uusimaa',
          input: mockWarningInput,
          warnings: mockWarnings,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      expect(wrapper.vm.open).toBe(false)
    })
  })

  describe('Computed properties', () => {
    it('should compute identifier from code', () => {
      wrapper = mount(Region, {
        props: {
          type: 'land',
          code: 'county.1',
          name: 'Uusimaa',
          input: mockWarningInput,
          warnings: mockWarnings,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      expect(wrapper.vm.identifier).toBe('accordion-item-county.1')
    })

    it('should compute regionName from translation', () => {
      wrapper = mount(Region, {
        props: {
          type: 'land',
          code: 'county.1',
          name: 'Uusimaa',
          input: mockWarningInput,
          warnings: mockWarnings,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      expect(typeof wrapper.vm.regionName).toBe('string')
    })

    it('should compute warningsSummary from input', () => {
      wrapper = mount(Region, {
        props: {
          type: 'land',
          code: 'county.1',
          name: 'Uusimaa',
          input: mockWarningInput,
          warnings: mockWarnings,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      expect(Array.isArray(wrapper.vm.warningsSummary)).toBe(true)
      expect(wrapper.vm.warningsSummary.length).toBeGreaterThan(0)
    })

    it('should filter warnings by coverage criterion', () => {
      wrapper = mount(Region, {
        props: {
          type: 'land',
          code: 'county.1',
          name: 'Uusimaa',
          input: mockWarningInput,
          warnings: mockWarnings,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      // Coverage >= 20% should be included
      const summary = wrapper.vm.warningsSummary
      expect(summary.some((w) => w.type === 'wind')).toBe(true)
    })

    it('should compute reducedWarnings with all warning details', () => {
      wrapper = mount(Region, {
        props: {
          type: 'land',
          code: 'county.1',
          name: 'Uusimaa',
          input: mockWarningInput,
          warnings: mockWarnings,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      const reduced = wrapper.vm.reducedWarnings
      expect(Array.isArray(reduced)).toBe(true)
      expect(reduced.length).toBeGreaterThanOrEqual(
        wrapper.vm.warningsSummary.length
      )
    })

    it('should compute ariaButton based on open state', () => {
      wrapper = mount(Region, {
        props: {
          type: 'land',
          code: 'county.1',
          name: 'Uusimaa',
          input: mockWarningInput,
          warnings: mockWarnings,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      const closedLabel = wrapper.vm.ariaButton
      wrapper.vm.open = true
      const openLabel = wrapper.vm.ariaButton

      expect(closedLabel).not.toBe(openLabel)
      expect(typeof closedLabel).toBe('string')
      expect(typeof openLabel).toBe('string')
    })

    it('should compute ariaInfo with warning details', () => {
      wrapper = mount(Region, {
        props: {
          type: 'land',
          code: 'county.1',
          name: 'Uusimaa',
          input: mockWarningInput,
          warnings: mockWarnings,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      const ariaInfo = wrapper.vm.ariaInfo
      expect(Array.isArray(ariaInfo)).toBe(true)
      expect(ariaInfo.length).toBe(wrapper.vm.reducedWarnings.length)
    })
  })

  describe('Toggle functionality', () => {
    it('should toggle open state on region toggle', () => {
      wrapper = mount(Region, {
        props: {
          type: 'land',
          code: 'county.1',
          name: 'Uusimaa',
          input: mockWarningInput,
          warnings: mockWarnings,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      const initialOpen = wrapper.vm.open
      wrapper.vm.onRegionToggle()
      expect(wrapper.vm.open).toBe(!initialOpen)
    })

    it('should apply correct aria-expanded attribute', async () => {
      wrapper = mount(Region, {
        props: {
          type: 'land',
          code: 'county.1',
          name: 'Uusimaa',
          input: mockWarningInput,
          warnings: mockWarnings,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      const trigger = wrapper.find('.accordion-trigger')
      expect(trigger.attributes('aria-expanded')).toBe('false')

      wrapper.vm.open = true
      await wrapper.vm.$nextTick()

      expect(trigger.attributes('aria-expanded')).toBe('true')
    })

    it('should apply collapsed class when closed', () => {
      wrapper = mount(Region, {
        props: {
          type: 'land',
          code: 'county.1',
          name: 'Uusimaa',
          input: mockWarningInput,
          warnings: mockWarnings,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      const trigger = wrapper.find('.accordion-trigger')
      expect(trigger.classes()).toContain('collapsed')
    })

    it('should not apply collapsed class when open', async () => {
      wrapper = mount(Region, {
        props: {
          type: 'land',
          code: 'county.1',
          name: 'Uusimaa',
          input: mockWarningInput,
          warnings: mockWarnings,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      wrapper.vm.open = true
      await wrapper.vm.$nextTick()

      const trigger = wrapper.find('.accordion-trigger')
      expect(trigger.classes()).not.toContain('collapsed')
    })
  })

  describe('Content rendering', () => {
    it('should render region name', () => {
      wrapper = mount(Region, {
        props: {
          type: 'land',
          code: 'county.1',
          name: 'Uusimaa',
          input: mockWarningInput,
          warnings: mockWarnings,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      expect(wrapper.text()).toContain(wrapper.vm.regionName)
    })

    it('should render RegionWarning components', () => {
      wrapper = mount(Region, {
        props: {
          type: 'land',
          code: 'county.1',
          name: 'Uusimaa',
          input: mockWarningInput,
          warnings: mockWarnings,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      const regionWarnings = wrapper.findAllComponents({
        name: 'RegionWarning',
      })
      expect(regionWarnings.length).toBe(wrapper.vm.warningsSummary.length)
    })

    it('should hide accordion panel when closed', () => {
      wrapper = mount(Region, {
        props: {
          type: 'land',
          code: 'county.1',
          name: 'Uusimaa',
          input: mockWarningInput,
          warnings: mockWarnings,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      const panel = wrapper.find('.accordion-panel')
      expect(panel.attributes('hidden')).toBe('')
    })

    it('should show accordion panel when open', async () => {
      wrapper = mount(Region, {
        props: {
          type: 'land',
          code: 'county.1',
          name: 'Uusimaa',
          input: mockWarningInput,
          warnings: mockWarnings,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      wrapper.vm.open = true
      await wrapper.vm.$nextTick()

      const panel = wrapper.find('.accordion-panel')
      expect(panel.attributes('hidden')).toBeUndefined()
    })
  })

  describe('Accessibility', () => {
    it('should have correct aria-controls attribute', () => {
      wrapper = mount(Region, {
        props: {
          type: 'land',
          code: 'county.1',
          name: 'Uusimaa',
          input: mockWarningInput,
          warnings: mockWarnings,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      const trigger = wrapper.find('.accordion-trigger')
      expect(trigger.attributes('aria-controls')).toBe(
        'accordion-section-county.1'
      )
    })

    it('should have matching id on panel', () => {
      wrapper = mount(Region, {
        props: {
          type: 'land',
          code: 'county.1',
          name: 'Uusimaa',
          input: mockWarningInput,
          warnings: mockWarnings,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      const panel = wrapper.find('.accordion-panel')
      expect(panel.attributes('id')).toBe('accordion-section-county.1')
    })

    it('should have role region on panel', () => {
      wrapper = mount(Region, {
        props: {
          type: 'land',
          code: 'county.1',
          name: 'Uusimaa',
          input: mockWarningInput,
          warnings: mockWarnings,
          theme: 'light-theme',
          language: 'fi',
        },
      })

      const panel = wrapper.find('.accordion-panel')
      expect(panel.attributes('role')).toBe('region')
    })
  })
})

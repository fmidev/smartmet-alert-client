import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import config from '@/mixins/config'

const TestComponent = {
  mixins: [config],
  template: '<div></div>',
}

describe('config mixin', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(TestComponent)
  })

  describe('Configuration constants', () => {
    it('should define timezone', () => {
      expect(wrapper.vm.timeZone).toBe('Europe/Helsinki')
    })

    it('should define date format locale', () => {
      expect(wrapper.vm.dateTimeFormatLocale).toBe('fi-FI')
    })

    it('should define pan limits', () => {
      expect(wrapper.vm.panLimits).toEqual({ x: 175, y: 275 })
    })

    it('should define coverage criterion', () => {
      expect(wrapper.vm.coverageCriterion).toBe(0.2)
    })

    it('should define max merged weight', () => {
      expect(wrapper.vm.maxMergedWeight).toBe(7)
    })

    it('should define max update delays', () => {
      expect(wrapper.vm.maxUpdateDelay).toHaveProperty('weather_update_time')
      expect(wrapper.vm.maxUpdateDelay).toHaveProperty('flood_update_time')
      expect(wrapper.vm.maxUpdateDelay.weather_update_time).toBe(
        12 * 60 * 60 * 1000
      )
    })
  })

  describe('Warning types map', () => {
    it('should have warningTypes map', () => {
      expect(wrapper.vm.warningTypes).toBeInstanceOf(Map)
    })

    it('should map land warning types', () => {
      const landTypes = [
        'thunderStorm',
        'wind',
        'rain',
        'trafficWeather',
        'pedestrianSafety',
        'forestFireWeather',
        'grassFireWeather',
        'hotWeather',
        'coldWeather',
        'uvNote',
        'floodLevel',
      ]

      landTypes.forEach((type) => {
        expect(wrapper.vm.warningTypes.get(type)).toBe('land')
      })
    })

    it('should map sea warning types', () => {
      const seaTypes = [
        'seaWind',
        'seaThunderStorm',
        'seaWaterHeightHighWater',
        'seaWaterHeightShallowWater',
        'seaWaveHeight',
        'seaIcing',
      ]

      seaTypes.forEach((type) => {
        expect(wrapper.vm.warningTypes.get(type)).toBe('sea')
      })
    })
  })

  describe('Region IDs', () => {
    it('should have regionIds array', () => {
      expect(Array.isArray(wrapper.vm.regionIds)).toBe(true)
      expect(wrapper.vm.regionIds.length).toBeGreaterThan(0)
    })

    it('should include county regions', () => {
      expect(wrapper.vm.regionIds).toContain('county.1')
      expect(wrapper.vm.regionIds).toContain('county.2')
    })

    it('should include sea regions', () => {
      expect(wrapper.vm.regionIds).toContain('sea_region.B1N')
      expect(wrapper.vm.regionIds).toContain('sea_region.B2')
    })

    it('should include municipality regions', () => {
      expect(wrapper.vm.regionIds).toContain('municipality.615')
    })
  })

  describe('Geometries', () => {
    it('should have geometries object', () => {
      expect(wrapper.vm.geometries).toBeDefined()
      expect(wrapper.vm.geometries).toHaveProperty('2021')
    })

    it('should have geometry data for counties', () => {
      const county1 = wrapper.vm.geometries[2021]['county.1']

      expect(county1).toBeDefined()
      expect(county1).toHaveProperty('name')
      expect(county1).toHaveProperty('type')
      expect(county1).toHaveProperty('weight')
      expect(county1).toHaveProperty('center')
      expect(county1).toHaveProperty('pathLarge')
      expect(county1).toHaveProperty('pathSmall')
    })

    it('should mark land regions correctly', () => {
      const county = wrapper.vm.geometries[2021]['county.1']
      expect(county.type).toBe('land')
    })

    it('should mark sea regions correctly', () => {
      const seaRegion = wrapper.vm.geometries[2021]['sea_region.B1N']
      expect(seaRegion.type).toBe('sea')
    })

    it('should have borders data', () => {
      const borders = wrapper.vm.geometries[2021].borders

      expect(borders).toBeDefined()
      expect(borders).toHaveProperty('land')
      expect(borders).toHaveProperty('sea')
      expect(borders.land).toHaveProperty('pathLarge')
      expect(borders.sea).toHaveProperty('pathLarge')
    })

    it('should include parent-child relationships', () => {
      const municipality = wrapper.vm.geometries[2021]['municipality.615']

      expect(municipality).toBeDefined()
      expect(municipality).toHaveProperty('parent')
      expect(municipality.parent).toBe('county.17')
    })
  })

  describe('Colors configuration', () => {
    it('should have colors for all themes', () => {
      expect(wrapper.vm.colors).toHaveProperty('light-theme')
      expect(wrapper.vm.colors).toHaveProperty('dark-theme')
      expect(wrapper.vm.colors).toHaveProperty('light-gray-theme')
      expect(wrapper.vm.colors).toHaveProperty('dark-gray-theme')
    })

    it('should define severity levels colors', () => {
      const lightTheme = wrapper.vm.colors['light-theme']

      expect(lightTheme.levels).toHaveLength(5)
      expect(lightTheme).toHaveProperty('sea')
      expect(lightTheme).toHaveProperty('missing')
      expect(lightTheme).toHaveProperty('stroke')
    })

    it('should have different colors for gray themes', () => {
      const lightTheme = wrapper.vm.colors['light-theme']
      const grayTheme = wrapper.vm.colors['light-gray-theme']

      expect(lightTheme.levels).not.toEqual(grayTheme.levels)
    })
  })

  describe('Warning icon method', () => {
    it('should generate wind icon with direction', () => {
      const warning = {
        type: 'wind',
        direction: 90,
      }

      const icon = wrapper.vm.warningIcon(warning)

      expect(icon).toHaveProperty('aspectRatio')
      expect(icon).toHaveProperty('geom')
      expect(icon.geom).toContain('wind-symbol')
    })

    it('should generate thunder storm icon', () => {
      const warning = {
        type: 'thunderStorm',
      }

      const icon = wrapper.vm.warningIcon(warning)

      expect(icon.geom).toContain('thunder-symbol')
    })

    it('should generate rain icon', () => {
      const warning = {
        type: 'rain',
      }

      const icon = wrapper.vm.warningIcon(warning)

      expect(icon.geom).toContain('rain-symbol')
    })

    it('should generate traffic weather icon', () => {
      const warning = {
        type: 'trafficWeather',
      }

      const icon = wrapper.vm.warningIcon(warning)

      expect(icon.geom).toContain('traffic-symbol')
    })

    it('should generate sea wind icon with text', () => {
      const warning = {
        type: 'seaWind',
        direction: 180,
        text: '15',
      }

      const icon = wrapper.vm.warningIcon(warning)

      expect(icon.geom).toContain('seawind-symbol')
      expect(icon.geom).toContain('15')
    })

    it('should generate flood icon based on severity', () => {
      const warning = {
        type: 'floodLevel',
        severity: 3,
      }

      const icon = wrapper.vm.warningIcon(warning)

      expect(icon.geom).toContain('flood-level-3')
    })

    it('should generate multiple warnings icon', () => {
      const warning = {
        type: 'multiple',
      }

      const icon = wrapper.vm.warningIcon(warning)

      expect(icon.geom).toContain('multiple-symbol')
    })

    it('should set scale for specific warning types', () => {
      const warning = {
        type: 'hotWeather',
      }

      const icon = wrapper.vm.warningIcon(warning)

      expect(icon.scale).toBe(1.2)
    })
  })
})

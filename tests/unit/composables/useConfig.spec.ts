import { describe, it, expect } from 'vitest'
import { useConfig } from '@/composables/useConfig'

describe('useConfig composable', () => {
  const config = useConfig()

  describe('Configuration constants', () => {
    it('should define timezone', () => {
      expect(config.timeZone).toBe('Europe/Helsinki')
    })

    it('should define date format locale', () => {
      expect(config.dateTimeFormatLocale).toBe('fi-FI')
    })

    it('should define pan limits', () => {
      expect(config.panLimits).toEqual({ x: 175, y: 275 })
    })

    it('should define coverage criterion', () => {
      expect(config.coverageCriterion).toBe(0.2)
    })

    it('should define max merged weight', () => {
      expect(config.maxMergedWeight).toBe(7)
    })

    it('should define max update delays', () => {
      expect(config.maxUpdateDelay).toHaveProperty('weather_update_time')
      expect(config.maxUpdateDelay).toHaveProperty('flood_update_time')
      expect(config.maxUpdateDelay.weather_update_time).toBe(
        12 * 60 * 60 * 1000
      )
    })
  })

  describe('Warning types map', () => {
    it('should have warningTypes map', () => {
      expect(config.warningTypes).toBeInstanceOf(Map)
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
        expect(config.warningTypes.get(type)).toBe('land')
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
        expect(config.warningTypes.get(type)).toBe('sea')
      })
    })
  })

  describe('Region IDs', () => {
    it('should have regionIds array', () => {
      expect(Array.isArray(config.regionIds)).toBe(true)
      expect(config.regionIds.length).toBeGreaterThan(0)
    })

    it('should include county regions', () => {
      expect(config.regionIds).toContain('county.1')
      expect(config.regionIds).toContain('county.2')
    })

    it('should include sea regions', () => {
      expect(config.regionIds).toContain('sea_region.B1N')
      expect(config.regionIds).toContain('sea_region.B2')
    })

    it('should include municipality regions', () => {
      expect(config.regionIds).toContain('municipality.615')
    })
  })

  describe('Geometries', () => {
    it('should have geometries object', () => {
      expect(config.geometries).toBeDefined()
      expect(config.geometries).toHaveProperty('2021')
    })

    it('should have geometry data for counties', () => {
      const geometryData = config.geometries[2021]
      expect(geometryData).toBeDefined()

      const county1 = geometryData?.['county.1']
      expect(county1).toBeDefined()
      expect(county1).toHaveProperty('name')
      expect(county1).toHaveProperty('type')
      expect(county1).toHaveProperty('weight')
      expect(county1).toHaveProperty('center')
      expect(county1).toHaveProperty('pathLarge')
      expect(county1).toHaveProperty('pathSmall')
    })

    it('should mark land regions correctly', () => {
      const geometryData = config.geometries[2021]
      const county = geometryData?.['county.1'] as
        | { type: string; name: string }
        | undefined
      expect(county?.type).toBe('land')
    })

    it('should mark sea regions correctly', () => {
      const geometryData = config.geometries[2021]
      const seaRegion = geometryData?.['sea_region.B1N'] as
        | { type: string; name: string }
        | undefined
      expect(seaRegion?.type).toBe('sea')
    })

    it('should have borders data', () => {
      const geometryData = config.geometries[2021]
      expect(geometryData).toBeDefined()

      const borders = geometryData?.borders
      expect(borders).toBeDefined()
      expect(borders).toHaveProperty('land')
      expect(borders).toHaveProperty('sea')
      expect(borders?.land).toHaveProperty('pathLarge')
      expect(borders?.sea).toHaveProperty('pathLarge')
    })

    it('should include parent-child relationships', () => {
      const geometryData = config.geometries[2021]
      const municipality = geometryData?.['municipality.615'] as
        | { parent: string; name: string }
        | undefined

      expect(municipality).toBeDefined()
      expect(municipality).toHaveProperty('parent')
      expect(municipality?.parent).toBe('county.17')
    })
  })

  describe('Colors configuration', () => {
    it('should have colors for all themes', () => {
      expect(config.colors).toHaveProperty('light-theme')
      expect(config.colors).toHaveProperty('dark-theme')
      expect(config.colors).toHaveProperty('light-gray-theme')
      expect(config.colors).toHaveProperty('dark-gray-theme')
    })

    it('should define severity levels colors', () => {
      const lightTheme = config.colors['light-theme']

      expect(lightTheme.levels).toHaveLength(5)
      expect(lightTheme).toHaveProperty('sea')
      expect(lightTheme).toHaveProperty('missing')
      expect(lightTheme).toHaveProperty('stroke')
    })

    it('should have different colors for gray themes', () => {
      const lightTheme = config.colors['light-theme']
      const grayTheme = config.colors['light-gray-theme']

      expect(lightTheme.levels).not.toEqual(grayTheme.levels)
    })
  })

  describe('Warning icon method', () => {
    it('should generate wind icon with direction', () => {
      const warning = {
        type: 'wind',
        direction: 90,
        severity: 3 as const,
      }

      const icon = config.warningIcon(warning)

      expect(icon).toHaveProperty('aspectRatio')
      expect(icon).toHaveProperty('geom')
      expect(icon.geom).toContain('wind-symbol')
    })

    it('should generate thunder storm icon', () => {
      const warning = {
        type: 'thunderStorm',
        severity: 3 as const,
      }

      const icon = config.warningIcon(warning)

      expect(icon.geom).toContain('thunder-symbol')
    })

    it('should generate rain icon', () => {
      const warning = {
        type: 'rain',
        severity: 3 as const,
      }

      const icon = config.warningIcon(warning)

      expect(icon.geom).toContain('rain-symbol')
    })

    it('should generate traffic weather icon', () => {
      const warning = {
        type: 'trafficWeather',
        severity: 3 as const,
      }

      const icon = config.warningIcon(warning)

      expect(icon.geom).toContain('traffic-symbol')
    })

    it('should generate sea wind icon with text', () => {
      const warning = {
        type: 'seaWind',
        direction: 180,
        text: '15',
        severity: 3 as const,
      }

      const icon = config.warningIcon(warning)

      expect(icon.geom).toContain('seawind-symbol')
      expect(icon.geom).toContain('15')
    })

    it('should generate flood icon based on severity', () => {
      const warning = {
        type: 'floodLevel',
        severity: 3 as const,
      }

      const icon = config.warningIcon(warning)

      expect(icon.geom).toContain('flood-level-3')
    })

    it('should generate multiple warnings icon', () => {
      const warning = {
        type: 'multiple',
        severity: 3 as const,
      }

      const icon = config.warningIcon(warning)

      expect(icon.geom).toContain('multiple-symbol')
    })

    it('should set scale for specific warning types', () => {
      const warning = {
        type: 'hotWeather',
        severity: 3 as const,
      }

      const icon = config.warningIcon(warning)

      expect(icon.scale).toBe(1.2)
    })
  })
})

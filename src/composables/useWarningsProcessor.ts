/**
 * Warnings Processor Composable
 *
 * Handles processing of raw warning data from API into structured format
 * for display in the AlertClient component.
 *
 * This composable provides the handleMapWarnings function and all its
 * dependencies, migrated from the utils mixin.
 */

import { type Ref } from 'vue'
import type {
  Warning,
  WarningsMap,
  Day,
  LegendItem,
  RegionsData,
  DayRegions,
  RegionType,
  Severity,
  WarningsDataResponse,
  GeoJSONFeature,
  GeoJSONFeatureCollection,
  GeometryCollection,
  RegionGeometry,
  RegionListItem,
  RegionWarningItem,
} from '@/types'
import {
  NUMBER_OF_DAYS,
  WEATHER_UPDATE_TIME,
  FLOOD_UPDATE_TIME,
  UPDATE_TIME,
  WEATHER_WARNINGS,
  FLOOD_WARNINGS,
  WARNING_CONTEXT,
  CONTEXT_EXTENSION,
  SEVERITY,
  EFFECTIVE_FROM,
  EFFECTIVE_UNTIL,
  ONSET,
  EXPIRES,
  PHYSICAL_DIRECTION,
  PHYSICAL_VALUE,
  INFO_FI,
  INFO_SV,
  INFO_EN,
  SEA_WIND,
  WIND,
  FLOOD_LEVEL_TYPE,
  WARNING_LEVELS,
  FLOOD_LEVELS,
  REGION_LAND,
  REGION_SEA,
  uncapitalize,
  twoDigits,
  toTimeZone,
  validInterval,
  validIntervalAriaLabel,
  msSinceStartOfDay,
  coverageData,
} from './useUtils'
import he from 'he'

// ============================================================================
// Types
// ============================================================================

export interface ParentsMap {
  [key: string]: boolean[]
}

export interface HandleMapWarningsResult {
  warnings: WarningsMap
  days: Day[]
  regions: RegionsData
  parents: ParentsMap
  legend: LegendItem[]
}

export interface WarningsProcessorContext {
  geometryId: string
  geometries: GeometryCollection
  regionIds: string[]
  warningTypes: Map<string, RegionType>
  timeZone: string
  locale: string
  currentTime: number
  startFrom: string
  staticDays: boolean
  dailyWarningTypes: string[]
  maxUpdateDelay: { weather_update_time: number; flood_update_time: number }
  bbox: GeoJSONFeature
  geoJSONToSVG: (data: object, width: number, height: number) => string
  t: (key: string) => string
  handleError: (error: string) => void
  onDataError: () => void
}

export interface UseWarningsProcessorOptions {
  geometryId: Ref<string>
  geometries: Ref<GeometryCollection>
  regionIds: Ref<string[]>
  warningTypes: Ref<Map<string, RegionType>>
  timeZone: Ref<string>
  locale: Ref<string>
  currentTime: Ref<number>
  startFrom: Ref<string>
  staticDays: Ref<boolean>
  dailyWarningTypes: Ref<string[]>
  maxUpdateDelay: Ref<{
    weather_update_time: number
    flood_update_time: number
  }>
  bbox: Ref<GeoJSONFeature>
  geoJSONToSVG: (data: object, width: number, height: number) => string
  t: (key: string) => string
  handleError: (error: string) => void
  onDataError: () => void
}

// ============================================================================
// Helper Functions (Pure)
// ============================================================================

/**
 * Extract warning type from properties
 */
function getWarningType(properties: Record<string, unknown>): string {
  return uncapitalize(
    (
      (properties[WARNING_CONTEXT] as string) +
      (properties[CONTEXT_EXTENSION] ? `-${properties[CONTEXT_EXTENSION]}` : '')
    )
      .split('-')
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join('')
  )
}

/**
 * Extract region ID from reference URL
 */
function regionFromReference(reference: string): string {
  return reference
    .split(',')
    .map((url) => {
      let subUrl = url.substring(url.lastIndexOf('#') + 1)
      // Saimaa special case
      if (subUrl.indexOf('.') !== subUrl.lastIndexOf('.')) {
        subUrl = subUrl.replace('.', '_')
      }
      return subUrl
    })
    .reduce((regionId, rawId, index, array) => {
      const parts = rawId.split('.')
      if (index === 0) {
        regionId += parts[0] ?? ''
      }
      return (
        regionId + (index === array.length - 1 ? '.' : '_') + (parts[1] ?? '')
      )
    }, '')
}

/**
 * Extract relative coverage from reference URL
 */
function relativeCoverageFromReference(
  reference: string | null | undefined
): number {
  if (reference == null) {
    return 0
  }
  const urlSplit = reference.split('?')
  if (urlSplit.length <= 1) {
    return 0
  }
  const paramString = (urlSplit[1] ?? '').split('#')[0] ?? ''
  const searchParams = new URLSearchParams(paramString)
  const relativeCoverage = searchParams.get('c')
  if (relativeCoverage == null) {
    return 0
  }
  return Number(relativeCoverage)
}

/**
 * Get warning text based on properties
 */
function getWarningText(properties: Record<string, unknown>): string {
  return properties[WARNING_CONTEXT] === SEA_WIND
    ? String(properties[PHYSICAL_VALUE] ?? '')
    : ''
}

/**
 * Calculate effective days for a warning
 */
function calculateEffectiveDays(
  start: string,
  end: string,
  dailyWarning: boolean,
  updatedAt: number | null,
  currentTime: number,
  startFrom: string,
  timeOffset: number,
  timeZone: string,
  locale: string
): boolean[] {
  const referenceTime =
    startFrom === 'updated' ? updatedAt ?? currentTime : currentTime
  const day = 1000 * 60 * 60 * 24

  return Array.from({ length: NUMBER_OF_DAYS }, (_, index) => {
    const dayTime = referenceTime + index * day
    const dayStartOffset = msSinceStartOfDay(dayTime, timeZone, locale)
    let startOfDay = dayTime - dayStartOffset

    const nextDayTime = referenceTime + (index + 1) * day
    const nextDayStartOffset = msSinceStartOfDay(nextDayTime, timeZone, locale)
    let startOfNextDay = nextDayTime - nextDayStartOffset

    if (!dailyWarning) {
      startOfDay = startOfDay + timeOffset
      startOfNextDay = startOfNextDay + timeOffset
    }

    return (
      new Date(start).getTime() < startOfNextDay &&
      new Date(end).getTime() > startOfDay
    )
  })
}

/**
 * Check if a warning is valid
 */
function isValidWarning(
  warning: GeoJSONFeature | null,
  geometryId: string,
  geometries: GeometryCollection,
  warningTypes: Map<string, RegionType>
): boolean {
  if (warning == null || warning.properties == null) {
    return false
  }

  const regionId = regionFromReference(warning.properties.reference as string)
  const geometryData = geometries[geometryId]

  if (warning.geometry == null && geometryData?.[regionId] == null) {
    return false
  }

  const warningType =
    warning.properties.warning_context != null
      ? getWarningType(warning.properties)
      : FLOOD_LEVEL_TYPE

  const regionGeom = geometryData?.[regionId] as RegionGeometry | undefined
  if (regionGeom != null && warningTypes.get(warningType) !== regionGeom.type) {
    return false
  }

  // Valid flood warning
  if (
    warning.properties.severity != null &&
    Object.keys(FLOOD_LEVELS).includes(
      (warning.properties.severity as string).toLowerCase()
    )
  ) {
    return true
  }

  return (
    WARNING_LEVELS.slice(1).includes(warning.properties.severity as string) ||
    (warning.properties[WARNING_CONTEXT] === SEA_WIND &&
      WARNING_LEVELS.includes(warning.properties.severity as string))
  )
}

/**
 * Create a weather warning from raw data
 */
function createWeatherWarning(
  warning: GeoJSONFeature,
  geometryId: string,
  geometries: GeometryCollection,
  dailyWarningTypes: string[],
  updatedAt: number | null,
  currentTime: number,
  startFrom: string,
  timeOffset: number,
  timeZone: string,
  locale: string,
  t: (key: string) => string
): Warning {
  const properties = warning.properties
  let direction = 0
  let severity = Number(String(properties.severity ?? '').slice(-1)) as Severity

  switch (properties[WARNING_CONTEXT]) {
    case SEA_WIND:
      direction = ((properties[PHYSICAL_DIRECTION] as number) ?? 0) - 180
      if (properties[SEVERITY] === WARNING_LEVELS[0]) {
        severity = (severity + 1) as Severity
      }
      break
    case WIND:
      direction = ((properties[PHYSICAL_DIRECTION] as number) ?? 0) - 90
      break
    default:
  }

  const regionId = regionFromReference(properties.reference as string)
  const type = getWarningType(properties)
  const geometryData = geometries[geometryId]

  return {
    type,
    id: properties.identifier as string,
    regions: geometryData?.[regionId] ? { [regionId]: true } : {},
    covRegions: new Map(),
    coveragesLarge: [],
    coveragesSmall: [],
    effectiveFrom: properties[EFFECTIVE_FROM] as string,
    effectiveUntil: properties[EFFECTIVE_UNTIL] as string,
    effectiveDays: calculateEffectiveDays(
      properties[EFFECTIVE_FROM] as string,
      properties[EFFECTIVE_UNTIL] as string,
      dailyWarningTypes.includes(type),
      updatedAt,
      currentTime,
      startFrom,
      timeOffset,
      timeZone,
      locale
    ),
    validInterval: validInterval(
      properties[EFFECTIVE_FROM] as string,
      properties[EFFECTIVE_UNTIL] as string,
      timeZone,
      locale
    ),
    validIntervalAriaLabel: validIntervalAriaLabel(
      properties[EFFECTIVE_FROM] as string,
      properties[EFFECTIVE_UNTIL] as string,
      timeZone,
      locale,
      t
    ),
    severity,
    direction,
    value: (properties[PHYSICAL_VALUE] as number) ?? 0,
    text: getWarningText(properties),
    info: {
      fi: properties[INFO_FI] ? he.decode(properties[INFO_FI] as string) : '',
      sv: properties[INFO_SV] ? he.decode(properties[INFO_SV] as string) : '',
      en: properties[INFO_EN] ? he.decode(properties[INFO_EN] as string) : '',
    },
    link: '',
    linkText: '',
  }
}

/**
 * Create a flood warning from raw data
 */
function createFloodWarning(
  warning: GeoJSONFeature,
  dailyWarningTypes: string[],
  updatedAt: number | null,
  currentTime: number,
  startFrom: string,
  timeOffset: number,
  timeZone: string,
  locale: string,
  t: (key: string) => string,
  handleError: (error: string) => void
): Warning {
  const properties = warning.properties
  let info = ''

  try {
    info = JSON.parse(
      decodeURIComponent(
        properties.description != null
          ? (properties.description as string)
          : '[%22%22]'
      ).replace(/[\n|\t]/g, ' ')
    )[0]
  } catch (e) {
    handleError((e as Error).name)
  }

  const regionId = regionFromReference(properties.reference as string)
  const langKey = (properties.language as string)
    ?.substring(0, 2)
    ?.toLowerCase() as 'fi' | 'sv' | 'en'

  return {
    type: FLOOD_LEVEL_TYPE,
    id: properties.identifier as string,
    regions: { [regionId]: true },
    covRegions: new Map(),
    coveragesLarge: [],
    coveragesSmall: [],
    effectiveFrom: properties[ONSET] as string,
    effectiveUntil: properties[EXPIRES] as string,
    effectiveDays: calculateEffectiveDays(
      properties[ONSET] as string,
      properties[EXPIRES] as string,
      dailyWarningTypes.includes(FLOOD_LEVEL_TYPE),
      updatedAt,
      currentTime,
      startFrom,
      timeOffset,
      timeZone,
      locale
    ),
    validInterval: validInterval(
      properties[ONSET] as string,
      properties[EXPIRES] as string,
      timeZone,
      locale
    ),
    validIntervalAriaLabel: validIntervalAriaLabel(
      properties[ONSET] as string,
      properties[EXPIRES] as string,
      timeZone,
      locale,
      t
    ),
    severity: (FLOOD_LEVELS[(properties.severity as string)?.toLowerCase()] ??
      0) as Severity,
    direction: 0,
    value: 0,
    text: '',
    info: { [langKey]: info },
    link: t('floodLink'),
    linkText: t('floodLinkText'),
  }
}

/**
 * Create days array from warnings
 */
function createDays(
  warnings: WarningsMap,
  updatedAt: number | null,
  currentTime: number,
  startFrom: string,
  timeZone: string,
  locale: string
): Day[] {
  const updatedAtTz = updatedAt ? toTimeZone(updatedAt, timeZone, locale) : null
  const updatedDate = updatedAtTz
    ? `${updatedAtTz.day}.${updatedAtTz.month}.${updatedAtTz.year}`
    : ''
  const updatedTime = updatedAtTz
    ? `${twoDigits(updatedAtTz.hour)}:${twoDigits(updatedAtTz.minute)}`
    : ''

  const referenceTime =
    startFrom === 'updated' ? updatedAt ?? currentTime : currentTime

  return Array.from({ length: NUMBER_OF_DAYS }, (_, index) => {
    const date = new Date(referenceTime)
    date.setDate(date.getDate() + index)
    const moment = toTimeZone(date, timeZone, locale)

    return {
      weekdayName: moment.weekday,
      day: moment.day,
      month: moment.month,
      year: moment.year,
      severity: Object.values(warnings).reduce(
        (maxSeverity, warning) =>
          warning.effectiveDays[index]
            ? (Math.max(warning.severity, maxSeverity) as Severity)
            : maxSeverity,
        0 as Severity
      ),
      updatedDate,
      updatedTime,
    }
  })
}

/**
 * Get maximum severities by warning type
 */
function getMaxSeverities(warnings: WarningsMap): Record<string, Severity> {
  return Object.values(warnings).reduce(
    (maxSeverities, warning) => {
      const currentMax = maxSeverities[warning.type]
      if (
        warning.effectiveDays.some((effectiveDay) => effectiveDay) &&
        (currentMax == null || currentMax < warning.severity)
      ) {
        maxSeverities[warning.type] = warning.severity
      }
      return maxSeverities
    },
    {} as Record<string, Severity>
  )
}

/**
 * Create legend from severities
 */
function createLegend(
  severities: Record<string, Severity>,
  warningTypes: Map<string, RegionType>
): LegendItem[] {
  const warningKeys = Object.keys(severities)
  return [4, 3, 2].reduce<LegendItem[]>((orderedSeverities, severity) => {
    const warningTypesBySeverity = warningKeys.filter(
      (key) => severities[key] === severity
    )
    warningTypes.forEach((_, warnType) => {
      if (warningTypesBySeverity.includes(warnType)) {
        const warnSeverity = severities[warnType]
        if (warnSeverity !== undefined) {
          orderedSeverities.push({
            type: warnType,
            severity: warnSeverity,
            visible: true,
          })
        }
      }
    })
    return orderedSeverities
  }, [])
}

/**
 * Create regions data structure from warnings
 */
function createRegions(
  warnings: WarningsMap,
  geometryId: string,
  geometries: GeometryCollection,
  regionIds: string[],
  warningTypes: Map<string, RegionType>
): RegionsData {
  const warningKeys = Object.keys(warnings)
  const geometryData = geometries[geometryId]

  return [4, 3, 2].reduce(
    (regionWarnings, severity) => {
      const warningsBySeverity = warningKeys.filter(
        (key) => warnings[key]?.severity === severity
      )
      ;[...Array(NUMBER_OF_DAYS).keys()].forEach((day) => {
        const warningsByDay = warningsBySeverity.filter(
          (key) => warnings[key]?.effectiveDays[day]
        )
        warningTypes.forEach((_regionType, warningType) => {
          const warningsByType = warningsByDay.filter(
            (key) => warnings[key]?.type === warningType
          )
          warningsByType.sort((key1, key2) => {
            const w1 = warnings[key1]
            const w2 = warnings[key2]
            if (!w1 || !w2) return 0
            if (w1.severity !== w2.severity) {
              return w2.severity - w1.severity
            }
            if (w1.value !== w2.value) {
              return w2.value - w1.value
            }
            const effectiveFrom1 = new Date(w1.effectiveFrom).getTime()
            const effectiveFrom2 = new Date(w2.effectiveFrom).getTime()
            if (effectiveFrom1 !== effectiveFrom2) {
              return effectiveFrom1 - effectiveFrom2
            }
            const effectiveUntil1 = new Date(w1.effectiveUntil).getTime()
            const effectiveUntil2 = new Date(w2.effectiveUntil).getTime()
            return effectiveUntil1 - effectiveUntil2
          })
          warningsByType.forEach((key) => {
            const warning = warnings[key]
            if (!warning) return
            regionIds.forEach((regionId, regionIndex) => {
              if (warning.regions[regionId]) {
                const regionGeom = geometryData?.[regionId] as
                  | RegionGeometry
                  | undefined
                if (!regionGeom) return

                const dayRegions = regionWarnings[day]
                if (!dayRegions) return
                const regionItems =
                  dayRegions[regionGeom.type as keyof DayRegions]
                let regionItem = regionItems.find(
                  (regionWarning: RegionListItem) =>
                    regionWarning.key === regionId
                )
                if (regionItem == null) {
                  regionItem = {
                    key: regionId,
                    regionIndex,
                    name: regionGeom.name,
                    warnings: [],
                  }
                  regionItems.push(regionItem)
                }
                let warningItem = regionItem.warnings.find(
                  (w: RegionWarningItem) => w.type === warningType
                )
                if (warningItem == null) {
                  warningItem = {
                    type: warningType,
                    identifiers: [],
                    coverage: 0,
                  }
                  regionItem.warnings.push(warningItem)
                }
                if (!warningItem.identifiers.includes(key)) {
                  warningItem.identifiers.push(key)
                }
                const covRegions = warning.covRegions
                if (covRegions.has(regionId)) {
                  warningItem.coverage += covRegions.get(regionId) ?? 0
                } else {
                  warningItem.coverage = 100
                }
              }
            })
          })
        })
      })
      return regionWarnings
    },
    [...Array(NUMBER_OF_DAYS).keys()].map(() => ({
      [REGION_LAND]: [] as RegionListItem[],
      [REGION_SEA]: [] as RegionListItem[],
    })) as RegionsData
  )
}

/**
 * Create coverage SVG from geometry
 */
function createCoverage(
  coverage: GeoJSONFeature,
  width: number,
  height: number,
  reference: [number, number] | null,
  bbox: GeoJSONFeature,
  geoJSONToSVG: (data: object, width: number, height: number) => string
): string {
  const data = {
    type: 'FeatureCollection',
    features: [coverage, bbox],
    totalFeatures: 2,
    crs: {
      type: 'name',
      properties: {
        name: 'urn:ogc:def:crs:EPSG::3067',
      },
    },
  } as GeoJSONFeatureCollection & { totalFeatures: number }

  if (reference != null) {
    data.features.push({
      type: 'Feature',
      id: 'reference',
      properties: {},
      geometry: {
        type: 'Point',
        coordinates: reference,
      },
    })
    data.totalFeatures++
  }

  return geoJSONToSVG(data, width, height)
}

/**
 * Optimize coverage regions to prevent overlapping symbols in Saimaa
 */
function optimizeCovRegions(
  warnings: WarningsMap,
  regions: RegionsData,
  geometryId: string,
  geometries: GeometryCollection
): void {
  const geometryData = geometries[geometryId]
  if (!geometryData) return

  Object.keys(geometryData)
    .filter((regionId) => {
      const region = geometryData[regionId] as RegionGeometry | undefined
      return region?.type === 'sea' && region?.subType === 'lake'
    })
    .filter((regionId) =>
      regions.some((day) => day.sea.some((region) => region.key === regionId))
    )
    .forEach((regionId) =>
      Object.keys(warnings)
        .filter((warningKey) => {
          const w = warnings[warningKey]
          return w && w.covRegions.size > 0
        })
        .forEach((warningKey) => {
          const w = warnings[warningKey]
          if (w) w.covRegions.set(regionId, 0)
        })
    )
}

// ============================================================================
// Main Processing Function
// ============================================================================

/**
 * Process raw warning data into structured format
 */
export function processWarnings(
  data: WarningsDataResponse,
  ctx: WarningsProcessorContext
): HandleMapWarningsResult & { updatedAt: number | null; timeOffset: number } {
  const warnings: WarningsMap = {}
  const parents: ParentsMap = {}
  let updatedAt: number | null = null
  let timeOffset = 0

  // Process update times
  const allUpdateTimes = [WEATHER_UPDATE_TIME, FLOOD_UPDATE_TIME]
    .filter(
      (warningUpdateTime) =>
        data[warningUpdateTime as keyof WarningsDataResponse] != null
    )
    .reduce((updateTimes: number[], warningUpdateTime) => {
      const updateData = data[
        warningUpdateTime as keyof WarningsDataResponse
      ] as GeoJSONFeatureCollection | undefined

      if (
        updateData?.features != null &&
        updateData.features.length > 0 &&
        updateData.features[0]?.properties != null
      ) {
        const updateTime = new Date(
          updateData.features[0].properties[UPDATE_TIME] as string
        ).getTime()
        updateTimes.push(updateTime)

        const maxDelay =
          ctx.maxUpdateDelay[
            warningUpdateTime as keyof typeof ctx.maxUpdateDelay
          ]
        if (ctx.currentTime - updateTime > maxDelay) {
          ctx.handleError(`${warningUpdateTime}_outdated`)
        }
      } else {
        ctx.handleError(warningUpdateTime)
      }
      return updateTimes
    }, [])
    .sort()
    .reverse()

  const firstUpdateTime = allUpdateTimes[0]
  updatedAt =
    allUpdateTimes.length > 0 && firstUpdateTime != null
      ? firstUpdateTime
      : null

  if (!ctx.staticDays) {
    const startTime = ctx.startFrom === 'updated' ? updatedAt : ctx.currentTime
    if (startTime != null) {
      timeOffset = msSinceStartOfDay(startTime, ctx.timeZone, ctx.locale)
    }
  }

  // Create warning factories
  const createWarnings: Record<string, (warning: GeoJSONFeature) => Warning> = {
    [WEATHER_WARNINGS]: (warning: GeoJSONFeature) =>
      createWeatherWarning(
        warning,
        ctx.geometryId,
        ctx.geometries,
        ctx.dailyWarningTypes,
        updatedAt,
        ctx.currentTime,
        ctx.startFrom,
        timeOffset,
        ctx.timeZone,
        ctx.locale,
        ctx.t
      ),
    [FLOOD_WARNINGS]: (warning: GeoJSONFeature) =>
      createFloodWarning(
        warning,
        ctx.dailyWarningTypes,
        updatedAt,
        ctx.currentTime,
        ctx.startFrom,
        timeOffset,
        ctx.timeZone,
        ctx.locale,
        ctx.t,
        ctx.handleError
      ),
  }

  // Process warnings
  const warningTypes = Object.keys(createWarnings)
  for (const warningType of warningTypes) {
    const warningData = data[warningType as keyof WarningsDataResponse] as
      | GeoJSONFeatureCollection
      | undefined

    if (warningData == null) {
      ctx.handleError(`Missing data: ${warningType}`)
      ctx.onDataError()
      continue
    }

    const features = warningData.features ?? []

    for (const warning of features) {
      if (
        isValidWarning(
          warning,
          ctx.geometryId,
          ctx.geometries,
          ctx.warningTypes
        )
      ) {
        let regionId: string | undefined
        const regionIds: string[] = []
        const warningId = warning.properties.identifier as string

        if (warnings[warningId] == null) {
          const createFn = createWarnings[warningType]
          if (!createFn) continue
          warnings[warningId] = createFn(warning)
          const createdWarning = warnings[warningId]
          if (!createdWarning) continue
          const warningRegions = Object.keys(createdWarning.regions)
          if (warningRegions.length > 0) {
            regionId = warningRegions[0]
          }
          if (ctx.dailyWarningTypes.includes(createdWarning.type)) {
            createdWarning.dailyWarning = true
          }
        } else {
          regionId = regionFromReference(warning.properties.reference as string)
          const geometryData = ctx.geometries[ctx.geometryId]
          const existingWarning = warnings[warningId]
          if (geometryData?.[regionId] && existingWarning) {
            existingWarning.regions[regionId] = true
          }
        }

        // Get the current warning object
        const currentWarning = warnings[warningId]
        if (!currentWarning) continue

        // Handle coverage references
        if (warning.properties.coverage_references != null) {
          // Space after comma is needed for merged areas
          ;(warning.properties.coverage_references as string)
            .split(', ')
            .filter((reference) => reference.length > 0)
            .forEach((reference) => {
              const refRegionId = regionFromReference(reference)
              const regionCoverage =
                relativeCoverageFromReference(reference) / 100
              const geometryData = ctx.geometries[ctx.geometryId]
              if (geometryData?.[refRegionId]) {
                currentWarning.regions[refRegionId] = true
                currentWarning.covRegions.set(refRegionId, regionCoverage)
                regionIds.push(refRegionId)
              }
            })

          if (warning.geometry != null) {
            const coverageSvg = createCoverage(
              warning,
              440,
              550,
              [
                warning.properties.representative_x as number,
                warning.properties.representative_y as number,
              ],
              ctx.bbox,
              ctx.geoJSONToSVG
            )
            const coverageSmallSvg = createCoverage(
              warning,
              75,
              120,
              null,
              ctx.bbox,
              ctx.geoJSONToSVG
            )
            currentWarning.coveragesLarge = coverageData(coverageSvg)
            currentWarning.coveragesSmall = coverageData(coverageSmallSvg)
          }
        }

        // Handle children and parents
        const geometryData = ctx.geometries[ctx.geometryId]
        if (regionId != null && geometryData?.[regionId]) {
          const regionGeom = geometryData[regionId] as RegionGeometry
          regionGeom.children?.forEach((id) => {
            currentWarning.regions[id] = true
          })
          if (regionIds.length === 0) {
            regionIds.push(regionId)
          }
        }

        regionIds.forEach((id) => {
          const regionGeom = geometryData?.[id] as RegionGeometry | undefined
          const parentId = regionGeom?.parent
          if (parentId) {
            if (parents[parentId] == null) {
              parents[parentId] = [false, false, false, false, false]
            }
            const parentDays = parents[parentId]
            if (parentDays) {
              currentWarning.effectiveDays.forEach((override, index) => {
                if (override) {
                  parentDays[index] = true
                }
              })
            }
          }
        })
      }
    }
  }

  // Create derived data
  const days = createDays(
    warnings,
    updatedAt,
    ctx.currentTime,
    ctx.startFrom,
    ctx.timeZone,
    ctx.locale
  )
  const maxSeverities = getMaxSeverities(warnings)
  const legend = createLegend(maxSeverities, ctx.warningTypes)
  const regions = createRegions(
    warnings,
    ctx.geometryId,
    ctx.geometries,
    ctx.regionIds,
    ctx.warningTypes
  )
  optimizeCovRegions(warnings, regions, ctx.geometryId, ctx.geometries)

  return {
    warnings,
    days,
    regions,
    parents,
    legend,
    updatedAt,
    timeOffset,
  }
}

// ============================================================================
// Composable
// ============================================================================

export interface UseWarningsProcessorReturn {
  handleMapWarnings: (data: WarningsDataResponse) => HandleMapWarningsResult & {
    updatedAt: number | null
    timeOffset: number
  }
}

/**
 * Warnings processor composable
 *
 * Provides the handleMapWarnings function for processing raw API data
 * into structured warning data for display.
 */
export function useWarningsProcessor(
  options: UseWarningsProcessorOptions
): UseWarningsProcessorReturn {
  const handleMapWarnings = (
    data: WarningsDataResponse
  ): HandleMapWarningsResult & {
    updatedAt: number | null
    timeOffset: number
  } => {
    const ctx: WarningsProcessorContext = {
      geometryId: options.geometryId.value,
      geometries: options.geometries.value,
      regionIds: options.regionIds.value,
      warningTypes: options.warningTypes.value,
      timeZone: options.timeZone.value,
      locale: options.locale.value,
      currentTime: options.currentTime.value,
      startFrom: options.startFrom.value,
      staticDays: options.staticDays.value,
      dailyWarningTypes: options.dailyWarningTypes.value,
      maxUpdateDelay: options.maxUpdateDelay.value,
      bbox: options.bbox.value,
      geoJSONToSVG: options.geoJSONToSVG,
      t: options.t,
      handleError: options.handleError,
      onDataError: options.onDataError,
    }

    return processWarnings(data, ctx)
  }

  return {
    handleMapWarnings,
  }
}

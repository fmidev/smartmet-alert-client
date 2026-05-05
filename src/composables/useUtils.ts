/**
 * Utility functions and constants composable
 *
 * Provides helper functions for warning data processing, time handling,
 * and region visualization.
 */

import { computed, type Ref, type ComputedRef } from 'vue'
import { DOMParser } from '@xmldom/xmldom'
import he from 'he'
import xpath from 'xpath'
import type {
  Warning,
  WarningsMap,
  Day,
  LegendItem,
  RegionsData,
  RegionType,
  Severity,
  GeometryCollection,
  ThemeColorMap,
  LocalizedText,
} from '@/types'

// ============================================================================
// Constants
// ============================================================================

export const NUMBER_OF_DAYS = 5
export const REGION_LAND = 'land'
export const REGION_SEA = 'sea'
export const REGION_LAKE = 'lake'

// Property keys
export const WEATHER_UPDATE_TIME = 'weather_update_time'
export const FLOOD_UPDATE_TIME = 'flood_update_time'
export const UPDATE_TIME = 'update_time'
export const WEATHER_WARNINGS = 'weather_finland_active_all'
export const FLOOD_WARNINGS = 'flood_finland_active_all'
export const INFO_FI = 'info_fi'
export const INFO_SV = 'info_sv'
export const INFO_EN = 'info_en'
export const PHYSICAL_DIRECTION = 'physical_direction'
export const PHYSICAL_VALUE = 'physical_value'
export const EFFECTIVE_FROM = 'effective_from'
export const EFFECTIVE_UNTIL = 'effective_until'
export const ONSET = 'onset'
export const EXPIRES = 'expires'
export const WARNING_CONTEXT = 'warning_context'
export const SEVERITY = 'severity'
export const CONTEXT_EXTENSION = 'context_extension'
export const WIND = 'wind'
export const SEA_WIND = 'sea-wind'
export const FLOOD_LEVEL_TYPE = 'floodLevel'
export const MULTIPLE = 'multiple'

export const WARNING_LEVELS = ['level-1', 'level-2', 'level-3', 'level-4']
export const FLOOD_LEVELS: Record<string, number> = {
  minor: 1,
  moderate: 2,
  severe: 3,
  extreme: 4,
}

// ============================================================================
// Pure Utility Functions
// ============================================================================

/**
 * Uncapitalize first letter of a string
 */
export function uncapitalize(value: string | null | undefined): string {
  if (!value) return ''
  const stringValue = value.toString()
  return stringValue.charAt(0).toLowerCase() + stringValue.slice(1)
}

/**
 * Format number with leading zero if needed
 */
export function twoDigits(value: number): string {
  return `0${value}`.slice(-2)
}

/**
 * Check if running in browser environment
 */
export function isClientSide(): boolean {
  return typeof document !== 'undefined' && !!document
}

/**
 * Extract warning type from properties
 */
export function warningType(properties: Record<string, unknown>): string {
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
export function regionFromReference(reference: string): string {
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
export function relativeCoverageFromReference(
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
export function getWarningText(properties: Record<string, unknown>): string {
  return properties[WARNING_CONTEXT] === SEA_WIND
    ? String(properties[PHYSICAL_VALUE] ?? '')
    : ''
}

/**
 * Create default regions structure
 */
export function regionsDefault(): RegionsData {
  return Array.from({ length: NUMBER_OF_DAYS }, () => ({
    land: [],
    sea: [],
  }))
}

// ============================================================================
// Date/Time Formatting Interface
// ============================================================================

export interface TimeZoneMoment {
  year: number
  month: number
  day: number
  weekday: string
  hour: number
  minute: number
  second: number
  millisecond: number
  timeZoneName?: string
  timeZone?: string
}

/**
 * Convert DateTimeFormat parts to whole object
 */
export function partsToWhole(parts: Intl.DateTimeFormatPart[]): TimeZoneMoment {
  const whole: TimeZoneMoment = {
    year: 0,
    month: 0,
    day: 0,
    weekday: '',
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
  }

  parts.forEach((part) => {
    const val: string = part.value
    const partType = part.type as string
    switch (partType) {
      case 'literal':
        return
      case 'timeZoneName':
        whole.timeZoneName = val
        break
      case 'month':
        whole.month = parseInt(val, 10)
        break
      case 'weekday':
        whole.weekday = val
        break
      case 'hour':
        whole.hour = parseInt(val, 10) % 24
        break
      case 'fractionalSecond':
        whole.millisecond = parseInt(val, 10)
        return
      case 'year':
        whole.year = parseInt(val, 10)
        break
      case 'day':
        whole.day = parseInt(val, 10)
        break
      case 'second':
        whole.second = parseInt(val, 10)
        break
      case 'minute':
        whole.minute = parseInt(val, 10)
        break
      default:
        break
    }
  })

  return whole
}

/**
 * Convert date to timezone-specific moment
 */
export function toTimeZone(
  date: Date | number | string,
  timeZone: string,
  locale: string
): TimeZoneMoment {
  const dateObj = new Date(date)
  const parts = new Intl.DateTimeFormat(locale, {
    timeZoneName: 'short',
    timeZone,
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    weekday: 'short',
    hour12: false,
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    fractionalSecondDigits: 3,
  } as Intl.DateTimeFormatOptions).formatToParts(dateObj)

  const whole = partsToWhole(parts)
  whole.timeZone = timeZone
  return whole
}

/**
 * Format a single time moment as an HTML <time> element
 */
function formatTimeMoment(
  moment: TimeZoneMoment,
): string {
  return `${moment.day}.${moment.month}. ${twoDigits(
    moment.hour
  )}:${twoDigits(moment.minute)}`
}

/**
 * Format valid interval string with HTML <time> elements
 */
export function validInterval(
  start: string,
  end: string,
  timeZone: string,
  locale: string
): string {
  const startMoment = toTimeZone(start, timeZone, locale)
  const endMoment = toTimeZone(end, timeZone, locale)
  return `${formatTimeMoment(startMoment)} – ${formatTimeMoment(
    endMoment
  )}`
}

/**
 * Format a single time moment as an ARIA label
 */
function formatTimeMomentAriaLabel(
  moment: TimeZoneMoment,
  t: (key: string) => string
): string {
  const monthName = t(`month${moment.month}`)
  return `${moment.day}. ${monthName}${t('monthPartitive')} ${twoDigits(
    moment.hour
  )}:${twoDigits(moment.minute)}`
}

/**
 * Format valid interval ARIA label
 */
export function validIntervalAriaLabel(
  start: string,
  end: string,
  timeZone: string,
  locale: string,
  t: (key: string) => string
): string {
  const startMoment = toTimeZone(start, timeZone, locale)
  const endMoment = toTimeZone(end, timeZone, locale)
  return `${formatTimeMomentAriaLabel(startMoment, t)} – ${formatTimeMomentAriaLabel(
    endMoment,
    t
  )}`
}

/**
 * Calculate milliseconds since start of day
 */
export function msSinceStartOfDay(
  timestamp: number,
  timeZone: string,
  locale: string
): number {
  const moment = toTimeZone(timestamp, timeZone, locale)
  const ms =
    ((moment.hour * 60 + moment.minute) * 60 + moment.second) * 1000 +
    moment.millisecond
  // Daylight saving time adjustment
  const ref = toTimeZone(timestamp - ms, timeZone, locale)
  if (ref.day !== moment.day) {
    return ms - 60 * 60 * 1000
  }
  return ms + ref.hour * 60 * 60 * 1000
}

// ============================================================================
// Coverage Data Parsing
// ============================================================================

export interface CoveragePathData {
  path: string
  reference: [number, number] | []
}

/**
 * Parse coverage data from SVG string
 */
export function coverageData(coverage: string): CoveragePathData[] {
  const doc = new DOMParser().parseFromString(coverage, 'text/xml')
  const paths = xpath.select(
    '//*[name()="svg"]//*[local-name()="path" and @id!="bbox"]',
    doc
  ) as Element[]
  const circle = xpath.select(
    '//*[name()="svg"]//*[local-name()="circle" and @id="reference"]',
    doc
  ) as Element[]

  return paths.map((path, index) => {
    const firstCircle = circle[0]
    return {
      path: path.getAttribute('d') ?? '',
      reference:
        index === 0 && circle.length > 0 && firstCircle
          ? ([
              Number(firstCircle.getAttribute('cx')),
              Number(firstCircle.getAttribute('cy')),
            ] as [number, number])
          : ([] as []),
    }
  })
}

// ============================================================================
// Warning Creation Helpers
// ============================================================================

export interface WarningCreationContext {
  geometryId: string
  geometries: GeometryCollection
  timeZone: string
  locale: string
  currentTime: number
  updatedAt: number | null
  startFrom: string
  staticDays: boolean
  timeOffset: number
  dailyWarningTypes: string[]
  warningTypes: Map<string, RegionType>
  t: (key: string) => string
  handleError: (error: string) => void
}

/**
 * Calculate effective days for a warning
 */
export function effectiveDays(
  start: string,
  end: string,
  dailyWarning: boolean,
  context: WarningCreationContext
): boolean[] {
  const { timeOffset, startFrom, updatedAt, currentTime, timeZone, locale } =
    context
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
 * Create weather warning from raw data
 */
export function createWeatherWarning(
  warning: { properties: Record<string, unknown> },
  context: WarningCreationContext
): Warning {
  const { geometryId, geometries, timeZone, locale, dailyWarningTypes, t } =
    context
  let direction = 0
  let severity = Number(
    String(warning.properties.severity ?? '').slice(-1)
  ) as Severity

  switch (warning.properties[WARNING_CONTEXT]) {
    case SEA_WIND:
      direction =
        ((warning.properties[PHYSICAL_DIRECTION] as number) ?? 0) - 180
      if (warning.properties[SEVERITY] === WARNING_LEVELS[0]) {
        severity = (severity + 1) as Severity
      }
      break
    case WIND:
      direction = ((warning.properties[PHYSICAL_DIRECTION] as number) ?? 0) - 90
      break
    default:
  }

  const regionId = regionFromReference(warning.properties.reference as string)
  const type = warningType(warning.properties)
  const geometryData = geometries[geometryId]

  return {
    type,
    id: warning.properties.identifier as string,
    regions: geometryData?.[regionId] ? { [regionId]: true } : {},
    covRegions: new Map(),
    coveragesLarge: [],
    coveragesSmall: [],
    effectiveFrom: warning.properties[EFFECTIVE_FROM] as string,
    effectiveUntil: warning.properties[EFFECTIVE_UNTIL] as string,
    effectiveDays: effectiveDays(
      warning.properties[EFFECTIVE_FROM] as string,
      warning.properties[EFFECTIVE_UNTIL] as string,
      dailyWarningTypes.includes(type),
      context
    ),
    validInterval: validInterval(
      warning.properties[EFFECTIVE_FROM] as string,
      warning.properties[EFFECTIVE_UNTIL] as string,
      timeZone,
      locale
    ),
    validIntervalAriaLabel: validIntervalAriaLabel(
      warning.properties[EFFECTIVE_FROM] as string,
      warning.properties[EFFECTIVE_UNTIL] as string,
      timeZone,
      locale,
      t
    ),
    severity,
    direction,
    value: (warning.properties[PHYSICAL_VALUE] as number) ?? 0,
    text: getWarningText(warning.properties),
    info: {
      fi: warning.properties[INFO_FI]
        ? he.decode(warning.properties[INFO_FI] as string)
        : '',
      sv: warning.properties[INFO_SV]
        ? he.decode(warning.properties[INFO_SV] as string)
        : '',
      en: warning.properties[INFO_EN]
        ? he.decode(warning.properties[INFO_EN] as string)
        : '',
    },
    link: '',
    linkText: '',
  }
}

/**
 * Create flood warning from raw data
 */
export function createFloodWarning(
  warning: { properties: Record<string, unknown> },
  context: WarningCreationContext
): Warning {
  const { timeZone, locale, dailyWarningTypes, t, handleError } = context

  let info = ''
  try {
    info = JSON.parse(
      decodeURIComponent(
        warning.properties.description != null
          ? (warning.properties.description as string)
          : '[%22%22]'
      ).replace(/[\n|\t]/g, ' ')
    )[0]
  } catch (e) {
    handleError((e as Error).name)
  }

  const regionId = regionFromReference(warning.properties.reference as string)
  const langKey = (warning.properties.language as string)
    ?.substring(0, 2)
    ?.toLowerCase() as keyof LocalizedText

  return {
    type: FLOOD_LEVEL_TYPE,
    id: warning.properties.identifier as string,
    regions: { [regionId]: true },
    covRegions: new Map(),
    coveragesLarge: [],
    coveragesSmall: [],
    effectiveFrom: warning.properties[ONSET] as string,
    effectiveUntil: warning.properties[EXPIRES] as string,
    effectiveDays: effectiveDays(
      warning.properties[ONSET] as string,
      warning.properties[EXPIRES] as string,
      dailyWarningTypes.includes(FLOOD_LEVEL_TYPE),
      context
    ),
    validInterval: validInterval(
      warning.properties[ONSET] as string,
      warning.properties[EXPIRES] as string,
      timeZone,
      locale
    ),
    validIntervalAriaLabel: validIntervalAriaLabel(
      warning.properties[ONSET] as string,
      warning.properties[EXPIRES] as string,
      timeZone,
      locale,
      t
    ),
    severity: (FLOOD_LEVELS[
      (warning.properties.severity as string)?.toLowerCase()
    ] ?? 0) as Severity,
    direction: 0,
    value: 0,
    text: '',
    info: { [langKey]: info },
    link: t('floodLink'),
    linkText: t('floodLinkText'),
  }
}

// ============================================================================
// Data Processing Functions
// ============================================================================

/**
 * Create days array from warnings
 */
export function createDays(
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
export function getMaxSeverities(
  warnings: WarningsMap
): Record<string, Severity> {
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
export function createLegend(
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

// ============================================================================
// Composable
// ============================================================================

export interface UseUtilsOptions {
  theme: Ref<string>
  geometryId: Ref<string>
  geometries: Ref<GeometryCollection>
  colors: Ref<ThemeColorMap>
  warnings: Ref<WarningsMap | null>
  visibleWarnings: Ref<string[]>
  index: Ref<number>
  size: Ref<string>
  strokeWidth: Ref<number>
  regionIds: Ref<string[]>
  warningTypes: Ref<Map<string, RegionType>>
  coverageCriterion: Ref<number>
  timeZone: Ref<string>
  locale: Ref<string>
}

export interface UseUtilsReturn {
  strokeColor: ComputedRef<string>
  // Add more computed values as needed
}

/**
 * Utils composable for reactive computed values
 */
export function useUtils(options: UseUtilsOptions): UseUtilsReturn {
  const { theme, colors } = options

  const strokeColor = computed<string>(() => {
    return (
      colors.value?.[theme.value as keyof ThemeColorMap]?.stroke ??
      'DarkSlateGray'
    )
  })

  return {
    strokeColor,
  }
}

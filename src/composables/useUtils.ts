/**
 * Utility functions and constants composable
 *
 * Provides constants and helper functions for warning data processing, time
 * interval formatting and region visualization. Time zone conversions are in
 * useTimeZone.
 */

import { DOMParser } from '@xmldom/xmldom'
import xpath from 'xpath'
import type { RegionsData, TimeZoneMoment } from '@/types'
import { toTimeZone } from './useTimeZone'

// ============================================================================
// Constants
// ============================================================================

export const NUMBER_OF_DAYS = 5
/**
 * Screens narrower than this (in pixels) are narrow: the small maps of the
 * date selector are hidden there. Same as the width in the media queries of
 * DaySmall and MapSmall (a test checks this).
 */
export const NARROW_SCREEN_BREAKPOINT = 576
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
// Date/Time Formatting
// ============================================================================

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
  // xmldom's Document type is not assignable to the DOM lib Node used by xpath
  const doc = new DOMParser().parseFromString(
    coverage,
    'text/xml'
  ) as unknown as Node
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

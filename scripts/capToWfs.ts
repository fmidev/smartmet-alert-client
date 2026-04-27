/**
 * Convert an FMI CAP Atom feed (https://alerts.fmi.fi/cap/feed/) into the
 * WFS-style WarningsData shape that this application's processWarnings()
 * consumes.
 *
 * The two formats describe the same kind of data but are not identical:
 *   - CAP groups one alert per <entry>, with one <info> block per language.
 *     Each <info> can carry multiple <area> elements.
 *   - WFS emits one Feature per (alert, area) pair and leaves translations
 *     as info_fi / info_sv / info_en on the same feature.
 *
 * What the converter supports today:
 *   - eventCode.value -> warning_context (hyphenated form)
 *   - CAP severity (Minor/Moderate/Severe/Extreme) -> level-1..level-4
 *   - onset / expires -> effective_from / effective_until
 *   - areaDesc -> RegionGeometry.name lookup -> reference URL in the
 *     format src/data/geometries.json region ids expect
 *   - <parameter> windDirection / windIntensity / precipitation carried
 *     into physical_direction / physical_value (CAP names "windIntensity"
 *     what the WFS schema calls physical_value for wind warnings)
 *   - <parameter> waterHeight -> context_extension high-water/shallow-water
 *
 * What it does not try to reproduce faithfully (CAP does not carry this):
 *   - coverage_references (set to empty string so coverage paths are not
 *     emitted; the map still renders the affected counties/municipalities)
 *   - publication / creation metadata (backfilled from <sent>/<updated>)
 */

import { DOMParser } from '@xmldom/xmldom'
import xpath from 'xpath'

import geometryData from '../src/data/geometries.json'
import type {
  GeoJSONFeature,
  GeoJSONFeatureCollection,
  WarningsData,
} from '../src/types'

type Geometries = typeof geometryData

interface NameIndex {
  /** exact region name -> region id (e.g. "Päijät-Häme" -> "county.7") */
  byExactName: Map<string, string>
  /** normalised ("päijäthäme") -> region id for fuzzy matching */
  byNormalisedName: Map<string, string>
}

function buildNameIndex(geometries: Geometries, year: string): NameIndex {
  const byExactName = new Map<string, string>()
  const byNormalisedName = new Map<string, string>()
  const yearGeom = (geometries.geometries as Record<string, unknown>)[year] as
    | Record<string, { name?: string }>
    | undefined
  if (!yearGeom) return { byExactName, byNormalisedName }
  for (const [id, region] of Object.entries(yearGeom)) {
    if (id === 'borders' || typeof region?.name !== 'string') continue
    byExactName.set(region.name, id)
    byNormalisedName.set(normaliseName(region.name), id)
  }
  return { byExactName, byNormalisedName }
}

function normaliseName(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

const NS = {
  atom: 'http://www.w3.org/2005/Atom',
  cap: 'urn:oasis:names:tc:emergency:cap:1.2',
}

const select = xpath.useNamespaces(NS)

const CAP_TO_WARNING_CONTEXT: Record<string, string> = {
  wind: 'wind',
  rain: 'rain',
  thunderstorm: 'thunder-storm',
  coldWeather: 'cold-weather',
  hotWeather: 'hot-weather',
  forestFireWeather: 'forest-fire-weather',
  grassFireWeather: 'grass-fire-weather',
  pedestrianSafety: 'pedestrian-safety',
  trafficWeather: 'traffic-weather',
  uvNote: 'uv-note',
  seaWind: 'sea-wind',
  seaThunderstorm: 'sea-thunder-storm',
  seaWaveHeight: 'sea-wave-height',
  seaWaterHeight: 'sea-water-height',
  seaIcing: 'sea-icing',
  floodLevel: 'flood-level',
}

const CAP_SEVERITY_TO_LEVEL: Record<string, string> = {
  Minor: 'level-1',
  Moderate: 'level-2',
  Severe: 'level-3',
  Extreme: 'level-4',
}

/** Strings passed to xpath selectors coerce to single values; this helper
 * centralises the null-safe extraction. */
function textAt(
  xpathExpr: string,
  context: Node,
  defaultValue = ''
): string {
  const result = select(xpathExpr, context, true) as Node | null
  if (!result) return defaultValue
  return result.textContent?.trim() ?? defaultValue
}

function allElements(xpathExpr: string, context: Node): Element[] {
  return select(xpathExpr, context) as unknown as Element[]
}

interface ConvertOptions {
  /** geometry id in src/data/geometries.json used for the region lookup */
  year?: string
  /** override the updateTime written into the weather_update_time feed;
   * defaults to the <updated> element of the Atom feed. */
  updateTime?: string
  /** discard CAP entries whose areaDesc does not match any known region */
  dropUnmatchedAreas?: boolean
}

export interface ConvertedFeed {
  warningsData: WarningsData
  stats: {
    entryCount: number
    alertCount: number
    areaCount: number
    matchedAreas: number
    unmatchedAreaNames: string[]
  }
  updateTimeIso: string
}

export function convertCapAtomToWarningsData(
  xml: string,
  opts: ConvertOptions = {}
): ConvertedFeed {
  const year = opts.year ?? '2021'
  const index = buildNameIndex(geometryData, year)

  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  const feedUpdated =
    textAt('/atom:feed/atom:updated', doc) || new Date().toISOString()
  const updateTimeIso = opts.updateTime ?? feedUpdated

  const features: GeoJSONFeature[] = []
  const unmatchedAreaNames = new Set<string>()
  let alertCount = 0
  let areaCount = 0
  let matchedAreas = 0

  const entries = allElements('/atom:feed/atom:entry', doc)
  for (const entry of entries) {
    const alerts = allElements('.//cap:alert', entry)
    for (const alert of alerts) {
      alertCount += 1
      // Cancel / all-clear messages often omit onset/expires. They describe
      // the withdrawal of an earlier warning rather than a current one, so
      // skip them entirely.
      const msgType = textAt('cap:msgType', alert)
      if (msgType === 'Cancel') continue

      const identifierBase = textAt('cap:identifier', alert)
      const sent = textAt('cap:sent', alert)
      // CAP alerts wrap one <info> block per language; they share a single
      // set of <area> entries per language but with translated areaDesc.
      // Pick only the Finnish info so each alert yields exactly one feature
      // per affected region, matching the WFS behaviour.
      const infoNodes = allElements(
        "cap:info[cap:language='fi-FI']",
        alert
      )
      for (const info of infoNodes) {
        const eventValue = textAt(
          'cap:eventCode[cap:valueName[contains(text(), "alerts.fmi.fi")]]/cap:value',
          info
        )
        const warningContext = CAP_TO_WARNING_CONTEXT[eventValue] ?? null
        if (!warningContext) continue
        const severity = textAt('cap:severity', info)
        const levelCode = CAP_SEVERITY_TO_LEVEL[severity]
        if (!levelCode) continue
        const onset = toIsoUtc(textAt('cap:onset', info))
        const expires = toIsoUtc(textAt('cap:expires', info))
        // Without both bounds the warning cannot be bucketed into a day,
        // which blows up downstream date math. Skip those.
        if (!onset || !expires) continue
        const headline = textAt('cap:headline', info)
        const description = textAt('cap:description', info)
        const params = readParameters(info)
        const contextExtension = deriveContextExtension(
          warningContext,
          params
        )

        const infoFi = description || headline
        const infoSv = ''
        const infoEn = ''

        const areas = allElements('cap:area', info)
        for (const area of areas) {
          areaCount += 1
          const areaDesc = textAt('cap:areaDesc', area)
          const regionId = lookupRegionId(areaDesc, index)
          if (!regionId) {
            unmatchedAreaNames.add(areaDesc)
            if (opts.dropUnmatchedAreas ?? true) continue
          }
          matchedAreas += 1
          const reference = regionId
            ? `http://gml.fmi.fi/static/${year}/FI/${regionId.split('.')[0]}.xml#${regionId}`
            : ''

          const properties: Record<string, unknown> = {
            identifier: `${identifierBase}#${regionId ?? areaDesc}`,
            warning_context: warningContext,
            publication_id: identifierBase,
            publication_time: sent,
            causes: null,
            context_extension: contextExtension,
            actualization_probability: null,
            creation_time: sent,
            effective_from: onset,
            effective_until: expires,
            info_en: infoEn,
            info_fi: infoFi,
            info_sv: infoSv,
            severity: levelCode,
            physical_reference: null,
            physical_value:
              toNumber(params.windIntensity) ??
              toNumber(params.precipitation) ??
              toNumber(params.waterHeight) ??
              null,
            physical_unit:
              params.windIntensityUom ??
              params.precipitationUom ??
              params.waterHeightUom ??
              null,
            physical_direction: toNumber(params.windDirection) ?? null,
            geom: null,
            representative_x: null,
            representative_y: null,
            reference,
            coverage_references: '',
          }

          features.push({
            type: 'Feature',
            id: `${identifierBase}.${features.length}`,
            geometry: null,
            properties,
          })
        }
      }
    }
  }

  const warningsData: WarningsData = {
    weather_update_time: makeUpdateCollection(updateTimeIso),
    flood_update_time: makeUpdateCollection(updateTimeIso),
    weather_finland_active_all: {
      type: 'FeatureCollection',
      features,
      totalFeatures: features.length,
    },
    flood_finland_active_all: {
      type: 'FeatureCollection',
      features: [],
      totalFeatures: 0,
    },
  }

  return {
    warningsData,
    updateTimeIso,
    stats: {
      entryCount: entries.length,
      alertCount,
      areaCount,
      matchedAreas,
      unmatchedAreaNames: Array.from(unmatchedAreaNames).sort(),
    },
  }
}

/**
 * Merge info_fi / info_sv / info_en from multiple feeds (one per language)
 * into the matching features of a base warning feed.
 */
export function mergeLanguageFeeds(
  base: WarningsData,
  others: { language: 'fi' | 'sv' | 'en'; data: WarningsData }[]
): WarningsData {
  const baseFeatures = base.weather_finland_active_all?.features ?? []
  const keyFor = (f: GeoJSONFeature): string =>
    String(
      (f.properties as { publication_id?: string; reference?: string }).publication_id ?? ''
    ) +
    '|' +
    String((f.properties as { reference?: string }).reference ?? '')

  const index = new Map<string, GeoJSONFeature>()
  for (const f of baseFeatures) index.set(keyFor(f), f)

  for (const { language, data } of others) {
    const field =
      language === 'fi' ? 'info_fi' : language === 'sv' ? 'info_sv' : 'info_en'
    for (const f of data.weather_finland_active_all?.features ?? []) {
      const match = index.get(keyFor(f))
      if (!match) continue
      const text = (f.properties as Record<string, unknown>)[field]
      if (typeof text === 'string' && text.length > 0) {
        ;(match.properties as Record<string, unknown>)[field] = text
      }
    }
  }

  return base
}

function lookupRegionId(areaDesc: string, index: NameIndex): string | null {
  if (!areaDesc) return null
  const exact = index.byExactName.get(areaDesc)
  if (exact) return exact
  const normalised = index.byNormalisedName.get(normaliseName(areaDesc))
  if (normalised) return normalised
  return null
}

function readParameters(info: Node): Record<string, string> {
  const out: Record<string, string> = {}
  const params = allElements('cap:parameter', info)
  for (const p of params) {
    const name = textAt('cap:valueName', p)
    const value = textAt('cap:value', p)
    if (name) out[name] = value
  }
  return out
}

function deriveContextExtension(
  warningContext: string,
  params: Record<string, string>
): string | null {
  if (warningContext !== 'sea-water-height') return null
  const type = params.waterHeightType
  if (!type) return null
  if (type.toLowerCase().includes('shallow')) return 'shallow-water'
  if (type.toLowerCase().includes('high')) return 'high-water'
  return null
}

function toIsoUtc(capTime: string): string {
  if (!capTime) return ''
  // CAP timestamps are ISO 8601 with an offset ("+03:00"). Convert to Z.
  const parsed = new Date(capTime)
  return Number.isNaN(parsed.getTime()) ? capTime : parsed.toISOString()
}

/**
 * Parse a parameter value as a number. Returns null rather than the raw
 * string so physical_value comes out typed — the WFS schema has it as a
 * numeric property, and components like MapLarge's wind-speed label
 * expect to stringify a number.
 */
function toNumber(value: string | undefined): number | null {
  if (value == null || value === '') return null
  const num = Number(value)
  return Number.isFinite(num) ? num : null
}

function makeUpdateCollection(updateTimeIso: string): GeoJSONFeatureCollection {
  return {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        id: `update_time.${updateTimeIso}`,
        geometry: null,
        properties: {
          update_time: updateTimeIso,
        },
      },
    ],
    totalFeatures: 1,
  }
}

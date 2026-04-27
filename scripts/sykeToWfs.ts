/**
 * Convert the SYKE flood CAP atom feed
 * (https://wwwi2.ymparisto.fi/i2/CAP/SYKE_CAP_current.atom) into the
 * flood_finland_active_all shape that this application's
 * processWarnings() consumes.
 *
 * The feed format is CAP 1.2 with Finnish area descriptors that match
 * src/data/geometries.json RegionGeometry.name fields (e.g. "Simo",
 * "Pohjois-Pohjanmaan länsiosa"). One alert can carry several <area>
 * entries; each becomes one Feature.
 *
 * Example of a flood feature this converter reproduces (see the first
 * feature of cap-1.json in tests/data.json for the authoritative shape):
 *   {
 *     "type": "Feature",
 *     "geometry": null,
 *     "properties": {
 *       "identifier": "vesistomallit@ymparisto.fi,2.49.0.0.246.1.FI…",
 *       "sent": "2020-05-26T07:38:52Z",
 *       "description": "[%22 Tulvakeskus/SYKE: …%22]",
 *       "language": "fi-FI",
 *       "event": "Tulva",
 *       "expires": "2020-06-06T21:00:00Z",
 *       "onset": "2020-05-29T21:00:00Z",
 *       "severity": "SEVERE",
 *       "area_desc": "[%22Rovaniemi%22]",
 *       "representative_x": null,
 *       "representative_y": null,
 *       "reference": "http://gml.fmi.fi/static/2021/FI/municipality.xml#municipality.698",
 *       "order_index": 1
 *     }
 *   }
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

const NS = {
  atom: 'http://www.w3.org/2005/Atom',
  cap: 'urn:oasis:names:tc:emergency:cap:1.2',
}

const select = xpath.useNamespaces(NS)

const ALLOWED_SEVERITIES = new Set([
  'MINOR',
  'MODERATE',
  'SEVERE',
  'EXTREME',
])

interface NameIndex {
  byExactName: Map<string, string>
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

function textAt(xpathExpr: string, context: Node, defaultValue = ''): string {
  const result = select(xpathExpr, context, true) as Node | null
  if (!result) return defaultValue
  return result.textContent?.trim() ?? defaultValue
}

function allElements(xpathExpr: string, context: Node): Element[] {
  return select(xpathExpr, context) as unknown as Element[]
}

export interface SykeConvertOptions {
  year?: string
  updateTime?: string
}

export interface SykeConvertResult {
  warningsData: WarningsData
  updateTimeIso: string
  stats: {
    alerts: number
    areasMatched: number
    unmatchedAreaNames: string[]
  }
}

export function convertSykeCapToWarningsData(
  xml: string,
  opts: SykeConvertOptions = {}
): SykeConvertResult {
  const year = opts.year ?? '2021'
  const index = buildNameIndex(geometryData, year)
  const doc = new DOMParser().parseFromString(xml, 'text/xml')
  const feedUpdated =
    textAt('/atom:feed/atom:updated', doc) || new Date().toISOString()
  const updateTimeIso = opts.updateTime ?? feedUpdated

  const features: GeoJSONFeature[] = []
  const unmatched = new Set<string>()
  let alerts = 0
  let areasMatched = 0

  const alertNodes = allElements('//cap:alert', doc)
  for (const alert of alertNodes) {
    const msgType = textAt('cap:msgType', alert)
    if (msgType === 'Cancel') continue
    alerts += 1

    const identifier = textAt('cap:identifier', alert)
    const sentRaw = textAt('cap:sent', alert)
    const sender = textAt('cap:sender', alert)
    const infoNodes = allElements("cap:info[cap:language='fi-FI']", alert)
    for (const info of infoNodes) {
      const severity = textAt('cap:severity', info).toUpperCase()
      if (!ALLOWED_SEVERITIES.has(severity)) continue
      const onset = toIsoUtc(textAt('cap:onset', info))
      const expires = toIsoUtc(textAt('cap:expires', info))
      if (!onset || !expires) continue

      // The SYKE feed ships a year's worth of historical alerts. Keep
      // only those that are still in force at the feed's update time;
      // anything whose `expires` has already passed would be filtered
      // out downstream anyway (processWarnings's 5-day window would mark
      // it inactive) but shipping it in the fixture bloats the file and
      // makes the snapshot output less obvious.
      if (new Date(expires).getTime() <= new Date(updateTimeIso).getTime()) {
        continue
      }

      const description = textAt('cap:description', info)
      const event = textAt('cap:event', info)

      const areaNodes = allElements('cap:area', info)
      let areaIndex = 0
      for (const area of areaNodes) {
        const areaDesc = textAt('cap:areaDesc', area)
        const regionId = lookupRegionId(areaDesc, index)
        if (!regionId) {
          unmatched.add(areaDesc)
          continue
        }
        areasMatched += 1
        areaIndex += 1
        const reference = `http://gml.fmi.fi/static/${year}/FI/${regionId.split('.')[0]}.xml#${regionId}`
        const identifierWithArea = `${sender},${identifier},${sentRaw}#${regionId}`

        const properties: Record<string, unknown> = {
          identifier: identifierWithArea,
          sent: toIsoUtc(sentRaw),
          description: encodeAsFloodDescription(description),
          language: 'fi-FI',
          event: event || 'Tulva',
          expires,
          onset,
          severity,
          area_desc: encodeAsFloodAreaDesc(areaDesc),
          representative_x: null,
          representative_y: null,
          reference,
          order_index: areaIndex,
        }

        features.push({
          type: 'Feature',
          id: `flood_syke.${features.length}`,
          geometry: null,
          properties,
        })
      }
    }
  }

  const warningsData: WarningsData = {
    weather_update_time: makeUpdateCollection(updateTimeIso),
    flood_update_time: makeUpdateCollection(updateTimeIso),
    weather_finland_active_all: {
      type: 'FeatureCollection',
      features: [],
      totalFeatures: 0,
    },
    flood_finland_active_all: {
      type: 'FeatureCollection',
      features,
      totalFeatures: features.length,
    },
  }

  return {
    warningsData,
    updateTimeIso,
    stats: {
      alerts,
      areasMatched,
      unmatchedAreaNames: Array.from(unmatched).sort(),
    },
  }
}

function lookupRegionId(areaDesc: string, index: NameIndex): string | null {
  if (!areaDesc) return null
  const exact = index.byExactName.get(areaDesc)
  if (exact) return exact
  const normalised = index.byNormalisedName.get(normaliseName(areaDesc))
  if (normalised) return normalised
  return null
}

function toIsoUtc(capTime: string): string {
  if (!capTime) return ''
  const parsed = new Date(capTime)
  return Number.isNaN(parsed.getTime()) ? '' : parsed.toISOString()
}

/** The application parses description as JSON.parse(decodeURIComponent(x))
 * expecting an array whose first element is the free-form text. */
function encodeAsFloodDescription(text: string): string {
  const quoted = JSON.stringify([text])
  return encodeURIComponent(quoted)
}

/** Same encoding rule as description but for single-area labels. */
function encodeAsFloodAreaDesc(areaDesc: string): string {
  const quoted = JSON.stringify([areaDesc])
  return encodeURIComponent(quoted)
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

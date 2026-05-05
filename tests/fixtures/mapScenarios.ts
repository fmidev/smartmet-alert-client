/**
 * Map snapshot regression scenarios.
 *
 * All scenarios share the same on-disk shape: one JSON file per scenario
 * at tests/fixtures/scenarios/scenario-<N>.json, containing
 *   { meta: { id, label, source, description, sourceUrl?, updateTimeIso? },
 *     data: { weather_update_time, flood_update_time,
 *             weather_finland_active_all, flood_finland_active_all } }
 *
 * meta.source is one of:
 *   'wfs'  — manually generated FMI WFS test data (ids 1..21)
 *   'cap'  — converted from https://alerts.fmi.fi/cap/feed/ (ids 22..28)
 *   'syke' — converted from the SYKE flood CAP feed (id 29)
 *
 * The conversion scripts (scripts/capToWfs.ts, scripts/sykeToWfs.ts,
 * scripts/build-cap-scenarios.ts) always write into this directory, so
 * rebuilding scenarios never requires touching this loader.
 *
 * For each scenario we derive a deterministic `currentTime` from the
 * captured update_time so the 5-day window aligns with the warnings that
 * were active when the snapshot was taken.
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

import type { GeoJSONFeatureCollection, WarningsData } from '@/types'

export type MapScenarioSource = 'wfs' | 'cap' | 'syke'

export interface MapScenario {
  /** Stable scenario id. 1..21 are legacy WFS captures; 22+ are derived. */
  id: number
  /** Short label describing the scenario, for snapshot review UX */
  label: string
  /** Where the data originated */
  source: MapScenarioSource
  /** Free-form description shown in review artifacts and build logs */
  description: string
  /** Optional URL the data was downloaded from (CAP/SYKE scenarios) */
  sourceUrl?: string
  /** Shape AlertClient / processWarnings consume */
  data: WarningsData
  /** Pinned "now" (ms since epoch) for deterministic day-bucketing */
  currentTime: number
  /** ISO form of currentTime, useful for debugging / snapshot review */
  currentTimeIso: string
  /** The update_time reported by the weather source, for reference */
  weatherUpdateIso: string
  /** The update_time reported by the flood source, for reference */
  floodUpdateIso: string
}

interface ScenarioEnvelope {
  meta: {
    id: number
    label: string
    source: MapScenarioSource
    description: string
    sourceUrl?: string
    updateTimeIso?: string
  }
  data: WarningsData
}

const SCENARIOS_DIR = resolve(
  process.cwd(),
  'tests',
  'fixtures',
  'scenarios'
)

function readUpdateTime(collection: GeoJSONFeatureCollection): string {
  const feature = collection.features[0]
  const updateTime = feature?.properties?.update_time
  if (typeof updateTime !== 'string' || updateTime.length === 0) {
    throw new Error('Missing update_time in fixture')
  }
  return updateTime
}

function envelopeToScenario(envelope: ScenarioEnvelope): MapScenario {
  const wd = envelope.data
  if (!wd.weather_update_time || !wd.flood_update_time) {
    throw new Error(
      `Scenario ${envelope.meta.id} is missing update_time collections`
    )
  }
  const weatherUpdateIso = readUpdateTime(wd.weather_update_time)
  const floodUpdateIso = readUpdateTime(wd.flood_update_time)
  // Use the later of the two update times + 1 second so neither endpoint
  // is flagged "outdated" by useWarningsProcessor's maxUpdateDelay check.
  const currentTime =
    Math.max(
      new Date(weatherUpdateIso).getTime(),
      new Date(floodUpdateIso).getTime()
    ) + 1000
  return {
    id: envelope.meta.id,
    label: envelope.meta.label,
    source: envelope.meta.source,
    description: envelope.meta.description,
    sourceUrl: envelope.meta.sourceUrl,
    data: wd,
    currentTime,
    currentTimeIso: new Date(currentTime).toISOString(),
    weatherUpdateIso,
    floodUpdateIso,
  }
}

function readEnvelope(file: string): ScenarioEnvelope {
  const payload = JSON.parse(readFileSync(file, 'utf8')) as ScenarioEnvelope
  if (!payload?.meta || !payload?.data) {
    throw new Error(`${file}: invalid scenario envelope`)
  }
  return payload
}

function scenarioPath(n: number): string {
  return resolve(SCENARIOS_DIR, `scenario-${n}.json`)
}

/** Load one scenario by id. Throws if no such file exists. */
export function loadScenario(n: number): MapScenario {
  const file = scenarioPath(n)
  if (!existsSync(file)) {
    throw new Error(
      `Scenario ${n} not found at tests/fixtures/scenarios/scenario-${n}.json`
    )
  }
  return envelopeToScenario(readEnvelope(file))
}

/** List scenario ids present on disk, in ascending order. */
export function listScenarioIds(): number[] {
  if (!existsSync(SCENARIOS_DIR)) return []
  return readdirSync(SCENARIOS_DIR)
    .map((name) => {
      const m = name.match(/^scenario-(\d+)\.json$/)
      return m && m[1] ? Number(m[1]) : NaN
    })
    .filter((n) => Number.isInteger(n))
    .sort((a, b) => a - b)
}

/** Load all scenarios present on disk in id order. */
export function allScenarios(): MapScenario[] {
  return listScenarioIds().map((id) => loadScenario(id))
}

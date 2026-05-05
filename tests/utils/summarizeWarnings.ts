/**
 * Serialization helpers that turn the processWarnings() result into a
 * compact, deterministic, JSON-friendly shape suitable for snapshotting.
 *
 * Large SVG `d` strings from coverages are omitted here — they are covered
 * by the dHash values in summarizeMapPaths.ts and by the end-to-end DOM
 * snapshots in tests/integration/map-snapshots.spec.ts. Leaving them out
 * keeps the layer-1 .snap files readable.
 */

import type { Day, LegendItem, RegionsData, Warning, WarningsMap } from '@/types'
import type { ParentsMap } from '@/composables/useWarningsProcessor'

export interface SerializedWarning {
  type: string
  severity: number
  validInterval: string
  effectiveFrom: string
  effectiveUntil: string
  effectiveDays: boolean[]
  direction: number
  value: number
  regions: string[]
  covRegions: Record<string, number>
  coveragesLargeCount: number
  coveragesSmallCount: number
  dailyWarning: boolean
}

export interface SerializedResult {
  days: Day[]
  legend: LegendItem[]
  regions: RegionsData
  parents: ParentsMap
  warnings: Record<string, SerializedWarning>
  updatedAt: number | null
  timeOffset: number
}

export interface ProcessWarningsOutput {
  days: Day[]
  legend: LegendItem[]
  regions: RegionsData
  parents: ParentsMap
  warnings: WarningsMap
  updatedAt: number | null
  timeOffset: number
}

function summarizeWarning(w: Warning): SerializedWarning {
  const covEntries = Array.from(w.covRegions.entries()).sort((a, b) =>
    a[0].localeCompare(b[0])
  )
  return {
    type: w.type,
    severity: w.severity,
    validInterval: w.validInterval,
    effectiveFrom: w.effectiveFrom,
    effectiveUntil: w.effectiveUntil,
    effectiveDays: w.effectiveDays,
    direction: w.direction,
    value: w.value,
    regions: Object.keys(w.regions).sort(),
    covRegions: Object.fromEntries(covEntries),
    coveragesLargeCount: w.coveragesLarge.length,
    coveragesSmallCount: w.coveragesSmall.length,
    dailyWarning: Boolean(w.dailyWarning),
  }
}

export function summarizeResult(r: ProcessWarningsOutput): SerializedResult {
  const serializedWarnings: Record<string, SerializedWarning> = {}
  for (const id of Object.keys(r.warnings).sort()) {
    const w = r.warnings[id]
    if (w) {
      serializedWarnings[id] = summarizeWarning(w)
    }
  }
  return {
    days: r.days,
    legend: r.legend,
    regions: r.regions,
    parents: r.parents,
    warnings: serializedWarnings,
    updatedAt: r.updatedAt,
    timeOffset: r.timeOffset,
  }
}

/**
 * Serialization helpers for the path arrays returned by useMapPaths.
 *
 * SVG `d` strings can be thousands of characters long and make .snap files
 * unreadable. Instead we store:
 *   - the length of the path string
 *   - a short SHA-256 prefix ("dHash") of the full path
 *
 * A regression that changes any path byte flips the dHash, while reviewers
 * still see readable snapshots. The end-to-end verification of the actual
 * `d` values happens in tests/integration/map-snapshots.spec.ts which
 * snapshots the rendered SVG in full.
 */

import { createHash } from 'node:crypto'

import type {
  PathData,
  BorderPath,
  CoverageData,
} from '@/composables/useMapPaths'

function sha(s: string): string {
  if (!s) return ''
  return createHash('sha256').update(s).digest('hex').slice(0, 12)
}

export interface SerializedPath {
  key: string
  fill: string
  opacity: string
  strokeWidth: number | string
  dataRegion: string | undefined
  dataSeverity: number | undefined
  dHash: string
  dLength: number
}

export interface SerializedBorder {
  key: string
  opacity: string
  strokeWidth: number | string
  dHash: string
  dLength: number
}

export interface SerializedCoverage {
  key: string
  fill: string
  fillOpacity: number
  strokeWidth: number | string
  dHash: string
  dLength: number
}

export function summarizePath(p: PathData): SerializedPath {
  return {
    key: p.key,
    fill: p.fill,
    opacity: p.opacity,
    strokeWidth: p.strokeWidth,
    dataRegion: p.dataRegion,
    dataSeverity: p.dataSeverity,
    dHash: sha(p.d),
    dLength: p.d?.length ?? 0,
  }
}

export function summarizeBorder(b: BorderPath): SerializedBorder {
  return {
    key: b.key,
    opacity: b.opacity,
    strokeWidth: b.strokeWidth,
    dHash: sha(b.d),
    dLength: b.d?.length ?? 0,
  }
}

export function summarizeCoverage(c: CoverageData): SerializedCoverage {
  return {
    key: c.key,
    fill: c.fill,
    fillOpacity: c.fillOpacity,
    strokeWidth: c.strokeWidth,
    dHash: sha(c.d),
    dLength: c.d?.length ?? 0,
  }
}

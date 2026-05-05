/**
 * Layer 1b regression snapshots — the output of useMapPaths() for each
 * scenario × day × size combination.
 *
 * SVG path `d` values are hashed (dHash) rather than stored in full; any
 * drift in the map vector data flips the hash, while the .snap file stays
 * readable. The rendered SVG itself is covered by layer 2.
 */

import { describe, it, expect } from 'vitest'
import { effectScope, ref } from 'vue'

import {
  processWarnings,
  type WarningsProcessorContext,
} from '@/composables/useWarningsProcessor'
import { useConfig } from '@/composables/useConfig'
import { useI18n } from '@/composables/useI18n'
import { useMapPaths } from '@/composables/useMapPaths'
import geojsonsvg from '@/mixins/geojsonsvg'
import type {
  DayRegions,
  GeoJSONFeature,
  Language,
  Theme,
  WarningsMap,
} from '@/types'

import { allScenarios } from '../../fixtures/mapScenarios'
import {
  summarizeBorder,
  summarizeCoverage,
  summarizePath,
} from '../../utils/summarizeMapPaths'

const geoJSONToSVG = geojsonsvg.methods.geoJSONToSVG.bind(geojsonsvg.methods)

function buildCtx(
  currentTime: number,
  language: Language = 'fi'
): WarningsProcessorContext {
  const config = useConfig()
  const { t } = useI18n(language)
  return {
    geometryId: '2021',
    geometries: config.geometries,
    regionIds: config.regionIds,
    warningTypes: config.warningTypes,
    timeZone: config.timeZone,
    locale: config.dateTimeFormatLocale,
    currentTime,
    startFrom: '',
    staticDays: true,
    dailyWarningTypes: [],
    maxUpdateDelay:
      config.maxUpdateDelay as WarningsProcessorContext['maxUpdateDelay'],
    bbox: config.bbox as unknown as GeoJSONFeature,
    geoJSONToSVG,
    t,
    handleError: () => {},
    onDataError: () => {},
  }
}

interface RunArgs {
  size: 'Large' | 'Small'
  index: number
  input: DayRegions
  warnings: WarningsMap | null
  visibleWarnings: string[]
  geometryId: number
  theme: Theme
  loading: boolean
  strokeWidth: number
}

function runMapPaths(args: RunArgs): Record<string, unknown> {
  const scope = effectScope()
  let out: Record<string, unknown> = {}
  scope.run(() => {
    const paths = useMapPaths({
      size: ref(args.size),
      index: ref(args.index),
      input: ref(args.input),
      warnings: ref(args.warnings),
      visibleWarnings: ref(args.visibleWarnings),
      geometryId: ref(args.geometryId),
      theme: ref<Theme | string>(args.theme),
      loading: ref(args.loading),
      strokeWidth: ref<number | string>(args.strokeWidth),
    })
    // Read every computed eagerly so their values are captured before
    // the effect scope is torn down.
    out = {
      strokeColor: paths.strokeColor.value,
      bluePaths: paths.bluePaths.value.map(summarizePath),
      greenPaths: paths.greenPaths.value.map(summarizePath),
      yellowPaths: paths.yellowPaths.value.map(summarizePath),
      orangePaths: paths.orangePaths.value.map(summarizePath),
      redPaths: paths.redPaths.value.map(summarizePath),
      overlayPaths: paths.overlayPaths.value.map(summarizeBorder),
      landBorders: paths.landBorders.value.map(summarizeBorder),
      seaBorders: paths.seaBorders.value.map(summarizeBorder),
      yellowCoverages: paths.yellowCoverages.value.map(summarizeCoverage),
      orangeCoverages: paths.orangeCoverages.value.map(summarizeCoverage),
      redCoverages: paths.redCoverages.value.map(summarizeCoverage),
      overlayCoverages: paths.overlayCoverages.value.map(summarizeCoverage),
    }
  })
  scope.stop()
  return out
}

/**
 * Only day 0 is snapshotted per scenario; see
 * tests/integration/mapSnapshotHelpers.ts for the same rationale.
 */
const DAYS = [0] as const

describe('useMapPaths — per-scenario snapshots (large, light-theme, fi, day 0)', () => {
  for (const scenario of allScenarios()) {
    describe(`scenario ${scenario.id}`, () => {
      const result = processWarnings(
        scenario.data,
        buildCtx(scenario.currentTime)
      )
      const visibleWarnings = result.legend.map((l) => l.type)

      for (const day of DAYS) {
        it(`day ${day}`, () => {
          const dayRegions = result.regions[day]
          expect(dayRegions).toBeDefined()
          const summary = runMapPaths({
            size: 'Large',
            index: day,
            input: dayRegions as DayRegions,
            warnings: result.warnings,
            visibleWarnings,
            geometryId: 2021,
            theme: 'light-theme',
            loading: false,
            strokeWidth: 1,
          })
          expect(summary).toMatchSnapshot()
        })
      }
    })
  }
})

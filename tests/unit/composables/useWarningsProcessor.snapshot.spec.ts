/**
 * Layer 1a regression snapshots — the output of processWarnings() over
 * each of the 21 captured FMI scenarios in tests/data.json.
 *
 * The snapshot is a structural summary (see summarizeResult); long SVG
 * path strings are intentionally omitted here and covered by layer 1b's
 * dHashes and layer 2's full-DOM snapshots.
 */

import { describe, it, expect } from 'vitest'

import {
  processWarnings,
  type WarningsProcessorContext,
} from '@/composables/useWarningsProcessor'
import { useConfig } from '@/composables/useConfig'
import { useI18n } from '@/composables/useI18n'
import geojsonsvg from '@/mixins/geojsonsvg'
import type { GeoJSONFeature, Language } from '@/types'

import { allScenarios } from '../../fixtures/mapScenarios'
import { summarizeResult } from '../../utils/summarizeWarnings'

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
    handleError: () => {
      // Snapshot tests intentionally ignore error logs to keep output clean.
    },
    onDataError: () => {
      // Same as handleError.
    },
  }
}

describe('processWarnings — structural snapshots per scenario', () => {
  for (const scenario of allScenarios()) {
    it(`scenario ${scenario.id}`, () => {
      const result = processWarnings(scenario.data, buildCtx(scenario.currentTime))
      expect(summarizeResult(result)).toMatchSnapshot()
    })
  }
})

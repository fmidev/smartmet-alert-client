/**
 * Shared setup for the layer-2 map snapshot specs.
 *
 * Kept as a plain helper module (not a spec) so Vitest won't try to run
 * it, and so the per-scenario / matrix specs can import the same
 * `renderMapSvg` and context builder.
 */

import { mount, VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'

import MapLarge from '@/components/MapLarge.vue'
import {
  processWarnings,
  type WarningsProcessorContext,
} from '@/composables/useWarningsProcessor'
import { useConfig } from '@/composables/useConfig'
import { useI18n } from '@/composables/useI18n'
import geojsonsvg from '@/mixins/geojsonsvg'
import type { DayRegions, GeoJSONFeature, Language, Theme } from '@/types'

import { normalizeSvgHtml } from '../utils/normalizeSvgHtml'

const geoJSONToSVG = geojsonsvg.methods.geoJSONToSVG.bind(geojsonsvg.methods)

export function buildCtx(
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

export async function renderMapSvg(args: {
  dayRegions: DayRegions
  warnings: ReturnType<typeof processWarnings>['warnings']
  visibleWarnings: string[]
  day: number
  theme: Theme
  language: Language
}): Promise<{ svg: string; wrapper: VueWrapper }> {
  const wrapper = mount(MapLarge, {
    props: {
      index: args.day,
      input: args.dayRegions,
      warnings: args.warnings,
      visibleWarnings: args.visibleWarnings,
      geometryId: 2021,
      theme: args.theme,
      language: args.language,
      loading: false,
      spinnerEnabled: false,
    },
  })
  await nextTick()
  const svg = wrapper.find('svg#finland-large').html()
  return { svg: normalizeSvgHtml(svg), wrapper }
}

/**
 * Only day 0 is snapshotted per scenario. The warning data determines
 * every day's rendering through the same `useMapPaths` / `MapLarge`
 * code path, and iterating all 5 days previously inflated the snapshot
 * files to tens of megabytes without catching additional regressions.
 * The 95 scenarios already provide wide temporal coverage on their own.
 */
export const DAYS = [0] as const

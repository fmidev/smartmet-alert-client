/**
 * Layer 2 regression snapshots — the rendered <svg id="finland-large">
 * for every captured scenario × day, in Finnish with the light theme.
 *
 * Why this is deterministic across environments:
 *  - SVG path numbers come from src/data/geometries.json and from our own
 *    geojsonsvg mixin which uses toFixed(2). No library upgrade of Vue,
 *    Vitest, jsdom or @panzoom changes those values.
 *  - Warning icon SVG strings are hardcoded string constants in
 *    src/composables/useConfig.ts.
 *  - Vue scoped-style hashes (data-v-xxxxxxxx) are stripped by
 *    normalizeSvgHtml.
 *
 * Alongside the snapshot assertion, each test writes the normalized SVG
 * to tests/__artifacts__/current/<key>.svg so the snapshotReviewReporter
 * (and the standalone scripts/review-snapshots.ts script) can render a
 * side-by-side baseline vs current HTML report for visual review.
 *
 * The language × theme breadth sample lives in map-snapshots.matrix.spec.ts
 * so the two kinds of snapshot tables end up in separate .snap files.
 */

import { describe, it, expect, afterEach } from 'vitest'
import { VueWrapper } from '@vue/test-utils'

import { processWarnings } from '@/composables/useWarningsProcessor'
import type { DayRegions } from '@/types'

import { allScenarios } from '../fixtures/mapScenarios'
import { writeCurrentSvg } from '../utils/writeCurrentSvg'
import { buildCtx, DAYS, renderMapSvg } from './mapSnapshotHelpers'

describe('Map SVG — scenarios × days (fi, light-theme)', () => {
  let activeWrapper: VueWrapper | null = null

  afterEach(() => {
    if (activeWrapper) {
      activeWrapper.unmount()
      activeWrapper = null
    }
  })

  for (const scenario of allScenarios()) {
    describe(`scenario ${scenario.id}`, () => {
      const processed = processWarnings(
        scenario.data,
        buildCtx(scenario.currentTime, 'fi')
      )
      const visibleWarnings = processed.legend.map((l) => l.type)

      for (const day of DAYS) {
        it(`day ${day}`, async () => {
          const dayRegions = processed.regions[day]
          expect(dayRegions).toBeDefined()
          const { svg, wrapper } = await renderMapSvg({
            dayRegions: dayRegions as DayRegions,
            warnings: processed.warnings,
            visibleWarnings,
            day,
            theme: 'light-theme',
            language: 'fi',
          })
          activeWrapper = wrapper
          // Key the current-run artifact by the fully qualified test name
          // so it aligns with the snapshot key (modulo the trailing "1"
          // that toMatchSnapshot appends).
          const fullName = expect.getState().currentTestName ?? ''
          writeCurrentSvg(fullName, svg)
          expect(svg).toMatchSnapshot()
        })
      }
    })
  }
})

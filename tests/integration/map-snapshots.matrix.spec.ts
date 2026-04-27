/**
 * Layer 2 breadth sample — render a couple of information-rich scenarios
 * in every language × theme combination so regressions in colour or
 * localised text propagation are caught without exploding the total
 * snapshot count.
 *
 * Kept in its own spec file so its snapshots live in a separate .snap
 * file from the main per-scenario table. This keeps git diffs focused
 * when either set is regenerated, and keeps individual files under
 * git-friendly sizes.
 *
 * Scenario selection: only WFS captures (ids 1..19) are usable because
 * they carry all three translations (info_fi / info_sv / info_en). The
 * CAP-derived scenarios (20+) only have Finnish text. Within the WFS
 * set we pick the two most information-rich captures:
 *   - #1 is the "mega-scenario" (every warning type, all severities)
 *   - #5 has a rich mix of severities 2/3/4 and several distinct icons
 */

import { describe, it, expect, afterEach } from 'vitest'
import { VueWrapper } from '@vue/test-utils'

import { processWarnings } from '@/composables/useWarningsProcessor'
import type { DayRegions, Language, Theme } from '@/types'

import { loadScenario } from '../fixtures/mapScenarios'
import { writeCurrentSvg } from '../utils/writeCurrentSvg'
import { buildCtx, renderMapSvg } from './mapSnapshotHelpers'

const MATRIX_SCENARIO_IDS = [1, 5] as const
const MATRIX_LANGUAGES: readonly Language[] = ['fi', 'sv', 'en']
const MATRIX_THEMES: readonly Theme[] = [
  'light-theme',
  'dark-theme',
  'light-gray-theme',
  'dark-gray-theme',
]

describe('Map SVG — language × theme matrix (day 0 only)', () => {
  let activeWrapper: VueWrapper | null = null

  afterEach(() => {
    if (activeWrapper) {
      activeWrapper.unmount()
      activeWrapper = null
    }
  })

  for (const id of MATRIX_SCENARIO_IDS) {
    describe(`scenario ${id}`, () => {
      const scenario = loadScenario(id)
      const processed = processWarnings(
        scenario.data,
        buildCtx(scenario.currentTime, 'fi')
      )
      const visibleWarnings = processed.legend.map((l) => l.type)

      for (const language of MATRIX_LANGUAGES) {
        for (const theme of MATRIX_THEMES) {
          it(`${language} / ${theme}`, async () => {
            const dayRegions = processed.regions[0]
            expect(dayRegions).toBeDefined()
            const { svg, wrapper } = await renderMapSvg({
              dayRegions: dayRegions as DayRegions,
              warnings: processed.warnings,
              visibleWarnings,
              day: 0,
              theme,
              language,
            })
            activeWrapper = wrapper
            const fullName = expect.getState().currentTestName ?? ''
            writeCurrentSvg(fullName, svg)
            expect(svg).toMatchSnapshot()
          })
        }
      }
    })
  }
})

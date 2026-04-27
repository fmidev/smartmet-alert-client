/**
 * Vitest reporter that produces tests/__artifacts__/review.html after
 * every run so reviewers can visually compare the accepted baseline
 * snapshot against the current run's output.
 *
 * The reporter is intentionally conservative:
 *   - It never modifies test outcomes.
 *   - It only reads committed snapshots (.snap files) and the SVGs that
 *     the tests themselves wrote into tests/__artifacts__/current/.
 *   - It uses error.expected / error.actual from snapshot mismatches to
 *     record which keys failed, without parsing Vitest internals.
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs'
import { basename, extname, resolve } from 'node:path'

import type { Reporter } from 'vitest/reporters'
import type { TestCase } from 'vitest/node'

import {
  buildReviewHtml,
  type ReviewEntryInput,
} from '../utils/reviewHtmlTemplate'
import { parseSnapFile } from '../utils/snapshotParser'
import { sanitizeKey } from '../utils/artifactPaths'

// Resolve repo-relative paths via process.cwd(). Vitest, `npm test` and
// the vite-node review script all run from the repository root, so this
// is the simplest way to support both Node (reporter) and jsdom (test
// files) without import.meta.url quirks.
const REPO_ROOT = process.cwd()
const TESTS_ROOT = resolve(REPO_ROOT, 'tests')
const ARTIFACTS_DIR = resolve(TESTS_ROOT, '__artifacts__')
const CURRENT_DIR = resolve(ARTIFACTS_DIR, 'current')
const REVIEW_HTML = resolve(ARTIFACTS_DIR, 'review.html')

// The reporter knows about these snapshot files. The map-snapshots specs
// are the source of truth for baseline SVGs; listing them explicitly keeps
// the reporter fast and unambiguous.
const TRACKED_SNAP_FILES = [
  resolve(
    TESTS_ROOT,
    'integration',
    '__snapshots__',
    'map-snapshots.spec.ts.snap'
  ),
  resolve(
    TESTS_ROOT,
    'integration',
    '__snapshots__',
    'map-snapshots.matrix.spec.ts.snap'
  ),
]

export default class SnapshotReviewReporter implements Reporter {
  /** fsKey -> full test name, for tests that actually failed */
  private failedDisplayByFsKey = new Map<string, string>()

  onTestCaseResult(testCase: TestCase): void {
    const result = testCase.result()
    if (result.state !== 'failed') return
    for (const err of result.errors ?? []) {
      if (typeof err.expected === 'string' && typeof err.actual === 'string') {
        const displayKey = testCase.fullName
        this.failedDisplayByFsKey.set(sanitizeKey(displayKey), displayKey)
      }
    }
  }

  onTestRunEnd(): void {
    this.emitReview()
  }

  /**
   * Fallback for runners that still call the deprecated onFinished hook.
   * Safe because `emitReview` is idempotent (it always rebuilds from disk).
   */
  onFinished(): void {
    this.emitReview()
  }

  private emitReview(): void {
    try {
      const baselineByDisplayKey = loadBaselineFromSnaps()
      const currentByFsKey = loadCurrentFromDisk()

      // Build entries keyed by fsKey so baseline and current can be matched
      // regardless of which side is present.
      const entriesByFsKey = new Map<string, ReviewEntryInput>()

      for (const [displayKey, svg] of baselineByDisplayKey) {
        const fsKey = sanitizeKey(displayKey)
        const existing = entriesByFsKey.get(fsKey)
        entriesByFsKey.set(fsKey, {
          fsKey,
          displayKey,
          baseline: svg,
          current: existing?.current ?? null,
          failed: this.failedDisplayByFsKey.has(fsKey),
        })
      }

      for (const [fsKey, svg] of currentByFsKey) {
        const existing = entriesByFsKey.get(fsKey)
        entriesByFsKey.set(fsKey, {
          fsKey,
          displayKey:
            existing?.displayKey ??
            this.failedDisplayByFsKey.get(fsKey) ??
            fsKey,
          baseline: existing?.baseline ?? null,
          current: svg,
          failed: this.failedDisplayByFsKey.has(fsKey),
        })
      }

      mkdirSync(ARTIFACTS_DIR, { recursive: true })
      const html = buildReviewHtml({
        entries: Array.from(entriesByFsKey.values()),
        generatedAt: new Date(),
      })
      writeFileSync(REVIEW_HTML, html, 'utf8')

      const failed = this.failedDisplayByFsKey.size
      const summary =
        failed > 0
          ? `${failed} failed snapshot assertion${failed === 1 ? '' : 's'}`
          : 'all snapshots matched'
      process.stderr.write(
        `\n[snapshot-review] ${summary}; open file://${REVIEW_HTML}\n`
      )
    } catch (err) {
      process.stderr.write(
        `[snapshot-review] failed to build review.html: ${(err as Error).message}\n`
      )
    }
  }
}

function loadBaselineFromSnaps(): Map<string, string> {
  const combined = new Map<string, string>()
  for (const file of TRACKED_SNAP_FILES) {
    if (!existsSync(file)) continue
    const entries = parseSnapFile(file)
    for (const [rawKey, svg] of entries) {
      combined.set(stripSnapIndex(rawKey), svg)
    }
  }
  return combined
}

function loadCurrentFromDisk(): Map<string, string> {
  const map = new Map<string, string>()
  if (!existsSync(CURRENT_DIR)) return map
  for (const entry of readdirSync(CURRENT_DIR)) {
    if (extname(entry) !== '.svg') continue
    const file = resolve(CURRENT_DIR, entry)
    map.set(basename(entry, '.svg'), readFileSync(file, 'utf8'))
  }
  return map
}

/**
 * toMatchSnapshot appends " N" to the test's full name (1 for the first
 * snapshot in a test, 2 for the second, etc). Strip that so the snap key
 * matches the test's fullName.
 */
function stripSnapIndex(rawKey: string): string {
  return rawKey.replace(/\s+\d+$/, '')
}

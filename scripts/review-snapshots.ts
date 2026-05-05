/**
 * Standalone generator for tests/__artifacts__/review.html.
 *
 * Reads the committed baseline from the map-snapshots `.snap` file and
 * whatever the most recent test run left in tests/__artifacts__/current/,
 * then writes a self-contained HTML review page.
 *
 * Intended for cases where you want to rebuild the review without
 * running the full test suite — for example, to browse the baseline
 * gallery. The same HTML is written automatically by the Vitest
 * snapshot review reporter on every `npm run test:run`.
 *
 * Run with: `npx vite-node scripts/review-snapshots.ts`
 * or via:   `npm run snapshots:review`
 */

import {
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  writeFileSync,
} from 'node:fs'
import { basename, extname, resolve } from 'node:path'

import {
  buildReviewHtml,
  type ReviewEntryInput,
} from '../tests/utils/reviewHtmlTemplate'
import { parseSnapFile } from '../tests/utils/snapshotParser'
import { sanitizeKey } from '../tests/utils/artifactPaths'

// Run from the repository root (e.g. via `npm run snapshots:review`).
const REPO_ROOT = process.cwd()
const TESTS_ROOT = resolve(REPO_ROOT, 'tests')
const ARTIFACTS_DIR = resolve(TESTS_ROOT, '__artifacts__')
const CURRENT_DIR = resolve(ARTIFACTS_DIR, 'current')
const REVIEW_HTML = resolve(ARTIFACTS_DIR, 'review.html')

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

function stripSnapIndex(rawKey: string): string {
  return rawKey.replace(/\s+\d+$/, '')
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

const baselineByDisplay = loadBaselineFromSnaps()
const currentByFsKey = loadCurrentFromDisk()
const entriesByFsKey = new Map<string, ReviewEntryInput>()

for (const [displayKey, svg] of baselineByDisplay) {
  const fsKey = sanitizeKey(displayKey)
  const existing = entriesByFsKey.get(fsKey)
  entriesByFsKey.set(fsKey, {
    fsKey,
    displayKey,
    baseline: svg,
    current: existing?.current ?? null,
    failed: false,
  })
}

for (const [fsKey, svg] of currentByFsKey) {
  const existing = entriesByFsKey.get(fsKey)
  entriesByFsKey.set(fsKey, {
    fsKey,
    displayKey: existing?.displayKey ?? fsKey,
    baseline: existing?.baseline ?? null,
    current: svg,
    failed: false,
  })
}

mkdirSync(ARTIFACTS_DIR, { recursive: true })
const html = buildReviewHtml({
  entries: Array.from(entriesByFsKey.values()),
  generatedAt: new Date(),
})
writeFileSync(REVIEW_HTML, html, 'utf8')

const total = entriesByFsKey.size
const baselineCount = baselineByDisplay.size
const currentCount = currentByFsKey.size
process.stdout.write(
  `Wrote ${REVIEW_HTML}\n` +
    `  ${total} keys total (${baselineCount} baseline, ${currentCount} current)\n`
)

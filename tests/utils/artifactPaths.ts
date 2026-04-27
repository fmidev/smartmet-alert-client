/**
 * Shared constants for snapshot review artifact locations.
 *
 * All artifact files are gitignored and rewritten on every run.
 * Baseline SVGs live inside the .snap files under
 * tests/integration/__snapshots__/; these directories only hold the
 * _current_ run's output so that a reviewer can render old vs new.
 *
 * Paths are resolved relative to the working directory. This is safe
 * because every entry point that consumes these paths — Vitest test
 * files, the custom reporter and the vite-node review script — is
 * launched from the repository root by the npm scripts defined in
 * package.json. Using process.cwd() sidesteps the fact that
 * import.meta.url is not a file:// URL under jsdom.
 */

import { resolve } from 'node:path'

const REPO_ROOT = process.cwd()

/** tests/__artifacts__/ */
export const ARTIFACTS_ROOT = resolve(REPO_ROOT, 'tests', '__artifacts__')

/** tests/__artifacts__/current/ — SVG from the latest test run */
export const CURRENT_DIR = resolve(ARTIFACTS_ROOT, 'current')

/** tests/__artifacts__/review.html — generated side-by-side report */
export const REVIEW_HTML = resolve(ARTIFACTS_ROOT, 'review.html')

/**
 * tests/integration/__snapshots__/ — where Vitest writes committed
 * baselines. Used by the reporter and the standalone review script to
 * extract baseline SVGs.
 */
export const SNAPSHOTS_DIR = resolve(
  REPO_ROOT,
  'tests',
  'integration',
  '__snapshots__'
)

/** File-system-safe form of a test title (spec description > test name). */
export function sanitizeKey(key: string): string {
  return key
    .replace(/[^a-zA-Z0-9_-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_')
}

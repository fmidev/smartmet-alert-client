/**
 * Writes the latest rendered SVG for a given snapshot key into
 * tests/__artifacts__/current/<key>.svg. Called from the map-snapshots
 * spec alongside toMatchSnapshot. The file is read back by the snapshot
 * review reporter (and the standalone review script) when building
 * review.html.
 */

import { mkdirSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { CURRENT_DIR, sanitizeKey } from './artifactPaths'

let prepared = false

function prepareDir(): void {
  if (!prepared) {
    mkdirSync(CURRENT_DIR, { recursive: true })
    prepared = true
  }
}

export function writeCurrentSvg(key: string, svg: string): void {
  prepareDir()
  const path = resolve(CURRENT_DIR, `${sanitizeKey(key)}.svg`)
  writeFileSync(path, svg, 'utf8')
}

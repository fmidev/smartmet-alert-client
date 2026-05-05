/**
 * Minimal parser for Vitest `.snap` files.
 *
 * A .snap file is a JavaScript module that assigns template-literal
 * strings to numbered keys, for example:
 *
 *   exports[`scenario 1 — day 0 1`] = `"<svg …></svg>"`;
 *
 * We only need to extract { key -> string } pairs. The values produced
 * by `toMatchSnapshot(string)` are themselves JSON-stringified, i.e.
 * the stored template literal contains a double-quoted JSON string.
 * parseSnapFile returns the underlying string (JSON-decoded) per key.
 */

import { existsSync, readFileSync } from 'node:fs'

/**
 * Parses a Vitest .snap file and returns a map of snapshot keys to
 * their decoded string values. Non-string snapshots are returned as raw
 * template-literal bodies (we only use string snapshots in this project,
 * but the fallback keeps the parser forgiving).
 */
export function parseSnapFile(path: string): Map<string, string> {
  const map = new Map<string, string>()
  if (!existsSync(path)) return map

  const source = readFileSync(path, 'utf8')

  // Match:  exports[`<key>`] = `<body>`;
  // Key may contain backticks only if escaped (\`); body likewise.
  // Snapshots end with `;` on its own line, which is our terminator.
  const pattern = /exports\[`((?:\\[\s\S]|[^\\`])*)`\]\s*=\s*`((?:\\[\s\S]|[^\\`])*)`;/g

  let match: RegExpExecArray | null
  while ((match = pattern.exec(source)) != null) {
    const rawKey = match[1] ?? ''
    const rawBody = match[2] ?? ''
    const key = unescapeTemplate(rawKey)
    const body = unescapeTemplate(rawBody)
    map.set(key, decodeSnapshotBody(body))
  }
  return map
}

function unescapeTemplate(s: string): string {
  return s
    .replace(/\\`/g, '`')
    .replace(/\\\$/g, '$')
    .replace(/\\\\/g, '\\')
}

/**
 * Vitest's pretty-format serializer wraps plain-string snapshots in
 * double quotes but, unlike JSON, does not escape the inner characters
 * (so `id="finland-large"` remains literally `id="finland-large"`).
 * Template-literal syntax on the outside takes care of backticks and
 * `${}` sequences, but the contents of the quoted string are otherwise
 * byte-for-byte identical to the value passed to toMatchSnapshot.
 *
 * We therefore strip the outer double quotes without any unescape step.
 * Non-string snapshots (objects / arrays) are returned as raw pretty-JS
 * and never consumed by the review HTML pipeline.
 */
function decodeSnapshotBody(body: string): string {
  const trimmed = body.trim()
  if (trimmed.length >= 2 && trimmed.startsWith('"') && trimmed.endsWith('"')) {
    return trimmed.slice(1, -1)
  }
  return trimmed
}

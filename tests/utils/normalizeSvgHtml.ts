/**
 * Normalize HTML produced by @vue/test-utils so the snapshot is stable
 * across environments and across unrelated Vue internal changes.
 *
 * - Removes Vue scoped-CSS attribute hashes (e.g. data-v-bd8e0e21="")
 *   which change whenever a scoped <style> block is edited anywhere.
 * - Collapses whitespace between adjacent tags so different pretty-print
 *   heuristics (jsdom vs happy-dom vs future Vue versions) produce the
 *   same string.
 *
 * Note on determinism: the map SVG content itself comes from
 * src/data/geometries.json, hardcoded icon strings in useConfig.ts, and
 * toFixed(2) in src/mixins/geojsonsvg.js — none of which depend on the
 * host OS, browser, or rendering library. Anti-aliasing cannot affect a
 * textual SVG.
 */
export function normalizeSvgHtml(html: string): string {
  return html
    .replace(/\s+data-v-[0-9a-f]+=""/g, '')
    .replace(/>\s+</g, '><')
    .trim()
}

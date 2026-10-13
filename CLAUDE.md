# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`@fmidev/smartmet-alert-client` is a Vue 3 + TypeScript map visualizer for weather/flood alerts (Finnish Meteorological Institute). It is published in two forms from the same source: a `<smartmet-alert-client>` web component (no shadow DOM) and a plain Vue component library.

## Commands

- `npm run dev` — Vite dev server (`npm run serve` previews a build)
- `npm run build` — `vue-tsc --noEmit`, then web component build (`dist/`), then Vue library build (`dist/vue/`)
- `npm run build:ce` / `npm run build:vue` — build only one of the two targets (`BUILD_MODE=vue` switches Vite config)
- `npm run lint` / `lint:fix` — ESLint over `src` (`.js,.ts,.vue`); Prettier is enforced via ESLint (no semicolons, single quotes)
- `npm run typecheck` — `vue-tsc --noEmit`
- `npm run validate` — lint + typecheck + tests; this is the husky pre-commit hook
- `npm run test:run` — run Vitest once; `npm test` is watch mode
- Single test: `npx vitest run tests/unit/components/Warning.spec.ts` or `npx vitest run -t "test name"`
- `npm run snapshots:review` — regenerates the visual review of map SVG snapshots (also written by a custom Vitest reporter to `tests/__artifacts__/review.html` after each run)

`.env.sample` lists `VITE_*` variables (language, local test-data directory/dates) used by the dev app.

## Architecture

**Two entry points, one core.** `src/main.ts` registers `App.vue` as a custom element via `vue-web-component-wrapper`; `src/vue.ts` exports `AlertClientVue.vue` for Vue/Nuxt consumers. Both wrappers are thin: they declare props (string-typed for the web component, so values like `"false"`/`"900000"` arrive as strings) and delegate to `composables/useAlertClient.ts` (state, WFS query building, fetching, `toBool`/`toNum` normalizers). When adding a prop, update both wrappers and the prop doc in `src/vue.ts`.

**Component tree.** `components/AlertClient.vue` is the main view and composes the day selector (`Days`/`DaySmall`/`DayLarge`), maps (`MapLarge`/`MapSmall`), `Warnings`, `Regions`, and `Legend`. Layout switches between large and small variants.

**Composables replace the old mixins** (`src/mixins/` holds only the legacy `geojsonsvg` SVG path generator):
- `useConfig` — constants: warning types, colors, region IDs, coverage criteria, geometry data access
- `useWarningsProcessor` — the heaviest logic: parses the WFS/XML response (`@xmldom/xmldom` + `xpath`) into per-day, per-region warnings
- `useMapPaths` — turns region geometries (`src/data/geometries.json`, keyed by `geometryId` then region) into SVG paths, using `flatbush` for spatial lookups
- `useUtils`, `useI18n` (locales in `src/locales/{fi,sv,en}.json`), `useFields`, `useKeyCodes`

**Styling.** SCSS in `src/scss` with themes (`light`, `dark`, `light-gray`, `dark-gray`). The web component build prefixes CSS (`postcss-prefixwrap`) so it doesn't leak into host pages.

**Data helpers.** `scripts/` converts CAP/other formats to WFS-style fixtures (`capToWfs.ts`, `sykeToWfs.ts`, `build-cap-scenarios.ts`) used to build test scenarios in `tests/fixtures/`.

## Testing notes

Vitest + jsdom with `@/` aliased to `src/`. `tests/unit` covers components and composables; `tests/integration` includes map SVG snapshot tests (normalized by `tests/utils/normalizeSvgHtml.ts`) — when map output intentionally changes, update snapshots and review them with the review report. `tests/README.md` is partly outdated (references `.js` mixin tests that are now `.ts` composables).

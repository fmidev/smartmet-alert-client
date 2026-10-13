# SmartMet Alert Client - Tests

Unit and integration tests for the SmartMet Alert Client. All test code is TypeScript.

## Test Environment

- **Vitest** (config in `vitest.config.js`, `@/` is aliased to `src/`)
- **@vue/test-utils** and **@testing-library/vue** for component tests
- **jsdom** environment; `tests/setup.ts` sets `VITE_LANGUAGE=fi`, stubs `GrayScaleToggle` and `CollapsiblePanel`, and mocks `getComputedStyle` and `IntersectionObserver`
- Timezone-dependent tests assume Europe/Helsinki

## Running Tests

```bash
# Watch mode
npm test

# Run once (CI)
npm run test:run

# Single file / single test
npx vitest run tests/unit/components/Warning.spec.ts
npx vitest run -t "test name"

# Vitest UI
npm run test:ui

# Coverage report
npm run test:coverage

# Full check used by the pre-commit hook (lint + typecheck + tests)
npm run validate
```

## Test Structure

```
tests/
├── unit/
│   ├── composables/            # Tests for src/composables
│   │   ├── useConfig.spec.ts
│   │   ├── useI18n.spec.ts
│   │   ├── useKeyCodes.spec.ts
│   │   ├── useUtils.spec.ts
│   │   ├── useMapPaths.snapshot.spec.ts
│   │   └── useWarningsProcessor.snapshot.spec.ts
│   └── components/             # One spec per component in src/components
│       │                       # (AlertClient, Days, DaySmall, DayLarge, Legend,
│       │                       #  GrayScaleToggle, Warnings, Warning, Regions,
│       │                       #  Region, MapLarge, MapSmall, RegionWarning,
│       │                       #  DescriptionWarning, PopupRow)
│       ├── RegionWarning.snapshot.spec.ts
│       └── Warning.snapshot.spec.ts
├── integration/
│   ├── warning-flow.spec.ts               # Warning data processing end to end
│   ├── map-snapshots.spec.ts              # Map SVG snapshots
│   ├── map-snapshots.matrix.spec.ts       # Map SVG snapshots across scenario matrix
│   ├── mapSnapshotHelpers.ts
│   └── __snapshots__/
├── fixtures/
│   ├── mockWarningData.ts      # Hand-written sample warnings
│   ├── mapScenarios.ts         # Loader for scenarios/scenario-N.json
│   └── scenarios/              # Generated scenario data (see scripts/)
├── reporters/
│   └── snapshotReviewReporter.ts   # Writes tests/__artifacts__/review.html after each run
├── utils/                      # Snapshot normalization, summarizing and review helpers
├── setup.ts
└── README.md
```

## What Is Covered

### Composables (`unit/composables`)

- `useUtils` - string/time helpers, warning creation (weather and flood), validation, day creation, severity and legend calculation
- `useI18n` - translation lookup in fi/sv/en, HTML sanitization, handling of unknown keys
- `useConfig` - configuration constants, warning types, region IDs, geometry structure, colors, warning icons
- `useKeyCodes` - key code definitions
- `useMapPaths` and `useWarningsProcessor` - snapshot tests of generated map paths and processed warnings

### Components (`unit/components`)

Each component in `src/components` has its own spec covering mounting, props, computed properties, emitted events, theme classes and accessibility attributes. `Warning` and `RegionWarning` additionally have snapshot specs.

### Integration (`integration`)

- `warning-flow.spec.ts` - complete warning processing: weather and flood parsing, legend ordering, regions and hierarchy, coverage, multi-language, HTML decoding, time intervals, per-day severity
- `map-snapshots*.spec.ts` - rendered map SVG compared against stored snapshots for the scenarios in `fixtures/scenarios`

## Fixtures

### mockWarningData.ts

Sample data exported for tests: `mockWeatherUpdateTime`, `mockFloodUpdateTime`, `mockWeatherWarning`, `mockThunderStormWarning`, `mockSeaWindWarning`, `mockFloodWarning`, `mockCoverageWarning`, `mockWeatherWarnings`, `mockFloodWarnings` and `mockWarningsData` (complete dataset).

### Map scenarios

`fixtures/scenarios/scenario-N.json` files are loaded with `loadScenario`, `listScenarioIds` and `allScenarios` from `mapScenarios.ts`. A scenario's source is `wfs`, `cap` or `syke`; the non-WFS ones are produced with the converters in `scripts/` (`capToWfs.ts`, `sykeToWfs.ts`, `build-cap-scenarios.ts`).

## Snapshot Review

When map output changes intentionally, update the snapshots (`npx vitest run -u`) and review the visual differences in `tests/__artifacts__/review.html`, which the custom reporter writes after every run. `npm run snapshots:review` regenerates the review from existing snapshots.

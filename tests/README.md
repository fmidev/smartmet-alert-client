# SmartMet Alert Client - Tests

This directory contains unit and integration tests for the SmartMet Alert Client project.

## Test Environment

- **Vitest**: Modern, fast testing framework for Vue 3
- **@vue/test-utils**: Official Vue component testing library
- **@testing-library/vue**: User-centric testing library
- **jsdom**: DOM simulation in Node.js environment

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm test

# Run tests once (CI/CD)
npm run test:run

# Run tests in UI
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Test Structure

```
tests/
├── unit/                        # Unit tests
│   ├── mixins/                 # Mixin tests
│   │   ├── config.spec.js      # ✅ 30 tests
│   │   ├── utils.spec.js       # ✅ 59 tests
│   │   ├── i18n.spec.js        # ✅ 9 tests
│   │   └── keycodes.spec.js    # ✅ 5 tests
│   └── components/             # Component tests
│       ├── AlertClient.spec.js # ✅ 28 tests
│       ├── Days.spec.js        # ✅ 21 tests
│       ├── DaySmall.spec.js    # ✅ 14 tests
│       ├── DayLarge.spec.js    # ✅ 16 tests
│       ├── Legend.spec.js      # ✅ 14 tests
│       ├── GrayScaleToggle.spec.js # ✅ 22 tests
│       ├── Warnings.spec.js    # ✅ 19 tests
│       ├── Warning.spec.js     # ✅ 28 tests
│       ├── MapLarge.spec.js    # ✅ 14 tests
│       ├── MapSmall.spec.js    # ✅ 12 tests
│       ├── Regions.spec.js     # ✅ 15 tests
│       ├── Region.spec.js      # ✅ 20 tests
│       ├── DescriptionWarning.spec.js # ✅ 29 tests
│       ├── PopupRow.spec.js    # ✅ 20 tests
│       └── RegionWarning.spec.js # ✅ 27 tests
├── integration/                # Integration tests
│   └── warning-flow.spec.js    # ✅ 17 tests
├── fixtures/                   # Test data
│   └── mockWarningData.js      # ✅ Implemented
├── setup.js                    # ✅ Test environment configuration
└── README.md                   # This file
```

## Implemented Tests (419 tests) ✅

### Mixins

#### utils.js (59 tests) ✅

**Tested functionality:**

- `uncapitalize()` - String manipulation
- `warningType()` - Warning type parsing
- `regionFromReference()` - Region ID parsing
- `relativeCoverageFromReference()` - Coverage percentage parsing
- `twoDigits()` - Number formatting
- `text()` - Text extraction from warnings
- `toTimeZone()` - Timezone conversion
- `msSinceStartOfDay()` - Milliseconds since start of day
- `validInterval()` - Time interval formatting
- `effectiveDays()` - Effective days calculation
- `createWeatherWarning()` - Weather warning creation
- `createFloodWarning()` - Flood warning creation
- `isValid()` - Warning validation
- `createDays()` - Days creation
- `getMaxSeverities()` - Maximum severity calculation
- `createLegend()` - Legend creation
- Test coverage: ~85%

#### i18n.js (9 tests) ✅

**Tested functionality:**

- `t()` - Translation retrieval
- Multi-language support (fi, sv, en)
- HTML sanitization
- Error handling (null, undefined, unknown keys)
- Test coverage: ~90%

#### config.js (30 tests) ✅

**Tested functionality:**

- Configuration constants (timezone, locales, limits)
- `warningTypes` Map (land/sea regions)
- `regionIds` array
- Geometry data structure
- Color definitions (light/dark, gray themes)
- `warningIcon()` - Warning icon generation
- Test coverage: ~90%

#### keycodes.js (5 tests) ✅

**Tested functionality:**

- Key code definitions (Arrow keys, Home, End)
- Test coverage: 100%

### Components

#### AlertClient.vue (28 tests) ✅

**Tested functionality:**

- Component mounting and initialization
- Props validation
- Timer functionality (initTimer, cancelTimer, update)
- Event emissions (loaded, themeChanged, update-warnings)
- Data processing
- Day selection
- Warnings toggle
- Error handling
- Computed properties
- Visibility change handling
- Test coverage: ~70%

#### Days.vue (21 tests) ✅

**Tested functionality:**

- Component mounting
- Props validation (selectedDay, staticDays, timeOffset)
- Day selection and event emissions
- Keyboard navigation (Arrow keys, Home, End)
- Boundary handling (0-4 days)
- Theme support
- Test coverage: ~80%

#### DaySmall.vue (14 tests) ✅

**Tested functionality:**

- Computed properties (weekday, severity, date)
- Static vs. dynamic date display
- Time ranges (0...24h, 24...48h, etc.)
- Aria-label generation
- Theme and severity classes
- Content rendering
- Test coverage: ~75%

#### DayLarge.vue (16 tests) ✅

**Tested functionality:**

- Computed properties (warningsTitle, updatedTitle, atTime)
- Date formatting (static/dynamic)
- Event handling (loaded)
- Props validation
- Content rendering
- Test coverage: ~70%

#### Legend.vue (14 tests) ✅

**Tested functionality:**

- Component mounting
- Computed properties (warnings, texts)
- Toggle functionality
- Event emissions (warningsToggled, themeChanged, showAllWarnings)
- Props validation (grayScaleSelector, theme)
- Window resize handling
- Test coverage: ~75%

#### GrayScaleToggle.vue (22 tests) ✅

**Tested functionality:**

- Conditional rendering (grayScaleSelector)
- Theme detection (gray/normal)
- Toggle functionality
- Event emissions (themeChanged)
- CSS classes (selected/unselected)
- Accessibility (ARIA attributes)
- Test coverage: ~85%

#### Warnings.vue (19 tests) ✅

**Tested functionality:**

- Component mounting (empty/full warnings)
- Computed properties (warnings, hiddenWarnings, noWarnings)
- Event handling (warningsToggled, showAllWarnings)
- Theme support for all 4 themes
- Warning components rendering
- Test coverage: ~75%

#### Warning.vue (28 tests) ✅

**Tested functionality:**

- Computed properties (id, title, warningLevelText, toggleText)
- Fields mixin (typeClass, rotation, invertedRotation, severity)
- Toggle functionality (on/off)
- CSS classes (severity, type, flag-selected/unselected)
- Accessibility (ARIA attributes)
- Severity level validation (2-4)
- Test coverage: ~80%

#### Regions.vue (15 tests) ✅

**Tested functionality:**

- Component mounting (with stubbed Region component)
- Computed properties (landText, seaText, regions filtering)
- Warning detection (anyLandWarnings, anySeaWarnings)
- Navigation href calculation
- Conditional header rendering
- Navigation methods
- Test coverage: ~70%

#### Region.vue (20 tests) ✅

**Tested functionality:**

- Component mounting and initialization (open: false)
- Computed properties (identifier, regionName, warningsSummary, reducedWarnings)
- Coverage filtering (>= 20%)
- Toggle functionality (accordion)
- ARIA attributes (aria-expanded, aria-controls, aria-labelledby)
- Panel visibility (hidden attribute)
- RegionWarning component rendering
- Test coverage: ~75%

#### MapLarge.vue (14 tests) ✅

**Tested functionality:**

- SVG rendering and viewBox (0 0 440 550)
- Loading state and spinner
- Computed properties (size: Large, strokeWidth, strokeOpacity, mapText)
- Theme support
- Accessibility (ARIA attributes, focus, role)
- Test coverage: ~60%

#### MapSmall.vue (12 tests) ✅

**Tested functionality:**

- SVG rendering and dimensions (75x120)
- Computed properties (size: Small, strokeWidth: 0.6, pathsNeeded)
- Unique ID per day index
- CSS classes (finland-small, map-small)
- Test coverage: ~60%

### Integration Tests

#### warning-flow.spec.js (17 tests) ✅

**Tested functionality:**

- Complete warning data processing
- Weather and flood warning parsing
- Legend creation and ordering
- Region creation with warnings
- Parent-child hierarchy
- Coverage handling
- Multi-language support
- HTML decoding
- Time interval calculations
- Severity calculation per day
- Test coverage: ~80%

#### DescriptionWarning.vue (29 tests) ✅

**Tested functionality:**

- Computed properties (warningTitle, warningLevel, warningDetails, info, validText)
- Fields mixin integration (typeClass, rotation, invertedRotation, severity)
- Multi-language info display (fi, sv, en)
- External link rendering and hiding
- Content rendering (title, interval, description, link)
- CSS classes (severity, type, rotation, theme)
- Accessibility (aria-label, aria-hidden, target="\_blank")
- Test coverage: ~80%

#### PopupRow.vue (20 tests) ✅

**Tested functionality:**

- Component mounting with default props
- Fields mixin integration (typeClass, rotation, invertedRotation, severity)
- Content rendering (interval, symbol text)
- CSS classes (severity, type, rotation, text-level)
- Table structure (row, cells)
- Level-0 warning hiding
- Test coverage: ~85%

#### RegionWarning.vue (27 tests) ✅

**Tested functionality:**

- Computed properties (warningLevel, warningTypeText, warningDetails)
- Fields mixin integration (typeClass, rotation, severity)
- Direction and text handling (null safety)
- Different warning types (wind, seaWind, rain, thunderStorm)
- CSS classes (all required classes, rotation)
- Accessibility (aria-label with details, aria-hidden)
- Test coverage: ~85%

## Overall Summary

- **Test files**: 20
- **Total tests**: 419
- **Passed**: 419 (100%)
- **Failed**: 0
- **Overall coverage**: ~70-80%
- **Critical parts coverage**: 85-90%

### Tested Files Breakdown:

**Mixins (4/4):**

- ✅ utils.js - 59 tests
- ✅ config.js - 30 tests
- ✅ i18n.js - 9 tests
- ✅ keycodes.js - 5 tests

**Components (15/15):**

- ✅ AlertClient.vue - 28 tests
- ✅ Days.vue - 21 tests
- ✅ DaySmall.vue - 14 tests
- ✅ DayLarge.vue - 16 tests
- ✅ Legend.vue - 14 tests
- ✅ GrayScaleToggle.vue - 22 tests
- ✅ Warnings.vue - 19 tests
- ✅ Warning.vue - 28 tests
- ✅ Regions.vue - 15 tests
- ✅ Region.vue - 20 tests
- ✅ MapLarge.vue - 14 tests
- ✅ MapSmall.vue - 12 tests
- ✅ RegionWarning.vue - 27 tests
- ✅ DescriptionWarning.vue - 29 tests
- ✅ PopupRow.vue - 20 tests

**Integration Tests (1/1):**

- ✅ warning-flow.spec.js - 17 tests

## Mock Data Structure

### mockWarningData.js

Contains sample data for testing:

- `mockWeatherUpdateTime` - Weather warnings update time
- `mockFloodUpdateTime` - Flood warnings update time
- `mockWeatherWarning` - Wind warning
- `mockThunderStormWarning` - Thunderstorm warning
- `mockSeaWindWarning` - Sea wind warning
- `mockFloodWarning` - Flood warning
- `mockCoverageWarning` - Coverage warning
- `mockWarningsData` - Complete warning dataset

## Testing Strategies

### Unit Tests

- Test individual functions and methods separately
- Mock dependencies
- Focus on logic and calculations

### Component Tests

- Test component behavior
- Test props, events, slots
- Test computed properties and watchers
- Mock external dependencies (API calls, DOM)

### Integration Tests

- Test component interactions
- Test data flows through the application
- Test user scenarios

## Important Notes

- Tests use jsdom environment for DOM simulation
- Timezone tests assume Europe/Helsinki timezone
- GeoJSON and SVG tests require geometry data mocking
- Fetch calls are mocked

## Writing a Test

Example of a simple test:

```javascript
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import MyComponent from '@/components/MyComponent.vue'

describe('MyComponent', () => {
  it('should render correctly', () => {
    const wrapper = mount(MyComponent, {
      props: {
        title: 'Test Title',
      },
    })

    expect(wrapper.text()).toContain('Test Title')
  })
})
```

## Further Information

- [Vitest Documentation](https://vitest.dev/)
- [Vue Test Utils Documentation](https://test-utils.vuejs.org/)
- [Testing Library Documentation](https://testing-library.com/docs/vue-testing-library/intro/)

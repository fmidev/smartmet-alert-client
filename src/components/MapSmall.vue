<template>
  <div :id="`day-map-small-${index}`" class="map-small">
    <svg
      class="finland-small"
      xmlns="http://www.w3.org/2000/svg"
      version="1.2"
      baseProfile="tiny"
      width="75"
      height="120"
      viewBox="0 0 75 120"
      stroke-linecap="round"
      stroke-linejoin="round">
      <g v-if="pathsNeeded" :id="`finland-small-${index}`">
        <path
          v-for="path in bluePaths"
          :key="path.key"
          :stroke="strokeColor"
          :stroke-width="path.strokeWidth"
          :fill="path.fill"
          :d="path.d"
          :opacity="path.opacity" />
        <path
          v-for="path in seaBorders"
          :key="path.key"
          class="border-path"
          :stroke="strokeColor"
          :stroke-width="path.strokeWidth"
          :stroke-opacity="strokeOpacity"
          :d="path.d"
          fill-opacity="0" />
        <path
          v-for="path in greenPaths"
          :key="path.key"
          :stroke="strokeColor"
          :stroke-width="path.strokeWidth"
          :fill="path.fill"
          :d="path.d"
          :opacity="path.opacity" />
        <path
          v-for="path in yellowPaths"
          :key="path.key"
          :stroke="strokeColor"
          :stroke-width="path.strokeWidth"
          :fill="path.fill"
          :d="path.d"
          :opacity="path.opacity" />
        <path
          v-for="coverage in yellowCoverages"
          :key="coverage.key"
          :stroke="strokeColor"
          :stroke-width="coverage.strokeWidth"
          :fill="coverage.fill"
          :d="coverage.d"
          :fill-opacity="coverage.fillOpacity"
          pointer-events="fill" />
        <path
          v-for="path in orangePaths"
          :key="path.key"
          :stroke="strokeColor"
          :stroke-width="path.strokeWidth"
          :fill="path.fill"
          :d="path.d"
          :opacity="path.opacity" />
        <path
          v-for="coverage in orangeCoverages"
          :key="coverage.key"
          :stroke="strokeColor"
          :stroke-width="coverage.strokeWidth"
          :fill="coverage.fill"
          :d="coverage.d"
          :fill-opacity="coverage.fillOpacity"
          pointer-events="fill" />
        <path
          v-for="path in redPaths"
          :key="path.key"
          :stroke="strokeColor"
          :stroke-width="path.strokeWidth"
          :fill="path.fill"
          :d="path.d"
          :opacity="path.opacity" />
        <path
          v-for="coverage in redCoverages"
          :key="coverage.key"
          :stroke="strokeColor"
          :stroke-width="coverage.strokeWidth"
          :fill="coverage.fill"
          :d="coverage.d"
          :fill-opacity="coverage.fillOpacity"
          pointer-events="fill" />
        <path
          v-for="path in overlayPaths"
          :key="path.key"
          :stroke="strokeColor"
          :stroke-width="path.strokeWidth"
          :stroke-opacity="strokeOpacity"
          :d="path.d"
          fill-opacity="0" />
        <path
          v-for="path in landBorders"
          :key="path.key"
          class="border-path"
          :stroke="strokeColor"
          :stroke-width="1.5 * Number(path.strokeWidth)"
          :stroke-opacity="strokeOpacity"
          :d="path.d"
          fill-opacity="0" />
        <path
          v-for="coverage in overlayCoverages"
          :key="coverage.key"
          :stroke="strokeColor"
          :stroke-width="coverage.strokeWidth"
          :stroke-opacity="strokeOpacity"
          :fill="coverage.fill"
          :d="coverage.d"
          :fill-opacity="coverage.fillOpacity"
          pointer-events="fill" />
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, toRef } from 'vue'
import type { DayRegions, WarningsMap, Theme } from '@/types'
import { useMapPaths } from '@/composables/useMapPaths'

// ============================================================================
// Props
// ============================================================================

const props = withDefaults(
  defineProps<{
    index?: number
    input?: DayRegions
    visibleWarnings?: string[]
    warnings?: WarningsMap | null
    geometryId?: number
    loading?: boolean
    theme?: Theme | string
  }>(),
  {
    index: 0,
    input: () => ({}) as DayRegions,
    visibleWarnings: () => [],
    warnings: null,
    geometryId: 2021,
    loading: true,
    theme: 'light-theme',
  }
)

// ============================================================================
// Local State
// ============================================================================

const windowWidth = ref<number>(
  typeof window !== 'undefined' ? window.innerWidth : 0
)
const pathsNeeded = ref<boolean>(false)
const strokeWidthValue = ref<number>(0.6)
const strokeOpacity = ref<string>('0.5')

// ============================================================================
// Computed refs for composable
// ============================================================================

const size = computed<'Large' | 'Small'>(() => 'Small')
const indexRef = toRef(props, 'index')
const inputRef = toRef(props, 'input')
const warningsRef = toRef(props, 'warnings')
const visibleWarningsRef = toRef(props, 'visibleWarnings')
const geometryIdRef = toRef(props, 'geometryId')
const themeRef = toRef(props, 'theme')
const loadingRef = toRef(props, 'loading')

// ============================================================================
// Composables
// ============================================================================

const {
  strokeColor,
  bluePaths,
  greenPaths,
  yellowPaths,
  orangePaths,
  redPaths,
  overlayPaths,
  landBorders,
  seaBorders,
  yellowCoverages,
  orangeCoverages,
  redCoverages,
  overlayCoverages,
  coverageRegions,
  coverageWarnings,
} = useMapPaths({
  size,
  index: indexRef,
  input: inputRef,
  warnings: warningsRef,
  visibleWarnings: visibleWarningsRef,
  geometryId: geometryIdRef,
  theme: themeRef,
  loading: loadingRef,
  strokeWidth: strokeWidthValue,
})

// ============================================================================
// Methods
// ============================================================================

function updateWidth(): void {
  windowWidth.value = window.innerWidth
}

function isFullMode(): boolean {
  return true
}

// ============================================================================
// Watchers
// ============================================================================

watch(windowWidth, () => {
  pathsNeeded.value = isFullMode()
})

watch(
  () => props.input,
  () => {
    coverageRegions.value = {}
    coverageWarnings.value = []
  }
)

// ============================================================================
// Lifecycle
// ============================================================================

onMounted(() => {
  window.addEventListener('resize', updateWidth)
  pathsNeeded.value = isFullMode()
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
})

// ============================================================================
// Expose for testing
// ============================================================================

defineExpose({
  size,
  strokeWidth: strokeWidthValue,
  pathsNeeded,
})
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';

div.map-small {
  position: relative;
  bottom: -5px !important;
  display: inline-block;
  width: $map-small-width !important;
  height: $map-small-height !important;

  .day-map-small-base-0 {
    width: $map-small-width !important;
    height: $map-small-height !important;

    .ol-viewport {
      width: $map-small-width !important;
      height: $map-small-height !important;
    }
  }

  .day-map-small-base-1 {
    width: $map-small-width !important;
    height: $map-small-height !important;

    .ol-viewport {
      width: $map-small-width !important;
      height: $map-small-height !important;
    }
  }

  .day-map-small-base-2 {
    width: $map-small-width !important;
    height: $map-small-height !important;

    .ol-viewport {
      width: $map-small-width !important;
      height: $map-small-height !important;
    }
  }

  .day-map-small-base-3 {
    width: $map-small-width !important;
    height: $map-small-height !important;

    .ol-viewport {
      width: $map-small-width !important;
      height: $map-small-height !important;
    }
  }

  .day-map-small-base-4 {
    width: $map-small-width !important;
    height: $map-small-height !important;

    .ol-viewport {
      width: $map-small-width !important;
      height: $map-small-height !important;
    }
  }
}

*[id^='day-map-small-base-'] {
  height: 100%;
}

@media (forced-colors: active) {
  path.border-path {
    stroke: $gray;
  }
}

@media (width < 576px) {
  #fmi-day-small-view .map-small,
  #fmi-day-small-view .map-container {
    display: none;
  }
}
</style>

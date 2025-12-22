<template>
  <AlertClient
    v-if="visible"
    :refresh-interval="refreshIntervalNormalized"
    :default-day="selectedDayNormalized"
    :static-days="staticDaysNormalized"
    :start-from="startFrom"
    :region-list-enabled="regionListEnabledNormalized"
    :gray-scale-selector="grayScaleSelectorNormalized"
    :current-time="currentTime"
    :warnings-data="warningsData"
    :daily-warning-types="dailyWarningTypesNormalized"
    :geometry-id="geometryIdNormalized"
    :language="language as Language"
    :theme="themeClass"
    :sleep="sleepNormalized"
    :loading="loading"
    :spinner-enabled="spinnerEnabledNormalized"
    @loaded="onLoaded"
    @theme-changed="onThemeChanged"
    @update-warnings="fetchWarnings" />
</template>
<script setup lang="ts">
/**
 * Web component wrapper for AlertClient.
 * All props are strings (HTML attribute limitation).
 * Use AlertClientVue.vue for native Vue usage with proper types.
 */
import { computed, toRef, onMounted, type Ref } from 'vue'

import AlertClient from './components/AlertClient.vue'
import { useAlertClient, toBool, toNum } from './composables/useAlertClient'
import type { Language, WarningsData } from '@/types'

// Define component name for web component registration
defineOptions({
  name: 'App',
})

// Default geometry ID from config
const DEFAULT_GEOMETRY_ID = '2021'

// Props definition - all strings for web component compatibility
const props = withDefaults(
  defineProps<{
    currentDate?: string
    baseUrl?: string
    selectedDay?: string
    regionListEnabled?: string
    spinnerEnabled?: string
    grayScaleSelector?: string
    staticDays?: string
    startFrom?: string
    weatherUpdated?: string
    floodUpdated?: string
    weatherWarnings?: string
    floodWarnings?: string
    warnings?: string
    dailyWarningTypes?: string
    refreshInterval?: string
    geometryId?: string
    language?: string
    theme?: string
    fontScale?: string
    sleep?: string
    debugMode?: string
  }>(),
  {
    currentDate: '',
    baseUrl: 'https://www.ilmatieteenlaitos.fi/geoserver/alert/ows',
    selectedDay: '0',
    regionListEnabled: 'true',
    spinnerEnabled: 'true',
    grayScaleSelector: 'true',
    staticDays: 'true',
    startFrom: '',
    weatherUpdated: '',
    floodUpdated: '',
    weatherWarnings: '',
    floodWarnings: '',
    warnings: '',
    dailyWarningTypes: '',
    refreshInterval: '900000', // 1000 * 60 * 15
    geometryId: DEFAULT_GEOMETRY_ID,
    language: (import.meta.env.VITE_LANGUAGE as string) || 'fi',
    theme: 'light',
    fontScale: '1',
    sleep: 'true',
    debugMode: 'false',
  }
)

// String-to-type normalizers for web component props
const selectedDayNormalized = computed(() => toNum(props.selectedDay, 0))
const regionListEnabledNormalized = computed(() =>
  toBool(props.regionListEnabled, true)
)
const grayScaleSelectorNormalized = computed(() =>
  toBool(props.grayScaleSelector, true)
)
const staticDaysNormalized = computed(() => toBool(props.staticDays, true))
const dailyWarningTypesNormalized = computed<string[]>(() => {
  if (props.dailyWarningTypes) {
    return props.dailyWarningTypes.split(',').map((item) => item.trim())
  }
  return []
})
const refreshIntervalNormalized = computed(() =>
  toNum(props.refreshInterval, 900000)
)
const geometryIdNormalized = computed(() => toNum(props.geometryId, 2021))
const sleepNormalized = computed(() => toBool(props.sleep, true))
const spinnerEnabledNormalized = computed(() =>
  toBool(props.spinnerEnabled, true)
)
const debugModeNormalized = computed(() => toBool(props.debugMode, false))

// Computed refs for language (needs proper typing for composable)
const languageRef = computed(() => props.language as Language)

// Computed ref for warnings data (parse JSON string if provided)
const warningsRef = computed<WarningsData | string | null>(() => {
  if (!props.warnings) return null
  return props.warnings
})

// Setup composable with refs to props
const {
  loading,
  themeClass,
  warningsData,
  visible,
  currentTime,
  onLoaded,
  onThemeChanged,
  fetchWarnings,
  initializeWarnings,
  applyFontScale,
} = useAlertClient({
  baseUrl: toRef(props, 'baseUrl'),
  language: languageRef as Ref<Language>,
  theme: toRef(props, 'theme'),
  warnings: warningsRef,
  currentDate: toRef(props, 'currentDate'),
  fontScale: toRef(props, 'fontScale'),
  debugMode: debugModeNormalized,
  weatherUpdated: toRef(props, 'weatherUpdated'),
  floodUpdated: toRef(props, 'floodUpdated'),
  weatherWarnings: toRef(props, 'weatherWarnings'),
  floodWarnings: toRef(props, 'floodWarnings'),
})

// Initialize warnings from props (equivalent to created hook)
initializeWarnings()

// Apply font scale on mount
onMounted(() => {
  applyFontScale()
})

// Expose methods for external access (web component API)
defineExpose({
  show: () => {
    visible.value = true
  },
  hide: () => {
    visible.value = false
  },
})
</script>
<style lang="scss">
@import './scss/utilities.scss';
</style>

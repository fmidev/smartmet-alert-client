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
 * Vue wrapper component for AlertClient.
 * Accepts native JavaScript types (Number, Boolean) unlike the web component
 * version which only accepts strings.
 */
import { computed, toRef, onMounted } from 'vue'

import AlertClient from './components/AlertClient.vue'
import { useAlertClient, toBool, toNum } from './composables/useAlertClient'
import type { Language, WarningsDataResponse } from '@/types'

// Default geometry ID from config
const DEFAULT_GEOMETRY_ID = 2021

// Props definition
const props = withDefaults(
  defineProps<{
    currentDate?: string | Date | null
    baseUrl?: string
    selectedDay?: string | number
    regionListEnabled?: string | boolean
    spinnerEnabled?: string | boolean
    grayScaleSelector?: string | boolean
    staticDays?: string | boolean
    startFrom?: string
    weatherUpdated?: string
    floodUpdated?: string
    weatherWarnings?: string
    floodWarnings?: string
    warnings?: string | WarningsDataResponse | null
    dailyWarningTypes?: string | string[]
    refreshInterval?: string | number
    geometryId?: string | number
    language?: Language | string
    theme?: string
    fontScale?: string | number
    sleep?: string | boolean
    debugMode?: string | boolean
  }>(),
  {
    currentDate: null,
    baseUrl: 'https://www.ilmatieteenlaitos.fi/geoserver/alert/ows',
    selectedDay: 0,
    regionListEnabled: true,
    spinnerEnabled: true,
    grayScaleSelector: true,
    staticDays: true,
    startFrom: '',
    weatherUpdated: '',
    floodUpdated: '',
    weatherWarnings: '',
    floodWarnings: '',
    warnings: null,
    dailyWarningTypes: () => [],
    refreshInterval: 900000, // 1000 * 60 * 15
    geometryId: DEFAULT_GEOMETRY_ID,
    language: (import.meta.env.VITE_LANGUAGE as Language) || 'fi',
    theme: 'light',
    fontScale: 1,
    sleep: true,
    debugMode: false,
  }
)

// Type normalizers for mixed-type props
const selectedDayNormalized = computed(() => toNum(props.selectedDay, 0))
const regionListEnabledNormalized = computed(() =>
  toBool(props.regionListEnabled, true)
)
const grayScaleSelectorNormalized = computed(() =>
  toBool(props.grayScaleSelector, true)
)
const staticDaysNormalized = computed(() => toBool(props.staticDays, true))
const dailyWarningTypesNormalized = computed<string[]>(() => {
  if (Array.isArray(props.dailyWarningTypes)) return props.dailyWarningTypes
  if (typeof props.dailyWarningTypes === 'string' && props.dailyWarningTypes) {
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
  language: toRef(props, 'language') as ReturnType<typeof toRef<Language>>,
  theme: toRef(props, 'theme'),
  warnings: toRef(props, 'warnings'),
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

// Expose methods for parent components
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

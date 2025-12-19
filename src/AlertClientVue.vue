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
    :language="language"
    :theme="themeClass"
    :sleep="sleepNormalized"
    :loading="loading"
    :spinner-enabled="spinnerEnabledNormalized"
    @loaded="onLoaded"
    @theme-changed="onThemeChanged"
    @update-warnings="fetchWarnings" />
</template>
<script>
/**
 * Vue wrapper component for AlertClient.
 * Accepts native JavaScript types (Number, Boolean) unlike the web component
 * version which only accepts strings.
 */
import fetch from 'cross-fetch'

import AlertClient from './components/AlertClient.vue'
import config from './mixins/config'
import utils from './mixins/utils'

// Helper to normalize string|boolean to boolean
const toBool = (val, defaultVal = true) => {
  if (typeof val === 'boolean') return val
  if (typeof val === 'string') return val.toLowerCase() !== 'false'
  return defaultVal
}

// Helper to normalize string|number to number
const toNum = (val, defaultVal = 0) => {
  if (typeof val === 'number') return val
  if (typeof val === 'string') return Number(val)
  return defaultVal
}

export default {
  name: 'AlertClientVue',
  components: {
    AlertClient,
  },
  mixins: [config, utils],
  props: {
    currentDate: {
      type: [String, Date],
      default: null,
    },
    baseUrl: {
      type: String,
      default: 'https://www.ilmatieteenlaitos.fi/geoserver/alert/ows',
    },
    selectedDay: {
      type: [String, Number],
      default: 0,
    },
    regionListEnabled: {
      type: [String, Boolean],
      default: true,
    },
    spinnerEnabled: {
      type: [String, Boolean],
      default: true,
    },
    grayScaleSelector: {
      type: [String, Boolean],
      default: true,
    },
    staticDays: {
      type: [String, Boolean],
      default: true,
    },
    startFrom: {
      type: String,
      default: '',
    },
    weatherUpdated: {
      type: String,
      default: '',
    },
    floodUpdated: {
      type: String,
      default: '',
    },
    weatherWarnings: {
      type: String,
      default: '',
    },
    floodWarnings: {
      type: String,
      default: '',
    },
    warnings: {
      type: [String, Object],
      default: null,
    },
    dailyWarningTypes: {
      type: [String, Array],
      default: () => [],
    },
    refreshInterval: {
      type: [String, Number],
      default: 900000, // 1000 * 60 * 15
    },
    geometryId: {
      type: [String, Number],
      default: () => Number(config.props.defaultGeometryId) || 2021,
    },
    language: {
      type: String,
      default: import.meta.env.VITE_LANGUAGE || 'fi',
    },
    theme: {
      type: String,
      default: 'light',
    },
    fontScale: {
      type: [String, Number],
      default: 1,
    },
    sleep: {
      type: [String, Boolean],
      default: true,
    },
    debugMode: {
      type: [String, Boolean],
      default: false,
    },
  },
  data() {
    return {
      loading: 1,
      updatedAt: null,
      refreshedAt: null,
      themeClass: `${this.theme}-theme`,
      warningsData: null,
      visible: true,
    }
  },
  computed: {
    selectedDayNormalized() {
      return toNum(this.selectedDay, 0)
    },
    regionListEnabledNormalized() {
      return toBool(this.regionListEnabled, true)
    },
    grayScaleSelectorNormalized() {
      return toBool(this.grayScaleSelector, true)
    },
    staticDaysNormalized() {
      return toBool(this.staticDays, true)
    },
    dailyWarningTypesNormalized() {
      if (Array.isArray(this.dailyWarningTypes)) return this.dailyWarningTypes
      if (
        typeof this.dailyWarningTypes === 'string' &&
        this.dailyWarningTypes
      ) {
        return this.dailyWarningTypes.split(',').map((item) => item.trim())
      }
      return []
    },
    refreshIntervalNormalized() {
      return toNum(this.refreshInterval, 900000)
    },
    geometryIdNormalized() {
      return toNum(this.geometryId, 2021)
    },
    sleepNormalized() {
      return toBool(this.sleep, true)
    },
    spinnerEnabledNormalized() {
      return toBool(this.spinnerEnabled, true)
    },
    debugModeNormalized() {
      return toBool(this.debugMode, false)
    },
    weatherUpdatedType() {
      return 'weather_update_time'
    },
    floodUpdatedType() {
      return 'flood_update_time'
    },
    weatherWarningsType() {
      return 'weather_finland_active_all'
    },
    floodWarningsType() {
      return 'flood_finland_active_all'
    },
    weatherUpdatedQuery() {
      return this.weatherUpdated || `${this.query}${this.weatherUpdatedType}`
    },
    floodUpdatedQuery() {
      return this.floodUpdated || `${this.query}${this.floodUpdatedType}`
    },
    weatherWarningsQuery() {
      return this.weatherWarnings || `${this.query}${this.weatherWarningsType}`
    },
    floodWarningsQuery() {
      return (
        this.floodWarnings ||
        `${this.query}${this.floodWarningsType}${this.floodFilter}`
      )
    },
    query() {
      return '?service=WFS&version=1.0.0&request=GetFeature&maxFeatures=1000&outputFormat=application%2Fjson&typeName='
    },
    floodSupportedSeverities() {
      return ['moderate', 'severe', 'extreme']
    },
    floodFilter() {
      return `${this.floodSupportedSeverities.reduce(
        (filter, severity, index) =>
          `${filter + (index === 0 ? '' : ',')}%27${severity.toUpperCase()}%27`,
        '&cql_filter=severity%20IN%20('
      )})%20AND%20language=%27${this.capLanguage()}%27`
    },
    capLanguage() {
      return () =>
        ({
          fi: 'fi-FI',
          sv: 'sv-SV',
          en: 'en-US',
        })[this.language]
    },
    currentTime() {
      if (this.refreshedAt) {
        return this.refreshedAt
      }
      if (this.currentDate) {
        const date =
          this.currentDate instanceof Date
            ? this.currentDate
            : new Date(this.currentDate)
        return date.getTime()
      }
      return Date.now()
    },
  },
  created() {
    if (this.warnings) {
      this.warningsData =
        typeof this.warnings === 'string'
          ? JSON.parse(this.warnings)
          : this.warnings
    }
  },
  mounted() {
    const fontScaleNum = toNum(this.fontScale, 1)
    if (fontScaleNum !== 1) {
      let originalFontSize
      if (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined' &&
        document.documentElement &&
        window.getComputedStyle
      ) {
        const htmlElement = document.documentElement
        const computedStyle = window.getComputedStyle(htmlElement)
        originalFontSize = parseFloat(computedStyle.fontSize)
      }
      if (originalFontSize == null || Number.isNaN(originalFontSize)) {
        originalFontSize = 16 // Fallback
      }
      const scaledFontSize = fontScaleNum * originalFontSize
      const newFontSize = Math.round(scaledFontSize * 100) / 100
      document.documentElement.style.fontSize = `${newFontSize}px`
    }
  },
  serverPrefetch() {
    if (!this.warnings) {
      return this.fetchWarnings()
    }
  },
  methods: {
    onLoaded(loaded) {
      if (loaded !== 0) {
        this.loading = loaded === -1 ? -1 : 0
      }
    },
    onThemeChanged(newTheme) {
      this.themeClass = `${
        newTheme != null && newTheme.length > 0 ? newTheme : this.theme
      }-theme`
    },
    fetchWarnings() {
      if (this.warnings) {
        return
      }
      this.loading = 1
      if (this.debugModeNormalized) {
        console.log(`Updating warnings at ${new Date()}`)
      }
      const queries = new Map()
        .set(
          `${this.baseUrl}${this.weatherUpdatedQuery}`,
          this.weatherUpdatedType
        )
        .set(`${this.baseUrl}${this.floodUpdatedQuery}`, this.floodUpdatedType)
        .set(
          `${this.baseUrl}${this.weatherWarningsQuery}`,
          this.weatherWarningsType
        )
        .set(
          `${this.baseUrl}${this.floodWarningsQuery}`,
          this.floodWarningsType
        )
      const responseData = {}
      return Promise.allSettled(
        [...queries.keys()].map(async (query) =>
          fetch(query).then((response) =>
            response
              .json()
              .then((json) => {
                const currentTime = Date.now()
                if (this.updatedAt != null) {
                  this.refreshedAt = currentTime
                }
                this.updatedAt = currentTime
                responseData[queries.get(query)] = json
              })
              .catch((error) => {
                this.loading = -1
                console.log(error)
              })
          )
        )
      ).then(() => {
        this.warningsData = responseData
      })
    },
    show() {
      this.visible = true
    },
    hide() {
      this.visible = false
    },
  },
}
</script>
<style lang="scss">
@import './scss/utilities.scss';
</style>

<template>
  <AlertClient
    v-if="visible"
    :refresh-interval="refreshIntervalParsed"
    :default-day="selectedDayParsed"
    :static-days="staticDaysParsed"
    :start-from="startFrom"
    :region-list-enabled="regionListEnabledParsed"
    :gray-scale-selector="grayScaleSelectorParsed"
    :current-time="currentTime"
    :warnings-data="warningsData"
    :daily-warning-types="dailyWarningTypesParsed"
    :geometry-id="geometryIdParsed"
    :language="language"
    :theme="themeClass"
    :sleep="sleepParsed"
    :loading="loading"
    :spinner-enabled="spinnerEnabledParsed"
    @loaded="onLoaded"
    @themeChanged="onThemeChanged"
    @update-warnings="fetchWarnings" />
</template>
<script>
import fetch from 'cross-fetch'

import AlertClient from './components/AlertClient.vue'
import config from './mixins/config'
import utils from './mixins/utils'

export default {
  name: 'App',
  components: {
    AlertClient,
  },
  mixins: [config, utils],
  props: {
    currentDate: {
      type: String,
      default: null,
    },
    baseUrl: {
      type: String,
      default: 'https://www.ilmatieteenlaitos.fi/geoserver/alert/ows',
    },
    selectedDay: {
      type: String,
      default: '0',
    },
    regionListEnabled: {
      type: String,
      default: 'true',
    },
    spinnerEnabled: {
      type: String,
      default: 'true',
    },
    grayScaleSelector: {
      type: String,
      default: 'true',
    },
    staticDays: {
      type: String,
      default: 'true',
    },
    startFrom: {
      type: String,
      default: '',
    },
    weatherUpdated: String,
    floodUpdated: String,
    weatherWarnings: String,
    floodWarnings: String,
    warnings: {
      type: String,
      default: null,
    },
    dailyWarningTypes: {
      type: String,
      default: null,
    },
    refreshInterval: {
      type: String,
      default: '900000', // 1000 * 60 * 15
    },
    geometryId: {
      type: String,
      default: config.props.defaultGeometryId,
    },
    language: {
      type: String,
      default: import.meta.env.VUE_APP_I18N_LOCALE || 'en',
    },
    theme: {
      type: String,
      default: 'light',
    },
    sleep: {
      type: String,
      default: 'true',
    },
    spinnerEnabled: {
      type: String,
      default: 'true',
    },
    debugMode: {
      type: String,
      default: 'false',
    },
  },
  data() {
    return {
      loading: true,
      updatedAt: null,
      refreshedAt: null,
      themeClass: `${this.theme}-theme`,
      warningsData: null,
      visible: true,
    }
  },
  computed: {
    selectedDayParsed() {
      return Number(this.selectedDay)
    },
    regionListEnabledParsed() {
      return this.regionListEnabled.toLowerCase() !== 'false'
    },
    grayScaleSelectorParsed() {
      return this.grayScaleSelector.toLowerCase() !== 'false'
    },
    staticDaysParsed() {
      return this.staticDays.toLowerCase() !== 'false'
    },
    dailyWarningTypesParsed() {
      return this.dailyWarningTypes != null
        ? this.dailyWarningTypes.split(',').map((item) => item.trim())
        : []
    },
    refreshIntervalParsed() {
      return Number(this.refreshInterval)
    },
    geometryIdParsed() {
      return Number(this.geometryId)
    },
    sleepParsed() {
      return this.sleep.toLowerCase() !== 'false'
    },
    spinnerEnabledParsed() {
      return this.spinnerEnabled.toLowerCase() !== 'false'
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
        return new Date(this.currentDate).getTime()
      }
      return Date.now()
    },
  },
  created() {
    if (this.warnings) {
      this.warningsData = JSON.parse(this.warnings)
    }
  },
  serverPrefetch() {
    if (this.warnings == null) {
      return this.fetchWarnings()
    }
  },
  methods: {
    onLoaded(loaded) {
      if (loaded) {
        this.loading = false
      }
    },
    onThemeChanged(newTheme) {
      this.themeClass = `${
        newTheme != null && newTheme.length > 0 ? newTheme : this.theme
      }-theme`
    },
    fetchWarnings() {
      this.loading = true
      if (this.debugMode.toLowerCase() !== 'false') {
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
            response.json().then((json) => {
              const currentTime = Date.now()
              if (this.updatedAt != null) {
                this.refreshedAt = currentTime
              }
              this.updatedAt = currentTime
              responseData[queries.get(query)] = json
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

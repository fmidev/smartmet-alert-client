<template>
  <AlertClient
    v-if="visible"
    :refresh-interval="refreshInterval"
    :selected-day="selectedDay"
    :static-days="staticDays"
    :start-from="startFrom"
    :region-list-enabled="regionListEnabled"
    :current-time="currentTime"
    :warnings-data="warningsData"
    :daily-warning-types="dailyWarningTypes"
    :geometry-id="geometryId"
    :language="language"
    :theme="theme"
    :sleep="sleep"
    @update-warnings="fetchWarnings" />
</template>
<script>
import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import { BootstrapVue, BSpinner } from 'bootstrap-vue'
import fetch from 'cross-fetch'
import Vue from 'vue'

import AlertClient from './components/AlertClient.vue'
import config from './mixins/config'
import utils from './mixins/utils'
import store from './store'

Vue.config.productionTip = false
Vue.use(BootstrapVue)
Vue.component('BSpinner', BSpinner)
Vue.prototype.$store = store

export default {
  name: 'App',
  components: {
    AlertClient,
  },
  mixins: [config, utils],
  props: {
    currentDate: {
      type: String,
    },
    baseUrl: {
      type: String,
      default: 'https://www.ilmatieteenlaitos.fi/geoserver/alert/ows',
    },
    selectedDay: {
      type: Number,
      default: 0,
    },
    regionListEnabled: {
      type: Boolean,
      default: true,
    },
    spinnerEnabled: {
      type: Boolean,
      default: true,
    },
    staticDays: {
      type: Boolean,
      default: true,
    },
    startFrom: {
      type: String,
      default: '',
    },
    weatherUpdated: String,
    floodUpdated: String,
    weatherWarnings: String,
    floodWarnings: String,
    warnings: Object,
    dailyWarningTypes: {
      type: Array,
      default: () => [],
    },
    refreshInterval: {
      type: Number,
      default: 1000 * 60 * 15,
    },
    geometryId: {
      type: Number,
      default: config.props.defaultGeometryId,
    },
    language: {
      type: String,
      default: process.env.VUE_APP_I18N_LOCALE || 'en',
    },
    theme: {
      type: String,
      default: 'light',
    },
    sleep: {
      type: Boolean,
      default: true,
    },
    debugMode: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      updatedAt: null,
      refreshedAt: null,
      warningsData: null,
      visible: true,
    }
  },
  computed: {
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
        }[this.language])
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
      this.warningsData = this.warnings
    }
  },
  serverPrefetch() {
    if (this.warnings == null) {
      return this.fetchWarnings()
    }
  },
  methods: {
    fetchWarnings() {
      if (this.spinnerEnabled) {
        this.$store.dispatch('setLoading', true)
      }
      if (this.debugMode) {
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

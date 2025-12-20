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
 * Web component wrapper for AlertClient.
 * All props are strings (HTML attribute limitation).
 * Use AlertClientVue.vue for native Vue usage with proper types.
 */
import AlertClient from './components/AlertClient.vue'
import alertClientCore, { toBool, toNum } from './mixins/alertClientCore'
import config from './mixins/config'
import utils from './mixins/utils'

export default {
  name: 'App',
  components: {
    AlertClient,
  },
  mixins: [config, utils, alertClientCore],
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
      type: String,
      default: '',
    },
    dailyWarningTypes: {
      type: String,
      default: '',
    },
    refreshInterval: {
      type: String,
      default: '900000', // 1000 * 60 * 15
    },
    geometryId: {
      type: String,
      default: config.props.defaultGeometryId || '2021',
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
      type: String,
      default: '1',
    },
    sleep: {
      type: String,
      default: 'true',
    },
    debugMode: {
      type: String,
      default: 'false',
    },
  },
  computed: {
    // String-to-type normalizers for web component props
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
      return this.dailyWarningTypes
        ? this.dailyWarningTypes.split(',').map((item) => item.trim())
        : []
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
  },
}
</script>
<style lang="scss">
@import './scss/utilities.scss';
</style>

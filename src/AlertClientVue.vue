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
import AlertClient from './components/AlertClient.vue'
import alertClientCore, { toBool, toNum } from './mixins/alertClientCore'
import config from './mixins/config'
import utils from './mixins/utils'

export default {
  name: 'AlertClientVue',
  components: {
    AlertClient,
  },
  mixins: [config, utils, alertClientCore],
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
  computed: {
    // Type normalizers for mixed-type props
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
  },
}
</script>
<style lang="scss">
@import './scss/utilities.scss';
</style>

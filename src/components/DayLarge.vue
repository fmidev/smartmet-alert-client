<template>
  <div>
    <div class="map-container">
      <div class="warning-map-status" aria-hidden="true">
        <p>
          <span class="bold-text">{{ warningsTitle }}</span
          ><br />
          <span v-html="warningsDate"></span>
        </p>
        <p>
          <span class="bold-text">{{ updatedTitle }}</span
          ><br />
          {{ updatedDate }}<br />
          {{ atTime }} {{ updatedTime }}
        </p>
      </div>
      <MapLarge
        :index="index"
        :input="regions"
        :visible-warnings="visibleWarnings"
        :warnings="warnings"
        :geometry-id="geometryId"
        :loading="loading"
        :theme="theme"
        :language="language"
        :spinner-enabled="spinnerEnabled"
        @loaded="onLoaded" />
    </div>
    <div class="data-providers noselect" aria-hidden="true">
      <span>{{ dataProviderFirst }}</span>
      <br />
      <span>{{ dataProviderSecond }}</span>
    </div>
  </div>
</template>

<script>
import i18n from '../mixins/i18n'
import utils from '../mixins/utils'
import MapLarge from './MapLarge.vue'

export default {
  name: 'DayLarge',
  components: { MapLarge },
  mixins: [i18n, utils],
  props: {
    index: {
      type: Number,
    },
    input: {
      type: Object,
      default: () => ({}),
    },
    visibleWarnings: {
      type: Array,
      default: () => [],
    },
    warnings: {
      type: Object,
      default: null,
    },
    regions: {
      type: Object,
    },
    geometryId: {
      type: Number,
    },
    staticDays: {
      type: Boolean,
      default: true,
    },
    timeOffset: {
      type: Number,
      default: 0,
    },
    loading: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
    },
    language: {
      type: String,
    },
    spinnerEnabled: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    warningsTitle() {
      return this.t('warnings') || ''
    },
    updatedTitle() {
      return this.t('updated') || ''
    },
    atTime() {
      return this.t('atTime') || ''
    },
    warningsDate() {
      if (
        this.input.day == null ||
        this.input.month == null ||
        this.input.year == null
      ) {
        return ''
      }
      if (this.staticDays) {
        return `${this.input.day}.${this.input.month}.${this.input.year}`
      }
      const date = new Date(
        this.input.year,
        this.input.month - 1,
        this.input.day
      )
      const nextDate = new Date(date.getTime())
      nextDate.setDate(nextDate.getDate() + 1)
      const offset = this.timeOffset
      const offsetDate = new Date(date.getTime())
      offsetDate.setMilliseconds(offset)
      const hours = this.twoDigits(offsetDate.getHours())
      const minutes = this.twoDigits(offsetDate.getMinutes())
      return `${this.input.day}.${this.input.month}.${this.input.year} ${
        this.atTime
      } ${hours}:${minutes} –
      <br> ${nextDate.getDate()}.${
        nextDate.getMonth() + 1
      }.${nextDate.getFullYear()} ${this.atTime} ${hours}:${minutes}`
    },
    updatedDate() {
      return this.input.updatedDate || ''
    },
    updatedTime() {
      return this.input.updatedTime || ''
    },
    dataProviderFirst() {
      return this.t('dataProviderFirst')
    },
    dataProviderSecond() {
      return this.t('dataProviderSecond')
    },
  },
  methods: {
    onLoaded(loaded) {
      if (loaded) {
        this.$emit('loaded', true)
      }
    },
  },
}
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';

div,
span {
  background-color: $transparent;
}

p {
  background: transparent;
  margin: 0 0 10px;
  padding: 0;
  white-space: normal !important;
}

br {
  white-space: normal;
}

div.map-container {
  text-align: center;
  margin-left: 0;
  margin-right: 0;
  position: relative;
  max-height: $map-large-height;
  background: transparent;
  top: 0;
}

div.warning-map-status {
  position: absolute;
  margin-left: 15px;
  text-align: left;
  z-index: 6;
  pointer-events: none;
}

div.data-providers {
  position: relative;
  text-align: right;
  z-index: 15;
  pointer-events: none;
  padding-left: 50%;
  margin-top: -50px;
  margin-right: 15px;
}

@media screen and (orientation: landscape) {
  div.map-container {
    height: $map-large-height;
  }
}
</style>

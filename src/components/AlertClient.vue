<template>
  <div
    id="fmi-warnings"
    :class="theme"
    :data-smartmet-alert-client-version="version">
    <div id="fmi-warnings-errors" :class="errors" />
    <div>
      <div class="container-fluid" :class="theme">
        <div class="row">
          <div class="col-12 col-md-8 col-lg-8 col-xl-8 day-region-views">
            <h2 v-if="!loading" class="valid-warnings">
              {{ validWarningsText }}
            </h2>
            <div v-if="loading" class="not-ready">
              <p>
                {{ mainInfoText }}
                {{ additionalInfoText }}
              </p>
              <a
                :href="supportedBrowsersLink"
                target="_blank"
                rel="noopener noreferrer"
                class="supported-browsers">
                {{ supportedBrowsers }}</a
              >
            </div>
            <div v-if="regionListEnabled">
              <a
                v-if="numWarnings"
                id="fmi-warnings-to-text-content"
                :href="toContentId"
                tabindex="0"
                class="visually-hidden-focusable focus-ring"
                @click="toContentClicked"
                >{{ toContentText }}</a
              >
              <div v-else :aria-label="noWarningsText"></div>
            </div>
            <Days
              :input="days"
              :visible-warnings="visibleWarnings"
              :selected-day="selectedDay"
              :static-days="staticDays"
              :time-offset="timeOffset"
              :warnings="warnings"
              :regions="regions"
              :geometry-id="geometryId"
              :loading="Boolean(loading)"
              :theme="theme"
              :language="language"
              :spinner-enabled="spinnerEnabled"
              @daySelected="onDaySelected"
              @loaded="onLoaded" />
          </div>
          <div class="col-12 col-md-4 col-lg-4 col-xl-4 symbol-list">
            <Legend
              v-show="validData"
              :input="legend"
              :visible-warnings="visibleWarnings"
              :gray-scale-selector="grayScaleSelector"
              :theme="theme"
              :language="language"
              @themeChanged="onThemeChanged"
              @warningsToggled="onWarningsToggled" />
          </div>
        </div>
        <div v-if="regionListEnabled" class="row">
          <div class="col-12 col-md-8 col-lg-8 col-xl-8 day-region-views">
            <Regions
              :input="regions"
              :selected-day="selectedDay"
              :warnings="warnings"
              :parents="parents"
              :geometry-id="geometryId"
              :theme="theme"
              :language="language" />
          </div>
          <div class="col-12 col-md-4 col-lg-4 col-xl-4 symbol-list"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import config from '../mixins/config'
import i18n from '../mixins/i18n'
import utils from '../mixins/utils'
import Days from './Days.vue'
import Legend from './Legend.vue'
import Regions from './Regions.vue'

export default {
  name: 'AlertClient',
  props: {
    refreshInterval: {
      type: Number,
      default: 1000 * 60 * 15,
    },
    defaultDay: {
      type: Number,
      default: 0,
    },
    staticDays: {
      type: Boolean,
      default: true,
    },
    startFrom: {
      type: String,
      default: '',
    },
    regionListEnabled: {
      type: Boolean,
      default: true,
    },
    grayScaleSelector: {
      type: Boolean,
      default: false,
    },
    currentTime: {
      type: Number,
      default: Date.now(),
    },
    warningsData: Object,
    dailyWarningTypes: {
      type: Array,
      default: () => [],
    },
    geometryId: {
      type: Number,
      default: config.props.defaultGeometryId,
    },
    language: {
      type: String,
      default: 'en',
    },
    theme: {
      type: String,
      default: 'light-theme',
    },
    loading: {
      type: Number,
      default: true,
    },
    sleep: {
      type: Boolean,
      default: true,
    },
    spinnerEnabled: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    Days,
    Regions,
    Legend,
  },
  mixins: [config, i18n, utils],
  data() {
    return {
      selectedDay: this.defaultDay,
      visibleWarnings: [],
      timer: null,
      visibilityListener: null,
      warnings: null,
      days: [],
      regions: this.regionsDefault(),
      parents: {},
      legend: [],
      timeOffset: 0,
      // eslint-disable-next-line no-undef
      version: __APP_VERSION__,
      errors: [],
    }
  },
  computed: {
    toContentText() {
      if (
        [this.REGION_LAND, this.REGION_SEA].some(
          (regionType) =>
            this?.regions?.[this.selectedDay]?.[regionType]?.length > 0
        )
      ) {
        return this.t('toContent') || ''
      }
      return this.t('toNextContent') || ''
    },
    toContentId() {
      if (
        [this.REGION_LAND, this.REGION_SEA].some(
          (regionType) =>
            this?.regions?.[this.selectedDay]?.[regionType]?.length > 0
        )
      ) {
        return '#fmi-warnings-region-content'
      }
      return '#fmi-warnings-end-of-regions'
    },
    noWarningsText() {
      return this.t('noWarnings')
    },
    validWarningsText() {
      return this.legend.length > 0
        ? this.t('validWarnings')
        : this.t('noWarnings')
    },
    supportedBrowsersLink() {
      return this.t('supportedBrowsersLink')
    },
    supportedBrowsers() {
      return this.t('supportedBrowsers')
    },
    mainInfoText() {
      return this.loading === -1
        ? this.t('failed')
        : this.t('notInitializedStart')
    },
    additionalInfoText() {
      return this.loading === -1 ? '' : this.t('notInitializedEnd')
    },
    numWarnings() {
      return this.warnings != null ? Object.keys(this.warnings).length : 0
    },
    validData() {
      return (
        this.days != null &&
        this.days.length === 5 &&
        this.days[0].updatedDate != null &&
        this.days[0].updatedDate.length > 0
      )
    },
  },
  watch: {
    warningsData() {
      this.createDataForChildren()
    },
  },
  created() {
    this.createDataForChildren()
    if (this.warningsData == null) {
      this.update()
    }
  },
  mounted() {
    this.initTimer()
    if (this.isClientSide() && this.sleep) {
      this.visibilityListener = document.addEventListener(
        'visibilitychange',
        this.visibilityChange
      )
    }
  },
  beforeDestroy() {
    if (this.isClientSide()) {
      document.removeEventListener('visibilitychange', this.visibilityListener)
    }
    this.cancelTimer()
  },
  serverPrefetch() {
    this.createDataForChildren()
  },
  methods: {
    onDaySelected(newSelectedDay) {
      this.selectedDay = newSelectedDay
    },
    onWarningsToggled(newVisibleWarnings) {
      this.visibleWarnings = newVisibleWarnings
      this.legend.forEach((warning, i) => {
        const isVisible = newVisibleWarnings.includes(warning.type)
        if (isVisible !== warning.visible) {
          this.legend[i].visible = isVisible
        }
      })
    },
    onLoaded(loaded) {
      if (this.loading !== -1 && loaded) {
        this.$emit('loaded', 1)
      }
    },
    onDataError() {
      this.$emit('loaded', -1)
    },
    onThemeChanged(newTheme) {
      if (this.theme !== newTheme) {
        this.$emit('themeChanged', newTheme)
      }
    },
    toContentClicked() {
      const textContent = this.$el.querySelector(this.toContentId)
      textContent.scrollIntoView()
      textContent.focus()
    },
    createDataForChildren() {
      if (this.warningsData != null) {
        const result = this.handleMapWarnings(this.warningsData)
        this.warnings = result.warnings
        this.days = result.days
        this.regions = result.regions
        this.parents = result.parents
        this.legend = result.legend
        this.visibleWarnings = this.legend
          .filter((legendWarning) => legendWarning.visible)
          .map((legendWarning) => legendWarning.type)
      }
    },
    visibilityChange() {
      if (this.isClientSide() && this.refreshInterval) {
        if (document.hidden) {
          this.cancelTimer()
        } else {
          this.cancelTimer()
          this.update()
          this.initTimer()
        }
      }
    },
    initTimer() {
      if (this.refreshInterval) {
        this.timer = setInterval(this.update, this.refreshInterval)
      }
    },
    cancelTimer() {
      if (this.timer != null) {
        clearInterval(this.timer)
      }
    },
    update() {
      if (this.refreshInterval > 0) {
        this.$emit('update-warnings')
      }
    },
    handleError(error) {
      if (!this.errors.includes(error)) {
        this.errors.push(error)
      }
      console.log(error)
    },
  },
}
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';

:deep(*) {
  box-sizing: border-box;
  -webkit-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;
  font-family: $font-family;
  font-size: $font-size;
  line-height: 1.42857143;
  background-color: transparent;
  font-weight: normal;

  *:focus {
    outline-offset: 2px;
    z-index: 10;
  }

  .bold-text {
    font-weight: bold !important;
  }

  .noselect {
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Chrome/Safari/Opera */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none; /* Non-prefixed version, currently not supported by any browser */
    cursor: pointer;
  }

  h3 {
    font-weight: bold;
  }
}

:deep(.light-theme *) {
  color: $light-text-color;
}

:deep(.dark-theme *) {
  color: $dark-text-color;
}

:deep(.light-gray-theme *) {
  color: $light-gray-text-color;
}

:deep(.dark-gray-theme *) {
  color: $dark-gray-text-color;
}

div#fmi-warnings {
  width: 700px;
  padding: 0;
  margin-bottom: 20px;

  h2.valid-warnings {
    text-align: left;
    font-weight: bold;
    margin-bottom: 3px;
  }

  div.not-ready {
    width: 100%;
    padding: 15px;
    a.supported-browsers {
      font-weight: bold;
      text-decoration: none;
    }
  }

  .light-theme div.not-ready {
    background-color: $notification-color;
    border: 1px solid $dark-blue;
    a.supported-browsers {
      color: $light-ext-link-color;
      border-bottom: 1px solid $light-ext-link-color;
    }
    a.supported-browsers:hover {
      border-color: $dark-blue;
    }
  }

  .dark-theme div.not-ready {
    background-color: $darkest-gray;
    border: 1px solid $notification-color;
    a.supported-browsers {
      color: $dark-ext-link-color;
      border-bottom: 1px solid $dark-ext-link-color;
    }
    a.supported-browsers:hover {
      border-color: $notification-color;
    }
  }

  .light-gray-theme div.not-ready {
    background-color: $notification-color;
    border: 1px solid $dark-blue;
    a.supported-browsers {
      color: $light-gray-ext-link-color;
      border-bottom: 1px solid $light-gray-ext-link-color;
    }
    a.supported-browsers:hover {
      border-color: $dark-blue;
    }
  }

  .dark-gray-theme div.not-ready {
    background-color: $notification-color;
    border: 1px solid $light-blue;
    a.supported-browsers {
      color: $dark-gray-ext-link-color;
      border-bottom: 1px solid $dark-gray-ext-link-color;
    }
    a.supported-browsers:hover {
      border-color: $light-blue;
    }
  }

  div {
    background-color: transparent;
  }

  div.container-fluid {
    padding: 0;
    margin: 5px 0 0;
  }

  a#fmi-warnings-to-text-content {
    font-family: $font-family;
    font-size: $font-size;
    height: 20px;
    &:focus {
      outline-offset: 2px;
    }
  }
}

.row {
  margin-left: 0;
  margin-right: 0;
}

div.day-region-views {
  max-width: $map-large-width;
  width: $map-large-width;
  padding-left: 0;
  padding-right: 0;
}

div.symbol-list {
  top: 0;
  z-index: 1;
  padding-left: 20px;
  padding-right: 0;
  box-sizing: border-box;
  width: $symbol-list-width;
  max-width: $symbol-list-width;
  min-width: $symbol-list-width;
}

.light-gray-theme a.supported-browsers {
  color: $light-gray-ext-link-color;
}

.dark-gray-theme a.supported-browsers {
  color: $dark-gray-ext-link-color;
}

@media (max-width: 767px) {
  div#fmi-warnings {
    width: 100%;
  }

  div.day-region-views {
    min-width: 100%;
    width: 100%;
    max-width: 100%;
  }
  div.symbol-list {
    position: static;
    padding-left: 0;
    margin-top: 0;
    margin-bottom: 0;
    min-width: 100%;
    width: 100%;
    max-width: 100%;
  }
}

@media print {
  .symbol-list {
    display: none;
  }
}
</style>

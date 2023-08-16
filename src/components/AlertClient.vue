<template>
  <div
    id="fmi-warnings"
    :class="currentTheme"
    :data-smartmet-alert-client-version="version">
    <div id="fmi-warnings-errors" :class="errors" />
    <div>
      <div class="container-fluid" :class="currentTheme">
        <div class="row">
          <div class="col-12 col-md-8 col-lg-8 col-xl-8 day-region-views">
            <h3 class="valid-warnings" :class="initialized && 'initialized'">
              {{ validWarningsText }}
              <span v-if="!initialized">
                <br>
                {{ additionalWarningsText }}
                <br>
                <a
                  :href="supportedBrowsersLink"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="supported-browsers">
                  {{ supportedBrowsers }}</a
                >
              </span>
            </h3>
            <div v-if="regionListEnabled">
              <a
                v-if="numWarnings"
                id="fmi-warnings-to-text-content"
                href="#fmi-warnings-region-content"
                tabindex="0"
                class="sr-only sr-only-focusable"
                >{{ toContentText }}</a
              >
              <div v-else :aria-label="noWarningsText"></div>
            </div>
            <Days
              :input="days"
              :default-day="selectedDay"
              :static-days="staticDays"
              :regions="regions"
              :geometry-id="geometryId" />
          </div>
          <div class="col-12 col-md-4 col-lg-4 col-xl-4 symbol-list">
            <Legend v-show="validData" :input="legend" />
          </div>
        </div>
        <div v-if="regionListEnabled" class="row">
          <div class="col-12 col-md-8 col-lg-8 col-xl-8 day-region-views">
            <Regions
              :input="regions"
              :parents="parents"
              :geometry-id="geometryId" />
          </div>
          <div class="col-12 col-md-4 col-lg-4 col-xl-4 symbol-list"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import 'focus-visible'

import i18n from '../i18n'
import config from '../mixins/config'
import utils from '../mixins/utils'
import module from '../store/module'
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
    selectedDay: {
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
    language: String,
    theme: {
      type: String,
      default: 'light',
    },
    sleep: {
      type: Boolean,
      default: true,
    },
  },
  components: {
    Days,
    Regions,
    Legend,
  },
  mixins: [config, utils],
  data() {
    return {
      timer: null,
      visibilityListener: null,
      warnings: {},
      days: [],
      regions: this.regionsDefault(),
      parents: {},
      legend: [],
      // eslint-disable-next-line no-undef
      version: VERSION,
      errors: [],
    }
  },
  computed: {
    loading() {
      return this.$store.getters.loading
    },
    toContentText() {
      return i18n.t('toContent') || ''
    },
    noWarningsText() {
      return i18n.t('noWarnings')
    },
    validWarningsText() {
      if (this.loading) {
        return ''
      }
      if (!this.initialized) {
        return i18n.t('notInitializedStart')
      }
      return this.legend.length > 0
        ? i18n.t('validWarnings')
        : i18n.t('noWarnings')
    },
    supportedBrowsersLink() {
      return i18n.t('supportedBrowsersLink')
    },
    supportedBrowsers() {
      return i18n.t('supportedBrowsers')
    },
    additionalWarningsText() {
      return i18n.t('notInitializedEnd')
    },
    numWarnings() {
      return Object.keys(this.warnings).length
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
  async beforeCreate() {
    if (!this.$store.hasModule('warningsStore')) {
      await this.$store.registerModule('warningsStore', module, {
        preserveState: false,
      })
    }
  },
  created() {
    if (this.language) {
      i18n.locale = this.language
    }
    this.createDataForChildren()
    if (this.warningsData == null) {
      this.update()
    }
  },
  mounted() {
    this.$store.dispatch('setTheme', this.theme)
    this.initTimer()
    if (this.sleep) {
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
    this.$store.unregisterModule('warningsStore')
  },
  async serverPrefetch() {
    await this.createDataForChildren()
  },
  methods: {
    async createDataForChildren() {
      if (this.warningsData != null) {
        const result = await this.handleMapWarnings(this.warningsData)
        this.warnings = result.warnings
        this.days = result.days
        this.regions = result.regions
        this.parents = result.parents
        this.legend = result.legend
        const dispatches = [
          this.$store.dispatch(
            'setVisibleWarnings',
            this.legend
              .filter((legendWarning) => legendWarning.visible)
              .map((legendWarning) => legendWarning.type)
          ),
          this.$store.dispatch('setWarnings', this.warnings),
        ]
        if (!this.initialized) {
          dispatches.unshift(
            this.$store.dispatch('setSelectedDay', this.selectedDay)
          )
        }
        await Promise.all(dispatches)
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

::v-deep * {
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

::v-deep .light * {
  color: $light-text-color;
}

::v-deep .dark * {
  color: $dark-text-color;
}

div#fmi-warnings {
  width: 690px;
  padding: 0;
  margin-bottom: 20px;

  h3.valid-warnings {
    text-align: left;
    font-weight: normal;
    &.initialized {
      font-weight: bold;
    }
    &:not(.initialized) {
      width: 100%;
      background-color: $notification-color;
      border: 1px solid $darker-blue;
      color: $darker-blue;
      padding: 15px;
    }
    span {
      color: $darker-blue;
      a {
        font-weight: bold;
        text-decoration: none;
        border-bottom: 1px solid $light-ext-link-color;
      }
      a:hover {
        border-color: $darker-blue;
      }
    }
  }

  .dark h3.valid-warnings {
    &:not(.initialized) {
      background-color: $darkest-gray;
      border: 1px solid $notification-color;
      color: $white;
    }
    span {
      color: $white;
      a {
        color: $white;
        border-bottom: 1px solid $dark-ext-link-color;
      }
      a:hover {
        border-color: $notification-color;
      }  
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
      &:not([data-focus-visible-added]) {
        outline: none !important;
      }
    }
  }

  &.light {
    *:focus {
      outline: dashed 2px $light-outline-color !important;
    }
    a#fmi-warnings-to-text-content {
      &:focus {
        outline: dashed 2px $light-outline-color !important;
      }
    }
  }

  &.dark {
    *:focus {
      outline: dashed 2px $dark-outline-color !important;
    }
    a#fmi-warnings-to-text-content {
      &:focus {
        outline: dashed 2px $dark-outline-color !important;
      }
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

.light a.supported-browsers {
  color: $light-ext-link-color;
}

.dark a.supported-browsers {
  color: $light-ext-link-color;
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

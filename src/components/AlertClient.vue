<template>
  <div id="fmi-warnings" :data-smartmet-alert-client-version="version">
    <div id="fmi-warnings-errors" :class=errors />
    <div class="container-fluid">
      <div class="row">
        <div class="col-12 col-md-8 col-lg-8 col-xl-8 day-region-views">
          <Days :input="days" :defaultDay="selectedDay" :regions="regions" :geometryId="geometryId" />
          <Regions :input="regions" :parents="parents" :geometryId="geometryId" />
        </div>
        <div class="col-12 col-md-4 col-lg-4 col-xl-4 symbol-list">
          <Warnings v-show="validData" :input="legend" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import i18n from '../i18n';
import Days from './Days.vue';
import Regions from './Regions.vue';
import Warnings from './Warnings.vue';
import module from '../store/module';
import utils from '../mixins/utils';

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
    currentTime: {
      type: Number,
      default: Date.now(),
    },
    warningsData: Object,
    geometryId: {
      type: Number,
      default: 2020,
    },
    language: String,
    sleep: {
      type: Boolean,
      default: true,
    },
  },
  mixins: [utils],
  components: {
    Days,
    Regions,
    Warnings,
  },
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
    };
  },
  computed: {
    validData() {
      return ((this.days != null) && (this.days.length === 5) && (this.days[0].updatedDate != null) &&
        (this.days[0].updatedDate.length > 0));
    },
  },
  watch: {
    warningsData() {
      this.createDataForChildren();
    },
  },
  async beforeCreate() {
    if (!this.$store.hasModule('warningsStore')) {
      await this.$store.registerModule('warningsStore', module, {
        preserveState: false,
      });
    }
  },
  created() {
    if (this.language) {
      i18n.locale = this.language;
    }
    this.$store.dispatch('setSelectedDay', this.selectedDay);
    this.$store.dispatch('setVisibleWarnings', this.legend.filter((legendWarning) => legendWarning.visible).map((legendWarning) => legendWarning.type));
    this.$store.dispatch('setWarnings', this.warnings);
    this.createDataForChildren();
    if (this.warningsData == null) {
      this.update();
    }
  },
  mounted() {
    this.initTimer();
    if (this.sleep) {
      this.visibilityListener = document.addEventListener('visibilitychange', this.visibilityChange);
    }
  },
  beforeDestroy() {
    if (this.isClientSide()) {
      document.removeEventListener('visibilitychange', this.visibilityListener);
    }
    this.cancelTimer();
    this.$store.unregisterModule('warningsStore');
  },
  methods: {
    createDataForChildren() {
      if (this.warningsData != null) {
        this.handleMapWarnings(this.warningsData).then((result) => {
          this.warnings = result.warnings;
          this.days = result.days;
          this.regions = result.regions;
          this.parents = result.parents;
          this.legend = result.legend;
          this.$store.dispatch('setWarnings', this.warnings);
        });
      }
    },
    visibilityChange() {
      if (this.isClientSide()) {
        if (document.hidden) {
          this.cancelTimer();
        } else {
          this.cancelTimer();
          this.update();
          this.initTimer();
        }
      }
    },
    initTimer() {
      if (this.refreshInterval) {
        this.timer = setInterval(this.update, this.refreshInterval);
      }
    },
    cancelTimer() {
      if (this.timer != null) {
        clearInterval(this.timer);
      }
    },
    update() {
      this.$emit('update-warnings');
    },
    handleError(error) {
      if (!this.errors.includes(error)) {
        this.errors.push(error);
      }
      console.log(error);
    },
  },
};
</script>

<style scoped lang="scss">
@import "../scss/constants.scss";

::v-deep * {
  box-sizing: border-box;
  -webkit-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;
  font-family: $font-family;
  font-size: $font-size;
  line-height: 1.42857143;
  color: #000;
  background-color: transparent;
  font-weight: normal;

  *:focus {
    outline: dashed 2px $outline-color !important;
    outline-offset: 2px;
    z-index: 1000;
  }

  .bold-text {
    font-weight: bold;
  }

  .noselect {
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Chrome/Safari/Opera */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none; /* Non-prefixed version, currently not supported by any browser */
    cursor: pointer;
  }
}

div#fmi-warnings {
  width: 690px;
  padding-top: 20px;
  margin-bottom: 20px;

  div.container-fluid {
    padding: 0;
    margin: 0;
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
    margin-top: 20px;
    margin-bottom: 20px;
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

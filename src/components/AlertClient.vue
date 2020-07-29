<template>
  <div id="fmi-warnings">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12 col-md-8 col-lg-8 col-xl-8 day-region-views">
          <Days :input="days" />
          <Regions :input="regions" />
        </div>
        <div class="col-12 col-md-4 col-lg-4 col-xl-4 symbol-list">
          <Warnings :input="legend" />
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

export default {
  name: 'AlertClient',
  props: {
    selectedDay: {
      type: Number,
      default: 0,
    },
    warnings: Object,
    days: Array,
    regions: Array,
    legend: Array,
    language: String,
  },
  components: {
    Days,
    Regions,
    Warnings,
  },
  beforeCreate() {
    this.$store.registerModule('warningsStore', module);
    this.$store.commit('Set current time', 1594196573441);
  },
  created() {
    i18n.locale = this.language;
    this.$store.commit('Set selected day', this.selectedDay);
    this.$store.commit('Set visible warnings', this.legend.filter((legendWarning) => legendWarning.visible).map((legendWarning) => legendWarning.type));
    this.$store.commit('Set warnings', this.warnings);
  },
  beforeDestroy() {
    this.$store.unregisterModule('warningsStore');
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
  font-family: "Roboto", sans-serif;
  font-size: 14px;
  font-weight: normal;
  line-height: 1.42857143;
  color: #000;
  background-color: transparent;
  padding: 0;
  margin: 0;

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
  width: 700px;
  margin-bottom: 20px;
}

div.container-fluid {
  padding: 0;
  margin: 0;
}

.row {
  margin-left: 0;
  margin-right: 0;
}

div.day-region-views {
  max-width: $map-large-width;
  width: $map-large-width;
  min-width: $map-large-width;
  padding-left: 0;
  padding-right: 0;
}

div.symbol-list {
  position: -webkit-sticky; /* Safari */
  position: sticky;
  top: 0;
  z-index: 1;
  padding-left: 20px;
  padding-right: 0;
  box-sizing: border-box;
  width: 230px;
  max-width: 230px;
  min-width: 230px;
}

@media (max-width: 767px) {
  div.day-region-views {
    min-width: 100%;
    width: 100%;
    max-width: 100%;
  }
  div.symbol-list {
    position: static;
    padding-left: 0;
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

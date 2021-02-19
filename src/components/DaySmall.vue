<template>
  <div :class="['date-selector-cell', { active: active }]" :aria-label="ariaLabel" >
    <div class="date-selector-cell-header">
      <div :class="`date-selector-text mobile-level-${severity}`">
        <span class="bold-text weekday-text">{{ weekday }}</span>
        <br class="d-inline d-sm-none">
        {{ date }}
      </div>
    </div>
    <div class="date-selector-cell-body map-container">
      <MapSmall :index="index" :input="regions" :geometryId="geometryId" />
    </div>
    <div :class="`date-selector-cell-footer dark-level-${severity}`"></div>
  </div>
</template>

<script>
import MapSmall from './MapSmall.vue';
import i18n from '../i18n';

export default {
  name: 'DaySmall',
  components: {
    MapSmall,
  },
  props: {
    index: {
      type: Number,
    },
    input: {
      type: Object,
      default: () => ({}),
    },
    regions: {
      type: Object,
      default: () => ({}),
    },
    geometryId: {
      type: Number,
    },
    active: {
      type: Boolean,
    },
  },
  computed: {
    weekday() {
      return i18n.t(this.input.weekdayName) || '';
    },
    severity() {
      return this.input.severity;
    },
    date() {
      return ((this.input.day != null) && (this.input.month != null)) ? `${this.input.day}.${this.input.month}.` : '';
    },
    ariaLabel() {
      return `${this.input.weekdayName ? i18n.t(`${this.input.weekdayName}Full`) : ''} ${this.input.day}.${this.input.month}`;
    },
  },
};
</script>

<style scoped lang="scss">
@import "../scss/constants.scss";

div.active div.date-selector-cell-footer {
  background-color: $black;
}

div.date-selector-cell.active .date-selector-cell-footer:after {
  display: inline;
  content: "";
  position: absolute;
  border-left: solid 5px transparent;
  border-right: solid 5px transparent;
  border-top: solid 7px $black;
  top: 4px;
  left: -webkit-calc(50% - 5px);
  left: -moz-calc(50% - 5px);
  left: calc(50% - 5px);
}

.date-selector-cell-footer {
  position: relative;
  background-color: $dark-gray;
  height: 4px;
  margin-bottom: 20px;
}

.date-selector-cell-body {
  height: 130px;
}

div.map-container {
  text-align: center;
  margin-left: 0;
  margin-right: 0;
}

.date-selector-text {
  text-align: center;
  display: table-cell;
  vertical-align: middle;
}

.date-selector-cell-header {
  width: 100%;
  display: table;
  height: 30px;
}

@media (max-width: 575px) {
  .map-small,
  .map-container {
    display: none;
  }

  div.date-selector-cell-header {
    height: 60px !important;
  }

  div.mobile-level-0 {
    background-color: $green !important;
  }

  div.mobile-level-1 {
    background-color: $green !important;
  }

  div.mobile-level-2 {
    background-color: $yellow !important;
  }

  div.mobile-level-3 {
    background-color: $orange !important;
  }

  div.mobile-level-4 {
    background-color: $red !important;
  }
}
</style>

<template>
  <div class="date-selector-cell" :class="{ active: active }">
    <div class="date-selector-cell-header">
      <div :class="`date-selector-text mobile-level-${severity}`">
        <span class="bold-text weekday-text">{{ weekday }}</span>
        {{ date }}
      </div>
    </div>
    <div class="date-selector-cell-body map-container">
      <MapSmall :index="index" />
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
    active: {
      type: Boolean,
    },
  },
  computed: {
    weekday() {
      return i18n.t(this.input.weekdayName);
    },
    severity() {
      return this.input.severity;
    },
    date() {
      return `${this.input.day}.${this.input.month}.`;
    },
  },
};
</script>

<style scoped lang="scss">
@import "../scss/constants.scss";

div.active div.date-selector-cell-footer {
  background-color: $black;
}

div.date-selector-cell.active:after {
  content: "";
  width: 0;
  height: 0;
  position: relative;
  border-left: solid 5px transparent;
  border-right: solid 5px transparent;
  border-top: solid 7px $black;
  left: 0;
  top: 5px;
}

.date-selector-cell-footer {
  background-color: $dark-gray;
  height: 4px;
}

.date-selector-cell-body {
  height: 130px;
}

div.map-container {
  text-align: center;
  background-color: #f8f8f8;
  margin-left: 0;
  margin-right: 0;
  position: relative;
}

.date-selector-text {
  background-color: #f8f8f8;
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

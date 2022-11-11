<template>
  <div
    :class="['date-selector-cell', currentTheme, { active: active }]"
    :aria-label="ariaLabel">
    <div class="date-selector-cell-header">
      <div :class="`date-selector-text mobile-level-${severity}`">
        <span v-if="staticDays" class="bold-text weekday-text">{{
          weekday
        }}</span>
        <br v-if="staticDays" class="d-inline d-sm-none" />
        {{ date }}
      </div>
    </div>
    <div class="date-selector-cell-body map-container">
      <MapSmall :index="index" :input="regions" :geometry-id="geometryId" />
    </div>
    <div :class="`date-selector-cell-footer dark-level-${severity}`"></div>
  </div>
</template>

<script>
import i18n from '../i18n'
import MapSmall from './MapSmall.vue'

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
    staticDays: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    weekday() {
      return i18n.t(this.input.weekdayName) || ''
    },
    severity() {
      return this.input.severity
    },
    date() {
      if (!this.staticDays) {
        return [
          '0...24 h',
          '24...48 h',
          '48...72 h',
          '72...96 h',
          '96...120 h',
        ][this.index]
      }
      return this.input.day != null && this.input.month != null
        ? `${this.input.day}.${this.input.month}.`
        : ''
    },
    ariaLabel() {
      return `${
        this.input.weekdayName ? i18n.t(`${this.input.weekdayName}Full`) : ''
      } ${this.input.day}.${this.input.month}`
    },
    currentTheme() {
      return this.$store.getters.theme
    },
  },
}
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';

div.date-selector-cell {
  &.active {
    &.light div.date-selector-cell-footer {
      background-color: $light-text-color;
      &:after {
        border-top: solid 7px $light-text-color;
      }
    }
    &.dark div.date-selector-cell-footer {
      background-color: $dark-text-color;
      &:after {
        border-top: solid 7px $dark-text-color;
      }
    }

    .date-selector-cell-footer:after {
      display: inline;
      content: '';
      position: absolute;
      border-left: solid 5px transparent;
      border-right: solid 5px transparent;
      top: 4px;
      left: -webkit-calc(50% - 5px);
      left: -moz-calc(50% - 5px);
      left: calc(50% - 5px);
    }
  }

  .date-selector-cell-footer {
    position: relative;
    height: 4px;
    margin-bottom: 20px;
  }

  &.light > .date-selector-cell-footer {
    background-color: $light-date-selector-footer-color;
  }

  &.dark > .date-selector-cell-footer {
    background-color: $dark-date-selector-footer-color;
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
    white-space: nowrap;
  }

  .date-selector-cell-header {
    width: 100%;
    display: table;
    height: 30px;
  }
}

@media (max-width: 575px) {
  .map-small,
  .map-container {
    display: none;
  }

  .light div.date-selector-cell-header * {
    color: $light-date-selector-mobile-text-color !important;
  }

  .dark div.date-selector-cell-header * {
    color: $dark-date-selector-mobile-text-color !important;
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

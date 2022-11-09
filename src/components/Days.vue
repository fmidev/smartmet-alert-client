<template>
  <div class="row date-selector" :class="currentTheme">
    <b-tabs
      id="fmi-warnings-date-selector"
      v-model="selectedDay"
      :lazy="true"
      :no-fade="true"
      nav-class="fmi-warnings-date-nav"
      nav-wrapper-class="fmi-warnings-date-wrapper"
      :justified="true">
      <b-tab
        v-for="(n, i) in numberOfDays"
        :key="i"
        :active="i === selectedDay"
        :title-link-class="['day', `day${i}`]">
        <template #title>
          <DaySmall
            :index="i"
            :input="input[i]"
            :regions="regions[i]"
            :geometry-id="geometryId"
            :active="i === selectedDay"
            :static-days="staticDays" />
        </template>
        <DayLarge
          :index="i"
          :input="input[i]"
          :regions="regions[i]"
          :geometry-id="geometryId"
          :static-days="staticDays" />
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import 'focus-visible'

import DayLarge from './DayLarge.vue'
import DaySmall from './DaySmall.vue'

export default {
  name: 'Days',
  components: {
    DaySmall,
    DayLarge,
  },
  props: {
    input: {
      type: Array,
      default: () => [],
    },
    defaultDay: {
      type: Number,
      default: 0,
      validator(value) {
        return [0, 1, 2, 3, 4].includes(value)
      },
    },
    staticDays: {
      type: Boolean,
      default: true,
    },
    regions: Array,
    geometryId: Number,
  },
  data() {
    return {
      selectedDay: this.defaultDay,
    }
  },
  computed: {
    numberOfDays() {
      return 5
    },
    currentTheme() {
      return this.$store.getters.theme
    },
  },
  watch: {
    selectedDay(newValue) {
      this.$store.dispatch('setSelectedDay', newValue)
    },
  },
}
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';

.date-selector {
  margin: 0;
  &.light {
    background-color: $light-date-selector-background-color;
  }
  &.dark {
    background-color: $dark-date-selector-background-color;
  }
}

.row {
  display: block;
  margin-left: 0;
  margin-right: 0;
}

::v-deep .fmi-warnings-date-nav {
  border-bottom: none;
  flex-wrap: nowrap;
}

::v-deep a.day {
  border-radius: 0;
  border: 0;
  padding: 0;
  margin: 0;
  text-align: center;
  color: transparent;
  &:focus:not([data-focus-visible-added]) {
    outline: none !important;
  }
}

::v-deep a.day.day0 {
  border: none !important;
  div.date-selector-cell {
    > div {
      border-top: none !important;
      border-bottom: none !important;
      border-left: none !important;
      border-right: none !important;
    }
    &.light > div {
      border-right: 1px solid $light-border-color !important;
    }
    &.dark > div {
      border-right: 1px solid $dark-border-color !important;
    }
  }
}

::v-deep a.day.day1,
::v-deep a.day.day2,
::v-deep a.day.day3 {
  border: none !important;
  div.date-selector-cell {
    > div {
      border-top: none !important;
      border-bottom: none !important;
      border-left: none !important;
      border-right: none !important;
    }
    &.light > div {
      border-left: 1px solid $light-border-color !important;
      border-right: 1px solid $light-border-color !important;
    }
    &.dark > div {
      border-left: 1px solid $dark-border-color !important;
      border-right: 1px solid $dark-border-color !important;
    }
  }
}

::v-deep a.day.day4 {
  border: none !important;
  div.date-selector-cell {
    > div {
      border-top: none !important;
      border-bottom: none !important;
      border-left: none !important;
      border-right: none !important;
    }
    &.light > div {
      border-left: 1px solid $light-border-color !important;
    }
    &.dark > div {
      border-left: 1px solid $dark-border-color !important;
    }
  }
}

::v-deep .nav-tabs a.day.nav-link.active {
  background: transparent !important;
}

@media (max-width: 575px) {
  a.day {
    border-bottom: 0;
    border-radius: 0;
    margin-bottom: 0;
  }
}

@media (max-width: 499px) {
  ::v-deep .fmi-warnings-date-wrapper {
    overflow-x: auto;
  }
}
</style>

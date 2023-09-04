<template>
  <div class="row date-selector" :class="theme">
    <b-tabs
      id="fmi-warnings-date-selector"
      v-model="day"
      :lazy="true"
      :no-fade="true"
      nav-class="fmi-warnings-date-nav"
      nav-wrapper-class="fmi-warnings-date-wrapper"
      :justified="true">
      <b-tab
        v-for="(n, i) in numberOfDays"
        :key="i"
        :active="i === day"
        :title-link-class="['day', `day${i}`]">
        <template #title>
          <DaySmall
            :index="i"
            :input="input[i]"
            :visible-warnings="visibleWarnings"
            :warnings="warnings"
            :regions="regions[i]"
            :geometry-id="geometryId"
            :active="i === day"
            :static-days="staticDays"
            :initialized="initialized"
            :theme="theme"
            :language="language" />
        </template>
        <DayLarge
          :index="i"
          :input="input[i]"
          :visible-warnings="visibleWarnings"
          :warnings="warnings"
          :regions="regions[i]"
          :geometry-id="geometryId"
          :static-days="staticDays"
          :time-offset="timeOffset"
          :loading="loading"
          :initialized="initialized"
          :theme="theme"
          :language="language"
          @loaded="onLoaded"
          @initialized="onInitialized" />
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
    visibleWarnings: {
      type: Array,
      default: () => [],
    },
    selectedDay: {
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
    timeOffset: {
      type: Number,
      default: 0,
    },
    warnings: {
      type: Object,
      default: () => {},
    },
    regions: Array,
    geometryId: Number,
    loading: {
      type: Boolean,
      default: false,
    },
    initialized: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String,
      default: 'light',
    },
    language: {
      type: String,
    },
  },
  data() {
    return {
      day: this.selectedDay,
    }
  },
  computed: {
    numberOfDays() {
      return 5
    },
  },
  watch: {
    day(newSelectedDay) {
      this.onDaySelected(newSelectedDay)
    },
  },
  methods: {
    onDaySelected(newSelectedDay) {
      this.$emit('daySelected', newSelectedDay)
    },
    onLoaded(loaded) {
      if (loaded) {
        this.$emit('loaded', true)
      }
    },
    onInitialized(initialized) {
      if (initialized) {
        this.$emit('initialized', true)
      }
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

:deep(.fmi-warnings-date-nav) {
  border-bottom: none;
  flex-wrap: nowrap;
}

:deep(a.day) {
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

:deep(a.day.day0) {
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

:deep(a.day.day1),
:deep(a.day.day2),
:deep(a.day.day3) {
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

:deep(a.day.day4) {
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

:deep(.nav-tabs a.day.nav-link.active) {
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
  :deep(.fmi-warnings-date-wrapper) {
    overflow-x: auto;
  }
}
</style>

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
            :loading="loading"
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
          :theme="theme"
          :language="language"
          @loaded="onLoaded" />
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
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
      default: null,
    },
    regions: Array,
    geometryId: Number,
    loading: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String,
      default: 'light-theme',
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
  },
}
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';

div#fmi-warnings-date-selector.tabs {
  padding: 0;
}

.date-selector {
  margin: 0;
  &.light-theme {
    background-color: $light-date-selector-background-color;
  }
  &.dark-theme {
    background-color: $dark-date-selector-background-color;
  }
  &.light-gray-theme {
    background-color: $gray-date-selector-background-color;
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

:deep(div.fmi-warnings-date-wrapper li.nav-item button.day) {
  width: $day-small-width;
  height: $day-small-height;
  border-radius: 0;
  border: 0;
  padding: 0;
  margin: 0;
  text-align: center;
  color: transparent;
}

:deep(button.day.day0) {
  border: none !important;
  div.date-selector-cell {
    > div {
      border-top: none !important;
      border-bottom: none !important;
      border-left: none !important;
      border-right: none !important;
    }
    &.light-theme > div {
      border-right: 1px solid $light-border-color !important;
    }
    &.dark-theme > div {
      border-right: 1px solid $dark-border-color !important;
    }
    &.light-gray-theme > div {
      border-right: 1px solid $gray-border-color !important;
    }
  }
}

button.day div.date-selector-cell {
  overflow-x: hidden;
}

:deep(button.day.day1),
:deep(button.day.day2),
:deep(button.day.day3) {
  border: none !important;
  div.date-selector-cell {
    > div {
      border-top: none !important;
      border-bottom: none !important;
      border-left: none !important;
      border-right: none !important;
    }
    &.light-theme > div {
      border-left: 1px solid $light-border-color !important;
      border-right: 1px solid $light-border-color !important;
    }
    &.dark-theme > div {
      border-left: 1px solid $dark-border-color !important;
      border-right: 1px solid $dark-border-color !important;
    }
    &.light-gray-theme > div {
      border-left: 1px solid $gray-border-color !important;
      border-right: 1px solid $gray-border-color !important;
    }
  }
}

:deep(button.day.day4) {
  border: none !important;
  div.date-selector-cell {
    > div {
      border-top: none !important;
      border-bottom: none !important;
      border-left: none !important;
      border-right: none !important;
    }
    &.light-theme > div {
      border-left: 1px solid $light-border-color !important;
    }
    &.dark-theme > div {
      border-left: 1px solid $dark-border-color !important;
    }
    &.light-gray-theme > div {
      border-left: 1px solid $gray-border-color !important;
    }
  }
}

:deep(.nav-tabs button.day.nav-link.active) {
  background: transparent !important;
}

:deep(div.tab-content) {
  margin-top: 4px;
}

@media (max-width: 767px) {
  :deep(div.fmi-warnings-date-wrapper li.nav-item button.day) {
    width: 100%;
  }
}

@media (max-width: 575px) {
  :deep(div.fmi-warnings-date-wrapper li.nav-item button.day) {
    border-bottom: 0;
    border-radius: 0;
    margin-bottom: 0;
    height: $day-small-mobile-height;
  }
}
</style>

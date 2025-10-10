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
          :spinner-enabled="spinnerEnabled"
          @loaded="onLoaded" />
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import DayLarge from './DayLarge.vue'
import DaySmall from './DaySmall.vue'
import keycodes from '../mixins/keycodes'

export default {
  name: 'Days',
  mixins: [keycodes],
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
      default: true,
    },
    theme: {
      type: String,
      default: 'light-theme',
    },
    language: {
      type: String,
    },
    spinnerEnabled: {
      type: Boolean,
      default: true,
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
  mounted() {
    const button = Array.from(this.$el.querySelectorAll('button.day')).forEach(
      (button) => {
        button.addEventListener('keydown', this.switchDay, true)
      }
    )
  },
  beforeUnmount() {
    const button = Array.from(this.$el.querySelectorAll('button.day')).forEach(
      (button) => {
        button.removeEventListener('keydown', this.switchDay, true)
      }
    )
  },
  updated() {
    Array.from(this.$el.querySelectorAll('button.day')).forEach((button) => {
      if (button.classList.contains('active')) {
        button.removeAttribute('tabindex')
      } else {
        button.setAttribute('tabindex', -1)
      }
    })
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
    switchDay(event) {
      switch (event.keyCode) {
        case this.KEY_CODE_LEFT:
          this.day = Math.max(this.day - 1, 0)
          event.preventDefault()
          break
        case this.KEY_CODE_RIGHT:
          this.day = Math.min(this.day + 1, 4)
          event.preventDefault()
          break
        case this.KEY_CODE_HOME:
          this.day = 0
          event.preventDefault()
          break
        case this.KEY_CODE_END:
          this.day = 4
          event.preventDefault()
          break
      }
      this.$el.querySelector(`button.day.day${this.day}`).focus()
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
    background-color: $light-gray-date-selector-background-color;
  }
  &.dark-gray-theme {
    background-color: $dark-gray-date-selector-background-color;
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

:deep(button.day div.date-selector-cell) {
  height: $day-small-height;
  overflow: hidden;
}

:deep(button.day) {
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
      border-left: 1px solid $light-gray-border-color !important;
      border-right: 1px solid $light-gray-border-color !important;
    }
    &.dark-gray-theme > div {
      border-left: 1px solid $dark-gray-border-color !important;
      border-right: 1px solid $dark-gray-border-color !important;
    }
  }
}

:deep(button.day.active div.date-selector-cell.active) {
  &.light-theme {
    div.date-selector-cell-header {
      border-top: 2px solid $dark-blue !important;
    }
    > div {
      border-left: 2px solid $dark-blue !important;
      border-right: 2px solid $dark-blue !important;
    }
  }
  &.dark-theme {
    div.date-selector-cell-header {
      border-top: 2px solid $white !important;
    }
    > div {
      border-left: 2px solid $white !important;
      border-right: 2px solid $white !important;
    }
  }
  &.light-gray-theme {
    div.date-selector-cell-header {
      border-top: 2px solid $black !important;
    }
    > div {
      border-left: 2px solid $black !important;
      border-right: 2px solid $black !important;
    }
  }
  &.dark-gray-theme {
    div.date-selector-cell-header {
      border-top: 2px solid $white !important;
    }
    > div {
      border-left: 2px solid $white !important;
      border-right: 2px solid $white !important;
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

@media (width < 576px) {
  :deep(div.fmi-warnings-date-wrapper li.nav-item button.day) {
    border-bottom: 0;
    border-radius: 0;
    margin-bottom: 0;
    height: $day-small-mobile-height;
  }

  :deep(button.day div.date-selector-cell) {
    height: $day-small-mobile-height;
  }

}
</style>

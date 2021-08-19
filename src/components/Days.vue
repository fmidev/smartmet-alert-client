<template>
  <div class="row date-selector">
    <b-tabs
      v-model="selectedDay"
      id="fmi-warnings-date-selector"
      :lazy="true"
      :no-fade="true"
      nav-class="fmi-warnings-date-nav"
      nav-wrapper-class="fmi-warnings-date-wrapper"
      :justified="true"
    >
      <b-tab
        v-for="(n, i) in numberOfDays"
        :key="i"
        :active="i === selectedDay"
        :title-link-class="['day', `day${i}`]"
      >
        <template v-slot:title>
          <DaySmall :index="i" :input="input[i]" :regions="regions[i]" :geometryId="geometryId" :active="i === selectedDay" :staticDays="staticDays" />
        </template>
        <DayLarge :index="i" :input="input[i]" :regions="regions[i]" :geometryId="geometryId" :staticDays="staticDays" />
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import 'focus-visible';
import DaySmall from './DaySmall.vue';
import DayLarge from './DayLarge.vue';

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
        return [0, 1, 2, 3, 4].includes(value);
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
    };
  },
  watch: {
    selectedDay(newValue) {
      this.$store.dispatch('setSelectedDay', newValue);
    },
  },
  computed: {
    numberOfDays() {
      return 5;
    },
  },
};
</script>

<style scoped lang="scss">
@import "../scss/constants.scss";

.date-selector {
  background-color: $light-gray;
  margin: 0;
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

::v-deep .fmi-warnings-date-wrapper {
  overflow-x: auto;
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
  div.date-selector-cell > div {
    border-top: none !important;
    border-bottom: none !important;
    border-right: 1px solid $white !important;
    border-left: none !important;
  }
}

::v-deep a.day.day1,
::v-deep a.day.day2,
::v-deep a.day.day3 {
  border: none !important;
  div.date-selector-cell > div {
    border-top: none !important;
    border-bottom: none !important;
    border-left: 1px solid $white !important;
    border-right: 1px solid $white !important;
  }
}

::v-deep a.day.day4 {
  border: none !important;
  div.date-selector-cell > div {
    border-top: none !important;
    border-bottom: none !important;
    border-left: 1px solid $white !important;
    border-right: none !important;
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
</style>

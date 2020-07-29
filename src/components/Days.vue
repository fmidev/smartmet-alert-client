<template>
  <div class="row date-selector">
    <b-tabs
      v-model="selectedDay"
      id="fmi-warnings-date-selector"
      :no-fade="true"
      nav-class="fmi-warnings-date-nav"
      justified
    >
      <b-tab
        v-for="(n, i) in numberOfDays"
        :key="i"
        :active="i === selectedDay"
        :title-link-class="['day', `day${i}`]"
      >
        <template v-slot:title>
          <DaySmall :index="i" :input="input[i]" :active="i === selectedDay" />
        </template>
        <DayLarge :index="i" :input="input[i]" />
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import DaySmall from './DaySmall.vue';
import DayLarge from './DayLarge.vue';

export default {
  name: 'Days',
  components: {
    DaySmall,
    DayLarge,
  },
  props: ['input'],
  data() {
    return {
      selectedDay: 0,
    };
  },
  watch: {
    selectedDay(newValue) {
      this.$store.commit('Set selected day', newValue);
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
  background-color: #f8f8f8;
  margin: 0;
}

.row {
  display: block;
  margin-left: 0;
  margin-right: 0;
}

::v-deep .fmi-warnings-date-nav {
  border-bottom: none;
}

::v-deep a.day {
  background-color: #f8f8f8 !important;
  border-radius: 0;
  border: 0;
  padding: 0;
  margin: 0;
  outline: none;
  text-align: center;
  color: transparent;
}

::v-deep a.day.day0 {
  border-top: none !important;
  border-bottom: none !important;
  border-right: 1px solid $white !important;
  border-left: none !important;
}

::v-deep a.day.day1,
::v-deep a.day.day2,
::v-deep a.day.day3 {
  border-top: none !important;
  border-bottom: none !important;
  border-left: 1px solid $white !important;
  border-right: 1px solid $white !important;
}

::v-deep a.day.day4 {
  border-top: none !important;
  border-bottom: none !important;
  border-left: 1px solid $white !important;
  border-right: none !important;
}

@media (max-width: 575px) {
  a.day {
    border-bottom: 0;
    border-radius: 0;
    margin-bottom: 0;
  }
}
</style>

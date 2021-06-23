<template>
  <div class="map-container">
    <div class="warning-map-status" aria-hidden="true">
      <p>
        <span class="bold-text">{{ warnings }}</span
        ><br />
        <span v-html="warningsDate"></span>
      </p>
      <p>
        <span class="bold-text">{{ updated }}</span
        ><br />
        {{ updatedDate }}<br />
        {{ atTime }} {{ updatedTime }}
      </p>
    </div>
    <div class="data-providers noselect" aria-hidden="true">
      <span>{{ dataProviderFirst }}</span
      ><br />
      <span>{{ dataProviderSecond }}</span>
    </div>
    <MapLarge :index="index" :input="regions" :geometryId="geometryId" />
  </div>
</template>

<script>
import spacetime from 'spacetime';
import i18n from '../i18n';
import MapLarge from './MapLarge.vue';

export default {
  name: 'DayLarge',
  components: { MapLarge },
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
    },
    geometryId: {
      type: Number,
    },
    staticDays: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    warnings() {
      return i18n.t('warnings') || '';
    },
    updated() {
      return i18n.t('updated') || '';
    },
    atTime() {
      return i18n.t('atTime') || '';
    },
    warningsDate() {
      if ((this.input.day == null) || (this.input.month == null) || (this.input.year == null)) {
        return '';
      }
      if (this.staticDays) {
        return `${this.input.day}.${this.input.month}.${this.input.year}`;
      }
      const date = spacetime([this.input.year, this.input.month - 1, this.input.day], this.timezone);
      const nextDate = date.add(1, 'day');
      const offset = this.$store.getters.timeOffset;
      const offsetDate = date.add(offset, 'milliseconds');
      const hours = offsetDate.hour();
      const minutes = (`0${offsetDate.minute()}`).slice(-2);
      return `${this.input.day}.${this.input.month}.${this.input.year} ${this.atTime} ${hours}:${minutes} -
      <br> ${nextDate.date()}.${nextDate.month() + 1}.${nextDate.year()} ${this.atTime} ${hours}:${minutes}`;
    },
    updatedDate() {
      return this.input.updatedDate || '';
    },
    updatedTime() {
      return this.input.updatedTime || '';
    },
    dataProviderFirst() {
      return i18n.t('dataProviderFirst');
    },
    dataProviderSecond() {
      return i18n.t('dataProviderSecond');
    },
  },
};
</script>

<style scoped lang="scss">
@import "../scss/constants.scss";

div,
span {
  background-color: rgba(0, 0, 0, 0);
}

p {
  background: transparent;
  margin: 0 0 10px;
  padding: 0;
  white-space: normal !important;
}

br {
  white-space: normal;
}

div.map-container {
  text-align: center;
  margin-left: 0;
  margin-right: 0;
  position: relative;
  max-height: $map-large-height;
  background: transparent;
  top: 0;
}

div.warning-map-status {
  position: absolute;
  margin-left: 15px;
  text-align: left;
  z-index: 6;
  pointer-events: none;
}

div.data-providers {
  position: absolute;
  bottom: 4px;
  right: 16px;
  text-align: left;
  z-index: 5;
  pointer-events: none;
}

@media screen and (orientation:landscape) {
  div.map-container {
    height: $map-large-height;
  }
}

</style>

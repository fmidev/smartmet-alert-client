<template>
  <div class="map-container">
    <div class="warning-map-status">
      <p>
        <span class="bold-text">{{ warnings }}</span
        ><br />
        {{ warningsDate }}
      </p>
      <p>
        <span class="bold-text">{{ updated }}</span
        ><br />
        {{ updatedDate }}<br />
        {{ atTime }} {{ updatedTime }}
      </p>
    </div>
    <div class="data-providers noselect">
      <span>{{ dataProviderFirst }}</span
      ><br />
      <span>{{ dataProviderSecond }}</span>
    </div>
    <MapLarge :index="index" :input="regions" />
  </div>
</template>

<script>
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
      default: () => ({}),
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
      return ((this.input.day != null) && (this.input.month != null) && (this.input.year != null)) ? `${this.input.day}.${this.input.month}.${this.input.year}` : '';
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
  background: #f8f8f8;
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
  height: $map-large-height;
  background: transparent;
  top: 0;
}

div.warning-map-status {
  position: absolute;
  margin-left: 15px;
  text-align: left;
  z-index: 6;
}

div.data-providers {
  position: absolute;
  bottom: 12px;
  right: 16px;
  text-align: left;
  z-index: 5;
}
</style>

<template>
  <div class="map-container">
    <div class="warning-map-status" aria-hidden="true">
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
    <div class="data-providers noselect" aria-hidden="true">
      <span>{{ dataProviderFirst }}</span
      ><br />
      <span>{{ dataProviderSecond }}</span>
    </div>
    <MapLarge :index="index" :input="regions" :aria-label="mapAriaLabel" />
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
    mapAriaLabel() {
      return i18n.t('mapAriaLabel') || '';
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
}

div.data-providers {
  position: absolute;
  bottom: 4px;
  right: 16px;
  text-align: left;
  z-index: 5;
}

@media screen and (orientation:landscape) {
  div.map-container {
    height: $map-large-height;
  }
}

</style>

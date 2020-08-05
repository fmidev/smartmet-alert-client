<template>
  <div class="map-large">
    <div
      class="day-map-large"
      :style="{
        width: '440px',
        height: '550px',
        //        borderTop: '10px solid transparent',
        backgroundImage: 'url(../tmp/map' + index + '.png)'
      }"
    ></div>
  </div>
</template>

<script>
import i18n from '../i18n';

export default {
  name: 'MapLarge',
  props: ['index'],
  computed: {
    warnings() {
      return i18n.t('warnings');
    },
  },

  data: () => ({
    warningsDate: null,
    updated: null,
    updatedDate: null,
    atTime: null,
    updatedTime: null,
    dataProviderFirst: null,
    dataProviderSecond: null,
  }),
};
</script>

<style scoped lang="scss">
@import "../scss/constants.scss";

div.map-large {
  display: inline-block;
  width: $map-large-width;
  height: $map-large-height;
  background-color: rgba(0, 0, 0, 0);
}
div.day-map-large {
  height: 100%;
}

@media (max-width: 767px) {
  div.map-large {
    min-width: 100%;
    width: 100%;
    max-width: 100%;
  }
}
</style>

<template>
  <div class="map-large">
    <div class="day-map-large">
      <img src="../assets/img/ui/finland.svg" alt="" />
    </div>
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
    warningsDate: '',
    updated: '',
    updatedDate: '',
    atTime: '',
    updatedTime: '',
    dataProviderFirst: '',
    dataProviderSecond: '',
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

@media (max-width: 767px) {
  div.map-large {
    min-width: 100%;
    width: 100%;
    max-width: 100%;
  }
}
</style>

<template>
  <div :id="`day-map-small-${index}`" class="map-small">
    <img src="../assets/img/ui/finland-small.svg" alt="" />
  </div>
</template>

<script>
export default {
  name: 'MapSmall',
  props: ['index'],
};
</script>

<style scoped lang="scss">
@import "../scss/constants.scss";

div.map-small {
  position: relative;
  top: 0;
  display: inline-block;
  width: $map-small-width !important;
  height: $map-small-height !important;
  .day-map-small-base-0 {
    width: $map-small-width !important;
    height: $map-small-height !important;
    .ol-viewport {
      width: $map-small-width !important;
      height: $map-small-height !important;
    }
  }
  .day-map-small-base-1 {
    width: $map-small-width !important;
    height: $map-small-height !important;
    .ol-viewport {
      width: $map-small-width !important;
      height: $map-small-height !important;
    }
  }
  .day-map-small-base-2 {
    width: $map-small-width !important;
    height: $map-small-height !important;
    .ol-viewport {
      width: $map-small-width !important;
      height: $map-small-height !important;
    }
  }
  .day-map-small-base-3 {
    width: $map-small-width !important;
    height: $map-small-height !important;
    .ol-viewport {
      width: $map-small-width !important;
      height: $map-small-height !important;
    }
  }
  .day-map-small-base-4 {
    width: $map-small-width !important;
    height: $map-small-height !important;
    .ol-viewport {
      width: $map-small-width !important;
      height: $map-small-height !important;
    }
  }
}

*[id^="day-map-small-base-"] {
  height: 100%;
}

@media (max-width: 575px) {
  #fmi-day-small-view .map-small,
  #fmi-day-small-view .map-container {
    display: none;
  }
}
</style>

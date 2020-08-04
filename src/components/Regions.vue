<template>
  <div class="row">
    <h5 v-if="anyLandWarnings" id="header-land" class="header-region">{{ landText }}</h5>
    <div id="accordion-land" class="accordion-region" role="tablist">
        <div v-for="region in this.regions.land" :key="region.key" >
            <Region v-if="region.warnings.length" type="land" :code="region.key" :name="region.name" :input="region.warnings" />
        </div>
    </div>
    <h5 v-if="anySeaWarnings" id="header-sea" class="header-region">{{ seaText }}</h5>
    <div id="accordion-sea" class="accordion-region" role="tablist">
        <div v-for="region in this.regions.sea" :key="region.key" >
            <Region v-if="region.warnings.length" type="land" :code="region.key" :name="region.name" :input="region.warnings" />
        </div>
    </div>
  </div>
</template>

<script>
import i18n from '../i18n';
import Region from './Region.vue';

export default {
  name: 'Regions',
  components: { Region },
  props: ['input'],
  computed: {
    landText() {
      return i18n.t('regionLand');
    },
    seaText() {
      return i18n.t('regionSea');
    },
    regions() {
      return this.input[this.selectedDay];
    },
    selectedDay() {
      return this.$store.getters.selectedDay;
    },
    anyLandWarnings() {
      return this.anyRegionWarnings('land');
    },
    anySeaWarnings() {
      return this.anyRegionWarnings('sea');
    },
  },
  methods: {
    anyRegionWarnings(region) {
      return ((this.input.length > 0) && (this.input[this.selectedDay][region].reduce((numObjKeys, warning) => numObjKeys + Object.keys(warning).length, 0) > 0));
    },
  },
};
</script>

<style scoped lang="scss">
  @import "../scss/constants.scss";

h5 {
  width: 100%;
  font-weight: bold;
  margin-top: 15px;
  margin-left: 15px;
  &.symbol-list-title {
    margin-left: -15px;
  }
}

h5#header-land,
h5#header-sea {
  margin-left: 0;
}

div.accordion-region {
  width: 100%;
}

h5.header-region {
    font-size: 14px;
    font-weight: bold;
    line-height: 1.1;
    margin-top: 15px;
    margin-bottom: 10px;
}

</style>

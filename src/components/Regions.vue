<template>
  <div class="row">
    <h2 v-if="anyLandWarnings" id="header-land" class="header-region">{{ landText }}</h2>
    <div id="accordion-land" class="accordion-region" role="tablist">
        <div v-for="region in this.regions.land" :key="region.key" >
            <Region v-if="region.warnings.length" type="land" :code="region.key" :name="region.name" :input="region.warnings" />
        </div>
    </div>
    <h2 v-if="anySeaWarnings" id="header-sea" class="header-region">{{ seaText }}</h2>
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
import config from '../mixins/config';
import utils from '../mixins/utils';

export default {
  name: 'Regions',
  components: { Region },
  props: ['input'],
  mixins: [config, utils],
  computed: {
    landText() {
      return i18n.t('regionLand');
    },
    seaText() {
      return i18n.t('regionSea');
    },
    overriddenRegions() {
      return this.$store.getters.overriddenRegions;
    },
    regions() {
      const overriddenRegions = this.overriddenRegions;
      const overriddenIds = Object.keys(overriddenRegions).filter((regionId) => overriddenRegions[regionId][this.selectedDay]);
      return [this.REGION_LAND, this.REGION_SEA].reduce((regionData, regionType) => {
        // eslint-disable-next-line no-param-reassign
        regionData[regionType] = this.input[this.selectedDay][regionType].reduce((regions, region) => {
          const parentId = this.geometries[region.key].parent;
          if ((!overriddenIds.includes(region.key)) && ((!parentId) || (overriddenIds.includes(parentId)))) {
            regions.push(region);
          }
          return regions;
        }, []);
        return regionData;
      }, {});
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

h2 {
  width: 100%;
  font-weight: bold;
  margin-top: 15px;
  margin-left: 15px;
  &.symbol-list-title {
    margin-left: -15px;
  }
  color: black;
}

h2#header-land,
h2#header-sea {
  margin-left: 0;
}

div.accordion-region {
  width: 100%;
}

h2.header-region {
    font-size: 14px;
    font-weight: bold;
    line-height: 1.1;
    margin-top: 15px;
    margin-bottom: 10px;
}

</style>

<template>
  <div id="region-warnings" class="row">
    <div v-if="anyLandWarnings" class="region-type-container">
      <h2 id="header-land" class="header-region">{{ landText }}</h2>
      <a :href="fromLandToNextContentHref" tabindex="0" id="fmi-warnings-region-content" class="fmi-warnings-to-next-content sr-only sr-only-focusable">{{
          fromLandtoNextContentText
      }}</a>
      <div id="accordion-land" class="accordion-region" role="tablist">
          <div v-for="region in this.regions.land" :key="region.key" >
              <Region v-if="region.warnings.length" type="land" :code="region.key" :name="region.name" :input="region.warnings" />
          </div>
      </div>
    </div>
    <div v-if="anySeaWarnings" class="region-type-container">
      <h2 id="header-sea" class="header-region">{{ seaText }}</h2>
      <a href="#fmi-warnings-end-of-regions" tabindex="0" :id="fromSeaToNextContentId" class="fmi-warnings-to-next-content sr-only sr-only-focusable">{{
          fromSeatoNextContentText
      }}</a>
      <div id="accordion-sea" class="accordion-region" role="tablist">
          <div v-for="region in this.regions.sea" :key="region.key" >
              <Region v-if="region.warnings.length" type="land" :code="region.key" :name="region.name" :input="region.warnings" />
          </div>
      </div>
    </div>
    <div id="fmi-warnings-end-of-regions"></div>
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
  props: {
    input: Array,
    parents: Object,
    geometryId: Number,
  },
  mixins: [config, utils],
  computed: {
    landText() {
      return i18n.t('regionLand');
    },
    seaText() {
      return i18n.t('regionSea');
    },
    fromLandtoNextContentText() {
      return this.regions.land.length + i18n.t('toNextContent');
    },
    fromSeatoNextContentText() {
      return this.regions.sea.length + i18n.t('toNextContent');
    },
    fromLandToNextContentHref() {
      return this.anySeaWarnings ? '#fmi-warnings-from-sea-to-next-content' : '#fmi-warnings-end-of-regions';
    },
    fromSeaToNextContentId() {
      return this.anyLandWarnings ? 'fmi-warnings-from-sea-to-next-content' : 'fmi-warnings-region-content';
    },
    regions() {
      const compareRegions = (region1, region2) => region1.regionIndex - region2.regionIndex;
      const overriddenRegions = this.parents;
      const overriddenIds = Object.keys(overriddenRegions).filter((regionId) => overriddenRegions[regionId][this.selectedDay]);
      return [this.REGION_LAND, this.REGION_SEA].reduce((regionData, regionType) => {
        // eslint-disable-next-line no-param-reassign
        regionData[regionType] = this.input[this.selectedDay][regionType].reduce((regions, region) => {
          const parentId = this.geometries[this.geometryId][region.key].parent;
          if ((!overriddenIds.includes(region.key)) && ((!parentId) || (overriddenIds.includes(parentId))) && (region.warnings.some((warning) => warning.coverage >= this.coverageCriterion))) {
            regions.push(region);
          }
          return regions;
        }, []);
        regionData[regionType].sort(compareRegions);
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
    anyRegionWarnings(regionType) {
      return ((this.regions != null) && (this.regions[regionType] != null) && (this.regions[regionType].length > 0));
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
  margin-top: 10px;
}

h2.header-region {
    font-size: $font-size;
    font-weight: bold;
    line-height: 1.1;
    margin-top: 15px;
    margin-bottom: 5px;
}

div.region-type-container {
  width: 100%;
}

</style>

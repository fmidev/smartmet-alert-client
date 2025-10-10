<template>
  <div id="region-warnings" class="row">
    <div v-if="anyLandWarnings" class="region-type-container">
      <h3 id="header-land" class="header-region">{{ landText }}</h3>
      <a
        id="fmi-warnings-region-content"
        :href="fromLandToNextContentHref"
        tabindex="0"
        class="fmi-warnings-to-next-content visually-hidden-focusable focus-ring"
        @click="fromLandToNextContentClicked"
        >{{ fromLandToNextContentText }}</a
      >
      <div id="accordion-group-land" class="accordion">
        <div v-for="region in regions.land" :key="region.key">
          <Region
            v-if="region.warnings.length"
            type="land"
            :code="region.key"
            :name="region.name"
            :input="region.warnings"
            :warnings="warnings"
            :theme="theme"
            :language="language" />
        </div>
      </div>
    </div>

    <div v-if="anySeaWarnings" class="region-type-container">
      <h3 id="header-sea" class="header-region">{{ seaText }}</h3>
      <a
        :id="fromSeaToNextContentId"
        href="#fmi-warnings-end-of-regions"
        tabindex="0"
        class="fmi-warnings-to-next-content visually-hidden-focusable focus-ring"
        @click="fromSeaToNextContentClicked"
        >{{ fromSeaToNextContentText }}</a
      >
      <div id="accordion-group-sea" class="accordion">
        <div v-for="region in regions.sea" :key="region.key">
          <Region
            v-if="region.warnings.length"
            type="sea"
            :code="region.key"
            :name="region.name"
            :input="region.warnings"
            :warnings="warnings"
            :theme="theme"
            :language="language" />
        </div>
      </div>
    </div>
    <div id="fmi-warnings-end-of-regions"></div>
  </div>
</template>

<script>
import config from '../mixins/config'
import i18n from '../mixins/i18n'
import utils from '../mixins/utils'
import Region from './Region.vue'

export default {
  name: 'Regions',
  components: { Region },
  mixins: [config, i18n, utils],
  props: {
    input: Array,
    selectedDay: Number,
    warnings: {
      type: Object,
      default: null,
    },
    parents: Object,
    geometryId: Number,
    theme: String,
    language: String,
  },
  computed: {
    landText() {
      return this.t('regionLand')
    },
    seaText() {
      return this.t('regionSea')
    },
    fromLandToNextContentText() {
      return `${this.t('warningsInAreasStart')} ${
        this.t(`in${this.regions.land.length}Areas`)
      }. ${this.t('toNextContent')}`
    },
    fromSeaToNextContentText() {
      return `${this.t('warningsInAreasStart')} ${
        this.t(`in${this.regions.sea.length}Areas`)
      }. ${this.t('toNextContent')}`
    },
    fromLandToNextContentHref() {
      return this.anySeaWarnings
        ? '#fmi-warnings-from-sea-to-next-content'
        : '#fmi-warnings-end-of-regions'
    },
    fromSeaToNextContentId() {
      return this.anyLandWarnings
        ? 'fmi-warnings-from-sea-to-next-content'
        : 'fmi-warnings-region-content'
    },
    regions() {
      const compareRegions = (region1, region2) =>
        region1.regionIndex - region2.regionIndex
      const overriddenRegions = this.parents
      const overriddenIds = Object.keys(overriddenRegions).filter(
        (regionId) => overriddenRegions[regionId][this.selectedDay]
      )
      return [this.REGION_LAND, this.REGION_SEA].reduce(
        (regionData, regionType) => {
          // eslint-disable-next-line no-param-reassign
          regionData[regionType] = this.input[this.selectedDay][
            regionType
          ].reduce((regions, region) => {
            const parentId = this.geometries[this.geometryId][region.key].parent
            if (
              !overriddenIds.includes(region.key) &&
              (!parentId || overriddenIds.includes(parentId)) &&
              region.warnings.some(
                (warning) => warning.coverage >= this.coverageCriterion
              )
            ) {
              regions.push(region)
            }
            return regions
          }, [])
          regionData[regionType].sort(compareRegions)
          return regionData
        },
        {}
      )
    },
    anyLandWarnings() {
      return this.anyRegionWarnings('land')
    },
    anySeaWarnings() {
      return this.anyRegionWarnings('sea')
    },
  },
  methods: {
    anyRegionWarnings(regionType) {
      return (
        this.regions != null &&
        this.regions[regionType] != null &&
        this.regions[regionType].length > 0
      )
    },
    fromLandToNextContentClicked() {
      const nextContent = this.$el.querySelector(this.fromLandToNextContentHref)
      nextContent.scrollIntoView()
      nextContent.focus()
    },
    fromSeaToNextContentClicked() {
      const nextContent = this.$el.querySelector('#fmi-warnings-end-of-regions')
      nextContent.scrollIntoView()
      nextContent.focus()
    },
  },
}
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';

h3 {
  width: 100%;
  font-weight: bold;
  margin-top: 15px;
  margin-left: 15px;
  &.symbol-list-title {
    margin-left: -15px;
  }
  color: black;
}

h3#header-land,
h3#header-sea {
  margin-left: 0;
}

div.accordion-region {
  width: 100%;
  margin-top: 10px;
}

h3.header-region {
  text-align: left;
  font-size: $font-size;
  font-weight: bold;
  line-height: 1.1;
  margin-top: 15px;
  margin-bottom: 5px;
}

div.region-type-container {
  width: 100%;
  padding: 0;
}

div.accordion {
  margin: 0;
  border: 0.5px solid $variant-gray-darker;
  border-radius: 0;
  > * + * {
    border-top: 0.5px solid $variant-gray-darker;
  }
}
</style>

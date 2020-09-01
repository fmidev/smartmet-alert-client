<template>
    <div :id="`day-map-small-${index}`" class="map-small">
        <svg xmlns="http://www.w3.org/2000/svg" version="1.2" baseProfile="tiny" width="75" height="120"
             viewBox="0 0 75 120" stroke-linecap="round" stroke-linejoin="round">
            <g :id="`finland-small-${index}`">
                <path v-for="path in paths" :key="path.key" stroke="#000000" stroke-width="0.5"
                      :fill="path.fill" :d="path.d" :opacity="path.opacity"/>
                <path v-for="coverage in coverages" :key="coverage.key" stroke="#000000"
                      :stroke-width="coverage.strokeWidth" :fill="coverage.fill" :d="coverage.d"
                      :opacity="coverage.opacity" pointer-events="fill"/>
            </g>
        </svg>
    </div>
</template>

<script>
import config from '../mixins/config';
import utils from '../mixins/utils';

export default {
  name: 'MapSmall',
  props: {
    index: {
      type: Number,
    },
    input: {
      type: Object,
      default: () => ({}),
    },
  },
  mixins: [config, utils],
  data() {
    return {
      coverageRegions: {},
      coverageWarnings: [],
    };
  },
  computed: {
    paths() {
      return this.regionIds.reduce((regions, regionId) => {
        if (this.geometries[regionId].pathSmall) {
          const visualization = this.regionVisualization(regionId);
          regions.push({
            key: `small-${this.index}-${regionId}`,
            fill: visualization.color,
            d: visualization.geom.pathSmall,
            opacity: visualization.visible ? '1' : '0',
          });
        }
        return regions;
      }, []);
    },
    coverages() {
      return this.coverageGeom('coveragesSmall');
    },
  },
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

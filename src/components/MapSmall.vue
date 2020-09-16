<template>
    <div :id="`day-map-small-${index}`" class="map-small">
        <svg xmlns="http://www.w3.org/2000/svg" version="1.2" baseProfile="tiny" width="75" height="120"
             viewBox="0 0 75 120" stroke-linecap="round" stroke-linejoin="round">
            <g :id="`finland-small-${index}`">
                <path v-for="path in paths" :key="path.key" stroke="#000000" :stroke-width=path.strokeWidth
                      :fill="path.fill" :d="path.d" :opacity="path.opacity"/>
                <path v-for="coverage in coverages" :key="coverage.key" stroke="#000000"
                      :stroke-width="coverage.strokeWidth" :fill="coverage.fill" :d="coverage.d"
                      :opacity="coverage.opacity" pointer-events="fill"/>
                <path v-for="path in this.overlayPaths" :key="path.key" stroke="#000000" :stroke-width="path.strokeWidth"
                      :d="path.d" fill-opacity=0 />
            </g>
        </svg>
    </div>
</template>

<script>
import { vueWindowSizeMixin } from 'vue-window-size';
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
  mixins: [config, utils, vueWindowSizeMixin],
  data() {
    return {
      coverageRegions: {},
      coverageWarnings: [],
      pathsNeeded: false,
    };
  },
  watch: {
    windowWidth() {
      this.pathsNeeded = this.isFullMode();
    },
    input() {
      this.coverageRegions = {};
      this.coverageWarnings = [];
    },
  },
  computed: {
    size() {
      return 'Small';
    },
    paths() {
      return this.pathsNeeded ? this.regionIds.reduce((regions, regionId) => {
        if (this.geometries[regionId].pathSmall) {
          const visualization = this.regionVisualization(regionId);
          regions.push({
            key: `${this.index}-${regionId}${this.size}`,
            fill: visualization.color,
            d: visualization.geom.pathSmall,
            opacity: visualization.visible ? '1' : '0',
            strokeWidth: ((this.geometries[regionId].type === 'sea') &&
              (this.geometries[regionId].subType !== 'lake')) ? this.strokeWidth : 0,
          });
        }
        return regions;
      }, []) : [];
    },
    strokeWidth() {
      return 0.4;
    },
    coverages() {
      return this.coverageGeom('coveragesSmall');
    },
  },
  mounted() {
    this.pathsNeeded = this.isFullMode();
  },
  methods: {
    isFullMode() {
      if (!this.isClientSide()) {
        return true;
      }
      const element = document.getElementById(`day-map-small-${this.index}`);
      return ((element != null) && (element.offsetParent !== null));
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

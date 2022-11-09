<template>
  <div :id="`day-map-small-${index}`" class="map-small">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      version="1.2"
      baseProfile="tiny"
      width="75"
      height="120"
      viewBox="0 0 75 120"
      stroke-linecap="round"
      stroke-linejoin="round">
      <g :id="`finland-small-${index}`">
        <path
          v-for="path in bluePaths"
          :key="path.key"
          stroke="#000000"
          :stroke-width="path.strokeWidth"
          :fill="path.fill"
          :d="path.d"
          :opacity="path.opacity" />
        <path
          v-for="path in greenPaths"
          :key="path.key"
          stroke="#000000"
          :stroke-width="path.strokeWidth"
          :fill="path.fill"
          :d="path.d"
          :opacity="path.opacity" />
        <path
          v-for="path in yellowPaths"
          :key="path.key"
          stroke="#000000"
          :stroke-width="path.strokeWidth"
          :fill="path.fill"
          :d="path.d"
          :opacity="path.opacity" />
        <path
          v-for="coverage in yellowCoverages"
          :key="coverage.key"
          stroke="#000000"
          :stroke-width="coverage.strokeWidth"
          :fill="coverage.fill"
          :d="coverage.d"
          :fill-opacity="coverage.fillOpacity"
          pointer-events="fill" />
        <path
          v-for="path in orangePaths"
          :key="path.key"
          stroke="#000000"
          :stroke-width="path.strokeWidth"
          :fill="path.fill"
          :d="path.d"
          :opacity="path.opacity" />
        <path
          v-for="coverage in orangeCoverages"
          :key="coverage.key"
          stroke="#000000"
          :stroke-width="coverage.strokeWidth"
          :fill="coverage.fill"
          :d="coverage.d"
          :fill-opacity="coverage.fillOpacity"
          pointer-events="fill" />
        <path
          v-for="path in redPaths"
          :key="path.key"
          stroke="#000000"
          :stroke-width="path.strokeWidth"
          :fill="path.fill"
          :d="path.d"
          :opacity="path.opacity" />
        <path
          v-for="coverage in redCoverages"
          :key="coverage.key"
          stroke="#000000"
          :stroke-width="coverage.strokeWidth"
          :fill="coverage.fill"
          :d="coverage.d"
          :fill-opacity="coverage.fillOpacity"
          pointer-events="fill" />
        <path
          v-for="path in overlayPaths"
          :key="path.key"
          stroke="#000000"
          :stroke-width="path.strokeWidth"
          :d="path.d"
          fill-opacity="0" />
        <path
          v-for="coverage in overlayCoverages"
          :key="coverage.key"
          stroke="#000000"
          :stroke-width="coverage.strokeWidth"
          :fill="coverage.fill"
          :d="coverage.d"
          :fill-opacity="coverage.fillOpacity"
          pointer-events="fill" />
      </g>
    </svg>
  </div>
</template>

<script>
import { vueWindowSizeMixin } from 'vue-window-size'

import config from '../mixins/config'
import utils from '../mixins/utils'

export default {
  name: 'MapSmall',
  mixins: [config, utils, vueWindowSizeMixin],
  props: {
    index: {
      type: Number,
    },
    input: {
      type: Object,
      default: () => ({}),
    },
    geometryId: {
      type: Number,
    },
  },
  data() {
    return {
      coverageRegions: {},
      coverageWarnings: [],
      pathsNeeded: false,
    }
  },
  computed: {
    size() {
      return 'Small'
    },
    strokeWidth() {
      return 0.4
    },
  },
  watch: {
    windowWidth() {
      this.pathsNeeded = this.isFullMode()
    },
    input() {
      this.coverageRegions = {}
      this.coverageWarnings = []
    },
  },
  mounted() {
    this.pathsNeeded = this.isFullMode()
  },
  methods: {
    paths(options) {
      return this.pathsNeeded
        ? this.regionIds.reduce((regions, regionId) => {
            if (
              this.geometries[this.geometryId][regionId].pathSmall &&
              (this.geometries[this.geometryId][regionId].type ===
                options.type) ===
                (this.geometries[this.geometryId][regionId].subType == null)
            ) {
              const visualization = this.regionVisualization(regionId)
              if (
                options.severity == null ||
                visualization.severity === options.severity
              ) {
                regions.push({
                  key: `${regionId}${this.size}${this.index}Path`,
                  fill: this.initialized
                    ? visualization.color
                    : this.colors.missing,
                  d: visualization.geom.pathSmall,
                  opacity: visualization.visible ? '1' : '0',
                  strokeWidth:
                    this.geometries[this.geometryId][regionId].type === 'sea' &&
                    this.geometries[this.geometryId][regionId].subType !==
                      'lake'
                      ? this.strokeWidth
                      : 0,
                })
              }
            }
            return regions
          }, [])
        : []
    },
    isFullMode() {
      if (!this.isClientSide()) {
        return true
      }
      const element = document.getElementById(`day-map-small-${this.index}`)
      return element != null && element.offsetParent !== null
    },
  },
}
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';

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

*[id^='day-map-small-base-'] {
  height: 100%;
}

@media (max-width: 575px) {
  #fmi-day-small-view .map-small,
  #fmi-day-small-view .map-container {
    display: none;
  }
}
</style>

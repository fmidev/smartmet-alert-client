<template>
  <div :id="`day-map-small-${index}`" class="map-small">
    <svg
      class="finland-small"
      xmlns="http://www.w3.org/2000/svg"
      version="1.2"
      baseProfile="tiny"
      width="75"
      height="120"
      viewBox="0 0 75 120"
      stroke-linecap="round"
      stroke-linejoin="round">
      <g v-if="pathsNeeded" :id="`finland-small-${index}`">
        <path
          v-for="path in bluePaths"
          :key="path.key"
          :stroke="strokeColor"
          :stroke-width="path.strokeWidth"
          :fill="path.fill"
          :d="path.d"
          :opacity="path.opacity" />
        <path
          v-for="path in seaBorders"
          class="border-path"
          :key="path.key"
          :stroke="strokeColor"
          :stroke-width="path.strokeWidth"
          :d="path.d"
          fill-opacity="0" />
        <path
          v-for="path in greenPaths"
          :key="path.key"
          :stroke="strokeColor"
          :stroke-width="path.strokeWidth"
          :fill="path.fill"
          :d="path.d"
          :opacity="path.opacity" />
        <path
          v-for="path in yellowPaths"
          :key="path.key"
          :stroke="strokeColor"
          :stroke-width="path.strokeWidth"
          :fill="path.fill"
          :d="path.d"
          :opacity="path.opacity" />
        <path
          v-for="coverage in yellowCoverages"
          :key="coverage.key"
          :stroke="strokeColor"
          :stroke-width="coverage.strokeWidth"
          :fill="coverage.fill"
          :d="coverage.d"
          :fill-opacity="coverage.fillOpacity"
          pointer-events="fill" />
        <path
          v-for="path in orangePaths"
          :key="path.key"
          :stroke="strokeColor"
          :stroke-width="path.strokeWidth"
          :fill="path.fill"
          :d="path.d"
          :opacity="path.opacity" />
        <path
          v-for="coverage in orangeCoverages"
          :key="coverage.key"
          :stroke="strokeColor"
          :stroke-width="coverage.strokeWidth"
          :fill="coverage.fill"
          :d="coverage.d"
          :fill-opacity="coverage.fillOpacity"
          pointer-events="fill" />
        <path
          v-for="path in redPaths"
          :key="path.key"
          :stroke="strokeColor"
          :stroke-width="path.strokeWidth"
          :fill="path.fill"
          :d="path.d"
          :opacity="path.opacity" />
        <path
          v-for="coverage in redCoverages"
          :key="coverage.key"
          :stroke="strokeColor"
          :stroke-width="coverage.strokeWidth"
          :fill="coverage.fill"
          :d="coverage.d"
          :fill-opacity="coverage.fillOpacity"
          pointer-events="fill" />
        <path
          v-for="path in overlayPaths"
          :key="path.key"
          :stroke="strokeColor"
          :stroke-width="path.strokeWidth"
          :d="path.d"
          fill-opacity="0" />
        <path
          v-for="path in landBorders"
          class="border-path"
          :key="path.key"
          :stroke="strokeColor"
          :stroke-width="1.5*path.strokeWidth"
          :d="path.d"
          fill-opacity="0" />
        <path
          v-for="coverage in overlayCoverages"
          :key="coverage.key"
          :stroke="strokeColor"
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
import { onMounted, onUnmounted, ref } from 'vue'

import config from '../mixins/config'
import utils from '../mixins/utils'

export default {
  name: 'MapSmall',
  mixins: [config, utils],
  props: {
    index: {
      type: Number,
    },
    input: {
      type: Object,
      default: () => ({}),
    },
    visibleWarnings: {
      type: Array,
      default: () => [],
    },
    warnings: {
      type: Object,
      default: null,
    },
    geometryId: {
      type: Number,
    },
    loading: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String,
      default: 'light-theme',
    },
  },
  setup() {
    const windowWidth = ref(window.innerWidth)
    const updateWidth = () => {
      windowWidth.value = window.innerWidth
    }
    onMounted(() => {
      window.addEventListener('resize', updateWidth)
    })
    onUnmounted(() => {
      window.removeEventListener('resize', updateWidth)
    })
    return { windowWidth }
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
    strokeColor() {
     return 'DarkSlateGray'
    },
    strokeWidth() {
      return 0.6
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
                  fill: this.loading
                    ? this.colors[this.theme].missing
                    : visualization.color,
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
      return true;
    },
  },
}
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';

div.map-small {
  position: relative;
  bottom: -5px !important;
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

@media (forced-colors: active) {
  path.border-path {
    stroke: $gray;
  }
}

@media (width < 576px) {
  #fmi-day-small-view .map-small,
  #fmi-day-small-view .map-container {
    display: none;
  }
}
</style>

<template>
  <div class="map-large" :class="currentTheme" tabindex="0">
    <div v-if="loading" class="spinner-container text-center">
      <b-spinner></b-spinner>
    </div>
    <div ref="dayMapLarge" class="day-map-large">
      <svg
        id="finland-large"
        xmlns="http://www.w3.org/2000/svg"
        version="1.2"
        baseProfile="tiny"
        viewBox="0 0 440 550"
        stroke-linecap="round"
        stroke-linejoin="round"
        style="max-height: 550px"
        aria-labelledby="finland-large-title"
        role="img">
        <title id="finland-large-title">{{ mapText }}</title>
        <g>
          <path
            v-for="path in bluePaths"
            :id="path.key"
            :key="path.key"
            :stroke="strokeColor"
            :stroke-width="path.strokeWidth"
            :fill="path.fill"
            :d="path.d"
            :opacity="path.opacity"
            pointer-events="fill"
            :data-region="path.dataRegion"
            :data-severity="path.dataSeverity"
            class="region-path"
            @click="regionClicked" />
          <path
            v-for="path in greenPaths"
            :id="path.key"
            :key="path.key"
            :stroke-width="path.strokeWidth"
            :fill="path.fill"
            :d="path.d"
            :opacity="path.opacity"
            pointer-events="fill"
            :data-region="path.dataRegion"
            :data-severity="path.dataSeverity"
            class="region-path"
            @click="regionClicked" />
          <path
            v-for="path in yellowPaths"
            :id="path.key"
            :key="path.key"
            :stroke-width="path.strokeWidth"
            :fill="path.fill"
            :d="path.d"
            :opacity="path.opacity"
            pointer-events="fill"
            :data-region="path.dataRegion"
            :data-severity="path.dataSeverity"
            class="region-path"
            @click="regionClicked" />
          <path
            v-for="coverage in yellowCoverages"
            :id="coverage.key"
            :key="coverage.key"
            stroke="#000000"
            :stroke-width="coverage.strokeWidth"
            :fill="coverage.fill"
            :d="coverage.d"
            :fill-opacity="coverage.fillOpacity"
            style="cursor: pointer; pointer-events: none" />
          <path
            v-for="path in orangePaths"
            :id="path.key"
            :key="path.key"
            :stroke-width="path.strokeWidth"
            :fill="path.fill"
            :d="path.d"
            :opacity="path.opacity"
            pointer-events="fill"
            :data-region="path.dataRegion"
            :data-severity="path.dataSeverity"
            class="region-path"
            @click="regionClicked" />
          <path
            v-for="coverage in orangeCoverages"
            :id="coverage.key"
            :key="coverage.key"
            stroke="#000000"
            :stroke-width="coverage.strokeWidth"
            :fill="coverage.fill"
            :d="coverage.d"
            :fill-opacity="coverage.fillOpacity"
            style="cursor: pointer; pointer-events: none" />
          <path
            v-for="path in redPaths"
            :id="path.key"
            :key="path.key"
            :stroke-width="path.strokeWidth"
            :fill="path.fill"
            :d="path.d"
            :opacity="path.opacity"
            pointer-events="fill"
            :data-region="path.dataRegion"
            :data-severity="path.dataSeverity"
            class="region-path"
            @click="regionClicked" />
          <path
            v-for="coverage in redCoverages"
            :id="coverage.key"
            :key="coverage.key"
            stroke="#000000"
            :stroke-width="coverage.strokeWidth"
            :fill="coverage.fill"
            :d="coverage.d"
            :fill-opacity="coverage.fillOpacity"
            style="cursor: pointer; pointer-events: none" />
          <path
            v-for="path in overlayPaths"
            :id="path.key"
            :key="path.key"
            :stroke="strokeColor"
            :stroke-width="path.strokeWidth"
            :d="path.d"
            fill-opacity="0"
            style="cursor: pointer; pointer-events: none" />
          <path
            v-for="coverage in overlayCoverages"
            :id="coverage.key"
            :key="coverage.key"
            :stroke="strokeColor"
            :stroke-width="coverage.strokeWidth"
            :fill="coverage.fill"
            :d="coverage.d"
            :fill-opacity="coverage.fillOpacity"
            style="cursor: pointer; pointer-events: none" />
        </g>
        <svg
          v-for="icon in icons"
          :key="icon.key"
          version="1.2"
          :x="icon.x"
          :y="icon.y"
          :width="icon.width"
          :height="icon.height"
          :viewBox="icon.viewBox"
          pointer-events="none"
          aria-hidden="true"
          v-html="icon.geom" />
        <svg
          v-for="icon in coverageIcons"
          :key="icon.key"
          version="1.2"
          :x="icon.x"
          :y="icon.y"
          :width="icon.width"
          :height="icon.height"
          :viewBox="icon.viewBox"
          pointer-events="none"
          aria-hidden="true"
          v-html="icon.geom" />
      </svg>
      <b-button
        id="fmi-warnings-zoom-in"
        ref="zoomButton"
        class="fmi-warnings-map-tool"
        :disabled="scale > 2"
        :aria-label="zoomInText"
        @click="zoomIn"></b-button>
      <b-button
        id="fmi-warnings-zoom-out"
        class="fmi-warnings-map-tool"
        :disabled="scale < 2"
        :aria-label="zoomOutText"
        @click="zoomOut"></b-button>
      <b-button
        id="fmi-warnings-move"
        class="fmi-warnings-map-tool"
        :aria-label="moveText"
        :disabled="scale < 2"
        @keydown.left="moveWest"
        @keydown.right="moveEast"
        @keydown.up="moveNorth"
        @keydown.down="moveSouth"></b-button>
      <div
        id="fmi-warnings-region-tooltip-reference"
        :style="tooltipStyle"></div>
      <b-tooltip
        id="fmi-warnings-region-tooltip"
        :show.sync="showTooltip"
        triggers=""
        target="fmi-warnings-region-tooltip-reference"
        placement="top"
        delay="0"
        container="fmi-warnings-region-tooltip-reference"
        :custom-class="currentTheme">
        <div id="day-map-large-base-popup" class="fmi-warnings-popup">
          <a
            id="day-map-large-base-popup-closer"
            :class="['fmi-warnings-popup-closer', `shadow-${popupLevel}`]"
            href="#"
            @click="closeTooltip"></a>
          <div id="day-map-large-base-popup-content">
            <div class="region-popup">
              <div :class="['region-popup-header', `${popupLevel}`]">
                <span class="region-popup-header-text bold-text">
                  {{ regionTitle }}
                </span>
              </div>
              <div class="region-popup-wrapper">
                <div class="region-popup-body">
                  <div class="popup-table">
                    <div class="popup-table-body">
                      <PopupRow
                        v-for="popupWarning in popupWarnings"
                        :key="popupWarning.id"
                        :input="popupWarning"></PopupRow>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </b-tooltip>
    </div>
    <div :class="{ 'prevent-tooltip': dragging }"></div>
  </div>
</template>

<script>
import 'focus-visible'

import Panzoom from '@panzoom/panzoom'
import { vueWindowSizeMixin } from 'vue-window-size'

import i18n from '../i18n'
import config from '../mixins/config'
import utils from '../mixins/utils'
import PopupRow from './PopupRow.vue'

export default {
  name: 'MapLarge',
  components: { PopupRow },
  mixins: [config, utils, vueWindowSizeMixin],
  props: {
    index: {
      type: Number,
    },
    input: {
      type: Object,
    },
    geometryId: {
      type: Number,
    },
  },
  data() {
    return {
      warningsDate: '',
      updated: '',
      updatedDate: '',
      atTime: '',
      updatedTime: '',
      dataProviderFirst: '',
      dataProviderSecond: '',
      mapText: '',
      actionStarted: false,
      dragging: false,
      showTooltip: false,
      tooltipX: 0,
      tooltipY: 0,
      pan: {
        x: 0,
        y: 0,
      },
      scale: 1,
      popupRegion: {},
      popupLevel: '',
      popupWarnings: [],
      coverageRegions: {},
      coverageWarnings: [],
    }
  },
  computed: {
    visibleWarnings() {
      return this.$store.getters.visibleWarnings
    },
    loading() {
      return this.$store.getters.loading
    },
    moveStep() {
      return 25
    },
    minIconDistSqr() {
      return 500
    },
    iconDistStep() {
      return 10
    },
    iconMaxIter() {
      return 40
    },
    zoomInText() {
      return i18n.t('zoomIn')
    },
    zoomOutText() {
      return i18n.t('zoomOut')
    },
    moveText() {
      return i18n.t('moveMap')
    },
    tooltipStyle() {
      return `left: ${this.tooltipX}px; top: ${this.tooltipY}px`
    },
    size() {
      return 'Large'
    },
    strokeWidth() {
      return String(1.2 - (this.scale - 1) / this.scale)
    },
    strokeColor() {
      return 'rgb(80,80,80)'
    },
    iconSize() {
      return 28 - 4 * this.scale
    },
    maxWarningIcons() {
      return this.scale + 1
    },
    icons() {
      const data = []
      const warnings = this.warnings
      const maxWarningIcons = this.maxWarningIcons
      this.regionIds.forEach((regionId) => {
        const region = this.regionData(regionId)
        if (
          region != null &&
          this.geometries[this.geometryId][regionId].children.length === 0 &&
          !this.mergedRegions.has(regionId)
        ) {
          const iconSizes = []
          const aspectRatios = []
          const keys = []
          const geoms = []
          region.warnings
            .filter((warning) => this.visibleWarnings.includes(warning.type))
            .forEach((regionWarning, index, regionWarnings) => {
              const identifier = regionWarning.identifiers.find(
                (id) => warnings[id] && warnings[id].covRegions.size === 0
              )
              if (identifier && iconSizes.length < maxWarningIcons) {
                const icon =
                  iconSizes.length === maxWarningIcons - 1 &&
                  regionWarnings.length > maxWarningIcons
                    ? this.warningIcon({ type: this.MULTIPLE })
                    : this.warningIcon(warnings[identifier])
                const scale = icon.scale ? icon.scale : 1
                const width =
                  (scale * icon.scale * icon.aspectRatio[0] * this.iconSize) /
                  icon.aspectRatio[1]
                const height = scale * icon.scale * this.iconSize
                iconSizes.push([width, height])
                aspectRatios.push(icon.aspectRatio)
                geoms.push(icon.geom)
                keys.push(`${regionId}-${identifier}`)
              }
            })
          let offsetX =
            -iconSizes.reduce((acc, iconSize) => acc + iconSize[0], 0) / 2
          const coords = this.geometries[this.geometryId][regionId].center
          iconSizes.forEach((iconSize, index) => {
            data.push({
              key: keys[index],
              x: `${coords[0] + offsetX}px`,
              y: `${coords[1] - iconSize[1] / 2}px`,
              width: `${iconSize[0]}px`,
              height: `${iconSize[1]}px`,
              version: '1.1',
              viewBox: `0 0 ${aspectRatios[index][0]} ${aspectRatios[index][1]}`,
              geom: geoms[index],
              regionId,
            })
            offsetX += iconSize[0]
          })
        }
      })
      return data
    },
    coverageIcons() {
      const warnings = this.warnings
      return this.coverageWarnings.reduce((iconData, warningId) => {
        const warning = warnings[warningId]
        if (
          this.visibleWarnings.includes(warning.type) &&
          warning.coveragesLarge.length > 0
        ) {
          let reference = warning.coveragesLarge[0].reference
          let iterIndex = 0
          let radius
          let angle
          // Prevent too close warning symbols
          while (
            !this.validIconLocation(reference, warningId) &&
            iterIndex < this.iconMaxIter
          ) {
            angle = 0.25 * Math.PI * iterIndex
            iterIndex++
            radius = Math.ceil(iterIndex / 8) * this.iconDistStep
            reference = [
              warning.coveragesLarge[0].reference[0] + radius * Math.cos(angle),
              warning.coveragesLarge[0].reference[1] + radius * Math.sin(angle),
            ]
          }
          if (iterIndex >= this.iconMaxIter) {
            reference = warning.coveragesLarge[0].reference
          }
          const icon = this.warningIcon(warning)
          const scale = icon.scale ? icon.scale : 1
          const width =
            (scale * icon.scale * icon.aspectRatio[0] * this.iconSize) /
            icon.aspectRatio[1]
          const height = scale * icon.scale * this.iconSize
          iconData.push({
            key: warningId + Math.random(),
            x: `${reference[0] - width / 2}px`,
            y: `${reference[1] - height / 2}px`,
            width,
            height,
            version: '1.1',
            viewBox: `0 0 ${icon.aspectRatio[0]} ${icon.aspectRatio[1]}`,
            geom: icon.geom,
          })
        }
        return iconData
      }, [])
    },
    regionTitle() {
      return i18n.t(this.popupRegion.name)
    },
    regionSets() {
      const map = new Map()
      const warnings = this.warnings
      this.input.land
        .filter(
          (regionItem) =>
            this.geometries[this.geometryId][regionItem.key].neighbours.length >
            0
        )
        .forEach((regionItem) => {
          const serialized = regionItem.warnings.reduce((reduced, warning) => {
            if (!this.visibleWarnings.includes(warning.type)) {
              return reduced
            }
            const warningIdentifier = warning.identifiers.find((identifier) => {
              const warningById = warnings[identifier]
              return (
                Object.keys(warningById.regions).length >
                warningById.covRegions.size
              )
            })
            if (warningIdentifier == null) {
              return reduced
            }
            const w = warnings[warningIdentifier]
            return `${reduced}:${w.type}:${w.severity}:${w.value}:${w.direction}`
          }, '')
          if (serialized) {
            const set = map.has(serialized) ? map.get(serialized) : new Set()
            set.add(regionItem.key)
            map.set(serialized, set)
          }
        })
      return map
    },
    networks() {
      let allNetworks = []
      this.regionSets.forEach((regionSet) => {
        const networks = []
        regionSet.forEach((region) => {
          networks.push(new Set([region]))
        })
        // eslint-disable-next-line no-empty
        while (this.mergeNetworks(networks)) {}
        allNetworks = allNetworks.concat(networks)
      })
      const arrayNetworks = []
      allNetworks.forEach((network) => {
        if (network.size > 1) {
          arrayNetworks.push(Array.from(network.keys()))
        }
      })
      return arrayNetworks
    },
    networkCenters() {
      return this.networks.map((network) => {
        const arrayNetwork = Array.from(network)
        const weightSum = arrayNetwork.reduce(
          (sum, region) =>
            sum + this.geometries[this.geometryId][region].weight,
          0
        )
        return arrayNetwork
          .reduce(
            (sum, region) => {
              const geom = this.geometries[this.geometryId][region]
              return sum.map(
                (sumByIndex, index) =>
                  sumByIndex + geom.weight * geom.center[index]
              )
            },
            [0, 0]
          )
          .map((weightedSumByIndex) => weightedSumByIndex / weightSum)
      })
    },
    networkReps() {
      return this.networks.map(
        (network, networkIndex) =>
          network[
            this.indexOfSmallest(
              network.map(
                (region) =>
                  [0, 1].reduce(
                    (sum, coordIndex) =>
                      sum +
                      (this.geometries[this.geometryId][region].center[
                        coordIndex
                      ] -
                        this.networkCenters[networkIndex][coordIndex]) **
                        2,
                    0
                  ) / this.geometries[this.geometryId][region].weight
              )
            )
          ]
      )
    },
    mergedRegions() {
      const merged = new Set()
      this.networks.forEach((network, index) => {
        network.forEach((region) => {
          if (region !== this.networkReps[index]) {
            merged.add(region)
          }
        })
      })
      return merged
    },
    warnings() {
      return this.$store.getters.warnings
    },
  },
  watch: {
    scale() {
      if (this.panzoom != null) {
        if (this.scale === 1) {
          this.panzoom.setOptions({
            touchAction: '',
          })
          this.panzoom.reset({
            animate: false,
          })
        } else {
          this.panzoom.setOptions({
            touchAction: 'none',
          })
        }
      }
    },
    input() {
      this.coverageRegions = {}
      this.coverageWarnings = []
    },
    warnings() {
      this.showTooltip = false
    },
    visibleWarnings() {
      this.showTooltip = false
    },
    windowWidth() {
      this.showTooltip = false
      if (this.$refs.zoomButton.clientHeight === 0 && this.scale > 1) {
        this.scale = 1
      }
    },
  },
  mounted() {
    if (this.isClientSide()) {
      const finlandLarge = document.getElementById('finland-large')
      if (finlandLarge != null) {
        this.panzoom = Panzoom(finlandLarge, {
          disableZoom: true,
          panOnlyWhenZoomed: true,
          animate: false,
          origin: '50% 50%',
          minScale: 1,
          maxScale: 3,
          touchAction: '',
        })
        finlandLarge.addEventListener('panzoomzoom', () => {
          this.scale = this.panzoom.getScale()
          this.showTooltip = false
        })
        finlandLarge.addEventListener('panzoompan', (event) => {
          // Skip programmatical pan
          if (!this.actionStarted) {
            return
          }
          const eventDetail = event.detail
          if (eventDetail == null) {
            return
          }
          let panned = false
          ;['x', 'y'].forEach((axis) => {
            if (eventDetail[axis] !== this.pan[axis]) {
              this.pan[axis] = eventDetail[axis]
              panned = true
            }
          })
          if (panned) {
            this.showTooltip = false
            this.dragging = true
          }
        })
        finlandLarge.addEventListener('panzoomstart', () => {
          this.actionStarted = true
        })
        finlandLarge.addEventListener('panzoomend', () => {
          this.actionStarted = false
          this.dragging = false
          this.limitPan()
        })
      }
    }
  },
  updated() {
    this.$store.dispatch('setLoading', false)
    if (this.$store.getters.warnings != null) {
      this.$store.dispatch('setInitialized', true)
    }
  },
  methods: {
    paths(options) {
      return this.regionIds.reduce((regions, regionId) => {
        if (
          this.geometries[this.geometryId][regionId].pathLarge &&
          (this.geometries[this.geometryId][regionId].type === options.type) ===
            (this.geometries[this.geometryId][regionId].subType == null)
        ) {
          const visualization = this.regionVisualization(regionId)
          if (
            options.severity == null ||
            visualization.severity === options.severity
          ) {
            regions.push({
              key: `${regionId}${this.size}${this.index}Path`,
              fill:
                this.initialized || !this.isClientSide()
                  ? visualization.color
                  : this.colors.missing,
              d: visualization.visible ? visualization.geom.pathLarge : '',
              opacity: '1',
              dataRegion: regionId,
              dataSeverity: visualization.severity,
              strokeWidth:
                this.geometries[this.geometryId][regionId].type === 'sea' &&
                this.geometries[this.geometryId][regionId].subType !== 'lake'
                  ? this.strokeWidth
                  : 0,
            })
          }
        }
        return regions
      }, [])
    },
    regionClicked(event) {
      const regionId = event.target.getAttribute('data-region')
      let severity = Number(event.target.getAttribute('data-severity'))
      this.popupRegion = this.geometries[this.geometryId][regionId]
      const region = this.input[this.popupRegion.type].find(
        (regionWarning) => regionWarning.key === regionId
      )
      let popupWarnings = []
      if (region != null) {
        region.warnings
          .filter(
            (warning) =>
              this.visibleWarnings.includes(warning.type) &&
              warning.coverage >= this.coverageCriterion
          )
          .forEach((warningByType) => {
            warningByType.identifiers.forEach((identifier) => {
              const warning = this.warnings[identifier]
              popupWarnings.push({
                type: warningByType.type,
                severity: warning.severity,
                direction: warning.direction,
                text: warning.text != null ? warning.text : '',
                interval: warning.validInterval,
              })
            })
          })
      }
      if (popupWarnings.length === 0) {
        popupWarnings = [
          {
            type: '',
            severity: 0,
            direction: 0,
            text: '',
            interval: i18n.t('popupNoWarnings'),
          },
        ]
      } else if (
        this.coverageRegions[regionId] != null &&
        this.coverageRegions[regionId] > severity
      ) {
        severity = this.coverageRegions[regionId]
      }
      this.popupLevel = `level-${severity}`
      this.popupWarnings = popupWarnings
      const mapRect = this.$refs.dayMapLarge.getBoundingClientRect()
      if (
        [
          mapRect,
          mapRect.x,
          mapRect.y,
          window,
          window.scrollX,
          window.scrollY,
        ].every((item) => item != null)
      ) {
        this.tooltipX = event.pageX - mapRect.x - window.scrollX
        this.tooltipY = event.pageY - mapRect.y - window.scrollY
        this.showTooltip = true
      }
    },
    validIconLocation(coord, warningId) {
      const warnings = this.warnings
      const warning = warnings[warningId]
      const activeIconRegions = {}
      this.icons.forEach((icon) => {
        activeIconRegions[icon.regionId] = true
      })
      return ![...warning.covRegions.keys()].some((covRegion) => {
        if (!activeIconRegions[covRegion]) {
          return false
        }
        const center = this.geometries[this.geometryId][covRegion].center
        return (
          (center[0] - coord[0]) ** 2 + (center[1] - coord[1]) ** 2 <
          this.minIconDistSqr
        )
      })
    },
    mergeNetworks(networks) {
      return networks.some((network1, index1) => {
        const neighbours = Array.from(network1.keys()).reduce(
          (reduced, region) => {
            this.geometries[this.geometryId][region].neighbours.forEach(
              (neighbour) => {
                reduced.add(neighbour)
              }
            )
            return reduced
          },
          new Set()
        )
        return networks.some((network2, index2) => {
          if (index2 <= index1) {
            return false
          }
          const ngbrIndex = Array.from(neighbours.keys()).findIndex(
            (neighbour) => network2.has(neighbour)
          )
          if (ngbrIndex >= 0) {
            network2.forEach(networks[index1].add, networks[index1])
            networks.splice(index2, 1)
            return true
          }
          return false
        })
      })
    },
    indexOfSmallest(array) {
      let lowest = 0
      for (let i = 1; i < array.length; i++) {
        if (array[i] < array[lowest]) lowest = i
      }
      return lowest
    },
    zoomIn() {
      if (this.panzoom != null) {
        this.panzoom.zoom(this.panzoom.getScale() + 1, {
          force: true,
        })
      }
    },
    zoomOut() {
      if (this.panzoom != null) {
        this.panzoom.zoom(this.panzoom.getScale() - 1, {
          force: true,
        })
      }
    },
    closeTooltip(event) {
      event.preventDefault()
      this.showTooltip = false
    },
    moveWest(event) {
      event.preventDefault()
      this.panzoom.pan(this.moveStep, 0, {
        relative: true,
      })
      this.limitPan()
    },
    moveEast(event) {
      event.preventDefault()
      this.panzoom.pan(-this.moveStep, 0, {
        relative: true,
      })
      this.limitPan()
    },
    moveNorth(event) {
      event.preventDefault()
      this.panzoom.pan(0, this.moveStep, {
        relative: true,
      })
      this.limitPan()
    },
    moveSouth(event) {
      event.preventDefault()
      this.panzoom.pan(0, -this.moveStep, {
        relative: true,
      })
      this.limitPan()
    },
    limitPan() {
      const pan = this.panzoom.getPan()
      let panChanged = false
      ;['x', 'y'].forEach((coord) => {
        if (pan[coord] > this.panLimits[coord]) {
          pan[coord] = this.panLimits[coord]
          panChanged = true
        } else if (pan[coord] < -this.panLimits[coord]) {
          pan[coord] = -this.panLimits[coord]
          panChanged = true
        }
      })
      if (panChanged) {
        this.panzoom.pan(pan.x, pan.y)
      }
    },
  },
}
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';
@import '../scss/warningImages.scss';

div.map-large {
  display: inline-block;
  width: $map-large-width;
  height: 100%;
  max-height: $map-large-height;
  background-color: transparent;

  &:focus:not([data-focus-visible-added]) {
    outline: none !important;
  }

  div.spinner-container {
    height: 0;
  }

  &.light div.day-map-large button#fmi-warnings-move:focus {
    background-color: $light-button-focus-color;
  }

  &.dark div.day-map-large button#fmi-warnings-move:focus {
    background-color: $dark-button-focus-color;
  }
}

div.day-map-large {
  height: 100%;
}

button.fmi-warnings-map-tool {
  position: absolute;
  right: 10px;
  height: 35px;
  width: 35px;
  background-repeat: no-repeat;
  background-position: center;
  cursor: pointer;
  &:focus:not([data-focus-visible-added]) {
    outline: none !important;
  }
}

.light button.fmi-warnings-map-tool {
  border-color: $light-button-border-color;
}

.dark button.fmi-warnings-map-tool {
  border-color: $dark-button-border-color;
}

div.map-large div.day-map-large button {
  &#fmi-warnings-zoom-in {
    top: 10px;
    border-radius: 2px 2px 0 0;

    &:disabled {
      border-color: $disabled-color;
      cursor: default;
    }
  }

  &#fmi-warnings-zoom-out {
    top: 46px;
    border-radius: 0 0 2px 2px;

    &:disabled {
      border-color: $disabled-color;
      cursor: default;
    }
  }

  &#fmi-warnings-move {
    top: 90px;
    border: none;
    background-color: transparent;
    pointer-events: none;

    &:focus {
      border-radius: 2px;
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' fill='%23ffffff' viewBox='0 0 16 16'%3E%3Cpath fill-rule='evenodd' d='M7.646.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 1.707V5.5a.5.5 0 0 1-1 0V1.707L6.354 2.854a.5.5 0 1 1-.708-.708l2-2zM8 10a.5.5 0 0 1 .5.5v3.793l1.146-1.147a.5.5 0 0 1 .708.708l-2 2a.5.5 0 0 1-.708 0l-2-2a.5.5 0 0 1 .708-.708L7.5 14.293V10.5A.5.5 0 0 1 8 10zM.146 8.354a.5.5 0 0 1 0-.708l2-2a.5.5 0 1 1 .708.708L1.707 7.5H5.5a.5.5 0 0 1 0 1H1.707l1.147 1.146a.5.5 0 0 1-.708.708l-2-2zM10 8a.5.5 0 0 1 .5-.5h3.793l-1.147-1.146a.5.5 0 0 1 .708-.708l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L14.293 8.5H10.5A.5.5 0 0 1 10 8z'/%3E%3C/svg%3E");

      &:disabled {
        border-color: $disabled-color;
        background-color: $disabled-color;
        cursor: default;
      }
    }
  }
}

div.map-large.light div.day-map-large button {
  &#fmi-warnings-zoom-in {
    background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjM0cHgiIGhlaWdodD0iMzRweCIgdmlld0JveD0iMCAwIDM0IDM0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPHRpdGxlPnBsdXMtc3ltYm9sPC90aXRsZT4KICAgIDxkZWZzPjwvZGVmcz4KICAgIDxnIGlkPSJpY29ucyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IlN5bWJvbHMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC04MzcuMDAwMDAwLCAtNzI0LjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0icGx1cy1zeW1ib2wiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDgzNy4wMDAwMDAsIDcyNC4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxyZWN0IGlkPSJmaWxsLTMiIGZpbGw9IiMzQTY2RTMiIHg9IjAiIHk9IjAiIHdpZHRoPSIzNCIgaGVpZ2h0PSIzNCI+PC9yZWN0PgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTE3LDI0IEwxNywxMCIgaWQ9ImZpbGwtMiIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+PC9wYXRoPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTEwLDE3IEwyNCwxNyIgaWQ9ImZpbGwtMSIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+PC9wYXRoPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=);
    &:disabled {
      background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjM0cHgiIGhlaWdodD0iMzRweCIgdmlld0JveD0iMCAwIDM0IDM0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzLjcuMSAoMjgyMTUpIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPgogICAgPHRpdGxlPnBsdXMtc3ltYm9sPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9Imljb25zIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyBpZD0iU3ltYm9scyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTgzNy4wMDAwMDAsIC03MjQuMDAwMDAwKSI+CiAgICAgICAgICAgIDxnIGlkPSJwbHVzLXN5bWJvbCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODM3LjAwMDAwMCwgNzI0LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPHJlY3QgaWQ9ImZpbGwtMyIgZmlsbD0iIzk3OTc5NyIgeD0iMCIgeT0iMCIgd2lkdGg9IjM0IiBoZWlnaHQ9IjM0Ij48L3JlY3Q+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTcsMjQgTDE3LDEwIiBpZD0iZmlsbC0yIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj48L3BhdGg+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTAsMTcgTDI0LDE3IiBpZD0iZmlsbC0xIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj48L3BhdGg+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==);
    }
  }
  &#fmi-warnings-zoom-out {
    background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjM0cHgiIGhlaWdodD0iMzRweCIgdmlld0JveD0iMCAwIDM0IDM0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPHRpdGxlPm1pbnVzLXN5bWJvbDwvdGl0bGU+CiAgICA8ZGVmcz48L2RlZnM+CiAgICA8ZyBpZD0iaWNvbnMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJTeW1ib2xzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtODgxLjAwMDAwMCwgLTcyNC4wMDAwMDApIj4KICAgICAgICAgICAgPGcgaWQ9Im1pbnVzLXN5bWJvbCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODgxLjAwMDAwMCwgNzI0LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPHJlY3QgaWQ9ImZpbGwtMiIgZmlsbD0iIzNBNjZFMyIgeD0iMCIgeT0iMCIgd2lkdGg9IjM0IiBoZWlnaHQ9IjM0Ij48L3JlY3Q+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTAsMTcgTDI0LDE3IiBpZD0iZmlsbC0xIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj48L3BhdGg+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==);
    &:disabled {
      background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjM0cHgiIGhlaWdodD0iMzRweCIgdmlld0JveD0iMCAwIDM0IDM0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzLjcuMSAoMjgyMTUpIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPgogICAgPHRpdGxlPm1pbnVzLXN5bWJvbDwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxkZWZzPjwvZGVmcz4KICAgIDxnIGlkPSJpY29ucyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IlN5bWJvbHMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC04ODEuMDAwMDAwLCAtNzI0LjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0ibWludXMtc3ltYm9sIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg4ODEuMDAwMDAwLCA3MjQuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8cmVjdCBpZD0iZmlsbC0yIiBmaWxsPSIjOTc5Nzk3IiB4PSIwIiB5PSIwIiB3aWR0aD0iMzQiIGhlaWdodD0iMzQiPjwvcmVjdD4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xMCwxNyBMMjQsMTciIGlkPSJmaWxsLTEiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiPjwvcGF0aD4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+);
    }
  }
}

div.map-large.dark div.day-map-large button {
  &#fmi-warnings-zoom-in {
    background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8-Cjxzdmcgd2lkdGg9IjM0cHgiIGhlaWdodD0iMzRweCIgdmlld0JveD0iMCAwIDM0IDM0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPHRpdGxlPnBsdXMtc3ltYm9sPC90aXRsZT4KICAgIDxkZWZzPjwvZGVmcz4KICAgIDxnIGlkPSJpY29ucyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI-CiAgICAgICAgPGcgaWQ9IlN5bWJvbHMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC04MzcuMDAwMDAwLCAtNzI0LjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0icGx1cy1zeW1ib2wiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDgzNy4wMDAwMDAsIDcyNC4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxyZWN0IGlkPSJmaWxsLTMiIGZpbGw9IiM0MzQ3NTIiIHg9IjAiIHk9IjAiIHdpZHRoPSIzNCIgaGVpZ2h0PSIzNCI-PC9yZWN0PgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTE3LDI0IEwxNywxMCIgaWQ9ImZpbGwtMiIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI-PC9wYXRoPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTEwLDE3IEwyNCwxNyIgaWQ9ImZpbGwtMSIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI-PC9wYXRoPgogICAgICAgICAgICA8L2c-CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4);
    &:disabled {
      background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjM0cHgiIGhlaWdodD0iMzRweCIgdmlld0JveD0iMCAwIDM0IDM0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzLjcuMSAoMjgyMTUpIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPgogICAgPHRpdGxlPnBsdXMtc3ltYm9sPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9Imljb25zIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyBpZD0iU3ltYm9scyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTgzNy4wMDAwMDAsIC03MjQuMDAwMDAwKSI+CiAgICAgICAgICAgIDxnIGlkPSJwbHVzLXN5bWJvbCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODM3LjAwMDAwMCwgNzI0LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPHJlY3QgaWQ9ImZpbGwtMyIgZmlsbD0iIzk3OTc5NyIgeD0iMCIgeT0iMCIgd2lkdGg9IjM0IiBoZWlnaHQ9IjM0Ij48L3JlY3Q+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTcsMjQgTDE3LDEwIiBpZD0iZmlsbC0yIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj48L3BhdGg+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTAsMTcgTDI0LDE3IiBpZD0iZmlsbC0xIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj48L3BhdGg+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==);
    }
  }
  &#fmi-warnings-zoom-out {
    background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8-Cjxzdmcgd2lkdGg9IjM0cHgiIGhlaWdodD0iMzRweCIgdmlld0JveD0iMCAwIDM0IDM0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPHRpdGxlPm1pbnVzLXN5bWJvbDwvdGl0bGU-CiAgICA8ZGVmcz48L2RlZnM-CiAgICA8ZyBpZD0iaWNvbnMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJTeW1ib2xzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtODgxLjAwMDAwMCwgLTcyNC4wMDAwMDApIj4KICAgICAgICAgICAgPGcgaWQ9Im1pbnVzLXN5bWJvbCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODgxLjAwMDAwMCwgNzI0LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPHJlY3QgaWQ9ImZpbGwtMiIgZmlsbD0iIzQzNDc1MiIgeD0iMCIgeT0iMCIgd2lkdGg9IjM0IiBoZWlnaHQ9IjM0Ij48L3JlY3Q-CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTAsMTcgTDI0LDE3IiBpZD0iZmlsbC0xIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj48L3BhdGg-CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c-CiAgICA8L2c-Cjwvc3ZnPg);
    &:disabled {
      background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjM0cHgiIGhlaWdodD0iMzRweCIgdmlld0JveD0iMCAwIDM0IDM0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzLjcuMSAoMjgyMTUpIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPgogICAgPHRpdGxlPm1pbnVzLXN5bWJvbDwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxkZWZzPjwvZGVmcz4KICAgIDxnIGlkPSJpY29ucyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IlN5bWJvbHMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC04ODEuMDAwMDAwLCAtNzI0LjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0ibWludXMtc3ltYm9sIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg4ODEuMDAwMDAwLCA3MjQuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8cmVjdCBpZD0iZmlsbC0yIiBmaWxsPSIjOTc5Nzk3IiB4PSIwIiB5PSIwIiB3aWR0aD0iMzQiIGhlaWdodD0iMzQiPjwvcmVjdD4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xMCwxNyBMMjQsMTciIGlkPSJmaWxsLTEiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiPjwvcGF0aD4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+);
    }
  }
}

div.day-map-large
  div#fmi-warnings-region-tooltip-reference
  > div#fmi-warnings-region-tooltip.tooltip.b-tooltip {
  opacity: 1;
  &:focus {
    outline: none !important;
  }
}

#fmi-warnings-region-tooltip-reference {
  position: absolute;
  width: 1px;
  height: 1px;
  background-color: transparent;
  pointer-events: none;
  z-index: 10;
}

.fmi-warnings-popup {
  position: absolute;
  padding: 0;
  border-radius: 1px;
  bottom: 12px;
  left: -50px;
  min-width: $popup-width;
  z-index: 9;
}

.light .fmi-warnings-popup {
  background-color: $light-popup-background-color;
  -webkit-filter: drop-shadow(0 1px 4px $light-popup-filter-color);
  filter: drop-shadow(0 1px 4px $light-popup-filter-color);
}

.dark .fmi-warnings-popup {
  background-color: $dark-popup-background-color;
  -webkit-filter: drop-shadow(0 1px 4px $dark-popup-filter-color);
  filter: drop-shadow(0 1px 4px $dark-popup-filter-color);
}

::v-deep .tooltip.bs-tooltip-top {
  .arrow,
  .arrow::before {
    content: ' ';
    height: 0;
    width: 0;
    position: absolute;
    pointer-events: none;
  }

  .arrow {
    padding: 0;
    border-radius: 1px;
    border: 11px solid transparent;
    left: 60px;
    margin-left: -11px;
    top: 0;
    z-index: 10;
  }

  .arrow::before {
    border: 10px solid transparent;
    left: -10px;
    top: -11px;
    z-index: 9;
  }

  &.light {
    .arrow {
      border-top-color: $light-popup-border-color;
    }

    .arrow::before {
      border-top-color: $light-popup-background-color;
    }
  }

  &.dark {
    .arrow {
      border-top-color: $dark-popup-border-color;
    }

    .arrow::before {
      border-top-color: $dark-popup-background-color;
    }
  }
}

a.fmi-warnings-popup-closer {
  border-bottom: none;
  position: absolute;
  top: 0;
  right: 0;
  height: 35px;
  width: 35px;
  background: url($ui-image-path + 'close' + $image-extension) no-repeat center;

  &#day-map-large-base-popup-closer {
    border-bottom: 0 none transparent;
    z-index: 8;
    pointer-events: auto;
    outline: none !important;
    &:focus {
      outline: none;
    }
  }
}

.region-popup {
  width: 100%;
  cursor: default;
}

.light .region-popup {
  background-color: $light-popup-background-color;
}

.dark .region-popup {
  background-color: $dark-popup-background-color;
}

div.region-popup-header {
  display: flex;
  align-items: center;
  width: 100%;
  height: 35px;
  line-height: 35px;
  padding-left: 15px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

span.region-popup-header-text {
  display: table-cell;
  vertical-align: middle;
  margin-right: 45px;
  margin-top: 3px;
}

.light span.region-popup-header-text {
  color: $light-popup-header-text-color;
}

.dark span.region-popup-header-text {
  color: $dark-popup-header-text-color;
}

.region-popup-wrapper {
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 0 0 0;
}

.region-popup-body {
  top: 40px;
  width: 100%;
  padding: 0 0 0 0;
}

.light .region-popup-body {
  background-color: $light-popup-background-color;
}

.dark .region-popup-body {
  background-color: $dark-popup-background-color;
}

.light {
  .shadow-level-0 {
    background-color: $light-green-shadow !important;
  }

  .shadow-level-1 {
    background-color: $light-green-shadow !important;
  }

  .shadow-level-2 {
    background-color: $light-yellow-shadow !important;
  }

  .shadow-level-3 {
    background-color: $light-orange-shadow !important;
  }

  .shadow-level-4 {
    background-color: $light-red-shadow !important;
  }
}

.dark {
  .shadow-level-0 {
    background-color: $dark-green-shadow !important;
  }

  .shadow-level-1 {
    background-color: $dark-green-shadow !important;
  }

  .shadow-level-2 {
    background-color: $dark-yellow-shadow !important;
  }

  .shadow-level-3 {
    background-color: $dark-orange-shadow !important;
  }

  .shadow-level-4 {
    background-color: $dark-red-shadow !important;
  }
}

::v-deep div.tooltip-inner {
  padding: 0;
}

.popup-table {
  border-spacing: 4px;
  display: table;
  width: 100%;
  padding-bottom: 10px;
}

.popup-table-heading {
  display: table-header-group;
}

.light .popup-table-heading {
  background-color: $light-popup-table-background-color;
}

.dark .popup-table-heading {
  background-color: $dark-popup-table-background-color;
}

.popup-table-head {
  display: table-cell;
  vertical-align: middle;
  text-align: left;
}

.popup-table-heading {
  display: table-header-group;
  font-weight: bold;
}

.light .popup-table-heading {
  background-color: $light-popup-table-background-color;
}

.dark .popup-table-heading {
  background-color: $dark-popup-table-background-color;
}

.popup-table-foot {
  display: table-footer-group;
  font-weight: bold;
}

.light .popup-table-foot {
  background-color: $light-popup-table-background-color;
}

.dark .popup-table-foot {
  background-color: $dark-popup-table-background-color;
}

.popup-table-body {
  display: table-row-group;
}

div.symbol-image {
  display: table;
}

div.prevent-tooltip {
  position: absolute;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
}

path.region-path {
  cursor: pointer;
}

svg#finland-large {
  cursor: default !important;
}

@media (max-width: 767px) {
  div.map-large {
    min-width: 100%;
    width: 100%;
    max-width: 100%;
  }

  div#fmi-warnings-region-tooltip.tooltip.b-tooltip {
    display: none;
  }

  path.region-path {
    cursor: default;
  }
}

@media (max-width: 575px) {
  button.fmi-warnings-map-tool {
    display: none;
  }
}
</style>

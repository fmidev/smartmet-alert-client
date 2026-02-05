<template>
  <div class="map-large focus-ring" :class="theme" tabindex="0">
    <div v-if="spinnerEnabled && loading" class="spinner-container text-center">
      <div class="spinner-border" role="status">
        <span class="visually-hidden"></span>
      </div>
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
        <g v-if="!loading">
          <path
            v-for="path in bluePaths"
            :id="path.key"
            :key="path.key"
            :stroke="strokeColor"
            :stroke-width="path.strokeWidth"
            :stroke-opacity="strokeOpacity"
            :fill="path.fill"
            :d="path.d"
            :opacity="path.opacity"
            pointer-events="fill"
            :data-region="path.dataRegion"
            :data-severity="path.dataSeverity"
            class="region-path"
            @click="regionClicked" />
          <path
            v-for="path in seaBorders"
            :id="path.key"
            :key="path.key"
            class="border-path"
            :stroke="strokeColor"
            :stroke-width="path.strokeWidth"
            :stroke-opacity="strokeOpacity"
            :d="path.d"
            fill-opacity="0"
            style="cursor: pointer; pointer-events: none" />
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
            :stroke-width="coverage.strokeWidth"
            :fill="coverage.fill"
            :d="coverage.d"
            :fill-opacity="coverage.fillOpacity"
            style="cursor: pointer; pointer-events: none" />
        </g>
        <g>
          <path
            v-for="path in overlayPaths"
            :id="path.key"
            :key="path.key"
            :stroke="strokeColor"
            :stroke-width="path.strokeWidth"
            :stroke-opacity="strokeOpacity"
            :d="path.d"
            fill-opacity="0"
            style="cursor: pointer; pointer-events: none" />
          <path
            v-for="path in landBorders"
            :id="path.key"
            :key="path.key"
            class="border-path"
            :stroke="strokeColor"
            :stroke-width="2 * Number(path.strokeWidth)"
            :stroke-opacity="strokeOpacity"
            :d="path.d"
            fill-opacity="0"
            style="cursor: pointer; pointer-events: none" />
        </g>
        <g v-if="!loading">
          <path
            v-for="coverage in overlayCoverages"
            :id="coverage.key"
            :key="coverage.key"
            :stroke="strokeColor"
            :stroke-width="coverage.strokeWidth"
            :stroke-opacity="strokeOpacity"
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
      <button
        id="fmi-warnings-zoom-in"
        ref="zoomButton"
        class="btn btn-md btn-secondary fmi-warnings-map-tool"
        type="button"
        :disabled="scale > 2"
        :aria-label="zoomInText"
        @click="zoomIn" />
      <button
        id="fmi-warnings-zoom-out"
        class="btn btn-md btn-secondary fmi-warnings-map-tool"
        type="button"
        :disabled="scale < 2"
        :aria-label="zoomOutText"
        @click="zoomOut" />
      <button
        id="fmi-warnings-move"
        :class="[
          'btn',
          'btn-md',
          'fmi-warnings-map-tool',
          scale < 2 ? 'hidden' : 'btn-secondary',
        ]"
        type="button"
        :tabindex="scale < 2 ? -1 : 0"
        :aria-label="moveText"
        @keydown.left="moveWest"
        @keydown.right="moveEast"
        @keydown.up="moveNorth"
        @keydown.down="moveSouth" />
      <div id="fmi-warnings-region-tooltip-reference" :style="tooltipStyle">
        <div
          id="fmi-warnings-region-tooltip"
          class="tooltip b-tooltip bs-tooltip-top"
          :class="[showTooltip ? '' : 'd-none', theme]">
          <div class="arrow" style="left: 0" />
          <div id="day-map-large-base-popup" class="fmi-warnings-popup">
            <button
              id="day-map-large-base-popup-closer"
              :class="['fmi-warnings-popup-closer', `shadow-${popupLevel}`]"
              href="#"
              @mousedown="closeTooltip"></button>
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
        </div>
      </div>
    </div>
    <div :class="{ 'prevent-tooltip': dragging }"></div>
  </div>
</template>

<script lang="ts">
import {
  defineComponent,
  onMounted,
  onUnmounted,
  ref,
  computed,
  toRef,
  type PropType,
} from 'vue'
import Panzoom from '@panzoom/panzoom'
import type { PanzoomObject } from '@panzoom/panzoom'

import PopupRow from './PopupRow.vue'
import { useMapPaths } from '@/composables/useMapPaths'
import { useI18n } from '@/composables/useI18n'
import { useConfig, MULTIPLE } from '@/composables/useConfig'
import { isClientSide } from '@/composables/useUtils'
import type {
  DayRegions,
  WarningsMap,
  Theme,
  RegionGeometry,
  Language,
  Severity,
} from '@/types'

interface IconData {
  key: string
  x: string
  y: string
  width: string | number
  height: string | number
  version: string
  viewBox: string
  geom: string
  regionId?: string
}

interface PopupWarning {
  id: string
  type: string
  severity: Severity
  direction: number
  text: string
  interval: string
}

interface PanCoords {
  x: number
  y: number
}

export default defineComponent({
  name: 'MapLarge',
  components: { PopupRow },
  props: {
    index: {
      type: Number as PropType<number>,
      default: 0,
    },
    input: {
      type: Object as PropType<DayRegions>,
      default: () => ({}),
    },
    visibleWarnings: {
      type: Array as PropType<string[]>,
      default: () => [],
    },
    warnings: {
      type: Object as PropType<WarningsMap | null>,
      default: null,
    },
    geometryId: {
      type: Number as PropType<number>,
      default: 2021,
    },
    loading: {
      type: Boolean,
      default: true,
    },
    theme: {
      type: String as PropType<Theme | string>,
      default: 'light-theme',
    },
    language: {
      type: String as PropType<Language | string>,
      default: 'fi',
    },
    spinnerEnabled: {
      type: Boolean,
      default: true,
    },
  },
  emits: ['loaded'],
  setup(props) {
    // Window width tracking
    const windowWidth = ref<number>(
      typeof window !== 'undefined' ? window.innerWidth : 0
    )
    const updateWidth = (): void => {
      windowWidth.value = window.innerWidth
    }
    onMounted(() => {
      window.addEventListener('resize', updateWidth)
    })
    onUnmounted(() => {
      window.removeEventListener('resize', updateWidth)
    })

    // Get config
    const config = useConfig()
    const {
      geometries,
      colors,
      regionIds,
      warningIcon,
      panLimits,
      maxMergedWeight,
      coverageCriterion,
    } = config

    // Setup i18n
    const languageRef = toRef(props, 'language')
    const { t } = useI18n(languageRef)

    // Setup refs for useMapPaths
    const size = computed<'Large' | 'Small'>(() => 'Large')
    const scale = ref<number>(1)
    const strokeWidthComputed = computed<number>(
      () => 1 - (scale.value - 1) / scale.value
    )

    const indexRef = toRef(props, 'index')
    const inputRef = toRef(props, 'input')
    const warningsRef = toRef(props, 'warnings')
    const visibleWarningsRef = toRef(props, 'visibleWarnings')
    const geometryIdRef = toRef(props, 'geometryId')
    const themeRef = toRef(props, 'theme')
    const loadingRef = toRef(props, 'loading')

    // Setup map paths composable
    const {
      strokeColor,
      bluePaths,
      greenPaths,
      yellowPaths,
      orangePaths,
      redPaths,
      overlayPaths,
      landBorders,
      seaBorders,
      yellowCoverages,
      orangeCoverages,
      redCoverages,
      overlayCoverages,
      coverageRegions,
      coverageWarnings,
      regionData,
      regionVisualization,
    } = useMapPaths({
      size,
      index: indexRef,
      input: inputRef,
      warnings: warningsRef,
      visibleWarnings: visibleWarningsRef,
      geometryId: geometryIdRef,
      theme: themeRef,
      loading: loadingRef,
      strokeWidth: strokeWidthComputed,
    })

    return {
      windowWidth,
      t,
      config,
      geometries,
      colors,
      regionIds,
      warningIcon,
      panLimits,
      maxMergedWeight,
      coverageCriterion,
      size,
      scale,
      strokeColor,
      bluePaths,
      greenPaths,
      yellowPaths,
      orangePaths,
      redPaths,
      overlayPaths,
      landBorders,
      seaBorders,
      yellowCoverages,
      orangeCoverages,
      redCoverages,
      overlayCoverages,
      coverageRegions,
      coverageWarnings,
      regionData,
      regionVisualization,
    }
  },
  data() {
    return {
      warningsDate: '' as string,
      updated: '' as string,
      updatedDate: '' as string,
      atTime: '' as string,
      updatedTime: '' as string,
      dataProviderFirst: '' as string,
      dataProviderSecond: '' as string,
      mapText: '' as string,
      actionStarted: false as boolean,
      dragging: false as boolean,
      showTooltip: false as boolean,
      tooltipX: 0 as number,
      tooltipY: 0 as number,
      pan: {
        x: 0,
        y: 0,
      } as PanCoords,
      popupRegion: {} as Partial<RegionGeometry>,
      popupLevel: '' as string,
      popupWarnings: [] as PopupWarning[],
      strokeOpacity: '0.5' as string,
      panzoom: null as PanzoomObject | null,
    }
  },
  computed: {
    moveStep(): number {
      return 25
    },
    minIconDistSqr(): number {
      return 500
    },
    iconDistStep(): number {
      return 10
    },
    iconMaxIter(): number {
      return 40
    },
    zoomInText(): string {
      return this.t('zoomIn')
    },
    zoomOutText(): string {
      return this.t('zoomOut')
    },
    moveText(): string {
      return this.t('moveMap')
    },
    tooltipStyle(): string {
      return `left: ${this.tooltipX}px; top: ${this.tooltipY}px`
    },
    strokeWidth(): string {
      return String(1 - (this.scale - 1) / this.scale)
    },
    iconSize(): number {
      return 28 - 4 * this.scale
    },
    maxWarningIcons(): number {
      return this.scale + 1
    },
    icons(): IconData[] {
      const data: IconData[] = []
      const warnings = this.warnings
      const maxWarningIcons = this.maxWarningIcons
      const geometriesData = this.geometries as Record<
        string,
        Record<string, RegionGeometry>
      >
      const maxMergedWeightVal = this.maxMergedWeight as number

      this.regionIds.forEach((regionId: string) => {
        const region = this.regionData(regionId)
        const geometry = geometriesData?.[this.geometryId]?.[regionId]
        if (
          geometry &&
          region != null &&
          geometry.children.length === 0 &&
          (!this.mergedRegions.has(regionId) ||
            (geometry.weight > maxMergedWeightVal &&
              region?.warnings?.filter((warning: { type: string }) =>
                this.visibleWarnings.includes(warning.type)
              ).length === 1 &&
              !(
                geometry?.parent?.length &&
                this.regionData(geometry.parent)?.warnings?.some(
                  (warning: { type: string }) =>
                    this.visibleWarnings.includes(warning.type)
                )
              )))
        ) {
          const iconSizes: [number, number][] = []
          const aspectRatios: [number, number][] = []
          const keys: string[] = []
          const geoms: string[] = []
          region.warnings
            .filter(
              (warning: { type: string; coverage: number }) =>
                this.visibleWarnings.includes(warning.type) &&
                warning.coverage === 100
            )
            .forEach(
              (
                regionWarning: { identifiers: string[] },
                _index: number,
                regionWarnings: { identifiers: string[] }[]
              ) => {
                const identifier = regionWarning.identifiers.find(
                  (id: string) =>
                    warnings?.[id] && warnings[id].covRegions.size === 0
                )
                if (identifier && iconSizes.length < maxWarningIcons) {
                  const warningData = warnings![identifier]
                  const icon =
                    iconSizes.length === maxWarningIcons - 1 &&
                    regionWarnings.length > maxWarningIcons
                      ? this.warningIcon({ type: MULTIPLE, severity: 0 })
                      : warningData
                        ? this.warningIcon(warningData)
                        : null
                  if (!icon) return
                  const iconScale = icon.scale ? icon.scale : 1
                  const width =
                    (iconScale * icon.aspectRatio[0] * this.iconSize) /
                    icon.aspectRatio[1]
                  const height = iconScale * this.iconSize + 6
                  iconSizes.push([width, height])
                  aspectRatios.push(icon.aspectRatio)
                  geoms.push(icon.geom || '')
                  keys.push(`${regionId}-${identifier}`)
                }
              }
            )
          const regionGeom = geometriesData[this.geometryId]?.[regionId] as
            | RegionGeometry
            | undefined
          if (!regionGeom) return
          const lastIconWidth = iconSizes[iconSizes.length - 1]?.[0] ?? 0
          let offsetX =
            iconSizes.length > 0 && regionGeom.align === 'right'
              ? -iconSizes.reduce(
                  (acc, iconSize) => acc + iconSize[0],
                  -lastIconWidth / 2
                )
              : -iconSizes.reduce((acc, iconSize) => acc + iconSize[0], 0) / 2
          const coords = regionGeom.center
          if (!coords) return
          iconSizes.forEach((iconSize, idx) => {
            const aspectRatio = aspectRatios[idx]
            const geom = geoms[idx]
            const key = keys[idx]
            if (!aspectRatio || geom == null || !key) return
            data.push({
              key,
              x: `${coords[0] + offsetX}px`,
              y: `${coords[1] - iconSize[1] / 2}px`,
              width: `${iconSize[0]}px`,
              height: `${iconSize[1]}px`,
              version: '1.1',
              viewBox: `0 0 ${aspectRatio[0]} ${aspectRatio[1]}`,
              geom,
              regionId,
            })
            offsetX += iconSize[0]
          })
        }
      })
      return data
    },
    coverageIcons(): IconData[] {
      const warnings = this.warnings

      return this.coverageWarnings.reduce(
        (iconData: IconData[], warningId: string) => {
          const warning = warnings?.[warningId]
          const coverageLarge = warning?.coveragesLarge[0]
          const baseReference = coverageLarge?.reference
          if (
            warning &&
            this.visibleWarnings.includes(warning.type) &&
            warning.coveragesLarge.length > 0 &&
            baseReference &&
            baseReference.length === 2
          ) {
            let reference: [number, number] = [
              baseReference[0],
              baseReference[1],
            ]
            let iterIndex = 0
            let radius: number
            let angle: number
            // Prevent too close warning symbols
            while (
              !this.validIconLocation(reference, warningId) &&
              iterIndex < this.iconMaxIter
            ) {
              angle = 0.25 * Math.PI * iterIndex
              iterIndex++
              radius = Math.ceil(iterIndex / 8) * this.iconDistStep
              reference = [
                baseReference[0] + radius * Math.cos(angle),
                baseReference[1] + radius * Math.sin(angle),
              ]
            }
            if (iterIndex >= this.iconMaxIter) {
              reference = [baseReference[0], baseReference[1]]
            }
            const icon = this.warningIcon(warning)
            const iconScale = icon.scale ? icon.scale : 1
            const width =
              (iconScale * icon.aspectRatio[0] * this.iconSize) /
              icon.aspectRatio[1]
            const height = iconScale * this.iconSize
            iconData.push({
              key: warningId + Math.random(),
              x: `${reference[0] - width / 2}px`,
              y: `${reference[1] - height / 2}px`,
              width,
              height,
              version: '1.1',
              viewBox: `0 0 ${icon.aspectRatio[0]} ${icon.aspectRatio[1]}`,
              geom: icon.geom || '',
            })
          }
          return iconData
        },
        []
      )
    },
    regionTitle(): string {
      return this.t(this.popupRegion.name || '')
    },
    regionSets(): Map<string, Set<string>> {
      const map = new Map<string, Set<string>>()
      const warnings = this.warnings
      const geometriesData = this.geometries as Record<
        string,
        Record<string, RegionGeometry>
      >

      if (!this.input?.land) return map

      const geomYear = geometriesData[this.geometryId]
      this.input.land
        .filter(
          (regionItem: { key: string }) =>
            (geomYear?.[regionItem.key]?.neighbours?.length ?? 0) > 0
        )
        .forEach(
          (regionItem: {
            key: string
            warnings: Array<{ type: string; identifiers: string[] }>
          }) => {
            const serialized = regionItem.warnings.reduce(
              (reduced: string, warning) => {
                if (!this.visibleWarnings.includes(warning.type)) {
                  return reduced
                }
                const warningIdentifier = warning.identifiers.find(
                  (identifier) => {
                    const warningById = warnings?.[identifier]
                    return (
                      warningById &&
                      Object.keys(warningById.regions).length >
                        warningById.covRegions.size
                    )
                  }
                )
                if (warningIdentifier == null) {
                  return reduced
                }
                const w = warnings?.[warningIdentifier]
                if (!w) return reduced
                return `${reduced}:${w.type}:${w.severity}:${w.value}:${w.direction}`
              },
              ''
            )
            if (serialized) {
              const set = map.has(serialized)
                ? map.get(serialized)!
                : new Set<string>()
              set.add(regionItem.key)
              map.set(serialized, set)
            }
          }
        )
      return map
    },
    networks(): string[][] {
      let allNetworks: Set<string>[] = []
      this.regionSets.forEach((regionSet) => {
        const networks: Set<string>[] = []
        regionSet.forEach((region) => {
          networks.push(new Set([region]))
        })
        // eslint-disable-next-line no-empty
        while (this.mergeNetworks(networks)) {}
        allNetworks = allNetworks.concat(networks)
      })
      const arrayNetworks: string[][] = []
      allNetworks.forEach((network) => {
        if (network.size > 1) {
          arrayNetworks.push(Array.from(network.keys()))
        }
      })
      return arrayNetworks
    },
    networkCenters(): [number, number][] {
      const geometriesData = this.geometries as Record<
        string,
        Record<string, RegionGeometry>
      >
      const geomYear = geometriesData[this.geometryId]

      return this.networks.map((network) => {
        const arrayNetwork = Array.from(network)
        const weightSum = arrayNetwork.reduce((sum, region) => {
          const geom = geomYear?.[region]
          return sum + (geom?.weight ?? 0)
        }, 0)
        return arrayNetwork
          .reduce(
            (sum, region) => {
              const geom = geomYear?.[region]
              if (!geom?.center) return sum
              return [
                sum[0] + geom.weight * geom.center[0],
                sum[1] + geom.weight * geom.center[1],
              ] as [number, number]
            },
            [0, 0] as [number, number]
          )
          .map((weightedSumByIndex) => weightedSumByIndex / weightSum) as [
          number,
          number,
        ]
      })
    },
    networkReps(): string[] {
      const geometriesData = this.geometries as Record<
        string,
        Record<string, RegionGeometry>
      >
      const geomYear = geometriesData[this.geometryId]

      return this.networks
        .map((network, networkIndex) => {
          const distances = network.map((region) => {
            const geom = geomYear?.[region]
            if (!geom?.center) return Infinity
            const networkCenter = this.networkCenters[networkIndex]
            if (!networkCenter) return Infinity
            return (
              ((geom.center[0] - networkCenter[0]) ** 2 +
                (geom.center[1] - networkCenter[1]) ** 2) /
              geom.weight
            )
          })
          return network[this.indexOfSmallest(distances)]
        })
        .filter((rep): rep is string => rep !== undefined)
    },
    mergedRegions(): Set<string> {
      const merged = new Set<string>()
      this.networks.forEach((network, index) => {
        network.forEach((region) => {
          if (region !== this.networkReps[index]) {
            merged.add(region)
          }
        })
      })
      return merged
    },
  },
  watch: {
    scale(): void {
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
    input(): void {
      this.coverageRegions = {}
      this.coverageWarnings = []
    },
    warnings(): void {
      this.showTooltip = false
    },
    visibleWarnings(): void {
      this.showTooltip = false
    },
    windowWidth(): void {
      this.showTooltip = false
      const zoomButton = this.$refs.zoomButton as HTMLButtonElement | undefined
      if (zoomButton?.clientHeight === 0 && this.scale > 1) {
        this.scale = 1
      }
    },
  },
  mounted() {
    if (isClientSide()) {
      const finlandLarge = this.$el.querySelector(
        'svg#finland-large'
      ) as SVGSVGElement | null
      if (finlandLarge && this.isAttached(finlandLarge)) {
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
          this.scale = this.panzoom!.getScale()
          this.showTooltip = false
        })
        finlandLarge.addEventListener('panzoompan', (event) => {
          // Skip programmatical pan
          if (!this.actionStarted) {
            return
          }
          const eventDetail = (event as CustomEvent).detail as PanCoords | null
          if (eventDetail == null) {
            return
          }
          let panned = false
          ;(['x', 'y'] as const).forEach((axis) => {
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
      if (this.warnings != null) {
        this.$emit('loaded', true)
      }
    }
  },
  updated() {
    if (this.warnings != null) {
      this.$emit('loaded', true)
    }
  },
  methods: {
    regionClicked(event: MouseEvent): void {
      const target = event.target as SVGPathElement
      const regionId = target.getAttribute('data-region')
      if (!regionId) return

      let severity = Number(target.getAttribute('data-severity'))
      const geometriesData = this.geometries as Record<
        string,
        Record<string, RegionGeometry>
      >
      const coverageCriterionVal = this.coverageCriterion as number

      const regionGeom = geometriesData[this.geometryId]?.[regionId]
      if (!regionGeom) return
      this.popupRegion = regionGeom
      const regionType = this.popupRegion.type as 'land' | 'sea'
      const region = this.input?.[regionType]?.find(
        (regionWarning: { key: string }) => regionWarning.key === regionId
      )
      let popupWarningsData: PopupWarning[] = []
      if (region != null) {
        region.warnings
          .filter(
            (warning: { type: string; coverage: number }) =>
              this.visibleWarnings.includes(warning.type) &&
              warning.coverage >= coverageCriterionVal
          )
          .forEach((warningByType: { type: string; identifiers: string[] }) => {
            warningByType.identifiers.forEach((identifier) => {
              const warning = this.warnings?.[identifier]
              if (warning) {
                popupWarningsData.push({
                  id: identifier,
                  type: warningByType.type,
                  severity: warning.severity,
                  direction: warning.direction,
                  text: warning.text != null ? warning.text : '',
                  interval: warning.validInterval,
                })
              }
            })
          })
      }
      if (popupWarningsData.length === 0) {
        popupWarningsData = [
          {
            id: 'no-warnings',
            type: '',
            severity: 0,
            direction: 0,
            text: '',
            interval: this.t('popupNoWarnings'),
          },
        ]
      } else if (
        this.coverageRegions[regionId] != null &&
        this.coverageRegions[regionId] > severity
      ) {
        severity = this.coverageRegions[regionId]
      }
      this.popupLevel = `level-${severity}`
      this.popupWarnings = popupWarningsData
      const dayMapLarge = this.$refs.dayMapLarge as HTMLDivElement | undefined
      const mapRect = dayMapLarge?.getBoundingClientRect()
      if (
        mapRect &&
        [mapRect.x, mapRect.y, window.scrollX, window.scrollY].every(
          (item) => item != null
        )
      ) {
        this.tooltipX = event.pageX - mapRect.x - window.scrollX
        this.tooltipY = event.pageY - mapRect.y - window.scrollY
        this.showTooltip = true
      }
    },
    validIconLocation(coord: [number, number], warningId: string): boolean {
      const warnings = this.warnings
      const warning = warnings?.[warningId]
      if (!warning) return true

      const geometriesData = this.geometries as Record<
        string,
        Record<string, RegionGeometry>
      >

      const activeIconRegions: Record<string, boolean> = {}
      this.icons.forEach((icon) => {
        if (icon.regionId) {
          activeIconRegions[icon.regionId] = true
        }
      })
      const geomYear = geometriesData[this.geometryId]
      return ![...warning.covRegions.keys()].some((covRegion) => {
        if (!activeIconRegions[covRegion]) {
          return false
        }
        const center = geomYear?.[covRegion]?.center
        if (!center) return false
        return (
          (center[0] - coord[0]) ** 2 + (center[1] - coord[1]) ** 2 <
          this.minIconDistSqr
        )
      })
    },
    mergeNetworks(networks: Set<string>[]): boolean {
      const geometriesData = this.geometries as Record<
        string,
        Record<string, RegionGeometry>
      >
      const geomYear = geometriesData[this.geometryId]

      return networks.some((network1, index1) => {
        const neighbours = Array.from(network1.keys()).reduce(
          (reduced: Set<string>, region: string) => {
            const regionGeom = geomYear?.[region]
            regionGeom?.neighbours?.forEach((neighbour: string) => {
              reduced.add(neighbour)
            })
            return reduced
          },
          new Set<string>()
        )
        return networks.some((network2, index2) => {
          if (index2 <= index1) {
            return false
          }
          const ngbrIndex = Array.from(neighbours.keys()).findIndex(
            (neighbour) => network2.has(neighbour)
          )
          if (ngbrIndex >= 0) {
            const targetNetwork = networks[index1]
            if (targetNetwork) {
              network2.forEach(targetNetwork.add, targetNetwork)
            }
            networks.splice(index2, 1)
            return true
          }
          return false
        })
      })
    },
    indexOfSmallest(array: number[]): number {
      let lowest = 0
      for (let i = 1; i < array.length; i++) {
        const current = array[i]
        const lowestVal = array[lowest]
        if (
          current !== undefined &&
          lowestVal !== undefined &&
          current < lowestVal
        ) {
          lowest = i
        }
      }
      return lowest
    },
    zoomIn(): void {
      if (this.panzoom != null) {
        this.panzoom.zoom(this.panzoom.getScale() + 1, {
          force: true,
        })
      }
    },
    zoomOut(): void {
      if (this.panzoom != null) {
        this.panzoom.zoom(this.panzoom.getScale() - 1, {
          force: true,
        })
      }
    },
    closeTooltip(event: MouseEvent): void {
      event.preventDefault()
      this.showTooltip = false
    },
    moveWest(event: KeyboardEvent): void {
      event.preventDefault()
      this.panzoom?.pan(this.moveStep, 0, {
        relative: true,
      })
      this.limitPan()
    },
    moveEast(event: KeyboardEvent): void {
      event.preventDefault()
      this.panzoom?.pan(-this.moveStep, 0, {
        relative: true,
      })
      this.limitPan()
    },
    moveNorth(event: KeyboardEvent): void {
      event.preventDefault()
      this.panzoom?.pan(0, this.moveStep, {
        relative: true,
      })
      this.limitPan()
    },
    moveSouth(event: KeyboardEvent): void {
      event.preventDefault()
      this.panzoom?.pan(0, -this.moveStep, {
        relative: true,
      })
      this.limitPan()
    },
    limitPan(): void {
      if (!this.panzoom) return

      const pan = this.panzoom.getPan()
      const panLimitsVal = this.panLimits as { x: number; y: number }
      let panChanged = false
      ;(['x', 'y'] as const).forEach((coord) => {
        if (pan[coord] > panLimitsVal[coord]) {
          pan[coord] = panLimitsVal[coord]
          panChanged = true
        } else if (pan[coord] < -panLimitsVal[coord]) {
          pan[coord] = -panLimitsVal[coord]
          panChanged = true
        }
      })
      if (panChanged) {
        this.panzoom.pan(pan.x, pan.y)
      }
    },
    isAttached(node: Node | null): boolean {
      let currentNode: Node | null = node
      while (currentNode != null && currentNode.parentNode != null) {
        if (currentNode.parentNode === document) {
          return true
        }
        currentNode =
          currentNode.parentNode instanceof ShadowRoot
            ? currentNode.parentNode.host
            : currentNode.parentNode
      }
      return false
    },
  },
})
</script>

<style lang="scss">
@import '../scss/backgrounds.scss';
@import '../scss/constants.scss';
@import '../scss/warningImages.scss';

div.map-large {
  display: inline-block;
  width: $map-large-width;
  height: 100%;
  max-height: $map-large-height;
  background-color: transparent;

  div.spinner-container {
    height: 0;
  }

  &.light-theme div.day-map-large button#fmi-warnings-move:focus {
    background-color: $light-button-focus-color;
  }

  &.dark-theme div.day-map-large button#fmi-warnings-move:focus {
    background-color: $dark-button-focus-color;
  }

  &.light-gray-theme div.day-map-large button#fmi-warnings-move:focus {
    background-color: $light-gray-button-focus-color;
  }

  &.dark-gray-theme div.day-map-large button#fmi-warnings-move:focus {
    background-color: $dark-gray-button-focus-color;
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
  border: none;
  padding: 0;
}

div.map-large div.day-map-large button {
  &#fmi-warnings-zoom-in {
    top: 10px;
    border-radius: 2px 2px 0 0;

    &:disabled {
      border-color: $variant-gray;
      cursor: default;
    }
  }

  &#fmi-warnings-zoom-out {
    top: 46px;
    border-radius: 0 0 2px 2px;

    &:disabled {
      border-color: $variant-gray;
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

      &.hidden {
        display: none;
      }
    }
  }
}

div.map-large div.day-map-large button:disabled {
  opacity: 1;
}

div.map-large.light-theme div.day-map-large button {
  &#fmi-warnings-zoom-in {
    background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjM0cHgiIGhlaWdodD0iMzRweCIgdmlld0JveD0iMCAwIDM0IDM0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPHRpdGxlPnBsdXMtc3ltYm9sPC90aXRsZT4KICAgIDxkZWZzPjwvZGVmcz4KICAgIDxnIGlkPSJpY29ucyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IlN5bWJvbHMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC04MzcuMDAwMDAwLCAtNzI0LjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0icGx1cy1zeW1ib2wiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDgzNy4wMDAwMDAsIDcyNC4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxyZWN0IGlkPSJmaWxsLTMiIGZpbGw9IiMzQTY2RTMiIHg9IjAiIHk9IjAiIHdpZHRoPSIzNCIgaGVpZ2h0PSIzNCI+PC9yZWN0PgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTE3LDI0IEwxNywxMCIgaWQ9ImZpbGwtMiIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+PC9wYXRoPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTEwLDE3IEwyNCwxNyIgaWQ9ImZpbGwtMSIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+PC9wYXRoPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=);
    &:disabled {
      background-image: $disabled-zoom-in;
    }
  }
  &#fmi-warnings-zoom-out {
    background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjM0cHgiIGhlaWdodD0iMzRweCIgdmlld0JveD0iMCAwIDM0IDM0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPHRpdGxlPm1pbnVzLXN5bWJvbDwvdGl0bGU+CiAgICA8ZGVmcz48L2RlZnM+CiAgICA8ZyBpZD0iaWNvbnMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJTeW1ib2xzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtODgxLjAwMDAwMCwgLTcyNC4wMDAwMDApIj4KICAgICAgICAgICAgPGcgaWQ9Im1pbnVzLXN5bWJvbCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODgxLjAwMDAwMCwgNzI0LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPHJlY3QgaWQ9ImZpbGwtMiIgZmlsbD0iIzNBNjZFMyIgeD0iMCIgeT0iMCIgd2lkdGg9IjM0IiBoZWlnaHQ9IjM0Ij48L3JlY3Q+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTAsMTcgTDI0LDE3IiBpZD0iZmlsbC0xIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj48L3BhdGg+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==);
    &:disabled {
      background-image: $disabled-zoom-out;
    }
  }
}

div.map-large.dark-theme div.day-map-large button {
  &#fmi-warnings-zoom-in {
    background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMzQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBmaWxsPSIjNDM0NzUyIiBkPSJNMCAwaDM0djM0SDB6Ii8+PHBhdGggZD0iTTE3IDI0VjEwTTEwIDE3aDE0IiBzdHJva2U9IiNGRkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9nPjwvc3ZnPg==);
    &:disabled {
      background-image: $disabled-zoom-in;
    }
  }
  &#fmi-warnings-zoom-out {
    background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzQiIGhlaWdodD0iMzQiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGcgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj48cGF0aCBmaWxsPSIjNDM0NzUyIiBkPSJNMCAwaDM0djM0SDB6Ii8+PHBhdGggZD0iTTEwIDE3aDE0IiBzdHJva2U9IiNGRkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9nPjwvc3ZnPg==);
    &:disabled {
      background-image: $disabled-zoom-out;
    }
  }
}

div.map-large.light-gray-theme div.day-map-large button {
  &#fmi-warnings-zoom-in {
    background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjM0cHgiIGhlaWdodD0iMzRweCIgdmlld0JveD0iMCAwIDM0IDM0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPHRpdGxlPnBsdXMtc3ltYm9sPC90aXRsZT4KICAgIDxkZWZzPjwvZGVmcz4KICAgIDxnIGlkPSJpY29ucyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IlN5bWJvbHMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC04MzcuMDAwMDAwLCAtNzI0LjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0icGx1cy1zeW1ib2wiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDgzNy4wMDAwMDAsIDcyNC4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxyZWN0IGlkPSJmaWxsLTMiIGZpbGw9IiM0MzQ3NTIiIHg9IjAiIHk9IjAiIHdpZHRoPSIzNCIgaGVpZ2h0PSIzNCI+PC9yZWN0PgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTE3LDI0IEwxNywxMCIgaWQ9ImZpbGwtMiIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+PC9wYXRoPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTEwLDE3IEwyNCwxNyIgaWQ9ImZpbGwtMSIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+PC9wYXRoPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=);
    &:disabled {
      background-image: $disabled-zoom-in;
    }
  }
  &#fmi-warnings-zoom-out {
    background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjM0cHgiIGhlaWdodD0iMzRweCIgdmlld0JveD0iMCAwIDM0IDM0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPHRpdGxlPm1pbnVzLXN5bWJvbDwvdGl0bGU+CiAgICA8ZGVmcz48L2RlZnM+CiAgICA8ZyBpZD0iaWNvbnMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJTeW1ib2xzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtODgxLjAwMDAwMCwgLTcyNC4wMDAwMDApIj4KICAgICAgICAgICAgPGcgaWQ9Im1pbnVzLXN5bWJvbCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODgxLjAwMDAwMCwgNzI0LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPHJlY3QgaWQ9ImZpbGwtMiIgZmlsbD0iIzQzNDc1MiIgeD0iMCIgeT0iMCIgd2lkdGg9IjM0IiBoZWlnaHQ9IjM0Ij48L3JlY3Q+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTAsMTcgTDI0LDE3IiBpZD0iZmlsbC0xIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj48L3BhdGg+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==);
    &:disabled {
      background-image: $disabled-zoom-out;
    }
  }
}

div.map-large.dark-gray-theme div.day-map-large button {
  &#fmi-warnings-zoom-in {
    background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjM0cHgiIGhlaWdodD0iMzRweCIgdmlld0JveD0iMCAwIDM0IDM0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPHRpdGxlPnBsdXMtc3ltYm9sPC90aXRsZT4KICAgIDxkZWZzPjwvZGVmcz4KICAgIDxnIGlkPSJpY29ucyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IlN5bWJvbHMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC04MzcuMDAwMDAwLCAtNzI0LjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0icGx1cy1zeW1ib2wiIHRyYW5zZm9ybT0idHJhbnNsYXRlKDgzNy4wMDAwMDAsIDcyNC4wMDAwMDApIj4KICAgICAgICAgICAgICAgIDxyZWN0IGlkPSJmaWxsLTMiIGZpbGw9IiM0MzQ3NTIiIHg9IjAiIHk9IjAiIHdpZHRoPSIzNCIgaGVpZ2h0PSIzNCI+PC9yZWN0PgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTE3LDI0IEwxNywxMCIgaWQ9ImZpbGwtMiIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+PC9wYXRoPgogICAgICAgICAgICAgICAgPHBhdGggZD0iTTEwLDE3IEwyNCwxNyIgaWQ9ImZpbGwtMSIgc3Ryb2tlPSIjRkZGRkZGIiBzdHJva2Utd2lkdGg9IjIiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCI+PC9wYXRoPgogICAgICAgICAgICA8L2c+CiAgICAgICAgPC9nPgogICAgPC9nPgo8L3N2Zz4=);
    &:disabled {
      background-image: $disabled-zoom-in;
    }
  }
  &#fmi-warnings-zoom-out {
    background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjM0cHgiIGhlaWdodD0iMzRweCIgdmlld0JveD0iMCAwIDM0IDM0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPHRpdGxlPm1pbnVzLXN5bWJvbDwvdGl0bGU+CiAgICA8ZGVmcz48L2RlZnM+CiAgICA8ZyBpZD0iaWNvbnMiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxnIGlkPSJTeW1ib2xzIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSgtODgxLjAwMDAwMCwgLTcyNC4wMDAwMDApIj4KICAgICAgICAgICAgPGcgaWQ9Im1pbnVzLXN5bWJvbCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODgxLjAwMDAwMCwgNzI0LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPHJlY3QgaWQ9ImZpbGwtMiIgZmlsbD0iIzQzNDc1MiIgeD0iMCIgeT0iMCIgd2lkdGg9IjM0IiBoZWlnaHQ9IjM0Ij48L3JlY3Q+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTAsMTcgTDI0LDE3IiBpZD0iZmlsbC0xIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj48L3BhdGg+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==);
    &:disabled {
      background-image: $disabled-zoom-out;
    }
  }
}

div.day-map-large
  div#fmi-warnings-region-tooltip-reference
  > div#fmi-warnings-region-tooltip.tooltip.b-tooltip {
  opacity: 1;
}

#fmi-warnings-region-tooltip-reference {
  position: absolute;
  width: 1px;
  height: 1px;
  background-color: transparent;
  pointer-events: none;
  z-index: 8;
}

.fmi-warnings-popup {
  position: absolute;
  padding: 0;
  border-radius: 1px;
  bottom: 12px;
  left: -50px;
  min-width: $popup-width;
  z-index: 9;
  cursor: default;
  pointer-events: auto;
}

.light-theme .fmi-warnings-popup {
  background-color: $light-popup-background-color;
  box-shadow: 0 0 0 1px $light-gray;
}

.dark-theme .fmi-warnings-popup {
  background-color: $dark-popup-background-color;
  box-shadow: 0 0 0 1px $dark-gray;
}

.light-gray-theme .fmi-warnings-popup {
  background-color: $light-popup-background-color;
  box-shadow: 0 0 0 1px $light-gray;
}

.dark-gray-theme .fmi-warnings-popup {
  background-color: $dark-popup-background-color;
  box-shadow: 0 0 0 1px $dark-gray;
}

.tooltip.bs-tooltip-top {
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
    top: -11px;
    z-index: 10;
  }

  .arrow::before {
    border: 10px solid transparent;
    left: -10px;
    top: -11px;
    z-index: 9;
  }

  &.light-theme {
    .arrow {
      border-top-color: $light-popup-border-color;
    }

    .arrow::before {
      border-top-color: $light-popup-background-color;
    }
  }

  &.dark-theme {
    .arrow {
      border-top-color: $dark-popup-border-color;
    }

    .arrow::before {
      border-top-color: $dark-popup-background-color;
    }
  }

  &.light-gray-theme {
    .arrow {
      border-top-color: $light-gray-popup-border-color;
    }

    .arrow::before {
      border-top-color: $light-gray-popup-background-color;
    }
  }

  &.dark-gray-theme {
    .arrow {
      border-top-color: $dark-gray-popup-border-color;
    }

    .arrow::before {
      border-top-color: $dark-gray-popup-background-color;
    }
  }
}

@media (forced-colors: active) {
  .arrow {
    forced-color-adjust: none;
  }
}

button.fmi-warnings-popup-closer {
  cursor: pointer;
  border: none;
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
  }
}

.region-popup {
  width: 100%;
  cursor: default;
}

.light-theme .region-popup {
  background-color: $light-popup-background-color;
}

.dark-theme .region-popup {
  background-color: $dark-popup-background-color;
}

.light-gray-theme .region-popup {
  background-color: $light-gray-popup-background-color;
}

.dark-gray-theme .region-popup {
  background-color: $dark-gray-popup-background-color;
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

.light-theme span.region-popup-header-text {
  color: $black;
}

.dark-theme span.region-popup-header-text {
  color: $black;
}

.light-gray-theme div.region-popup-header {
  &.level-0 > span.region-popup-header-text {
    color: $black;
  }
  &.level-1 > span.region-popup-header-text {
    color: $black;
  }
  &.level-2 > span.region-popup-header-text {
    color: $black;
  }
  &.level-3 > span.region-popup-header-text {
    color: $white;
  }
  &.level-4 > span.region-popup-header-text {
    color: $white;
  }
}

.dark-gray-theme div.region-popup-header {
  &.level-0 > span.region-popup-header-text {
    color: $black;
  }
  &.level-1 > span.region-popup-header-text {
    color: $black;
  }
  &.level-2 > span.region-popup-header-text {
    color: $black;
  }
  &.level-3 > span.region-popup-header-text {
    color: $white;
  }
  &.level-4 > span.region-popup-header-text {
    color: $white;
  }
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

.light-theme .region-popup-body {
  background-color: $light-popup-background-color;
}

.dark-theme .region-popup-body {
  background-color: $dark-popup-background-color;
}

.light-gray-theme .region-popup-body {
  background-color: $light-gray-popup-background-color;
}

.dark-gray-theme .region-popup-body {
  background-color: $dark-gray-popup-background-color;
}

.light-theme {
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

.dark-theme {
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

.light-gray-theme {
  .shadow-level-0 {
    background-color: $light-gray-green-shadow !important;
  }

  .shadow-level-1 {
    background-color: $light-gray-green-shadow !important;
  }

  .shadow-level-2 {
    background-color: $light-gray-yellow-shadow !important;
  }

  .shadow-level-3 {
    background-color: $light-gray-orange-shadow !important;
  }

  .shadow-level-4 {
    background-color: $light-gray-red-shadow !important;
  }
}

.dark-gray-theme {
  .shadow-level-0 {
    background-color: $dark-gray-green-shadow !important;
  }

  .shadow-level-1 {
    background-color: $dark-gray-green-shadow !important;
  }

  .shadow-level-2 {
    background-color: $dark-gray-yellow-shadow !important;
  }

  .shadow-level-3 {
    background-color: $dark-gray-orange-shadow !important;
  }

  .shadow-level-4 {
    background-color: $dark-gray-red-shadow !important;
  }
}

@media (forced-colors: active) {
  .shadow-level-0,
  .shadow-level-1,
  .shadow-level-2,
  .shadow-level-3,
  .shadow-level-4 {
    forced-color-adjust: none;
  }
  path.border-path {
    stroke: $gray;
  }
}

:deep(div.tooltip-inner) {
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

.light-theme .popup-table-heading {
  background-color: $light-popup-table-background-color;
}

.dark-theme .popup-table-heading {
  background-color: $dark-popup-table-background-color;
}

.light-gray-theme {
  .popup-table-heading {
    background-color: $light-gray-popup-table-background-color;
  }
  .popup-table {
    border-top: solid 1px $light-gray;
  }
}

.dark-gray-theme {
  .popup-table-heading {
    background-color: $dark-gray-popup-table-background-color;
  }
  .popup-table {
    border-top: solid 1px $dark-gray;
  }
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

.light-theme .popup-table-heading {
  background-color: $light-popup-table-background-color;
}

.dark-theme .popup-table-heading {
  background-color: $dark-popup-table-background-color;
}

.light-gray-theme .popup-table-heading {
  background-color: $light-gray-popup-table-background-color;
}

.dark-gray-theme .popup-table-heading {
  background-color: $dark-gray-popup-table-background-color;
}

.popup-table-foot {
  display: table-footer-group;
  font-weight: bold;
}

.light-theme .popup-table-foot {
  background-color: $light-popup-table-background-color;
}

.dark-theme .popup-table-foot {
  background-color: $dark-popup-table-background-color;
}

.light-gray-theme .popup-table-foot {
  background-color: $light-gray-popup-table-background-color;
}

.dark-gray-theme .popup-table-foot {
  background-color: $dark-gray-popup-table-background-color;
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

@media (width < 576px) {
  button.fmi-warnings-map-tool {
    display: none;
  }
}
</style>

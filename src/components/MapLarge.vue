<template>
    <div class="map-large" tabindex="0">
        <div class="day-map-large">
            <svg xmlns="http://www.w3.org/2000/svg" version="1.2" baseProfile="tiny" width="440" height="550"
                 viewBox="0 0 440 550" stroke-linecap="round" stroke-linejoin="round" id="finland-large">
                <g>
                    <path v-for="path in paths" :key="path.key" stroke="#000000" :stroke-width="path.strokeWidth"
                          :fill="path.fill" :d="path.d" :opacity="path.opacity" pointer-events="fill"
                          :data-region="path.dataRegion" :data-severity="path.dataSeverity" @click="regionClicked"
                          style="cursor: pointer"/>
                    <path v-for="coverage in coverages" :key="coverage.key" stroke="#000000" :stroke-width="coverage.strokeWidth"
                          :fill="coverage.fill" :d="coverage.d" :opacity="coverage.opacity" style="cursor: pointer;pointer-events: none"/>
                </g>
                <svg version="1.2" v-for="icon in icons" v-bind:key="icon.key" :x="icon.x" :y="icon.y" :width="icon.width"
                     :height="icon.height" :viewBox="icon.viewBox" v-html="icon.geom" pointer-events="none" />
                <svg version="1.2" v-for="icon in coverageIcons" v-bind:key="icon.key" :x="icon.x" :y="icon.y" :width="icon.width"
                     :height="icon.height" :viewBox="icon.viewBox" v-html="icon.geom" pointer-events="none" />
            </svg>
            <b-button id="fmi-warnings-zoom-in" class="fmi-warnings-zoom" v-on:click="zoomIn" :aria-label="zoomInText"></b-button>
            <b-button id="fmi-warnings-zoom-out" class="fmi-warnings-zoom" v-on:click="zoomOut" :aria-label="zoomOutText"></b-button>
            <div id="fmi-warnings-region-tooltip-reference" :style="tooltipStyle"></div>
            <b-tooltip id="fmi-warnings-region-tooltip" :show.sync="showTooltip" triggers=""
                       target="fmi-warnings-region-tooltip-reference" placement="top" delay=0
                       container="fmi-warnings-region-tooltip-reference">
                <div class="ol-popup" id="day-map-large-base-popup"><a
                        :class="['ol-popup-closer', `shadow-${popupLevel}`]"
                        id="day-map-large-base-popup-closer"
                        href="#"
                        v-on:click="closeTooltip"
                ></a>
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
                                            <PopupRow v-for="popupWarning in popupWarnings" v-bind:key="popupWarning.id"
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
        <div :class="{'prevent-tooltip': dragging}"></div>
    </div>
</template>

<script>
import Panzoom from '@panzoom/panzoom';
import i18n from '../i18n';
import config from '../mixins/config';
import utils from '../mixins/utils';
import PopupRow from './PopupRow.vue';

export default {
  name: 'MapLarge',
  components: { PopupRow },
  props: {
    index: {
      type: Number,
    },
    input: {
      type: Object,
    },
  },
  mixins: [config, utils],
  computed: {
    zoomInText() {
      return i18n.t('zoomIn');
    },
    zoomOutText() {
      return i18n.t('zoomOut');
    },
    tooltipStyle() {
      return `left: ${this.tooltipX}px; top: ${this.tooltipY}px`;
    },
    paths() {
      return this.regionIds.reduce((regions, regionId) => {
        if (this.geometries[regionId].pathLarge) {
          const visualization = this.regionVisualization(regionId);
          regions.push({
            key: `large-${regionId}`,
            fill: visualization.color,
            d: visualization.visible ? visualization.geom.pathLarge : '',
            opacity: '1',
            dataRegion: regionId,
            dataSeverity: visualization.severity,
            strokeWidth: String(0.7 - 0.1 * (this.scale - 1)),
          });
        }
        return regions;
      }, []);
    },
    coverages() {
      return this.coverageGeom('coverages');
    },
    iconSize() {
      return 28 - 4 * this.scale;
    },
    maxWarningIcons() {
      return this.scale + 1;
    },
    icons() {
      const data = [];
      const warnings = this.$store.getters.warnings;
      const visibleWarnings = this.$store.getters.visibleWarnings;
      const maxWarningIcons = this.maxWarningIcons;
      this.regionIds.forEach((regionId) => {
        const region = this.regionData(regionId);
        if ((region != null) && (this.geometries[regionId].children.length === 0)) {
          const iconSizes = [];
          const aspectRatios = [];
          const keys = [];
          const geoms = [];
          region.warnings.forEach((regionWarning, index, regionWarnings) => {
            const identifier = regionWarning.identifiers[0];
            if ((visibleWarnings.includes(regionWarning.type)) && (warnings[identifier].covRegions.size === 0) && (!warnings[identifier].mergedIcons.has(regionId)) && (iconSizes.length < maxWarningIcons)) {
              const icon = ((iconSizes.length === maxWarningIcons - 1) && (regionWarnings.length > maxWarningIcons)) ?
                this.warningIcon({ type: this.MULTIPLE }) : this.warningIcon(warnings[identifier]);
              const scale = icon.scale ? icon.scale : 1;
              const width = (scale * icon.scale * icon.aspectRatio[0] * this.iconSize) / icon.aspectRatio[1];
              const height = scale * icon.scale * this.iconSize;
              iconSizes.push([width, height]);
              aspectRatios.push(icon.aspectRatio);
              geoms.push(icon.geom);
              keys.push(`${regionId}-${identifier}`);
            }
          });
          let offsetX = -iconSizes.reduce((acc, iconSize) => acc + iconSize[0], 0) / 2;
          const coords = this.geometries[regionId].center;
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
            });
            offsetX += iconSize[0];
          });
        }
      });
      return data;
    },
    coverageIcons() {
      const warnings = this.$store.getters.warnings;
      const visibleWarnings = this.$store.getters.visibleWarnings;
      return this.coverageWarnings.reduce((iconData, warningId) => {
        const warning = warnings[warningId];
        if ((visibleWarnings.includes(warning.type)) && (warning.coverages.length > 0)) {
          const reference = warning.coverages[0].reference;
          const icon = this.warningIcon(warning);
          const scale = icon.scale ? icon.scale : 1;
          const width = (scale * icon.scale * icon.aspectRatio[0] * this.iconSize) / icon.aspectRatio[1];
          const height = scale * icon.scale * this.iconSize;
          iconData.push({
            key: warningId + Math.random(),
            x: `${reference[0] - width / 2}px`,
            y: `${reference[1] - height / 2}px`,
            width,
            height,
            version: '1.1',
            viewBox: `0 0 ${icon.aspectRatio[0]} ${icon.aspectRatio[1]}`,
            geom: icon.geom,
          });
        }
        return iconData;
      }, []);
    },
    regionTitle() {
      return i18n.t(this.popupRegion.name);
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
    };
  },
  watch: {
    scale() {
      if (this.scale === 1) {
        this.panzoom.setOptions({
          touchAction: '',
        });
        this.panzoom.reset({
          animate: false,
        });
      } else {
        this.panzoom.setOptions({
          touchAction: 'none',
        });
      }
    },
    input() {
      this.coverageRegions = {};
      this.coverageWarnings = [];
    },
  },
  methods: {
    regionClicked(event) {
      const regionId = event.target.dataset.region;
      let severity = Number(event.target.dataset.severity);
      if ((this.coverageRegions[regionId] != null) && (this.coverageRegions[regionId] > severity)) {
        severity = this.coverageRegions[regionId];
      }
      this.popupLevel = `level-${severity}`;
      this.popupRegion = this.geometries[regionId];
      const region = this.input[this.popupRegion.type].find((regionWarning) => regionWarning.key === regionId);
      let popupWarnings = [];
      if (region != null) {
        region.warnings.forEach((warningByType) => {
          warningByType.identifiers.forEach((identifier) => {
            const warning = this.$store.getters.warnings[identifier];
            popupWarnings.push({
              type: warningByType.type,
              severity: warning.severity,
              direction: warning.direction,
              text: warning.text != null ? warning.text : '',
              interval: warning.validInterval,
            });
          });
        });
      } else {
        popupWarnings = [{
          type: '',
          severity: 0,
          direction: 0,
          text: '',
          interval: i18n.t('popupNoWarnings'),
        }];
      }
      this.popupWarnings = popupWarnings;
      this.tooltipX = event.layerX;
      this.tooltipY = event.layerY;
      this.showTooltip = true;
    },
    zoomIn() {
      this.panzoom.zoom(this.panzoom.getScale() + 1, {
        force: true,
      });
    },
    zoomOut() {
      this.panzoom.zoom(this.panzoom.getScale() - 1, {
        force: true,
      });
    },
    closeTooltip(event) {
      event.preventDefault();
      this.showTooltip = false;
    },
  },
  mounted() {
    const finlandLarge = document.getElementById('finland-large');
    this.panzoom = Panzoom(finlandLarge, {
      disableZoom: true,
      panOnlyWhenZoomed: true,
      animate: false,
      origin: '50% 50%',
      minScale: 1,
      maxScale: 3,
      touchAction: '',
    });
    finlandLarge.addEventListener('panzoomzoom', () => {
      this.scale = this.panzoom.getScale();
      this.showTooltip = false;
    });
    finlandLarge.addEventListener('panzoompan', (event) => {
      const eventDetail = event.detail;
      if (eventDetail == null) {
        return;
      }
      let panned = false;
      ['x', 'y'].forEach((axis) => {
        if (eventDetail[axis] !== this.pan[axis]) {
          this.pan[axis] = eventDetail[axis];
          panned = true;
        }
      });
      if (panned) {
        this.showTooltip = false;
        this.dragging = true;
      }
    });
    finlandLarge.addEventListener('panzoomend', () => {
      this.dragging = false;
    });
  },
};
</script>

<style scoped lang="scss">
    @import "../scss/constants.scss";
    @import "../scss/warningImages.scss";

    div.map-large {
        display: inline-block;
        width: $map-large-width;
        height: $map-large-height;
        background-color: rgba(0, 0, 0, 0);
    }

    button.fmi-warnings-zoom {
        position: absolute;
        right: 10px;
        border-color: #53b9e6;
        height: 35px;
        width: 35px;
        background-repeat: no-repeat;
        background-position: center;
        cursor: pointer;
    }

    button#fmi-warnings-zoom-in {
        top: 10px;
        border-radius: 2px 2px 0 0;
        background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjM0cHgiIGhlaWdodD0iMzRweCIgdmlld0JveD0iMCAwIDM0IDM0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzLjcuMSAoMjgyMTUpIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPgogICAgPHRpdGxlPnBsdXMtc3ltYm9sPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9Imljb25zIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyBpZD0iU3ltYm9scyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTgzNy4wMDAwMDAsIC03MjQuMDAwMDAwKSI+CiAgICAgICAgICAgIDxnIGlkPSJwbHVzLXN5bWJvbCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODM3LjAwMDAwMCwgNzI0LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPHJlY3QgaWQ9ImZpbGwtMyIgZmlsbD0iIzUzQjlFNiIgeD0iMCIgeT0iMCIgd2lkdGg9IjM0IiBoZWlnaHQ9IjM0Ij48L3JlY3Q+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTcsMjQgTDE3LDEwIiBpZD0iZmlsbC0yIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj48L3BhdGg+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTAsMTcgTDI0LDE3IiBpZD0iZmlsbC0xIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj48L3BhdGg+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==);
    }

    button#fmi-warnings-zoom-out {
        top: 46px;
        border-radius: 0 0 2px 2px;
        background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjM0cHgiIGhlaWdodD0iMzRweCIgdmlld0JveD0iMCAwIDM0IDM0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzLjcuMSAoMjgyMTUpIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPgogICAgPHRpdGxlPm1pbnVzLXN5bWJvbDwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxkZWZzPjwvZGVmcz4KICAgIDxnIGlkPSJpY29ucyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IlN5bWJvbHMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC04ODEuMDAwMDAwLCAtNzI0LjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0ibWludXMtc3ltYm9sIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg4ODEuMDAwMDAwLCA3MjQuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8cmVjdCBpZD0iZmlsbC0yIiBmaWxsPSIjNTNCOUU2IiB4PSIwIiB5PSIwIiB3aWR0aD0iMzQiIGhlaWdodD0iMzQiPjwvcmVjdD4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xMCwxNyBMMjQsMTciIGlkPSJmaWxsLTEiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiPjwvcGF0aD4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+);
    }

    #fmi-warnings-region-tooltip {
        opacity: 1;
    }

    #fmi-warnings-region-tooltip-reference {
        position: absolute;
        width: 1px;
        height: 1px;
        background-color: rgba(0, 0, 0, 0);
        pointer-events: none;
    }

    .ol-popup {
        position: absolute;
        background-color: white;
        -webkit-filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
        filter: drop-shadow(0 1px 4px rgba(0, 0, 0, 0.2));
        padding: 0;
        border-radius: 1px;
        bottom: 12px;
        left: -50px;
        min-width: 275px;
        width: 275px;
        max-width: 275px;
        z-index: 9;
    }

    ::v-deep .tooltip.bs-tooltip-top {

        .arrow, .arrow::before {
            content: " ";
            height: 0;
            width: 0;
            position: absolute;
            pointer-events: none;
        }

        .arrow {
            padding: 0;
            border-radius: 1px;
            border: 11px solid transparent;
            border-top-color: $dark-gray;
            left: 60px;
            margin-left: -11px;
            top: 0;
            z-index: 10;
        }

        .arrow::before {
            border: 10px solid transparent;
            border-top-color: $white;
            left: -10px;
            top: -11px;
            z-index: 9;
        }
    }

    a.ol-popup-closer {
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
        }
    }

    .region-popup {
        width: 100%;
        background-color: white;
        cursor: default;
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
        background-color: white;
        padding: 0 0 0 0;
    }

    #day-map-large-base-popup {
        margin-right: 20px;
    }

    .shadow-level-0 {
        background-color: $green-shadow !important;
    }

    .shadow-level-1 {
        background-color: $green-shadow !important;
    }

    .shadow-level-2 {
        background-color: $yellow-shadow !important;
    }

    .shadow-level-3 {
        background-color: $orange-shadow !important;
    }

    .shadow-level-4 {
        background-color: $red-shadow !important;
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
        background-color: #EEE;
        display: table-header-group;
    }

    .popup-table-head {
        display: table-cell;
        vertical-align: middle;
        text-align: left;
    }

    .popup-table-heading {
        background-color: #EEE;
        display: table-header-group;
        font-weight: bold;
    }

    .popup-table-foot {
        background-color: #EEE;
        display: table-footer-group;
        font-weight: bold;
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

    svg#finland-large {
        cursor: default !important;
    }

    @media (max-width: 767px) {
        div.map-large {
            min-width: 100%;
            width: 100%;
            max-width: 100%;
        }
    }

    @media (max-width: 575px) {
        button.fmi-warnings-zoom {
            display: none;
        }
    }
</style>

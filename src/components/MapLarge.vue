<template>
    <div class="map-large">
        <div class="day-map-large">
            <svg xmlns="http://www.w3.org/2000/svg" version="1.2" baseProfile="tiny" width="440" height="550"
                 viewBox="0 0 440 550" stroke-linecap="round" stroke-linejoin="round">
                <g id="finland-large">
                    <path v-for="path in paths" :key="path.key" stroke="#000000" :stroke-width="path.strokeWidth"
                          :fill="path.fill" :d="path.d" :opacity="path.opacity" pointer-events="fill"
                          :data-region="path.dataRegion" v-on:click="regionClicked" style="cursor: pointer"/>
                </g>
            </svg>
            <b-button id="fmi-warnings-zoom-in" class="fmi-warnings-zoom" v-on:click="zoomIn"></b-button>
            <b-button id="fmi-warnings-zoom-out" class="fmi-warnings-zoom" v-on:click="zoomOut"></b-button>
            <div id="fmi-warnings-region-tooltip-reference" :style="`left: ${tooltipX} top: ${tooltipY}`" v-b-tooltip.hover="{ id: 'fmi-warnings-region-tooltip', html: true, placement: 'top', delay: 0, fallbackPlacement: []}" title="test"></div>
        </div>
    </div>
</template>

<script>
import Panzoom from '@panzoom/panzoom';
import i18n from '../i18n';
import config from '../mixins/config';
import geometry from '../mixins/geometry';
import utils from '../mixins/utils';

export default {
  name: 'MapLarge',
  props: {
    index: {
      type: Number,
    },
    input: {
      type: Object,
      default: () => ({}),
    },
  },
  mixins: [config, geometry, utils],
  computed: {
    warnings() {
      return i18n.t('warnings');
    },
    paths() {
      return this.regionIds.map((regionId) => {
        const regionGeom = this.geometries[regionId];
        const regionColor = this.regionColor(regionId);
        const visible = ((regionGeom.subType !== this.REGION_LAKE) || (regionColor !== this.colors.sea));
        return {
          key: `large-${regionId}`,
          fill: regionColor,
          d: regionGeom.pathLarge,
          opacity: visible ? '1' : '0',
          dataRegion: regionId,
          strokeWidth: String(0.7 - 0.1 * (this.scale - 1)),
        };
      });
    },
  },
  data: () => ({
    warningsDate: '',
    updated: '',
    updatedDate: '',
    atTime: '',
    updatedTime: '',
    dataProviderFirst: '',
    dataProviderSecond: '',
    tooltipX: 0,
    tooltipY: 0,
    scale: 1,
  }),
  watch: {
    scale() {
      if (this.scale === 1) {
        this.panzoom.reset({
          animate: false,
        });
      }
    },
  },
  methods: {
    regionClicked(event) {
      console.log('clicked');
      console.log(event.target.dataset.region);
      console.log(event.clientX);
      console.log(event.clientY);
      this.tooltipX = event.clientX;
      this.tooltipY = event.clientY;
      this.$root.$emit('bv::enable::tooltip', 'fmi-warnings-region-tooltip');
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
    });
    finlandLarge.addEventListener('panzoomchange', (event) => {
      this.scale = this.panzoom.getScale();
    });
  },
};
</script>

<style scoped lang="scss">
    @import "../scss/constants.scss";

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
        top: 0;
        border-radius: 2px 2px 0 0;
        background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjM0cHgiIGhlaWdodD0iMzRweCIgdmlld0JveD0iMCAwIDM0IDM0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzLjcuMSAoMjgyMTUpIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPgogICAgPHRpdGxlPnBsdXMtc3ltYm9sPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGRlZnM+PC9kZWZzPgogICAgPGcgaWQ9Imljb25zIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8ZyBpZD0iU3ltYm9scyIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoLTgzNy4wMDAwMDAsIC03MjQuMDAwMDAwKSI+CiAgICAgICAgICAgIDxnIGlkPSJwbHVzLXN5bWJvbCIgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoODM3LjAwMDAwMCwgNzI0LjAwMDAwMCkiPgogICAgICAgICAgICAgICAgPHJlY3QgaWQ9ImZpbGwtMyIgZmlsbD0iIzUzQjlFNiIgeD0iMCIgeT0iMCIgd2lkdGg9IjM0IiBoZWlnaHQ9IjM0Ij48L3JlY3Q+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTcsMjQgTDE3LDEwIiBpZD0iZmlsbC0yIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj48L3BhdGg+CiAgICAgICAgICAgICAgICA8cGF0aCBkPSJNMTAsMTcgTDI0LDE3IiBpZD0iZmlsbC0xIiBzdHJva2U9IiNGRkZGRkYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIj48L3BhdGg+CiAgICAgICAgICAgIDwvZz4KICAgICAgICA8L2c+CiAgICA8L2c+Cjwvc3ZnPg==);
    }

    button#fmi-warnings-zoom-out {
        top: 36px;
        border-radius: 0 0 2px 2px;
        background-image: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+Cjxzdmcgd2lkdGg9IjM0cHgiIGhlaWdodD0iMzRweCIgdmlld0JveD0iMCAwIDM0IDM0IiB2ZXJzaW9uPSIxLjEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiPgogICAgPCEtLSBHZW5lcmF0b3I6IFNrZXRjaCAzLjcuMSAoMjgyMTUpIC0gaHR0cDovL3d3dy5ib2hlbWlhbmNvZGluZy5jb20vc2tldGNoIC0tPgogICAgPHRpdGxlPm1pbnVzLXN5bWJvbDwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxkZWZzPjwvZGVmcz4KICAgIDxnIGlkPSJpY29ucyIgc3Ryb2tlPSJub25lIiBzdHJva2Utd2lkdGg9IjEiIGZpbGw9Im5vbmUiIGZpbGwtcnVsZT0iZXZlbm9kZCI+CiAgICAgICAgPGcgaWQ9IlN5bWJvbHMiIHRyYW5zZm9ybT0idHJhbnNsYXRlKC04ODEuMDAwMDAwLCAtNzI0LjAwMDAwMCkiPgogICAgICAgICAgICA8ZyBpZD0ibWludXMtc3ltYm9sIiB0cmFuc2Zvcm09InRyYW5zbGF0ZSg4ODEuMDAwMDAwLCA3MjQuMDAwMDAwKSI+CiAgICAgICAgICAgICAgICA8cmVjdCBpZD0iZmlsbC0yIiBmaWxsPSIjNTNCOUU2IiB4PSIwIiB5PSIwIiB3aWR0aD0iMzQiIGhlaWdodD0iMzQiPjwvcmVjdD4KICAgICAgICAgICAgICAgIDxwYXRoIGQ9Ik0xMCwxNyBMMjQsMTciIGlkPSJmaWxsLTEiIHN0cm9rZT0iI0ZGRkZGRiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiPjwvcGF0aD4KICAgICAgICAgICAgPC9nPgogICAgICAgIDwvZz4KICAgIDwvZz4KPC9zdmc+);
    }

    #fmi-warnings-region-tooltip-reference {
        position: absolute;
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

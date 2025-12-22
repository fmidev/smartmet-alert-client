/**
 * Alert client configuration composable
 *
 * Provides configuration data including geometries, colors, and warning icons.
 * This is a large static configuration that includes region paths and warning icons.
 */

import svgpath from 'svgpath'
import type {
  ThemeColorMap,
  WarningType,
  WarningIcon,
  WarningIconInput,
  RegionType,
  GeometryCollection,
} from '@/types'

// Import geometry data from JSON file
import geometryData from '@/data/geometries.json'

export interface BboxGeometry {
  type: string
  coordinates: number[][][]
}

export interface BboxData {
  type: string
  id: string
  geometry: {
    type: string
    geometries: BboxGeometry[]
  }
  geometry_name: string
  properties: Record<string, unknown>
}

// Constants used across the application
export const NUMBER_OF_DAYS = 5
export const REGION_LAND = 'land'
export const REGION_SEA = 'sea'
export const REGION_LAKE = 'lake'

// API field names
export const WEATHER_UPDATE_TIME = 'weather_update_time'
export const FLOOD_UPDATE_TIME = 'flood_update_time'
export const UPDATE_TIME = 'update_time'
export const WEATHER_WARNINGS = 'weather_finland_active_all'
export const FLOOD_WARNINGS = 'flood_finland_active_all'

// Warning property keys
export const INFO_FI = 'info_fi'
export const INFO_SV = 'info_sv'
export const INFO_EN = 'info_en'
export const PHYSICAL_DIRECTION = 'physical_direction'
export const PHYSICAL_VALUE = 'physical_value'
export const EFFECTIVE_FROM = 'effective_from'
export const EFFECTIVE_UNTIL = 'effective_until'
export const ONSET = 'onset'
export const EXPIRES = 'expires'
export const WARNING_CONTEXT = 'warning_context'
export const SEVERITY = 'severity'
export const CONTEXT_EXTENSION = 'context_extension'

// Warning types
export const WIND = 'wind'
export const SEA_WIND = 'sea-wind'
export const FLOOD_LEVEL_TYPE = 'floodLevel'
export const MULTIPLE = 'multiple'

// Warning levels
export const WARNING_LEVELS = [
  'level-1',
  'level-2',
  'level-3',
  'level-4',
] as const
export type WarningLevelType = (typeof WARNING_LEVELS)[number]

// Flood severity mapping
export const FLOOD_LEVELS: Record<string, number> = {
  minor: 1,
  moderate: 2,
  severe: 3,
  extreme: 4,
}

export interface ConfigData {
  defaultGeometryId: string
  timeZone: string
  dateTimeFormatLocale: string
  panLimits: { x: number; y: number }
  coverageCriterion: number
  maxMergedWeight: number
  maxUpdateDelay: Record<string, number>
  warningTypes: Map<WarningType | string, RegionType>
  regionIds: string[]
  geometries: GeometryCollection
  colors: ThemeColorMap
  bbox: BboxData
}

export interface UseConfigReturn extends ConfigData {
  warningIcon: (warning: WarningIconInput) => WarningIcon
}

// Type assertion for imported JSON data
const geometriesData = geometryData.geometries as unknown as GeometryCollection
const bboxData = geometryData.bbox as BboxData

const colorsData: ThemeColorMap = {
  'light-theme': {
    sea: '#bee2f1',
    levels: ['#6af86a', '#6af86a', '#f8f800', '#f9bf2e', '#ff0909'],
    missing: '#f8f8f8',
    stroke: '#000000',
  },
  'dark-theme': {
    sea: '#bee2f1',
    levels: ['#6af86a', '#6af86a', '#f8f800', '#f9bf2e', '#ff0909'],
    missing: '#f8f8f8',
    stroke: '#282828',
  },
  'light-gray-theme': {
    sea: '#ffffff',
    levels: ['#ffffff', '#ffffff', '#aaaaaa', '#555555', '#000000'],
    missing: '#f8f8f8',
    stroke: '#666666',
  },
  'dark-gray-theme': {
    sea: '#ffffff',
    levels: ['#ffffff', '#ffffff', '#aaaaaa', '#555555', '#000000'],
    missing: '#f8f8f8',
    stroke: '#808080',
  },
}

const warningTypesMap = new Map<WarningType | string, RegionType>([
  ['thunderStorm', 'land'],
  ['wind', 'land'],
  ['rain', 'land'],
  ['trafficWeather', 'land'],
  ['pedestrianSafety', 'land'],
  ['forestFireWeather', 'land'],
  ['grassFireWeather', 'land'],
  ['hotWeather', 'land'],
  ['coldWeather', 'land'],
  ['uvNote', 'land'],
  ['floodLevel', 'land'],
  ['seaWind', 'sea'],
  ['seaThunderStorm', 'sea'],
  ['seaWaterHeightHighWater', 'sea'],
  ['seaWaterHeightShallowWater', 'sea'],
  ['seaWaveHeight', 'sea'],
  ['seaIcing', 'sea'],
])

const regionIdsData = [
  'sea_region.B5E',
  'sea_region.B5W',
  'sea_region.B7E',
  'sea_region.B7W',
  'sea_region.B4W',
  'sea_region.B4E',
  'sea_region.B3S',
  'sea_region.B3N',
  'sea_region.B2',
  'sea_region.B1S',
  'sea_region.B1N',
  'county.21',
  'county.2',
  'county.4',
  'county.1',
  'county.5',
  'county.7',
  'county.8',
  'county.9',
  'county.6',
  'county.13',
  'county.10',
  'county.11',
  'county.12',
  'county.14',
  'county.15',
  'county.16',
  'county.17',
  'county.18',
  'county.19',
  'municipality_139_208_244_317_425_436_483_494_535_563_564_625_626_630_678_69_691_71_72_746_748_785_791_859_889_9.977',
  'municipality.615',
  'municipality.832',
  'municipality.305',
  'municipality.751',
  'municipality.683',
  'municipality.614',
  'municipality.240',
  'municipality.241',
  'municipality.851',
  'municipality.976',
  'municipality.845',
  'municipality.854',
  'municipality.698',
  'municipality.320',
  'municipality.732',
  'municipality.273',
  'municipality.498',
  'municipality.261',
  'municipality.758',
  'municipality.583',
  'municipality.742',
  'municipality.47',
  'municipality.148',
  'municipality.890',
  'sea_region_south.FI-115978',
  'sea_region_north.FI-115978',
]

/**
 * Generate SVG geometry for a warning icon based on type and severity
 */
function warningIcon(warning: WarningIconInput): WarningIcon {
  const icon: WarningIcon = {
    aspectRatio: [1, 1],
    scale: 1,
  }

  switch (warning.type) {
    case 'thunderStorm':
      icon.aspectRatio = [14, 22]
      icon.geom = `
        <title>thunder-symbol</title>
        <g id="icons" stroke="rgba(255, 255, 255, 1)" stroke-width="2.5px" paint-order="stroke" fill="none" fill-rule="evenodd">
            <g id="Symbols" transform="translate(-13, -10)">
                <polygon id="fill-1" fill="#221F20"
                         points="17.09 10.133 14.356 19.639 19.145 19.639 16.438 31.244 25.636 16.163 20.658 16.163 23.371 10.133"></polygon>
            </g>
        </g>`
      break
    case 'wind':
      icon.aspectRatio = [16, 16]
      icon.scale = 0.9
      icon.geom = `
        <title>wind-symbol</title>
        <path d="${svgpath(
          'M 12.141 9.332 L 6.844 14.039 L 12.141 18.746 L 12.141 16.395 L 19.835 16.395 L 19.835 11.688 L 12.141 11.688 Z M 12.141 9.332'
        )
          .translate(-5.7, -7)
          .rotate(warning.direction ?? 0, 8, 8)
          .toString()}" fill="#221F20" stroke="rgba(255, 255, 255, 1)" stroke-width="2.5px" paint-order="stroke" />
      }`
      break
    case 'rain':
      icon.aspectRatio = [20, 17]
      icon.scale = 0.8
      icon.geom = `
        <title>rain-symbol</title>
        <g id="icons" stroke="rgba(255, 255, 255, 1)" stroke-width="2.5px" stroke-linecap: round paint-order="stroke" fill="none" fill-rule="evenodd">
            <g id="Symbols" transform="translate(-9.5, -10)">
                <g id="fill-3" transform="translate(10.978, 17.233)">
                    <g id="Clip-2"></g>
                    <path d="M9.6929176,0.032 C9.6929176,0.032 7.067,7.149 5.42,8.795 C4.18026092,10.035 2.17,10.035 0.93,8.795 C-0.31,7.555 -0.31,5.545 0.93,4.305 C2.57629089,2.659 9.693,0.032 9.693,0.032"
                          id="Fill-1" fill="#221F20"></path>
                </g>
                <path d="M27.8436816,18.74 C27.8436816,18.74 25.84,24.171 24.583,25.427 C23.6372097,26.373 22.103,26.373 21.157,25.427 C20.2109001,24.481 20.211,22.947 21.157,22.001 C22.4132397,20.745 27.844,18.74 27.844,18.74"
                      id="fill-2" fill="#221F20"></path>
                <path d="M19.260236,10.133 C19.260236,10.133 17.256,15.564 16,16.82 C15.053764,17.766 13.52,17.766 12.574,16.82 C11.6274544,15.874 11.627,14.34 12.574,13.394 C13.829794,12.137 19.26,10.133 19.26,10.133"
                      id="fill-1" fill="#221F20"></path>
            </g>
        </g>`
      break
    case 'trafficWeather':
      icon.aspectRatio = [23, 23]
      icon.geom = `
        <title>traffic-symbol</title>
        <g id="icons" transform="translate(1, 0)">
            <path style="stroke:rgba(255, 255, 255, 1);stroke-width: 2.5px;paint-order: stroke;fill-rule:evenodd;fill:rgb(13.333%,12.157%,12.549%);fill-opacity:1;" d=" M 5.385 22.275 C 5.416 22.094 5.464 21.894 5.535 21.678 C 5.635 21.365 5.778 21.021 5.946 20.659 C 6.115 20.297 6.311 19.915 6.517 19.522 C 6.724 19.127 6.94 18.721 7.149 18.303 C 7.358 17.885 7.559 17.458 7.732 17.021 C 7.906 16.587 8.05 16.142 8.15 15.707 C 8.248 15.269 8.303 14.842 8.307 14.446 C 8.311 14.05 8.271 13.69 8.208 13.383 C 8.145 13.074 8.063 12.818 7.983 12.615 C 7.963 12.563 7.946 12.516 7.926 12.47 C 7.906 12.424 7.887 12.381 7.87 12.341 C 7.852 12.301 7.835 12.264 7.82 12.23 C 7.805 12.202 7.792 12.176 7.78 12.153 C 7.731 12.061 7.705 12.012 7.705 12.012 L 7.112 12.206 C 7.112 12.206 7.118 12.262 7.128 12.366 C 7.131 12.392 7.134 12.422 7.137 12.454 C 7.138 12.484 7.139 12.517 7.141 12.553 C 7.142 12.588 7.143 12.626 7.145 12.666 C 7.145 12.707 7.144 12.751 7.143 12.797 C 7.142 12.98 7.126 13.201 7.08 13.442 C 7.035 13.684 6.96 13.945 6.845 14.211 C 6.732 14.478 6.575 14.748 6.385 15.017 C 6.191 15.286 5.963 15.554 5.701 15.821 C 5.442 16.089 5.15 16.356 4.839 16.627 C 4.527 16.899 4.195 17.175 3.853 17.464 C 3.511 17.754 3.159 18.056 2.807 18.383 C 2.456 18.71 2.105 19.061 1.772 19.453 C 1.438 19.842 1.123 20.276 0.851 20.746 C 0.582 21.219 0.356 21.728 0.203 22.244 C 0.2 22.254 0.197 22.264 0.194 22.275 L 5.385 22.275 Z"/>
            <path style="stroke:rgba(255, 255, 255, 1);stroke-width: 2.5px;paint-order: stroke;fill-rule:evenodd;fill:rgb(13.333%,12.157%,12.549%);fill-opacity:1;" d=" M 14.662 22.275 C 14.688 22.121 14.73 21.951 14.79 21.767 C 14.875 21.501 14.996 21.209 15.139 20.901 C 15.283 20.593 15.45 20.268 15.625 19.933 C 15.801 19.598 15.985 19.252 16.163 18.897 C 16.34 18.541 16.511 18.178 16.658 17.807 C 16.806 17.437 16.928 17.059 17.014 16.689 C 17.097 16.317 17.144 15.953 17.147 15.616 C 17.151 15.28 17.117 14.973 17.063 14.712 C 17.01 14.45 16.94 14.231 16.872 14.058 C 16.855 14.015 16.84 13.975 16.824 13.936 C 16.807 13.897 16.79 13.86 16.775 13.825 C 16.76 13.792 16.746 13.76 16.734 13.732 C 16.721 13.708 16.709 13.686 16.699 13.666 C 16.657 13.588 16.635 13.546 16.635 13.546 L 16.131 13.711 C 16.131 13.711 16.136 13.758 16.145 13.847 C 16.147 13.87 16.15 13.894 16.152 13.922 C 16.153 13.948 16.154 13.976 16.155 14.006 C 16.156 14.036 16.158 14.068 16.159 14.102 C 16.159 14.137 16.158 14.175 16.158 14.214 C 16.157 14.37 16.143 14.557 16.104 14.762 C 16.066 14.968 16.001 15.19 15.904 15.416 C 15.808 15.643 15.674 15.873 15.513 16.102 C 15.348 16.331 15.154 16.559 14.931 16.786 C 14.71 17.013 14.462 17.24 14.197 17.471 C 13.933 17.702 13.65 17.938 13.359 18.183 C 13.068 18.43 12.769 18.686 12.47 18.964 C 12.171 19.243 11.872 19.541 11.589 19.875 C 11.305 20.206 11.037 20.575 10.806 20.974 C 10.577 21.377 10.385 21.81 10.255 22.248 C 10.252 22.257 10.25 22.266 10.247 22.275 L 14.662 22.275 Z"/>
            <path style="stroke:rgba(255, 255, 255, 1);stroke-width: 2.5px;paint-order: stroke;fill-rule:evenodd;fill:rgb(13.333%,12.157%,12.549%);fill-opacity:1;" d=" M 16.979 6.047 L 16.535 3.292 L 10.765 2.272 L 10.765 2.272 L 10.765 2.272 L 10.765 2.272 L 9.408 4.709 L 16.979 6.047 Z  M 17.879 11.36 L 17.701 12.371 C 17.649 12.667 17.365 12.866 17.069 12.814 L 16.035 12.631 C 15.739 12.579 15.54 12.294 15.592 11.998 L 15.592 11.998 L 15.592 11.998 L 15.77 10.988 L 12.91 10.482 C 12.614 10.43 12.355 10.384 12.334 10.38 C 12.314 10.377 12.055 10.331 11.759 10.279 L 8.899 9.773 L 8.721 10.783 C 8.669 11.08 8.385 11.279 8.089 11.227 L 7.055 11.044 C 6.759 10.992 6.56 10.707 6.612 10.411 L 6.612 10.411 L 6.79 9.4 L 6.165 9.29 C 5.87 9.238 5.652 8.95 5.682 8.651 L 6.075 4.673 C 6.104 4.374 6.37 4.172 6.666 4.224 L 7.758 4.417 L 9.667 0.992 C 9.795 0.761 10.09 0.6 10.36 0.6 L 10.36 0.6 L 10.36 0.6 L 10.36 0.6 C 10.398 0.6 10.434 0.603 10.47 0.609 L 17.38 1.831 C 17.675 1.883 17.956 2.169 18.004 2.466 L 18.629 6.338 L 19.762 6.539 C 20.057 6.591 20.238 6.872 20.164 7.163 L 19.176 11.036 C 19.102 11.327 18.799 11.523 18.503 11.471 L 17.879 11.36 Z"/>
        </g>`
      break
    case 'pedestrianSafety':
      icon.aspectRatio = [21, 21]
      icon.geom = `
        <title>pedestrian-symbol</title>
        <g id="icons" stroke="rgba(255, 255, 255, 1)" stroke-width="2.5px" paint-order="stroke" fill="none" fill-rule="evenodd">
            <g id="Symbols" transform="translate(-857, -505)">
                <g id="pedestrian-symbol-1" transform="translate(847.75, 497)">
                    <polygon id="fill-3" fill="#221F20"
                             points="10.133 28.782 28.703 28.782 28.703 26.916 10.133 26.916"></polygon>
                    <polygon id="fill-2" fill="#221F20"
                             points="17.76 8.549 17.212 13.2 18.933 13.836 16.909 15.136 13.463 14.245 10.803 19.579 11.822 20.109 14.554 16.686 16.437 17.759 14.067 20.283 16.14 25.186 17.089 24.84 16.076 21.1 22.889 15.786 24.316 16.75 23.242 20.182 24.057 20.535 26.169 16.37 22.328 12.685 18.862 11.906 18.867 8.444"></polygon>
                    <path d="M22.3791349,11.936 C23.3095317,12.004 24.117,11.28 24.182,10.32 C24.247227,9.36 23.546,8.528 22.616,8.46 C21.6851825,8.393 20.878,9.117 20.813,10.076 C20.747427,11.036 21.449,11.869 22.379,11.936"
                          id="fill-1" fill="#221F20"></path>
                </g>
            </g>
        </g>`
      break
    case 'forestFireWeather':
    case 'grassFireWeather':
      icon.aspectRatio = [19, 22]
      icon.geom = `
        <title>grassfire-symbol</title>
        <g id="icons" stroke="rgba(255, 255, 255, 1)" stroke-width="2.5px" paint-order="stroke" fill="none" fill-rule="evenodd">
            <g id="Symbols" transform="translate(-1133, -504)">
                <g id="grassfire-symbol-1" transform="translate(1123, 497)">
                    <polygon id="fill-2" fill="#221F20"
                             points="10.978 28.398 27.859 28.398 27.859 26.753 10.978 26.753"></polygon>
                    <path d="M24.4181968,17.52 C24.788546,19.333 22.917,21.741 22.249,20.477 C21.92237,19.857 22.456,18.857 22.641,18.269 C22.9491925,17.293 23.191,16.26 23.151,15.229 C23.0287567,12.09 20.429,7.57 16.344,7.6 C18.6197149,10.342 12.874,12.888 14.017,18.88 C12.9992242,18.704 12.262,16.771 12.262,16.771 C12.2623094,16.771 9.874,25.415 17.043,25.415 C15.2656802,24.297 13.962,22.656 13.909,20.773 C13.908976,20.773 15.467,22.063 16.848,22.004 C15.8107307,19.308 17.68,16.49 20.007,15.492 C19.2368722,17.095 18.427,19.099 18.666,20.907 C19.0368924,23.709 22.168,23.539 24.182,21.784 C24.1817524,22.977 22.54,24.462 21.517,25.415 C28.3893339,24.114 25.914,18.174 24.418,17.52"
                          id="fill-1" fill="#221F20"></path>
                </g>
            </g>
        </g>`
      break
    case 'hotWeather':
      icon.aspectRatio = [16, 30]
      icon.scale = 1.2
      icon.geom = `
        <title>heat-symbol</title>
        <g id="Symbols" transform="translate(-11, -4)">
            <path style="stroke:rgba(255, 255, 255, 1);stroke-width: 3.5px;paint-order: stroke;" d="M18.7689881,29.116 C17.2666652,29.116 16.044,27.894 16.044,26.392 C16.0444726,25.627 16.356,24.918 16.922,24.394 L16.9212311,24.394 C17.0878681,24.24 17.193,24.02 17.193,23.775 L17.1928607,10.021 C17.1928607,9.152 17.9,8.444 18.769,8.444 C19.6380904,8.444 20.345,9.152 20.345,10.021 L20.3450593,23.775 C20.3450593,24.02 20.45,24.24 20.617,24.394 L20.6160696,24.394 C21.1819037,24.918 21.494,25.627 21.494,26.392 C21.4935037,27.894 20.271,29.116 18.769,29.116 L18.7689881,29.116 Z M23.7576844,13.428 C24.1463541,13.428 24.461,13.112 24.461,12.724 C24.4613881,12.335 24.146,12.02 23.758,12.02 L22.0339481,12.02 L22.0339481,11.131 L23.7576844,11.131 C24.1463541,11.131 24.461,10.816 24.461,10.427 C24.4613881,10.038 24.146,9.723 23.758,9.723 L22.0198178,9.723 C21.869,8.062 20.469,6.756 18.769,6.756 C16.9686889,6.756 15.504,8.22 15.504,10.021 L15.5039719,23.43 C14.7707126,24.239 14.356,25.298 14.356,26.392 C14.3555837,28.825 16.335,30.805 18.769,30.805 C21.2025644,30.805 23.182,28.825 23.182,26.392 C23.1823926,25.298 22.767,24.239 22.034,23.43 L22.0339481,15.724 L23.7576844,15.724 C24.1463541,15.724 24.461,15.409 24.461,15.021 C24.4613881,14.632 24.146,14.317 23.758,14.317 L22.0339481,14.317 L22.0339481,13.428 L23.7576844,13.428 Z"
                  id="fill-1" fill="#221F20"></path>
            <path style="stroke:rgba(255, 255, 255, 1);stroke-width: 1px;paint-order: stroke;" d="M19.50084,24.745 L19.50084,17.223 C19.50084,16.818 19.173,16.491 18.769,16.491 C18.3647807,16.491 18.037,16.818 18.037,17.223 L18.0371363,24.745 C17.4066741,25.026 16.967,25.657 16.967,26.392 C16.9668311,27.387 17.774,28.194 18.769,28.194 C19.7642504,28.194 20.571,27.387 20.571,26.392 C20.5711452,25.657 20.131,25.026 19.501,24.745"
                  id="fill-2" fill="#221F20"></path>
        </g>`
      break
    case 'coldWeather':
      icon.aspectRatio = [16, 30]
      icon.scale = 1.2
      icon.geom = `
        <title>freeze-symbol</title>
        <g id="Symbols" transform="translate(-11, -4)">
            <path style="stroke:rgba(255, 255, 255, 1);stroke-width: 3.5px;paint-order: stroke;" d="M18.7689881,29.116 C17.2666652,29.116 16.044,27.894 16.044,26.392 C16.0444726,25.627 16.356,24.918 16.922,24.394 L16.9212311,24.394 C17.0878681,24.24 17.193,24.02 17.193,23.775 L17.1928607,10.021 C17.1928607,9.152 17.9,8.444 18.769,8.444 C19.6380904,8.444 20.345,9.152 20.345,10.021 L20.3450593,23.775 C20.3450593,24.02 20.45,24.24 20.617,24.394 L20.6160696,24.394 C21.1819037,24.918 21.494,25.627 21.494,26.392 C21.4935037,27.894 20.271,29.116 18.769,29.116 L18.7689881,29.116 Z M23.7576844,13.428 C24.1463541,13.428 24.461,13.112 24.461,12.724 C24.4613881,12.335 24.146,12.02 23.758,12.02 L22.0339481,12.02 L22.0339481,11.131 L23.7576844,11.131 C24.1463541,11.131 24.461,10.816 24.461,10.427 C24.4613881,10.038 24.146,9.723 23.758,9.723 L22.0198178,9.723 C21.869,8.062 20.469,6.756 18.769,6.756 C16.9686889,6.756 15.504,8.22 15.504,10.021 L15.5039719,23.43 C14.7707126,24.239 14.356,25.298 14.356,26.392 C14.3555837,28.825 16.335,30.805 18.769,30.805 C21.2025644,30.805 23.182,28.825 23.182,26.392 C23.1823926,25.298 22.767,24.239 22.034,23.43 L22.0339481,15.724 L23.7576844,15.724 C24.1463541,15.724 24.461,15.409 24.461,15.021 C24.4613881,14.632 24.146,14.317 23.758,14.317 L22.0339481,14.317 L22.0339481,13.428 L23.7576844,13.428 Z"
                  id="fill-1" fill="#221F20"></path>
            <path style="stroke:rgba(255, 255, 255, 1);stroke-width: 1px;paint-order: stroke;" d="M19.50084,24.745 L19.50084,17.223 C19.50084,16.818 19.173,16.491 18.769,16.491 C18.3647807,16.491 18.037,16.818 18.037,17.223 L18.0371363,24.745 C17.4066741,25.026 16.967,25.657 16.967,26.392 C16.9668311,27.387 17.774,28.194 18.769,28.194 C19.7642504,28.194 20.571,27.387 20.571,26.392 C20.5711452,25.657 20.131,25.026 19.501,24.745"
                  id="fill-2" fill="#221F20"></path>
        </g>`
      break
    case 'uvNote':
      icon.aspectRatio = [23, 12]
      icon.scale = 0.55
      icon.geom = `
        <title>ultraviolet-symbol</title>
        <g id="icons" stroke="rgba(255, 255, 255, 1)" stroke-width="2.5px" paint-order="stroke" fill="none" fill-rule="evenodd">
            <g id="Symbols" transform="translate(-8.5, -14)">
              <g id="fill-1" transform="translate(19.492, 13.55)">
                  <g id="Clip-5"></g>
                  <polygon id="Fill-4" fill="#221F20"
                           points="3.991 10.96 0.031 0.014 2.457 0.014 5.261 8.116 7.975 0.014 10.348 0.014 6.38 10.96"></polygon>
              </g>
              <g id="fill-2" transform="translate(10.133, 13.55)">
                  <g id="Clip-2"></g>
                  <path d="M0,0.014 L2.23735357,0.014 L2.23735357,5.943 C2.23735357,6.883 2.265,7.493 2.321,7.772 C2.41618356,8.22 2.644,8.58 3.005,8.851 C3.36477398,9.122 3.857,9.258 4.482,9.258 C5.11719024,9.258 5.596,9.13 5.918,8.873 C6.24086721,8.617 6.435,8.302 6.5,7.929 C6.56590569,7.555 6.599,6.936 6.599,6.07 L6.59868762,0.014 L8.83609467,0.014 L8.83609467,5.763 C8.83609467,7.078 8.776,8.006 8.655,8.549 C8.5337308,9.091 8.311,9.549 7.986,9.923 C7.66070461,10.296 7.226,10.593 6.682,10.815 C6.13765492,11.036 5.427,11.147 4.55,11.147 C3.49210479,11.147 2.69,11.026 2.143,10.785 C1.59604697,10.544 1.164,10.23 0.847,9.844 C0.529110027,9.458 0.32,9.054 0.219,8.631 C0.07299729,8.004 0,7.078 0,5.853 L0,0.014 Z"
                        id="Fill-1" fill="#221F20"></path>
              </g>
            </g>
        </g>`
      break
    case 'floodLevel':
      icon.aspectRatio = warning.severity < 3 ? [24, 21] : [24, 20]
      if (warning.severity === 3) {
        icon.geom = getFloodLevel3Icon()
      } else if (warning.severity === 4) {
        icon.geom = getFloodLevel4Icon()
      } else {
        icon.geom = getFloodLevel2Icon()
      }
      break
    case 'seaWind': {
      const dx = -1.5 * Math.sin(((warning.direction ?? 0) * Math.PI) / 180)
      icon.aspectRatio = [22, 22]
      icon.scale = 1.5
      icon.geom = `
        <title>seawind-symbol</title>
        <g>
            <path d="${svgpath(
              'M 11.127 6.107 A 8.4 8.4 0 1 0 16.873 6.107 L 14 0 L 11.127 6.107'
            )
              .translate(-14, -14)
              .scale(6 / 8.4)
              .translate(10, 10)
              .rotate(warning.direction ?? 0, 10, 10)
              .translate(1 + dx, 1.5)
              .toString()}" fill="#000000" stroke="rgba(255, 255, 255, 1)" stroke-width="1.7px" paint-order="stroke" />
            <text x="${10.9 + dx}" y="14.7" fill="#ffffff"
                  style="font-family: 'Noto Sans', sans-serif; font-size: 8.5px; text-anchor: middle; font-weight: bold;">${
                    warning.text ?? ''
                  }
            </text>
        </g>`
      break
    }
    case 'seaThunderStorm':
      icon.aspectRatio = [14, 22]
      icon.geom = `
        <title>seathunder-symbol</title>
        <g id="icons" stroke="rgba(255, 255, 255, 1)" stroke-width="2.5px" paint-order="stroke" fill="none" fill-rule="evenodd">
            <g id="Symbols" transform="translate(-13, -10)">
                <polygon id="fill-1" fill="#221F20"
                         points="17.09 10.133 14.356 19.639 19.145 19.639 16.438 31.244 25.636 16.163 20.658 16.163 23.371 10.133"></polygon>
            </g>
        </g>`
      break
    case 'seaWaterHeightHighWater':
      icon.aspectRatio = [25, 22]
      icon.geom = getHighSeaLevelIcon()
      break
    case 'seaWaterHeightShallowWater':
      icon.aspectRatio = [23, 22]
      icon.geom = getLowSeaLevelIcon()
      break
    case 'seaWaveHeight':
      icon.aspectRatio = [21, 16]
      icon.scale = 0.8
      icon.geom = getWaveHeightIcon()
      break
    case 'seaIcing':
      icon.aspectRatio = [22, 17]
      icon.scale = 0.9
      icon.geom = getIcingIcon()
      break
    case 'multiple':
      icon.aspectRatio = [15, 13]
      icon.scale = 0.65
      icon.geom = getMultipleIcon()
      break
    default:
      break
  }

  return icon
}

// Helper functions for complex icons
function getFloodLevel2Icon(): string {
  return `
    <title>flood-level-2</title>
    <g id="icons" stroke="rgba(255, 255, 255, 1)" stroke-width="2.5px" paint-order="stroke" fill="none" fill-rule="evenodd">
        <g id="Symbols" transform="translate(-7, -9)">
            <path d="M13.4208411,22.872 L24.3977103,22.872 L24.3977103,15.591 L27.6678972,15.591 L18.9095327,9 L10.1501402,15.591 L13.4203271,15.591 L13.4203271,22.872 L13.4208411,22.872 Z M20.4557009,18.872 L17.3099065,18.872 L17.3099065,15.726 L20.4557009,15.726 L20.4557009,18.872 L20.4557009,18.872 Z"
                  id="fill-2" fill="#231F20"></path>
            <path d="M29.2392523,25.409 L29.2392523,25.409 C27.6457944,25.409 26.814,26.294 26.147,27.005 C25.5501402,27.641 25.079,28.144 24.11,28.144 C23.1414486,28.144 22.671,27.641 22.074,27.005 C21.4056075,26.294 20.577,25.409 18.981,25.409 C17.3859813,25.409 16.556,26.293 15.889,27.002 C15.2923832,27.638 14.822,28.141 13.853,28.141 C12.8836916,28.141 12.413,27.638 11.817,27.002 C11.1499065,26.293 10.32,25.409 8.724,25.409 L8.72425234,25.409 C8.32425882,25.409 8,25.733 8,26.133 C8,26.533 8.324,26.857 8.724,26.857 L8.7396729,26.857 C9.69780374,26.862 10.167,27.363 10.761,27.996 C11.4290187,28.707 12.258,29.592 13.853,29.592 C15.4486449,29.592 16.279,28.707 16.945,27.996 C17.542243,27.359 18.013,26.856 18.982,26.856 C19.9509346,26.856 20.421,27.359 21.019,27.996 C21.6867757,28.707 22.515,29.592 24.111,29.592 C25.7064019,29.592 26.537,28.707 27.203,27.996 C27.7964019,27.363 28.266,26.865 29.224,26.857 L29.2387383,26.857 C29.6387318,26.857 29.963,26.533 29.963,26.133 C29.9633896,25.733 29.639,25.409 29.239,25.409 L29.2392523,25.409 Z"
                  id="fill-1" fill="#231F20"></path>
        </g>
    </g>`
}

function getFloodLevel3Icon(): string {
  return `
    <title>flood-level-3</title>
    <g id="icons" stroke="rgba(255, 255, 255, 1)" stroke-width="2.5px" paint-order="stroke" fill="none" fill-rule="evenodd">
        <g id="Symbols" transform="translate(-7, -9)">
            <path d="M27.6684112,15.591 L18.9095327,9 L10.1501402,15.591 L13.4203271,15.591 L13.4203271,24.524 L13.444486,24.524 C14.4766355,24.524 14.978,23.989 15.614,23.311 C16.3245327,22.553 17.208,21.61 18.909,21.61 C20.6093925,21.61 21.492,22.553 22.203,23.311 C22.8386916,23.989 23.34,24.524 24.373,24.524 L24.3971963,24.524 L24.3971963,15.591 L27.6673832,15.591 L27.6684112,15.591 Z M20.4557009,18.872 L17.3099065,18.872 L17.3099065,15.726 L20.4557009,15.726 L20.4557009,18.872 L20.4557009,18.872 Z"
                  id="fill-1" fill="#231F20"></path>
            <path d="M29.2392523,24.38 L29.2392523,24.38 C27.6457944,24.38 26.814,25.266 26.147,25.977 C25.5501402,26.613 25.079,27.116 24.11,27.116 C23.1414486,27.116 22.671,26.613 22.074,25.977 C21.4056075,25.266 20.577,24.38 18.981,24.38 C17.3859813,24.38 16.556,25.265 15.889,25.974 C15.2923832,26.61 14.822,27.113 13.853,27.113 C12.8836916,27.113 12.413,26.61 11.817,25.974 C11.1499065,25.265 10.32,24.38 8.724,24.38 L8.72425234,24.38 C8.32425882,24.38 8,24.705 8,25.105 C8,25.505 8.324,25.829 8.724,25.829 L8.7396729,25.829 C9.69780374,25.834 10.167,26.335 10.761,26.968 C11.4290187,27.679 12.258,28.564 13.853,28.564 C15.4486449,28.564 16.279,27.679 16.945,26.968 C17.542243,26.331 18.013,25.828 18.982,25.828 C19.9509346,25.828 20.421,26.331 21.019,26.968 C21.6867757,27.679 22.515,28.564 24.111,28.564 C25.7064019,28.564 26.537,27.679 27.203,26.968 C27.7964019,26.335 28.266,25.837 29.224,25.829 L29.2387383,25.829 C29.6387318,25.829 29.963,25.505 29.963,25.105 C29.9633896,24.705 29.639,24.381 29.239,24.38 L29.2392523,24.38 Z"
                  id="fill-3" fill="#231F20"></path>
            <path d="M29.2392523,21.073 L29.2392523,21.073 C27.6457944,21.073 26.815,21.958 26.148,22.669 C25.5511682,23.306 25.08,23.808 24.111,23.808 C23.1424766,23.808 22.672,23.306 22.075,22.669 C21.4066355,21.958 20.578,21.073 18.983,21.073 C17.3870093,21.073 16.557,21.958 15.89,22.669 C15.2934112,23.306 14.823,23.808 13.854,23.808 C12.8847196,23.808 12.414,23.306 11.818,22.669 C11.1493925,21.958 10.321,21.073 8.725,21.073 C8.32528685,21.073 8.001,21.397 8.001,21.797 C8.00102804,22.197 8.325,22.521 8.725,22.521 L8.73761682,22.521 C9.69780374,22.526 10.168,23.027 10.761,23.66 C11.4269626,24.37 12.255,25.254 13.853,25.254 C15.4507009,25.254 16.278,24.37 16.945,23.661 C17.541729,23.024 18.013,22.522 18.981,22.522 C19.9504206,22.522 20.421,23.024 21.018,23.661 C21.6862617,24.372 22.515,25.257 24.11,25.257 C25.7058879,25.257 26.536,24.37 27.203,23.661 C27.7964019,23.028 28.266,22.527 29.226,22.522 L29.2382243,22.522 C29.4971584,22.522 29.737,22.385 29.866,22.16 C29.9957735,21.936 29.996,21.66 29.867,21.436 C29.7373534,21.211 29.498,21.073 29.239,21.073 L29.2392523,21.073 Z"
                  id="fill-2" fill="#231F20"></path>
        </g>
    </g>`
}

function getFloodLevel4Icon(): string {
  return `
    <title>flood-level-4</title>
    <g id="icons" stroke="rgba(255, 255, 255, 1)" stroke-width="2.5px" paint-order="stroke" fill="none" fill-rule="evenodd">
        <g id="Symbols" transform="translate(-7, -9)">
            <path d="M27.6684112,15.591 L18.9095327,9 L10.1501402,15.591 L13.4203271,15.591 L13.4203271,24.524 L13.444486,21.217 C14.4766355,21.217 14.978,20.681 15.614,20.003 C16.3245327,19.245 17.208,18.302 18.909,18.302 C20.6093925,18.302 21.492,19.245 22.203,20.003 C22.8386916,20.681 23.34,21.217 24.373,21.217 L24.3971963,21.217 L24.3971963,15.591 L27.6673832,15.591 L27.6684112,15.591 Z M20.4557009,18.872 L17.3099065,18.872 L17.3099065,15.726 L20.4557009,15.726 L20.4557009,18.872 L20.4557009,18.872 Z"
                  id="fill-1" fill="#231F20"></path>
            <path d="M29.2392523,24.38 L29.2392523,24.38 C27.6457944,24.38 26.814,25.266 26.147,25.977 C25.5501402,26.613 25.079,27.116 24.11,27.116 C23.1414486,27.116 22.671,26.613 22.074,25.977 C21.4056075,25.266 20.577,24.38 18.981,24.38 C17.3859813,24.38 16.556,25.265 15.889,25.974 C15.2923832,26.61 14.822,27.113 13.853,27.113 C12.8836916,27.113 12.413,26.61 11.817,25.974 C11.1499065,25.265 10.32,24.38 8.724,24.38 L8.72425234,24.38 C8.32425882,24.38 8,24.705 8,25.105 C8,25.505 8.324,25.829 8.724,25.829 L8.7396729,25.829 C9.69780374,25.834 10.167,26.335 10.761,26.968 C11.4290187,27.679 12.258,28.564 13.853,28.564 C15.4486449,28.564 16.279,27.679 16.945,26.968 C17.542243,26.331 18.013,25.828 18.982,25.828 C19.9509346,25.828 20.421,26.331 21.019,26.968 C21.6867757,27.679 22.515,28.564 24.111,28.564 C25.7064019,28.564 26.537,27.679 27.203,26.968 C27.7964019,26.335 28.266,25.837 29.224,25.829 L29.2387383,25.829 C29.6387318,25.829 29.963,25.505 29.963,25.105 C29.9633896,24.705 29.639,24.381 29.239,24.38 L29.2392523,24.38 Z"
                  id="fill-4" fill="#231F20"></path>
            <path d="M29.2392523,21.073 L29.2392523,21.073 C27.6457944,21.073 26.815,21.958 26.148,22.669 C25.5511682,23.306 25.08,23.808 24.111,23.808 C23.1424766,23.808 22.672,23.306 22.075,22.669 C21.4066355,21.958 20.578,21.073 18.983,21.073 C17.3870093,21.073 16.557,21.958 15.89,22.669 C15.2934112,23.306 14.823,23.808 13.854,23.808 C12.8847196,23.808 12.414,23.306 11.818,22.669 C11.1493925,21.958 10.321,21.073 8.725,21.073 C8.32528685,21.073 8.001,21.397 8.001,21.797 C8.00102804,22.197 8.325,22.521 8.725,22.521 L8.73761682,22.521 C9.69780374,22.526 10.168,23.027 10.761,23.66 C11.4269626,24.37 12.255,25.254 13.853,25.254 C15.4507009,25.254 16.278,24.37 16.945,23.661 C17.541729,23.024 18.013,22.522 18.981,22.522 C19.9504206,22.522 20.421,23.024 21.018,23.661 C21.6862617,24.372 22.515,25.257 24.11,25.257 C25.7058879,25.257 26.536,24.37 27.203,23.661 C27.7964019,23.028 28.266,22.527 29.226,22.522 L29.2382243,22.522 C29.4971584,22.522 29.737,22.385 29.866,22.16 C29.9957735,21.936 29.996,21.66 29.867,21.436 C29.7373534,21.211 29.498,21.073 29.239,21.073 L29.2392523,21.073 Z"
                  id="fill-3" fill="#231F20"></path>
            <path d="M29.2392523,17.765 L29.2392523,17.765 C27.6457944,17.765 26.815,18.65 26.148,19.362 C25.5511682,19.998 25.08,20.501 24.111,20.501 C23.1424766,20.501 22.672,19.998 22.075,19.362 C21.4066355,18.65 20.578,17.765 18.983,17.765 C17.3870093,17.765 16.557,18.65 15.89,19.362 C15.2934112,19.998 14.823,20.501 13.854,20.501 C12.8847196,20.501 12.414,19.998 11.818,19.362 C11.1493925,18.65 10.321,17.765 8.725,17.765 C8.32528685,17.765 8.001,18.089 8.001,18.489 C8.00102804,18.889 8.325,19.214 8.725,19.214 L8.73761682,19.214 C9.69780374,19.218 10.168,19.719 10.761,20.352 C11.4269626,21.062 12.255,21.947 13.853,21.947 C15.4507009,21.947 16.278,21.062 16.945,20.353 C17.541729,19.717 18.013,19.214 18.981,19.214 C19.9504206,19.214 20.421,19.717 21.018,20.353 C21.6862617,21.065 22.515,21.95 24.11,21.95 C25.7058879,21.95 26.536,21.062 27.203,20.353 C27.7964019,19.72 28.266,19.219 29.226,19.215 L29.2382243,19.215 C29.4971584,19.215 29.737,19.077 29.866,18.853 C29.9957735,18.628 29.996,18.352 29.867,18.128 C29.7373534,17.904 29.498,17.765 29.239,17.765 L29.2392523,17.765 Z"
                  id="fill-2" fill="#231F20"></path>
        </g>
    </g>`
}

function getHighSeaLevelIcon(): string {
  return `
    <title>highsealevel-symbol</title>
    <defs>
        <polygon id="highsealevel-path-1"
                 points="21.914 4.508 21.914 0.04 5.15388638e-06 0.04 5.15388638e-06 4.508 21.914 4.508"></polygon>
    </defs>
    <g id="icons" stroke="rgba(255, 255, 255, 1)" stroke-width="2.5px" paint-order="stroke" fill="none" fill-rule="evenodd">
        <g id="Symbols" transform="translate(-7, -8)">
            <g id="icon-varoitus-korkeasta-merivedenkorkeudesta" transform="translate(8.444, 8.444)">
                <polygon id="fill-1" fill="#221F20"
                         points="14.192 4.843 14.192 8.611 18.497 8.611 18.497 4.843 20.65 4.843 16.345 1.03077728e-05 12.039 4.843"></polygon>
            </g>
        </g>
    </g>`
}

function getLowSeaLevelIcon(): string {
  return `
    <title>lowsealevel-symbol</title>
    <g id="icons" stroke="rgba(255, 255, 255, 1)" stroke-width="2.5px" paint-order="stroke" fill="none" fill-rule="evenodd">
        <g id="Symbols" transform="translate(-305, -401)">
            <g id="lowsealevel-symbol-1" transform="translate(297, 393)">
                <polygon id="fill-1" fill="#221F20"
                         points="22.706 12.23 22.706 8.444 27.033 8.444 27.033 12.23 29.196 12.23 24.87 17.097 20.543 12.23"></polygon>
            </g>
        </g>
    </g>`
}

function getWaveHeightIcon(): string {
  return `
    <title>waveheight-symbol</title>
    <g id="icons" stroke="rgba(255, 255, 255, 1)" stroke-width="2.5px" paint-order="stroke" fill="none" fill-rule="evenodd">
        <g id="Symbols" transform="translate(-9.5, -10)">
            <g id="fill-2" transform="translate(10.978, 10.164)">
                <path d="M9.68429628,7.187 C9.68429628,5.585 10.984,4.285 12.586,4.285 C13.2691862,4.285 13.955,4.551 14.451,4.946 C14.4463059,4.943 14.442,4.941 14.452,4.946 C14.4613262,4.951 14.456,4.949 14.451,4.946 C13.83962,2.119 11.366,0.026 8.356,0.026 C7.24490418,0.026 6.202,0.315 5.297,0.821 C-0.989,3.764 0.057,15.14 0.076,16.884 L18.5538582,16.884 C15.7054162,14.752 9.684,10.536 9.684,7.187"
                      id="fill" fill="#221F20"></path>
            </g>
            <path d="M25.1761522,18.291 C26.2413534,17.678 25.549,15.686 25.536,15.616 C25.0391623,15.323 24.439,15.138 23.841,15.138 C22.8125958,15.138 21.897,15.621 21.308,16.373 C22.7123097,17.435 24.549,18.652 25.176,18.291"
                  id="fill-1" fill="#221F20"></path>
        </g>
    </g>`
}

function getIcingIcon(): string {
  return `
    <title>icing-symbol</title>
    <g id="icons" stroke="rgba(255, 255, 255, 1)" stroke-width="2.5px" paint-order="stroke" fill="none" fill-rule="evenodd">
        <g id="icing-symbol-1" transform="translate(-8, -12)">
            <polygon id="fill-2" fill="#221F20"
                     points="20.589 12.978 17.16 21.546 19.701 28.926 22.971 18.371 24.337 22.547 28.686 12.978"></polygon>
            <polygon id="fill-1" fill="#221F20"
                     points="10.133 12.978 14.743 24.874 19.504 12.978"></polygon>
        </g>
    </g>`
}

function getMultipleIcon(): string {
  return `
    <title>multiple-symbol</title>
    <g id="icons" stroke="rgba(255, 255, 255, 1)" stroke-width="2.5px" paint-order="stroke" fill="none" fill-rule="evenodd">
        <g id="Symbols" transform="translate(-12, -13)">
            <rect id="icon-bg" fill-opacity="0" fill="#E8E8E8" x="0" y="0" width="38" height="38" rx="100"></rect>
            <polygon id="fill-1" fill="#221F20"
                     points="18.467 25.29 20.334 25.29 20.334 20.334 25.29 20.334 25.29 18.467 20.334 18.467 20.334 13.511 18.467 13.511 18.467 18.467 13.511 18.467 13.511 20.334 18.467 20.334"></polygon>
        </g>
    </g>`
}

/**
 * Get alert client configuration
 *
 * Note: This composable exports large static geometry data.
 * The geometry data is imported from geometries.json.
 */
export function useConfig(): UseConfigReturn {
  return {
    defaultGeometryId: '2021',
    timeZone: 'Europe/Helsinki',
    dateTimeFormatLocale: 'fi-FI',
    panLimits: { x: 175, y: 275 },
    coverageCriterion: 0.2,
    maxMergedWeight: 7,
    maxUpdateDelay: {
      weather_update_time: 12 * 60 * 60 * 1000,
      flood_update_time: 12 * 60 * 60 * 1000,
    },
    warningTypes: warningTypesMap,
    regionIds: regionIdsData,
    geometries: geometriesData,
    colors: colorsData,
    bbox: bboxData,
    warningIcon,
  }
}

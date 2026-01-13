<template>
  <div
    id="fmi-warnings"
    :class="theme"
    :data-smartmet-alert-client-version="version">
    <div id="fmi-warnings-errors" :class="errors" />
    <div>
      <div class="container-fluid" :class="theme">
        <div class="row">
          <div class="col-12 col-md-8 col-lg-8 col-xl-8 day-region-views">
            <h2 v-if="!loading" class="valid-warnings">
              {{ validWarningsText }}
            </h2>
            <div v-if="loading" class="not-ready">
              <p>
                {{ mainInfoText }}
                {{ additionalInfoText }}
              </p>
              <a
                :href="supportedBrowsersLink"
                target="_blank"
                rel="noopener noreferrer"
                class="supported-browsers">
                {{ supportedBrowsers }}</a
              >
            </div>
            <div v-if="regionListEnabled">
              <a
                v-if="numWarnings"
                id="fmi-warnings-to-text-content"
                :href="toContentId"
                tabindex="0"
                class="visually-hidden-focusable focus-ring"
                @click="toContentClicked"
                >{{ toContentText }}</a
              >
              <div v-else :aria-label="noWarningsText"></div>
            </div>
            <Days
              :input="days"
              :visible-warnings="visibleWarnings"
              :selected-day="selectedDay"
              :static-days="staticDays"
              :time-offset="timeOffset"
              :warnings="warnings"
              :regions="regions"
              :geometry-id="geometryId"
              :loading="Boolean(loading)"
              :theme="theme"
              :language="language"
              :spinner-enabled="spinnerEnabled"
              @day-selected="onDaySelected"
              @loaded="onLoaded" />
          </div>
          <div class="col-12 col-md-4 col-lg-4 col-xl-4 symbol-list">
            <Legend
              v-show="validData"
              :input="legend"
              :visible-warnings="visibleWarnings"
              :gray-scale-selector="grayScaleSelector"
              :theme="theme"
              :language="language"
              @theme-changed="onThemeChanged"
              @warnings-toggled="onWarningsToggled" />
          </div>
        </div>
        <div v-if="regionListEnabled" class="row">
          <div class="col-12 col-md-8 col-lg-8 col-xl-8 day-region-views">
            <Regions
              :input="regions"
              :selected-day="selectedDay"
              :warnings="warnings"
              :parents="parents"
              :geometry-id="geometryId"
              :theme="theme"
              :language="language" />
          </div>
          <div class="col-12 col-md-4 col-lg-4 col-xl-4 symbol-list"></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  computed,
  watch,
  onMounted,
  onBeforeUnmount,
  onServerPrefetch,
  getCurrentInstance,
  toRef,
} from 'vue'
import Days from './Days.vue'
import Legend from './Legend.vue'
import Regions from './Regions.vue'
import { useConfig } from '@/composables/useConfig'
import { useI18n } from '@/composables/useI18n'
import { useWarningsProcessor } from '@/composables/useWarningsProcessor'
import {
  regionsDefault,
  isClientSide,
  REGION_LAND,
  REGION_SEA,
} from '@/composables/useUtils'
import geojsonsvg from '@/mixins/geojsonsvg'
import type {
  WarningsMap,
  Day,
  LegendItem,
  RegionsData,
  WarningsDataResponse,
  Language,
} from '@/types'
import type { ParentsMap } from '@/composables/useWarningsProcessor'

// Props
const props = withDefaults(
  defineProps<{
    refreshInterval?: number
    defaultDay?: number
    staticDays?: boolean
    startFrom?: string
    regionListEnabled?: boolean
    grayScaleSelector?: boolean
    currentTime?: number
    warningsData?: WarningsDataResponse | null
    dailyWarningTypes?: string[]
    geometryId?: number
    language?: Language
    theme?: string
    loading?: number
    sleep?: boolean
    spinnerEnabled?: boolean
  }>(),
  {
    refreshInterval: 1000 * 60 * 15,
    defaultDay: 0,
    staticDays: true,
    startFrom: '',
    regionListEnabled: true,
    grayScaleSelector: false,
    currentTime: () => Date.now(),
    warningsData: null,
    dailyWarningTypes: () => [],
    geometryId: 2021,
    language: 'en',
    theme: 'light-theme',
    loading: 1,
    sleep: true,
    spinnerEnabled: true,
  }
)

// Emits
const emit = defineEmits<{
  loaded: [value: number]
  themeChanged: [theme: string]
  'update-warnings': []
}>()

// Config
const config = useConfig()

// i18n
const { t } = useI18n(toRef(props, 'language'))

// Types
type DayIndex = 0 | 1 | 2 | 3 | 4

// State
const selectedDay = ref<DayIndex>(props.defaultDay as DayIndex)
const visibleWarnings = ref<string[]>([])
const timer = ref<ReturnType<typeof setInterval> | null>(null)
const visibilityListener = ref<(() => void) | null>(null)
const warnings = ref<WarningsMap | null>(null)
const days = ref<Day[]>([])
const regions = ref<RegionsData>(regionsDefault())
const parents = ref<ParentsMap>({})
const legend = ref<LegendItem[]>([])
const timeOffset = ref(0)
// eslint-disable-next-line no-undef
const version = __APP_VERSION__
const errors = ref<string[]>([])

// Create bound geoJSONToSVG function
const geoJSONToSVG = geojsonsvg.methods.geoJSONToSVG.bind(geojsonsvg.methods)

// Create refs for useWarningsProcessor options
const geometryIdRef = computed(() => String(props.geometryId))
const geometriesRef = computed(() => config.geometries)
const regionIdsRef = computed(() => config.regionIds)
const warningTypesRef = computed(() => config.warningTypes)
const timeZoneRef = computed(() => config.timeZone)
const localeRef = computed(() => config.dateTimeFormatLocale)
const currentTimeRef = computed(() => props.currentTime)
const startFromRef = computed(() => props.startFrom)
const staticDaysRef = computed(() => props.staticDays)
const dailyWarningTypesRef = computed(() => props.dailyWarningTypes)
const maxUpdateDelayRef = computed(
  () =>
    config.maxUpdateDelay as {
      weather_update_time: number
      flood_update_time: number
    }
)
const bboxRef = computed(
  () => config.bbox as unknown as import('@/types').GeoJSONFeature
)

// Error handlers
const handleError = (error: string) => {
  if (!errors.value.includes(error)) {
    errors.value.push(error)
  }
  console.log(error)
}

const onDataError = () => {
  emit('loaded', -1)
}

// Warnings processor
const { handleMapWarnings } = useWarningsProcessor({
  geometryId: geometryIdRef,
  geometries: geometriesRef,
  regionIds: regionIdsRef,
  warningTypes: warningTypesRef,
  timeZone: timeZoneRef,
  locale: localeRef,
  currentTime: currentTimeRef,
  startFrom: startFromRef,
  staticDays: staticDaysRef,
  dailyWarningTypes: dailyWarningTypesRef,
  maxUpdateDelay: maxUpdateDelayRef,
  bbox: bboxRef,
  geoJSONToSVG,
  t,
  handleError,
  onDataError,
})

// Computed
const toContentText = computed(() => {
  if (
    [REGION_LAND, REGION_SEA].some(
      (regionType) =>
        ((
          regions.value?.[selectedDay.value] as
            | Record<string, unknown[]>
            | undefined
        )?.[regionType]?.length ?? 0) > 0
    )
  ) {
    return t('toContent') || ''
  }
  return t('toNextContent') || ''
})

const toContentId = computed(() => {
  if (
    [REGION_LAND, REGION_SEA].some(
      (regionType) =>
        ((
          regions.value?.[selectedDay.value] as
            | Record<string, unknown[]>
            | undefined
        )?.[regionType]?.length ?? 0) > 0
    )
  ) {
    return '#fmi-warnings-region-content'
  }
  return '#fmi-warnings-end-of-regions'
})

const noWarningsText = computed(() => t('noWarnings'))

const validWarningsText = computed(() =>
  legend.value.length > 0 ? t('validWarnings') : t('noWarnings')
)

const supportedBrowsersLink = computed(() => t('supportedBrowsersLink'))

const supportedBrowsers = computed(() => t('supportedBrowsers'))

const mainInfoText = computed(() =>
  props.loading === -1 ? t('failed') : t('notInitializedStart')
)

const additionalInfoText = computed(() =>
  props.loading === -1 ? '' : t('notInitializedEnd')
)

const numWarnings = computed(() =>
  warnings.value != null ? Object.keys(warnings.value).length : 0
)

const validData = computed(
  () =>
    days.value != null &&
    days.value.length === 5 &&
    days.value[0]?.updatedDate != null &&
    days.value[0]?.updatedDate.length > 0
)

// Methods
const onDaySelected = (newSelectedDay: number) => {
  selectedDay.value = newSelectedDay as DayIndex
}

const onWarningsToggled = (newVisibleWarnings: string[]) => {
  visibleWarnings.value = newVisibleWarnings
  legend.value.forEach((warning, i) => {
    const isVisible = newVisibleWarnings.includes(warning.type)
    if (isVisible !== warning.visible && legend.value[i]) {
      legend.value[i].visible = isVisible
    }
  })
}

const onLoaded = (loaded: boolean) => {
  if (props.loading !== -1 && loaded) {
    emit('loaded', 1)
  }
}

const onThemeChanged = (newTheme: string) => {
  if (props.theme !== newTheme) {
    emit('themeChanged', newTheme)
  }
}

const toContentClicked = () => {
  const instance = getCurrentInstance()
  const el = instance?.proxy?.$el as HTMLElement | undefined
  const textContent = el?.querySelector(toContentId.value) as HTMLElement | null
  textContent?.scrollIntoView()
  textContent?.focus()
}

const createDataForChildren = () => {
  if (props.warningsData != null) {
    const result = handleMapWarnings(props.warningsData)
    warnings.value = result.warnings
    days.value = result.days
    regions.value = result.regions
    parents.value = result.parents
    legend.value = result.legend
    visibleWarnings.value = legend.value
      .filter((legendWarning) => legendWarning.visible)
      .map((legendWarning) => legendWarning.type)
  }
}

const visibilityChange = () => {
  if (isClientSide() && props.refreshInterval) {
    if (document.hidden) {
      cancelTimer()
    } else {
      cancelTimer()
      update()
      initTimer()
    }
  }
}

const initTimer = () => {
  if (props.refreshInterval) {
    timer.value = setInterval(update, props.refreshInterval)
  }
}

const cancelTimer = () => {
  if (timer.value != null) {
    clearInterval(timer.value)
  }
}

const update = () => {
  if (props.refreshInterval > 0) {
    emit('update-warnings')
  }
}

// Watch
watch(
  () => props.warningsData,
  () => {
    createDataForChildren()
  }
)

// Lifecycle
createDataForChildren()
if (props.warningsData == null) {
  update()
}

onMounted(() => {
  initTimer()
  if (isClientSide() && props.sleep) {
    document.addEventListener('visibilitychange', visibilityChange)
    visibilityListener.value = visibilityChange
  }
})

onBeforeUnmount(() => {
  if (isClientSide() && visibilityListener.value) {
    document.removeEventListener('visibilitychange', visibilityListener.value)
  }
  cancelTimer()
})

onServerPrefetch(() => {
  createDataForChildren()
})
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';

:deep(*) {
  box-sizing: border-box;
  -webkit-hyphens: none;
  -ms-hyphens: none;
  hyphens: none;
  font-family: $font-family;
  font-size: $font-size;
  line-height: 1.42857143;
  background-color: transparent;
  font-weight: normal;

  *:focus {
    outline-offset: 2px;
    z-index: 10;
  }

  .bold-text {
    font-weight: bold !important;
  }

  .noselect {
    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Chrome/Safari/Opera */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none; /* Non-prefixed version, currently not supported by any browser */
    cursor: pointer;
  }

  h3 {
    font-weight: bold;
  }
}

:deep(.light-theme *) {
  color: $light-text-color;
}

:deep(.dark-theme *) {
  color: $dark-text-color;
}

:deep(.light-gray-theme *) {
  color: $light-gray-text-color;
}

:deep(.dark-gray-theme *) {
  color: $dark-gray-text-color;
}

div#fmi-warnings {
  width: 700px;
  padding: 0;
  margin-bottom: 20px;

  h2.valid-warnings {
    text-align: left;
    font-weight: bold;
    margin-top: 0;
    margin-bottom: 3px;
  }

  div.not-ready {
    width: 100%;
    padding: 15px;
    a.supported-browsers {
      font-weight: bold;
      text-decoration: none;
    }
  }

  .light-theme div.not-ready {
    background-color: $notification-color;
    border: 1px solid $dark-blue;
    a.supported-browsers {
      color: $light-ext-link-color;
      border-bottom: 1px solid $light-ext-link-underground-color;
    }
    a.supported-browsers:hover {
      border-bottom-color: $dark-blue;
    }
  }

  .dark-theme div.not-ready {
    background-color: $darkest-gray;
    border: 1px solid $notification-color;
    a.supported-browsers {
      color: $dark-ext-link-color;
      border-bottom: 1px solid $dark-ext-link-underground-color;
    }
    a.supported-browsers:hover {
      border-bottom-color: $notification-color;
    }
  }

  .light-gray-theme div.not-ready {
    background-color: $notification-color;
    border: 1px solid $dark-blue;
    a.supported-browsers {
      color: $light-gray-ext-link-color;
      border-bottom: 1px solid $light-gray-ext-link-underground-color;
    }
    a.supported-browsers:hover {
      border-bottom-color: $black;
    }
  }

  .dark-gray-theme div.not-ready {
    background-color: $notification-color;
    border: 1px solid $light-blue;
    a.supported-browsers {
      color: $dark-gray-ext-link-color;
      border-bottom: 1px solid $dark-gray-ext-link-underground-color;
    }
    a.supported-browsers:hover {
      border-bottom-color: $white;
    }
  }

  div {
    background-color: transparent;
  }

  div.container-fluid {
    padding: 0;
    margin: 5px 0 0;
  }

  a#fmi-warnings-to-text-content {
    font-family: $font-family;
    font-size: $font-size;
    height: 20px;
    &:focus {
      outline-offset: 2px;
    }
  }
}

.row {
  margin-left: 0;
  margin-right: 0;
}

div.day-region-views {
  max-width: $map-large-width;
  width: $map-large-width;
  padding-left: 0;
  padding-right: 0;
}

div.symbol-list {
  top: 0;
  z-index: 1;
  padding-left: 20px;
  padding-right: 0;
  box-sizing: border-box;
  width: $symbol-list-width;
  max-width: $symbol-list-width;
  min-width: $symbol-list-width;
}

.light-gray-theme a.supported-browsers {
  color: $light-gray-ext-link-color;
}

.dark-gray-theme a.supported-browsers {
  color: $dark-gray-ext-link-color;
}

@media (max-width: 767px) {
  div#fmi-warnings {
    width: 100%;
  }

  div.day-region-views {
    min-width: 100%;
    width: 100%;
    max-width: 100%;
  }
  div.symbol-list {
    position: static;
    padding-left: 0;
    margin-top: 0;
    margin-bottom: 0;
    min-width: 100%;
    width: 100%;
    max-width: 100%;
  }
}

@media print {
  .symbol-list {
    display: none;
  }
}
</style>

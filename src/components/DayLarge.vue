<template>
  <div>
    <div class="map-container">
      <div class="warning-map-status" aria-hidden="true">
        <p>
          <span class="bold-text">{{ warningsTitle }}</span
          ><br />
          <span v-html="warningsDate"></span>
        </p>
        <p>
          <span class="bold-text">{{ updatedTitle }}</span
          ><br />
          {{ updatedDate }}<br />
          {{ atTime }} {{ updatedTime }}
        </p>
      </div>
      <MapLarge
        :index="index"
        :input="regions"
        :visible-warnings="visibleWarnings"
        :warnings="warnings"
        :geometry-id="geometryId"
        :loading="loading"
        :theme="theme"
        :language="language"
        :spinner-enabled="spinnerEnabled"
        @loaded="onLoaded" />
    </div>
    <div class="data-providers noselect" aria-hidden="true">
      <span>{{ dataProviderFirst }}</span>
      <br />
      <span>{{ dataProviderSecond }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { twoDigits } from '@/composables/useUtils'
import MapLarge from './MapLarge.vue'
import type { Day, DayRegions, WarningsMap, Theme, Language } from '@/types'

// ============================================================================
// Props
// ============================================================================

const props = withDefaults(
  defineProps<{
    index: number
    input?: Day
    visibleWarnings?: string[]
    warnings?: WarningsMap | null
    regions?: DayRegions
    geometryId?: number
    staticDays?: boolean
    timeOffset?: number
    loading?: boolean
    theme?: Theme | string
    language?: Language
    spinnerEnabled?: boolean
  }>(),
  {
    input: () => ({}) as Day,
    visibleWarnings: () => [],
    warnings: null,
    regions: undefined,
    geometryId: undefined,
    staticDays: true,
    timeOffset: 0,
    loading: true,
    theme: undefined,
    language: undefined,
    spinnerEnabled: true,
  }
)

// ============================================================================
// Emits
// ============================================================================

const emit = defineEmits<{
  loaded: [value: boolean]
}>()

// ============================================================================
// Composables
// ============================================================================

const { t } = useI18n(toRef(() => props.language))

// ============================================================================
// Computed Properties
// ============================================================================

const warningsTitle = computed<string>(() => {
  return t('warnings') || ''
})

const updatedTitle = computed<string>(() => {
  return t('updated') || ''
})

const atTime = computed<string>(() => {
  return t('atTime') || ''
})

const warningsDate = computed<string>(() => {
  if (
    props.input?.day == null ||
    props.input?.month == null ||
    props.input?.year == null
  ) {
    return ''
  }

  if (props.staticDays) {
    return `${props.input.day}.${props.input.month}.${props.input.year}`
  }

  const date = new Date(
    props.input.year,
    props.input.month - 1,
    props.input.day
  )
  const nextDate = new Date(date.getTime())
  nextDate.setDate(nextDate.getDate() + 1)

  const offset = props.timeOffset
  const offsetDate = new Date(date.getTime())
  offsetDate.setMilliseconds(offset)

  const hours = twoDigits(offsetDate.getHours())
  const minutes = twoDigits(offsetDate.getMinutes())

  return `${props.input.day}.${props.input.month}.${props.input.year} ${
    atTime.value
  } ${hours}:${minutes} –
      <br> ${nextDate.getDate()}.${
        nextDate.getMonth() + 1
      }.${nextDate.getFullYear()} ${atTime.value} ${hours}:${minutes}`
})

const updatedDate = computed<string>(() => {
  return props.input?.updatedDate || ''
})

const updatedTime = computed<string>(() => {
  return props.input?.updatedTime || ''
})

const dataProviderFirst = computed<string>(() => {
  return t('dataProviderFirst')
})

const dataProviderSecond = computed<string>(() => {
  return t('dataProviderSecond')
})

// ============================================================================
// Methods
// ============================================================================

const onLoaded = (loaded: boolean): void => {
  if (loaded) {
    emit('loaded', true)
  }
}

// ============================================================================
// Expose for tests
// ============================================================================

defineExpose({
  warningsTitle,
  updatedTitle,
  atTime,
  warningsDate,
  updatedDate,
  updatedTime,
  dataProviderFirst,
  dataProviderSecond,
  onLoaded,
  // Props exposed for tests
  input: computed(() => props.input),
  spinnerEnabled: computed(() => props.spinnerEnabled),
})
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';

div,
span {
  background-color: $transparent;
}

p {
  background: transparent;
  margin: 0 0 10px;
  padding: 0;
  white-space: normal !important;
}

br {
  white-space: normal;
}

div.map-container {
  text-align: center;
  margin-left: 0;
  margin-right: 0;
  position: relative;
  max-height: $map-large-height;
  background: transparent;
  top: 0;
}

div.warning-map-status {
  position: absolute;
  margin-left: 15px;
  text-align: left;
  z-index: 2;
  pointer-events: none;
}

div.data-providers {
  position: relative;
  text-align: right;
  z-index: 3;
  pointer-events: none;
  padding-left: 50%;
  margin-top: -50px;
  margin-right: 15px;
}

@media screen and (orientation: landscape) {
  div.map-container {
    height: $map-large-height;
  }
}
</style>

<template>
  <div
    :class="['date-selector-cell', theme, { active: active }]"
    :aria-label="ariaLabel">
    <div class="date-selector-cell-header"></div>
    <div class="date-selector-cell-body map-container">
      <MapSmall
        :index="index"
        :input="regions"
        :visible-warnings="visibleWarnings"
        :warnings="warnings"
        :geometry-id="geometryId"
        :loading="loading"
        :theme="theme" />
    </div>
    <div class="date-selector-cell-date">
      <div :class="`date-selector-text mobile-level-${severity}`">
        <span v-if="staticDays" class="bold-text weekday-text">{{
          weekday
        }}</span>
        <br v-if="staticDays" class="d-inline d-sm-none" />
        {{ date }}
      </div>
    </div>
    <div :class="`date-selector-cell-footer dark-level-${severity}`"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useI18n } from '@/composables/useI18n'
import MapSmall from './MapSmall.vue'
import type {
  Day,
  DayRegions,
  WarningsMap,
  Theme,
  Language,
  Severity,
} from '@/types'

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
    active?: boolean
    staticDays?: boolean
    loading?: boolean
    theme?: Theme | string
    language?: Language
  }>(),
  {
    input: () => ({}) as Day,
    visibleWarnings: () => [],
    warnings: null,
    regions: () => ({ land: [], sea: [] }),
    geometryId: undefined,
    active: false,
    staticDays: true,
    loading: true,
    theme: 'light-theme',
    language: undefined,
  }
)

// ============================================================================
// Composables
// ============================================================================

const { t } = useI18n(toRef(() => props.language))

// ============================================================================
// Computed Properties
// ============================================================================

const weekday = computed<string>(() => {
  return t(props.input?.weekdayName) || ''
})

const severity = computed<Severity>(() => {
  return props.input?.severity ?? 0
})

const date = computed<string>(() => {
  if (!props.staticDays) {
    const timeRanges = [
      '0...24 h',
      '24...48 h',
      '48...72 h',
      '72...96 h',
      '96...120 h',
    ]
    return timeRanges[props.index] || ''
  }
  return props.input?.day != null && props.input?.month != null
    ? `${props.input.day}.${props.input.month}.`
    : ''
})

const ariaLabel = computed<string>(() => {
  const landCount = props.regions?.land?.length || 0
  const seaCount = props.regions?.sea?.length || 0
  const weekdayKey = `${props.input?.weekdayName}Full`;
  const monthName = t(`month${props.input?.month}`)
  return `${t(weekdayKey)} ${props.input?.day}. ${monthName}: `
    + `${t('warningsInEffect')} ${landCount} ${t('landAreas')} `
    + `${seaCount} ${t('seaAreas')}.`
})

// ============================================================================
// Expose for tests
// ============================================================================

defineExpose({
  weekday,
  severity,
  date,
  ariaLabel,
})
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';

div.date-selector-cell {
  &.active {
    &.light-theme {
      background-color: $lightest-gray;
      div.date-selector-cell-footer {
        background-color: $dark-blue;
        &:after {
          border-top: solid 7px $dark-blue;
        }
      }
    }
    &.dark-theme {
      background-color: $darkest-gray;
      div.date-selector-cell-footer {
        background-color: $dark-text-color;
        &:after {
          border-top: solid 7px $dark-text-color;
        }
      }
    }
    &.light-gray-theme {
      background-color: $lightest-gray;
      div.date-selector-cell-footer {
        background-color: $light-gray-text-color;
        &:after {
          border-top: solid 7px $light-gray-text-color;
        }
      }
    }
    &.dark-gray-theme {
      background-color: $darkest-gray;
      div.date-selector-cell-footer {
        background-color: $dark-gray-text-color;
        &:after {
          border-top: solid 7px $dark-gray-text-color;
        }
      }
    }

    .date-selector-cell-footer:after {
      display: inline;
      content: '';
      position: absolute;
      border-left: solid 5px transparent;
      border-right: solid 5px transparent;
      top: 4px;
      left: -webkit-calc(50% - 5px);
      left: -moz-calc(50% - 5px);
      left: calc(50% - 5px);
    }
  }

  .date-selector-cell-header {
    position: relative;
    height: 2px;
    background-color: transparent;
  }

  .date-selector-cell-footer {
    position: relative;
    height: 4px;
    margin-bottom: 20px;
  }

  &.light-theme > .date-selector-cell-footer {
    background-color: $light-date-selector-footer-color;
  }

  &.dark-theme > .date-selector-cell-footer {
    background-color: $dark-date-selector-footer-color;
  }

  &.light-gray-theme > .date-selector-cell-footer {
    background-color: $light-gray-date-selector-footer-color;
  }

  &.dark-gray-theme > .date-selector-cell-footer {
    background-color: $dark-gray-date-selector-footer-color;
  }

  .date-selector-cell-body {
    height: 130px;
  }

  div.map-container {
    text-align: center;
    margin-left: 0;
    margin-right: 0;
  }

  .date-selector-text {
    text-align: center;
    display: table-cell;
    vertical-align: middle;
    white-space: nowrap;
  }

  .date-selector-cell-date {
    width: 100%;
    display: table;
    height: 30px;
  }
}

@media (width < 576px) {
  .map-small,
  .map-container {
    display: none;
  }

  .light-theme div.date-selector-cell-date * {
    color: $light-date-selector-mobile-text-color !important;
  }

  .dark-theme div.date-selector-cell-date * {
    color: $dark-date-selector-mobile-text-color !important;
  }

  .light-gray-theme div.date-selector-cell-date * {
    color: $light-gray-date-selector-mobile-text-color !important;
  }

  .dark-gray-theme div.date-selector-cell-date * {
    color: $dark-gray-date-selector-mobile-text-color !important;
  }

  div.date-selector-cell-date {
    height: 60px !important;
  }

  .light-theme,
  .dark-theme {
    div.mobile-level-0 {
      color: $black !important;
      background-color: $light-green !important;
      .weekday-text {
        color: $black !important;
      }
    }

    div.mobile-level-1 {
      color: $black !important;
      background-color: $light-green !important;
      .weekday-text {
        color: $black !important;
      }
    }

    div.mobile-level-2 {
      color: $black !important;
      background-color: $light-yellow !important;
      .weekday-text {
        color: $black !important;
      }
    }

    div.mobile-level-3 {
      color: $black !important;
      background-color: $light-orange !important;
      .weekday-text {
        color: $black !important;
      }
    }

    div.mobile-level-4 {
      color: $black !important;
      background-color: $light-red !important;
      .weekday-text {
        color: $black !important;
      }
    }
  }

  .light-gray-theme {
    div.mobile-level-0 {
      color: $black !important;
      background-color: $light-gray-green !important;
      .weekday-text {
        color: $black !important;
      }
    }

    div.mobile-level-1 {
      color: $black !important;
      background-color: $light-gray-green !important;
      .weekday-text {
        color: $black !important;
      }
    }

    div.mobile-level-2 {
      color: $black !important;
      background-color: $light-gray-yellow !important;
      .weekday-text {
        color: $black !important;
      }
    }

    div.mobile-level-3 {
      color: $white !important;
      background-color: $light-gray-orange !important;
      .weekday-text {
        color: $white !important;
      }
    }

    div.mobile-level-4 {
      color: $white !important;
      background-color: $light-gray-red !important;
      .weekday-text {
        color: $white !important;
      }
    }
  }

  .dark-gray-theme {
    div.mobile-level-0 {
      color: $black !important;
      background-color: $dark-gray-green !important;
      .weekday-text {
        color: $black !important;
      }
    }

    div.mobile-level-1 {
      color: $black !important;
      background-color: $dark-gray-green !important;
      .weekday-text {
        color: $black !important;
      }
    }

    div.mobile-level-2 {
      color: $black !important;
      background-color: $dark-gray-yellow !important;
      .weekday-text {
        color: $black !important;
      }
    }

    div.mobile-level-3 {
      color: $white !important;
      background-color: $dark-gray-orange !important;
      .weekday-text {
        color: $white !important;
      }
    }

    div.mobile-level-4 {
      color: $white !important;
      background-color: $dark-gray-red !important;
      .weekday-text {
        color: $white !important;
      }
    }
  }
}
</style>

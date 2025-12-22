<template>
  <div class="row date-selector" :class="theme">
    <div id="fmi-warnings-date-selector" class="tabs">
      <div class="fmi-warnings-date-wrapper">
        <ul class="nav nav-tabs fmi-warnings-date-nav" role="tablist">
          <li
            v-for="(_n, i) in numberOfDays"
            :key="i"
            class="nav-item"
            role="presentation">
            <button
              :class="['nav-link', 'day', `day${i}`, { active: i === day }]"
              type="button"
              role="tab"
              :aria-selected="i === day"
              @click="day = i">
              <DaySmall
                :index="i"
                :input="input[i]"
                :visible-warnings="visibleWarnings"
                :warnings="warnings"
                :regions="regions?.[i]"
                :geometry-id="geometryId"
                :active="i === day"
                :static-days="staticDays"
                :loading="loading"
                :theme="theme"
                :language="language" />
            </button>
          </li>
        </ul>
      </div>
      <div class="tab-content">
        <div
          v-for="(_n, i) in numberOfDays"
          :key="i"
          :class="['tab-pane', { active: i === day, show: i === day }]"
          role="tabpanel">
          <DayLarge
            v-if="i === day"
            :index="i"
            :input="input[i]"
            :visible-warnings="visibleWarnings"
            :warnings="warnings"
            :regions="regions?.[i]"
            :geometry-id="geometryId"
            :static-days="staticDays"
            :time-offset="timeOffset"
            :loading="loading"
            :theme="theme"
            :language="language"
            :spinner-enabled="spinnerEnabled"
            @loaded="onLoaded" />
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
  onUpdated,
  getCurrentInstance,
} from 'vue'
import { useKeyCodes } from '@/composables/useKeyCodes'
import { NUMBER_OF_DAYS } from '@/composables/useUtils'
import DayLarge from './DayLarge.vue'
import DaySmall from './DaySmall.vue'
import type { Day, RegionsData, WarningsMap, Theme, Language } from '@/types'

// ============================================================================
// Props
// ============================================================================

const props = withDefaults(
  defineProps<{
    input?: Day[]
    visibleWarnings?: string[]
    selectedDay?: 0 | 1 | 2 | 3 | 4
    staticDays?: boolean
    timeOffset?: number
    warnings?: WarningsMap | null
    regions?: RegionsData
    geometryId?: number
    loading?: boolean
    theme?: Theme | string
    language?: Language
    spinnerEnabled?: boolean
  }>(),
  {
    input: () => [],
    visibleWarnings: () => [],
    selectedDay: 0,
    staticDays: true,
    timeOffset: 0,
    warnings: null,
    regions: undefined,
    geometryId: undefined,
    loading: true,
    theme: 'light-theme',
    language: undefined,
    spinnerEnabled: true,
  }
)

// ============================================================================
// Emits
// ============================================================================

const emit = defineEmits<{
  daySelected: [day: number]
  loaded: [value: boolean]
}>()

// ============================================================================
// Composables
// ============================================================================

const { KEY_CODE_LEFT, KEY_CODE_RIGHT, KEY_CODE_HOME, KEY_CODE_END } =
  useKeyCodes()

// ============================================================================
// State
// ============================================================================

const day = ref<number>(props.selectedDay)
const instance = getCurrentInstance()

// ============================================================================
// Computed
// ============================================================================

const numberOfDays = computed<number>(() => NUMBER_OF_DAYS)

// ============================================================================
// Methods
// ============================================================================

const onDaySelected = (newSelectedDay: number): void => {
  emit('daySelected', newSelectedDay)
}

const onLoaded = (loaded: boolean): void => {
  if (loaded) {
    emit('loaded', true)
  }
}

const switchDay = (event: KeyboardEvent): void => {
  switch (event.keyCode) {
    case KEY_CODE_LEFT:
      day.value = Math.max(day.value - 1, 0)
      event.preventDefault()
      break
    case KEY_CODE_RIGHT:
      day.value = Math.min(day.value + 1, 4)
      event.preventDefault()
      break
    case KEY_CODE_HOME:
      day.value = 0
      event.preventDefault()
      break
    case KEY_CODE_END:
      day.value = 4
      event.preventDefault()
      break
  }
  const el = instance?.proxy?.$el as HTMLElement | undefined
  el?.querySelector<HTMLButtonElement>(`button.day.day${day.value}`)?.focus()
}

// ============================================================================
// Watchers
// ============================================================================

watch(day, (newSelectedDay) => {
  onDaySelected(newSelectedDay)
})

// ============================================================================
// Lifecycle Hooks
// ============================================================================

onMounted(() => {
  const el = instance?.proxy?.$el as HTMLElement | undefined
  if (el) {
    Array.from(el.querySelectorAll<HTMLButtonElement>('button.day')).forEach(
      (button) => {
        button.addEventListener('keydown', switchDay, true)
      }
    )
  }
})

onBeforeUnmount(() => {
  const el = instance?.proxy?.$el as HTMLElement | undefined
  if (el) {
    Array.from(el.querySelectorAll<HTMLButtonElement>('button.day')).forEach(
      (button) => {
        button.removeEventListener('keydown', switchDay, true)
      }
    )
  }
})

onUpdated(() => {
  const el = instance?.proxy?.$el as HTMLElement | undefined
  if (el) {
    Array.from(el.querySelectorAll<HTMLButtonElement>('button.day')).forEach(
      (button) => {
        if (button.classList.contains('active')) {
          button.removeAttribute('tabindex')
        } else {
          button.setAttribute('tabindex', '-1')
        }
      }
    )
  }
})

// ============================================================================
// Expose for tests
// ============================================================================

defineExpose({
  day,
  numberOfDays,
  switchDay,
  onDaySelected,
  onLoaded,
  // Props exposed for tests
  input: computed(() => props.input),
})
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';

div#fmi-warnings-date-selector.tabs {
  padding: 0;
}

.date-selector {
  margin: 0;
  &.light-theme {
    background-color: $light-date-selector-background-color;
  }
  &.dark-theme {
    background-color: $dark-date-selector-background-color;
  }
  &.light-gray-theme {
    background-color: $light-gray-date-selector-background-color;
  }
  &.dark-gray-theme {
    background-color: $dark-gray-date-selector-background-color;
  }
}

.row {
  display: block;
  margin-left: 0;
  margin-right: 0;
}

:deep(.fmi-warnings-date-nav) {
  border-bottom: none;
  flex-wrap: nowrap;
}

:deep(
    div.fmi-warnings-date-wrapper
      > ul.nav.nav-tabs.fmi-warnings-date-nav
      > li.nav-item
  ) {
  flex: 1;
  margin: 0;
}

:deep(div.fmi-warnings-date-wrapper li.nav-item button.day) {
  width: 100%;
  height: $day-small-height;
  border-radius: 0;
  border: 0;
  padding: 0;
  margin: 0;
  text-align: center;
  color: transparent;
}

:deep(button.day div.date-selector-cell) {
  min-height: $day-small-height;
  overflow: visible;
}

:deep(button.day) {
  border: none !important;
  div.date-selector-cell {
    > div {
      border-top: none !important;
      border-bottom: none !important;
      border-left: none !important;
      border-right: none !important;
    }
    &.light-theme > div {
      border-left: 1px solid $light-border-color !important;
      border-right: 1px solid $light-border-color !important;
    }
    &.dark-theme > div {
      border-left: 1px solid $dark-border-color !important;
      border-right: 1px solid $dark-border-color !important;
    }
    &.light-gray-theme > div {
      border-left: 1px solid $light-gray-border-color !important;
      border-right: 1px solid $light-gray-border-color !important;
    }
    &.dark-gray-theme > div {
      border-left: 1px solid $dark-gray-border-color !important;
      border-right: 1px solid $dark-gray-border-color !important;
    }
  }
}

:deep(button.day.active div.date-selector-cell.active) {
  &.light-theme {
    div.date-selector-cell-header {
      border-top: 2px solid $dark-blue !important;
    }
    > div {
      border-left: 2px solid $dark-blue !important;
      border-right: 2px solid $dark-blue !important;
    }
  }
  &.dark-theme {
    div.date-selector-cell-header {
      border-top: 2px solid $white !important;
    }
    > div {
      border-left: 2px solid $white !important;
      border-right: 2px solid $white !important;
    }
  }
  &.light-gray-theme {
    div.date-selector-cell-header {
      border-top: 2px solid $black !important;
    }
    > div {
      border-left: 2px solid $black !important;
      border-right: 2px solid $black !important;
    }
  }
  &.dark-gray-theme {
    div.date-selector-cell-header {
      border-top: 2px solid $white !important;
    }
    > div {
      border-left: 2px solid $white !important;
      border-right: 2px solid $white !important;
    }
  }
}

:deep(.nav-tabs button.day.nav-link.active) {
  background: transparent !important;
}

:deep(div.tab-content) {
  margin-top: 20px;
}

@media (max-width: 767px) {
  :deep(div.fmi-warnings-date-wrapper li.nav-item button.day) {
    width: 100%;
  }
}

@media (width < 576px) {
  :deep(div.fmi-warnings-date-wrapper li.nav-item button.day) {
    border-bottom: 0;
    border-radius: 0;
    margin-bottom: 0;
    height: $day-small-mobile-height;
  }

  :deep(button.day div.date-selector-cell) {
    height: $day-small-mobile-height;
  }
}
</style>

<template>
  <div id="fmi-warnings-view" :class="theme" :lang="language">
    <div
      v-if="input.length > 0"
      :class="['row', 'symbol-list-main-row', 'show-text-row']">
      <button
        tabindex="0"
        type="button"
        class="bold-text show-text d-none focus-ring"
        :class="{ 'd-sm-block': hiddenWarnings }"
        @click="showAll">
        {{ showWarningsText }}
      </button>
    </div>
    <div v-if="input.length > 0" class="row symbol-list-main-row">
      <hr class="symbol-block-separator" />
    </div>
    <div id="fmi-warnings-list">
      <Warning
        v-for="warning in warnings"
        :key="warning.type"
        :input="warning"
        :hideable="warnings.length > 1"
        :theme="theme"
        :language="language"
        @warning-toggled="onWarningToggled" />
    </div>
    <div class="row symbol-list-main-row">
      <hr
        class="symbol-block-separator legend-separator"
        :class="noWarnings ? 'no-warnings' : ''" />
    </div>
    <div class="row symbol-list-main-row">
      <div class="symbol-list-table">
        <div class="symbol-list-cell symbol-list-cell-image">
          <div
            class="gray several symbol-list-image-column symbol-list-image warning-image"
            aria-labelledby="symbol-list-several-warnings-text"></div>
        </div>
        <div class="symbol-list-cell symbol-list-cell-text">
          <div
            id="symbol-list-several-warnings-text"
            class="item-text symbol-list-text">
            {{ severalWarningsText }}
          </div>
        </div>
      </div>
    </div>
    <div class="row symbol-list-main-row">
      <div class="symbol-list-table">
        <div class="symbol-list-cell symbol-list-cell-image">
          <div
            class="level-1 symbol-list-image-column symbol-list-image warning-image"
            aria-labelledby="symbol-list-warning-level-1-text"></div>
        </div>
        <div class="symbol-list-cell symbol-list-cell-text">
          <div
            id="symbol-list-warning-level-1-text"
            class="item-text symbol-list-text">
            {{ warningLevel1Text }}
          </div>
        </div>
      </div>
    </div>
    <div class="row symbol-list-main-row">
      <div class="symbol-list-table">
        <div class="symbol-list-cell symbol-list-cell-image">
          <div
            class="level-2 symbol-list-image-column symbol-list-image warning-image"
            aria-labelledby="symbol-list-warning-level-2-text"></div>
        </div>
        <div class="symbol-list-cell symbol-list-cell-text">
          <div
            id="symbol-list-warning-level-2-text"
            class="item-text symbol-list-text">
            {{ warningLevel2Text }}
          </div>
        </div>
      </div>
    </div>
    <div class="row symbol-list-main-row">
      <div class="symbol-list-table">
        <div class="symbol-list-cell symbol-list-cell-image">
          <div
            class="level-3 symbol-list-image-column symbol-list-image warning-image"
            aria-labelledby="symbol-list-warning-level-3-text"></div>
        </div>
        <div class="symbol-list-cell symbol-list-cell-text">
          <div
            id="symbol-list-warning-level-3-text"
            class="item-text symbol-list-text">
            {{ warningLevel3Text }}
          </div>
        </div>
      </div>
    </div>
    <div class="row symbol-list-main-row">
      <div class="symbol-list-table">
        <div class="symbol-list-cell symbol-list-cell-image">
          <div
            class="level-4 symbol-list-image-column symbol-list-image warning-image"
            aria-labelledby="symbol-list-warning-level-4-text"></div>
        </div>
        <div class="symbol-list-cell symbol-list-cell-text">
          <div
            id="symbol-list-warning-level-4-text"
            class="item-text symbol-list-text">
            {{ warningLevel4Text }}
          </div>
          <hr class="bottom-separator" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useI18n } from '@/composables/useI18n'
import Warning from './Warning.vue'
import type { LegendItem, Theme, Language } from '@/types'

// ============================================================================
// Props
// ============================================================================

const props = withDefaults(
  defineProps<{
    input?: LegendItem[]
    visibleWarnings?: string[]
    language?: Language
    theme?: Theme | string
  }>(),
  {
    input: () => [],
    visibleWarnings: () => [],
    language: undefined,
    theme: 'light-theme',
  }
)

// ============================================================================
// Emits
// ============================================================================

const emit = defineEmits<{
  warningsToggled: [visibleWarnings: string[]]
  showAllWarnings: []
}>()

// ============================================================================
// Composables
// ============================================================================

const { t } = useI18n(toRef(() => props.language))

// ============================================================================
// Computed Properties
// ============================================================================

const warnings = computed<LegendItem[]>(() => {
  return props.input
})

const hiddenWarnings = computed<boolean>(() => {
  return props.visibleWarnings.length !== props.input.length
})

const noWarnings = computed<boolean>(() => {
  return warnings.value.length === 0
})

const warningSymbolsText = computed<string>(() => {
  return noWarnings.value ? t('noWarnings') : t('warningSymbols')
})

const warningSymbolDaysText = computed<string>(() => {
  return noWarnings.value ? '' : t('warningSymbolDays')
})

const showWarningsText = computed<string>(() => {
  return t('showWarnings')
})

const severalWarningsText = computed<string>(() => {
  return t('severalWarnings')
})

const warningLevel1Text = computed<string>(() => {
  return t('warningLevel1')
})

const warningLevel2Text = computed<string>(() => {
  return t('warningLevel2')
})

const warningLevel3Text = computed<string>(() => {
  return t('warningLevel3')
})

const warningLevel4Text = computed<string>(() => {
  return t('warningLevel4')
})

// ============================================================================
// Methods
// ============================================================================

interface WarningToggleEvent {
  warning: string
  visible: boolean
}

const onWarningToggled = ({ warning, visible }: WarningToggleEvent): void => {
  let newVisibleWarnings = [...props.visibleWarnings]
  if (visible && !props.visibleWarnings.includes(warning)) {
    newVisibleWarnings.push(warning)
  } else if (!visible) {
    newVisibleWarnings = newVisibleWarnings.filter(
      (visibleWarning) => visibleWarning !== warning
    )
  }
  emit('warningsToggled', newVisibleWarnings)
}

const showAll = (): void => {
  emit('showAllWarnings')
}

// ============================================================================
// Expose for tests
// ============================================================================

defineExpose({
  warnings,
  hiddenWarnings,
  noWarnings,
  warningSymbolsText,
  warningSymbolDaysText,
  showWarningsText,
  severalWarningsText,
  warningLevel1Text,
  warningLevel2Text,
  warningLevel3Text,
  warningLevel4Text,
  onWarningToggled,
  showAll,
})
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';
@import '../scss/warningImages.scss';

h3 {
  font-family: $font-family;
  font-size: $font-size;
  font-weight: bold;
  white-space: nowrap;
  margin-top: 0;
}

.row {
  display: block;
  margin-left: 0;
  margin-right: 0;
}

div.symbol-list-main-row {
  padding-left: 0;
}

div.show-text-row {
  height: 30px;
  button.show-text {
    width: auto;
    padding: 0;
    border: none;
    background: none;
  }
}

div#fmi-warnings-view > div.row > button.show-text {
  height: 30px;
  line-height: 30px;
  float: right;
  cursor: pointer;
  white-space: nowrap;
}

div#fmi-warnings-view.light-theme > div.row > button.show-text {
  color: $blue;
}

div#fmi-warnings-view.dark-theme > div.row > button.show-text {
  color: $blue;
}

div#fmi-warnings-view.light-gray-theme > div.row > button.show-text {
  color: $darker-gray;
}

div#fmi-warnings-view.dark-gray-theme > div.row > button.show-text {
  color: $lighter-gray;
}

hr.symbol-block-separator {
  margin-left: 59px;
  margin-right: 0;
}

hr.legend-separator {
  margin-top: 55px;
  &.no-warnings {
    margin-top: 10px;
  }
}

div.symbol-list-table {
  display: table;
  border-spacing: 0;
  width: 100%;
  padding: 0;
}

div.symbol-list-cell {
  display: table-cell;
  vertical-align: middle;
  line-height: $symbol-list-line-height;
  text-align: left;
}

div.symbol-list-cell-image {
  width: $symbol-list-image-size;
}

.light-theme .gray {
  background-color: $light-legend-toggle-background-color;
}

.dark-theme .gray {
  background-color: $dark-legend-toggle-background-color;
}

.light-gray-theme .gray {
  background-color: $light-gray-legend-toggle-background-color;
}

.dark-gray-theme .gray {
  background-color: $dark-gray-legend-toggle-background-color;
}

@media (forced-colors: active) {
  .gray {
    forced-color-adjust: none;
  }
}

.several {
  background-image: url($warning-image-path + 'several' + $image-extension);
}

div.symbol-list-image-column {
  width: 44px;
  margin-top: 2px;
}

.symbol-list-image {
  height: $symbol-list-image-size;
  background-size: $symbol-list-image-size $symbol-list-image-size;
  &.sea-wind {
    background-image: url($warning-image-path + 'sea-wind-legend' + $image-extension);
  }
}

div.warning-image {
  border-radius: 50%;
  background-repeat: no-repeat;
  background-position: center;
}

.light-gray-theme div.warning-image {
  border: 1px solid $light-gray-border;
}

.dark-gray-theme div.warning-image {
  border: 1px solid $white;
}

div.symbol-list-cell-text {
  padding-left: 15px;
  padding-right: 0;
}

div#fmi-warnings-list div.symbol-list-cell-text {
  padding-right: 0;
  hr {
    margin-right: 0;
  }
}

div#fmi-warnings-view {
  div.symbol-list-table {
    div.symbol-list-cell.symbol-list-cell-text {
      padding-right: 0;
      hr {
        margin-right: 0;
      }
    }
  }
}

.item-text {
  display: inline-block;
  vertical-align: middle;
  line-height: normal;
}

div.symbol-list-text {
  display: table-cell;
  height: $symbol-list-line-height;
  // See Warning.vue: overflow-wrap instead of word-break so &shy; hints win,
  // plus automatic hyphenation (with -webkit- prefix for Safari) for the
  // interpolated level texts, scoped by the :lang on #fmi-warnings-view.
  overflow-wrap: break-word;
  -webkit-hyphens: auto;
  hyphens: auto;
}

hr {
  padding: 0;
  margin: 0;
  border: 0 none;
  height: 2px;
  width: auto;
  opacity: 1;
}

.light-theme hr {
  background-color: $light-horizontal-rule-color;
  color: $light-horizontal-rule-color;
}

.dark-theme hr {
  background-color: $dark-horizontal-rule-color;
  color: $dark-horizontal-rule-color;
}

.light-gray-theme hr {
  background-color: $light-gray-horizontal-rule-color;
  color: $light-gray-horizontal-rule-color;
}

.dark-gray-theme hr {
  background-color: $dark-gray-horizontal-rule-color;
  color: $dark-gray-horizontal-rule-color;
}

@media (max-width: 767px) {
  hr {
    &.symbol-block-separator,
    &.bottom-separator {
      display: none;
    }
  }

  div.show-text-row {
    display: none;
  }

  :deep(br.symbol-list-header-line-break) {
    display: none;
  }
}
</style>

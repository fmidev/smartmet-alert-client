<template>
  <div class="symbol-list-table" :class="theme">
    <div class="symbol-list-cell symbol-list-cell-image">
      <div
        :class="`level-${severity} ${typeClass} symbol-list-image-column symbol-list-image warning-image`"
        :aria-label="`${warningLevelText} ${title.toLowerCase()}`"></div>
    </div>
    <div class="symbol-list-cell symbol-list-cell-text">
      <div class="symbol-list-text-select">
        <!-- eslint-disable-next-line vue/no-v-html -->
        <div class="item-text symbol-list-text" v-html="title"></div>
        <div class="symbol-list-select-container d-none d-md-table-cell">
          <div
            :id="id"
            :class="[
              'symbol-list-select',
              input.visible ? 'flag-selected' : 'flag-unselected',
              { 'd-md-block': hideable },
              'focus-ring',
              'd-none',
            ]"
            role="button"
            tabindex="0"
            :aria-pressed="input.visible ? 'true' : 'false'"
            :aria-label="title.replace(/&[^;]*;/g, '')"
            @mousedown="preventEvents"
            @click="toggle"
            @keydown.enter="toggle"
            @keydown.space="toggle">
            <span>
              {{ toggleText }}
            </span>
          </div>
        </div>
      </div>
      <hr />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useFields } from '@/composables/useFields'
import { useI18n } from '@/composables/useI18n'
import type { LegendItem } from '@/types'

// Props
const props = defineProps<{
  input: LegendItem
  hideable?: boolean
  language?: string
  theme?: string
}>()

// Emits
const emit = defineEmits<{
  warningToggled: [data: { warning: string; visible: boolean }]
}>()

// Composables
const { typeClass, rotation, invertedRotation, severity } = useFields(
  toRef(props, 'input')
)
const { t } = useI18n(toRef(props, 'language'))

// Expose for testing
defineExpose({
  rotation,
  invertedRotation,
})

// Computed
const id = computed((): string => {
  return `fmi-warnings-flag-${props.input.type}`
})

const title = computed((): string => {
  return t(props.input.type)
})

const warningLevelText = computed((): string => {
  return t(`warningLevel${severity.value}`)
})

const toggleText = computed((): string => {
  return props.input.visible ? t('toggleOn') : t('toggleOff')
})

// Methods
function toggle(event: Event): void {
  event.preventDefault()
  setWarningVisibility(!props.input.visible)
}

function setWarningVisibility(visible: boolean): void {
  emit('warningToggled', {
    warning: props.input.type,
    visible,
  })
}

function preventEvents(event: Event): void {
  event.preventDefault()
}
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';
@import '../scss/warningImages.scss';

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

div#fmi-warnings-list div.symbol-list-cell-text {
  padding-right: 0;
  hr {
    margin-right: 0;
  }
}

div.symbol-list-text-select {
  width: 100%;
  display: table;
}

.item-text {
  display: inline-block;
  vertical-align: middle;
  line-height: normal;
}

div.symbol-list-text {
  display: table-cell;
  height: $symbol-list-line-height;
  max-width: 141px;
  padding-right: 10px;
  word-break: break-word;
  hyphens: auto;
}

.symbol-list-select-container {
  width: 55px;
  height: $symbol-list-line-height;
  display: table-cell;
  vertical-align: middle;
}

.symbol-list-select.d-md-block {
  display: flex !important;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: $symbol-list-select-height;
  cursor: pointer;
  margin: 0;
  background-repeat: no-repeat;
  background-position: center;
  &.flag-selected {
    padding-right: 18px;
    background-image: url($ui-image-path + 'toggle-selected' + $image-extension);
    span {
      color: $toggle-on-text;
    }
  }
  &.flag-unselected {
    padding-left: 18px;
    background-image: url($ui-image-path + 'toggle-unselected' + $image-extension);
    span {
      color: $toggle-off-text;
    }
  }
  span {
    font-family: 'Noto Sans', sans-serif;
    font-size: $font-size;
    forced-color-adjust: none;
  }
}

@media (max-width: 767px) {
  div.symbol-list-table {
    div.symbol-list-cell.symbol-list-cell-text {
      padding-right: 0;
      hr {
        margin-right: 0;
      }
    }
  }
}
</style>

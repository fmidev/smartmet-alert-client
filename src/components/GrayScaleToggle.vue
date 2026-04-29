<template>
  <div v-if="grayScaleSelector" id="gray-scale-select-row" :class="theme">
    <div id="gray-scale-select-text">{{ grayScaleText }}</div>
    <div id="gray-scale-select-container">
      <div
        id="gray-scale-select"
        :class="[
          'focus-ring',
          grayScale ? 'gray-scale-selected' : 'gray-scale-unselected',
        ]"
        role="button"
        tabindex="0"
        :aria-pressed="grayScale ? 'true' : 'false'"
        :aria-label="grayScaleText"
        @mousedown="preventEvents"
        @click="toggleGrayScale"
        @keydown.enter="toggleGrayScale"
        @keydown.space="toggleGrayScale">
        <span>
          {{ toggleText }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useI18n } from '@/composables/useI18n'

// Props
const props = withDefaults(
  defineProps<{
    language?: string
    grayScaleSelector?: boolean
    theme?: string
  }>(),
  {
    language: import.meta.env.VITE_LANGUAGE || 'fi',
    grayScaleSelector: false,
    theme: 'light-theme',
  }
)

// Emits
const emit = defineEmits<{
  themeChanged: [theme: string]
}>()

// Composables
const { t } = useI18n(toRef(props, 'language'))

// Computed
const grayScale = computed((): boolean => {
  if (props.theme == null || props.theme.length === 0) {
    return false
  }
  const themeParts = props.theme.split('-')
  return themeParts.length > 1 && themeParts[1] === 'gray'
})

const grayScaleText = computed((): string => {
  return t('grayScale')
})

const toggleText = computed((): string => {
  return grayScale.value ? t('toggleOn') : t('toggleOff')
})

// Methods
function toggleGrayScale(event: Event): void {
  event.preventDefault()
  if (props.theme == null || props.theme.length === 0) {
    return
  }
  const baseTheme = props.theme.split('-')[0] ?? 'light'
  emit('themeChanged', grayScale.value ? baseTheme : `${baseTheme}-gray`)
}

function preventEvents(event: Event): void {
  event.preventDefault()
}
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';

div#gray-scale-select-row {
  width: 100%;
  margin-top: 20px;
  padding-left: 59px;
  &.narrow-screen {
    display: none;
  }
  &:not(.narrow-screen) {
    display: table;
  }
}

div#gray-scale-select-text {
  display: table-cell;
  max-width: 141px;
  padding-right: 5px;
  vertical-align: middle;
  line-height: normal;
  word-break: break-word;
  hyphens: auto;
}

div#gray-scale-select-container {
  display: table-cell;
  width: 55px;
  height: $symbol-list-line-height;
  vertical-align: middle;
}

div#gray-scale-select {
  display: grid;
  place-items: center;
  width: 100%;
  height: $symbol-list-select-height;
  margin: 0;
  background-repeat: no-repeat;
  background-position: center;
  cursor: pointer;
  &.gray-scale-selected {
    padding-right: 18px;
    background-image: url($ui-image-path + 'toggle-selected' + $image-extension);
    span {
      color: $toggle-on-text;
    }
  }
  &.gray-scale-unselected {
    padding-left: 18px;
    background-image: url($ui-image-path + 'toggle-unselected' + $image-extension);
    span {
      color: $toggle-off-text;
    }
  }
  span {
    font-family: $symbol-font-family;
    font-size: $font-size;
    forced-color-adjust: none;
    line-height: 1;
  }
}

@media (max-width: 767px) {
  div#gray-scale-select-row {
    margin-top: 0;
    &.narrow-screen {
      display: table;
      div#gray-scale-select-text {
        text-align: right;
        padding-right: 10px;
      }
    }
    &:not(.narrow-screen) {
      display: none;
    }
    div#gray-scale-select-container {
      height: 100%;
    }
  }
}
</style>

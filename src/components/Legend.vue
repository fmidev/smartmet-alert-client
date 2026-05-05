<template>
  <div class="sticky-top" :class="theme">
    <GrayScaleToggle
      class="narrow-screen"
      :language="language"
      :gray-scale-selector="grayScaleSelector"
      :theme="theme"
      @theme-changed="onThemeChanged" />
    <div class="row symbol-list-header-row">
      <nav class="symbol-list-header bold-text">
        {{ warningSymbolsText }}
        <br v-if="input.length > 0" class="symbol-list-header-line-break" />
      </nav>
    </div>
    <CollapsiblePanel
      :visible="visible"
      :title="toggleLegendsText"
      :theme="theme"
      @toggle="onLegendToggle">
      <Warnings
        :input="input"
        :visible-warnings="visibleWarnings"
        :theme="theme"
        :language="language" />
    </CollapsiblePanel>
    <div ref="warningsContainer" class="desktop-only">
      <Warnings
        :input="input"
        :visible-warnings="visibleWarnings"
        :theme="theme"
        :language="language"
        @warnings-toggled="onWarningsToggled"
        @show-all-warnings="onShowAllWarnings" />
    </div>
    <GrayScaleToggle
      :language="language"
      :gray-scale-selector="grayScaleSelector"
      :theme="theme"
      @theme-changed="onThemeChanged" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, toRef, onMounted, onUnmounted } from 'vue'
import { useI18n } from '@/composables/useI18n'
import type { LegendItem, Language } from '@/types'

import CollapsiblePanel from './CollapsiblePanel.vue'
import GrayScaleToggle from './GrayScaleToggle.vue'
import Warnings from './Warnings.vue'

// Props
const props = withDefaults(
  defineProps<{
    input?: LegendItem[]
    language?: Language
    grayScaleSelector?: boolean
    theme?: string
    visibleWarnings?: string[]
  }>(),
  {
    input: () => [],
    language: (import.meta.env.VITE_LANGUAGE as Language) || 'fi',
    grayScaleSelector: false,
    theme: 'light-theme',
    visibleWarnings: () => [],
  }
)

// Emits
const emit = defineEmits<{
  warningsToggled: [warnings: string[]]
  themeChanged: [theme: string]
}>()

// Composables
const { t } = useI18n(toRef(props, 'language'))

// Template refs
const warningsContainer = ref<HTMLDivElement | null>(null)

// Reactive state
const visible = ref(false)
const windowWidth = ref(window.innerWidth)

// Window resize handling
function updateWidth(): void {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', updateWidth)
})

onUnmounted(() => {
  window.removeEventListener('resize', updateWidth)
})

// Computed
const warnings = computed((): LegendItem[] => {
  return props.input
})

const warningSymbolsText = computed((): string => {
  return t('legends')
})

const toggleLegendsText = computed((): string => {
  return visible.value ? t('hideLegends') : t('showLegends')
})

// Watchers
watch(windowWidth, () => {
  if (warningsContainer.value?.clientHeight === 0) {
    onShowAllWarnings()
  }
})

// Methods
function onLegendToggle(): void {
  visible.value = !visible.value
}

function onWarningsToggled(newVisibleWarnings: string[]): void {
  emit('warningsToggled', newVisibleWarnings)
}

function onShowAllWarnings(): void {
  emit(
    'warningsToggled',
    warnings.value.reduce<string[]>(
      (types, warning) => types.concat([warning.type]),
      []
    )
  )
}

function onThemeChanged(newTheme: string): void {
  if (props.theme !== newTheme) {
    emit('themeChanged', newTheme)
  }
}
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';

div.symbol-list-header-row {
  padding-left: 0;
  padding-right: 0;
  padding-bottom: 0;
  margin-left: 0;
  margin-right: 0;
  span {
    white-space: nowrap;
  }
}

nav.symbol-list-header {
  padding-left: 0;
  text-align: left;
}

@media (max-width: 767px) {
  nav.symbol-list-header {
    margin-top: 15px;
    margin-bottom: 5px;
  }
}
</style>

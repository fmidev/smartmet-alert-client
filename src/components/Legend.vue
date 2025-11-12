<template>
  <div
    class="sticky-top"
    :class="theme"
  >
    <GrayScaleToggle
      class="narrow-screen"
      :language="language"
      :gray-scale-selector="grayScaleSelector"
      :theme="theme"
      @theme-changed="onThemeChanged"
    />
    <div class="row symbol-list-header-row">
      <nav class="symbol-list-header bold-text">
        {{ warningSymbolsText }}
        <br
          v-if="input.length > 0"
          class="symbol-list-header-line-break"
        />
      </nav>
    </div>
    <CollapsiblePanel
      :visible="visible"
      :title="toggleLegendsText"
      :theme="theme"
      @toggle="onLegendToggle"
    >
      <Warnings
        :input="input"
        :visible-warnings="visibleWarnings"
        :theme="theme"
        :language="language"
      />
    </CollapsiblePanel>
    <div
      ref="warningsContainer"
      class="desktop-only"
    >
      <Warnings
        :input="input"
        :visible-warnings="visibleWarnings"
        :theme="theme"
        :language="language"
        @warnings-toggled="onWarningsToggled"
        @show-all-warnings="onShowAllWarnings"
      />
    </div>
    <GrayScaleToggle
      :language="language"
      :gray-scale-selector="grayScaleSelector"
      :theme="theme"
      @theme-changed="onThemeChanged"
    />
  </div>
</template>

<script>
import { onMounted, onUnmounted, ref } from 'vue'

import i18n from '../mixins/i18n'
import CollapsiblePanel from './CollapsiblePanel.vue'
import GrayScaleToggle from './GrayScaleToggle.vue'
import Warnings from './Warnings.vue'

export default {
  name: 'Legend',
  components: {
    CollapsiblePanel,
    GrayScaleToggle,
    Warnings,
  },
  mixins: [i18n],
  props: {
    input: {
      type: Array,
      default: () => [],
    },
    language: {
      type: String,
      default: import.meta.env.VITE_LANGUAGE || 'fi',
    },
    grayScaleSelector: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String,
      default: 'light-theme',
    },
    visibleWarnings: {
      type: Array,
      default: () => [],
    },
  },
  setup() {
    const windowWidth = ref(window.innerWidth)
    const updateWidth = () => {
      windowWidth.value = window.innerWidth
    }
    onMounted(() => {
      window.addEventListener('resize', updateWidth)
    })
    onUnmounted(() => {
      window.removeEventListener('resize', updateWidth)
    })
    return { windowWidth }
  },
  data() {
    return {
      visible: false,
    }
  },
  computed: {
    warnings() {
      return this.input
    },
    warningSymbolsText() {
      return this.t('legends')
    },
    toggleLegendsText() {
      return this.visible ? this.t('hideLegends') : this.t('showLegends')
    },
  },
  watch: {
    windowWidth() {
      if (this.$refs.warningsContainer.clientHeight === 0) {
        this.onShowAllWarnings()
      }
    },
  },
  methods: {
    onLegendToggle() {
      this.visible = !this.visible
    },
    onWarningsToggled(newVisibleWarnings) {
      this.$emit('warningsToggled', newVisibleWarnings)
    },
    onShowAllWarnings() {
      this.$emit(
        'warningsToggled',
        this.warnings.reduce(
          (types, warning) => types.concat([warning.type]),
          []
        )
      )
    },
    onThemeChanged(newTheme) {
      if (this.theme !== newTheme) {
        this.$emit('themeChanged', newTheme)
      }
    },
  },
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

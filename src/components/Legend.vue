<template>
  <div class="sticky-top" :class="theme">
    <GrayScaleToggle
      class="narrow-screen"
      :language="language"
      :gray-scale-selector="grayScaleSelector"
      :theme="theme"
      @themeChanged="onThemeChanged" />
    <div class="row symbol-list-header-row">
      <nav class="symbol-list-header bold-text">
        {{ warningSymbolsText }}
        <br v-if="input.length > 0" class="symbol-list-header-line-break" />
      </nav>
    </div>
    <b-card no-body class="mb-1 d-md-none legends-panel">
      <b-card-header header-tag="header" class="legends-heading p-1">
        <div class="legends-header">
          <span class="legends-text">
            {{ toggleLegendsText }}
          </span>
        </div>
        <b-button
          block
          :class="['legends-toggle', visible ? '' : 'collapsed']"
          :aria-label="toggleLegendsText"
          @click="onLegendToggle" />
      </b-card-header>
      <b-collapse
        id="legends-collapse"
        v-model="visible"
        class="legends-collapse-item focus-ring"
        tabindex="0">
        <b-card-body body-class="p-0">
          <div class="legends-container">
            <Warnings
              :input="input"
              :visible-warnings="visibleWarnings"
              :theme="theme"
              :language="language" />
          </div>
        </b-card-body>
      </b-collapse>
    </b-card>
    <div ref="warningsContainer" class="d-md-block d-none">
      <Warnings
        :input="input"
        :visible-warnings="visibleWarnings"
        :theme="theme"
        :language="language"
        @warningsToggled="onWarningsToggled"
        @showAllWarnings="onShowAllWarnings" />
    </div>
    <GrayScaleToggle
      :language="language"
      :gray-scale-selector="grayScaleSelector"
      :theme="theme"
      @themeChanged="onThemeChanged" />
  </div>
</template>

<script>
import { onMounted, onUnmounted, ref } from 'vue'

import i18n from '../mixins/i18n'
import Warnings from './Warnings.vue'

export default {
  name: 'Legend',
  components: {
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

.legends-panel {
  margin-left: 0;
  margin-right: 0;
  border-radius: 0;
}

.light-theme .legends-panel {
  border: 0.5px solid $light-legend-background-color;
}

.dark-theme .legends-panel {
  border: 0.5px solid $dark-legend-background-color;
}

.light-gray-theme .legends-panel {
  border: 0.5px solid $light-gray-legend-background-color;
}

.dark-gray-theme .legends-panel {
  border: 0.5px solid $dark-gray-legend-background-color;
}

.legends-heading {
  height: $current-warning-height;
  padding: 0 0 0 15px !important;
  line-height: $current-warning-height;
  border: none;
  border-bottom: 0.5px solid rgba(0, 0, 0, 0.125);
  border-radius: 0 !important;
}

.light-theme .legends-heading {
  background-color: $light-legend-heading-background-color;
}

.dark-theme .legends-heading {
  background-color: $dark-legend-heading-background-color;
}

.light-gray-theme .legends-heading {
  background-color: $light-gray-legend-heading-background-color;
}

.dark-gray-theme .legends-heading {
  background-color: $dark-gray-legend-heading-background-color;
}

.legends-header {
  position: absolute;
  left: 0;
  right: 38px;
  border-radius: 0;
  display: flex;
  align-items: center;
  justify-content: start;
  height: $current-warning-height;
}

.light-theme .legends-header {
  background: $light-legend-heading-background-color;
}

.dark-theme .legends-header {
  background: $dark-legend-heading-background-color;
}

.light-gray-theme .legends-header {
  background: $light-gray-legend-heading-background-color;
}

.dark-gray-theme .legends-header {
  background: $dark-gray-legend-heading-background-color;
}

.legends-text {
  display: block;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 15px;
}

.light-theme .legends-text {
  background-color: $light-legend-heading-background-color;
}

.dark-theme .legends-text {
  background-color: $dark-legend-heading-background-color;
}

.light-gray-theme .legends-text {
  background-color: $light-gray-legend-heading-background-color;
}

.dark-gray-theme .legends-text {
  background-color: $dark-gray-legend-heading-background-color;
}

button.legends-toggle {
  position: relative;
  height: $current-warning-height;
  width: $current-warning-height;
  min-width: $current-warning-height;
  background-image: url($ui-image-path + 'arrow-up.svg');
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 0 !important;
  border-style: none;
  float: right;
  padding: $image-padding;
  margin-left: 5px;

  &.collapsed {
    background-image: url($ui-image-path + 'arrow-down.svg');
    border-radius: 0 3px 3px 0;
  }
}

.light-theme .legends-toggle {
  background-color: $light-legend-toggle-background-color;

  &:hover {
    background-color: $light-legend-toggle-background-color;
  }

  &:active {
    background-color: $light-legend-toggle-background-color;
  }

  &:not(:disabled):not(.disabled):active {
    background-color: $light-current-warning-toggle-active-color;
  }
}

.dark-theme .legends-toggle {
  background-color: $dark-legend-toggle-background-color;

  &:hover {
    background-color: $dark-legend-toggle-background-color;
  }

  &:active {
    background-color: $dark-legend-toggle-background-color;
  }

  &:not(:disabled):not(.disabled):active {
    background-color: $dark-current-warning-toggle-active-color;
  }
}

.light-gray-theme .legends-toggle {
  background-color: $light-gray-legend-toggle-background-color;

  &:hover {
    background-color: $light-gray-legend-toggle-background-color;
  }

  &:active {
    background-color: $light-gray-legend-toggle-background-color;
  }

  &:not(:disabled):not(.disabled):active {
    background-color: $light-gray-current-warning-toggle-active-color;
  }
}

.dark-gray-theme .legends-toggle {
  background-color: $dark-gray-legend-toggle-background-color;

  &:hover {
    background-color: $dark-gray-legend-toggle-background-color;
  }

  &:active {
    background-color: $dark-gray-legend-toggle-background-color;
  }

  &:not(:disabled):not(.disabled):active {
    background-color: $dark-gray-current-warning-toggle-active-color;
  }
}

.legends-container {
  padding: 15px;
  border-radius: 0;
}

.light-theme .legends-container {
  background-color: $light-legend-container-background-color;
  border-top: 0.5px solid $light-legend-background-color;
}

.dark-theme .legends-container {
  background-color: $dark-legend-container-background-color;
  border-top: 0.5px solid $dark-legend-background-color;
}

.light-gray-theme .legends-container {
  background-color: $light-gray-legend-container-background-color;
  border-top: 0.5px solid $light-gray-legend-background-color;
}

.dark-gray-theme .legends-container {
  background-color: $dark-gray-legend-container-background-color;
  border-top: 0.5px solid $dark-gray-legend-background-color;
}

div#legends-collapse div.card-body {
  padding: 0;
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

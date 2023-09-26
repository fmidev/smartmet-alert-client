<template>
  <div class="sticky-top" :class="theme">
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
        <b-button v-b-toggle.legends-collapse block class="legends-toggle" />
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
    <div class="d-md-block d-none">
      <Warnings
        :input="input"
        :visible-warnings="visibleWarnings"
        :theme="theme"
        :language="language"
        @warningsToggled="onWarningsToggled"
        @showAllWarnings="onShowAllWarnings" />
    </div>
    <div v-if="grayScaleSelector" id="gray-scale-select-row">
      <div id="gray-scale-select-text">{{ grayScaleText }}</div>
      <div id="gray-scale-select-container">
        <div
          id="gray-scale-select"
          :class="[grayScale ? 'gray-scale-selected' : 'gray-scale-unselected']"
          tabindex="0"
          @touchmove="preventEvents"
          @touchend="preventEvents"
          @touchstart="toggleGrayScale"
          @mousedown="toggleGrayScale"
          @keydown.enter="toggleGrayScale"
          @keydown.space="toggleGrayScale" />
      </div>
    </div>
  </div>
</template>

<script>
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
      default: import.meta.env.VUE_APP_I18N_LOCALE || 'en',
    },
    grayScaleSelector: {
      type: Boolean,
      default: false,
    },
    theme: {
      type: String,
      default: 'light',
    },
    visibleWarnings: {
      type: Array,
      default: () => [],
    },
  },
  data() {
    return {
      visible: false,
    }
  },
  computed: {
    grayScale() {
      if (this.theme == null || this.theme.length === 0) {
        return false
      }
      const themeParts = this.theme.split('-')
      return themeParts.length > 1 && themeParts[1] === 'gray'
    },
    warnings() {
      return this.input
    },
    warningSymbolsText() {
      return this.t('legends')
    },
    toggleLegendsText() {
      return this.visible ? this.t('hideLegends') : this.t('showLegends')
    },
    grayScaleText() {
      return this.t('grayScale')
    },
  },
  methods: {
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
    toggleGrayScale(event) {
      event.preventDefault()
      if (this.theme == null || this.theme.length === 0) {
        return
      }
      const baseTheme = this.theme.split('-')[0]
      this.$emit(
        'themeChanged',
        this.grayScale ? baseTheme : `${baseTheme}-gray`
      )
    },
    preventEvents(event) {
      event.preventDefault()
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
  span {
    white-space: nowrap;
  }
}

.legends-panel {
  border-radius: 0;
  margin-left: 0;
  margin-right: 0;
}

.light-theme .legends-panel {
  border: 2px solid $light-legend-background-color;
}

.dark-theme .legends-panel {
  border: 2px solid $dark-legend-background-color;
}

.dark-theme .legends-panel {
  border: 2px solid $gray-legend-background-color;
}

.legends-heading {
  height: $current-warning-height;
  padding: 0 0 0 15px !important;
  line-height: $current-warning-height;
  border: none;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.light-theme .legends-heading {
  background-color: $light-legend-heading-background-color;
}

.dark-theme .legends-heading {
  background-color: $dark-legend-heading-background-color;
}

.dark-theme .legends-heading {
  background-color: $gray-legend-heading-background-color;
}

.legends-header {
  position: absolute;
  left: 0;
  right: 38px;
}

.light-theme .legends-header {
  background: $light-legend-heading-background-color;
}

.dark-theme .legends-header {
  background: $dark-legend-heading-background-color;
}

.dark-theme .legends-header {
  background: $gray-legend-heading-background-color;
}

.legends-text {
  line-height: $current-warning-height;
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

.dark-theme .legends-text {
  background-color: $gray-legend-heading-background-color;
}

.legends-toggle {
  position: relative;
  height: $current-warning-height;
  width: $current-warning-height;
  min-width: $current-warning-height;
  background-image: url($ui-image-path + 'arrow-up.svg');
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 0;
  border-style: none;
  float: right;
  padding: $image-padding;
  margin-left: 5px;

  &.collapsed {
    background-image: url($ui-image-path + 'arrow-down.svg');
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

.dark-theme .legends-toggle {
  background-color: $gray-legend-toggle-background-color;

  &:hover {
    background-color: $gray-legend-toggle-background-color;
  }

  &:active {
    background-color: $gray-legend-toggle-background-color;
  }

  &:not(:disabled):not(.disabled):active {
    background-color: $gray-current-warning-toggle-active-color;
  }
}

.legends-container {
  padding: 15px;
}

.light-theme .legends-container {
  background-color: $light-legend-container-background-color;
  border-top: 2px solid $light-legend-background-color;
}

.dark-theme .legends-container {
  background-color: $dark-legend-container-background-color;
  border-top: 2px solid $dark-legend-background-color;
}

.dark-theme .legends-container {
  background-color: $gray-legend-container-background-color;
  border-top: 2px solid $gray-legend-background-color;
}

div#legends-collapse div.card-body {
  padding: 0;
}

nav.symbol-list-header {
  padding-left: 0;
}

div#gray-scale-select-row {
  width: 100%;
  display: table;
  padding-left: 59px;
}

div#gray-scale-select-text {
  display: table-cell;
  max-width: 141px;
  padding-right: 5px;
  vertical-align: middle;
  line-height: normal;
}

div#gray-scale-select-container {
  display: table-cell;
  width: 30px;
  height: $symbol-list-line-height;
  vertical-align: middle;
}

div#gray-scale-select {
  width: 100%;
  height: $symbol-list-select-height;
  margin: 0;
  background-repeat: no-repeat;
  background-position: center;
  cursor: pointer;
}

.light-theme .gray-scale-selected {
  background-image: url($ui-image-path + 'toggle-selected-blue' + $image-extension);
}

.dark-theme .gray-scale-selected {
  background-image: url($ui-image-path + 'toggle-selected-light' + $image-extension);
}

.light-gray-theme .gray-scale-selected {
  background-image: url($ui-image-path + 'toggle-selected-blue' + $image-extension);
}

.light-theme .gray-scale-unselected {
  background-image: url($ui-image-path + 'toggle-unselected-light' + $image-extension);
}

.dark-theme .gray-scale-unselected {
  background-image: url($ui-image-path + 'toggle-unselected-dark' + $image-extension);
}

.light-gray-theme .gray-scale-unselected {
  background-image: url($ui-image-path + 'toggle-unselected-light' + $image-extension);
}

@media (max-width: 767px) {
  div#gray-scale-select-text {
    text-align: right;
    padding-right: 10px;
  }
  nav.symbol-list-header {
    margin-top: 15px;
    margin-bottom: 5px;
  }
}
</style>

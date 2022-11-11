<template>
  <div class="sticky-top" :class="currentTheme">
    <div class="row symbol-list-header-row">
      <nav class="symbol-list-header bold-text">
        {{ warningSymbolsText }}
        <br v-if="input.length > 0" class="symbol-list-header-line-break" />
      </nav>
    </div>
    <b-card no-body class="mb-1 d-md-none legends-panel">
      <b-card-header
        header-tag="header"
        class="p-1"
        header-class="legends-heading">
        <div class="legends-header">
          <span class="legends-text">
            {{ toggleLegendsText }}
          </span>
        </div>
        <b-button
          v-b-toggle.legends-collapse
          block
          variant="info"
          class="legends-toggle" />
      </b-card-header>
      <b-collapse
        id="legends-collapse"
        v-model="visible"
        class="legends-collapse-item"
        tabindex="0">
        <b-card-body body-class="p-0">
          <div class="legends-container">
            <Warnings :input="input" />
          </div>
        </b-card-body>
      </b-collapse>
    </b-card>
    <div class="d-md-block d-none">
      <Warnings :input="input" />
    </div>
  </div>
</template>

<script>
import Vue from 'vue'

import i18n from '../i18n'
import Warnings from './Warnings.vue'

export default {
  name: 'Legend',
  components: {
    Warnings,
  },
  props: ['input'],
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
      return i18n.t('legends')
    },
    toggleLegendsText() {
      return this.visible ? i18n.t('hideLegends') : i18n.t('showLegends')
    },
    currentTheme() {
      return this.$store.getters.theme
    },
  },
  watch: {
    input() {
      this.showAll()
    },
    visibleWarnings(newVisibleWarnings) {
      this.warnings.forEach((warning) => {
        const isVisible = newVisibleWarnings.includes(warning.type)
        if (isVisible !== warning.visible) {
          Vue.set(warning, 'visible', isVisible)
        }
      })
    },
  },
  methods: {
    showAll() {
      this.$store.dispatch(
        'setVisibleWarnings',
        this.warnings.reduce(
          (types, warning) => types.concat([warning.type]),
          []
        )
      )
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

.light .legends-panel {
  border: 2px solid $light-legend-background-color;
}

.dark .legends-panel {
  border: 2px solid $dark-legend-background-color;
}

.legends-heading {
  height: $current-warning-height;
  padding: 0 0 0 15px !important;
  line-height: $current-warning-height;
  border: none;
}

.light .legends-heading {
  background-color: $light-legend-heading-background-color;
}

.dark .legends-heading {
  background-color: $dark-legend-heading-background-color;
}

.legends-header {
  position: absolute;
  left: 0;
  right: 38px;
}

.light .legends-header {
  background: $light-legend-heading-background-color;
}

.dark .legends-header {
  background: $dark-legend-heading-background-color;
}

.legends-text {
  line-height: $current-warning-height;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 15px;
  &:focus:not([data-focus-visible-added]) {
    outline: none !important;
    overflow: visible;
    position: absolute;
    z-index: 1;
    padding-right: 3px;
  }
}

.light .legends-text {
  background-color: $light-legend-heading-background-color;
}

.dark .legends-text {
  background-color: $dark-legend-heading-background-color;
}

.legends-toggle.btn-info {
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

  &:focus {
    position: relative;
    z-index: 1;
    box-shadow: none !important;
    &:not([data-focus-visible-added]) {
      outline: none !important;
    }
  }

  &.collapsed {
    background-image: url($ui-image-path + 'arrow-down.svg');
  }
}

.light .legends-toggle.btn-info {
  background-color: $light-legend-toggle-background-color;

  &:hover {
    background-color: $light-legend-toggle-background-color;
  }

  &:focus {
    background-color: $light-legend-toggle-background-color;
  }

  &:active {
    background-color: $light-legend-toggle-background-color;
  }

  &:not(:disabled):not(.disabled):active {
    background-color: $light-current-warning-toggle-active-color;
  }
}

.dark .legends-toggle.btn-info {
  background-color: $dark-legend-toggle-background-color;

  &:hover {
    background-color: $dark-legend-toggle-background-color;
  }

  &:focus {
    background-color: $dark-legend-toggle-background-color;
  }

  &:active {
    background-color: $dark-legend-toggle-background-color;
  }

  &:not(:disabled):not(.disabled):active {
    background-color: $dark-current-warning-toggle-active-color;
  }
}

div.legends-collapse-item:focus:not([data-focus-visible-added]) {
  outline: none !important;
}

.legends-container {
  padding: 15px;
}

.light .legends-container {
  background-color: $light-legend-container-background-color;
  border-top: 2px solid $light-legend-background-color;
}

.dark .legends-container {
  background-color: $dark-legend-container-background-color;
  border-top: 2px solid $dark-legend-background-color;
}

@media (max-width: 767px) {
  nav.symbol-list-header {
    margin-top: 15px;
  }
}
</style>

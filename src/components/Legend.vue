<template>
  <div class="sticky-top">
    <div class="row symbol-list-header-row">
      <nav class="bold-text">{{ warningSymbolsText }} <br v-if="input.length > 0" class="symbol-list-header-line-break"> </nav>
    </div>
    <b-card no-body class="mb-1 d-md-none legends-panel">
        <b-card-header header-tag="header" class="p-1" header-class="legends-heading">
            <div class="legends-header">
              <span class="legends-text">
                {{ toggleLegendsText }}
              </span>
            </div>
            <b-button block v-b-toggle.legends-collapse variant="info" class="legends-toggle" />
        </b-card-header>
        <b-collapse
                id="legends-collapse"
                class="legends-collapse-item"
                tabindex="0"
                v-model="visible"
        >
            <b-card-body body-class="p-0">
                <div class="legends-container">
                  <Warnings :input="input"/>
                </div>
            </b-card-body>
        </b-collapse>
    </b-card>
    <div class="d-md-block d-none">
      <Warnings :input="input"/>
    </div>
  </div>
</template>

<script>
import Vue from 'vue';
import Warnings from './Warnings.vue';
import i18n from '../i18n';

export default {
  name: 'Legend',
  components: {
    Warnings,
  },
  props: ['input'],
  watch: {
    input() {
      this.showAll();
    },
    visibleWarnings(newVisibleWarnings) {
      this.warnings.forEach((warning) => {
        const isVisible = newVisibleWarnings.includes(warning.type);
        if (isVisible !== warning.visible) {
          Vue.set(warning, 'visible', isVisible);
        }
      });
    },
  },
  data() {
    return {
      visible: false,
    };
  },
  computed: {
    warnings() {
      return this.input;
    },
    warningSymbolsText() {
      return i18n.t('legends');
    },
    toggleLegendsText() {
      return this.visible ? i18n.t('hideLegends') : i18n.t('showLegends');
    },
  },
  methods: {
    showAll() {
      this.$store.dispatch('setVisibleWarnings', this.warnings.reduce((types, warning) => types.concat([warning.type]), []));
    },
  },
};
</script>

<style scoped lang="scss">
@import "../scss/constants.scss";

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
    border: 2px solid $background-grey;
    margin-left: 0;
    margin-right: 0;
}

.legends-heading {
    background-color: $white;
    height: $current-warning-height;
    padding: 0 0 0 15px !important;
    line-height: $current-warning-height;
    border: none;
}

.legends-header {
  position: absolute;
  left: 0;
  right: 38px;
}

.legends-text {
    line-height: $current-warning-height;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    background-color: $white;
    margin-left: 15px;
    &:focus:not([data-focus-visible-added]) {
        outline: none !important;
        overflow: visible;
        position: absolute;
        z-index: 1;
        padding-right: 3px;
    }
}

.legends-toggle {
    height: $current-warning-height;
    width: $current-warning-height;
    min-width: $current-warning-height;
    background-image: url($ui-image-path + 'arrow-up.svg');
    background-color: $gray;
    background-repeat: no-repeat;
    background-position: center;
    border-radius: 0;
    border-style: none;
    float: right;
    padding: $image-padding;
    margin-left: 5px;

    &:hover {
        background-color: $gray;
    }

    &:focus {
        background-color: $gray;
        position: relative;
        z-index: 1;
        box-shadow: none !important;
        &:not([data-focus-visible-added]) {
            outline: none !important;
        }
    }

    &:active {
        background-color: $gray;
    }

    &.collapsed {
        background-image: url($ui-image-path + 'arrow-down.svg');
    }
}

div.legends-collapse-item:focus:not([data-focus-visible-added]) {
    outline: none !important;
}

.legends-container {
    background-color: $white;
    border-top: 2px solid $background-grey;
    padding: 15px;
}

</style>

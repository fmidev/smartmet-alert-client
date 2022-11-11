<template>
  <b-card no-body class="mb-1 current-warning-panel" :class="currentTheme">
    <b-card-header
      header-tag="header"
      class="p-1"
      header-class="current-warning-heading">
      <div class="region-header">
        <div>
          <RegionWarning
            v-for="warning in warningsSummary"
            :key="warning.key"
            :input="warning"></RegionWarning>
        </div>
        <span class="region-item-text">
          {{ regionName }}
        </span>
      </div>
      <b-button
        v-b-toggle="identifier"
        block
        variant="info"
        class="current-warning-toggle"
        :aria-label="ariaButton" />
    </b-card-header>
    <b-collapse
      :id="identifier"
      v-model="visible"
      class="accordion-item-region"
      :accordion="`accordion-${type}`"
      tabindex="0"
      :aria-label="ariaInfo">
      <b-card-body body-class="p-0">
        <div class="current-description">
          <div class="current-description-table">
            <DescriptionWarning
              v-for="warning in warnings"
              :key="warning.identification"
              :input="warning" />
          </div>
        </div>
      </b-card-body>
    </b-collapse>
  </b-card>
</template>

<script>
import 'focus-visible'

import i18n from '../i18n'
import config from '../mixins/config'
import DescriptionWarning from './DescriptionWarning.vue'
import RegionWarning from './RegionWarning.vue'

export default {
  name: 'Region',
  components: { RegionWarning, DescriptionWarning },
  mixins: [config],
  props: {
    type: {
      type: String,
    },
    code: {
      type: String,
    },
    name: {
      type: String,
    },
    input: {
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
    identifier() {
      return `accordion-item-${this.code}`
    },
    regionName() {
      return i18n.t(this.name)
    },
    warningsSummary() {
      return this.input.reduce((warnings, warningInfo) => {
        if (
          warningInfo != null &&
          warningInfo.identifiers != null &&
          warningInfo.identifiers.length > 0 &&
          warningInfo.coverage >= this.coverageCriterion
        ) {
          const warning =
            this.$store.getters.warnings[warningInfo.identifiers[0]]
          if (warning != null) {
            warnings.push(warning)
          }
        }
        return warnings
      }, [])
    },
    warnings() {
      return this.input.reduce(
        (allWarnings, warningInfo) =>
          allWarnings.concat(
            warningInfo.identifiers.reduce((warnings, identifier) => {
              const warning = this.$store.getters.warnings[identifier]
              if (
                warning != null &&
                this.warningsSummary.some(
                  (summaryWarning) => summaryWarning.type === warning.type
                )
              ) {
                warnings.push(warning)
              }
              return warnings
            }, [])
          ),
        []
      )
    },
    ariaButton() {
      return `${
        this.visible
          ? i18n.t('infoButtonAriaLabelCloseRegion')
          : i18n.t('infoButtonAriaLabelShowRegion')
      } ${this.regionName} ${i18n.t('infoButtonAriaLabelValidWarnings')}`
    },
    ariaInfo() {
      return this.warnings.map(
        (warning, index) =>
          `${index > 0 ? ' ' : ''}${i18n.t(warning.type)}: ${i18n.t(
            `warningLevel${warning.severity}`
          )}.`
      )
    },
    currentTheme() {
      return this.$store.getters.theme
    },
  },
}
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';

.current-warning-panel {
  border-radius: 0;
  border: none;
  margin-left: 0;
  margin-right: 0;
  background-color: transparent;
}

.current-warning-heading {
  height: $current-warning-height;
  padding: 0 0 0 15px !important;
  line-height: $current-warning-height;
  border: none;
}

.light .current-warning-heading {
  background-color: $light-current-warning-heading-color;
}

.dark .current-warning-heading {
  background-color: $dark-current-warning-heading-color;
}

button.btn-info {
  border: none;
}

.region-header {
  position: absolute;
  left: 0;
  right: 38px;
}

.region-item-text {
  display: block;
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

.light .region-item-text {
  background-color: $light-current-warning-heading-color;
}

.dark .region-item-text {
  background-color: $dark-current-warning-heading-color;
}

.current-warning-toggle.btn-info {
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

.light .current-warning-toggle.btn-info {
  background-color: $light-current-warning-toggle-color;

  &:hover {
    background-color: $light-current-warning-toggle-color;
  }

  &:focus {
    background-color: $light-current-warning-toggle-color;
  }

  &:not(:disabled):not(.disabled):active {
    background-color: $light-current-warning-toggle-active-color;
  }
}

.dark .current-warning-toggle.btn-info {
  background-color: $dark-current-warning-toggle-color;

  &:hover {
    background-color: $dark-current-warning-toggle-color;
  }

  &:focus {
    background-color: $dark-current-warning-toggle-color;
  }

  &:not(:disabled):not(.disabled):active {
    background-color: $dark-current-warning-toggle-active-color;
  }
}

.current-description {
  padding: 15px;
}

.light .current-description {
  border-top: 1px solid $light-description-border-color;
  background-color: $light-description-background-color;
}

.dark .current-description {
  border-top: 1px solid $dark-description-border-color;
  background-color: $dark-description-background-color;
}

div.current-description-table {
  display: table;
  border-spacing: 10px;
  width: 100%;
}

div.accordion-item-region:focus:not([data-focus-visible-added]) {
  outline: none !important;
}
</style>

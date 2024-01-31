<template>
  <b-card no-body class="mb-1 current-warning-panel" :class="theme">
    <b-card-header header-tag="header" class="p-1">
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
        block
        :class="['current-warning-toggle', visible ? '' : 'collapsed']"
        :aria-label="ariaButton"
        @click="onRegionToggle" />
    </b-card-header>
    <b-collapse
      :id="identifier"
      v-model="visible"
      class="accordion-item-region focus-ring"
      :accordion="`accordion-${type}`"
      tabindex="0"
      :aria-label="ariaInfo">
      <b-card-body body-class="p-0">
        <div class="current-description">
          <div class="current-description-table">
            <DescriptionWarning
              v-for="warning in reducedWarnings"
              :key="warning.identification"
              :input="warning"
              :theme="theme"
              :language="language" />
          </div>
        </div>
      </b-card-body>
    </b-collapse>
  </b-card>
</template>

<script>
import config from '../mixins/config'
import i18n from '../mixins/i18n'
import DescriptionWarning from './DescriptionWarning.vue'
import RegionWarning from './RegionWarning.vue'

export default {
  name: 'Region',
  components: { RegionWarning, DescriptionWarning },
  mixins: [i18n, config],
  props: {
    type: {
      type: String,
    },
    shown: {
      type: Boolean,
      default: false,
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
    warnings: {
      type: Object,
      default: null,
    },
    theme: {
      type: String,
      default: 'light-theme',
    },
    language: {
      type: String,
    },
  },
  data() {
    return {
      visible: this.shown,
    }
  },
  computed: {
    identifier() {
      return `accordion-item-${this.code}`
    },
    regionName() {
      return this.t(this.name)
    },
    warningsSummary() {
      return this.input.reduce((summaryWarnings, warningInfo) => {
        if (
          warningInfo != null &&
          warningInfo.identifiers != null &&
          warningInfo.identifiers.length > 0 &&
          warningInfo.coverage >= this.coverageCriterion
        ) {
          const warning = this.warnings[warningInfo.identifiers[0]]
          if (warning != null) {
            summaryWarnings.push(warning)
          }
        }
        return summaryWarnings
      }, [])
    },
    reducedWarnings() {
      return this.input.reduce(
        (allWarnings, warningInfo) =>
          allWarnings.concat(
            warningInfo.identifiers.reduce((identifiers, identifier) => {
              const warning = this.warnings[identifier]
              if (
                warning != null &&
                this.warningsSummary.some(
                  (summaryWarning) => summaryWarning.type === warning.type
                )
              ) {
                identifiers.push(warning)
              }
              return identifiers
            }, [])
          ),
        []
      )
    },
    ariaButton() {
      return `${
        this.visible
          ? this.t('infoButtonAriaLabelCloseRegion')
          : this.t('infoButtonAriaLabelShowRegion')
      } ${this.regionName} ${this.t('infoButtonAriaLabelValidWarnings')}`
    },
    ariaInfo() {
      return this.reducedWarnings.map(
        (warning, index) =>
          `${index > 0 ? ' ' : ''}${this.t(warning.type)}: ${this.t(
            `warningLevel${warning.severity}`
          )}.`
      )
    },
  },
  watch: {
    shown(isShown) {
      this.visible = isShown
    },
  },
  methods: {
    onRegionToggle() {
      this.$emit('regionToggled', {
        code: this.code,
        shown: !this.visible,
      })
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

  .card-header {
    height: $current-warning-height;
    padding: 0 0 0 15px !important;
    line-height: $current-warning-height;
    border: none;
  }
}

.light-theme .current-warning-heading {
  background-color: $light-current-warning-heading-color;
}

.dark-theme .current-warning-heading {
  background-color: $dark-current-warning-heading-color;
}

.light-gray-theme .current-warning-heading {
  background-color: $light-gray-current-warning-heading-color;
}

.dark-gray-theme .current-warning-heading {
  background-color: $dark-gray-current-warning-heading-color;
}

button {
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
}

.light-theme .region-header {
  background-color: $light-current-warning-heading-color;
}

.dark-theme .region-header {
  background-color: $dark-current-warning-heading-color;
}

.light-gray-theme .region-header {
  background-color: $light-gray-current-warning-heading-color;
}

.dark-gray-theme .region-header {
  background-color: $dark-gray-current-warning-heading-color;
}

.current-warning-toggle {
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

.light-theme .current-warning-toggle {
  background-color: $light-current-warning-toggle-color;

  &:hover {
    background-color: $light-current-warning-toggle-color;
  }

  &:not(:disabled):not(.disabled):active {
    background-color: $light-current-warning-toggle-active-color;
  }
}

.dark-theme .current-warning-toggle {
  background-color: $dark-current-warning-toggle-color;

  &:hover {
    background-color: $dark-current-warning-toggle-color;
  }

  &:not(:disabled):not(.disabled):active {
    background-color: $dark-current-warning-toggle-active-color;
  }
}

.light-gray-theme .current-warning-toggle {
  background-color: $light-gray-current-warning-toggle-color;

  &:hover {
    background-color: $light-gray-current-warning-toggle-color;
  }

  &:not(:disabled):not(.disabled):active {
    background-color: $light-gray-current-warning-toggle-active-color;
  }
}

.dark-gray-theme .current-warning-toggle {
  background-color: $dark-gray-current-warning-toggle-color;

  &:hover {
    background-color: $dark-gray-current-warning-toggle-color;
  }

  &:not(:disabled):not(.disabled):active {
    background-color: $dark-gray-current-warning-toggle-active-color;
  }
}

.current-description {
  padding: 15px;
}

.light-theme .current-description {
  border-top: 1px solid $light-description-border-color;
  background-color: $light-description-background-color;
}

.dark-theme .current-description {
  border-top: 1px solid $dark-description-border-color;
  background-color: $dark-description-background-color;
}

.light-gray-theme .current-description {
  border-top: 1px solid $light-gray-description-border-color;
  background-color: $light-gray-description-background-color;
}

.dark-gray-theme .current-description {
  border-top: 1px solid $dark-gray-description-border-color;
  background-color: $dark-gray-description-background-color;
}

div.current-description-table {
  display: table;
  border-spacing: 10px;
  width: 100%;
}

div.accordion-item-region {
  div.card-body {
    padding: 0;
  }
}
</style>

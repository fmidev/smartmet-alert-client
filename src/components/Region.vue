<template>
  <h3>
    <button
      type="button"
      :aria-expanded="open"
      :class="['accordion-trigger', 'focus-ring', open ? '' : 'collapsed']"
      :aria-controls="`accordion-section-${code}`"
      :id="`accordion-${code}`"
      :aria-label="ariaButton"
      @click="onRegionToggle">
      <div class="region-header">
        <span class="region-item-text">
          {{ regionName }}
        </span>
        <div>
          <RegionWarning
            v-for="warning in warningsSummary"
            :key="warning.key"
            :input="warning"
            :language="language">
          </RegionWarning>
        </div>
      </div>
      <div
        block
        :class="['current-warning-toggle', open ? '' : 'collapsed']" />
    </button>
  </h3>
  <div
    :id="`accordion-section-${code}`"
    role="region"
    :aria-labelledby="`accordion-${code}`"
    :aria-expanded="open"
    class="accordion-panel"
    :hidden="open ? null : ''"
  >
    <div class="current-description">
      <div class="current-description-table">
        <DescriptionWarning
          v-for="warning in reducedWarnings"
            :key="warning.identification"
            :input="warning"
            :theme="theme"
            :language="language"
        />
      </div>
    </div>
  </div>
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
      open: false,
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
        this.open
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
  methods: {
    onRegionToggle() {
      this.open = !this.open
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
  &:focus:not(:focus-visible) {
    box-shadow: none;
  }
}

.region-header {
  position: absolute;
  left: 0;
  right: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $current-warning-height;
}

.region-item-text {
  display: block;
  text-align: left;
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
  border-top: 0.5px solid $light-description-border-color;
  background-color: $light-description-background-color;
}

.dark-theme .current-description {
  border-top: 0.5px solid $dark-description-border-color;
  background-color: $dark-description-background-color;
}

.light-gray-theme .current-description {
  border-top: 0.5px solid $light-gray-description-border-color;
  background-color: $light-gray-description-background-color;
}

.dark-gray-theme .current-description {
  border-top: 0.5px solid $dark-gray-description-border-color;
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

h3 {
  margin: 0;
  padding: 0;
}

.accordion-trigger {
  background: none;
  color: hsl(0deg 0% 13%);
  display: block;
  font-size: $font-size;
  font-weight: normal;
  margin: 0;
  padding: 0;
  position: relative;
  text-align: left;
  width: 100%;
  outline: none;
}

.accordion > div:first-child .accordion-trigger > .region-header {
  border-radius: 0;
}

.accordion > div:last-child .accordion-trigger.collapsed > .region-header {
  border-radius: 0;
}

.accordion > div:first-child:last-child .accordion-trigger > .region-header {
  border-radius: 0;
}

.accordion > div:first-child:last-child .accordion-trigger.collapsed > .region-header {
  border-radius: 0;
}

.accordion > div:first-child > h3 > button,
.accordion > div:first-child > h3 > button:hover {
  border-radius: 0;
}

.accordion > div:last-child > h3 > button.collapsed,
.accordion > div:last-child > h3 > button.collapsed:hover {
  border-radius: 0;
}

.accordion > div:first-child:last-child > h3 > button,
.accordion > div:first-child:last-child > h3 > button:hover {
  border-radius: 0;
}

.accordion > div:first-child:last-child > h3 > button.collapsed,
.accordion > div:first-child:last-child > h3 > button.collapsed:hover {
  border-radius: 0;
}

.accordion > div:last-child .current-description {
  border-radius: 0;
}

.accordion > div:first-child > div > h3 > button > div.current-warning-toggle {
  border-radius: 0;
}

.accordion > div:last-child > div > h3 > button > div.current-warning-toggle.collapsed {
  border-radius: 0;
}

.accordion > div:first-child:last-child > div > h3 > button > div.current-warning-toggle {
  border-radius: 0;
}

.accordion > div:first-child:last-child > div > h3 > button > div.current-warning-toggle.collapsed {
  border-radius: 0;
}

button {
  border-style: none;
}

.accordion button::-moz-focus-inner {
  border: 0;
}

.accordion-panel {
  margin: 0;
  padding: 0;
}

/* For Edge bug https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/4806035/ */
.accordion-panel[hidden] {
  display: none;
}
</style>

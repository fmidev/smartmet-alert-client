<template>
    <b-card no-body class="mb-1 current-warning-panel">
        <b-card-header header-tag="header" class="p-1" role="tab" header-class="current-warning-heading">
            <div class="region-header">
              <div>
                <RegionWarning v-for="warning in warningsSummary" :key="warning.key" :input="warning"></RegionWarning>
              </div>
              <h3 class="region-item-text" :aria-label="ariaHeader" tabindex="0">
                {{ regionName }}
              </h3>
            </div>
            <b-button block v-b-toggle="identifier" variant="info" class="current-warning-toggle" :aria-label="ariaButton" />
        </b-card-header>
        <b-collapse
                :id=identifier
                class="accordion-item-region"
                :accordion="`accordion-${type}`"
                role="tabpanel"
                tabindex="0"
                :aria-label="ariaInfo"
        >
            <b-card-body body-class="p-0">
                <div class="current-description">
                    <div class="current-description-table">
                        <DescriptionWarning v-for="warning in warnings" :key=warning.identification :input="warning"/>
                    </div>
                </div>
            </b-card-body>
        </b-collapse>
    </b-card>
</template>

<script>
import config from '../mixins/config';
import i18n from '../i18n';
import 'focus-visible';
import RegionWarning from './RegionWarning.vue';
import DescriptionWarning from './DescriptionWarning.vue';

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
  computed: {
    identifier() {
      return `accordion-item-${this.code}`;
    },
    regionName() {
      return i18n.t(this.name);
    },
    warningsSummary() {
      return this.input.reduce((warnings, warningInfo) => {
        if ((warningInfo != null) && (warningInfo.identifiers != null) && (warningInfo.identifiers.length > 0) && (warningInfo.coverage >= this.coverageCriterion)) {
          const warning = this.$store.getters.warnings[warningInfo.identifiers[0]];
          if (warning != null) {
            warnings.push(warning);
          }
        }
        return warnings;
      }, []);
    },
    warnings() {
      return this.input.reduce((allWarnings, warningInfo) => (allWarnings.concat(warningInfo.identifiers.reduce((warnings, identifier) => {
        const warning = this.$store.getters.warnings[identifier];
        if ((warning != null) && (this.warningsSummary.some((summaryWarning) => summaryWarning.type === warning.type))) {
          warnings.push(warning);
        }
        return warnings;
      }, []))), []);
    },
    ariaHeader() {
      return `${this.regionName} ${this.input.reduce((warningLabels, warningInfo) => {
        if ((warningInfo != null) && (warningInfo.type != null)) {
          warningLabels.push(i18n.t(warningInfo.type).toLocaleLowerCase());
        }
        return warningLabels;
      }, []).join(', ')}`;
    },
    ariaButton() {
      return i18n.t('infoButtonAriaLabel');
    },
    ariaInfo() {
      return this.warnings.map((warning, index) => `${(index > 0 ? ' ' : '')}${i18n.t(warning.type)}: ${i18n.t(`warningLevel${warning.severity}`)}.`);
    },
  },
};
</script>

<style scoped lang="scss">
    @import "../scss/constants.scss";

    .current-warning-panel {
        border-radius: 0;
        border: none;
        margin-left: 0;
        margin-right: 0;
    }

    .current-warning-heading {
        background-color: $light-gray;
        height: $current-warning-height;
        padding: 0 0 0 15px !important;
        line-height: $current-warning-height;
        border: none;
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
        line-height: $current-warning-height;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        background-color:rgba(248, 248, 248, 1);
        margin-left: 15px;
        &:focus:not([data-focus-visible-added]) {
            outline: none !important;
            overflow: visible;
            position: absolute;
            z-index: 1;
            padding-right: 3px;
        }
    }

    .current-warning-toggle {
        height: $current-warning-height;
        width: $current-warning-height;
        min-width: $current-warning-height;
        background-image: url($ui-image-path + 'arrow-up.svg');
        background-color: #e8e8e8;
        background-repeat: no-repeat;
        background-position: center;
        border-radius: 0;
        border-style: none;
        float: right;
        padding: $image-padding;
        margin-left: 5px;

        &:hover {
            background-color: #e8e8e8;
        }

        &:focus {
            background-color: #e8e8e8;
            position: relative;
            z-index: 1;
            box-shadow: none !important;
            &:not([data-focus-visible-added]) {
                outline: none !important;
            }
        }

        &:active {
            background-color: #e8e8e8;
        }

        &.collapsed {
            background-image: url($ui-image-path + 'arrow-down.svg');
        }
    }

    .current-description {
        background-color: #f3f3f3;
        border-top: 1px solid #ddd;
        padding: 15px;
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

<template>
    <b-card no-body class="mb-1 current-warning-panel" tabindex="0">
        <b-card-header header-tag="header" class="p-1" role="tab" header-class="current-warning-heading">
            <span class="region-item-text">
                {{ regionName }}
            </span>
            <b-button block v-b-toggle="identifier" variant="info" class="current-warning-toggle" :aria-label=buttonLabel />
            <RegionWarning v-for="warning in warningsSummary" :key="warning.key" :input="warning"></RegionWarning>
        </b-card-header>
        <b-collapse
                :id=identifier
                :accordion="`accordion-${type}`"
                role="tabpanel"
                :label=collapseLabel
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
import i18n from '../i18n';
import 'focus-visible';
import RegionWarning from './RegionWarning.vue';
import DescriptionWarning from './DescriptionWarning.vue';

export default {
  name: 'Region',
  components: { RegionWarning, DescriptionWarning },
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
      return this.input.map((warning) => this.$store.getters.warnings[warning.identifiers[0]]);
    },
    warnings() {
      return this.input.reduce((allWarnings, warning) => (allWarnings.concat(warning.identifiers.map((identifier) => this.$store.getters.warnings[identifier]))), []);
    },
    buttonLabel() {
      return this.warnings.map((warning, index) => `${(index > 0 ? ' ' : '')}${i18n.t(warning.type)}: ${i18n.t(`warningLevel${warning.severity}`)}.`);
    },
    collapseLabel() {
      return this.warnings.map((warning) => `${i18n.t(warning.type)}. ${this.$options.filters.capitalize(i18n.t('valid'))} ${warning.validInterval}. ${warning.info[i18n.locale]} ${i18n.t('description')}: ${i18n.t(`${warning.type}DescriptionLevel${warning.severity}`)}`);
    },
  },
  filters: {
    capitalize(value) {
      if (!value) return '';
      const stringValue = value.toString();
      return stringValue.charAt(0).toUpperCase() + stringValue.slice(1);
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

    .current-warning-panel:focus:not([data-focus-visible-added]) {
        outline: none;
    }

    .current-warning-heading {
        background-color: #f8f8f8;
        height: $current-warning-height;
        padding: 0 0 0 15px !important;
        line-height: $current-warning-height;
        border: none;
    }

    .btn-info {
        border: none;
    }

    .region-item-text {
        position: absolute;
        line-height: $current-warning-height;
    }

    .current-warning-toggle {
        height: $current-warning-height;
        width: $current-warning-height;
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

</style>

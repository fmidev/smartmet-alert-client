<template>
    <div class="symbol-list-table">
        <div class="symbol-list-cell symbol-list-cell-image">
            <div
                    :class="
          `level-${severity} ${typeClass} symbol-list-image-column symbol-list-image warning-image`
        "
            ></div>
        </div>
        <div class="symbol-list-cell symbol-list-cell-text">
            <div class="symbol-list-text-select">
                <div class="item-text symbol-list-text">
                    {{ title }}
                </div>
                <div class="symbol-list-select-container d-none d-md-table-cell">
                    <div
                        :id="id"
                        :class="[
                            'symbol-list-select',
                            input.visible ? 'flag-selected' : 'flag-unselected',
                            { 'd-md-block' : hideable },
                            'd-none',
                        ]"
                        :aria-label="input.visible ? hideLabel : showLabel"
                        tabindex="0"
                        @touchmove="preventEvents"
                        @touchend="preventEvents"
                        @touchstart="toggle"
                        @mousedown="toggle"
                        @mouseenter="openTooltip"
                        @mouseleave="closeTooltip"
                        @keydown.enter="toggle"
                        @keydown.space="toggle"
                    />
                    <b-tooltip id="fmi-warnings-toggle-tooltip" :show.sync="showTooltip" triggers="" :target="id" placement="top" delay=0 :fallback-placement="[]" :container="`fmi-warnings-flag-${input.type}`" >
                        <span @mouseenter="closeTooltip">
                            {{ tooltipFirstLine }}
                        <br>
                            {{ tooltipSecondLine }}
                        </span>
                    </b-tooltip>
                </div>
            </div>
            <hr/>
        </div>
    </div>
</template>

<script>
import i18n from '../i18n';
import fields from '../mixins/fields';
import utils from '../mixins/utils';
import 'focus-visible';

export default {
  name: 'Warning',
  props: ['input', 'hideable'],
  mixins: [fields, utils],
  data() {
    return {
      showTooltip: false,
    };
  },
  computed: {
    id() {
      return `fmi-warnings-flag-${this.input.type}`;
    },
    title() {
      return i18n.t(this.input.type);
    },
    tooltipFirstLine() {
      return this.input.visible ? i18n.t('selectWarningTooltipLine1') : i18n.t('selectDisabledWarningTooltipLine1');
    },
    tooltipSecondLine() {
      return this.input.visible ? i18n.t('selectWarningTooltipLine2') : i18n.t('selectDisabledWarningTooltipLine2');
    },
    showLabel() {
      return `${i18n.t('selectDisabledWarningTooltipLine1')} ${this.uncapitalize(this.title)} ${i18n.t('selectDisabledWarningTooltipLine2')}`;
    },
    hideLabel() {
      return `${i18n.t('selectWarningTooltipLine1')} ${this.uncapitalize(this.title)} ${i18n.t('selectWarningTooltipLine2')}`;
    },
  },
  methods: {
    toggle(event) {
      event.preventDefault();
      this.$store.dispatch('setWarningVisibility', {
        warning: this.input.type,
        visible: !this.input.visible,
      });
      this.closeTooltip(event);
    },
    openTooltip() {
      this.showTooltip = true;
    },
    closeTooltip() {
      this.showTooltip = false;
    },
    preventEvents(event) {
      event.preventDefault();
    },
  },
};
</script>

<style scoped lang="scss">
    @import "../scss/constants.scss";
    @import "../scss/warningImages.scss";

    div.symbol-list-table {
        display: table;
        border-spacing: 0;
        width: 100%;
    }

    div.symbol-list-cell {
        display: table-cell;
        vertical-align: middle;
        line-height: $symbol-list-line-height;
        text-align: left;
    }

    div.symbol-list-cell-image {
        width: $symbol-list-image-size;
    }

    div.symbol-list-image-column {
        width: 44px;
        margin-top: 2px;
    }

    .symbol-list-image {
        height: $symbol-list-image-size;
        background-size: $symbol-list-image-size $symbol-list-image-size;

        &.sea-wind {
            background-image: url($warning-image-path + 'sea-wind-legend' + $image-extension);
        }
    }

    div.warning-image {
        border-radius: 50%;
        background-repeat: no-repeat;
        background-position: center;
    }

    div.symbol-list-cell-text {
        padding-left: 15px;
        padding-right: 0;
    }

    hr {
        padding: 0;
        margin: 0;
        background-color: #eee;
        border: 0 none;
        color: #eee;
        height: 2px;
    }

    div#fmi-warnings-list div.symbol-list-cell-text {
        padding-right: 0;

        hr {
            margin-right: 0;
        }
    }

    div.symbol-list-text-select {
        width: 100%;
        display: table;
    }

    .item-text {
        display: inline-block;
        vertical-align: middle;
        line-height: normal;
    }

    div.symbol-list-text {
        display: table-cell;
        height: $symbol-list-line-height;
        &:focus:not([data-focus-visible-added]) {
            outline: none !important;
        }
    }

    .symbol-list-select-container {
        width: 30px;
        height: $symbol-list-line-height;
        display: table-cell;
        vertical-align: middle;
    }

    .symbol-list-select {
        width: 100%;
        height: $symbol-list-select-height;
        margin: 0;
        background-repeat: no-repeat;
        background-position: center;
    }

    .flag-selected {
        cursor: pointer;
        background-image: url($ui-image-path + 'flag-selected' + $image-extension);
    }

    .flag-unselected:focus:not([data-focus-visible-added]), .flag-selected:focus:not([data-focus-visible-added]) {
        outline: none;
    }

    .flag-unselected {
        cursor: pointer;
        background-image: url($ui-image-path + 'flag-unselected' + $image-extension);
    }

    ::v-deep .tooltip.bs-tooltip-top {
        opacity: 1;
        top: -9px !important;
        padding: 0;
        outline: none;

        .arrow {
            content: '';
            position: absolute;
            width: 0;
            height: 0;
            border: solid transparent;
            bottom: -5px;
            left: 50% !important;
            margin: 0 0 0 -6px;
            border-width: 6px 6px 0;
            border-top-color: $tooltip-border-color;
        }

        .arrow:before {
            position: absolute;
            width: 0;
            height: 0;
            border-width: 5px 5px 0;
            border-top-color: $tooltip-background-color;
            left: 50% !important;
            margin: 0 0 0 -5px;
            top: -6px;
            pointer-events: none;
        }

        .tooltip-inner {
            background-color: $tooltip-background-color;
            border: $tooltip-border-width solid $tooltip-border-color;
            color: $tooltip-inner-color;
            font-family: $font-family;
            font-size: $font-size;
            padding: 3px 6px;
            height: 52px;
            width: 90px;
            max-width: 100%;
            display: table;
            text-align: center;

            span {
                display: table-cell;
                vertical-align: middle;
                -webkit-touch-callout: none;
                -webkit-user-select: none;
                -khtml-user-select: none;
                -moz-user-select: none;
                -ms-user-select: none;
                user-select: none;
            }
        }
    }

    @media (max-width: 767px) {
        div.symbol-list-table {
            div.symbol-list-cell.symbol-list-cell-text {
                padding-right: 0;

                hr {
                    margin-right: 0;
                }
            }
        }
    }
</style>

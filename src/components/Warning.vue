<template>
  <div class="symbol-list-table">
    <div class="symbol-list-cell symbol-list-cell-image">
      <div
        :class="
          `level-${input.severity} ${typeClass} symbol-list-image-column symbol-list-image warning-image`
        "
      ></div>
    </div>
    <div class="symbol-list-cell symbol-list-cell-text">
      <div class="symbol-list-text-select">
        <div class="item-text symbol-list-text">
          {{ title }}
        </div>
        <div class="symbol-list-select-container .d-none .d-sm-block">
            <div
              :class="[
                'symbol-list-select',
                input.visible ? 'flag-selected' : 'flag-unselected',
                { 'd-none d-sm-block': hideable }
              ]"
              :title="input.visible ? hideTooltip : showTooltip"
              :aria-label="input.visible ? hideLabel : showLabel"
              tabindex="0"
              v-on:click="toggle()"
              v-b-tooltip.hover
            />
        </div>
      </div>
      <hr />
    </div>
  </div>
</template>

<script>
import i18n from '../i18n';
import warningUtils from '../mixins/warningUtils';

export default {
  name: 'Warning',
  props: ['input', 'hideable'],
  mixins: [warningUtils],
  computed: {
    title() {
      return i18n.t(this.input.type);
    },
    showTooltip() {
      return `${i18n.t('selectDisabledWarningTooltipLine1')}
              ${i18n.t('selectDisabledWarningTooltipLine2')}`;
    },
    hideTooltip() {
      return `${i18n.t('selectWarningTooltipLine1')}
              ${i18n.t('selectWarningTooltipLine2')}`;
    },
    showLabel() {
      return `${i18n.t('selectDisabledWarningTooltipLine1')} ${this.$options.filters.uncapitalize(this.title)} ${i18n.t('selectDisabledWarningTooltipLine2')}`;
    },
    hideLabel() {
      return `${i18n.t('selectWarningTooltipLine1')} ${this.$options.filters.uncapitalize(this.title)} ${i18n.t('selectWarningTooltipLine2')}`;
    },
  },
  methods: {
    toggle() {
      this.$store.commit('Set warning visibility', {
        warning: this.input.type,
        visible: !this.input.visible,
      });
    },
  },
  filters: {
    uncapitalize(value) {
      if (!value) return '';
      const stringValue = value.toString();
      return stringValue.charAt(0).toLowerCase() + stringValue.slice(1);
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

.level-1 {
  background-color: $green;
}

.level-2 {
  background-color: $yellow;
}

.level-3 {
  background-color: $orange;
}

.level-4 {
  background-color: $red;
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
}

.symbol-list-select-container {
  width: 30px;
  height: $symbol-list-line-height;
  display: table-cell;
}

.symbol-list-select {
  width: 100%;
  height: $symbol-list-select-height;
  margin: 9px 0;
  background-repeat: no-repeat;
  background-position: center;
}

.flag-selected {
  cursor: pointer;
  background-image: url($ui-image-path + 'flag-selected' + $image-extension);
}

.flag-unselected {
  cursor: pointer;
  background-image: url($ui-image-path + 'flag-unselected' + $image-extension);
}

  .tooltip {
    &.top {
      padding: $tooltip-arrow-border-width 0;
      margin-top: -3px;
    }
    &.right {
      padding: 0 $tooltip-arrow-border-width;
    }
    &.bottom {
      padding: $tooltip-arrow-border-width 0;
    }
    &.left {
      padding: 0 $tooltip-arrow-border-width;
    }
    &.in {
      opacity: 1;
    }
    .tooltip-inner {
      background-color: $tooltip-background-color;
      border: $tooltip-border-width solid $tooltip-border-color;
      color: $tooltip-inner-color;
      font-family: "Roboto", sans-serif;
      font-size: 14px;
      padding: 3px 6px;
      height: 52px;
      max-height: 100%;
      width: 90px;
      max-width: 100%;
      display: table-cell;
      vertical-align: middle;
      white-space: pre-wrap;
    }
  }

  .tooltip-arrow:after {
    content: '';
    position: absolute;
    width: 0;
    height: 0;
    border: solid transparent;
    z-index: -1;
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

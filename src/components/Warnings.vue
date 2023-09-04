<template>
  <div id="fmi-warnings-view" :class="theme">
    <div
      v-if="input.length > 0"
      :class="['row', 'symbol-list-main-row', 'show-text-row']">
      <span
        class="bold-text show-text d-none"
        :class="{ 'd-sm-block': hiddenWarnings }"
        @click="showAll"
        >{{ showWarningsText }}</span
      >
    </div>
    <div v-if="input.length > 0" class="row symbol-list-main-row">
      <hr class="symbol-block-separator" />
    </div>
    <div id="fmi-warnings-list">
      <Warning
        v-for="warning in warnings"
        :key="warning.key"
        :input="warning"
        :hideable="warnings.length > 1"
        :theme="theme"
        :language="language"
        @warningToggled="onWarningToggled" />
    </div>
    <div class="row symbol-list-main-row">
      <hr
        class="symbol-block-separator legend-separator"
        :class="noWarnings ? 'no-warnings' : ''" />
    </div>
    <div class="row symbol-list-main-row">
      <div class="symbol-list-table">
        <div class="symbol-list-cell symbol-list-cell-image">
          <div
            class="gray several symbol-list-image-column symbol-list-image warning-image"></div>
        </div>
        <div class="symbol-list-cell symbol-list-cell-text">
          <div class="item-text symbol-list-text">
            {{ severalWarningsText }}
          </div>
          <hr />
        </div>
      </div>
    </div>
    <div class="row symbol-list-main-row">
      <div class="symbol-list-table">
        <div class="symbol-list-cell symbol-list-cell-image">
          <div
            class="level-1 symbol-list-image-column symbol-list-image warning-image"></div>
        </div>
        <div class="symbol-list-cell symbol-list-cell-text">
          <div class="item-text symbol-list-text">
            {{ warningLevel1Text }}
          </div>
          <hr />
        </div>
      </div>
    </div>
    <div class="row symbol-list-main-row">
      <div class="symbol-list-table">
        <div class="symbol-list-cell symbol-list-cell-image">
          <div
            class="level-2 symbol-list-image-column symbol-list-image warning-image"></div>
        </div>
        <div class="symbol-list-cell symbol-list-cell-text">
          <div class="item-text symbol-list-text">
            {{ warningLevel2Text }}
          </div>
          <hr />
        </div>
      </div>
    </div>
    <div class="row symbol-list-main-row">
      <div class="symbol-list-table">
        <div class="symbol-list-cell symbol-list-cell-image">
          <div
            class="level-3 symbol-list-image-column symbol-list-image warning-image"></div>
        </div>
        <div class="symbol-list-cell symbol-list-cell-text">
          <div class="item-text symbol-list-text">
            {{ warningLevel3Text }}
          </div>
          <hr />
        </div>
      </div>
    </div>
    <div class="row symbol-list-main-row">
      <div class="symbol-list-table">
        <div class="symbol-list-cell symbol-list-cell-image">
          <div
            class="level-4 symbol-list-image-column symbol-list-image warning-image"></div>
        </div>
        <div class="symbol-list-cell symbol-list-cell-text">
          <div class="item-text symbol-list-text">
            {{ warningLevel4Text }}
          </div>
          <hr />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import i18n from '../mixins/i18n'
import Warning from './Warning.vue'

export default {
  name: 'Warnings',
  components: {
    Warning,
  },
  mixins: [i18n],
  props: ['input', 'visibleWarnings', 'language', 'theme'],
  computed: {
    warnings() {
      return this.input
    },
    hiddenWarnings() {
      return this.visibleWarnings.length !== this.input.length
    },
    noWarnings() {
      return this.warnings.length === 0
    },
    warningSymbolsText() {
      return this.noWarnings ? this.t('noWarnings') : this.t('warningSymbols')
    },
    warningSymbolDaysText() {
      return this.noWarnings ? '' : this.t('warningSymbolDays')
    },
    showWarningsText() {
      return this.t('showWarnings')
    },
    severalWarningsText() {
      return this.t('severalWarnings')
    },
    warningLevel1Text() {
      return this.t('warningLevel1')
    },
    warningLevel2Text() {
      return this.t('warningLevel2')
    },
    warningLevel3Text() {
      return this.t('warningLevel3')
    },
    warningLevel4Text() {
      return this.t('warningLevel4')
    },
  },
  methods: {
    onWarningToggled({ warning, visible }) {
      let newVisibleWarnings = this.visibleWarnings
      if (visible && !this.visibleWarnings.includes(warning)) {
        newVisibleWarnings.push(warning)
      } else if (!visible) {
        newVisibleWarnings = newVisibleWarnings.filter(
          (visibleWarning) => visibleWarning !== warning
        )
      }
      this.$emit('warningsToggled', newVisibleWarnings)
    },
    showAll() {
      this.$emit('showAllWarnings')
    },
  },
}
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';
@import '../scss/warningImages.scss';

h3 {
  font-family: $font-family;
  font-size: $font-size;
  font-weight: bold;
  white-space: nowrap;
  margin-top: 0;
}

.row {
  display: block;
  margin-left: 0;
  margin-right: 0;
}

div.symbol-list-main-row {
  padding-left: 0;
}

.show-text-row {
  height: 30px;
}

div#fmi-warnings-view > div.row > span.show-text {
  line-height: 30px;
  float: right;
  color: $dark-blue;
  cursor: pointer;
  white-space: nowrap;
}

hr.symbol-block-separator {
  margin-left: 59px;
  margin-right: 0;
}

hr.legend-separator {
  margin-top: 55px;
  &.no-warnings {
    margin-top: 10px;
  }
}

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

.light .gray {
  background-color: $light-legend-toggle-background-color;
}

.dark .gray {
  background-color: $dark-legend-toggle-background-color;
}

.several {
  background-image: url($warning-image-path + 'several' + $image-extension);
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

div#fmi-warnings-list div.symbol-list-cell-text {
  padding-right: 0;
  hr {
    margin-right: 0;
  }
}

div#fmi-warnings-view {
  div.symbol-list-table {
    div.symbol-list-cell.symbol-list-cell-text {
      padding-right: 0;
      hr {
        margin-right: 0;
      }
    }
  }
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

hr {
  padding: 0;
  margin: 0;
  border: 0 none;
  height: 2px;
}

.light hr {
  background-color: $light-horizontal-rule-color;
  color: $light-horizontal-rule-color;
}

.dark hr {
  background-color: $dark-horizontal-rule-color;
  color: $dark-horizontal-rule-color;
}

@media (max-width: 767px) {
  hr.symbol-block-separator {
    margin-right: 0;
  }

  div.show-text-row {
    display: none;
  }

  :deep(br.symbol-list-header-line-break) {
    display: none;
  }
}
</style>

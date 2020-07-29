<template>
  <div id="fmi-warnings-view" class="sticky-top">
    <div class="row symbol-list-header-row">
      <h2>{{ warningSymbolsText }}</h2>
    </div>
    <div
      :class="[
        'row',
        'symbol-list-main-row',
        'show-text-row',
        { '.d-none': warnings.length > 0 }
      ]"
    >
      <span
        class="bold-text show-text d-none"
        :class="{ 'd-sm-block': hiddenWarnings }"
        v-on:click="showAll"
        >{{ showWarningsText }}</span
      >
    </div>
    <div class="row symbol-list-main-row hidden">
      <hr class="symbol-block-separator" />
    </div>
    <div id="fmi-warnings-list" >
      <Warning
        v-for="warning in warnings"
        :key="warning.key"
        :input="warning"
        :hideable="warnings.length > 1"
      />
    </div>
    <div class="row symbol-list-main-row">
      <hr class="symbol-block-separator legend-separator" />
    </div>
    <div class="row symbol-list-main-row">
      <div class="symbol-list-table">
        <div class="symbol-list-cell symbol-list-cell-image">
          <div
            class="gray several symbol-list-image-column symbol-list-image warning-image"
          ></div>
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
            class="level-1 symbol-list-image-column symbol-list-image warning-image"
          ></div>
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
            class="level-2 symbol-list-image-column symbol-list-image warning-image"
          ></div>
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
            class="level-3 symbol-list-image-column symbol-list-image warning-image"
          ></div>
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
            class="level-4 symbol-list-image-column symbol-list-image warning-image"
          ></div>
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
import Vue from 'vue';
import Warning from './Warning.vue';
import i18n from '../i18n';

export default {
  name: 'Warnings',
  components: {
    Warning,
  },
  props: ['input'],
  data() {
    return {
      warnings: this.input,
    };
  },
  computed: {
    visibleWarnings() {
      return this.$store.getters.visibleWarnings;
    },
    hiddenWarnings() {
      return this.visibleWarnings.length !== this.input.length;
    },
    warningSymbolsText() {
      return this.input.length > 0 ?
        i18n.t('warningSymbols') :
        i18n.t('noWarnings');
    },
    showWarningsText() {
      return i18n.t('showWarnings');
    },
    severalWarningsText() {
      return i18n.t('severalWarnings');
    },
    warningLevel1Text() {
      return i18n.t('warningLevel1');
    },
    warningLevel2Text() {
      return i18n.t('warningLevel2');
    },
    warningLevel3Text() {
      return i18n.t('warningLevel3');
    },
    warningLevel4Text() {
      return i18n.t('warningLevel4');
    },
  },
  watch: {
    visibleWarnings(newVisibleWarnings) {
      this.warnings.forEach((warning) => {
        const isVisible = newVisibleWarnings.includes(warning.type);
        if (isVisible !== warning.visible) {
          Vue.set(warning, 'visible', isVisible);
        }
      });
    },
  },
  methods: {
    showAll() {
      this.$store.commit('Set visible warnings', this.warnings.reduce((types, warning) => types.concat([warning.key]), []));
    },
  },
};
</script>

<style scoped lang="scss">
@import "../scss/constants.scss";

h2 {
  font-family: "Roboto", sans-serif;
  font-size: 14px;
  font-weight: bold;
  color: black;
  white-space: nowrap;
}

.row {
  display: block;
  margin-left: 0;
  margin-right: 0;
}
div.symbol-list-header-row {
  padding-left: 0;
  padding-right: 0;
  padding-bottom: 5px;
  span {
    white-space: nowrap;
  }
}
div.symbol-list-main-row {
  padding-left: 0;
}
.show-text-row {
  height: 30px;
}
.show-text {
  margin-top: 5px;
  margin-bottom: 5px;
  padding-left: 59px;
  float: left;
  color: #53b9e6;
  cursor: pointer;
  white-space: nowrap;
}
hr.symbol-block-separator {
  margin-left: 59px;
  margin-right: 0;
}
hr.legend-separator {
  margin-top: 55px;
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
.gray {
  background-color: $gray;
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
hr {
  padding: 0;
  margin: 0;
  background-color: #eee;
  border: 0 none;
  color: #eee;
  height: 2px;
}
@media (max-width: 767px) {
  hr.symbol-block-separator {
    margin-right: 0;
  }
  div.show-text-row {
    display: none;
  }
}
</style>

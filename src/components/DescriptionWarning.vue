<template>
  <div class="current-description-row">
    <div class="current-description-image-cell">
      <div
        :class="`current-description-image warning-image symbol-image symbol-image-rotate-${rotation} level-${input.severity} ${typeClass}`"
      >
        <span
          :class="`symbol-text symbol-text-rotate-${rotation} region-warning-symbol-text`"
          >{{ input.text }}</span
        >
      </div>
    </div>
    <div class="current-description-text-cell ">
      <div class="description-info">
        <span class="font-weight-bold"
          >{{ warningTitle }} — {{ validText }} {{ input.validInterval }}</span
        ><br />
        {{ info }}
      </div>
      <div
        class="description-indent-text"
      >
        <div class="description-indent">
          <div :class="`description-rectangle level-${input.severity}`"></div>
        </div>
        <div class="description-text">
          {{ description }}
          <a :class="['ext-link', {'d-none': linkHidden}]" :href="`${input.link}`" target="_blank">{{
            input.linkText
          }}</a>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import fields from '../mixins/fields';
import utils from '../mixins/utils';
import i18n from '../i18n';

export default {
  name: 'DescriptionWarning',
  props: ['input'],
  mixins: [fields, utils],
  computed: {
    warningTitle() {
      return i18n.t(this.input.type);
    },
    info() {
      return this.input.info[i18n.locale];
    },
    validText() {
      return i18n.t('valid');
    },
    linkHidden() {
      return ((this.input.link == null) || (this.input.link.length === 0));
    },
    description() {
      return i18n.t(`${this.input.type}DescriptionLevel${this.input.severity}`);
    },
  },
};
</script>

<style scoped lang="scss">
  @import "../scss/constants.scss";
  @import "../scss/warningImages.scss";

    div.current-description-row {
      display: table-row;
    }

    div.current-description-image-cell {
      display: table-cell;
      vertical-align: top;
    }

    div.current-description-image {
      background-size: $symbol-list-image-size $symbol-list-image-size;
      width: $current-description-image-height;
      height: $current-description-image-height;
    }

    div.warning-image {
      border-radius: 50%;
      background-repeat: no-repeat;
      background-position: center;
    }

    span.region-warning-symbol-text {
      font-size: 12px;
    }

    div.current-description-text-cell {
      display: table-cell;
      vertical-align: middle;
      padding-left: 10px;
    }

  .description-info {
    width: 100%;
  }

  .description-indent-text {
    width: 100%;
    position: relative;
    margin-top: 5px;
  }

  .description-indent {
    width: 30px;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
  }

  .description-rectangle {
    width: 4px;
    height: 100%;
    margin-left: 0;
    margin-top: 0;
    margin-bottom: 0;
  }

  .description-text {
    margin-left: 30px;
    font-style: italic;
    padding-top: 5px;
    padding-bottom: 5px;
  }

  a.ext-link {
    color: #303193;
    padding-right: 14px;
    background: transparent url($ui-image-path + 'ext-link.gif') no-repeat center
      right;
    margin-right: 2px;
  }

</style>

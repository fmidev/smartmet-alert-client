<template>
  <div
    :class="[
      'symbol-image',
      'warning-image',
      'current-warning-image',
      `transform-rotate-${rotation}`,
      `symbol-rotate-${rotation}`,
      `level-${input.severity}`,
      `${typeClass}`,
    ]"
    :aria-label="`${warningLevel} ${warningTypeText}${warningDetails}`"
  >
    <span
      aria-hidden="true"
      :class="[
        'warning-symbol-text',
        'symbol-text',
        `transform-rotate-${invertedRotation}`,
      ]"
      >{{ input.text }}</span
    >
  </div>
</template>

<script>
import fields from '../mixins/fields'
import i18n from '../mixins/i18n'
import utils from '../mixins/utils'

export default {
  name: 'RegionWarning',
  mixins: [fields, i18n, utils],
  props: {
    input: {
      type: Object,
      default: null,
    },
    language: {
      type: String,
    },
  },
  computed: {
    warningLevel() {
      return this.t(`warningLevel${this.input.severity}`)
    },
    warningTypeText() {
      return this.t(this.input.type).toLowerCase();
    },
    warningDetails() {
      if (this.input.text == null || this.input.direction == null) {
        return ''
      }
      return ` (${this.input.text} m/s ${this.t("fromDirection")} ${this.input.direction + 180}°)`
    }
  },
}
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';
@import '../scss/warningImages.scss';

div.warning-image {
  border-radius: 50%;
  background-repeat: no-repeat;
  background-position: center;
}

.light-gray-theme div.warning-image {
  border: 1px solid $light-gray-border;
}

.current-warning-image {
  background-size: $current-warning-image-height $current-warning-image-height;
  height: $current-warning-image-height;
  width: $current-warning-image-height;
  margin: 0 5px;
  float: right;
}

span.warning-symbol-text {
  font-size: $warning-symbol-font-size;
}
</style>

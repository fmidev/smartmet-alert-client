<template>
  <div
    :class="[
      'symbol-image',
      'warning-image',
      'current-warning-image',
      `symbol-image-rotate-${rotation}`,
      `symbol-rotate-${rotation}`,
      `level-${input.severity}`,
      `${typeClass}`,
    ]">
    <span
      aria-hidden="true"
      :class="[
        'warning-symbol-text',
        'symbol-text',
        `symbol-text-rotate-${rotation}`,
      ]"
      >{{ input.text }}</span
    >
  </div>
</template>

<script>
import fields from '../mixins/fields'
import utils from '../mixins/utils'

export default {
  name: 'RegionWarning',
  mixins: [fields, utils],
  props: ['input'],
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

.current-warning-image {
  background-size: 28px 28px;
  height: $current-warning-image-height;
  width: $current-warning-image-height;
  margin-top: ($current-warning-height - $current-warning-image-height) / 2;
  float: right;
  margin-left: 5px;
  margin-right: 5px;
}

span.warning-symbol-text {
  font-size: 9px;
}
</style>

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
    ]">
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

.light-gray-theme div.warning-image {
  border: 1px solid $light-gray-border;
}

.current-warning-image {
  background-size: 28px 28px;
  height: $current-warning-image-height;
  width: $current-warning-image-height;
  margin-top: calc(
    ($current-warning-height - $current-warning-image-height) / 2
  );
  float: right;
  margin-left: 5px;
  margin-right: 5px;
}

span.warning-symbol-text {
  font-size: $warning-symbol-font-size;
}
</style>

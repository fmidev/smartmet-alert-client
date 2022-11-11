<template>
  <div class="popup-table-row">
    <div
      :class="[
        'popup-table-cell',
        'popup-table-symbol-cell',
        'symbol-image',
        `symbol-image-rotate-${rotation}`,
        `level-${severity}`,
        typeClass,
        'warning-image',
      ]">
      <span
        :class="[
          'symbol-text',
          `symbol-text-rotate-${rotation}`,
          'warning-symbol-text',
        ]">
        {{ input.text }}
      </span>
    </div>
    <div
      class="popup-table-cell popup-table-text-cell"
      :class="[`text-level-${severity}`]"
      v-html="input.interval"></div>
  </div>
</template>

<script>
import fields from '../mixins/fields'

export default {
  name: 'PopupRow',
  mixins: [fields],
  props: {
    input: {
      type: Object,
      default: () => ({}),
    },
  },
}
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';
@import '../scss/warningImages.scss';

.popup-table-row {
  display: table-row;
}

.popup-table-cell {
  display: table-cell;
  vertical-align: middle;
  text-align: left;

  &.level-0 {
    display: none;
  }
}

.popup-table-symbol-cell {
  background-size: 24px 24px;
  height: $current-warning-image-height;
  width: $current-warning-image-height;
  min-width: $current-warning-image-height;
  margin-top: ($current-warning-height - $current-warning-image-height) / 2;
  margin-left: 2px;
  margin-right: 0;
}

span.symbol-text {
  display: table-cell;
  vertical-align: middle;
  line-height: normal;
  width: 100%;
  text-align: center;
  margin: 0 auto;
  font-family: $font-family;
  color: $white;
  text-anchor: middle;
  font-weight: 700;
}

span.warning-symbol-text {
  font-size: 9px;
}

.popup-table-text-cell {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  padding: 5px 0 0 2px;
  &.text-level-0 {
    padding-left: 12px;
  }
}

.warning-image {
  border-radius: 50%;
  background-repeat: no-repeat;
  background-position: center;
}
</style>

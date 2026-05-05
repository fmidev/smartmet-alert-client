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
    :aria-label="`${warningLevel} ${warningTypeText}${warningDetails}`">
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

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useFields } from '@/composables/useFields'
import { useI18n } from '@/composables/useI18n'
import type { WarningIconInput } from '@/types'

// Props
const props = defineProps<{
  input: WarningIconInput
  language?: string
}>()

// Composables
const { typeClass, rotation, invertedRotation, severity } = useFields(
  toRef(props, 'input')
)
const { t } = useI18n(toRef(props, 'language'))

// Expose for testing
defineExpose({
  severity,
})

// Computed
const warningLevel = computed((): string => {
  return t(`warningLevel${props.input.severity}`)
})

const warningTypeText = computed((): string => {
  return t(props.input.type).toLowerCase()
})

const warningDetails = computed((): string => {
  if (props.input.text == null || props.input.direction == null) {
    return ''
  }
  return ` (${props.input.text} m/s ${t('fromDirection')} ${
    props.input.direction + 180
  }°)`
})
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

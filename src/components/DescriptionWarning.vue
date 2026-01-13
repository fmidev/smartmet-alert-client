<template>
  <div class="current-description-row" :class="theme">
    <div class="current-description-image-cell" aria-hidden="true">
      <div
        :class="`current-description-image warning-image symbol-image transform-rotate-${rotation} level-${input.severity} ${typeClass}`"
        :aria-label="`${warningLevel} ${warningTitle.toLowerCase()}${warningDetails}`">
        <span
          :class="`symbol-text transform-rotate-${invertedRotation} region-warning-symbol-text`"
          >{{ input.text }}</span
        >
      </div>
    </div>
    <div class="current-description-text-cell">
      <div class="description-info">
        <span
          class="warning-valid bold-text"
          v-html="`${warningTitle} — ${validText} ${input.validInterval}`" />
        <span>
          {{ info }}
        </span>
      </div>
      <div class="description-indent-text">
        <div class="description-indent">
          <div :class="`description-rectangle level-${input.severity}`"></div>
        </div>
        <div class="description-text">
          {{ description }}
          <a
            :class="['ext-link', { 'd-none': linkHidden }]"
            :href="`${input.link}`"
            target="_blank"
            >{{ input.linkText }}</a
          >
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef } from 'vue'
import { useFields } from '@/composables/useFields'
import { useI18n } from '@/composables/useI18n'
import type { Warning, Language } from '@/types'

// Props
const props = defineProps<{
  input: Warning
  language?: Language | string
  theme?: string
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
const warningTitle = computed((): string => {
  return t(props.input.type)
})

const warningLevel = computed((): string => {
  return t(`warningLevel${props.input.severity}`)
})

const warningDetails = computed((): string => {
  if (
    props.input.text == null ||
    props.input.text === '' ||
    props.input.direction == null
  ) {
    return ''
  }
  return ` (${props.input.text} m/s ${t('fromDirection')} ${
    props.input.direction + 180
  }°)`
})

const info = computed((): string => {
  const lang = props.language as Language
  return props.input.info[lang] ?? ''
})

const validText = computed((): string => {
  return t('valid')
})

const linkHidden = computed((): boolean => {
  return props.input.link == null || props.input.link.length === 0
})

const description = computed((): string => {
  return t(`${props.input.type}DescriptionLevel${props.input.severity}`)
})
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';
@import '../scss/warningImages.scss';

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
  font-size: $font-size;
}

div.current-description-text-cell {
  display: table-cell;
  vertical-align: middle;
  text-align: left;
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
  padding-right: 20px;
  background: transparent url($ui-image-path + 'ext-link.svg') no-repeat center
    right;
  margin-right: 2px;
  background-size: 16px 16px;
  font-style: normal;
  text-decoration: none;
}

.light-theme a.ext-link {
  color: $light-ext-link-color;
  border-bottom: 1px solid $light-ext-link-underground-color;
  &:hover {
    border-bottom-color: $dark-blue;
  }
}

.dark-theme a.ext-link {
  color: $dark-ext-link-color;
  border-bottom: 1px solid $dark-ext-link-underground-color;
  &:hover {
    border-bottom-color: $notification-color;
  }
}

.light-gray-theme a.ext-link {
  color: $light-gray-ext-link-color;
  border-bottom: 1px solid $light-gray-ext-link-underground-color;
  &:hover {
    border-bottom-color: $black;
  }
}

.dark-gray-theme a.ext-link {
  color: $dark-gray-ext-link-color;
  border-bottom: 1px solid $dark-gray-ext-link-underground-color;
  &:hover {
    border-bottom-color: $white;
  }
}

span.warning-valid {
  display: block;
  font-family: $font-family;
  font-size: $font-size;
  font-weight: bold;
  margin-top: 0;
  margin-bottom: 5px;
}
</style>

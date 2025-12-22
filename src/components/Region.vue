<template>
  <h3>
    <button
      :id="`accordion-${code}`"
      type="button"
      :aria-expanded="open"
      :class="['accordion-trigger', 'focus-ring', open ? '' : 'collapsed']"
      :aria-controls="`accordion-section-${code}`"
      :aria-label="ariaButton"
      @click="onRegionToggle">
      <div class="region-header">
        <span class="region-item-text">
          {{ regionName }}
        </span>
        <div>
          <RegionWarning
            v-for="warning in warningsSummary"
            :key="warning.id"
            :input="warning"
            :language="language">
          </RegionWarning>
        </div>
      </div>
      <div block :class="['current-warning-toggle', open ? '' : 'collapsed']" />
    </button>
  </h3>
  <div
    :id="`accordion-section-${code}`"
    role="region"
    :aria-labelledby="`accordion-${code}`"
    :aria-expanded="open"
    class="accordion-panel"
    :hidden="open ? undefined : ''">
    <div class="current-description">
      <div class="current-description-table">
        <DescriptionWarning
          v-for="warning in reducedWarnings"
          :key="warning.id"
          :input="warning"
          :theme="theme"
          :language="language" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, toRef } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useConfig } from '@/composables/useConfig'
import DescriptionWarning from './DescriptionWarning.vue'
import RegionWarning from './RegionWarning.vue'
import type {
  Warning,
  WarningsMap,
  RegionWarningItem,
  Theme,
  Language,
} from '@/types'

// ============================================================================
// Props
// ============================================================================

const props = withDefaults(
  defineProps<{
    type?: string
    code?: string
    name?: string
    input?: RegionWarningItem[]
    warnings?: WarningsMap | null
    theme?: Theme | string
    language?: Language
  }>(),
  {
    type: undefined,
    code: undefined,
    name: undefined,
    input: () => [],
    warnings: null,
    theme: 'light-theme',
    language: undefined,
  }
)

// ============================================================================
// Composables
// ============================================================================

const { t } = useI18n(toRef(() => props.language))
const { coverageCriterion } = useConfig()

// ============================================================================
// State
// ============================================================================

const open = ref<boolean>(false)

// ============================================================================
// Computed Properties
// ============================================================================

const identifier = computed<string>(() => {
  return `accordion-item-${props.code}`
})

const regionName = computed<string>(() => {
  return t(props.name)
})

const warningsSummary = computed<Warning[]>(() => {
  return props.input.reduce((summaryWarnings: Warning[], warningInfo) => {
    const firstIdentifier = warningInfo?.identifiers?.[0]
    if (
      warningInfo != null &&
      firstIdentifier != null &&
      warningInfo.coverage >= coverageCriterion
    ) {
      const warning = props.warnings?.[firstIdentifier]
      if (warning != null) {
        summaryWarnings.push(warning)
      }
    }
    return summaryWarnings
  }, [])
})

const reducedWarnings = computed<Warning[]>(() => {
  return props.input.reduce(
    (allWarnings: Warning[], warningInfo) =>
      allWarnings.concat(
        warningInfo.identifiers.reduce((identifiers: Warning[], identifier) => {
          const warning = props.warnings?.[identifier]
          if (
            warning != null &&
            warningsSummary.value.some(
              (summaryWarning) => summaryWarning.type === warning.type
            )
          ) {
            identifiers.push(warning)
          }
          return identifiers
        }, [])
      ),
    []
  )
})

const ariaButton = computed<string>(() => {
  return `${
    open.value
      ? t('infoButtonAriaLabelCloseRegion')
      : t('infoButtonAriaLabelShowRegion')
  } ${regionName.value} ${t('infoButtonAriaLabelValidWarnings')}`
})

const ariaInfo = computed<string[]>(() => {
  return reducedWarnings.value.map(
    (warning, index) =>
      `${index > 0 ? ' ' : ''}${t(warning.type)}: ${t(
        `warningLevel${warning.severity}`
      )}.`
  )
})

// ============================================================================
// Methods
// ============================================================================

const onRegionToggle = (): void => {
  open.value = !open.value
}

// ============================================================================
// Expose for tests
// ============================================================================

defineExpose({
  open,
  identifier,
  regionName,
  warningsSummary,
  reducedWarnings,
  ariaButton,
  ariaInfo,
  onRegionToggle,
})
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';

.current-warning-panel {
  border-radius: 0;
  border: none;
  margin-left: 0;
  margin-right: 0;
  background-color: transparent;

  .card-header {
    height: $current-warning-height;
    padding: 0 0 0 15px !important;
    line-height: $current-warning-height;
    border: none;
  }
}

.light-theme .current-warning-heading {
  background-color: $light-current-warning-heading-color;
}

.dark-theme .current-warning-heading {
  background-color: $dark-current-warning-heading-color;
}

.light-gray-theme .current-warning-heading {
  background-color: $light-gray-current-warning-heading-color;
}

.dark-gray-theme .current-warning-heading {
  background-color: $dark-gray-current-warning-heading-color;
}

button {
  border: none;
  cursor: pointer;
  &:focus:not(:focus-visible) {
    box-shadow: none;
  }
}

.region-header {
  position: absolute;
  left: 0;
  right: 38px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $current-warning-height;
}

.region-item-text {
  display: block;
  text-align: left;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-left: 15px;
}

.light-theme .region-header {
  background-color: $light-current-warning-heading-color;
}

.dark-theme .region-header {
  background-color: $dark-current-warning-heading-color;
}

.light-gray-theme .region-header {
  background-color: $light-gray-current-warning-heading-color;
}

.dark-gray-theme .region-header {
  background-color: $dark-gray-current-warning-heading-color;
}

.current-warning-toggle {
  position: relative;
  height: $current-warning-height;
  width: $current-warning-height;
  min-width: $current-warning-height;
  background-image: url($ui-image-path + 'arrow-up.svg');
  background-repeat: no-repeat;
  background-position: center;
  border-radius: 0;
  border-style: none;
  float: right;
  padding: $image-padding;
  margin-left: 5px;

  &.collapsed {
    background-image: url($ui-image-path + 'arrow-down.svg');
  }
}

.light-theme .current-warning-toggle {
  background-color: $light-current-warning-toggle-color;

  &:hover {
    background-color: $light-current-warning-toggle-color;
  }

  &:not(:disabled):not(.disabled):active {
    background-color: $light-current-warning-toggle-active-color;
  }
}

.dark-theme .current-warning-toggle {
  background-color: $dark-current-warning-toggle-color;

  &:hover {
    background-color: $dark-current-warning-toggle-color;
  }

  &:not(:disabled):not(.disabled):active {
    background-color: $dark-current-warning-toggle-active-color;
  }
}

.light-gray-theme .current-warning-toggle {
  background-color: $light-gray-current-warning-toggle-color;

  &:hover {
    background-color: $light-gray-current-warning-toggle-color;
  }

  &:not(:disabled):not(.disabled):active {
    background-color: $light-gray-current-warning-toggle-active-color;
  }
}

.dark-gray-theme .current-warning-toggle {
  background-color: $dark-gray-current-warning-toggle-color;

  &:hover {
    background-color: $dark-gray-current-warning-toggle-color;
  }

  &:not(:disabled):not(.disabled):active {
    background-color: $dark-gray-current-warning-toggle-active-color;
  }
}

.current-description {
  padding: 15px;
}

.light-theme .current-description {
  border-top: 0.5px solid $light-description-border-color;
  background-color: $light-description-background-color;
}

.dark-theme .current-description {
  border-top: 0.5px solid $dark-description-border-color;
  background-color: $dark-description-background-color;
}

.light-gray-theme .current-description {
  border-top: 0.5px solid $light-gray-description-border-color;
  background-color: $light-gray-description-background-color;
}

.dark-gray-theme .current-description {
  border-top: 0.5px solid $dark-gray-description-border-color;
  background-color: $dark-gray-description-background-color;
}

div.current-description-table {
  display: table;
  border-spacing: 10px;
  width: 100%;
}

div.accordion-item-region {
  div.card-body {
    padding: 0;
  }
}

h3 {
  margin: 0;
  padding: 0;
}

.accordion-trigger {
  background: none;
  color: hsl(0deg 0% 13%);
  display: block;
  font-size: $font-size;
  font-weight: normal;
  margin: 0;
  padding: 0;
  position: relative;
  text-align: left;
  width: 100%;
  outline: none;
}

.accordion > div:first-child .accordion-trigger > .region-header {
  border-radius: 0;
}

.accordion > div:last-child .accordion-trigger.collapsed > .region-header {
  border-radius: 0;
}

.accordion > div:first-child:last-child .accordion-trigger > .region-header {
  border-radius: 0;
}

.accordion
  > div:first-child:last-child
  .accordion-trigger.collapsed
  > .region-header {
  border-radius: 0;
}

.accordion > div:first-child > h3 > button,
.accordion > div:first-child > h3 > button:hover {
  border-radius: 0;
}

.accordion > div:last-child > h3 > button.collapsed,
.accordion > div:last-child > h3 > button.collapsed:hover {
  border-radius: 0;
}

.accordion > div:first-child:last-child > h3 > button,
.accordion > div:first-child:last-child > h3 > button:hover {
  border-radius: 0;
}

.accordion > div:first-child:last-child > h3 > button.collapsed,
.accordion > div:first-child:last-child > h3 > button.collapsed:hover {
  border-radius: 0;
}

.accordion > div:last-child .current-description {
  border-radius: 0;
}

.accordion > div:first-child > div > h3 > button > div.current-warning-toggle {
  border-radius: 0;
}

.accordion
  > div:last-child
  > div
  > h3
  > button
  > div.current-warning-toggle.collapsed {
  border-radius: 0;
}

.accordion
  > div:first-child:last-child
  > div
  > h3
  > button
  > div.current-warning-toggle {
  border-radius: 0;
}

.accordion
  > div:first-child:last-child
  > div
  > h3
  > button
  > div.current-warning-toggle.collapsed {
  border-radius: 0;
}

button {
  border-style: none;
}

.accordion button::-moz-focus-inner {
  border: 0;
}

.accordion-panel {
  margin: 0;
  padding: 0;
}

/* For Edge bug https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/4806035/ */
.accordion-panel[hidden] {
  display: none;
}
</style>

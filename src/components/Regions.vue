<template>
  <div id="region-warnings" class="row">
    <div v-if="anyLandWarnings" class="region-type-container">
      <h3 id="header-land" class="header-region">
        {{ landText }}
      </h3>
      <a
        id="fmi-warnings-region-content"
        :href="fromLandToNextContentHref"
        tabindex="0"
        class="fmi-warnings-to-next-content visually-hidden-focusable focus-ring"
        @click="fromLandToNextContentClicked"
        >{{ fromLandToNextContentText }}</a
      >
      <div id="accordion-group-land" class="accordion">
        <div v-for="region in regions.land" :key="region.key">
          <Region
            v-if="region.warnings.length"
            type="land"
            :code="region.key"
            :name="region.name"
            :input="region.warnings"
            :warnings="warnings"
            :theme="theme"
            :language="language" />
        </div>
      </div>
    </div>

    <div v-if="anySeaWarnings" class="region-type-container">
      <h3 id="header-sea" class="header-region">
        {{ seaText }}
      </h3>
      <a
        :id="fromSeaToNextContentId"
        href="#fmi-warnings-end-of-regions"
        tabindex="0"
        class="fmi-warnings-to-next-content visually-hidden-focusable focus-ring"
        @click="fromSeaToNextContentClicked"
        >{{ fromSeaToNextContentText }}</a
      >
      <div id="accordion-group-sea" class="accordion">
        <div v-for="region in regions.sea" :key="region.key">
          <Region
            v-if="region.warnings.length"
            type="sea"
            :code="region.key"
            :name="region.name"
            :input="region.warnings"
            :warnings="warnings"
            :theme="theme"
            :language="language" />
        </div>
      </div>
    </div>
    <div id="fmi-warnings-end-of-regions"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, toRef, getCurrentInstance } from 'vue'
import { useI18n } from '@/composables/useI18n'
import { useConfig } from '@/composables/useConfig'
import { REGION_LAND, REGION_SEA } from '@/composables/useUtils'
import Region from './Region.vue'
import type {
  RegionsData,
  WarningsMap,
  DayRegions,
  RegionListItem,
  Theme,
  Language,
} from '@/types'

// ============================================================================
// Props
// ============================================================================

const props = withDefaults(
  defineProps<{
    input?: RegionsData
    selectedDay?: number
    warnings?: WarningsMap | null
    parents?: Record<string, boolean[]>
    geometryId?: number
    theme?: Theme | string
    language?: Language
  }>(),
  {
    input: () => [],
    selectedDay: 0,
    warnings: null,
    parents: () => ({}),
    geometryId: 2021,
    theme: 'light-theme',
    language: undefined,
  }
)

// ============================================================================
// Composables
// ============================================================================

const { t } = useI18n(toRef(() => props.language))
const { geometries, coverageCriterion } = useConfig()

const instance = getCurrentInstance()

// ============================================================================
// Computed Properties
// ============================================================================

const landText = computed<string>(() => {
  return t('regionLand')
})

const seaText = computed<string>(() => {
  return t('regionSea')
})

const fromLandToNextContentText = computed<string>(() => {
  const numAreas = regions.value.land.length
  const plural = regions.value.land.length ? 's' : ''
  return `${t('warningsInAreasStart')} ${t(
    `in${numAreas}`)} ${t(
    `landArea${plural}`
  )}. ${t('toNextContent')}`
})

const fromSeaToNextContentText = computed<string>(() => {
  const numAreas = regions.value.sea.length
  const plural = regions.value.sea.length ? 's' : ''
  return `${t('warningsInAreasStart')} ${t(
    `in${numAreas}`)} ${t(
    `seaArea${plural}`
  )}. ${t('toNextContent')}`
})

const fromLandToNextContentHref = computed<string>(() => {
  return anySeaWarnings.value
    ? '#fmi-warnings-from-sea-to-next-content'
    : '#fmi-warnings-end-of-regions'
})

const fromSeaToNextContentId = computed<string>(() => {
  return anyLandWarnings.value
    ? 'fmi-warnings-from-sea-to-next-content'
    : 'fmi-warnings-region-content'
})

const regions = computed<DayRegions>(() => {
  const compareRegions = (region1: RegionListItem, region2: RegionListItem) =>
    region1.regionIndex - region2.regionIndex

  const overriddenRegions = props.parents
  const overriddenIds = Object.keys(overriddenRegions).filter(
    (regionId) => overriddenRegions[regionId]?.[props.selectedDay]
  )

  const geometryData = geometries[props.geometryId]

  return [REGION_LAND, REGION_SEA].reduce(
    (regionData, regionType) => {
      const dayData = props.input[props.selectedDay]
      if (!dayData) {
        regionData[regionType as keyof DayRegions] = []
        return regionData
      }

      regionData[regionType as keyof DayRegions] = dayData[
        regionType as keyof DayRegions
      ].reduce((filteredRegions: RegionListItem[], region) => {
        const regionGeometry = geometryData?.[region.key]
        const parentId =
          regionGeometry && 'parent' in regionGeometry
            ? regionGeometry.parent
            : ''
        if (
          !overriddenIds.includes(region.key) &&
          (!parentId || overriddenIds.includes(parentId)) &&
          region.warnings.some(
            (warning) => warning.coverage >= coverageCriterion
          )
        ) {
          filteredRegions.push(region)
        }
        return filteredRegions
      }, [])

      regionData[regionType as keyof DayRegions].sort(compareRegions)
      return regionData
    },
    { land: [], sea: [] } as DayRegions
  )
})

const anyLandWarnings = computed<boolean>(() => {
  return anyRegionWarnings('land')
})

const anySeaWarnings = computed<boolean>(() => {
  return anyRegionWarnings('sea')
})

// ============================================================================
// Methods
// ============================================================================

const anyRegionWarnings = (regionType: 'land' | 'sea'): boolean => {
  return (
    regions.value != null &&
    regions.value[regionType] != null &&
    regions.value[regionType].length > 0
  )
}

const fromLandToNextContentClicked = (): void => {
  const el = instance?.proxy?.$el as HTMLElement | undefined
  const nextContent = el?.querySelector<HTMLElement>(
    fromLandToNextContentHref.value
  )
  nextContent?.scrollIntoView()
  nextContent?.focus()
}

const fromSeaToNextContentClicked = (): void => {
  const el = instance?.proxy?.$el as HTMLElement | undefined
  const nextContent = el?.querySelector<HTMLElement>(
    '#fmi-warnings-end-of-regions'
  )
  nextContent?.scrollIntoView()
  nextContent?.focus()
}

// ============================================================================
// Expose for tests
// ============================================================================

defineExpose({
  landText,
  seaText,
  fromLandToNextContentText,
  fromSeaToNextContentText,
  fromLandToNextContentHref,
  fromSeaToNextContentId,
  regions,
  anyLandWarnings,
  anySeaWarnings,
  anyRegionWarnings,
  fromLandToNextContentClicked,
  fromSeaToNextContentClicked,
})
</script>

<style scoped lang="scss">
@import '../scss/constants.scss';

h3 {
  width: 100%;
  font-weight: bold;
  margin-top: 15px;
  margin-left: 15px;
  &.symbol-list-title {
    margin-left: -15px;
  }
  color: black;
}

h3#header-land,
h3#header-sea {
  margin-left: 0;
}

div.accordion-region {
  width: 100%;
  margin-top: 10px;
}

h3.header-region {
  text-align: left;
  font-size: $font-size;
  font-weight: bold;
  line-height: 1.1;
  margin-top: 15px;
  margin-bottom: 5px;
}

div.region-type-container {
  width: 100%;
  padding: 0;
}

div.accordion {
  margin: 0;
  border: 0.5px solid $variant-gray-darker;
  border-radius: 0;
  > * + * {
    border-top: 0.5px solid $variant-gray-darker;
  }
}
</style>

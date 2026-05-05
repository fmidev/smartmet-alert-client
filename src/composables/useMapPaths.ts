/**
 * Map paths composable
 *
 * Provides computed path data for map visualization components.
 * Extracts path-related logic from utils mixin.
 */

import { computed, ref, type Ref, type ComputedRef } from 'vue'
import type {
  WarningsMap,
  DayRegions,
  Theme,
  Severity,
  GeometryCollection,
  ThemeColorMap,
  RegionGeometry,
} from '@/types'
import { isRegionGeometry } from '@/types'
import { useConfig, REGION_LAND, REGION_SEA, REGION_LAKE } from './useConfig'

// ============================================================================
// Types
// ============================================================================

export interface PathData {
  key: string
  fill: string
  d: string
  opacity: string
  dataRegion?: string
  dataSeverity?: Severity
  strokeWidth: number | string
}

export interface BorderPath {
  key: string
  d: string
  opacity: string
  strokeWidth: number | string
}

export interface CoverageData {
  key: string
  d: string
  fillOpacity: number
  strokeWidth: number | string
  fill: string
}

export interface PathOptions {
  type: string
  severity?: Severity | null
}

export interface RegionVisualization {
  geom: RegionGeometry
  severity: Severity
  color: string
  visible: boolean
}

export interface RegionWarningItem {
  key: string
  warnings: Array<{
    type: string
    coverage: number
    identifiers: string[]
  }>
}

// ============================================================================
// Composable Options
// ============================================================================

export interface UseMapPathsOptions {
  /** Map size: 'Large' or 'Small' */
  size: Ref<'Large' | 'Small'>
  /** Day index (0-4) */
  index: Ref<number>
  /** Day regions data */
  input: Ref<DayRegions>
  /** All warnings map */
  warnings: Ref<WarningsMap | null>
  /** Currently visible warning types */
  visibleWarnings: Ref<string[]>
  /** Geometry ID */
  geometryId: Ref<number>
  /** Current theme */
  theme: Ref<Theme | string>
  /** Loading state */
  loading: Ref<boolean>
  /** Stroke width for paths */
  strokeWidth: Ref<number | string>
}

export interface UseMapPathsReturn {
  strokeColor: ComputedRef<string>
  bluePaths: ComputedRef<PathData[]>
  greenPaths: ComputedRef<PathData[]>
  yellowPaths: ComputedRef<PathData[]>
  orangePaths: ComputedRef<PathData[]>
  redPaths: ComputedRef<PathData[]>
  overlayPaths: ComputedRef<BorderPath[]>
  landBorders: ComputedRef<BorderPath[]>
  seaBorders: ComputedRef<BorderPath[]>
  yellowCoverages: ComputedRef<CoverageData[]>
  orangeCoverages: ComputedRef<CoverageData[]>
  redCoverages: ComputedRef<CoverageData[]>
  overlayCoverages: ComputedRef<CoverageData[]>
  coverageRegions: Ref<Record<string, number>>
  coverageWarnings: Ref<string[]>
  regionData: (regionId: string) => RegionWarningItem | null
  regionVisualization: (regionId: string) => RegionVisualization
}

// ============================================================================
// Composable
// ============================================================================

export function useMapPaths(options: UseMapPathsOptions): UseMapPathsReturn {
  const {
    size,
    index,
    input,
    warnings,
    visibleWarnings,
    geometryId,
    theme,
    loading,
    strokeWidth,
  } = options

  // Get config data
  const config = useConfig()
  const { geometries, colors, regionIds, coverageCriterion } = config

  // Local state for coverage tracking
  const coverageRegions = ref<Record<string, number>>({})
  const coverageWarnings = ref<string[]>([])

  // ============================================================================
  // Helper Functions
  // ============================================================================

  /**
   * Get region warning data for a specific region
   */
  function regionData(regionId: string): RegionWarningItem | null {
    const geomData = geometries as GeometryCollection
    const region = geomData?.[geometryId.value]?.[regionId]
    if (!region || !isRegionGeometry(region)) return null

    const regionType = region.type as 'land' | 'sea'
    const dayInput = input.value
    if (!dayInput) return null

    return (
      (dayInput[regionType] as RegionWarningItem[] | undefined)?.find(
        (data: RegionWarningItem) => data.key === regionId
      ) ?? null
    )
  }

  /**
   * Get severity for a region based on warnings
   */
  function regionSeverity(regionId: string): Severity {
    const geomData = geometries as GeometryCollection
    const region = regionData(regionId)
    let severity: Severity = 0

    if (region != null && warnings.value) {
      const warningsMap = warnings.value
      region.warnings.find((warning) => {
        if (visibleWarnings.value.includes(warning.type)) {
          const topIdentifier = warning.identifiers.find(
            (id) => warningsMap[id] && warningsMap[id].covRegions.size === 0
          )
          if (topIdentifier != null && warningsMap[topIdentifier]) {
            severity = warningsMap[topIdentifier].severity
            return true
          }
        }
        return false
      })
    }

    const geomEntry = geomData[geometryId.value]?.[regionId]
    const parentId = isRegionGeometry(geomEntry) ? geomEntry.parent : undefined
    if (parentId) {
      severity = Math.max(severity, regionSeverity(parentId)) as Severity
    }

    return severity
  }

  /**
   * Get visualization data for a region
   */
  function regionVisualization(regionId: string): RegionVisualization {
    const geomData = geometries as GeometryCollection
    const geomEntry = geomData[geometryId.value]?.[regionId]
    const severity = regionSeverity(regionId)

    // Return default visualization if not a valid region geometry
    if (!isRegionGeometry(geomEntry)) {
      const themeColors = colors?.[theme.value as keyof ThemeColorMap]
      return {
        geom: {
          name: regionId,
          type: 'land',
          parent: '',
          children: [],
          neighbours: [],
          weight: 0,
          center: [0, 0],
        },
        severity,
        color: themeColors?.missing || '#cccccc',
        visible: false,
      }
    }

    const geom = geomEntry
    const isLand = geom.type === REGION_LAND
    const themeColors = colors?.[theme.value as keyof ThemeColorMap]
    const color =
      severity || isLand
        ? themeColors?.levels?.[severity] || '#cccccc'
        : themeColors?.sea || '#add8e6'
    const visible = severity > 0 || geom.subType !== REGION_LAKE

    return {
      geom,
      severity,
      color,
      visible,
    }
  }

  /**
   * Get area borders (land or sea)
   */
  function areaBorders(area: 'land' | 'sea'): BorderPath[] {
    const geomData = geometries as GeometryCollection
    const pathKey = `path${size.value}` as 'pathLarge' | 'pathSmall'

    return [
      {
        key: `border.${area}`,
        d: geomData?.[geometryId.value]?.borders?.[area]?.[pathKey] || '',
        opacity: '1',
        strokeWidth: strokeWidth.value,
      },
    ]
  }

  /**
   * Generate paths for a given region type and optional severity
   */
  function paths(pathOptions: PathOptions): PathData[] {
    const geomData = geometries as GeometryCollection
    const themeColors = colors?.[theme.value as keyof ThemeColorMap]
    const pathKey = `path${size.value}` as 'pathLarge' | 'pathSmall'

    return regionIds.reduce((regions: PathData[], regionId: string) => {
      const regionEntry = geomData?.[geometryId.value]?.[regionId]
      if (!isRegionGeometry(regionEntry)) return regions

      const region = regionEntry
      if (
        region[pathKey] &&
        (region.type === pathOptions.type) === (region.subType == null)
      ) {
        const visualization = regionVisualization(regionId)
        if (
          pathOptions.severity == null ||
          visualization.severity === pathOptions.severity
        ) {
          regions.push({
            key: `${regionId}${size.value}${index.value}Path`,
            fill: loading.value
              ? themeColors?.missing || '#cccccc'
              : visualization.color,
            d: visualization.visible
              ? (visualization.geom[pathKey] as string) || ''
              : '',
            opacity: '1',
            dataRegion: regionId,
            dataSeverity: visualization.severity,
            strokeWidth:
              region.type === 'sea' && region.subType !== 'lake'
                ? strokeWidth.value
                : 0,
          })
        }
      }
      return regions
    }, [])
  }

  /**
   * Generate coverage geometry data
   */
  function coverageGeom(
    coverageProperty: 'coveragesLarge' | 'coveragesSmall',
    covStrokeWidth: number,
    fillOpacity: number,
    severity?: Severity
  ): CoverageData[] {
    const coverageData: CoverageData[] = []
    const warningsMap = warnings.value
    const themeColors = colors?.[theme.value as keyof ThemeColorMap]

    if (!warningsMap) return coverageData

    Object.keys(warningsMap).forEach((key) => {
      const warning = warningsMap[key]
      if (!warning) return

      if (
        (severity == null || warning.severity === severity) &&
        warning.effectiveDays[index.value] &&
        visibleWarnings.value.includes(warning.type) &&
        warning.coveragesLarge.length > 0
      ) {
        if (!coverageWarnings.value.includes(key)) {
          ;[...warning.covRegions.keys()].forEach((covRegion) => {
            const covValue = warning.covRegions.get(covRegion)
            if (
              (coverageRegions.value[covRegion] == null ||
                coverageRegions.value[covRegion] < warning.severity) &&
              covValue != null &&
              covValue >= coverageCriterion
            ) {
              coverageRegions.value[covRegion] = warning.severity
            }
          })
          coverageWarnings.value.push(key)
        }
        warning[coverageProperty].forEach(
          (coverage: { path: string; reference: number[] }) => {
            coverageData.push({
              key: `${key}${size.value}${index.value}${fillOpacity}Coverage`,
              d: coverage.path,
              fillOpacity,
              strokeWidth: covStrokeWidth,
              fill: themeColors?.levels?.[warning.severity] || '#cccccc',
            })
          }
        )
      }
    })

    return coverageData
  }

  // ============================================================================
  // Computed Properties
  // ============================================================================

  const strokeColor = computed<string>(() => {
    return (
      colors?.[theme.value as keyof ThemeColorMap]?.stroke ?? 'DarkSlateGray'
    )
  })

  const bluePaths = computed<PathData[]>(() => {
    return paths({ type: REGION_SEA })
  })

  const greenPaths = computed<PathData[]>(() => {
    return paths({ type: REGION_LAND, severity: 0 })
  })

  const yellowPaths = computed<PathData[]>(() => {
    return paths({ type: REGION_LAND, severity: 2 })
  })

  const orangePaths = computed<PathData[]>(() => {
    return paths({ type: REGION_LAND, severity: 3 })
  })

  const redPaths = computed<PathData[]>(() => {
    return paths({ type: REGION_LAND, severity: 4 })
  })

  const overlayPaths = computed<BorderPath[]>(() => {
    const geomData = geometries as GeometryCollection
    const pathKey = `path${size.value}` as 'pathLarge' | 'pathSmall'

    return regionIds.reduce((regions: BorderPath[], regionId: string) => {
      const regionEntry = geomData?.[geometryId.value]?.[regionId]
      if (!isRegionGeometry(regionEntry)) return regions

      const region = regionEntry
      if (
        region[pathKey] &&
        (region.type === 'land' || region.subType === 'lake')
      ) {
        const visualization = regionVisualization(regionId)
        regions.push({
          key: `${regionId}${size.value}${index.value}Overlay`,
          d: visualization.visible
            ? (visualization.geom[pathKey] as string) || ''
            : '',
          opacity: '1',
          strokeWidth: strokeWidth.value,
        })
      }
      return regions
    }, [])
  })

  const landBorders = computed<BorderPath[]>(() => {
    return areaBorders('land')
  })

  const seaBorders = computed<BorderPath[]>(() => {
    return areaBorders('sea')
  })

  const yellowCoverages = computed<CoverageData[]>(() => {
    return coverageGeom(
      `coverages${size.value}` as 'coveragesLarge' | 'coveragesSmall',
      0,
      1,
      2
    )
  })

  const orangeCoverages = computed<CoverageData[]>(() => {
    return coverageGeom(
      `coverages${size.value}` as 'coveragesLarge' | 'coveragesSmall',
      0,
      1,
      3
    )
  })

  const redCoverages = computed<CoverageData[]>(() => {
    return coverageGeom(
      `coverages${size.value}` as 'coveragesLarge' | 'coveragesSmall',
      0,
      1,
      4
    )
  })

  const overlayCoverages = computed<CoverageData[]>(() => {
    return coverageGeom(
      `coverages${size.value}` as 'coveragesLarge' | 'coveragesSmall',
      1.1 * Number(strokeWidth.value),
      0
    )
  })

  return {
    strokeColor,
    bluePaths,
    greenPaths,
    yellowPaths,
    orangePaths,
    redPaths,
    overlayPaths,
    landBorders,
    seaBorders,
    yellowCoverages,
    orangeCoverages,
    redCoverages,
    overlayCoverages,
    coverageRegions,
    coverageWarnings,
    regionData,
    regionVisualization,
  }
}

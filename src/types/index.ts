/**
 * SmartMet Alert Client Type Definitions
 */

// ============================================================================
// Language & Localization
// ============================================================================

export type Language = 'fi' | 'sv' | 'en'

export interface LocalizedText {
  fi?: string
  sv?: string
  en?: string
}

// ============================================================================
// Theme
// ============================================================================

export type Theme =
  | 'light-theme'
  | 'dark-theme'
  | 'light-gray-theme'
  | 'dark-gray-theme'

export interface ThemeColors {
  sea: string
  levels: [string, string, string, string, string]
  missing: string
  stroke: string
}

export type ThemeColorMap = Record<Theme, ThemeColors>

// ============================================================================
// Warning Types
// ============================================================================

export type WarningType =
  | 'thunderStorm'
  | 'wind'
  | 'rain'
  | 'trafficWeather'
  | 'pedestrianSafety'
  | 'forestFireWeather'
  | 'grassFireWeather'
  | 'hotWeather'
  | 'coldWeather'
  | 'uvNote'
  | 'floodLevel'
  | 'seaWind'
  | 'seaThunderStorm'
  | 'seaWaterHeightHighWater'
  | 'seaWaterHeightShallowWater'
  | 'seaWaveHeight'
  | 'seaIcing'
  | 'multiple'

export type RegionType = 'land' | 'sea'
export type RegionSubType = 'lake'

export type Severity = 0 | 1 | 2 | 3 | 4

export interface CoverageData {
  path: string
  reference: [number, number] | []
}

export interface Warning {
  type: WarningType | string
  id: string
  regions: Record<string, boolean>
  covRegions: Map<string, number>
  coveragesLarge: CoverageData[]
  coveragesSmall: CoverageData[]
  effectiveFrom: string
  effectiveUntil: string
  effectiveDays: boolean[]
  validInterval: string
  validIntervalAriaLabel: string
  severity: Severity
  direction: number
  value: number
  text: string
  info: LocalizedText
  link: string
  linkText: string
  dailyWarning?: boolean
}

export type WarningsMap = Record<string, Warning>

// ============================================================================
// Day Types
// ============================================================================

export interface Day {
  weekdayName: string
  day: number
  month: number
  year: number
  severity: Severity
  updatedDate: string
  updatedTime: string
}

// ============================================================================
// Region Types
// ============================================================================

export interface RegionGeometry {
  name: string
  type: RegionType
  subType?: RegionSubType
  parent: string
  children: string[]
  neighbours: string[]
  weight: number
  center: [number, number]
  pathLarge?: string
  pathSmall?: string
  align?: 'left' | 'right'
}

export interface BorderPaths {
  pathLarge: string
  pathSmall: string
}

export interface Borders {
  land: BorderPaths
  sea: BorderPaths
}

export interface GeometryData {
  [regionId: string]: RegionGeometry | Borders | undefined
  borders: Borders
}

// Type guard to check if a geometry entry is a RegionGeometry (not Borders)
export function isRegionGeometry(
  geom: RegionGeometry | Borders | undefined
): geom is RegionGeometry {
  return geom != null && 'type' in geom && typeof geom.type === 'string'
}

export interface GeometryCollection {
  [year: string]: GeometryData
}

export interface RegionWarningItem {
  type: WarningType | string
  identifiers: string[]
  coverage: number
}

export interface RegionListItem {
  key: string
  regionIndex: number
  name: string
  warnings: RegionWarningItem[]
}

export interface DayRegions {
  land: RegionListItem[]
  sea: RegionListItem[]
}

export type RegionsData = DayRegions[]

// ============================================================================
// Legend Types
// ============================================================================

export interface LegendItem {
  type: WarningType | string
  severity: Severity
  visible: boolean
}

// ============================================================================
// Warning Icon Types
// ============================================================================

export interface WarningIcon {
  aspectRatio: [number, number]
  scale: number
  geom?: string
}

export interface WarningIconInput {
  type: WarningType | string
  severity: Severity
  direction?: number
  text?: string
}

export interface PopupRowInput extends WarningIconInput {
  interval: string
}

// ============================================================================
// Map Path Types
// ============================================================================

export interface PathData {
  key: string
  d: string
  opacity: string
  strokeWidth: number
  fill?: string
  fillOpacity?: number
}

// ============================================================================
// GeoJSON Types
// ============================================================================

export type GeoJSONCoordinate = [number, number]
export type GeoJSONCoordinates = GeoJSONCoordinate[]
export type GeoJSONPolygonCoordinates = GeoJSONCoordinates[]
export type GeoJSONMultiPolygonCoordinates = GeoJSONPolygonCoordinates[]

export interface GeoJSONPoint {
  type: 'Point'
  coordinates: GeoJSONCoordinate
}

export interface GeoJSONMultiPoint {
  type: 'MultiPoint'
  coordinates: GeoJSONCoordinates
}

export interface GeoJSONLineString {
  type: 'LineString'
  coordinates: GeoJSONCoordinates
}

export interface GeoJSONMultiLineString {
  type: 'MultiLineString'
  coordinates: GeoJSONCoordinates[]
}

export interface GeoJSONPolygon {
  type: 'Polygon'
  coordinates: GeoJSONPolygonCoordinates
}

export interface GeoJSONMultiPolygon {
  type: 'MultiPolygon'
  coordinates: GeoJSONMultiPolygonCoordinates
}

export interface GeoJSONGeometryCollection {
  type: 'GeometryCollection'
  geometries: GeoJSONGeometry[]
}

export type GeoJSONGeometry =
  | GeoJSONPoint
  | GeoJSONMultiPoint
  | GeoJSONLineString
  | GeoJSONMultiLineString
  | GeoJSONPolygon
  | GeoJSONMultiPolygon
  | GeoJSONGeometryCollection

export interface GeoJSONFeature {
  type: 'Feature'
  id?: string
  geometry: GeoJSONGeometry | null
  geometry_name?: string
  properties: Record<string, unknown>
}

export interface GeoJSONCRS {
  type: string
  properties: {
    name: string
  }
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection'
  features: GeoJSONFeature[]
  totalFeatures?: number
  crs?: GeoJSONCRS
}

// ============================================================================
// API Response Types
// ============================================================================

export interface WarningsData {
  weather_update_time?: GeoJSONFeatureCollection
  flood_update_time?: GeoJSONFeatureCollection
  weather_finland_active_all?: GeoJSONFeatureCollection
  flood_finland_active_all?: GeoJSONFeatureCollection
}

// Alias for API response (same as WarningsData, used for prop typing)
export type WarningsDataResponse = WarningsData

export interface WeatherWarningProperties {
  identifier: string
  reference: string
  coverage_references?: string
  severity: string
  warning_context: string
  context_extension?: string
  effective_from: string
  effective_until: string
  physical_direction?: number
  physical_value?: number
  info_fi?: string
  info_sv?: string
  info_en?: string
  representative_x?: number
  representative_y?: number
  update_time?: string
}

export interface FloodWarningProperties {
  identifier: string
  reference: string
  severity: string
  onset: string
  expires: string
  description?: string
  language: string
}

// ============================================================================
// Processed Data Types
// ============================================================================

export interface ProcessedWarningsResult {
  warnings: WarningsMap
  days: Day[]
  regions: RegionsData
  parents: Record<string, boolean[]>
  legend: LegendItem[]
}

// ============================================================================
// Component Props Types
// ============================================================================

export interface AlertClientProps {
  refreshInterval?: number
  defaultDay?: number
  staticDays?: boolean
  startFrom?: 'updated' | ''
  regionListEnabled?: boolean
  grayScaleSelector?: boolean
  currentTime?: number
  warningsData?: WarningsData | null
  dailyWarningTypes?: string[]
  geometryId?: number
  language?: Language
  theme?: Theme
  loading?: number
  sleep?: boolean
  spinnerEnabled?: boolean
}

export interface DaysProps {
  input: Day[]
  visibleWarnings: string[]
  selectedDay: number
  staticDays: boolean
  timeOffset: number
  warnings: WarningsMap | null
  regions: RegionsData
  geometryId: number
  loading: boolean
  theme: Theme
  language: Language
  spinnerEnabled?: boolean
}

export interface LegendProps {
  input: LegendItem[]
  visibleWarnings: string[]
  grayScaleSelector: boolean
  theme: Theme
  language: Language
}

export interface RegionsProps {
  input: RegionsData
  selectedDay: number
  warnings: WarningsMap | null
  parents: Record<string, boolean[]>
  geometryId: number
  theme: Theme
  language: Language
}

export interface WarningProps {
  input: WarningIconInput
  language: Language
  theme: Theme
}

export interface DayLargeProps {
  input: Day
  index: number
  visibleWarnings: string[]
  selectedDay: number
  warnings: WarningsMap | null
  regions: RegionsData
  geometryId: number
  theme: Theme
  language: Language
}

export interface DaySmallProps extends DayLargeProps {
  staticDays: boolean
  timeOffset: number
}

export interface MapLargeProps {
  input: DayRegions
  index: number
  visibleWarnings: string[]
  warnings: WarningsMap | null
  geometryId: number
  theme: Theme
  language: Language
}

export interface MapSmallProps extends MapLargeProps {}

// ============================================================================
// Time Utilities
// ============================================================================

export interface TimeZoneMoment {
  year: number
  month: number
  day: number
  weekday: string
  hour: number
  minute: number
  second: number
  millisecond: number
  timeZone: string
  timeZoneName?: string
}

// ============================================================================
// Bounds & Transform (for GeoJSON SVG conversion)
// ============================================================================

export interface BoundsData {
  xmin: number
  ymin: number
  xmax: number
  ymax: number
}

export interface TransformData {
  mx: number
  my: number
  bx: number
  by: number
}

// ============================================================================
// Constants
// ============================================================================

export const NUMBER_OF_DAYS = 5 as const

export const WARNING_LEVELS = [
  'level-1',
  'level-2',
  'level-3',
  'level-4',
] as const
export type WarningLevel = (typeof WARNING_LEVELS)[number]

export const FLOOD_LEVELS = {
  minor: 1,
  moderate: 2,
  severe: 3,
  extreme: 4,
} as const
export type FloodLevel = keyof typeof FLOOD_LEVELS

// ============================================================================
// Key Codes (for keyboard navigation)
// ============================================================================

export const KEY_CODES = {
  END: 35,
  HOME: 36,
  LEFT: 37,
  RIGHT: 39,
} as const

// ============================================================================
// Global declarations
// ============================================================================

declare global {
  const __APP_VERSION__: string
}

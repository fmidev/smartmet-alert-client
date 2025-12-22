/**
 * Core composable for AlertClient wrapper components.
 * Contains shared logic for both web component (App.vue) and Vue component (AlertClientVue.vue).
 *
 * This composable provides:
 * - Reactive state management (loading, warningsData, themeClass, etc.)
 * - Computed properties for API queries
 * - Methods for fetching warnings and handling events
 *
 * Components using this composable must provide:
 * - Props with appropriate types
 */
import { ref, computed, type Ref, type ComputedRef } from 'vue'
import crossFetch from 'cross-fetch'
import type { Language, WarningsData } from '@/types'

// ============================================================================
// Helper Functions (exported for use in components)
// ============================================================================

/**
 * Normalize string|boolean to boolean
 */
export const toBool = (val: unknown, defaultVal = true): boolean => {
  if (typeof val === 'boolean') return val
  if (typeof val === 'string') return val.toLowerCase() !== 'false'
  return defaultVal
}

/**
 * Normalize string|number to number
 */
export const toNum = (val: unknown, defaultVal = 0): number => {
  if (typeof val === 'number') return val
  if (typeof val === 'string') return Number(val)
  return defaultVal
}

// ============================================================================
// Types
// ============================================================================

export interface UseAlertClientOptions {
  /** Base URL for API requests */
  baseUrl: Ref<string> | ComputedRef<string>
  /** Language code */
  language: Ref<Language> | ComputedRef<Language>
  /** Theme name */
  theme: Ref<string> | ComputedRef<string>
  /** Pre-loaded warnings data (optional) */
  warnings?:
    | Ref<WarningsData | string | null>
    | ComputedRef<WarningsData | string | null>
  /** Current date for time calculations (optional) */
  currentDate?: Ref<Date | string | null> | ComputedRef<Date | string | null>
  /** Font scale factor (optional) */
  fontScale?: Ref<number | string> | ComputedRef<number | string>
  /** Debug mode (optional) */
  debugMode?: Ref<boolean> | ComputedRef<boolean>
  /** Custom weather updated query (optional) */
  weatherUpdated?: Ref<string> | ComputedRef<string>
  /** Custom flood updated query (optional) */
  floodUpdated?: Ref<string> | ComputedRef<string>
  /** Custom weather warnings query (optional) */
  weatherWarnings?: Ref<string> | ComputedRef<string>
  /** Custom flood warnings query (optional) */
  floodWarnings?: Ref<string> | ComputedRef<string>
}

export interface UseAlertClientReturn {
  // State
  loading: Ref<number>
  updatedAt: Ref<number | null>
  refreshedAt: Ref<number | null>
  themeClass: Ref<string>
  warningsData: Ref<WarningsData | null>
  visible: Ref<boolean>

  // Computed
  currentTime: ComputedRef<number>
  weatherUpdatedQuery: ComputedRef<string>
  floodUpdatedQuery: ComputedRef<string>
  weatherWarningsQuery: ComputedRef<string>
  floodWarningsQuery: ComputedRef<string>

  // Methods
  onLoaded: (loaded: number) => void
  onThemeChanged: (newTheme: string | null) => void
  fetchWarnings: () => Promise<void> | undefined
  show: () => void
  hide: () => void
  initializeWarnings: () => void
  applyFontScale: () => void
}

// ============================================================================
// Constants
// ============================================================================

const WEATHER_UPDATED_TYPE = 'weather_update_time'
const FLOOD_UPDATED_TYPE = 'flood_update_time'
const WEATHER_WARNINGS_TYPE = 'weather_finland_active_all'
const FLOOD_WARNINGS_TYPE = 'flood_finland_active_all'
const FLOOD_SUPPORTED_SEVERITIES = ['moderate', 'severe', 'extreme'] as const

const QUERY_PREFIX =
  '?service=WFS&version=1.0.0&request=GetFeature&maxFeatures=1000&outputFormat=application%2Fjson&typeName='

// ============================================================================
// Composable
// ============================================================================

export function useAlertClient(
  options: UseAlertClientOptions
): UseAlertClientReturn {
  const {
    baseUrl,
    language,
    theme,
    warnings,
    currentDate,
    fontScale,
    debugMode,
    weatherUpdated,
    floodUpdated,
    weatherWarnings,
    floodWarnings,
  } = options

  // -------------------------------------------------------------------------
  // Reactive State
  // -------------------------------------------------------------------------

  const loading = ref<number>(1)
  const updatedAt = ref<number | null>(null)
  const refreshedAt = ref<number | null>(null)
  const themeClass = ref<string>(`${theme.value}-theme`)
  const warningsData = ref<WarningsData | null>(null)
  const visible = ref<boolean>(true)

  // -------------------------------------------------------------------------
  // Helper: CAP Language mapping
  // -------------------------------------------------------------------------

  const capLanguageMap: Record<Language, string> = {
    fi: 'fi-FI',
    sv: 'sv-SV',
    en: 'en-US',
  }

  const getCapLanguage = (): string => capLanguageMap[language.value] || 'fi-FI'

  // -------------------------------------------------------------------------
  // Computed: Flood filter
  // -------------------------------------------------------------------------

  const floodFilter = computed<string>(() => {
    const severityFilter = FLOOD_SUPPORTED_SEVERITIES.reduce(
      (filter, severity, index) =>
        `${filter}${index === 0 ? '' : ','}%27${severity.toUpperCase()}%27`,
      '&cql_filter=severity%20IN%20('
    )
    return `${severityFilter})%20AND%20language=%27${getCapLanguage()}%27`
  })

  // -------------------------------------------------------------------------
  // Computed: Query URLs
  // -------------------------------------------------------------------------

  const weatherUpdatedQuery = computed<string>(() => {
    return weatherUpdated?.value || `${QUERY_PREFIX}${WEATHER_UPDATED_TYPE}`
  })

  const floodUpdatedQuery = computed<string>(() => {
    return floodUpdated?.value || `${QUERY_PREFIX}${FLOOD_UPDATED_TYPE}`
  })

  const weatherWarningsQuery = computed<string>(() => {
    return weatherWarnings?.value || `${QUERY_PREFIX}${WEATHER_WARNINGS_TYPE}`
  })

  const floodWarningsQuery = computed<string>(() => {
    return (
      floodWarnings?.value ||
      `${QUERY_PREFIX}${FLOOD_WARNINGS_TYPE}${floodFilter.value}`
    )
  })

  // -------------------------------------------------------------------------
  // Computed: Current time
  // -------------------------------------------------------------------------

  const currentTime = computed<number>(() => {
    if (refreshedAt.value) {
      return refreshedAt.value
    }
    if (currentDate?.value) {
      const date =
        currentDate.value instanceof Date
          ? currentDate.value
          : new Date(currentDate.value)
      return date.getTime()
    }
    return Date.now()
  })

  // -------------------------------------------------------------------------
  // Methods
  // -------------------------------------------------------------------------

  /**
   * Initialize warnings from pre-loaded data (call in created/setup)
   */
  const initializeWarnings = (): void => {
    if (warnings?.value) {
      warningsData.value =
        typeof warnings.value === 'string'
          ? JSON.parse(warnings.value)
          : warnings.value
    }
  }

  /**
   * Apply font scale to document (call in onMounted)
   */
  const applyFontScale = (): void => {
    const fontScaleNum = toNum(fontScale?.value, 1)
    if (fontScaleNum !== 1) {
      let originalFontSize: number | undefined

      if (
        typeof window !== 'undefined' &&
        typeof document !== 'undefined' &&
        document.documentElement &&
        window.getComputedStyle
      ) {
        const htmlElement = document.documentElement
        const computedStyle = window.getComputedStyle(htmlElement)
        originalFontSize = parseFloat(computedStyle.fontSize)
      }

      if (originalFontSize == null || Number.isNaN(originalFontSize)) {
        originalFontSize = 16 // Fallback
      }

      const scaledFontSize = fontScaleNum * originalFontSize
      const newFontSize = Math.round(scaledFontSize * 100) / 100
      document.documentElement.style.fontSize = `${newFontSize}px`
    }
  }

  /**
   * Handle loaded event from child component
   */
  const onLoaded = (loaded: number): void => {
    if (loaded !== 0) {
      loading.value = loaded === -1 ? -1 : 0
    }
  }

  /**
   * Handle theme change
   */
  const onThemeChanged = (newTheme: string | null): void => {
    themeClass.value = `${
      newTheme != null && newTheme.length > 0 ? newTheme : theme.value
    }-theme`
  }

  /**
   * Fetch warnings from API
   */
  const fetchWarnings = (): Promise<void> | undefined => {
    if (warnings?.value) {
      return
    }

    loading.value = 1

    if (debugMode?.value) {
      console.log(`Updating warnings at ${new Date()}`)
    }

    const queries = new Map<string, string>([
      [`${baseUrl.value}${weatherUpdatedQuery.value}`, WEATHER_UPDATED_TYPE],
      [`${baseUrl.value}${floodUpdatedQuery.value}`, FLOOD_UPDATED_TYPE],
      [`${baseUrl.value}${weatherWarningsQuery.value}`, WEATHER_WARNINGS_TYPE],
      [`${baseUrl.value}${floodWarningsQuery.value}`, FLOOD_WARNINGS_TYPE],
    ])

    const responseData: Record<string, unknown> = {}

    return Promise.allSettled(
      [...queries.keys()].map(async (queryUrl) =>
        crossFetch(queryUrl).then((response) =>
          response
            .json()
            .then((json: unknown) => {
              const currentTimeMs = Date.now()
              if (updatedAt.value != null) {
                refreshedAt.value = currentTimeMs
              }
              updatedAt.value = currentTimeMs
              responseData[queries.get(queryUrl)!] = json
            })
            .catch((error: Error) => {
              loading.value = -1
              console.log(error)
            })
        )
      )
    ).then(() => {
      warningsData.value = responseData as WarningsData
    })
  }

  /**
   * Show the component
   */
  const show = (): void => {
    visible.value = true
  }

  /**
   * Hide the component
   */
  const hide = (): void => {
    visible.value = false
  }

  // -------------------------------------------------------------------------
  // Return
  // -------------------------------------------------------------------------

  return {
    // State
    loading,
    updatedAt,
    refreshedAt,
    themeClass,
    warningsData,
    visible,

    // Computed
    currentTime,
    weatherUpdatedQuery,
    floodUpdatedQuery,
    weatherWarningsQuery,
    floodWarningsQuery,

    // Methods
    onLoaded,
    onThemeChanged,
    fetchWarnings,
    show,
    hide,
    initializeWarnings,
    applyFontScale,
  }
}

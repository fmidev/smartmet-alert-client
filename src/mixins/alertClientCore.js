/**
 * Core mixin for AlertClient wrapper components.
 * Contains shared logic for both web component (App.vue) and Vue component (AlertClientVue.vue).
 *
 * This mixin provides:
 * - Data state management (loading, warningsData, themeClass, etc.)
 * - Computed properties for API queries
 * - Lifecycle hooks (created, mounted, serverPrefetch)
 * - Methods for fetching warnings and handling events
 *
 * Components using this mixin must provide:
 * - Props with appropriate types (string-only for web components, mixed for Vue)
 * - Normalized computed properties that convert props to correct types
 */
import fetch from 'cross-fetch'

// Helper to normalize string|boolean to boolean
export const toBool = (val, defaultVal = true) => {
  if (typeof val === 'boolean') return val
  if (typeof val === 'string') return val.toLowerCase() !== 'false'
  return defaultVal
}

// Helper to normalize string|number to number
export const toNum = (val, defaultVal = 0) => {
  if (typeof val === 'number') return val
  if (typeof val === 'string') return Number(val)
  return defaultVal
}

export default {
  data() {
    return {
      loading: 1,
      updatedAt: null,
      refreshedAt: null,
      themeClass: `${this.theme}-theme`,
      warningsData: null,
      visible: true,
    }
  },
  computed: {
    // API query type names
    weatherUpdatedType() {
      return 'weather_update_time'
    },
    floodUpdatedType() {
      return 'flood_update_time'
    },
    weatherWarningsType() {
      return 'weather_finland_active_all'
    },
    floodWarningsType() {
      return 'flood_finland_active_all'
    },

    // Query builders
    weatherUpdatedQuery() {
      return this.weatherUpdated || `${this.query}${this.weatherUpdatedType}`
    },
    floodUpdatedQuery() {
      return this.floodUpdated || `${this.query}${this.floodUpdatedType}`
    },
    weatherWarningsQuery() {
      return this.weatherWarnings || `${this.query}${this.weatherWarningsType}`
    },
    floodWarningsQuery() {
      return (
        this.floodWarnings ||
        `${this.query}${this.floodWarningsType}${this.floodFilter}`
      )
    },
    query() {
      return '?service=WFS&version=1.0.0&request=GetFeature&maxFeatures=1000&outputFormat=application%2Fjson&typeName='
    },
    floodSupportedSeverities() {
      return ['moderate', 'severe', 'extreme']
    },
    floodFilter() {
      return `${this.floodSupportedSeverities.reduce(
        (filter, severity, index) =>
          `${filter + (index === 0 ? '' : ',')}%27${severity.toUpperCase()}%27`,
        '&cql_filter=severity%20IN%20('
      )})%20AND%20language=%27${this.capLanguage()}%27`
    },
    capLanguage() {
      return () =>
        ({
          fi: 'fi-FI',
          sv: 'sv-SV',
          en: 'en-US',
        })[this.language]
    },

    // Current time calculation
    currentTime() {
      if (this.refreshedAt) {
        return this.refreshedAt
      }
      if (this.currentDate) {
        const date =
          this.currentDate instanceof Date
            ? this.currentDate
            : new Date(this.currentDate)
        return date.getTime()
      }
      return Date.now()
    },
  },
  created() {
    if (this.warnings) {
      this.warningsData =
        typeof this.warnings === 'string'
          ? JSON.parse(this.warnings)
          : this.warnings
    }
  },
  mounted() {
    const fontScaleNum = toNum(this.fontScale, 1)
    if (fontScaleNum !== 1) {
      let originalFontSize
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
  },
  serverPrefetch() {
    if (!this.warnings) {
      return this.fetchWarnings()
    }
  },
  methods: {
    onLoaded(loaded) {
      if (loaded !== 0) {
        this.loading = loaded === -1 ? -1 : 0
      }
    },
    onThemeChanged(newTheme) {
      this.themeClass = `${
        newTheme != null && newTheme.length > 0 ? newTheme : this.theme
      }-theme`
    },
    fetchWarnings() {
      if (this.warnings) {
        return
      }
      this.loading = 1
      // debugModeNormalized is provided by the component using this mixin
      if (this.debugModeNormalized) {
        console.log(`Updating warnings at ${new Date()}`)
      }
      const queries = new Map()
        .set(
          `${this.baseUrl}${this.weatherUpdatedQuery}`,
          this.weatherUpdatedType
        )
        .set(`${this.baseUrl}${this.floodUpdatedQuery}`, this.floodUpdatedType)
        .set(
          `${this.baseUrl}${this.weatherWarningsQuery}`,
          this.weatherWarningsType
        )
        .set(
          `${this.baseUrl}${this.floodWarningsQuery}`,
          this.floodWarningsType
        )
      const responseData = {}
      return Promise.allSettled(
        [...queries.keys()].map(async (query) =>
          fetch(query).then((response) =>
            response
              .json()
              .then((json) => {
                const currentTime = Date.now()
                if (this.updatedAt != null) {
                  this.refreshedAt = currentTime
                }
                this.updatedAt = currentTime
                responseData[queries.get(query)] = json
              })
              .catch((error) => {
                this.loading = -1
                console.log(error)
              })
          )
        )
      ).then(() => {
        this.warningsData = responseData
      })
    },
    show() {
      this.visible = true
    },
    hide() {
      this.visible = false
    },
  },
}

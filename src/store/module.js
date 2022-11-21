import {
  SET_INITIALIZED,
  SET_LOADING,
  SET_SELECTED_DAY,
  SET_THEME,
  SET_TIME_OFFSET,
  SET_VISIBLE_WARNINGS,
  SET_WARNING_VISIBILITY,
  SET_WARNINGS,
} from './mutation-types'

export default {
  state: () => ({
    loading: false,
    initialized: false,
    timeOffset: 0,
    selectedDay: 0,
    warnings: null,
    visibleWarnings: [],
    theme: '',
  }),
  getters: {
    loading: (state) => (state != null ? state.loading : false),
    initialized: (state) => (state != null ? state.initialized : false),
    timeOffset: (state) => (state != null ? state.timeOffset : 0),
    selectedDay: (state) => (state != null ? state.selectedDay : 0),
    warnings: (state) => (state != null ? state.warnings : {}),
    visibleWarnings: (state) => (state != null ? state.visibleWarnings : []),
    theme: (state) => (state != null ? state.theme : ''),
  },
  mutations: {
    [SET_LOADING]: (state, loading) => {
      if (state != null) {
        state.loading = loading
      }
    },
    [SET_INITIALIZED]: (state, initialized) => {
      if (state != null) {
        state.initialized = initialized
      }
    },
    [SET_TIME_OFFSET]: (state, timeOffset) => {
      if (state != null) {
        state.timeOffset = timeOffset
      }
    },
    [SET_SELECTED_DAY]: (state, selectedDay) => {
      if (state != null) {
        state.selectedDay = selectedDay
      }
    },
    [SET_WARNINGS]: (state, warnings) => {
      if (state != null) {
        state.warnings = warnings
      }
    },
    [SET_VISIBLE_WARNINGS]: (state, visibleWarnings) => {
      if (state != null) {
        state.visibleWarnings = visibleWarnings
      }
    },
    [SET_WARNING_VISIBILITY]: (state, { warning, visible }) => {
      if (state != null) {
        if (visible && !state.visibleWarnings.includes(warning)) {
          state.visibleWarnings.push(warning)
        } else if (!visible) {
          state.visibleWarnings = state.visibleWarnings.filter(
            (visibleWarningType) => visibleWarningType !== warning
          )
        }
      }
    },
    [SET_THEME]: (state, theme) => {
      if (state != null) {
        state.theme = theme
      }
    },
  },
  actions: {
    setLoading({ commit }, loading) {
      commit(SET_LOADING, loading)
    },
    setInitialized({ commit }, initialized) {
      commit(SET_INITIALIZED, initialized)
    },
    setTimeOffset({ commit }, timeOffset) {
      commit(SET_TIME_OFFSET, timeOffset)
    },
    setSelectedDay({ commit }, selectedDay) {
      commit(SET_SELECTED_DAY, selectedDay)
    },
    setWarnings({ commit }, warnings) {
      commit(SET_WARNINGS, warnings)
    },
    setVisibleWarnings({ commit }, visibleWarnings) {
      commit(SET_VISIBLE_WARNINGS, visibleWarnings)
    },
    setWarningVisibility({ commit }, { warning, visible }) {
      commit(SET_WARNING_VISIBILITY, {
        warning,
        visible,
      })
    },
    setTheme({ commit }, theme) {
      commit(SET_THEME, theme)
    },
  },
}

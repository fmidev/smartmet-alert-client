import {
  SET_CURRENT_TIME,
  SET_SELECTED_DAY,
  SET_WARNINGS,
  SET_VISIBLE_WARNINGS,
  SET_WARNING_VISIBILITY,
} from './mutation-types';

export default {
  state: () => ({
    selectedDay: 0,
    currentTime: null,
    warnings: {},
    visibleWarnings: [],
  }),
  getters: {
    selectedDay: (state) => state.selectedDay,
    currentTime: (state) => state.currentTime,
    warnings: (state) => state.warnings,
    visibleWarnings: (state) => state.visibleWarnings,
  },
  mutations: {
    [SET_CURRENT_TIME]: (state, currentTime) => {
      state.currentTime = currentTime;
    },
    [SET_SELECTED_DAY]: (state, selectedDay) => {
      state.selectedDay = selectedDay;
    },
    [SET_WARNINGS]: (state, warnings) => {
      state.warnings = warnings;
    },
    [SET_VISIBLE_WARNINGS]: (state, visibleWarnings) => {
      state.visibleWarnings = visibleWarnings;
    },
    [SET_WARNING_VISIBILITY]: (state, { warning, visible }) => {
      if (visible && !state.visibleWarnings.includes(warning)) {
        state.visibleWarnings.push(warning);
      } else if (!visible) {
        state.visibleWarnings =
          state.visibleWarnings.filter(
            (visibleWarningType) => visibleWarningType !== warning,
          );
      }
    },
  },
  actions: {},
};

import {
  SET_CURRENT_TIME,
  SET_SELECTED_DAY,
  SET_WARNINGS,
  SET_VISIBLE_WARNINGS,
  SET_WARNING_VISIBILITY,
  SET_OVERRIDDEN_REGION,
  SET_OVERRIDDEN_REGIONS,
} from './mutation-types';

export default {
  state: () => ({
    selectedDay: 0,
    currentTime: null,
    warnings: {},
    visibleWarnings: [],
    overriddenRegions: {},
  }),
  getters: {
    selectedDay: (state) => state.selectedDay,
    currentTime: (state) => state.currentTime,
    warnings: (state) => state.warnings,
    visibleWarnings: (state) => state.visibleWarnings,
    overriddenRegions: (state) => state.overriddenRegions,
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
    [SET_OVERRIDDEN_REGION]: (state, { region, overridden }) => {
      if (state.overriddenRegions[region] == null) {
        state.overriddenRegions[region] = [false, false, false, false, false];
      }
      overridden.forEach((override, index) => {
        if (override) {
          state.overriddenRegions[region][index] = true;
        }
      });
    },
    [SET_OVERRIDDEN_REGIONS]: (state, overriddenRegions) => {
      state.overriddenRegions = overriddenRegions;
    },
  },
  actions: {
    setCurrentTime({ commit }, currentTime) {
      commit(SET_CURRENT_TIME, currentTime);
    },
    setSelectedDay({ commit }, selectedDay) {
      commit(SET_SELECTED_DAY, selectedDay);
    },
    setWarnings({ commit }, warnings) {
      commit(SET_WARNINGS, warnings);
    },
    setVisibleWarnings({ commit }, visibleWarnings) {
      commit(SET_VISIBLE_WARNINGS, visibleWarnings);
    },
    setWarningVisibility({ commit }, { warning, visible }) {
      commit(SET_WARNING_VISIBILITY, { warning, visible });
    },
    setOverriddenRegion({ commit }, { region, overridden }) {
      commit(SET_OVERRIDDEN_REGION, { region, overridden });
    },
    clearWarnings({ commit }) {
      commit(SET_WARNINGS, {});
      commit(SET_OVERRIDDEN_REGIONS, {});
    },
  },
};

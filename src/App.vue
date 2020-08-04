<template>
    <AlertClient @update-warnings="fetchWarnings" :currentTime="currentTime" :refreshInterval="refreshInterval" :selectedDay="selectedDay" :warnings="warnings" :days="days" :regions="regions" :legend="legend" :language="language" /></template>
<script>
import { BootstrapVue } from 'bootstrap-vue';
import Vue from 'vue';
import axios from 'axios';
import utils from './mixins/utils';
import AlertClient from './components/AlertClient.vue';
import store from './store';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

Vue.use(BootstrapVue);

Vue.prototype.$store = store;

export default {
  name: 'App',
  components: {
    AlertClient,
  },
  mixins: [utils],
  data() {
    return {
      currentTime: Date.now(),
      refreshInterval: 1000 * 60 * 15,
      selectedDay: 0,
      updatedAt: null,
      warnings: {},
      days: [],
      regions: [
        {
          land: [],
          sea: [],
        },
        {
          land: [],
          sea: [],
        },
        {
          land: [],
          sea: [],
        },
        {
          land: [],
          sea: [],
        },
        {
          land: [],
          sea: [],
        },
      ],
      legend: [],
    };
  },
  computed: {
    WEATHER_UPDATED: () => 'weather_update_time',
    FLOOD_UPDATED: () => 'flood_update_time',
    WEATHER_WARNINGS: () => 'weather_finland_active_all',
    FLOOD_WARNINGS: () => 'flood_finland_active_all',
    URL_BASE: () => 'https://www.ilmatieteenlaitos.fi/geoserver/alert/ows?service=WFS&version=1.0.0&request=GetFeature&maxFeatures=50&outputFormat=application%2Fjson&typeName=',
    language: () => 'en',
  },
  created() {
    this.fetchWarnings();
  },
  methods: {
    fetchWarnings() {
      const typeNames = [this.WEATHER_UPDATED, this.FLOOD_UPDATED, this.WEATHER_WARNINGS, this.FLOOD_WARNINGS];
      axios.all(typeNames.map((typeName) => axios.get(this.URL_BASE + typeName))).then((responses) => {
        const responseData = typeNames.reduce((data, typeName, index) => {
          // eslint-disable-next-line no-param-reassign
          data[typeName] = responses[index].data.features;
          return data;
        }, {});
        const data = this.handleMapWarnings(responseData);
        this.warnings = data.warnings;
        this.days = data.days;
        this.regions = data.regions;
        this.legend = data.legend;
      }).catch((err) => {
        (console.error || console.log).call(console, err.stack || err);
      });
    },
  },
};
</script>

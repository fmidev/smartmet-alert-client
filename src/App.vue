<template>
    <AlertClient @update-warnings="fetchWarnings" :refreshInterval="refreshInterval" :selectedDay="selectedDay" :warnings="warnings" :days="days" :regions="regions" :parents="parents" :legend="legend" :language="language" /></template>
<script>
import { BootstrapVue } from 'bootstrap-vue';
import Vue from 'vue';
import axios from 'axios';
import { formatISO } from 'date-fns';
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
  props: {
    currentDate: {
      type: String,
      default: formatISO(new Date()),
    },
    baseUrl: {
      type: String,
      default: 'https://www.ilmatieteenlaitos.fi/geoserver/alert/ows',
    },
    weatherUpdated: String,
    floodUpdated: String,
    weatherWarnings: String,
    floodWarnings: String,
    refreshInterval: {
      type: Number,
      default: 1000 * 60 * 15,
    },
    language: {
      type: String,
      default: 'fi',
    },
  },
  mixins: [utils],
  data() {
    return {
      selectedDay: 0,
      updatedAt: null,
      refreshedAt: null,
      warnings: {},
      days: [],
      regions: this.regionsDefault(),
      parents: {},
      legend: [],
    };
  },
  computed: {
    weatherUpdatedType() {
      return 'weather_update_time';
    },
    floodUpdatedType() {
      return 'flood_update_time';
    },
    weatherWarningsType() {
      return 'weather_finland_active_all';
    },
    floodWarningsType() {
      return 'flood_finland_active_all';
    },
    weatherUpdatedQuery() {
      return this.weatherUpdated || `${this.query}${this.weatherUpdatedType}`;
    },
    floodUpdatedQuery() {
      return this.floodUpdated || `${this.query}${this.floodUpdatedType}`;
    },
    weatherWarningsQuery() {
      return this.weatherWarnings || `${this.query}${this.weatherWarningsType}`;
    },
    floodWarningsQuery() {
      return this.floodWarnings || `${this.query}${this.floodWarningsType}${this.floodFilter}`;
    },
    query() {
      return '?service=WFS&version=1.0.0&request=GetFeature&maxFeatures=1000&outputFormat=application%2Fjson&typeName=';
    },
    floodSupportedSeverities() {
      return ['moderate', 'severe', 'extreme'];
    },
    floodFilter() {
      return `${this.floodSupportedSeverities.reduce((filter, severity, index) => (`${filter + (index === 0 ? '' : ',')}%27${severity.toUpperCase()}%27`),
        '&cql_filter=severity%20IN%20(')})%20AND%20language=%27${this.capLanguage()}%27`;
    },
    capLanguage() {
      return () => ({
        'fi-FI': 'fi',
        'sv-SV': 'sv',
        'en-US': 'en',
      })[this.language];
    },
    currentTime() {
      return this.refreshedAt ? this.refreshedAt : (new Date(this.currentDate)).getTime();
    },
  },
  created() {
    this.fetchWarnings();
  },
  methods: {
    fetchWarnings() {
      console.log(`Updating warnings at ${new Date()}`);
      axios.all([this.weatherUpdatedQuery, this.floodUpdatedQuery, this.weatherWarningsQuery, this.floodWarningsQuery]
        .map((queryType) => axios.get(`${this.baseUrl}${queryType}`))).then((responses) => {
        const responseData = [this.weatherUpdatedType, this.floodUpdatedType, this.weatherWarningsType, this.floodWarningsType]
          .reduce((data, typeName, index) => {
            // eslint-disable-next-line no-param-reassign
            data[typeName] = responses[index].data.features;
            return data;
          }, {});
        if (this.updatedAt != null) {
          this.refreshedAt = Date.now();
        }
        const data = this.handleMapWarnings(responseData);
        this.warnings = data.warnings;
        this.days = data.days;
        this.regions = data.regions;
        this.parents = data.parents;
        this.legend = data.legend;
      }).catch((err) => {
        (console.error || console.log).call(console, err.stack || err);
      });
    },
  },
};
</script>

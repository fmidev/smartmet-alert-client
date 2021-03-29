<template>
    <AlertClient @update-warnings="fetchWarnings" :refreshInterval="refreshInterval" :selectedDay="selectedDay" :currentTime="currentTime" :warningsData="warningsData" :geometryId="geometryId" :language="language" :sleep="sleep" />
</template>
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

Vue.config.productionTip = false;

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
    selectedDay: {
      type: Number,
      default: 0,
    },
    weatherUpdated: String,
    floodUpdated: String,
    weatherWarnings: String,
    floodWarnings: String,
    warnings: Object,
    refreshInterval: {
      type: Number,
      default: 1000 * 60 * 15,
    },
    geometryId: {
      type: Number,
      default: 2021,
    },
    language: {
      type: String,
      default: process.env.VUE_APP_I18N_LOCALE || 'en',
    },
    sleep: {
      type: Boolean,
      default: true,
    },
    debugMode: {
      type: Boolean,
      default: false,
    },
  },
  mixins: [utils],
  data() {
    return {
      updatedAt: null,
      refreshedAt: null,
      warningsData: null,
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
        fi: 'fi-FI',
        sv: 'sv-SV',
        en: 'en-US',
      })[this.language];
    },
    currentTime() {
      return this.refreshedAt ? this.refreshedAt : (new Date(this.currentDate)).getTime();
    },
  },
  created() {
    if (this.warnings) {
      this.warningsData = this.warnings;
    }
  },
  methods: {
    async fetchWarnings() {
      if (this.debugMode) {
        console.log(`Updating warnings at ${new Date()}`);
      }
      const queries = {
        [this.weatherUpdatedType]: `${this.baseUrl}${this.weatherUpdatedQuery}`,
        [this.floodUpdatedType]: `${this.baseUrl}${this.floodUpdatedQuery}`,
        [this.weatherWarningsType]: `${this.baseUrl}${this.weatherWarningsQuery}`,
        [this.floodWarningsType]: `${this.baseUrl}${this.floodWarningsQuery}`,
      };
      Promise.allSettled([
        this.weatherUpdatedType,
        this.floodUpdatedType,
        this.weatherWarningsType,
        this.floodWarningsType,
      ].map((queryType) => axios.get(queries[queryType], {
        fmiWarningsQueryType: queryType,
      }))).then(async (responses) => {
        const responseData = {};
        const responseQueryTypes = Object.keys(queries);
        responses.forEach((response) => {
          if ((response != null) && (response.value != null) && (response.value.config != null)) {
            const responseQueryType = response.value.config.fmiWarningsQueryType;
            if ((responseQueryType != null) && (responseQueryTypes.includes(responseQueryType))) {
              responseData[responseQueryType] = response.value.data;
            }
          }
        });
        const currentTime = Date.now();
        if (this.updatedAt != null) {
          this.refreshedAt = currentTime;
        }
        this.updatedAt = currentTime;
        this.warningsData = responseData;
      });
    },
  },
};
</script>

<template>
    <AlertClient :currentTime="currentTime" :selectedDay="selectedDay" :warnings="warnings" :days="days" :regions="regions" :legend="legend" :language="en" /></template>
<script>
import { BootstrapVue } from 'bootstrap-vue';
import Vue from 'vue';
import AlertClient from './components/AlertClient.vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import store from './store';

Vue.use(BootstrapVue);

Vue.prototype.$store = store;

export default {
  name: 'App',
  components: {
    AlertClient,
  },
  data() {
    return {
      currentTime: Date.now(),
      selectedDay: 0,
      warnings: {
        'urn:x-finnish-meterological-institute:warning:thunder-storm:2fc03122-e2fc-454f-82d0-a0b6e882f11a1594186710138': {
          type: 'thunderStorm',
          effectiveFrom: '2020-07-08T12:00:00+03:00',
          effectiveUntil: '2020-07-08T21:00:00+03:00',
          validInterval: '8.7. 15:00 - 8.7. 24:00',
          severity: 2,
          direction: 0,
          text: '',
          info: {
            fi: 'Varoitus rajusta ukonilmasta: Iltapäivällä ja illalla kehittyy ukkoskuuroja, joiden yhteydessä esiintyy voimakkaita ukkospuuskia, yli 15 m/s.',
            sv: 'Ruotsiki: Varoitus rajusta ukonilmasta: Iltapäivällä ja illalla kehittyy ukkoskuuroja, joiden yhteydessä esiintyy voimakkaita ukkospuuskia, yli 15 m/s.',
            en: 'Englanniksi: Varoitus rajusta ukonilmasta: Iltapäivällä ja illalla kehittyy ukkoskuuroja, joiden yhteydessä esiintyy voimakkaita ukkospuuskia, yli 15 m/s.',
          },
        },
        'urn:x-finnish-meterological-institute:warning:rain:96601f1b-609e-4285-ad85-a7a640cb36361594186710139': {
          type: 'rain',
          effectiveFrom: '2020-07-08T12:00:00+03:00',
          effectiveUntil: '2020-07-08T21:00:00+03:00',
          validInterval: '8.7. 15:00 - 8.7. 24:00',
          severity: 2,
          direction: 0,
          text: '',
          info: {
            fi: 'Sadevaroitus: Iltapäivällä ja illalla voi sataa rankasti, yli 20 mm tunnissa.',
            sv: 'Ruotsiki: Sadevaroitus: Iltapäivällä ja illalla voi sataa rankasti, yli 20 mm tunnissa.',
            en: 'Englanniksi: Sadevaroitus: Iltapäivällä ja illalla voi sataa rankasti, yli 20 mm tunnissa.',
          },
        },
        'urn:x-finnish-meterological-institute:warning:sea-wind:9ec458d2-7488-484a-b04d-f2873bb0a80b1594186709097': {
          type: 'seaWind',
          effectiveFrom: '2020-07-12T01:00:00+03:00',
          effectiveUntil: '2020-07-12T21:00:00+03:00',
          validInterval: '12.7. 15:00 - 12.7. 24:00',
          severity: 2,
          direction: 90,
          text: '17',
          info: {
            fi: 'Kovan tuulen varoitus: Kovan pohjoistuulen todennäköisyys on 30 % perjantain ja lauantain välisestä yöstä lauantain ja sunnuntain väliseen yöhön.',
            sv: 'Ruotsiki: Kovan tuulen varoitus: Kovan pohjoistuulen todennäköisyys on 30 % perjantain ja lauantain välisestä yöstä lauantain ja sunnuntain väliseen yöhön.',
            en: 'Englanniksi: Kovan tuulen varoitus: Kovan pohjoistuulen todennäköisyys on 30 % perjantain ja lauantain välisestä yöstä lauantain ja sunnuntain väliseen yöhön.',
          },
        },
        'urn:x-finnish-meterological-institute:warning:sea-wind:9ec458d2-7488-484a-b04d-f2873bb0a80b1594186709091': {
          type: 'seaWind',
          effectiveFrom: '2020-07-11T01:00:00+03:00',
          effectiveUntil: '2020-07-11T23:00:00+03:00',
          validInterval: '11.7. 4:00 - 12.7. 2:00',
          severity: 2,
          direction: -180,
          text: '17',
          info: {
            fi: 'Kovan tuulen varoitus: Kovan pohjoistuulen todennäköisyys on 30 % perjantain ja lauantain välisestä yöstä lauantain ja sunnuntain väliseen yöhön.',
            sv: 'Ruotsiki: Kovan tuulen varoitus: Kovan pohjoistuulen todennäköisyys on 30 % perjantain ja lauantain välisestä yöstä lauantain ja sunnuntain väliseen yöhön.',
            en: 'Englanniksi: Kovan tuulen varoitus: Kovan pohjoistuulen todennäköisyys on 30 % perjantain ja lauantain välisestä yöstä lauantain ja sunnuntain väliseen yöhön.',
          },
        },
        'urn:x-finnish-meterological-institute:warning:sea-wind:9ec458d2-7488-484a-b04d-f2873bb0a80b1594186709092': {
          type: 'seaWind',
          effectiveFrom: '2020-07-11T01:00:00+03:00',
          effectiveUntil: '2020-07-11T23:00:00+03:00',
          validInterval: '11.7. 4:00 - 12.7. 2:00',
          severity: 2,
          direction: 45,
          text: '17',
          info: {
            fi: 'Kovan tuulen varoitus: Kovan pohjoistuulen todennäköisyys on 30 % perjantain ja lauantain välisestä yöstä lauantain ja sunnuntain väliseen yöhön.',
            sv: 'Ruotsiki: Kovan tuulen varoitus: Kovan pohjoistuulen todennäköisyys on 30 % perjantain ja lauantain välisestä yöstä lauantain ja sunnuntain väliseen yöhön.',
            en: 'Englanniksi: Kovan tuulen varoitus: Kovan pohjoistuulen todennäköisyys on 30 % perjantain ja lauantain välisestä yöstä lauantain ja sunnuntain väliseen yöhön.',
          },
        },
      },
      days: [{
        weekdayName: 'wednesday',
        day: 8,
        month: 7,
        year: 2020,
        severity: 1, // computed
        updatedDate: '14.07.2020', // computed
        updatedTime: '08:54', // computed
      },
      {
        weekdayName: 'thursday',
        day: 9,
        month: 7,
        year: 2020,
        severity: 1, // computed
        updatedDate: '14.07.2020', // computed
        updatedTime: '08:54', // computed
      },
      {
        weekdayName: 'friday',
        day: 10,
        month: 7,
        year: 2020,
        severity: 0, // computed
        updatedDate: '14.07.2020', // computed
        updatedTime: '08:54', // computed
      },
      {
        weekdayName: 'saturday',
        day: 11,
        month: 7,
        year: 2020,
        severity: 1, // computed
        updatedDate: '14.07.2020', // computed
        updatedTime: '08:54', // computed
      },
      {
        weekdayName: 'sunday',
        day: 12,
        month: 7,
        year: 2020,
        severity: 1, // computed
        updatedDate: '14.07.2020', // computed
        updatedTime: '08:54', // computed
      }],
      regions: [
        {
          land: [{
            key: 'county_1',
            name: 'Uusimaa',
            warnings: [
              {
                type: 'thunderStorm',
                identifiers: ['urn:x-finnish-meterological-institute:warning:thunder-storm:2fc03122-e2fc-454f-82d0-a0b6e882f11a1594186710138'],
              },
            ],
          }, {
            key: 'county_2',
            name: 'Varsinais-Suomi',
            warnings: [
              {
                type: 'thunderStorm',
                identifiers: ['urn:x-finnish-meterological-institute:warning:thunder-storm:2fc03122-e2fc-454f-82d0-a0b6e882f11a1594186710138'],
              },
            ],
          }, {
            key: 'county_4',
            name: 'Satakunta',
            warnings: [
              {
                type: 'thunderStorm',
                identifiers: ['urn:x-finnish-meterological-institute:warning:thunder-storm:2fc03122-e2fc-454f-82d0-a0b6e882f11a1594186710138'],
              },
            ],
          }, {
            key: 'county_5',
            name: 'Kanta-Häme',
            warnings: [
              {
                type: 'thunderStorm',
                identifiers: ['urn:x-finnish-meterological-institute:warning:thunder-storm:2fc03122-e2fc-454f-82d0-a0b6e882f11a1594186710138'],
              },
            ],
          }, {
            key: 'county_6',
            name: 'Pirkanmaa',
            warnings: [
              {
                type: 'thunderStorm',
                identifiers: ['urn:x-finnish-meterological-institute:warning:thunder-storm:2fc03122-e2fc-454f-82d0-a0b6e882f11a1594186710138'],
              },
            ],
          }, {
            key: 'county_14',
            name: 'Etelä-Pohjanmaa',
            warnings: [
              {
                type: 'rain',
                identifiers: ['urn:x-finnish-meterological-institute:warning:rain:96601f1b-609e-4285-ad85-a7a640cb36361594186710139'],
              },
            ],
          }, {
            key: 'county_15',
            name: 'Pohjanmaa',
            warnings: [
              {
                type: 'rain',
                identifiers: ['urn:x-finnish-meterological-institute:warning:rain:96601f1b-609e-4285-ad85-a7a640cb36361594186710139'],
              },
            ],
          }, {
            key: 'municipality_148',
            name: 'Inari',
            warnings: [
              {
                type: 'thunderStorm',
                identifiers: ['urn:x-finnish-meterological-institute:warning:thunder-storm:2fc03122-e2fc-454f-82d0-a0b6e882f11a1594186710138'],
              },
            ],
          }, {
            key: 'municipality_890',
            name: 'Utsjoki',
            warnings: [
              {
                type: 'thunderStorm',
                identifiers: ['urn:x-finnish-meterological-institute:warning:thunder-storm:2fc03122-e2fc-454f-82d0-a0b6e882f11a1594186710138'],
              },
            ],
          },
          ],
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
          sea: [{
            key: 'sea_region_B3S',
            name: 'Selkämeren eteläosa',
            warnings: [
              {
                type: 'seaWind',
                identifiers: ['urn:x-finnish-meterological-institute:warning:sea-wind:9ec458d2-7488-484a-b04d-f2873bb0a80b1594186709091'],
              },
            ],
          }, {
            key: 'sea_region_B4E',
            name: 'Saaristomeri',
            warnings: [
              {
                type: 'seaWind',
                identifiers: ['urn:x-finnish-meterological-institute:warning:sea-wind:9ec458d2-7488-484a-b04d-f2873bb0a80b1594186709091'],
              },
            ],
          }, {
            key: 'sea_region_B4W',
            name: 'Ahvenanmeri',
            warnings: [
              {
                type: 'seaWind',
                identifiers: ['urn:x-finnish-meterological-institute:warning:sea-wind:9ec458d2-7488-484a-b04d-f2873bb0a80b1594186709091'],
              },
            ],
          }, {
            key: 'sea_region_B7E',
            name: 'Pohjois-Itämeren itäosa',
            warnings: [
              {
                type: 'seaWind',
                identifiers: ['urn:x-finnish-meterological-institute:warning:sea-wind:9ec458d2-7488-484a-b04d-f2873bb0a80b1594186709092'],
              },
            ],
          }, {
            key: 'sea_region_B7W',
            name: 'Pohjois-Itämeren länsiosa',
            warnings: [
              {
                type: 'seaWind',
                identifiers: ['urn:x-finnish-meterological-institute:warning:sea-wind:9ec458d2-7488-484a-b04d-f2873bb0a80b1594186709092'],
              },
            ],
          }, {
            key: 'sea_region_B5E',
            name: 'Suomenlahden itäosa',
            warnings: [
              {
                type: 'seaWind',
                identifiers: ['urn:x-finnish-meterological-institute:warning:sea-wind:9ec458d2-7488-484a-b04d-f2873bb0a80b1594186709092'],
              },
            ],
          }, {
            key: 'sea_region_B5W',
            name: 'Suomenlahden länsiosa',
            warnings: [
              {
                type: 'seaWind',
                identifiers: ['urn:x-finnish-meterological-institute:warning:sea-wind:9ec458d2-7488-484a-b04d-f2873bb0a80b1594186709092'],
              },
            ],
          }],
        },
        {
          land: [],
          sea: [{
            key: 'sea_region_B5E',
            name: 'Suomenlahden itäosa',
            warnings: [
              {
                type: 'seaWind',
                identifiers: ['urn:x-finnish-meterological-institute:warning:sea-wind:9ec458d2-7488-484a-b04d-f2873bb0a80b1594186709097'],
              },
            ],
          }, {
            key: 'sea_region_B5W',
            name: 'Suomenlahden länsiosa',
            warnings: [
              {
                type: 'seaWind',
                identifiers: ['urn:x-finnish-meterological-institute:warning:sea-wind:9ec458d2-7488-484a-b04d-f2873bb0a80b1594186709097'],
              },
            ],
          }],
        },
      ],
      legend: [{
        type: 'thunderStorm',
        severity: 2,
        visible: true,
      }, {
        type: 'rain',
        severity: 2,
        visible: true,
      }, {
        type: 'seaWind',
        severity: 2,
        visible: true,
      }],
    };
  },
};
</script>

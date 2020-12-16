import {
  addDays,
  compareDesc,
  format,
  getDate,
  getDay,
  getMonth,
  getYear,
  isAfter,
  isBefore,
  startOfDay,
} from 'date-fns';
import he from 'he';
import mapshaper from 'mapshaper';
import xpath from 'xpath';
import { DOMParser } from 'xmldom';
import config from './config';
import i18n from '../i18n';

export default {
  mixins: [config],
  computed: {
    NUMBER_OF_DAYS: () => 5,
    WEEKDAY_NAMES: () => ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'],
    REGION_LAND: () => 'land',
    REGION_SEA: () => 'sea',
    REGION_LAKE: () => 'lake',
    WEATHER_UPDATE_TIME: () => 'weather_update_time',
    FLOOD_UPDATE_TIME: () => 'flood_update_time',
    UPDATE_TIME: () => 'update_time',
    WEATHER_WARNINGS: () => 'weather_finland_active_all',
    FLOOD_WARNINGS: () => 'flood_finland_active_all',
    INFO_FI: () => 'info_fi',
    INFO_SV: () => 'info_sv',
    INFO_EN: () => 'info_en',
    PHYSICAL_DIRECTION: () => 'physical_direction',
    PHYSICAL_VALUE: () => 'physical_value',
    EFFECTIVE_FROM: () => 'effective_from',
    EFFECTIVE_UNTIL: () => 'effective_until',
    ONSET: () => 'onset',
    EXPIRES: () => 'expires',
    WARNING_CONTEXT: () => 'warning_context',
    SEVERITY: () => 'severity',
    CONTEXT_EXTENSION: () => 'context_extension',
    DATE_TIME_FORMAT: () => 'd.M. HH:mm',
    DATE_FORMAT: () => 'd.M.y',
    TIME_FORMAT: () => 'HH:mm',
    WIND: () => 'wind',
    SEA_WIND: () => 'sea-wind',
    FLOOD_LEVEL_TYPE: () => 'floodLevel',
    MULTIPLE: () => 'multiple',
    WARNING_LEVELS: () => ['level-1', 'level-2', 'level-3', 'level-4'],
    FLOOD_LEVELS: () => ({
      minor: 1,
      moderate: 2,
      severe: 3,
      extreme: 4,
    }),
    COVERAGE_JSON: () => 'coverage.json',
    COVERAGE_SVG: () => 'coverage.svg',
    allWarnings() {
      return this.$store.getters.warnings;
    },
    visibleWarnings() {
      return this.$store.getters.visibleWarnings;
    },
    bluePaths() {
      return this.paths({
        type: this.REGION_SEA,
      });
    },
    greenPaths() {
      return this.paths({
        type: this.REGION_LAND,
        severity: 0,
      });
    },
    yellowPaths() {
      return this.paths({
        type: this.REGION_LAND,
        severity: 2,
      });
    },
    orangePaths() {
      return this.paths({
        type: this.REGION_LAND,
        severity: 3,
      });
    },
    redPaths() {
      return this.paths({
        type: this.REGION_LAND,
        severity: 4,
      });
    },
    overlayPaths() {
      return this.regionIds.reduce((regions, regionId) => {
        if ((this.geometries[regionId].pathLarge) && ((this.geometries[regionId].type === 'land') ||
          (this.geometries[regionId].subType === 'lake'))) {
          const visualization = this.regionVisualization(regionId);
          regions.push({
            key: `${regionId}${this.size}${this.index}Overlay`,
            d: visualization.visible ? visualization.geom[`path${this.size}`] : '',
            opacity: '1',
            strokeWidth: this.strokeWidth,
          });
        }
        return regions;
      }, []);
    },
    yellowCoverages() {
      return this.coverageGeom(`coverages${this.size}`, 0, 1, 2);
    },
    orangeCoverages() {
      return this.coverageGeom(`coverages${this.size}`, 0, 1, 3);
    },
    redCoverages() {
      return this.coverageGeom(`coverages${this.size}`, 0, 1, 4);
    },
    overlayCoverages() {
      return this.coverageGeom(`coverages${this.size}`, this.strokeWidth, 0);
    },
  },
  methods: {
    uncapitalize(value) {
      if (!value) return '';
      const stringValue = value.toString();
      return stringValue.charAt(0).toLowerCase() + stringValue.slice(1);
    },
    warningType(properties) {
      return (
        this.uncapitalize((properties[this.WARNING_CONTEXT] + (properties[this.CONTEXT_EXTENSION] ? `-${properties[this.CONTEXT_EXTENSION]}` : ''))
          .split('-')
          .map(
            (part) => part.charAt(0).toUpperCase() + part.slice(1),
          )
          .join(''))
      );
    },
    regionFromReference(reference) {
      return reference.split(',').map((url) => {
        let subUrl = url.substring(url.lastIndexOf('#') + 1);
        // Saimaa
        if (subUrl.indexOf('.') !== subUrl.lastIndexOf('.')) {
          subUrl = subUrl.replace('.', '_');
        }
        return subUrl;
      }).reduce((regionId, rawId, index, array) => {
        const parts = rawId.split('.');
        if (index === 0) {
          // eslint-disable-next-line no-param-reassign
          regionId += parts[0];
        }
        return regionId + (index === array.length - 1 ? '.' : '_') + parts[1];
      }, '');
    },
    validInterval(start, end) {
      const effectiveFrom = new Date(start);
      const effectiveUntil = new Date(end);
      return `${format(effectiveFrom, this.DATE_TIME_FORMAT)} - ${format(effectiveUntil, this.DATE_TIME_FORMAT)}`;
    },
    effectiveDays(start, end) {
      const effectiveFrom = new Date(start);
      const effectiveUntil = new Date(end);
      const currentDate = new Date(this.currentTime);
      return [...Array(this.NUMBER_OF_DAYS).keys()].map((index) => ((isBefore(effectiveFrom, startOfDay(addDays(currentDate, index + 1)))) &&
        (isAfter(effectiveUntil, startOfDay(addDays(currentDate, index))))));
    },
    text(properties) {
      return properties[this.WARNING_CONTEXT] === this.SEA_WIND ? properties[this.PHYSICAL_VALUE] : '';
    },
    createWeatherWarning(warning) {
      let direction = 0;
      let severity = Number(warning.properties.severity.slice(-1));
      switch (warning.properties[this.WARNING_CONTEXT]) {
        case this.SEA_WIND:
          direction = warning.properties[this.PHYSICAL_DIRECTION] - 180;
          if (warning.properties[this.SEVERITY] === this.WARNING_LEVELS[0]) {
            severity += 1;
          }
          break;
        case this.WIND:
          direction = warning.properties[this.PHYSICAL_DIRECTION] - 90;
          break;
        default:
      }
      const regionId = this.regionFromReference(warning.properties.reference);
      return {
        type: this.warningType(warning.properties),
        id: warning.properties.identifier,
        regions: this.geometries[regionId] ? {
          [this.regionFromReference(warning.properties.reference)]: true,
        } : {},
        covRegions: {},
        coveragesLarge: [],
        coveragesSmall: [],
        effectiveFrom: warning.properties[this.EFFECTIVE_FROM],
        effectiveUntil: warning.properties[this.EFFECTIVE_UNTIL],
        effectiveDays: this.effectiveDays(warning.properties[this.EFFECTIVE_FROM], warning.properties[this.EFFECTIVE_UNTIL]),
        validInterval: this.validInterval(warning.properties[this.EFFECTIVE_FROM], warning.properties[this.EFFECTIVE_UNTIL]),
        severity,
        direction,
        value: warning.properties[this.PHYSICAL_VALUE],
        text: this.text(warning.properties),
        info: {
          fi: warning.properties[this.INFO_FI] != null ? he.decode(warning.properties[this.INFO_FI]) : '',
          sv: warning.properties[this.INFO_SV] != null ? he.decode(warning.properties[this.INFO_SV]) : '',
          en: warning.properties[this.INFO_EN] != null ? he.decode(warning.properties[this.INFO_EN]) : '',
        },
        link: '',
        linkText: '',
      };
    },
    createFloodWarning(warning) {
      return {
        type: this.FLOOD_LEVEL_TYPE,
        id: warning.properties.identifier,
        regions: {
          [this.regionFromReference(warning.properties.reference)]: true,
        },
        covRegions: {},
        coveragesLarge: [],
        coveragesSmall: [],
        effectiveFrom: warning.properties[this.ONSET],
        effectiveUntil: warning.properties[this.EXPIRES],
        effectiveDays: this.effectiveDays(warning.properties[this.ONSET], warning.properties[this.EXPIRES]),
        validInterval: this.validInterval(warning.properties[this.ONSET], warning.properties[this.EXPIRES]),
        severity: this.FLOOD_LEVELS[warning.properties.severity.toLowerCase()],
        direction: 0,
        value: 0,
        text: '',
        info: {
          [warning.properties.language.substr(0, 2).toLowerCase()]: JSON.parse(
            decodeURIComponent(
              warning.properties.description != null ? warning.properties.description : '[%22%22]',
            ).replace(/\n/g, ' '),
          )[0],
        },
        link: i18n.t('floodLink'),
        linkText: i18n.t('floodLinkText'),
      };
    },
    createDays(warnings) {
      const currentDate = new Date(this.currentTime);
      return [...Array(this.NUMBER_OF_DAYS).keys()].map((index) => {
        const date = addDays(currentDate, index);
        return {
          weekdayName: this.WEEKDAY_NAMES[getDay(date)],
          day: getDate(date),
          month: getMonth(date) + 1,
          year: getYear(date),
          severity: Object.values(warnings).reduce((maxSeverity, warning) => (warning.effectiveDays[index] ? Math.max(warning.severity, maxSeverity) : maxSeverity), 0),
          updatedDate: format(this.updatedAt, this.DATE_FORMAT),
          updatedTime: format(this.updatedAt, this.TIME_FORMAT),
        };
      });
    },
    getMaxSeverities(warnings) {
      return Object.values(warnings).reduce((maxSeverities, warning) => {
        if ((warning.effectiveDays.some((effectiveDay) => effectiveDay)) && ((maxSeverities[warning.type] == null) || (maxSeverities[warning.type] < warning.severity))) {
          // eslint-disable-next-line no-param-reassign
          maxSeverities[warning.type] = warning.severity;
        }
        return maxSeverities;
      }, {});
    },
    createLegend(severities) {
      const warningKeys = Object.keys(severities);
      return [4, 3, 2].reduce((orderedSeverities, severity) => {
        const warningTypesBySeverity = warningKeys.filter((key) => severities[key] === severity);
        this.warningTypes.forEach((regionType, warningType) => {
          if (warningTypesBySeverity.includes(warningType)) {
            orderedSeverities.push({
              type: warningType,
              severity: severities[warningType],
              visible: true,
            });
          }
        });
        return orderedSeverities;
      }, []);
    },
    createRegions(warnings) {
      const warningKeys = Object.keys(warnings);
      return [4, 3, 2].reduce((regionWarnings, severity) => {
        const warningsBySeverity = warningKeys.filter((key) => warnings[key].severity === severity);
        [...Array(this.NUMBER_OF_DAYS).keys()].forEach((day) => {
          const warningsByDay = warningsBySeverity.filter((key) => warnings[key].effectiveDays[day]);
          this.warningTypes.forEach((regionType, warningType) => {
            const warningsByType = warningsByDay.filter((key) => warnings[key].type === warningType);
            warningsByType.sort((key1, key2) => {
              if (warnings[key1].severity !== warnings[key2].severity) {
                return warnings[key2].severity - warnings[key1].severity;
              }
              if (warnings[key1].value !== warnings[key2].value) {
                return warnings[key2].value - warnings[key1].value;
              }
              const effectiveFrom1 = (new Date(warnings[key1].effectiveFrom)).getTime();
              const effectiveFrom2 = (new Date(warnings[key2].effectiveFrom)).getTime();
              if (effectiveFrom1 !== effectiveFrom2) {
                return effectiveFrom2 - effectiveFrom1;
              }
              const effectiveUntil1 = (new Date(warnings[key1].effectiveUntil)).getTime();
              const effectiveUntil2 = (new Date(warnings[key2].effectiveUntil)).getTime();
              return effectiveUntil2 - effectiveUntil1;
            });
            warningsByType.forEach((key) => {
              this.regionIds.forEach((regionId, regionIndex) => {
                if (warnings[key].regions[regionId]) {
                  const regionItems = regionWarnings[day][this.geometries[regionId].type];
                  let regionItem = regionItems.find((regionWarning) => regionWarning.key === regionId);
                  if (regionItem == null) {
                    regionItem = {
                      key: regionId,
                      regionIndex,
                      name: this.geometries[regionId].name,
                      warnings: [],
                    };
                    regionItems.push(regionItem);
                  }
                  let warningItem = regionItem.warnings.find((warning) => warning.type === warningType);
                  if (warningItem == null) {
                    warningItem = {
                      type: warningType,
                      identifiers: [],
                      coverage: Object.keys(warnings[key].covRegions).length > 0,
                    };
                    regionItem.warnings.push(warningItem);
                  }
                  if (!warningItem.identifiers.includes(key)) {
                    warningItem.identifiers.push(key);
                  }
                }
              });
            });
          });
        });
        return regionWarnings;
      }, [...Array(this.NUMBER_OF_DAYS).keys()].map(() => ({
        [this.REGION_LAND]: [],
        [this.REGION_SEA]: [],
      })));
    },

    isValid(warning) {
      if ((warning == null) || (warning.properties == null)) {
        return false;
      }
      const regionId = this.regionFromReference(warning.properties.reference);
      if ((!warning.properties.coverage_references) && (this.geometries[regionId] == null)) {
        return false;
      }
      const warningType = warning.properties.warning_context != null ?
        this.warningType(warning.properties) : 'floodLevel';
      if ((this.geometries[regionId] != null) && (this.warningTypes.get(warningType) !== this.geometries[regionId].type)) {
        return false;
      }
      // Valid flood warning
      if ((warning.properties.severity != null) && (Object.keys(this.FLOOD_LEVELS).includes(warning.properties.severity.toLowerCase()))) {
        return true;
      }
      return ((this.WARNING_LEVELS.slice(1).includes(warning.properties.severity)) ||
      ((warning.properties[this.WARNING_CONTEXT] === this.SEA_WIND) &&
        (this.WARNING_LEVELS.includes(warning.properties.severity))));
    },

    coverageGeom(coverageProperty, strokeWidth, fillOpacity, severity) {
      const coverageData = [];
      const warnings = this.allWarnings;
      const visibleWarnings = this.visibleWarnings;
      Object.keys(warnings).forEach((key) => {
        if (((severity == null) || (warnings[key].severity === severity)) &&
          (warnings[key].effectiveDays[this.index]) && (visibleWarnings.includes(warnings[key].type)) &&
          (warnings[key].coveragesLarge.length > 0)) {
          if (!this.coverageWarnings.includes(key)) {
            Object.keys(warnings[key].covRegions).forEach((covRegion) => {
              if ((this.coverageRegions[covRegion] == null) || (this.coverageRegions[covRegion] < warnings[key].severity)) {
                this.coverageRegions[covRegion] = warnings[key].severity;
              }
            });
            this.coverageWarnings.push(key);
          }
          warnings[key][coverageProperty].forEach((coverage) => {
            coverageData.push({
              key: `${key}${this.size}${this.index}${fillOpacity}Coverage`,
              d: coverage.path,
              fillOpacity,
              strokeWidth,
              fill: this.colors.levels[warnings[key].severity],
            });
          });
        }
      });
      return coverageData;
    },

    async createCoverage(coverage, width, height, reference) {
      const data = {
        type: 'FeatureCollection',
        features: [
          coverage,
          this.bbox,
        ],
        totalFeatures: 2,
        crs: {
          type: 'name',
          properties: {
            name: 'urn:ogc:def:crs:EPSG::3067',
          },
        },
      };
      if (reference != null) {
        data.features.push({
          type: 'Feature',
          id: 'reference',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: reference,
          },
        });
        data.totalFeatures++;
      }
      const input = {
        [this.COVERAGE_JSON]: JSON.stringify(data),
      };
      return mapshaper.applyCommands(`-i coverage.json -o format=svg width=${width} height=${height}`, input);
    },

    coverageData(coverage) {
      const doc = new DOMParser().parseFromString(coverage);
      const paths = xpath.select('//*[name()="svg"]//*[local-name()="path" and @id!="bbox"]', doc);
      const circle = xpath.select('//*[name()="svg"]//*[local-name()="circle" and @id="reference"]', doc);
      return paths.map((path, index) => ({
        path: path.getAttribute('d'),
        reference: ((index === 0) && (circle.length > 0)) ? [
          Number(circle[0].getAttribute('cx')),
          Number(circle[0].getAttribute('cy')),
        ] : [],
      }));
    },

    async handleMapWarnings(data) {
      const warnings = {};
      const parents = {};
      this.updatedAt = [this.WEATHER_UPDATE_TIME, this.FLOOD_UPDATE_TIME]
        .map((updateTime) => new Date(data[updateTime].features[0].properties[this.UPDATE_TIME]))
        .sort(compareDesc)[0];
      const createWarnings = {
        [this.WEATHER_WARNINGS]: this.createWeatherWarning,
        [this.FLOOD_WARNINGS]: this.createFloodWarning,
      };
      const warningTypes = Object.keys(createWarnings);
      for (const warningType of warningTypes) {
        const features = data[warningType].features;
        for (const warning of features) {
          if (this.isValid(warning)) {
            let regionId;
            const warningId = warning.properties.identifier;
            if (warnings[warningId] == null) {
              warnings[warningId] = createWarnings[warningType](warning);
              const regions = Object.keys(warnings[warningId].regions);
              if (regions.length > 0) {
                regionId = regions[0];
              }
            } else {
              regionId = this.regionFromReference(warning.properties.reference);
              if (this.geometries[regionId]) {
                warnings[warningId].regions[regionId] = true;
              }
            }
            if (warning.properties.coverage_references != null) {
              // Space after comma is needed for merged areas
              warning.properties.coverage_references.split(', ')
                .filter((reference) => reference.length > 0).forEach((reference) => {
                  regionId = this.regionFromReference(reference);
                  if (this.geometries[regionId]) {
                    warnings[warningId].regions[regionId] = true;
                    warnings[warningId].covRegions[regionId] = true;
                  }
                });
              if (warning.geometry != null) {
                // eslint-disable-next-line no-await-in-loop
                const coverage = await this.createCoverage(warning, 440, 550, [warning.properties.representative_x, warning.properties.representative_y]);
                // eslint-disable-next-line no-await-in-loop
                const coverageSmall = await this.createCoverage(warning, 75, 120);
                warnings[warningId].coveragesLarge = this.coverageData(coverage[this.COVERAGE_SVG]);
                warnings[warningId].coveragesSmall = this.coverageData(coverageSmall[this.COVERAGE_SVG]);
              }
            }
            if (this.geometries[regionId]) {
              this.geometries[regionId].children.forEach((id) => {
                warnings[warningId].regions[id] = true;
              });
              const parentId = this.geometries[regionId].parent;
              if (parentId) {
                if (parents[parentId] == null) {
                  parents[parentId] = [false, false, false, false, false];
                }
                warnings[warningId].effectiveDays.forEach((override, index) => {
                  if (override) {
                    parents[parentId][index] = true;
                  }
                });
              }
            }
          }
        }
      }
      const days = this.createDays(warnings);
      const maxSeverities = this.getMaxSeverities(warnings);
      const legend = this.createLegend(maxSeverities);
      const regions = this.createRegions(warnings);
      return {
        warnings,
        days,
        regions,
        parents,
        legend,
      };
    },
    isClientSide() {
      return ((typeof document !== 'undefined') && (document));
    },
    regionData(regionId) {
      const regionType = this.geometries[regionId].type;
      return this.input[regionType].find((regionData) => regionData.key === regionId);
    },
    regionSeverity(regionId) {
      const region = this.regionData(regionId);
      let severity = 0;
      if (region != null) {
        const visibleWarnings = this.visibleWarnings;
        const topWarning = region.warnings.find((warning) => !warning.coverage && visibleWarnings.includes(warning.type));
        if (topWarning != null) {
          severity = this.allWarnings[topWarning.identifiers[0]].severity;
        }
      }
      const parentId = this.geometries[regionId].parent;
      if (parentId) {
        severity = Math.max(severity, this.regionSeverity(parentId));
      }
      return severity;
    },
    regionVisualization(regionId) {
      const geom = this.geometries[regionId];
      const severity = this.regionSeverity(regionId);
      const isLand = (this.geometries[regionId].type === this.REGION_LAND);
      const color = ((severity) || (isLand) ? this.colors.levels[severity] : this.colors.sea);
      const visible = ((severity > 0) || (geom.subType !== this.REGION_LAKE));
      return {
        geom,
        severity,
        color,
        visible,
      };
    },
    regionsDefault() {
      return [
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
      ];
    },
  },
};

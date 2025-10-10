import 'url-search-params-polyfill'

import { DOMParser } from '@xmldom/xmldom'
import he from 'he'
import xpath from 'xpath'

import config from './config'
import geojsonsvg from './geojsonsvg'

export default {
  mixins: [config, geojsonsvg],
  computed: {
    NUMBER_OF_DAYS: () => 5,
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
    strokeColor() {
      return this.colors[this.theme].stroke
    },
    bluePaths() {
      return this.paths({
        type: this.REGION_SEA,
      })
    },
    greenPaths() {
      return this.paths({
        type: this.REGION_LAND,
        severity: 0,
      })
    },
    yellowPaths() {
      return this.paths({
        type: this.REGION_LAND,
        severity: 2,
      })
    },
    orangePaths() {
      return this.paths({
        type: this.REGION_LAND,
        severity: 3,
      })
    },
    redPaths() {
      return this.paths({
        type: this.REGION_LAND,
        severity: 4,
      })
    },
    overlayPaths() {
      return this.regionIds.reduce((regions, regionId) => {
        if (
          this.geometries[this.geometryId][regionId].pathLarge &&
          (this.geometries[this.geometryId][regionId].type === 'land' ||
            this.geometries[this.geometryId][regionId].subType === 'lake')
        ) {
          const visualization = this.regionVisualization(regionId)
          regions.push({
            key: `${regionId}${this.size}${this.index}Overlay`,
            d: visualization.visible
              ? visualization.geom[`path${this.size}`]
              : '',
            opacity: '1',
            strokeWidth: this.strokeWidth,
          })
        }
        return regions
      }, [])
    },
    landBorders() {
      return this.areaBorders('land')
    },
    seaBorders() {
      return this.areaBorders('sea')
    },
    yellowCoverages() {
      return this.coverageGeom(`coverages${this.size}`, 0, 1, 2)
    },
    orangeCoverages() {
      return this.coverageGeom(`coverages${this.size}`, 0, 1, 3)
    },
    redCoverages() {
      return this.coverageGeom(`coverages${this.size}`, 0, 1, 4)
    },
    overlayCoverages() {
      return this.coverageGeom(
        `coverages${this.size}`,
        1.1 * this.strokeWidth,
        0
      )
    },
  },
  methods: {
    uncapitalize(value) {
      if (!value) return ''
      const stringValue = value.toString()
      return stringValue.charAt(0).toLowerCase() + stringValue.slice(1)
    },
    warningType(properties) {
      return this.uncapitalize(
        (
          properties[this.WARNING_CONTEXT] +
          (properties[this.CONTEXT_EXTENSION]
            ? `-${properties[this.CONTEXT_EXTENSION]}`
            : '')
        )
          .split('-')
          .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
          .join('')
      )
    },
    areaBorders(area) {
      return [
        {
          key: `border.${area}`,
          d: this.geometries[this.geometryId]['borders'][area][`path${this.size}`],
          opacity: '1',
          strokeWidth: this.strokeWidth,
        },
      ]
    },
    relativeCoverageFromReference(reference) {
      if (reference == null) {
        return 0
      }
      let paramString = ''
      const urlSplit = reference.split('?')
      if (urlSplit.length <= 1) {
        return 0
      }
      paramString = urlSplit[1].split('#')[0]
      const searchParams = new URLSearchParams(paramString)
      const relativeCoverage = searchParams.get('c')
      if (relativeCoverage == null) {
        return 0
      }
      return Number(relativeCoverage)
    },
    regionFromReference(reference) {
      return reference
        .split(',')
        .map((url) => {
          let subUrl = url.substring(url.lastIndexOf('#') + 1)
          // Saimaa
          if (subUrl.indexOf('.') !== subUrl.lastIndexOf('.')) {
            subUrl = subUrl.replace('.', '_')
          }
          return subUrl
        })
        .reduce((regionId, rawId, index, array) => {
          const parts = rawId.split('.')
          if (index === 0) {
            // eslint-disable-next-line no-param-reassign
            regionId += parts[0]
          }
          return regionId + (index === array.length - 1 ? '.' : '_') + parts[1]
        }, '')
    },
    validInterval(start, end) {
      return [this.toTimeZone(start), this.toTimeZone(end)]
        .map(
          (moment) =>
            `${moment.day}.${moment.month}. ${this.twoDigits(
              moment.hour
            )}:${this.twoDigits(moment.minute)}`
        )
        .join(' – ')
    },
    msSinceStartOfDay(timestamp) {
      const moment = this.toTimeZone(timestamp)
      const ms = ((moment.hour * 60 + moment.minute) * 60 + moment.second) * 1000 + moment.millisecond
      // Daylight saving time
      const ref = this.toTimeZone(timestamp - ms)
      if (ref.day !== moment.day) {
        return ms - 60 * 60 * 1000
      }
      return ms + ref.hour * 60 * 60 * 1000
    },
    effectiveDays(start, end, dailyWarning) {
      const offset = this.timeOffset
      const referenceTime =
        this.startFrom === 'updated' ? this.updatedAt : this.currentTime
      const day = 1000 * 60 * 60 * 24
      return [...Array(this.NUMBER_OF_DAYS).keys()].map((index) => {
        const dayTime = referenceTime + index * day
        const dayStartOffset = this.msSinceStartOfDay(dayTime)
        let startOfDay = dayTime - dayStartOffset

        const nextDayTime = referenceTime + (index + 1) * day
        const nextDayStartOffset = this.msSinceStartOfDay(nextDayTime)
        let startOfNextDay = nextDayTime - nextDayStartOffset

        if (!dailyWarning) {
          startOfDay = startOfDay + offset
          startOfNextDay = startOfNextDay + offset
        }
        return (
          new Date(start).getTime() < startOfNextDay &&
          new Date(end).getTime() > startOfDay
        )
      })
    },
    text(properties) {
      return properties[this.WARNING_CONTEXT] === this.SEA_WIND
        ? properties[this.PHYSICAL_VALUE]
        : ''
    },
    createWeatherWarning(warning) {
      let direction = 0
      let severity = Number(warning.properties.severity.slice(-1))
      switch (warning.properties[this.WARNING_CONTEXT]) {
        case this.SEA_WIND:
          direction = warning.properties[this.PHYSICAL_DIRECTION] - 180
          if (warning.properties[this.SEVERITY] === this.WARNING_LEVELS[0]) {
            severity += 1
          }
          break
        case this.WIND:
          direction = warning.properties[this.PHYSICAL_DIRECTION] - 90
          break
        default:
      }
      const regionId = this.regionFromReference(warning.properties.reference)
      const type = this.warningType(warning.properties)
      return {
        type,
        id: warning.properties.identifier,
        regions: this.geometries[this.geometryId][regionId]
          ? {
              [this.regionFromReference(warning.properties.reference)]: true,
            }
          : {},
        covRegions: new Map(),
        coveragesLarge: [],
        coveragesSmall: [],
        effectiveFrom: warning.properties[this.EFFECTIVE_FROM],
        effectiveUntil: warning.properties[this.EFFECTIVE_UNTIL],
        effectiveDays: this.effectiveDays(
          warning.properties[this.EFFECTIVE_FROM],
          warning.properties[this.EFFECTIVE_UNTIL],
          this.dailyWarningTypes.includes(type)
        ),
        validInterval: this.validInterval(
          warning.properties[this.EFFECTIVE_FROM],
          warning.properties[this.EFFECTIVE_UNTIL]
        ),
        severity,
        direction,
        value: warning.properties[this.PHYSICAL_VALUE],
        text: this.text(warning.properties),
        info: {
          fi:
            warning.properties[this.INFO_FI] != null
              ? he.decode(warning.properties[this.INFO_FI])
              : '',
          sv:
            warning.properties[this.INFO_SV] != null
              ? he.decode(warning.properties[this.INFO_SV])
              : '',
          en:
            warning.properties[this.INFO_EN] != null
              ? he.decode(warning.properties[this.INFO_EN])
              : '',
        },
        link: '',
        linkText: '',
      }
    },
    createFloodWarning(warning) {
      let info = ''
      try {
        info = JSON.parse(
          decodeURIComponent(
            warning.properties.description != null
              ? warning.properties.description
              : '[%22%22]'
          ).replace(/[\n|\t]/g, ' ')
        )[0]
      } catch (e) {
        this.handleError(e.name)
      }
      return {
        type: this.FLOOD_LEVEL_TYPE,
        id: warning.properties.identifier,
        regions: {
          [this.regionFromReference(warning.properties.reference)]: true,
        },
        covRegions: new Map(),
        coveragesLarge: [],
        coveragesSmall: [],
        effectiveFrom: warning.properties[this.ONSET],
        effectiveUntil: warning.properties[this.EXPIRES],
        effectiveDays: this.effectiveDays(
          warning.properties[this.ONSET],
          warning.properties[this.EXPIRES],
          this.dailyWarningTypes.includes(this.FLOOD_LEVEL_TYPE)
        ),
        validInterval: this.validInterval(
          warning.properties[this.ONSET],
          warning.properties[this.EXPIRES]
        ),
        severity: this.FLOOD_LEVELS[warning.properties.severity.toLowerCase()],
        direction: 0,
        value: 0,
        text: '',
        info: {
          [warning.properties.language.substr(0, 2).toLowerCase()]: info,
        },
        link: this.t('floodLink'),
        linkText: this.t('floodLinkText'),
      }
    },
    createDays(warnings) {
      const updatedAtTz = this.toTimeZone(this.updatedAt)
      const updatedDate =
        this.updatedAt != null
          ? `${updatedAtTz.day}.${updatedAtTz.month}.${updatedAtTz.year}`
          : ''
      const updatedTime =
        this.updatedAt != null
          ? `${this.twoDigits(updatedAtTz.hour)}:${this.twoDigits(
              updatedAtTz.minute
            )}`
          : ''
      return [...Array(this.NUMBER_OF_DAYS).keys()].map((index) => {
        const referenceTime =
          this.startFrom === 'updated' ? this.updatedAt : this.currentTime
        const date = new Date(referenceTime)
        date.setDate(date.getDate() + index)
        const moment = this.toTimeZone(date)
        return {
          weekdayName: moment.weekday,
          day: moment.day,
          month: moment.month,
          year: moment.year,
          severity: Object.values(warnings).reduce(
            (maxSeverity, warning) =>
              warning.effectiveDays[index]
                ? Math.max(warning.severity, maxSeverity)
                : maxSeverity,
            0
          ),
          updatedDate,
          updatedTime,
        }
      })
    },
    getMaxSeverities(warnings) {
      return Object.values(warnings).reduce((maxSeverities, warning) => {
        if (
          warning.effectiveDays.some((effectiveDay) => effectiveDay) &&
          (maxSeverities[warning.type] == null ||
            maxSeverities[warning.type] < warning.severity)
        ) {
          // eslint-disable-next-line no-param-reassign
          maxSeverities[warning.type] = warning.severity
        }
        return maxSeverities
      }, {})
    },
    createLegend(severities) {
      const warningKeys = Object.keys(severities)
      return [4, 3, 2].reduce((orderedSeverities, severity) => {
        const warningTypesBySeverity = warningKeys.filter(
          (key) => severities[key] === severity
        )
        this.warningTypes.forEach((regionType, warningType) => {
          if (warningTypesBySeverity.includes(warningType)) {
            orderedSeverities.push({
              type: warningType,
              severity: severities[warningType],
              visible: true,
            })
          }
        })
        return orderedSeverities
      }, [])
    },
    createRegions(warnings) {
      const warningKeys = Object.keys(warnings)
      return [4, 3, 2].reduce(
        (regionWarnings, severity) => {
          const warningsBySeverity = warningKeys.filter(
            (key) => warnings[key].severity === severity
          )
          ;[...Array(this.NUMBER_OF_DAYS).keys()].forEach((day) => {
            const warningsByDay = warningsBySeverity.filter(
              (key) => warnings[key].effectiveDays[day]
            )
            this.warningTypes.forEach((regionType, warningType) => {
              const warningsByType = warningsByDay.filter(
                (key) => warnings[key].type === warningType
              )
              warningsByType.sort((key1, key2) => {
                if (warnings[key1].severity !== warnings[key2].severity) {
                  return warnings[key2].severity - warnings[key1].severity
                }
                if (warnings[key1].value !== warnings[key2].value) {
                  return warnings[key2].value - warnings[key1].value
                }
                const effectiveFrom1 = new Date(
                  warnings[key1].effectiveFrom
                ).getTime()
                const effectiveFrom2 = new Date(
                  warnings[key2].effectiveFrom
                ).getTime()
                if (effectiveFrom1 !== effectiveFrom2) {
                  return effectiveFrom1 - effectiveFrom2
                }
                const effectiveUntil1 = new Date(
                  warnings[key1].effectiveUntil
                ).getTime()
                const effectiveUntil2 = new Date(
                  warnings[key2].effectiveUntil
                ).getTime()
                return effectiveUntil1 - effectiveUntil2
              })
              warningsByType.forEach((key) => {
                this.regionIds.forEach((regionId, regionIndex) => {
                  if (warnings[key].regions[regionId]) {
                    const regionItems =
                      regionWarnings[day][
                        this.geometries[this.geometryId][regionId].type
                      ]
                    let regionItem = regionItems.find(
                      (regionWarning) => regionWarning.key === regionId
                    )
                    if (regionItem == null) {
                      regionItem = {
                        key: regionId,
                        regionIndex,
                        name: this.geometries[this.geometryId][regionId].name,
                        warnings: [],
                      }
                      regionItems.push(regionItem)
                    }
                    let warningItem = regionItem.warnings.find(
                      (warning) => warning.type === warningType
                    )
                    if (warningItem == null) {
                      warningItem = {
                        type: warningType,
                        identifiers: [],
                        coverage: 0,
                      }
                      regionItem.warnings.push(warningItem)
                    }
                    if (!warningItem.identifiers.includes(key)) {
                      warningItem.identifiers.push(key)
                    }
                    const covRegions = warnings[key].covRegions
                    if (covRegions.has(regionId)) {
                      warningItem.coverage += covRegions.get(regionId)
                    } else {
                      warningItem.coverage = 100
                    }
                  }
                })
              })
            })
          })
          return regionWarnings
        },
        [...Array(this.NUMBER_OF_DAYS).keys()].map(() => ({
          [this.REGION_LAND]: [],
          [this.REGION_SEA]: [],
        }))
      )
    },

    isValid(warning) {
      if (warning == null || warning.properties == null) {
        return false
      }
      const regionId = this.regionFromReference(warning.properties.reference)
      if (
        warning.geometry == null &&
        this.geometries[this.geometryId][regionId] == null
      ) {
        return false
      }
      const warningType =
        warning.properties.warning_context != null
          ? this.warningType(warning.properties)
          : 'floodLevel'
      if (
        this.geometries[this.geometryId][regionId] != null &&
        this.warningTypes.get(warningType) !==
          this.geometries[this.geometryId][regionId].type
      ) {
        return false
      }
      // Valid flood warning
      if (
        warning.properties.severity != null &&
        Object.keys(this.FLOOD_LEVELS).includes(
          warning.properties.severity.toLowerCase()
        )
      ) {
        return true
      }
      return (
        this.WARNING_LEVELS.slice(1).includes(warning.properties.severity) ||
        (warning.properties[this.WARNING_CONTEXT] === this.SEA_WIND &&
          this.WARNING_LEVELS.includes(warning.properties.severity))
      )
    },

    coverageGeom(coverageProperty, strokeWidth, fillOpacity, severity) {
      const coverageData = []
      const visibleWarnings = this.visibleWarnings
      Object.keys(this.warnings ?? {}).forEach((key) => {
        if (
          (severity == null || this.warnings[key].severity === severity) &&
          this.warnings[key].effectiveDays[this.index] &&
          visibleWarnings.includes(this.warnings[key].type) &&
          this.warnings[key].coveragesLarge.length > 0
        ) {
          if (!this.coverageWarnings.includes(key)) {
            ;[...this.warnings[key].covRegions.keys()].forEach((covRegion) => {
              if (
                (this.coverageRegions[covRegion] == null ||
                this.coverageRegions[covRegion] < this.warnings[key].severity) &&
                this.warnings[key].covRegions.get(covRegion) >= this.coverageCriterion
              ) {
                this.coverageRegions[covRegion] = this.warnings[key].severity
              }
            })
            this.coverageWarnings.push(key)
          }
          this.warnings[key][coverageProperty].forEach((coverage) => {
            coverageData.push({
              key: `${key}${this.size}${this.index}${fillOpacity}Coverage`,
              d: coverage.path,
              fillOpacity,
              strokeWidth,
              fill: this.colors[this.theme].levels[this.warnings[key].severity],
            })
          })
        }
      })
      return coverageData
    },

    createCoverage(coverage, width, height, reference) {
      const data = {
        type: 'FeatureCollection',
        features: [coverage, this.bbox],
        totalFeatures: 2,
        crs: {
          type: 'name',
          properties: {
            name: 'urn:ogc:def:crs:EPSG::3067',
          },
        },
      }
      if (reference != null) {
        data.features.push({
          type: 'Feature',
          id: 'reference',
          properties: {},
          geometry: {
            type: 'Point',
            coordinates: reference,
          },
        })
        data.totalFeatures++
      }
      return this.geoJSONToSVG(data, width, height)
    },

    coverageData(coverage) {
      const doc = new DOMParser().parseFromString(coverage)
      const paths = xpath.select(
        '//*[name()="svg"]//*[local-name()="path" and @id!="bbox"]',
        doc
      )
      const circle = xpath.select(
        '//*[name()="svg"]//*[local-name()="circle" and @id="reference"]',
        doc
      )
      return paths.map((path, index) => ({
        path: path.getAttribute('d'),
        reference:
          index === 0 && circle.length > 0
            ? [
                Number(circle[0].getAttribute('cx')),
                Number(circle[0].getAttribute('cy')),
              ]
            : [],
      }))
    },

    handleMapWarnings(data) {
      const warnings = {}
      const parents = {}
      this.errors = []
      const allUpdateTimes = [this.WEATHER_UPDATE_TIME, this.FLOOD_UPDATE_TIME]
        .filter((warningUpdateTime) => data[warningUpdateTime] != null)
        .reduce((updateTimes, warningUpdateTime) => {
          if (
            data[warningUpdateTime].features != null &&
            data[warningUpdateTime].features.length > 0 &&
            data[warningUpdateTime].features[0].properties != null
          ) {
            const updateTime = new Date(
              data[warningUpdateTime].features[0].properties[this.UPDATE_TIME]
            ).getTime()
            updateTimes.push(updateTime)
            if (
              this.currentTime - updateTime >
              this.maxUpdateDelay[warningUpdateTime]
            ) {
              this.handleError(`${warningUpdateTime}_outdated`)
            }
          } else {
            this.handleError(warningUpdateTime)
          }
          return updateTimes
        }, [])
        .sort()
        .reverse()
      this.updatedAt = allUpdateTimes.length > 0 ? allUpdateTimes[0] : null
      if (!this.staticDays) {
        const startTime =
          this.startFrom === 'updated' ? this.updatedAt : this.currentTime
        this.timeOffset = this.msSinceStartOfDay(startTime)
      }
      const createWarnings = {
        [this.WEATHER_WARNINGS]: this.createWeatherWarning,
        [this.FLOOD_WARNINGS]: this.createFloodWarning,
      }
      const warningTypes = Object.keys(createWarnings)
      for (const warningType of warningTypes) {
        let features = []
        if (data[warningType] == null) {
          this.handleError(`Missing data: ${warningType}`)
          this.onDataError()
          // eslint-disable-next-line no-continue
          continue
        }
        features = data[warningType].features
        for (const warning of features) {
          if (this.isValid(warning)) {
            let regionId
            const regionIds = []
            const warningId = warning.properties.identifier
            if (warnings[warningId] == null) {
              warnings[warningId] = createWarnings[warningType](warning)
              const warningRegions = Object.keys(warnings[warningId].regions)
              if (warningRegions.length > 0) {
                regionId = warningRegions[0]
              }
              if (this.dailyWarningTypes.includes(warnings[warningId].type)) {
                warnings[warningId].dailyWarning = true
              }
            } else {
              regionId = this.regionFromReference(warning.properties.reference)
              if (this.geometries[this.geometryId][regionId]) {
                warnings[warningId].regions[regionId] = true
              }
            }
            if (warning.properties.coverage_references != null) {
              // Space after comma is needed for merged areas
              warning.properties.coverage_references
                .split(', ')
                .filter((reference) => reference.length > 0)
                .forEach((reference) => {
                  const refRegionId = this.regionFromReference(reference)
                  const regionCoverage =
                    this.relativeCoverageFromReference(reference) / 100
                  if (this.geometries[this.geometryId][refRegionId]) {
                    warnings[warningId].regions[refRegionId] = true
                    warnings[warningId].covRegions.set(
                      refRegionId,
                      regionCoverage
                    )
                    regionIds.push(refRegionId)
                  }
                })
              if (warning.geometry != null) {
                const coverage = this.createCoverage(warning, 440, 550, [
                  warning.properties.representative_x,
                  warning.properties.representative_y,
                ])
                const coverageSmall = this.createCoverage(warning, 75, 120)
                warnings[warningId].coveragesLarge = this.coverageData(coverage)
                warnings[warningId].coveragesSmall =
                  this.coverageData(coverageSmall)
              }
            }
            if (
              regionId != null &&
              this.geometries[this.geometryId][regionId]
            ) {
              this.geometries[this.geometryId][regionId].children.forEach(
                (id) => {
                  warnings[warningId].regions[id] = true
                }
              )
              if (regionIds.length === 0) {
                regionIds.push(regionId)
              }
            }
            regionIds.forEach((id) => {
              const parentId = this.geometries[this.geometryId][id].parent
              if (parentId) {
                if (parents[parentId] == null) {
                  parents[parentId] = [false, false, false, false, false]
                }
                warnings[warningId].effectiveDays.forEach((override, index) => {
                  if (override) {
                    parents[parentId][index] = true
                  }
                })
              }
            })
          }
        }
      }
      const days = this.createDays(warnings)
      const maxSeverities = this.getMaxSeverities(warnings)
      const legend = this.createLegend(maxSeverities)
      const regions = this.createRegions(warnings)
      this.optimizeCovRegions(warnings, regions)
      return {
        warnings,
        days,
        regions,
        parents,
        legend,
      }
    },
    isClientSide() {
      return typeof document !== 'undefined' && document
    },
    regionData(regionId) {
      const regionType = this.geometries[this.geometryId][regionId].type
      return this.input[regionType].find(
        (regionData) => regionData.key === regionId
      )
    },
    regionSeverity(regionId) {
      const region = this.regionData(regionId)
      let severity = 0
      if (region != null) {
        region.warnings.find((warning) => {
          if (this.visibleWarnings.includes(warning.type)) {
            const topIdentifier = warning.identifiers.find(
              (id) =>
                this.warnings[id] && this.warnings[id].covRegions.size === 0
            )
            if (topIdentifier != null) {
              severity = this.warnings[topIdentifier].severity
              return true
            }
          }
          return false
        })
      }
      const parentId = this.geometries[this.geometryId][regionId].parent
      if (parentId) {
        severity = Math.max(severity, this.regionSeverity(parentId))
      }
      return severity
    },
    regionVisualization(regionId) {
      const geom = this.geometries[this.geometryId][regionId]
      const severity = this.regionSeverity(regionId)
      const isLand =
        this.geometries[this.geometryId][regionId].type === this.REGION_LAND
      const color =
        severity || isLand
          ? this.colors[this.theme].levels[severity]
          : this.colors[this.theme].sea
      const visible = severity > 0 || geom.subType !== this.REGION_LAKE
      return {
        geom,
        severity,
        color,
        visible,
      }
    },
    // Include also lakes to prevent overlapping symbols in Saimaa
    optimizeCovRegions(warnings, regions) {
      Object.keys(this.geometries[this.geometryId]).filter((regionId) =>
        this.geometries[this.geometryId][regionId]?.type === 'sea' &&
        this.geometries[this.geometryId][regionId]?.subType === 'lake'
      ).filter((regionId) => regions.some((day) =>
        day['sea'].some((region) => region['key'] === regionId
      ))).forEach((regionId) =>
        Object.keys(warnings).filter((warningKey) =>
          warnings[warningKey].covRegions.size > 0
        ).forEach((warningKey) => {
          warnings[warningKey].covRegions.set(regionId, 0)
        }
      ))
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
      ]
    },
    twoDigits(value) {
      return `0${value}`.slice(-2)
    },
    toTimeZone(date) {
      date = new Date(date)
      const parts = new Intl.DateTimeFormat(this.dateTimeFormatLocale, {
        timeZoneName: 'short',
        timeZone: this.timeZone,
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
        weekday: 'short',
        hour12: false,
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        fractionalSecondDigits: 3,
      }).formatToParts(date)
      const whole = this.partsToWhole(parts)
      whole.timeZone = this.timeZone
      return whole
    },
    partsToWhole(parts) {
      const whole = { millisecond: 0 }
      parts.forEach(function (part) {
        let val = part.value
        switch (part.type) {
          case 'literal':
            return
          case 'timeZoneName':
            break
          case 'month':
            val = parseInt(val, 10)
            break
          case 'weekday':
            break
          case 'hour':
            val = parseInt(val, 10) % 24
            break
          case 'fractionalSecond':
            whole.millisecond = parseInt(val, 10)
            return
          default:
            val = parseInt(val, 10)
        }
        whole[part.type] = val
      })
      return whole
    },
  },
}

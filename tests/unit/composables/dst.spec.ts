/**
 * Daylight saving time (Europe/Helsinki) regression tests.
 *
 * Day boundaries must follow the local calendar: on the days of the DST
 * change the day is 23 or 25 hours long, so adding multiples of 24 hours to
 * the current time can land on the wrong calendar day.
 */

import { describe, it, expect } from 'vitest'

import { useConfig } from '@/composables/useConfig'
import { useI18n } from '@/composables/useI18n'
import {
  processWarnings,
  type WarningsProcessorContext,
} from '@/composables/useWarningsProcessor'
import {
  createDays,
  msSinceStartOfDay,
  parseDateInTimeZone,
  startOfDayInTimeZone,
} from '@/composables/useUtils'
import geojsonsvg from '@/mixins/geojsonsvg'
import type { GeoJSONFeature, WarningsData } from '@/types'

import { loadScenario } from '../../fixtures/mapScenarios'

const TZ = 'Europe/Helsinki'
const LOCALE = 'fi-FI'
const HOUR = 60 * 60 * 1000
const geoJSONToSVG = geojsonsvg.methods.geoJSONToSVG.bind(geojsonsvg.methods)

const utc = (iso: string): number => new Date(iso).getTime()

describe('startOfDayInTimeZone', () => {
  it('returns local midnight in summer time (UTC+3)', () => {
    expect(
      startOfDayInTimeZone(utc('2026-10-20T10:00:00Z'), 0, TZ, LOCALE)
    ).toBe(utc('2026-10-19T21:00:00Z'))
  })

  it('returns local midnight in winter time (UTC+2)', () => {
    expect(
      startOfDayInTimeZone(utc('2026-12-20T10:00:00Z'), 0, TZ, LOCALE)
    ).toBe(utc('2026-12-19T22:00:00Z'))
  })

  it('counts calendar days across the autumn change (25 hour day)', () => {
    // Sun 25.10.2026 starts at UTC+3 and ends at UTC+2
    const now = utc('2026-10-23T12:00:00Z')
    expect(startOfDayInTimeZone(now, 2, TZ, LOCALE)).toBe(
      utc('2026-10-24T21:00:00Z')
    )
    expect(startOfDayInTimeZone(now, 3, TZ, LOCALE)).toBe(
      utc('2026-10-25T22:00:00Z')
    )
    expect(
      startOfDayInTimeZone(now, 3, TZ, LOCALE) -
        startOfDayInTimeZone(now, 2, TZ, LOCALE)
    ).toBe(25 * HOUR)
  })

  it('counts calendar days across the spring change (23 hour day)', () => {
    // Sun 28.3.2027 starts at UTC+2 and ends at UTC+3
    const now = utc('2027-03-26T12:00:00Z')
    expect(startOfDayInTimeZone(now, 2, TZ, LOCALE)).toBe(
      utc('2027-03-27T22:00:00Z')
    )
    expect(startOfDayInTimeZone(now, 3, TZ, LOCALE)).toBe(
      utc('2027-03-28T21:00:00Z')
    )
    expect(
      startOfDayInTimeZone(now, 3, TZ, LOCALE) -
        startOfDayInTimeZone(now, 2, TZ, LOCALE)
    ).toBe(23 * HOUR)
  })

  it('applies a wall clock time of day offset', () => {
    const now = utc('2026-10-23T12:00:00Z')
    // 14:30 local time on Sunday 25.10.2026 (UTC+2 after the change)
    expect(
      startOfDayInTimeZone(now, 2, TZ, LOCALE, (14 * 60 + 30) * 60 * 1000)
    ).toBe(utc('2026-10-25T12:30:00Z'))
  })
})

describe('msSinceStartOfDay', () => {
  it('is the wall clock time of day, also on days of the DST change', () => {
    expect(msSinceStartOfDay(utc('2026-10-25T12:00:00Z'), TZ, LOCALE)).toBe(
      14 * HOUR
    )
    expect(msSinceStartOfDay(utc('2027-03-28T12:00:00Z'), TZ, LOCALE)).toBe(
      15 * HOUR
    )
  })
})

describe('createDays around the DST changes', () => {
  const labels = (now: number): string[] =>
    createDays({}, null, now, '', TZ, LOCALE).map(
      (d) => `${d.day}.${d.month}.${d.year}`
    )

  it('lists consecutive dates when loaded 00:30 before the autumn change', () => {
    // Wed 21.10.2026 00:30 local time
    expect(labels(utc('2026-10-20T21:30:00Z'))).toEqual([
      '21.10.2026',
      '22.10.2026',
      '23.10.2026',
      '24.10.2026',
      '25.10.2026',
    ])
  })

  it('lists consecutive dates when loaded 23:30 before the spring change', () => {
    // Thu 25.3.2027 23:30 local time
    expect(labels(utc('2027-03-25T21:30:00Z'))).toEqual([
      '25.3.2027',
      '26.3.2027',
      '27.3.2027',
      '28.3.2027',
      '29.3.2027',
    ])
  })
})

describe('effective days of warnings around the DST changes', () => {
  const scenario = loadScenario(1)
  const template = scenario.data.weather_finland_active_all
    ?.features[0] as GeoJSONFeature

  const ctx = (
    currentTime: number,
    staticDays = true,
    dailyWarningTypes: string[] = []
  ): WarningsProcessorContext => {
    const config = useConfig()
    const { t } = useI18n('fi')
    return {
      geometryId: '2021',
      geometries: config.geometries,
      regionIds: config.regionIds,
      warningTypes: config.warningTypes,
      timeZone: config.timeZone,
      locale: config.dateTimeFormatLocale,
      currentTime,
      startFrom: '',
      staticDays,
      dailyWarningTypes,
      maxUpdateDelay:
        config.maxUpdateDelay as WarningsProcessorContext['maxUpdateDelay'],
      bbox: config.bbox as unknown as GeoJSONFeature,
      geoJSONToSVG,
      t,
      handleError: () => undefined,
      onDataError: () => undefined,
    }
  }

  /** Effective days of one warning valid from `from` to `until` (ISO) */
  const effective = (
    now: number,
    from: string,
    until: string,
    staticDays = true,
    dailyWarningTypes: string[] = []
  ): number[] => {
    const updateTime = new Date(now - 10 * 60 * 1000).toISOString()
    const data = {
      weather_update_time: {
        type: 'FeatureCollection',
        features: [{ properties: { update_time: updateTime } }],
      },
      flood_update_time: {
        type: 'FeatureCollection',
        features: [{ properties: { update_time: updateTime } }],
      },
      weather_finland_active_all: {
        type: 'FeatureCollection',
        features: [
          {
            ...template,
            properties: {
              ...template.properties,
              effective_from: from,
              effective_until: until,
            },
          },
        ],
      },
      flood_finland_active_all: { type: 'FeatureCollection', features: [] },
    } as unknown as WarningsData
    const result = processWarnings(
      data,
      ctx(now, staticDays, dailyWarningTypes)
    )
    const warning = Object.values(result.warnings)[0]
    return (warning?.effectiveDays ?? []).map((d) => Number(d))
  }

  // Sun 25.10.2026 (25 hours) from 00:00 UTC+3 until 00:00 UTC+2
  const AUTUMN_DAY = ['2026-10-24T21:00:00Z', '2026-10-25T22:00:00Z'] as const
  // Sun 28.3.2027 (23 hours) from 00:00 UTC+2 until 00:00 UTC+3
  const SPRING_DAY = ['2027-03-27T22:00:00Z', '2027-03-28T21:00:00Z'] as const

  it.each([
    ['00:20', '2026-10-20T21:20:00Z', 4],
    ['00:50', '2026-10-21T21:50:00Z', 3],
    ['00:20', '2026-10-24T21:20:00Z', 0],
    ['12:00', '2026-10-21T09:00:00Z', 4],
  ])(
    'a warning valid all day on the autumn change day is only on its day (loaded %s, %s)',
    (_label, now, expectedIndex) => {
      const days = effective(utc(now), AUTUMN_DAY[0], AUTUMN_DAY[1])
      expect(days.map((d, i) => (d ? i : -1)).filter((i) => i >= 0)).toEqual([
        expectedIndex,
      ])
    }
  )

  it.each([
    ['23:10', '2027-03-24T21:10:00Z', 4],
    ['23:40', '2027-03-25T21:40:00Z', 3],
    ['23:10', '2027-03-27T21:10:00Z', 1],
    ['00:10', '2027-03-27T22:10:00Z', 0],
    ['12:00', '2027-03-24T10:00:00Z', 4],
  ])(
    'a warning valid all day on the spring change day is only on its day (loaded %s, %s)',
    (_label, now, expectedIndex) => {
      const days = effective(utc(now), SPRING_DAY[0], SPRING_DAY[1])
      expect(days.map((d, i) => (d ? i : -1)).filter((i) => i >= 0)).toEqual([
        expectedIndex,
      ])
    }
  )

  it('handles daily warning types the same way when days are not static', () => {
    const days = effective(
      utc('2026-10-20T21:20:00Z'),
      AUTUMN_DAY[0],
      AUTUMN_DAY[1],
      false,
      ['coldWeather']
    )
    expect(days).toEqual([0, 0, 0, 0, 1])
  })

  it('anchors non-static days to the wall clock time across the change', () => {
    // Loaded Thu 22.10.2026 12:00 local time. Day 2 ends and day 3 starts at
    // Sun 12:00 local time, so a warning valid Sun 11:30-12:30 (UTC+2) is on
    // both of them.
    const days = effective(
      utc('2026-10-22T09:00:00Z'),
      '2026-10-25T09:30:00Z',
      '2026-10-25T10:30:00Z',
      false
    )
    expect(days).toEqual([0, 0, 1, 1, 0])
  })
})

describe('parseDateInTimeZone', () => {
  const parse = (value: string | Date): number =>
    parseDateInTimeZone(value, TZ, LOCALE)

  it('reads a date and time without a time zone as Finnish time', () => {
    expect(parse('2026-10-20T12:00')).toBe(utc('2026-10-20T09:00:00Z'))
    expect(parse('2026-12-20T12:00:30')).toBe(utc('2026-12-20T10:00:30Z'))
    expect(parse('2026-12-20 12:00:30.5')).toBe(utc('2026-12-20T10:00:30.500Z'))
  })

  it('reads times on the days of the DST change as Finnish time', () => {
    expect(parse('2026-10-25T14:00')).toBe(utc('2026-10-25T12:00:00Z'))
    expect(parse('2026-10-25T00:30')).toBe(utc('2026-10-24T21:30:00Z'))
    expect(parse('2027-03-28T15:00')).toBe(utc('2027-03-28T12:00:00Z'))
  })

  it('keeps explicit time zones and dates as they are', () => {
    const date = new Date('2026-10-20T12:00:00Z')
    expect(parse(date)).toBe(date.getTime())
    expect(parse('2026-10-20T12:00:00Z')).toBe(utc('2026-10-20T12:00:00Z'))
    expect(parse('2026-10-20T12:00:00+05:00')).toBe(utc('2026-10-20T07:00:00Z'))
  })
})

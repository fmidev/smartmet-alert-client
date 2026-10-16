/**
 * Time zone helpers
 *
 * The application shows all dates and times, and counts days, in one fixed
 * time zone (Europe/Helsinki by default) instead of the time zone of the
 * browser. Converting an instant to the wall clock time of the time zone is
 * done with Intl.DateTimeFormat. The other direction (the instant of a wall
 * clock time) is solved here, so days are always counted on the local
 * calendar: the day of a daylight saving time change is 23 or 25 hours long.
 */

import type { TimeZoneMoment } from '@/types'

/**
 * Convert DateTimeFormat parts to whole object
 */
function partsToWhole(
  parts: Intl.DateTimeFormatPart[],
  timeZone: string
): TimeZoneMoment {
  const whole: TimeZoneMoment = {
    year: 0,
    month: 0,
    day: 0,
    weekday: '',
    hour: 0,
    minute: 0,
    second: 0,
    millisecond: 0,
    timeZone,
  }

  parts.forEach((part) => {
    const val: string = part.value
    const partType = part.type as string
    switch (partType) {
      case 'literal':
        return
      case 'timeZoneName':
        whole.timeZoneName = val
        break
      case 'month':
        whole.month = parseInt(val, 10)
        break
      case 'weekday':
        whole.weekday = val
        break
      case 'hour':
        whole.hour = parseInt(val, 10) % 24
        break
      case 'fractionalSecond':
        whole.millisecond = parseInt(val, 10)
        return
      case 'year':
        whole.year = parseInt(val, 10)
        break
      case 'day':
        whole.day = parseInt(val, 10)
        break
      case 'second':
        whole.second = parseInt(val, 10)
        break
      case 'minute':
        whole.minute = parseInt(val, 10)
        break
      default:
        break
    }
  })

  return whole
}

// Creating an Intl.DateTimeFormat is expensive, so one is kept for each
// combination of time zone and locale. The latest one is also kept apart,
// because the same combination is used almost always.
const formatters = new Map<string, Intl.DateTimeFormat>()
let latestFormatter: Intl.DateTimeFormat | null = null
let latestTimeZone = ''
let latestLocale = ''

function getFormatter(timeZone: string, locale: string): Intl.DateTimeFormat {
  if (
    latestFormatter != null &&
    timeZone === latestTimeZone &&
    locale === latestLocale
  ) {
    return latestFormatter
  }
  const key = `${timeZone}|${locale}`
  let formatter = formatters.get(key)
  if (formatter == null) {
    formatter = new Intl.DateTimeFormat(locale, {
      timeZoneName: 'short',
      timeZone,
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      weekday: 'short',
      hour12: false,
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      fractionalSecondDigits: 3,
    } as Intl.DateTimeFormatOptions)
    formatters.set(key, formatter)
  }
  latestFormatter = formatter
  latestTimeZone = timeZone
  latestLocale = locale
  return formatter
}

/**
 * Convert date to timezone-specific moment
 */
export function toTimeZone(
  date: Date | number | string,
  timeZone: string,
  locale: string
): TimeZoneMoment {
  return partsToWhole(
    getFormatter(timeZone, locale).formatToParts(new Date(date)),
    timeZone
  )
}

/**
 * Wall clock time of day (milliseconds since 00:00 local time) in the given
 * time zone
 */
export function msSinceStartOfDay(
  timestamp: number,
  timeZone: string,
  locale: string
): number {
  const moment = toTimeZone(timestamp, timeZone, locale)
  return (
    ((moment.hour * 60 + moment.minute) * 60 + moment.second) * 1000 +
    moment.millisecond
  )
}

/**
 * Instant (UTC timestamp) of the wall clock time `msOfDay` on the calendar day
 * `dayOffset` days after the day that contains `timestamp`, in the given time
 * zone. By default this is the start of that day. Days are counted on the
 * local calendar (not in 24 hour steps), so days that are 23 or 25 hours long
 * because of the daylight saving time change are handled.
 *
 * A wall clock time that does not exist (the hour skipped in the spring) or
 * that occurs twice (the hour repeated in the autumn) gives an instant within
 * an hour of it.
 */
export function startOfDayInTimeZone(
  timestamp: number,
  dayOffset: number,
  timeZone: string,
  locale: string,
  msOfDay = 0
): number {
  const moment = toTimeZone(timestamp, timeZone, locale)
  const target =
    Date.UTC(moment.year, moment.month - 1, moment.day + dayOffset) + msOfDay
  let guess = target
  for (let i = 0; i < 3; i++) {
    const local = toTimeZone(guess, timeZone, locale)
    const localAsUtc = Date.UTC(
      local.year,
      local.month - 1,
      local.day,
      local.hour,
      local.minute,
      local.second,
      local.millisecond
    )
    const diff = localAsUtc - target
    if (diff === 0) {
      break
    }
    guess -= diff
  }
  return guess
}

/**
 * Boundaries of `count` consecutive calendar days, the first of which is the
 * day that contains `timestamp`: `count + 1` instants, so that day `i` lasts
 * from item `i` to item `i + 1`. With `msOfDay` the days start at that wall
 * clock time of day instead of midnight.
 */
export function dayBoundaries(
  timestamp: number,
  count: number,
  timeZone: string,
  locale: string,
  msOfDay = 0
): number[] {
  return Array.from({ length: count + 1 }, (_, index) =>
    startOfDayInTimeZone(timestamp, index, timeZone, locale, msOfDay)
  )
}

const DATE_TIME_WITHOUT_ZONE =
  /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3})\d*)?)?$/

/**
 * Convert a date given as a Date or a string to a UTC timestamp. A date and
 * time string without a time zone or UTC offset (e.g. `2026-10-25T12:00`) is
 * the wall clock time in the given time zone, not in the time zone of the
 * browser. Other strings are parsed as `new Date(value)` does.
 */
export function parseDateInTimeZone(
  value: Date | string,
  timeZone: string,
  locale: string
): number {
  if (value instanceof Date) {
    return value.getTime()
  }
  const match = DATE_TIME_WITHOUT_ZONE.exec(value.trim())
  if (match == null) {
    return new Date(value).getTime()
  }
  const [year, month, day, hour, minute, second, millisecond] = match
    .slice(1)
    .map((part, index) =>
      part == null ? 0 : parseInt(index === 6 ? part.padEnd(3, '0') : part, 10)
    ) as [number, number, number, number, number, number, number]
  // Any instant on the right calendar day of the time zone will do
  const noon = Date.UTC(year, month - 1, day, 12)
  return startOfDayInTimeZone(
    noon,
    0,
    timeZone,
    locale,
    ((hour * 60 + minute) * 60 + second) * 1000 + millisecond
  )
}

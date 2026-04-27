/**
 * Offline pipeline that downloads FMI CAP Atom snapshots from
 * https://alerts.fmi.fi/cap/feed/ and the current SYKE flood CAP feed
 * from https://wwwi2.ymparisto.fi/i2/CAP/SYKE_CAP_current.atom,
 * converts them to WFS-shaped WarningsData (see ./capToWfs.ts and
 * ./sykeToWfs.ts), and writes each result into
 * tests/fixtures/scenarios/scenario-<id>.json — the same directory the
 * legacy WFS captures live in, so the loader in
 * tests/fixtures/mapScenarios.ts does not need to distinguish sources.
 *
 * The produced JSON files are committed so test runs stay offline; the
 * cached raw XMLs are written to tests/fixtures/cap-raw/ (gitignored).
 *
 * Each CAP scenario is downloaded in Finnish only. info_sv / info_en
 * remain empty on the derived warnings; the language × theme matrix
 * spec keeps using the original 21 WFS scenarios (which carry all
 * three translations).
 *
 * Run with:
 *   npx vite-node scripts/build-cap-scenarios.ts
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

import { convertCapAtomToWarningsData } from './capToWfs'
import { convertSykeCapToWarningsData } from './sykeToWfs'
import type { WarningsData } from '../src/types'

const REPO_ROOT = process.cwd()
const RAW_DIR = resolve(REPO_ROOT, 'tests', 'fixtures', 'cap-raw')
const SCENARIOS_DIR = resolve(REPO_ROOT, 'tests', 'fixtures', 'scenarios')

/**
 * Each scenario is a single CAP Atom snapshot at a specific date+time,
 * chosen so the fixture set covers different seasons and warning mixes.
 * The `id` continues the numbering from the original 21 WFS scenarios,
 * so scenario 22 is the first CAP-derived one.
 */
interface CapScenarioDef {
  id: number
  label: string
  year: string
  dayDir: string // MM-DD part of the URL path
  /**
   * Exact snapshot timestamp like "13-00-55Z". When omitted, the build
   * script detects one automatically by listing the day's directory and
   * preferring a snapshot taken in the Finnish afternoon (10Z-15Z).
   */
  stampPrefix?: string
  description: string
}

/**
 * Pinned scenarios — kept byte-for-byte stable so snapshot regressions
 * stay comparable across runs even if the feed directory layout drifts.
 *
 * These seven (ids 20..26) sit right after the 19 committed WFS
 * captures (ids 1..19). Id 27 is reserved for the SYKE flood scenario
 * built separately below; the CAP "additional" scenarios take ids
 * 28..83 (see ADDITIONAL_DATES).
 *
 * Dates that previously rendered with zero warnings on day 0 have been
 * dropped from this list — see the trimmed ADDITIONAL_DATES below —
 * since the regression suite keeps a single representative empty-map
 * scenario (WFS capture #12).
 */
const PINNED_SCENARIOS: CapScenarioDef[] = [
  {
    id: 20,
    label: '2024-01-08 midday — cold snap, wind and snowfall',
    year: '2024',
    dayDir: '01-08',
    stampPrefix: '13-00-55Z',
    description: 'Winter cold spell with traffic and cold-weather warnings',
  },
  {
    id: 21,
    label: '2024-03-18 midday — spring storm systems',
    year: '2024',
    dayDir: '03-18',
    stampPrefix: '12-44-10Z',
    description: 'Late winter / early spring precipitation and wind',
  },
  {
    id: 22,
    label: '2024-06-22 afternoon — midsummer thunderstorms',
    year: '2024',
    dayDir: '06-22',
    stampPrefix: '14-48-10Z',
    description: 'Scattered thunderstorms around Midsummer',
  },
  {
    id: 23,
    label: '2024-07-15 afternoon — heatwave + thunderstorms',
    year: '2024',
    dayDir: '07-15',
    stampPrefix: '14-36-49Z',
    description: 'Rich mix of thunder, rain and forest-fire warnings',
  },
  {
    id: 24,
    label: '2024-10-15 afternoon — autumn storm',
    year: '2024',
    dayDir: '10-15',
    stampPrefix: '14-34-59Z',
    description: 'Windy autumn with coastal wave warnings',
  },
  {
    id: 25,
    label: '2024-12-18 midday — pre-Christmas snowfall',
    year: '2024',
    dayDir: '12-18',
    stampPrefix: '12-57-10Z',
    description: 'Heavy snow and traffic warnings',
  },
  {
    id: 26,
    label: '2025-01-10 midday — mid-winter cold',
    year: '2025',
    dayDir: '01-10',
    stampPrefix: '12-36-08Z',
    description: 'Deep cold and snow across northern Finland',
  },
]

/**
 * Additional dates spread across 2020..2026 with the snapshot timestamp
 * auto-detected at download time (midday preferred).
 *
 * Scenario ids start at 28 so that 27 stays reserved for SYKE current
 * floods. Rows that previously produced empty-map scenarios (either
 * the feed did not yet exist at the time, or day 0 carried no active
 * warnings) have been pruned; the regression suite keeps exactly one
 * representative empty-map scenario (WFS capture #12) and does not
 * need additional ones.
 *
 * Target: a wide set of unusual weather situations across the seasons:
 *   - deep-winter cold spells (Jan/Feb)
 *   - spring snowmelt and late snow (Mar/Apr)
 *   - summer thunderstorms, forest-fire risk, heat (May–Aug)
 *   - autumn storms and early winter (Sep–Dec)
 */
const ADDITIONAL_DATES: Array<{
  year: string
  dayDir: string
  label: string
  description: string
}> = [
  // ------- 2020 (feed started mid-year) -------
  { year: '2020', dayDir: '08-15', label: '2020-08-15 — August thunderstorm complex', description: 'Mature summer convective systems' },
  { year: '2020', dayDir: '10-10', label: '2020-10-10 — autumn gales', description: 'Autumn storm season begins' },
  { year: '2020', dayDir: '11-10', label: '2020-11-10 — November wind', description: 'Late-autumn coastal systems' },
  { year: '2020', dayDir: '12-15', label: '2020-12-15 — December snowfall', description: 'Pre-Christmas winter weather' },

  // ------- 2021 -------
  { year: '2021', dayDir: '01-10', label: '2021-01-10 — deep winter', description: 'Cold snap in early January' },
  { year: '2021', dayDir: '02-10', label: '2021-02-10 — cold-wave peak', description: 'Deep Feb cold spell' },
  { year: '2021', dayDir: '03-15', label: '2021-03-15 — March thaw / wind', description: 'Spring transition' },
  { year: '2021', dayDir: '04-15', label: '2021-04-15 — spring flood season', description: 'Snowmelt and flood warnings' },
  { year: '2021', dayDir: '05-15', label: '2021-05-15 — mid-May', description: 'Late-spring weather' },
  { year: '2021', dayDir: '06-15', label: '2021-06-15 — Midsummer warmth', description: 'Summer heat begins' },
  { year: '2021', dayDir: '07-10', label: '2021-07-10 — July heatwave', description: 'Extended hot weather warnings' },
  { year: '2021', dayDir: '08-15', label: '2021-08-15 — August thunderstorms', description: 'Late-summer convection' },
  { year: '2021', dayDir: '10-15', label: '2021-10-15 — October storm', description: 'Mid-autumn storm system' },
  { year: '2021', dayDir: '11-15', label: '2021-11-15 — November sleet', description: 'Autumn-to-winter transition' },
  { year: '2021', dayDir: '12-20', label: '2021-12-20 — Christmas-week winter', description: 'Deep winter near year-end' },

  // ------- 2022 -------
  { year: '2022', dayDir: '01-05', label: '2022-01-05 — new-year cold', description: 'Start-of-year cold spell' },
  { year: '2022', dayDir: '02-15', label: '2022-02-15 — mid-winter storm', description: 'Feb wind + snow combination' },
  { year: '2022', dayDir: '04-05', label: '2022-04-05 — early April spring', description: 'Flood + lingering winter' },
  { year: '2022', dayDir: '05-10', label: '2022-05-10 — early May warmup', description: 'Spring thunder possibility' },
  { year: '2022', dayDir: '06-10', label: '2022-06-10 — early summer thunder', description: 'First summer thunderstorms' },
  { year: '2022', dayDir: '07-20', label: '2022-07-20 — late July heat', description: 'High summer with hot-weather warnings' },
  { year: '2022', dayDir: '08-25', label: '2022-08-25 — late-August storms', description: 'End-of-summer storm pattern' },
  { year: '2022', dayDir: '09-05', label: '2022-09-05 — early September', description: 'Transition weather' },
  { year: '2022', dayDir: '10-25', label: '2022-10-25 — late-autumn gale', description: 'Late-October strong winds' },
  { year: '2022', dayDir: '11-20', label: '2022-11-20 — pre-winter storm', description: 'Snowfall + wind' },
  { year: '2022', dayDir: '12-23', label: '2022-12-23 — Christmas winter', description: 'Holiday-period cold' },

  // ------- 2023 -------
  { year: '2023', dayDir: '01-05', label: '2023-01-05 — winter mild-spell', description: 'Variable early-January weather' },
  { year: '2023', dayDir: '03-10', label: '2023-03-10 — March transition', description: 'Early-spring weather' },
  { year: '2023', dayDir: '05-10', label: '2023-05-10 — early May', description: 'Late-spring frost potential' },
  { year: '2023', dayDir: '06-10', label: '2023-06-10 — early summer', description: 'Early convective weather' },
  { year: '2023', dayDir: '07-20', label: '2023-07-20 — July heat + thunder', description: 'Summer heat and thunderstorms' },
  { year: '2023', dayDir: '08-25', label: '2023-08-25 — late summer', description: 'Fading summer, autumn hints' },
  { year: '2023', dayDir: '09-10', label: '2023-09-10 — early autumn wind', description: 'Early-autumn weather' },
  { year: '2023', dayDir: '10-20', label: '2023-10-20 — October gale', description: 'Mature autumn storms' },
  { year: '2023', dayDir: '11-05', label: '2023-11-05 — November sleet', description: 'Onset of winter conditions' },
  { year: '2023', dayDir: '12-24', label: '2023-12-24 — Christmas Eve', description: 'Holiday winter weather' },

  // ------- 2024 additional -------
  { year: '2024', dayDir: '02-05', label: '2024-02-05 — February cold', description: 'Mid-winter cold' },
  { year: '2024', dayDir: '04-10', label: '2024-04-10 — spring flood season', description: 'Snowmelt floods' },
  { year: '2024', dayDir: '05-20', label: '2024-05-20 — late spring', description: 'Early forest-fire risk' },
  { year: '2024', dayDir: '08-15', label: '2024-08-15 — August thunderstorms', description: 'Peak convective season' },
  { year: '2024', dayDir: '09-20', label: '2024-09-20 — equinox storm', description: 'Early-autumn gale' },
  { year: '2024', dayDir: '11-22', label: '2024-11-22 — late November', description: 'Early snow / freezing rain' },

  // ------- 2025 additional -------
  { year: '2025', dayDir: '02-15', label: '2025-02-15 — mid-February winter', description: 'Deep-winter conditions' },
  { year: '2025', dayDir: '03-20', label: '2025-03-20 — spring equinox', description: 'Transition weather' },
  { year: '2025', dayDir: '05-10', label: '2025-05-10 — late spring', description: 'Early summer setups' },
  { year: '2025', dayDir: '06-15', label: '2025-06-15 — Midsummer period', description: 'Midsummer convection' },
  { year: '2025', dayDir: '07-20', label: '2025-07-20 — late July', description: 'High summer' },
  { year: '2025', dayDir: '09-20', label: '2025-09-20 — autumn onset', description: 'Autumn begins' },
  { year: '2025', dayDir: '10-15', label: '2025-10-15 — October gale', description: 'Mid-autumn storm' },
  { year: '2025', dayDir: '12-10', label: '2025-12-10 — early December', description: 'Pre-Christmas winter' },

  // ------- 2026 (so far) -------
  { year: '2026', dayDir: '01-10', label: '2026-01-10 — January cold', description: 'Deep-winter cold' },

  // ------- late additions (non-chronological order kept from the
  //          original build for snapshot stability) -------
  { year: '2022', dayDir: '11-05', label: '2022-11-05 — early-November', description: 'Early-autumn winter mix' },
  { year: '2021', dayDir: '11-30', label: '2021-11-30 — late-November', description: 'Deep-autumn storm' },
  { year: '2021', dayDir: '04-05', label: '2021-04-05 — early-April', description: 'Late-winter lingering' },
  { year: '2023', dayDir: '11-20', label: '2023-11-20 — late-November', description: 'Pre-winter wind + snow' },

  // Today's live snapshot: whatever FMI was publishing on the day the
  // scenario set was last rebuilt. Auto-detect picks the most recent
  // afternoon timestamp. Rerun `npx vite-node scripts/build-cap-scenarios.ts`
  // to refresh, then update snapshots with `npx vitest -u`.
  { year: '2026', dayDir: '04-22', label: '2026-04-22 — live capture', description: 'Most recent FMI snapshot at build time' },
]

const NEXT_AUTO_ID = 28
const AUTO_SCENARIOS: CapScenarioDef[] = ADDITIONAL_DATES.map((def, idx) => ({
  id: NEXT_AUTO_ID + idx,
  label: def.label,
  description: def.description,
  year: def.year,
  dayDir: def.dayDir,
  // stampPrefix intentionally left undefined → autoDetectStamp() picks one
}))

const SCENARIOS: CapScenarioDef[] = [...PINNED_SCENARIOS, ...AUTO_SCENARIOS]

const LANGUAGES = ['fi-FI'] as const
type LangCode = (typeof LANGUAGES)[number]

function rawPath(def: CapScenarioDef, lang: LangCode): string {
  return resolve(
    RAW_DIR,
    `${def.year}-${def.dayDir}-${def.stampPrefix}-${lang}.xml`
  )
}

function urlFor(def: CapScenarioDef, lang: LangCode): string {
  return `https://alerts.fmi.fi/cap/feed/${def.year}/${def.dayDir}/${def.stampPrefix}-atom_${lang}.xml`
}

/**
 * Fetch the directory listing for a given day and pick the snapshot
 * timestamp that best matches Finnish afternoon (10Z..15Z, or the
 * middle file as a fallback). Returns null when the day has no
 * snapshots at all. Cached to disk under cap-raw/index/ so repeat
 * builds don't hammer the feed server.
 */
async function autoDetectStamp(
  year: string,
  dayDir: string
): Promise<string | null> {
  const indexCache = resolve(RAW_DIR, 'index', `${year}-${dayDir}.html`)
  let html: string
  if (existsSync(indexCache)) {
    html = readFileSync(indexCache, 'utf8')
  } else {
    const url = `https://alerts.fmi.fi/cap/feed/${year}/${dayDir}/`
    const res = await fetch(url)
    if (!res.ok) return null
    html = await res.text()
    mkdirSync(resolve(RAW_DIR, 'index'), { recursive: true })
    writeFileSync(indexCache, html, 'utf8')
  }
  const pattern = /href="(\d{2}-\d{2}-\d{2}Z)-atom_fi-FI\.xml"/g
  const stamps: string[] = []
  for (const match of html.matchAll(pattern)) {
    if (match[1]) stamps.push(match[1])
  }
  if (stamps.length === 0) return null
  // Prefer snapshots taken between 10:00Z and 15:00Z (13:00..18:00 EET)
  const afternoon = stamps.find((s) => {
    const hour = Number(s.slice(0, 2))
    return hour >= 10 && hour <= 15
  })
  return afternoon ?? stamps[Math.floor(stamps.length / 2)] ?? stamps[0] ?? null
}

async function fetchXml(
  def: CapScenarioDef,
  lang: LangCode,
  forceRefresh = false
): Promise<string> {
  const cache = rawPath(def, lang)
  if (!forceRefresh && existsSync(cache)) {
    return readFileSync(cache, 'utf8')
  }
  const url = urlFor(def, lang)
  const res = await fetch(url)
  if (!res.ok) {
    throw new Error(
      `Failed to download ${url}: HTTP ${res.status} ${res.statusText}`
    )
  }
  const text = await res.text()
  mkdirSync(RAW_DIR, { recursive: true })
  writeFileSync(cache, text, 'utf8')
  return text
}

interface BuildResult {
  id: number
  label: string
  description: string
  source: 'cap' | 'syke'
  sourceUrl: string
  updateTimeIso: string
  warnings: number
  unmatchedAreaNames: string[]
}

function writeEnvelope(args: {
  id: number
  label: string
  source: 'cap' | 'syke'
  description: string
  sourceUrl: string
  updateTimeIso: string
  data: WarningsData
}): void {
  mkdirSync(SCENARIOS_DIR, { recursive: true })
  const outPath = resolve(SCENARIOS_DIR, `scenario-${args.id}.json`)
  writeFileSync(
    outPath,
    JSON.stringify(
      {
        meta: {
          id: args.id,
          label: args.label,
          source: args.source,
          description: args.description,
          sourceUrl: args.sourceUrl,
          updateTimeIso: args.updateTimeIso,
        },
        data: args.data,
      },
      null,
      2
    ),
    'utf8'
  )
}

async function buildOne(def: CapScenarioDef): Promise<BuildResult | null> {
  // Resolve stampPrefix on demand for auto-detected scenarios.
  const resolved: CapScenarioDef = def.stampPrefix
    ? def
    : await resolveStamp(def)
  if (!resolved.stampPrefix) {
    return null
  }
  const xml = await fetchXml(resolved, 'fi-FI')
  const converted = convertCapAtomToWarningsData(xml)
  const sourceUrl = urlFor(resolved, 'fi-FI')
  const warningCount = (
    converted.warningsData.weather_finland_active_all?.features ?? []
  ).length
  if (warningCount === 0) {
    // An empty feed isn't useful for regression; skip to keep the fixture
    // set focused on non-trivial situations.
    return null
  }

  writeEnvelope({
    id: resolved.id,
    label: resolved.label,
    source: 'cap',
    description: resolved.description,
    sourceUrl,
    updateTimeIso: converted.updateTimeIso,
    data: converted.warningsData,
  })

  return {
    id: resolved.id,
    label: resolved.label,
    description: resolved.description,
    source: 'cap',
    sourceUrl,
    updateTimeIso: converted.updateTimeIso,
    warnings: warningCount,
    unmatchedAreaNames: converted.stats.unmatchedAreaNames,
  }
}

async function resolveStamp(def: CapScenarioDef): Promise<CapScenarioDef> {
  const stamp = await autoDetectStamp(def.year, def.dayDir)
  if (!stamp) {
    process.stderr.write(
      `scenario ${def.id}: no snapshot XML for ${def.year}/${def.dayDir}; skipping\n`
    )
    return def
  }
  return { ...def, stampPrefix: stamp }
}

async function main(): Promise<void> {
  const results: BuildResult[] = []
  const skipped: number[] = []
  for (const def of SCENARIOS) {
    try {
      const r = await buildOne(def)
      if (!r) {
        skipped.push(def.id)
        continue
      }
      results.push(r)
      process.stdout.write(
        `scenario ${r.id}: ${r.warnings} warnings  —  ${r.label}\n`
      )
      if (r.unmatchedAreaNames.length > 0) {
        process.stdout.write(
          `  unmatched areas (${r.unmatchedAreaNames.length}): ${r.unmatchedAreaNames.slice(0, 6).join(', ')}${r.unmatchedAreaNames.length > 6 ? ', …' : ''}\n`
        )
      }
    } catch (err) {
      process.stderr.write(
        `scenario ${def.id} failed: ${(err as Error).message}\n`
      )
      skipped.push(def.id)
    }
  }

  if (skipped.length > 0) {
    process.stdout.write(
      `\nSkipped ${skipped.length} scenarios (empty feed or download error): ${skipped.join(', ')}\n`
    )
  }

  // SYKE current floods — one extra scenario (id=29) sourced from the
  // national flood CAP feed. Since the feed is "current only", the cached
  // XML in tests/fixtures/cap-raw is the snapshot of record — committing
  // the derived envelope is what keeps it reproducible.
  try {
    const sykeResult = await buildSykeFloodScenario()
    if (sykeResult) {
      results.push(sykeResult)
      process.stdout.write(
        `scenario ${sykeResult.id}: ${sykeResult.warnings} flood features  —  ${sykeResult.label}\n`
      )
      if (sykeResult.unmatchedAreaNames.length > 0) {
        process.stdout.write(
          `  unmatched areas: ${sykeResult.unmatchedAreaNames.slice(0, 6).join(', ')}${sykeResult.unmatchedAreaNames.length > 6 ? ', …' : ''}\n`
        )
      }
    }
  } catch (err) {
    process.stderr.write(
      `SYKE flood scenario failed: ${(err as Error).message}\n`
    )
  }

  process.stdout.write(
    `\nWrote ${results.length} scenarios to ${SCENARIOS_DIR}\n`
  )
}

const SYKE_FEED_URL = 'https://wwwi2.ymparisto.fi/i2/CAP/SYKE_CAP_current.atom'
const SYKE_CACHE = () => resolve(RAW_DIR, 'syke-current.atom.xml')

async function fetchSykeXml(forceRefresh = false): Promise<string> {
  const cache = SYKE_CACHE()
  if (!forceRefresh && existsSync(cache)) {
    return readFileSync(cache, 'utf8')
  }
  const res = await fetch(SYKE_FEED_URL)
  if (!res.ok) {
    throw new Error(
      `Failed to download ${SYKE_FEED_URL}: HTTP ${res.status} ${res.statusText}`
    )
  }
  const text = await res.text()
  mkdirSync(RAW_DIR, { recursive: true })
  writeFileSync(cache, text, 'utf8')
  return text
}

/**
 * SYKE current-flood scenario id. Sits between the pinned CAP scenarios
 * (20..26) and the auto-numbered additional ones (28..82).
 */
const SYKE_SCENARIO_ID = 27

async function buildSykeFloodScenario(): Promise<BuildResult | null> {
  const xml = await fetchSykeXml()
  const converted = convertSykeCapToWarningsData(xml)
  const flood = converted.warningsData.flood_finland_active_all
  if (!flood || flood.features.length === 0) {
    process.stdout.write(
      `scenario ${SYKE_SCENARIO_ID}: SYKE feed has no active floods; skipping\n`
    )
    return null
  }
  const label = `SYKE current floods — snapshot ${converted.updateTimeIso}`
  const description = 'Active flood warnings from SYKE at snapshot time'

  writeEnvelope({
    id: SYKE_SCENARIO_ID,
    label,
    source: 'syke',
    description,
    sourceUrl: SYKE_FEED_URL,
    updateTimeIso: converted.updateTimeIso,
    data: converted.warningsData,
  })

  return {
    id: SYKE_SCENARIO_ID,
    label,
    description,
    source: 'syke',
    sourceUrl: SYKE_FEED_URL,
    updateTimeIso: converted.updateTimeIso,
    warnings: flood.features.length,
    unmatchedAreaNames: converted.stats.unmatchedAreaNames,
  }
}

await main()

export {}

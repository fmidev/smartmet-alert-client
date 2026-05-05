/**
 * Generates the tests/__artifacts__/review.html file used to review map
 * snapshot regressions visually.
 *
 * Inputs:
 *   - `entries`: one record per snapshot key, each carrying a readable
 *     display name, a file-system-safe key used for correlation, the
 *     baseline SVG (from .snap files), the current SVG (from disk), and
 *     whether the matching test had a snapshot assertion failure.
 *
 * The HTML is fully self-contained (inline CSS and JS, inline SVGs) and
 * a reviewer can open it directly in a browser. Three sections:
 *   1. Changed (both sides present, contents differ)
 *   2. Orphans (only in baseline, or only in current)
 *   3. Matching (both sides present and equal)
 *
 * Each "changed" card shows baseline, current, and a pixel-level diff
 * canvas (violet pixels where the two differ). Source excerpts are
 * available on demand behind a <details> disclosure.
 */

export interface ReviewEntryInput {
  fsKey: string
  displayKey: string
  baseline: string | null
  current: string | null
  failed: boolean
}

export interface ReviewSource {
  entries: ReviewEntryInput[]
  generatedAt: Date
}

interface ClassifiedEntry extends ReviewEntryInput {
  status: 'changed' | 'matching' | 'baseline-only' | 'current-only'
}

export function buildReviewHtml(source: ReviewSource): string {
  const entries = classify(source.entries)
  const summary = {
    total: entries.length,
    changed: entries.filter((e) => e.status === 'changed').length,
    matching: entries.filter((e) => e.status === 'matching').length,
    baselineOnly: entries.filter((e) => e.status === 'baseline-only').length,
    currentOnly: entries.filter((e) => e.status === 'current-only').length,
    failed: entries.filter((e) => e.failed).length,
  }

  const changed = entries.filter((e) => e.status === 'changed')
  const matching = entries.filter((e) => e.status === 'matching')
  const orphans = entries.filter(
    (e) => e.status === 'baseline-only' || e.status === 'current-only'
  )

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Map snapshot review</title>
<style>${CSS}</style>
</head>
<body>
<header>
  <h1>Map snapshot review</h1>
  <p class="sub">Generated ${escapeHtml(source.generatedAt.toISOString())}</p>
  <ul class="summary">
    <li class="s-changed"><span>${summary.changed}</span> changed</li>
    <li class="s-failed"><span>${summary.failed}</span> assertion failures</li>
    <li class="s-matching"><span>${summary.matching}</span> matching</li>
    <li class="s-orphan"><span>${summary.baselineOnly + summary.currentOnly}</span> orphans</li>
    <li class="s-total"><span>${summary.total}</span> total</li>
  </ul>
  <p class="help">
    Each changed card shows baseline, current, and a pixel-level diff
    where differing pixels are drawn in <span style="color:#aa00ff;font-weight:600">violet</span>
    (antialiasing is ignored so cross-environment sub-pixel jitter does
    not appear). Use the filter buttons to focus on subsets.
  </p>
  <nav class="filters">
    <button class="active" data-filter="all">All</button>
    <button data-filter="changed">Changed only</button>
    <button data-filter="failed">Assertion failures</button>
    <button data-filter="orphan">Orphans</button>
  </nav>
</header>

<section class="group changed" ${changed.length === 0 ? 'hidden' : ''}>
  <h2>Changed <span class="count">${changed.length}</span></h2>
  ${changed.map(renderChangedCard).join('\n')}
</section>

<section class="group orphan" ${orphans.length === 0 ? 'hidden' : ''}>
  <h2>Orphans <span class="count">${orphans.length}</span></h2>
  ${orphans.map(renderOrphanCard).join('\n')}
</section>

<section class="group matching" ${matching.length === 0 ? 'hidden' : ''}>
  <h2>Matching baseline <span class="count">${matching.length}</span></h2>
  <div class="gallery">
    ${matching.map(renderGalleryItem).join('\n')}
  </div>
</section>

<script>${JS}</script>
</body>
</html>
`
}

function classify(entries: ReviewEntryInput[]): ClassifiedEntry[] {
  const out: ClassifiedEntry[] = entries.map((e) => {
    let status: ClassifiedEntry['status']
    if (e.baseline == null) status = 'current-only'
    else if (e.current == null) status = 'baseline-only'
    else if (e.baseline === e.current) status = 'matching'
    else status = 'changed'
    return { ...e, status }
  })
  out.sort((a, b) => a.displayKey.localeCompare(b.displayKey))
  return out
}

function renderChangedCard(e: ClassifiedEntry): string {
  const flag = e.failed
    ? '<span class="flag failed">assertion failure</span>'
    : '<span class="flag drift">changed on disk</span>'
  return `<article class="card changed" data-filter-tags="changed${e.failed ? ' failed' : ''}">
  <header>
    <h3>${escapeHtml(e.displayKey)}</h3>
    ${flag}
  </header>
  <div class="side-by-side three">
    <figure class="baseline-cell"><figcaption>baseline</figcaption>${inlineSvg(e.baseline)}</figure>
    <figure class="current-cell"><figcaption>current</figcaption>${inlineSvg(e.current)}</figure>
    <figure class="diff-cell">
      <figcaption>diff <span class="diff-count" aria-hidden="true"></span></figcaption>
      <canvas class="diff-canvas" width="440" height="550"></canvas>
    </figure>
  </div>
  <details>
    <summary>Source excerpts</summary>
    <div class="excerpts">
      <pre><code>${escapeHtml(excerpt(e.baseline))}</code></pre>
      <pre><code>${escapeHtml(excerpt(e.current))}</code></pre>
    </div>
  </details>
</article>`
}

function renderOrphanCard(e: ClassifiedEntry): string {
  const side = e.status === 'baseline-only' ? 'baseline' : 'current'
  const svg = e.status === 'baseline-only' ? e.baseline : e.current
  return `<article class="card orphan" data-filter-tags="orphan">
  <header>
    <h3>${escapeHtml(e.displayKey)}</h3>
    <span class="flag orphan">only in ${side}</span>
  </header>
  <div class="single">${inlineSvg(svg)}</div>
</article>`
}

function renderGalleryItem(e: ClassifiedEntry): string {
  return `<figure class="thumb" data-filter-tags="matching">
  <figcaption>${escapeHtml(e.displayKey)}</figcaption>
  ${inlineSvg(e.baseline)}
</figure>`
}

/** SVG strings are trusted (produced by our own tests); inline as-is. */
function inlineSvg(svg: string | null): string {
  if (!svg) return '<div class="missing">(missing)</div>'
  return svg
}

function excerpt(s: string | null, max = 4000): string {
  if (!s) return '(missing)'
  if (s.length <= max) return s
  return `${s.slice(0, max)}\n… (${s.length - max} more bytes truncated)`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

const CSS = `
:root {
  color-scheme: light dark;
  --bg: #fafbfc;
  --card-bg: #ffffff;
  --border: #d7dde3;
  --muted: #596470;
  --text: #1d2530;
  --changed: #c7561c;
  --failed: #b42d2d;
  --matching: #2d7a44;
  --orphan: #7a4ebe;
}
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #10141a;
    --card-bg: #171d26;
    --border: #2a3542;
    --muted: #8894a3;
    --text: #dde3ea;
    --changed: #ffb074;
    --failed: #ff7a7a;
    --matching: #7edc94;
    --orphan: #c4a4ff;
  }
}
* { box-sizing: border-box; }
body { margin: 0; font: 14px/1.45 system-ui, sans-serif; background: var(--bg); color: var(--text); }
header { padding: 24px 32px 8px; border-bottom: 1px solid var(--border); background: var(--card-bg); position: sticky; top: 0; z-index: 5; }
header h1 { margin: 0 0 4px; font-size: 20px; }
header .sub { margin: 0 0 12px; color: var(--muted); font-size: 12px; }
header .help { margin: 8px 0 12px; color: var(--muted); font-size: 12px; max-width: 720px; }
ul.summary { list-style: none; padding: 0; margin: 8px 0; display: flex; flex-wrap: wrap; gap: 16px; }
ul.summary li { font-size: 13px; color: var(--muted); }
ul.summary li span { font-weight: 600; color: var(--text); font-size: 16px; margin-right: 4px; }
ul.summary li.s-changed span { color: var(--changed); }
ul.summary li.s-failed span { color: var(--failed); }
ul.summary li.s-matching span { color: var(--matching); }
ul.summary li.s-orphan span { color: var(--orphan); }
nav.filters { display: flex; gap: 8px; }
nav.filters button { appearance: none; border: 1px solid var(--border); background: transparent; color: var(--text); font: inherit; padding: 6px 12px; border-radius: 4px; cursor: pointer; }
nav.filters button.active { background: var(--text); color: var(--card-bg); border-color: var(--text); }
section.group { padding: 24px 32px; }
section.group h2 { font-size: 16px; margin: 0 0 16px; display: flex; gap: 8px; align-items: baseline; }
section.group h2 .count { color: var(--muted); font-size: 13px; font-weight: normal; }
section.changed h2 { color: var(--changed); }
section.orphan h2 { color: var(--orphan); }
section.matching h2 { color: var(--matching); }
article.card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 24px; padding: 16px; }
article.card header { padding: 0; border: none; background: transparent; position: static; display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 12px; }
article.card h3 { margin: 0; font-size: 14px; font-family: ui-monospace, monospace; word-break: break-word; }
span.flag { font-size: 11px; padding: 3px 8px; border-radius: 4px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.04em; }
span.flag.failed { background: rgba(180, 45, 45, 0.12); color: var(--failed); }
span.flag.drift { background: rgba(199, 86, 28, 0.12); color: var(--changed); }
span.flag.orphan { background: rgba(122, 78, 190, 0.12); color: var(--orphan); }
.side-by-side { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
.side-by-side.three { grid-template-columns: 1fr 1fr 1fr; }
/* baseline, current and diff share one surround: same padding, same grey
 * background, same rounded corners. The diff cell only needs flex in the
 * caption so the pixel count can sit on the right. */
.side-by-side figure { margin: 0; padding: 8px; background: #eef1f4; border-radius: 4px; display: flex; flex-direction: column; }
.side-by-side figure figcaption { font-size: 11px; color: var(--muted); margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.04em; font-family: inherit; }
.side-by-side .diff-cell figcaption { display: flex; justify-content: space-between; align-items: baseline; }
/* Pixel count is data, not a title — intentionally monospace and
 * slightly smaller than the surrounding "diff" label. */
.side-by-side .diff-cell .diff-count { font-family: ui-monospace, monospace; font-size: 10px; letter-spacing: 0; text-transform: none; color: var(--muted); }
/* baseline (SVG), current (SVG) and diff (canvas) all share one size
 * & shape on screen. */
.side-by-side svg,
.side-by-side canvas { width: 100%; height: auto; display: block; aspect-ratio: 440 / 550; background: #ffffff; }
.side-by-side .diff-cell canvas.pending { opacity: 0.35; }
details { margin-top: 12px; border-top: 1px solid var(--border); padding-top: 12px; }
details summary { cursor: pointer; color: var(--muted); font-size: 12px; }
.excerpts { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-top: 8px; }
.excerpts pre { margin: 0; padding: 8px; background: #11161d; color: #d7dde3; border-radius: 4px; overflow: auto; max-height: 320px; font-size: 11px; }
.gallery { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
.gallery .thumb { margin: 0; padding: 8px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 6px; }
.gallery .thumb figcaption { font-size: 11px; color: var(--muted); font-family: ui-monospace, monospace; margin-bottom: 4px; word-break: break-word; }
.gallery .thumb svg { width: 100%; height: auto; display: block; }
.single { background: #eef1f4; padding: 8px; border-radius: 4px; }
.single svg { width: 100%; height: auto; display: block; }
.missing { padding: 24px; text-align: center; color: var(--muted); font-style: italic; }
[hidden] { display: none !important; }
`

/**
 * Pixelmatch v7.1.0 by Vladimir Agafonkin — MIT licensed.
 * Inlined so review.html stays self-contained (no CDN, no bundler).
 * The only change from the published source is removing the `export
 * default` qualifier from the main function so it becomes a plain
 * function reference in the surrounding IIFE's scope.
 *
 * Upstream: https://github.com/mapbox/pixelmatch (node_modules/pixelmatch).
 */
const PIXELMATCH_SRC = `
// Pixelmatch (MIT) - https://github.com/mapbox/pixelmatch
function pixelmatch(img1, img2, output, width, height, options) {
    options = options || {};
    var threshold = options.threshold == null ? 0.1 : options.threshold;
    var alpha = options.alpha == null ? 0.1 : options.alpha;
    var aaColor = options.aaColor || [255, 255, 0];
    var diffColor = options.diffColor || [255, 0, 0];
    var includeAA = options.includeAA;
    var diffColorAlt = options.diffColorAlt;
    var diffMask = options.diffMask;

    if (!isPixelData(img1) || !isPixelData(img2) || (output && !isPixelData(output)))
        throw new Error('Image data: Uint8Array, Uint8ClampedArray or Buffer expected.');
    if (img1.length !== img2.length || (output && output.length !== img1.length))
        throw new Error('Image sizes do not match.');
    if (img1.length !== width * height * 4) throw new Error('Image data size does not match width/height.');

    var len = width * height;
    var a32 = new Uint32Array(img1.buffer, img1.byteOffset, len);
    var b32 = new Uint32Array(img2.buffer, img2.byteOffset, len);
    var identical = true;
    for (var i = 0; i < len; i++) {
        if (a32[i] !== b32[i]) { identical = false; break; }
    }
    if (identical) {
        if (output && !diffMask) {
            for (var j = 0; j < len; j++) drawGrayPixel(img1, 4 * j, alpha, output);
        }
        return 0;
    }

    var maxDelta = 35215 * threshold * threshold;
    var aaR = aaColor[0], aaG = aaColor[1], aaB = aaColor[2];
    var diffR = diffColor[0], diffG = diffColor[1], diffB = diffColor[2];
    var altArr = diffColorAlt || diffColor;
    var altR = altArr[0], altG = altArr[1], altB = altArr[2];
    var diff = 0;

    for (var y = 0; y < height; y++) {
        for (var x = 0; x < width; x++) {
            var idx = y * width + x;
            var pos = idx * 4;
            var delta = a32[idx] === b32[idx] ? 0 : colorDelta(img1, img2, pos, pos, false);
            if (Math.abs(delta) > maxDelta) {
                var isAA = antialiased(img1, x, y, width, height, a32, b32) || antialiased(img2, x, y, width, height, b32, a32);
                if (!includeAA && isAA) {
                    if (output && !diffMask) drawPixel(output, pos, aaR, aaG, aaB);
                } else {
                    if (output) {
                        if (delta < 0) drawPixel(output, pos, altR, altG, altB);
                        else drawPixel(output, pos, diffR, diffG, diffB);
                    }
                    diff++;
                }
            } else if (output && !diffMask) {
                drawGrayPixel(img1, pos, alpha, output);
            }
        }
    }
    return diff;
}

function isPixelData(arr) {
    return ArrayBuffer.isView(arr) && arr.BYTES_PER_ELEMENT === 1;
}

function antialiased(img, x1, y1, width, height, a32, b32) {
    var x0 = Math.max(x1 - 1, 0);
    var y0 = Math.max(y1 - 1, 0);
    var x2 = Math.min(x1 + 1, width - 1);
    var y2 = Math.min(y1 + 1, height - 1);
    var pos = y1 * width + x1;
    var zeroes = x1 === x0 || x1 === x2 || y1 === y0 || y1 === y2 ? 1 : 0;
    var min = 0, max = 0, minX = 0, minY = 0, maxX = 0, maxY = 0;
    for (var x = x0; x <= x2; x++) {
        for (var y = y0; y <= y2; y++) {
            if (x === x1 && y === y1) continue;
            var delta = colorDelta(img, img, pos * 4, (y * width + x) * 4, true);
            if (delta === 0) {
                zeroes++;
                if (zeroes > 2) return false;
            } else if (delta < min) {
                min = delta; minX = x; minY = y;
            } else if (delta > max) {
                max = delta; maxX = x; maxY = y;
            }
        }
    }
    if (min === 0 || max === 0) return false;
    return (hasManySiblings(a32, minX, minY, width, height) && hasManySiblings(b32, minX, minY, width, height)) ||
           (hasManySiblings(a32, maxX, maxY, width, height) && hasManySiblings(b32, maxX, maxY, width, height));
}

function hasManySiblings(img, x1, y1, width, height) {
    var x0 = Math.max(x1 - 1, 0);
    var y0 = Math.max(y1 - 1, 0);
    var x2 = Math.min(x1 + 1, width - 1);
    var y2 = Math.min(y1 + 1, height - 1);
    var val = img[y1 * width + x1];
    var zeroes = x1 === x0 || x1 === x2 || y1 === y0 || y1 === y2 ? 1 : 0;
    for (var x = x0; x <= x2; x++) {
        for (var y = y0; y <= y2; y++) {
            if (x === x1 && y === y1) continue;
            zeroes += +(val === img[y * width + x]);
            if (zeroes > 2) return true;
        }
    }
    return false;
}

function colorDelta(img1, img2, k, m, yOnly) {
    var r1 = img1[k], g1 = img1[k + 1], b1 = img1[k + 2], a1 = img1[k + 3];
    var r2 = img2[m], g2 = img2[m + 1], b2 = img2[m + 2], a2 = img2[m + 3];
    var dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
    var da = a1 - a2;
    if (!dr && !dg && !db && !da) return 0;
    if (a1 < 255 || a2 < 255) {
        var rb = 48 + 159 * (k % 2);
        var gb = 48 + 159 * ((k / 1.618033988749895 | 0) % 2);
        var bb = 48 + 159 * ((k / 2.618033988749895 | 0) % 2);
        dr = (r1 * a1 - r2 * a2 - rb * da) / 255;
        dg = (g1 * a1 - g2 * a2 - gb * da) / 255;
        db = (b1 * a1 - b2 * a2 - bb * da) / 255;
    }
    var yc = dr * 0.29889531 + dg * 0.58662247 + db * 0.11448223;
    if (yOnly) return yc;
    var ic = dr * 0.59597799 - dg * 0.27417610 - db * 0.32180189;
    var qc = dr * 0.21147017 - dg * 0.52261711 + db * 0.31114694;
    var deltaC = 0.5053 * yc * yc + 0.299 * ic * ic + 0.1957 * qc * qc;
    return yc > 0 ? -deltaC : deltaC;
}

function drawPixel(output, pos, r, g, b) {
    output[pos] = r; output[pos + 1] = g; output[pos + 2] = b; output[pos + 3] = 255;
}

function drawGrayPixel(img, i, alpha, output) {
    var val = 255 + (img[i] * 0.29889531 + img[i + 1] * 0.58662247 + img[i + 2] * 0.11448223 - 255) * alpha * img[i + 3] / 255;
    drawPixel(output, i, val, val, val);
}
`

const JS = `
${PIXELMATCH_SRC}

(function () {
  const buttons = document.querySelectorAll('nav.filters button');
  buttons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter');
      document.querySelectorAll('[data-filter-tags]').forEach(function (el) {
        const tags = (el.getAttribute('data-filter-tags') || '').split(/\\\\s+/);
        el.style.display =
          filter === 'all' || tags.indexOf(filter) !== -1 ? '' : 'none';
      });
    });
  });

  // -------------------------------------------------------------------
  // Visual diff rendering
  //
  // For each "changed" card we rasterize the baseline and current SVGs
  // into 440×550 canvases, run pixelmatch to compute a per-pixel diff,
  // and paint it into the third canvas. Pixels that differ are drawn in
  // violet (#aa00ff) — a colour not used by the application, chosen
  // specifically because the app already uses red at the highest
  // warning level. Pixelmatch's antialiasing detector is left enabled
  // so sub-pixel rendering differences are ignored (this is what made
  // the previous Playwright approach unreliable across environments).
  //
  // Work is deferred per card with an IntersectionObserver so the page
  // opens instantly even when there are many changed cards.
  // -------------------------------------------------------------------

  const MAP_WIDTH = 440;
  const MAP_HEIGHT = 550;
  const DIFF_COLOR = [170, 0, 255];      // violet
  const DIFF_COLOR_ALT = [120, 0, 210];  // slightly darker violet for dark-on-light drift
  const AA_COLOR = [255, 200, 0];        // amber for anti-aliasing (informational)

  const svgSerializer = new XMLSerializer();

  /**
   * Rasterise an SVG element into a 440×550 ImageData.
   *
   * We serialise the live element with XMLSerializer (rather than
   * .outerHTML) so the result is well-formed XML, then pass the
   * bytes via a Blob URL rather than a data: URL. Chromium rejects
   * very large data URLs and some Firefox builds reject non-ASCII
   * bytes in them even when URL-encoded — scenario 48 is roughly
   * 170 KB of SVG and was one of the cases that hit such a limit.
   * Blob URLs have no practical size cap.
   *
   * Duplicate id attributes inside the warning-icon SVGs used to
   * prevent the browser's <img> decoder from loading the SVG at all
   * (the image decoder is stricter than inline rendering). That has
   * been fixed in src/composables/useConfig.ts: helper icons now
   * emit unique id prefixes per instance, so no post-processing is
   * needed here any more.
   */
  function loadSvgAsImageData(svgElement) {
    return new Promise(function (resolve, reject) {
      const svgText = svgSerializer.serializeToString(svgElement);
      const blob = new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      img.onload = function () {
        URL.revokeObjectURL(url);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = MAP_WIDTH;
          canvas.height = MAP_HEIGHT;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, MAP_WIDTH, MAP_HEIGHT);
          ctx.drawImage(img, 0, 0, MAP_WIDTH, MAP_HEIGHT);
          resolve(ctx.getImageData(0, 0, MAP_WIDTH, MAP_HEIGHT));
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = function (ev) {
        URL.revokeObjectURL(url);
        reject(new Error('SVG failed to decode as image: ' + (ev && ev.message ? ev.message : 'unknown error')));
      };
      img.src = url;
    });
  }

  async function renderDiff(card) {
    const baseSvgEl = card.querySelector('.baseline-cell svg');
    const curSvgEl = card.querySelector('.current-cell svg');
    const canvas = card.querySelector('.diff-canvas');
    const counter = card.querySelector('.diff-count');
    if (!baseSvgEl || !curSvgEl || !canvas) return;
    canvas.classList.add('pending');
    try {
      const [baseData, curData] = await Promise.all([
        loadSvgAsImageData(baseSvgEl),
        loadSvgAsImageData(curSvgEl),
      ]);
      const diffData = new ImageData(MAP_WIDTH, MAP_HEIGHT);
      const diffCount = pixelmatch(
        baseData.data,
        curData.data,
        diffData.data,
        MAP_WIDTH,
        MAP_HEIGHT,
        {
          threshold: 0.1,
          alpha: 0.15,
          aaColor: AA_COLOR,
          diffColor: DIFF_COLOR,
          diffColorAlt: DIFF_COLOR_ALT,
        }
      );
      const ctx = canvas.getContext('2d');
      ctx.putImageData(diffData, 0, 0);
      if (counter) {
        counter.textContent = diffCount + ' px differ';
      }
    } catch (err) {
      if (counter) counter.textContent = 'diff unavailable';
      // Surface the underlying reason so 'diff unavailable' cards can
      // be diagnosed from the browser console rather than staying a
      // silent failure.
      console.warn('Diff rendering failed for card', card, err);
    } finally {
      canvas.classList.remove('pending');
    }
  }

  const pending = new WeakSet();
  function queue(card) {
    if (pending.has(card)) return;
    pending.add(card);
    renderDiff(card);
  }

  const changedCards = Array.from(document.querySelectorAll('article.card.changed'));
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver(function (entries, obs) {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          queue(entry.target);
          obs.unobserve(entry.target);
        }
      }
    }, { rootMargin: '200px 0px' });
    changedCards.forEach(function (card) { io.observe(card); });
  } else {
    // Fallback: compute on load (older browsers)
    changedCards.forEach(queue);
  }
})();
`

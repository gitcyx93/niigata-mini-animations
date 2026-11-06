#!/usr/bin/env node
'use strict';
// Read-only, sampled inspection of the existing render(t) contract. No artwork changes.
const fs = require('node:fs'), path = require('node:path');
const crypto = require('node:crypto'), {spawnSync} = require('node:child_process');
const {pathToFileURL} = require('node:url');
const MAX_SAMPLES = 60, VIEWPORT = {width: 1080, height: 1920};
const HELP = `Usage: node viz/tools/inspect-animation.cjs <page.html> [options]
  --times 0,3.2,10       Explicit sample times in seconds (0 <= t < duration)
  --out report.json     Save JSON; otherwise write JSON to stdout
  --compare old.html    Compare full RGBA hashes at shared sampled times
  --help                Show help without loading Playwright or a browser
Environment: BROWSER_EXE, PLAYWRIGHT_MODULE, BROWSER_ARGS (JSON string array).
Default browser arguments fix Canvas 2D to software rasterization for pixel checks;
BROWSER_ARGS replaces that list. WebGL is not disabled by default.
Errors/non-determinism return exit 1. Comparison differences are reported, not failures.
This does not judge artwork, prove full-film equivalence, or test sound playback.`;

function options(argv) {
  const o = {};
  if (argv.includes('--help') || argv.includes('-h')) return {help: true};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (['--times', '--out', '--compare'].includes(a)) {
      if (!argv[i + 1] || argv[i + 1].startsWith('--')) throw Error('Missing value for ' + a);
      o[a.slice(2)] = argv[++i];
    } else if (a.startsWith('-') || o.file) throw Error('Unexpected argument: ' + a);
    else o.file = a;
  }
  if (!o.file) throw Error('An animation HTML file is required. Use --help.');
  if (o.times !== undefined) {
    if (!o.times.trim() || o.times.split(',').some(s => !s.trim())) throw Error('Invalid --times list');
    o.times = [...new Set(o.times.split(',').map(Number))].sort((a, b) => a - b);
    if (o.times.length > MAX_SAMPLES || o.times.some(t => !Number.isFinite(t) || t < 0))
      throw Error('--times must contain at most 60 finite, nonnegative seconds');
  }
  for (const key of ['file', 'compare']) if (o[key]) {
    o[key] = path.resolve(o[key]);
    if (!fs.statSync(o[key]).isFile()) throw Error('Not a file: ' + o[key]);
  }
  if (o.out) o.out = path.resolve(o.out);
  if (o.out === o.file || o.out === o.compare) throw Error('--out must not overwrite an input');
  return o;
}

function provenance(file) {
  const git = spawnSync('git', ['-C', path.dirname(file), 'rev-parse', 'HEAD'], {encoding: 'utf8'});
  return {file, bytes: fs.statSync(file).size,
    sha256: crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex'),
    gitHead: git.status === 0 ? git.stdout.trim() : null};
}
function shortUrl(url) { return url.startsWith('data:') ? url.slice(0, url.indexOf(',') + 1) + '[omitted]' : url; }

function chooseTimes(meta, explicit, comparison) {
  const d = meta.durationSeconds, last = Math.max(0, d - 1 / 30);
  if (explicit) {
    const outside = explicit.filter(t => t >= d);
    if (outside.length && !comparison) throw Error('Sample times must be below ' + d + ' seconds: ' + outside.join(', '));
    return {times: explicit.filter(t => t < d), skippedTimes: outside, reduced: false};
  }
  const times = [0, d / 4, d / 2, d * .75, last];
  for (const item of meta.timeline || []) if (Array.isArray(item)) {
    const [, from, to] = item;
    if (Number.isFinite(from) && Number.isFinite(to)) {
      times.push((from + to) / 2);
      for (const t of [from, to]) for (const delta of [-1 / 30, 0, 1 / 30]) times.push(t + delta);
    }
  }
  if (Number.isFinite(meta.startSeconds)) times.push(((meta.startSeconds % d) + d) % d);
  const all = [...new Set(times.filter(t => t >= 0 && t < d).map(t => +t.toFixed(9)))].sort((a, b) => a - b);
  const chosen = all.length <= MAX_SAMPLES ? all : Array.from({length: MAX_SAMPLES}, (_, i) => all[Math.round(i * (all.length - 1) / (MAX_SAMPLES - 1))]);
  return {times: chosen, skippedTimes: [], reduced: all.length > MAX_SAMPLES};
}

async function metadata(page) {
  return page.evaluate(() => {
    const c = document.getElementById('c');
    const d = typeof duration === 'function' ? duration() : window.LOOP_SECONDS;
    if (!c || typeof window.render !== 'function') throw Error('Expected canvas#c and window.render(t)');
    if (!Number.isFinite(d) || d <= 0) throw Error('No finite positive duration was exposed');
    return {
      durationSeconds: d, startSeconds: Number.isFinite(window.START_SECONDS) ? window.START_SECONDS : null,
      canvas: {width: c.width, height: c.height},
      variant: typeof variant === 'string' ? variant : null,
      timeline: typeof PLAN !== 'undefined' && Array.isArray(PLAN) ? PLAN : null,
      narration: typeof STORY_C !== 'undefined' ? STORY_C : typeof STORY !== 'undefined' ? STORY : null,
      textWindows: typeof TEXT_WINDOWS !== 'undefined' ? TEXT_WINDOWS : null,
      capabilities: {render: true, shotAt: typeof shotAt === 'function', sourceTime: typeof sourceTime === 'function',
        camAt: typeof camAt === 'function', skiInfo: typeof SKI3D !== 'undefined' && typeof SKI3D.getInfo === 'function',
        townMotion: typeof townWind === 'function', soundMetadata: !!window.YAHIKO_SOUND_METADATA,
        soundController: !!window.YahikoSound, fullPixelHash: !!window.crypto?.subtle},
      fonts: [...document.fonts].map(f => ({family: f.family, weight: f.weight, status: f.status})),
      sound: window.YAHIKO_SOUND_METADATA ? {durationSeconds: window.YAHIKO_SOUND_METADATA.duration_seconds,
        playbackTested: false, reason: '?record bypasses the sound controller'} : null
    };
  });
}

async function frame(page, time, details = true) {
  return page.evaluate(async ({time, details}) => {
    const c = document.getElementById('c'), x = c.getContext('2d');
    const start = performance.now(); window.render(time);
    const renderMs = performance.now() - start, readStart = performance.now();
    const pixels = x.getImageData(0, 0, c.width, c.height).data;
    const readbackMs = performance.now() - readStart;
    const digest = await crypto.subtle.digest('SHA-256', pixels);
    const sha256 = [...new Uint8Array(digest)].map(v => v.toString(16).padStart(2, '0')).join('');
    if (!details) return {sha256};
    const state = {}, missing = [];
    const shot = typeof shotAt === 'function' ? shotAt(time) : null;
    if (shot === null) missing.push('scene_id');
    if (typeof camAt === 'function') state.baseCamera = camAt(time);
    // Close-ups or WebGL shots can replace the panorama described by camAt.
    missing.push('actual_camera'); // No generic active-camera interface is exposed.
    if (typeof SKI3D !== 'undefined' && typeof SKI3D.getInfo === 'function' && time >= 3.3 && time < 8.7) {
      const info = SKI3D.getInfo();
      if (info && (info.webgl === false || Math.abs(info.time - time) < 1e-5)) state.ski = info;
      else missing.push('fresh_ski_state');
    }
    if (typeof TOWN0 === 'number' && time >= TOWN0 && typeof townWind === 'function') {
      const a = time - TOWN0;
      state.town = {localTime: a, wind: townWind(a)};
      if (typeof townFeet === 'function') state.town.feet = townFeet(a);
      if (typeof townWindowState === 'function') state.town.windows = townWindowState(a);
      if (typeof townCatState === 'function') state.town.cat = townCatState(a);
      if (typeof townCarryLeavesV31 === 'function' && typeof townCarryStateV31 === 'function')
        state.town.carryLeaves = townCarryLeavesV31().map(leaf => townCarryStateV31(leaf, time));
    }
    let r = 0, g = 0, b = 0, count = 0;
    for (let i = 0; i < pixels.length; i += 64) {r += pixels[i]; g += pixels[i + 1]; b += pixels[i + 2]; count++;}
    return {time, sha256, shot, sourceTime: typeof sourceTime === 'function' && (typeof variant === 'undefined' || variant !== 'V6') ? sourceTime(time) : null,
      state, unavailable: missing, renderMs, readbackMs,
      pixelStatistics: {stridePixels: 16, meanRGB: [r / count, g / count, b / count]}};
  }, {time, details});
}

async function inspect(browser, file, explicit, comparison = false) {
  const result = {source: provenance(file), metadata: null, samplePolicy: null, samples: [], errors: [], requests: []};
  const context = await browser.newContext({viewport: VIEWPORT, deviceScaleFactor: 1});
  const page = await context.newPage();
  const error = (kind, message) => {if (result.errors.length < 100) result.errors.push({kind, message});};
  page.on('pageerror', e => error('pageerror', e.message));
  page.on('console', m => {if (m.type() === 'error') error('console', m.text());});
  page.on('request', req => {if (/^https?:/.test(req.url()) && result.requests.length < 100) result.requests.push(shortUrl(req.url()));});
  page.on('requestfailed', req => error('requestfailed', shortUrl(req.url()) + ': ' + req.failure()?.errorText));
  page.on('response', res => {if (res.status() >= 400) error('http', res.status() + ' ' + shortUrl(res.url()));});
  try {
    const url = pathToFileURL(file); url.searchParams.set('record', '1');
    await page.goto(url.href, {waitUntil: 'load', timeout: 120000});
    await page.waitForFunction(() => window.READY === true, null, {timeout: 120000});
    await page.waitForFunction(() => document.fonts.status === 'loaded', null, {timeout: 30000});
    result.metadata = await metadata(page);
    for (const f of result.metadata.fonts) if (f.status === 'error') error('font', f.family + ' ' + f.weight);
    if (!result.metadata.capabilities.fullPixelHash) throw Error('Web Crypto is unavailable; full RGBA hashing cannot run');
    result.samplePolicy = chooseTimes(result.metadata, explicit, comparison);
    for (const t of result.samplePolicy.times) {
      const sample = await frame(page, t);
      const perturbTime = (t + result.metadata.durationSeconds * .47) % result.metadata.durationSeconds;
      await page.evaluate(t => window.render(t), perturbTime);
      const repeated = await frame(page, t, false);
      sample.determinism = {perturbTime, repeatedSha256: repeated.sha256, matches: sample.sha256 === repeated.sha256};
      if (!sample.determinism.matches) error('determinism', 'Frame changed after another time was rendered: ' + t);
      result.samples.push(sample);
    }
    result.summary = {sampleCount: result.samples.length,
      determinism: result.samples.length ? (result.samples.every(s => s.determinism.matches) ? 'passed_at_samples' : 'failed') : 'not_tested',
      timingScope: 'headless synchronous render and pixel readback; not display FPS or target-device performance'};
  } catch (e) {error('inspection', e.message);}
  finally {await context.close();}
  result.status = result.errors.length ? 'failed' : 'completed';
  return result;
}

function compare(current, baseline) {
  const byTime = new Map(baseline.samples.map(s => [s.time, s.sha256]));
  const shared = current.samples.filter(s => byTime.has(s.time));
  const rows = shared.map(s => ({time: s.time, matches: s.sha256 === byTime.get(s.time)}));
  return {scope: 'shared sampled frames only', matches_at_samples: rows.length ? rows.every(r => r.matches) : null,
    sharedSampleCount: rows.length, differentSampleTimes: rows.filter(r => !r.matches).map(r => r.time),
    untestedSampleTimes: current.samples.filter(s => !byTime.has(s.time)).map(s => s.time),
    durationMatches: current.metadata && baseline.metadata ? current.metadata.durationSeconds === baseline.metadata.durationSeconds : null,
    results: rows};
}

(async () => {
  let opt, browser;
  const report = {schemaVersion: 2, createdAt: new Date().toISOString(), status: 'failed',
    scope: {sampled_only: true, audio_not_tested: true, visual_quality_not_judged: true,
      continuous_playback_not_tested: true, standalone_offline_not_tested: true,
      missing_capability_is_not_a_pass: true, pixel_hash: 'SHA-256 of all RGBA bytes'},
    environment: {node: process.version, platform: process.platform, browser: null, headless: true,
      viewport: VIEWPORT, deviceScaleFactor: 1}, errors: []};
  try {
    opt = options(process.argv.slice(2));
    if (opt.help) {console.log(HELP); return;}
    // Repeated pixel readbacks can change the accelerated Canvas raster path.
    // Keep 2D pixel comparisons on one backend without disabling WebGL scenes.
    const args = JSON.parse(process.env.BROWSER_ARGS || '["--disable-accelerated-2d-canvas"]');
    if (!Array.isArray(args) || args.some(a => typeof a !== 'string')) throw Error('BROWSER_ARGS must be a JSON string array');
    const {chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
    browser = await chromium.launch({headless: true, executablePath: process.env.BROWSER_EXE || undefined, args});
    report.environment.browser = browser.version(); report.environment.browserArgs = args;
    report.environment.canvas2DPolicy = args.includes('--disable-accelerated-2d-canvas') ? 'software-requested' : 'browser-default';
    report.current = await inspect(browser, opt.file, opt.times);
    if (opt.compare && report.current.metadata) {
      report.baseline = await inspect(browser, opt.compare, report.current.samplePolicy?.times || opt.times, true);
      report.comparison = compare(report.current, report.baseline);
    }
    report.status = report.current.status === 'completed' && (!report.baseline || report.baseline.status === 'completed') ? 'completed' : 'failed';
  } catch (e) {report.errors.push({kind: 'setup', message: e.message});}
  finally {if (browser) await browser.close();}
  const json = JSON.stringify(report, null, 2) + '\n';
  if (opt?.out) {
    fs.mkdirSync(path.dirname(opt.out), {recursive: true}); fs.writeFileSync(opt.out, json);
    console.log(JSON.stringify({status: report.status, sampleCount: report.current?.samples.length || 0,
      matches_at_samples: report.comparison?.matches_at_samples ?? null, report: opt.out}));
  } else process.stdout.write(json);
  if (report.status === 'failed') process.exitCode = 1;
})().catch(e => {console.error(e.message); process.exitCode = 1;});

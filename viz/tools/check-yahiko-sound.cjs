// Validate picture parity and the actual media-clock player, without network.
const { chromium } = require('playwright');
const { createHash } = require('node:crypto');
const { pathToFileURL } = require('node:url');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const reference = path.join(root, 'reference/yahiko-v16-travel-sound');
const visual = path.join(root, 'viz/autumn/yahiko-v16-travel.html');
const sound = path.join(root, 'viz/autumn/yahiko-v16-travel-sound.html');
const times = [0, 2.8, 3.6, 7, 8.5, 11.7, 14.8, 18.5, 21.5];
(async () => {
  // Software rasterization makes pixel hashes reproducible across page contexts.
  // This is a parity test, not a claim about GPU/phone playback performance.
  const browser = await chromium.launch({ headless: true, args: ['--disable-gpu'], ...(process.env.BROWSER_EXE ? { executablePath: process.env.BROWSER_EXE } : {}) });
  const errors = [], requests = [], parity = [];
  async function open(file, record = false) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    page.on('pageerror', error => errors.push(error.message));
    await page.route(/^https?:/, route => { requests.push(route.request().url()); return route.abort(); });
    await page.goto(pathToFileURL(file).href + (record ? '?record' : ''));
    await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(350);
    return page;
  }
  async function frameHash(page, t) {
    const data = await page.evaluate(time => { window.render(time); return document.getElementById('c').toDataURL('image/png'); }, t);
    return createHash('sha256').update(Buffer.from(data.split(',')[1], 'base64')).digest('hex');
  }
  try {
    console.log('Check: opening original and sound edition in record mode');
    const original = await open(visual, true), generated = await open(sound, true);
    for (const time of times) {
      const originalHash = await frameHash(original, time), generatedHash = await frameHash(generated, time);
      assert.equal(generatedHash, originalHash, `Picture mismatch at ${time}s`);
      parity.push({ time, sha256: originalHash, match: true });
    }
    await original.close(); await generated.close();
    console.log('Check: picture parity passed; opening interactive sound player');
    const page = await open(sound);
    assert.equal(await page.evaluate(() => YahikoSound.getState().paused), true);
    assert.equal(await page.evaluate(() => YahikoSound.getState().sourceClockPlaying), false);
    await page.click('#play');
    await page.waitForTimeout(1200);
    let state = await page.evaluate(() => YahikoSound.getState());
    assert(state.time > 0.5 && !state.paused);
    assert(Math.abs(state.time - state.renderedTime) < 0.2);
    assert.equal(state.sourceClockPlaying, false);
    const firstPlay = state;
    await page.click('#play');
    const pausedAt = await page.evaluate(() => YahikoSound.audio.currentTime);
    await page.waitForTimeout(350);
    assert(Math.abs((await page.evaluate(() => YahikoSound.audio.currentTime)) - pausedAt) < 0.02);
    await page.click('[data-time="13.6"]');
    await page.waitForTimeout(300);
    state = await page.evaluate(() => YahikoSound.getState());
    assert(state.paused && Math.abs(state.time - 13.6) < 0.05);
    assert(Math.abs(state.renderedTime - 13.6) < 0.05);
    await page.click('#sound-mute'); assert.equal(await page.evaluate(() => YahikoSound.audio.muted), true);
    await page.click('#sound-mute');
    await page.evaluate(() => { const volume = document.getElementById('sound-volume'); volume.value = '0.5'; volume.dispatchEvent(new Event('input', { bubbles: true })); });
    assert.equal(await page.evaluate(() => YahikoSound.audio.volume), 0.5);
    console.log('Check: controls passed; running full 22.8-second playback');
    await page.uncheck('#sound-loop');
    await page.click('#restart');
    await page.waitForFunction(() => YahikoSound.audio.ended, null, { timeout: 35000 });
    state = await page.evaluate(() => YahikoSound.getState());
    assert(state.paused && Math.abs(state.time - 22.8) < 0.08);
    assert(Math.abs(state.time - state.renderedTime) < 0.2);
    const fullPlayback = state;
    await page.check('#sound-loop');
    await page.evaluate(() => { YahikoSound.seek(22.1); });
    await page.click('#play'); await page.waitForTimeout(1500);
    state = await page.evaluate(() => YahikoSound.getState());
    assert(!state.paused && state.time < 2);
    const loopPlayback = state;
    await page.click('#play');
    await page.setViewportSize({ width: 390, height: 844 });
    const mobile = await page.evaluate(() => ({ viewport: innerWidth, width: document.documentElement.scrollWidth }));
    assert.equal(mobile.width, mobile.viewport);
    assert.deepEqual(errors, []); assert.deepEqual(requests, []);
    fs.mkdirSync(reference, { recursive: true });
    fs.writeFileSync(path.join(reference, 'playback-check.json'), JSON.stringify({ visual: path.relative(root, visual), generated: path.relative(root, sound), engine: 'Headless Chromium with software rasterization', parity, firstPlay, fullPlayback, loopPlayback, chapterSeeking: true, pauseStable: true, muteAndVolume: true, mobile, pageErrors: errors, externalRequests: requests, limitations: 'Real browser clock/control/full-cycle tests and key-frame parity, not human auditory or continuous visual review.' }, null, 2) + '\n');
    console.log('PASS: 9 exact picture matches; media-clock play/pause/seek/mute/volume; full playback and loop; offline mobile layout.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });

'use strict';

const {pathToFileURL} = require('node:url');
const path = require('node:path');

function browserOptions({pixelStable = false, ...overrides} = {}) {
  const args = process.env.BROWSER_ARGS === undefined
    ? (pixelStable ? ['--disable-accelerated-2d-canvas'] : [])
    : JSON.parse(process.env.BROWSER_ARGS);
  if (!Array.isArray(args) || args.some(value => typeof value !== 'string')) {
    throw Error('BROWSER_ARGS must be a JSON array of strings');
  }
  const options = {headless: true, args, ...overrides};
  if (process.env.BROWSER_EXE) options.executablePath = process.env.BROWSER_EXE;
  else if (process.env.BROWSER_CHANNEL) options.channel = process.env.BROWSER_CHANNEL;
  return options;
}

async function launchBrowser(options) {
  // Keep help, validation and static tooling usable without a browser install.
  let chromium;
  try {
    ({chromium} = require(process.env.PLAYWRIGHT_MODULE || 'playwright'));
  } catch (error) {
    throw Error('Playwright is unavailable. Run npm ci, or set PLAYWRIGHT_MODULE to an existing installation.', {cause: error});
  }
  return chromium.launch(browserOptions(options));
}

function shortUrl(url) {
  return url.startsWith('data:') ? url.slice(0, url.indexOf(',') + 1) + '[omitted]' : url;
}

function watchPageErrors(page) {
  const errors = [];
  const add = (kind, message) => {
    if (errors.length < 100) errors.push({kind, message});
  };
  page.on('pageerror', error => add('pageerror', error.message));
  page.on('console', message => {
    if (message.type() === 'error') add('console', message.text());
  });
  page.on('requestfailed', request => add('requestfailed', `${shortUrl(request.url())}: ${request.failure()?.errorText}`));
  page.on('response', response => {
    if (response.status() >= 400) add('http', `${response.status()} ${shortUrl(response.url())}`);
  });
  return errors;
}

function assertNoPageErrors(errors) {
  if (errors.length) throw Error(errors.map(error => `${error.kind}: ${error.message}`).join('\n'));
}

async function readAnimationInfo(page) {
  return page.evaluate(() => {
    const canvas = document.getElementById('c');
    const seconds = typeof duration === 'function' ? duration() : window.LOOP_SECONDS;
    if (!canvas || typeof window.render !== 'function') throw Error('Expected canvas#c and window.render(t)');
    if (!Number.isFinite(seconds) || seconds <= 0) throw Error('Animation must expose a finite positive duration');
    if (!canvas.width || !canvas.height) throw Error('Animation canvas has no dimensions');
    return {
      duration: seconds,
      width: canvas.width,
      height: canvas.height,
      startSeconds: Number.isFinite(window.START_SECONDS) ? window.START_SECONDS : 0,
      fonts: [...document.fonts].map(font => ({family: font.family, weight: font.weight, status: font.status}))
    };
  });
}

async function openAnimation(browser, file, {
  viewport = {width: 1080, height: 1920}, timeout = 120000, record = true
} = {}) {
  const context = await browser.newContext({viewport, deviceScaleFactor: 1});
  const page = await context.newPage();
  const errors = watchPageErrors(page);
  try {
    const url = /^https?:\/\//.test(file) ? new URL(file) : pathToFileURL(path.resolve(file));
    if (record) url.searchParams.set('record', '1');
    await page.goto(url.href, {waitUntil: 'load', timeout});
    await page.waitForFunction(() => window.READY === true, null, {timeout});
    await page.evaluate(() => document.fonts.ready);
    const metadata = await readAnimationInfo(page);
    for (const font of metadata.fonts) {
      if (font.status === 'error') errors.push({kind: 'font', message: `${font.family} ${font.weight}`});
    }
    assertNoPageErrors(errors);
    return {page, context, errors, metadata};
  } catch (error) {
    await context.close();
    throw error;
  }
}

module.exports = {browserOptions, launchBrowser, watchPageErrors, assertNoPageErrors, readAnimationInfo, openAnimation};

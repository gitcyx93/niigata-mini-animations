#!/usr/bin/env node
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const {ROOT, readCatalog, projectPath} = require('./lib/catalog.cjs');
const {launchBrowser, openAnimation, assertNoPageErrors} = require('./lib/browser.cjs');
const {reportPath, writeReport} = require('./lib/reports.cjs');

function options(argv) {
  const result = {};
  for (let i=0;i<argv.length;i++) {
    const arg = argv[i];
    if (arg === '--help' || arg === '--static') result[arg.slice(2)] = true;
    else if (['--id','--locale','--out'].includes(arg) && argv[i+1] && !argv[i+1].startsWith('--')) result[arg.slice(2)] = argv[++i];
    else throw Error('Unknown or incomplete option: ' + arg);
  }
  return result;
}

async function check(argv = process.argv.slice(2)) {
  const opt = options(argv);
  if (opt.help) {
    console.log('Usage: npm run check -- [--id yahiko] [--locale zh] [--static] [--out report.json]\nChecks current catalog entries, scripts, fonts, dimensions and deterministic sampled rendering.');
    return;
  }
  const catalog = readCatalog();
  if (opt.id && !catalog.some(entry => entry.id === opt.id)) throw Error('Unknown animation: ' + opt.id);
  const entries = catalog.filter(entry => !opt.id || entry.id === opt.id).flatMap(entry => Object.entries(entry.locales).filter(([locale]) => !opt.locale || locale === opt.locale).map(([locale, variant]) => ({...entry, ...variant, locale})));
  if (!entries.length) throw Error('No matching animation locale');
  const type = 'niigata-animation-check';
  const output = reportPath(opt.out || path.join(ROOT, 'output/checks/latest.json'), type);
  const report = {type, schemaVersion:1, createdAt:new Date().toISOString(), mode:opt.static ? 'static' : 'browser', status:'passed', entries:[]};
  let browser;
  try {
    if (!opt.static) browser = await launchBrowser({pixelStable:true});
    for (const entry of entries) {
      const result = {id:entry.id, locale:entry.locale, page:entry.page, status:'passed'};
      let opened;
      try {
        const file = projectPath(entry.page), html = fs.readFileSync(file, 'utf8');
        let scripts = 0;
        for (const [, attrs, script] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
          if (/\b(?:src|type)\s*=/.test(attrs)) continue;
          new vm.Script(script, {filename:entry.page}); scripts++;
        }
        if (!scripts) throw Error('No inline animation scripts found');
        result.scripts = scripts;
        if (browser) {
          opened = await openAnimation(browser, file);
          const {page, metadata, errors} = opened;
          for (const key of ['duration','width','height']) if (Math.abs(metadata[key] - entry[key]) > 1e-6) throw Error(`${key}: catalog ${entry[key]}, page ${metadata[key]}`);
          result.duration = metadata.duration;
          result.fonts = metadata.fonts.length;
          result.times = [0, entry.duration / 4, entry.duration / 2, entry.duration * 3/4, entry.duration - 1/30];
          result.hashes = await page.evaluate(async times => {
            const canvas = document.getElementById('c'), context = canvas.getContext('2d');
            const hash = async time => {
              window.render(time);
              const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
              const digest = await crypto.subtle.digest('SHA-256', pixels);
              return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2,'0')).join('');
            };
            const first = await hash(times[0]);
            const hashes = [first];
            for (const time of times.slice(1)) hashes.push(await hash(time));
            if (await hash(times[0]) !== first) throw Error('First frame changes after seeking');
            return hashes;
          }, result.times);
          assertNoPageErrors(errors);
        }
      } catch (error) {result.status='failed'; result.error=error.message; report.status='failed';}
      finally {if (opened) await opened.context.close();}
      report.entries.push(result);
      console.log(`${result.status}: ${entry.id}/${entry.locale}${result.error ? ' — ' + result.error : ''}`);
    }
  } finally {if (browser) await browser.close();}
  writeReport(output, report);
  console.log(`${report.status}: ${report.entries.length} current pages; report ${path.relative(ROOT,output)}`);
  if (report.status !== 'passed') process.exitCode=1;
  return report;
}

if (require.main === module) check().catch(error => {console.error(error.message); process.exitCode=1;});
module.exports = {check};

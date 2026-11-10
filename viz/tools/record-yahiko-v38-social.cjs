#!/usr/bin/env node
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {ROOT, record} = require('./record-animation.cjs');

async function checkLayout({page}) {
  const measured = await page.evaluate(() => {
    const bad = [], original = text;
    let time = 0;
    text = function(s, x, y, size, color, weight = 400, align = 'left', spacing = 0, fam = latinOnly(s) ? 'latin' : 'cjk') {
      const width = measure(s, size, weight, spacing, fam);
      const left = align === 'center' ? x - width / 2 : align === 'right' ? x - width : x;
      if (g.globalAlpha > .2 && (left < 20 || left + width > 1060)) bad.push({time, text: s, left, width});
      return original(s, x, y, size, color, weight, align, spacing, fam);
    };
    try {
      for (time of [0, 4.5, 8, 12, 15, 19.5, 24, 27.7]) render(time);
    } finally {
      text = original;
    }
    return {bad, narration: STORY_C.map(item => item[2])};
  });
  if (measured.bad.length) throw Error(`Subtitle overflow: ${JSON.stringify(measured.bad)}`);
  return measured;
}

async function main(argv = process.argv.slice(2)) {
  let locales = ['en', 'tw'];
  let force = false;
  for (let i = 0; i < argv.length; i++) {
    if (argv[i] === '--help' || argv[i] === '-h') {
      console.log('Usage: node viz/tools/record-yahiko-v38-social.cjs [--locales en,tw|zh] [--force]\nDefault: English and Taiwan Traditional Chinese. Uses animations.json and the shared recorder.');
      return;
    }
    if (argv[i] === '--force') force = true;
    else if (argv[i] === '--locale' || argv[i] === '--locales') {
      if (!argv[i + 1]) throw Error(`Missing value for ${argv[i]}`);
      locales = argv[++i].split(',');
      if (!locales.length || locales.some(locale => !['zh', 'en', 'tw'].includes(locale))) throw Error('Locales must be zh, en or tw');
      locales = [...new Set(locales)];
    } else throw Error(`Unknown argument: ${argv[i]}`);
  }
  const audioDir = path.join(ROOT, 'viz/autumn/audio/yahiko-v38');
  const digest = file => crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
  if (digest(path.join(audioDir, 'master.wav')) !== digest(path.join(audioDir, 'effects.wav'))) {
    throw Error('Release master must match the approved effects-only track');
  }
  const outputDir = path.join(ROOT, 'output/autumn/yahiko-v38-social');
  const targets = locales.map(locale => path.join(outputDir, `yahiko-v38-${locale}-social.mp4`));
  if (!force) for (const target of targets) {
    if (fs.existsSync(target)) throw Error(`Export exists: ${target}. Use --force to replace it.`);
  }
  const results = [];
  for (let i = 0; i < locales.length; i++) {
    results.push(await record({animation: 'yahiko', locale: locales[i], fps: 30, force, out: targets[i]}, {preflight: checkLayout}));
  }
  fs.writeFileSync(path.join(outputDir, 'exports.json'), JSON.stringify({exports: results}, null, 2) + '\n');
}

module.exports = {main};
if (require.main === module) main().catch(error => {console.error(error.message); process.exitCode = 1;});

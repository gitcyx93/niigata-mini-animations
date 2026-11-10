#!/usr/bin/env node
'use strict';

// The approved pages remain standalone. Edit the source files; this assembler
// embeds the frozen series code, locale overrides and shared font assets.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '../..');
const SOURCE = path.join(ROOT, 'src/yahiko-v38');
const PARTS = {
  page: 'page.html', styles: 'styles.css', fonts: 'fonts.js',
  series: 'series.js', animation: 'animation.js', player: 'player.js',
  leafMotion: 'leaf-motion.js',
};
const SUFFIX = { zh: '', en: '-en', tw: '-tw' };

function replaceOnce(source, before, after, description) {
  const at = source.indexOf(before);
  if (!before || at === -1 || source.indexOf(before, at + before.length) !== -1) {
    throw new Error(`${description}: expected one exact match. Review the approved locale override after editing this source.`);
  }
  return source.slice(0, at) + after + source.slice(at + before.length);
}

function renderLocale(locale) {
  if (!Object.hasOwn(SUFFIX, locale)) throw new Error(`Unknown locale: ${locale}`);
  const config = JSON.parse(fs.readFileSync(path.join(SOURCE, `locales/${locale}.json`), 'utf8'));
  const parts = {};
  for (const [name, filename] of Object.entries(PARTS)) {
    let source = fs.readFileSync(path.join(SOURCE, filename), 'utf8');
    for (const [index, override] of (config.overrides[name] || []).entries()) {
      source = replaceOnce(source, override.from, override.to, `${locale}/${filename} override ${index + 1}`);
    }
    parts[name] = source;
  }
  const fonts = config.fonts.map(({ family, weight, unicodeRange, file }) => {
    if (!/^fonts\/[a-f0-9]+\.woff2$/.test(file)) throw new Error(`Invalid font path: ${file}`);
    return [family, weight, unicodeRange, fs.readFileSync(path.join(SOURCE, file)).toString('base64')];
  });
  parts.fonts = replaceOnce(parts.fonts, '__FONT_DATA__', JSON.stringify(fonts), `${locale}/fonts.js data`);
  parts.animation = `${parts.leafMotion}\n${parts.animation}`;
  let html = parts.page;
  for (const name of Object.keys(PARTS).filter(name => name !== 'page' && name !== 'leafMotion')) {
    html = replaceOnce(html, `{{${name}}}`, parts[name], `${locale}/page.html ${name}`);
  }
  for (const [, attributes, script] of html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    if (!/\btype\s*=/.test(attributes)) new vm.Script(script, { filename: `yahiko-v38${SUFFIX[locale]}.html` });
  }
  return html;
}

function buildYahiko({ locales = Object.keys(SUFFIX), check = false } = {}) {
  // Finish and validate every page before replacing any generated output.
  const pages = locales.map(locale => ({
    locale,
    file: path.join(ROOT, `viz/autumn/yahiko-v38${SUFFIX[locale] ?? ''}.html`),
    html: renderLocale(locale),
  }));
  for (const { file, html } of pages) {
    if (check) {
      if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== html) {
        throw new Error(`${path.relative(ROOT, file)} is out of date. Run node viz/tools/build-yahiko-v38.cjs.`);
      }
    } else {
      fs.writeFileSync(file, html);
    }
  }
  return pages.map(({ locale, file, html }) => ({ locale, file: path.relative(ROOT, file), bytes: Buffer.byteLength(html) }));
}

if (require.main === module) {
  try {
    const args = process.argv.slice(2);
    let check = false;
    let locales;
    for (let i = 0; i < args.length; i++) {
      if (args[i] === '--check') check = true;
      else if (args[i] === '--locale' || args[i] === '--lang') {
        if (!args[i + 1]) throw new Error(`${args[i]} requires zh, en, or tw`);
        locales = args[++i].split(',');
      } else throw new Error(`Unknown argument: ${args[i]}`);
    }
    for (const page of buildYahiko({ check, locales })) {
      console.log(`${check ? 'Verified' : 'Built'} ${page.file} (${page.bytes} bytes)`);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

module.exports = { buildYahiko, renderLocale };

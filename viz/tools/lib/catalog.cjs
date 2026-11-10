'use strict';
const fs = require('node:fs');
const path = require('node:path');
const ROOT = path.resolve(__dirname, '../../..');

function projectPath(relative) {
  if (typeof relative !== 'string' || !relative || path.isAbsolute(relative)) throw Error('Expected a repository-relative path');
  const full = path.resolve(ROOT, relative);
  if (!full.startsWith(ROOT + path.sep)) throw Error('Path must stay inside the repository: ' + relative);
  return full;
}

function readCatalog() {
  const data = JSON.parse(fs.readFileSync(path.join(ROOT, 'animations.json'), 'utf8'));
  if (data.schemaVersion !== 1 || !Array.isArray(data.animations) || !data.animations.length) throw Error('Invalid animation catalog');
  const ids = new Set(), pages = new Set();
  for (const entry of data.animations) {
    if (!/^[a-z][a-z0-9-]*$/.test(entry.id) || ids.has(entry.id)) throw Error('Invalid or duplicate animation id: ' + entry.id);
    ids.add(entry.id);
    for (const key of ['duration', 'width', 'height']) if (!Number.isFinite(entry[key]) || entry[key] <= 0) throw Error(entry.id + ': invalid ' + key);
    if (!entry.locales?.zh) throw Error(entry.id + ': missing default zh locale');
    for (const [locale, variant] of Object.entries(entry.locales)) {
      if (!/^[a-z][a-z0-9-]*$/.test(locale) || !variant.page?.endsWith('.html') || pages.has(variant.page)) throw Error(entry.id + ': invalid locale/page');
      pages.add(variant.page);
      for (const file of [variant.page, variant.audio].filter(Boolean)) {
        if (!fs.statSync(projectPath(file)).isFile()) throw Error('Missing animation asset: ' + file);
      }
    }
  }
  return data.animations;
}

function resolveAnimation(idOrFile, locale = 'zh') {
  const entries = readCatalog();
  const entry = entries.find(item => item.id === idOrFile);
  if (entry) {
    const variant = entry.locales[locale];
    if (!variant) throw Error('No ' + locale + ' version for ' + entry.id);
    return {...entry, ...variant, locale, file: projectPath(variant.page), audioFile: variant.audio ? projectPath(variant.audio) : null};
  }
  const file = path.resolve(idOrFile);
  for (const entry of entries) for (const [language, variant] of Object.entries(entry.locales)) {
    if (projectPath(variant.page) === file) return {...entry, ...variant, locale: language, file, audioFile: variant.audio ? projectPath(variant.audio) : null};
  }
  if (!fs.statSync(file).isFile()) throw Error('Not an animation file: ' + idOrFile);
  return {file, locale, audioFile: null};
}

module.exports = {ROOT, projectPath, readCatalog, resolveAnimation};

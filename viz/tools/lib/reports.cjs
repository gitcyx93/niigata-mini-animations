'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {ROOT} = require('./catalog.cjs');

function realDestination(file) {
  if (fs.existsSync(file)) return fs.realpathSync(file);
  return path.join(realDestination(path.dirname(file)), path.basename(file));
}

function reportPath(file, type) {
  const target = path.resolve(file), real = realDestination(target);
  const root = fs.realpathSync(ROOT), output = path.join(root, 'output') + path.sep;
  if (path.extname(target).toLowerCase() !== '.json') throw Error('Reports must use a .json filename');
  if ((real === root || real.startsWith(root + path.sep)) && !real.startsWith(output)) throw Error('Reports inside the repository must go in output/');
  if (fs.existsSync(target)) {
    let existing;
    try { existing = JSON.parse(fs.readFileSync(target, 'utf8')); } catch { /* handled below */ }
    if (existing?.type !== type) throw Error('Refusing to overwrite a file that is not this tool’s report: ' + target);
  }
  return target;
}

function writeReport(file, data) {
  const target = reportPath(file, data.type);
  fs.mkdirSync(path.dirname(target), {recursive:true});
  const temp = target + '.' + crypto.randomUUID() + '.tmp';
  try {
    fs.writeFileSync(temp, JSON.stringify(data,null,2)+'\n', {flag:'wx'});
    fs.renameSync(temp,target);
  } finally {fs.rmSync(temp,{force:true});}
}

module.exports = {reportPath, writeReport};

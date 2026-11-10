'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {reportPath, writeReport} = require('../viz/tools/lib/reports.cjs');
const {ROOT} = require('../viz/tools/lib/catalog.cjs');

test('reports cannot overwrite source/configuration files', () => {
  for (const file of ['animations.json','package.json','viz/autumn/yahiko-v38.html','src/yahiko-v38/locales/zh.json']) {
    assert.throws(() => reportPath(path.join(ROOT,file),'niigata-animation-check'));
  }
});

test('reports only replace their own output; foreign files survive', () => {
  const temp=fs.mkdtempSync(path.join(os.tmpdir(),'mini-report-'));
  try {
    const own=path.join(temp,'report.json'), other=path.join(temp,'other.json');
    fs.writeFileSync(other,'{"important":true}');
    assert.throws(() => writeReport(other,{type:'niigata-animation-check'}));
    assert.equal(fs.readFileSync(other,'utf8'),'{"important":true}');
    writeReport(own,{type:'niigata-animation-check',status:'failed'});
    writeReport(own,{type:'niigata-animation-check',status:'passed'});
    assert.equal(JSON.parse(fs.readFileSync(own)).status,'passed');
    assert.throws(() => writeReport(own,{type:'niigata-animation-inspection'}));
  } finally {fs.rmSync(temp,{recursive:true,force:true});}
});

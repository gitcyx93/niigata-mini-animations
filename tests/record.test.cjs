'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const {ROOT, record, resolveInput} = require('../viz/tools/record-animation.cjs');

function fixture(t) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'niigata-record-'));
  t.after(() => fs.rmSync(directory, {recursive: true, force: true}));
  const source = path.join(directory, 'scene.html');
  fs.writeFileSync(source, `<!doctype html><canvas id="c" width="160" height="240"></canvas>
<script>
window.LOOP_SECONDS = .2;
window.render = t => {
  const context = document.getElementById('c').getContext('2d');
  context.fillStyle = '#203040'; context.fillRect(0, 0, 160, 240);
  context.fillStyle = '#ffcc00'; context.fillRect(t * 300, 30, 20, 20);
};
window.READY = true;
</script>`);
  return {directory, source, out: path.join(directory, 'approved.mp4')};
}

test('recording refuses to overwrite a video before loading browser dependencies', async t => {
  const input = fixture(t);
  fs.writeFileSync(input.out, 'approved video bytes');
  await assert.rejects(record(input, {log() {}}), /Export exists/);
  assert.equal(fs.readFileSync(input.out, 'utf8'), 'approved video bytes');
});

test('report paths protect source assets, repository configuration and unrelated files', t => {
  const input = fixture(t);
  assert.throws(() => resolveInput({...input, force: true, report: path.join(ROOT, 'animations.json')}), /under output/);
  assert.throws(() => resolveInput({...input, force: true, report: input.source}), /differ|\.json/);
  const unrelated = path.join(input.directory, 'other.json');
  fs.writeFileSync(unrelated, '{"important":"keep"}');
  assert.throws(() => resolveInput({...input, force: true, report: unrelated}), /unrelated report/);
  assert.throws(() => resolveInput({...input, force: true, report: unrelated, audio: unrelated}), /differ/);
  assert.equal(fs.readFileSync(unrelated, 'utf8'), '{"important":"keep"}');
});

const integration = {skip: process.env.NIIGATA_RECORD_INTEGRATION !== '1'};

test('failed encoding preserves the approved export and cleans partial files', integration, async t => {
  const input = fixture(t);
  const audio = path.join(input.directory, 'broken.wav');
  fs.writeFileSync(input.out, 'approved video bytes');
  fs.writeFileSync(audio, 'invalid audio input');
  let pageLoaded = false;
  await assert.rejects(record({...input, audio, force: true}, {
    log() {},
    preflight() {pageLoaded = true;}
  }), error => {
    assert.equal(pageLoaded, true, 'The browser must load the fixture before testing encoding failure');
    assert.match(error.message, /FFmpeg|Encoder|EPIPE/);
    return true;
  });
  assert.equal(fs.readFileSync(input.out, 'utf8'), 'approved video bytes');
  assert(!fs.readdirSync(input.directory).some(name => /\.partial\.mp4$|\.tmp$/.test(name)));
});

test('an unwritable report destination does not replace the approved export', integration, async t => {
  const input = fixture(t);
  const blocker = path.join(input.directory, 'not-a-directory');
  fs.writeFileSync(input.out, 'approved video bytes');
  fs.writeFileSync(blocker, 'keep');
  await assert.rejects(record({...input, force: true, report: path.join(blocker, 'report.json')}, {log() {}}), /EEXIST|ENOTDIR/);
  assert.equal(fs.readFileSync(input.out, 'utf8'), 'approved video bytes');
  assert(!fs.readdirSync(input.directory).some(name => /\.partial\.mp4$|\.tmp$/.test(name)));
});

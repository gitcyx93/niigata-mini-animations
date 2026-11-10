'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const {once} = require('node:events');
const {setTimeout: delay} = require('node:timers/promises');
const {DevPreview, EVENTS_PATH, injectDevClient} = require('../viz/tools/lib/dev-preview.cjs');
const {createPreviewServer} = require('../viz/tools/serve.cjs');
const {ROOT} = require('../viz/tools/lib/catalog.cjs');

const PAGE = 'viz/autumn/yahiko-v38.html';

function fixture(t) {
  const sourceDirectory = fs.mkdtempSync(path.join(os.tmpdir(), 'mini-dev-'));
  const file = path.join(sourceDirectory, 'scene.js');
  fs.writeFileSync(file, "window.scene = 'initial';");
  t.after(() => fs.rmSync(sourceDirectory, {recursive: true, force: true}));
  let builds = 0;
  return {sourceDirectory, file, debounceMs: 30, count: () => builds, build() {
    builds++;
    const source = fs.readFileSync(file, 'utf8');
    new vm.Script(source);
    return new Map([[PAGE, `<body><script>${source}</script></body>`]]);
  }};
}

function nextChange(dev) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {dev.off('change', changed); reject(Error('No rebuild event'));}, 3000);
    function changed(state) {clearTimeout(timer); dev.off('change', changed); resolve(state);}
    dev.on('change', changed);
  });
}

test('source edits rebuild once per burst and failures keep the working snapshot', async t => {
  const input = fixture(t), dev = new DevPreview(input);
  t.after(() => dev.close());
  await dev.ready;
  const initial = dev.version;
  let changed = nextChange(dev);
  for (let i = 0; i < 6; i++) fs.writeFileSync(input.file, `window.scene = 'edited-${i}';`);
  await changed;
  await delay(90);
  assert.equal(input.count(), 2);
  assert.notEqual(dev.version, initial);
  assert.match(dev.pages.get(PAGE), /edited-5/);
  const working = dev.pages.get(PAGE), version = dev.version;
  changed = nextChange(dev);
  fs.writeFileSync(input.file, 'broken(');
  const failed = await changed;
  assert(failed.error);
  assert.equal(dev.pages.get(PAGE), working);
  assert.equal(dev.version, version);
  changed = nextChange(dev);
  fs.writeFileSync(input.file, "window.scene = 'edited-5';");
  assert.equal((await changed).error, null);
  assert.equal(dev.version, version);
  const count = input.count();
  dev.schedule();
  dev.close();
  fs.writeFileSync(input.file, "window.scene = 'after-close';");
  await delay(90);
  assert.equal(input.count(), count);
});

test('live previews leave record responses unchanged and server close stops watching and SSE', async t => {
  const input = fixture(t);
  const server = createPreviewServer({watch: true, development: input});
  const controller = new AbortController();
  t.after(() => {controller.abort(); server.closeAllConnections(); server.close();});
  await server.development.ready;
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const html = await (await fetch(`${base}/${PAGE}`)).text();
  assert.match(html, /window.scene = 'initial'/);
  assert.match(html, /data-mini-dev/);
  const record = await (await fetch(`${base}/${PAGE}?record=1`)).text();
  assert.equal(record, fs.readFileSync(path.join(ROOT, PAGE), 'utf8'));
  assert(!record.includes('data-mini-dev'));
  const stream = await fetch(base + EVENTS_PATH, {signal: controller.signal});
  const reader = stream.body.getReader();
  const first = await reader.read();
  assert.match(new TextDecoder().decode(first.value), /"version":"[a-f0-9]{64}"/);
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  assert.equal(server.development.closed, true);
  assert.equal((await reader.read()).done, true);
  const count = input.count();
  fs.writeFileSync(input.file, "window.scene = 'closed';");
  await delay(90);
  assert.equal(input.count(), count);
});

function clientSession(storage, state, version) {
  const audio = {readyState: 1, muted: false, volume: 1, loop: true, ...state};
  const elements = new Map();
  let reloads = 0, plays = 0, connection;
  const controller = {
    audio, getState: () => ({...audio}),
    seek(time) {audio.time = time; audio.paused = true;},
    async play() {plays++; audio.paused = false;}
  };
  const context = {
    window: {READY: true, YahikoSound: controller, addEventListener() {}},
    location: {pathname: '/' + PAGE, reload() {reloads++;}},
    sessionStorage: {getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value), removeItem: key => storage.delete(key)},
    document: {
      getElementById: id => elements.get(id),
      createElement: () => ({style: {}, setAttribute() {}, appendChild() {}}),
      body: {appendChild: node => elements.set(node.id, node)}
    },
    EventSource: class {constructor() {connection = this;} close() {}},
    setTimeout
  };
  const script = injectDevClient('<body></body>', version).match(/<script data-mini-dev>([\s\S]*?)<\/script>/)[1];
  vm.runInNewContext(script, context);
  return {audio, elements, reloads: () => reloads, plays: () => plays,
    event: state => connection.onmessage({data: JSON.stringify(state)})};
}

test('live refresh restores timeline, pause state and sound controls', async () => {
  for (const paused of [false, true]) {
    const storage = new Map();
    const original = {time: 13.2, paused, volume: 0.35, muted: true, loop: false};
    const before = clientSession(storage, original, 'old');
    before.event({version: 'new', error: null});
    before.event({version: 'new', error: null});
    assert.equal(before.reloads(), 1);
    const after = clientSession(storage, {time: 0, paused: true}, 'new');
    await Promise.resolve();
    for (const [key, value] of Object.entries(original)) assert.equal(after.audio[key], value, key);
    assert.equal(after.plays(), paused ? 0 : 1);
    assert.equal(storage.size, 0);
  }
});

test('build errors remain visible without refreshing and clear when the same good build is restored', () => {
  const client = clientSession(new Map(), {time: 7, paused: true}, 'working');
  client.event({version: 'working', error: 'SyntaxError at scene.js'});
  assert.equal(client.reloads(), 0);
  const notice = client.elements.get('mini-dev-status');
  assert.match(notice.textContent, /SyntaxError at scene.js/);
  assert.equal(notice.hidden, false);
  client.event({version: 'working', error: null});
  assert.equal(notice.hidden, true);
  assert.equal(client.reloads(), 0);
});

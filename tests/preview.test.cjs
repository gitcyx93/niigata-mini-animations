'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const {once} = require('node:events');
const fs = require('node:fs');
const {createPreviewServer, parseRange} = require('../viz/tools/serve.cjs');
const {projectPath, resolveAnimation, readCatalog} = require('../viz/tools/lib/catalog.cjs');

test('audio ranges support seeking, suffixes and clipped ends', () => {
  assert.deepEqual(parseRange('bytes=10-',100), {start:10,end:99});
  assert.deepEqual(parseRange('bytes=-8',100), {start:92,end:99});
  assert.deepEqual(parseRange('bytes=90-200',100), {start:90,end:99});
  for (const value of ['bytes=100-','bytes=9-2','bytes=-0','bytes=0-1,4-5','bytes=-']) assert.throws(() => parseRange(value,100));
});

test('catalog resolves current sources and rejects invalid paths/locales', () => {
  assert.equal(resolveAnimation('yahiko','en').page,'viz/autumn/yahiko-v38-en.html');
  assert.throws(() => resolveAnimation('yahiko','ja'));
  assert.throws(() => projectPath('../outside'));
});

test('preview serves the exact approved audio bytes and supports HEAD', async () => {
  const server = createPreviewServer();
  server.listen(0,'127.0.0.1');
  await once(server,'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const audio = fs.readFileSync(projectPath('viz/autumn/audio/yahiko-v38/master.wav'));
    const ranged = await fetch(base+'/audio/yahiko-v38/master.wav',{headers:{Range:'bytes=-44'}});
    assert.equal(ranged.status,206);
    assert.deepEqual(Buffer.from(await ranged.arrayBuffer()),audio.subarray(-44));
    const head = await fetch(base+'/audio/yahiko-v38/master.wav',{method:'HEAD'});
    assert.equal(head.status,200);
    assert.equal(Number(head.headers.get('content-length')),audio.length);
    const redirect = await fetch(base+'/en?record=1',{redirect:'manual'});
    assert.equal(redirect.headers.get('location'),'/viz/autumn/yahiko-v38-en.html?record=1');
    assert.equal((await fetch(base+'/.git/config')).status,404);
    assert.equal((await fetch(base+'/viz/%2e%2e/%2e%2e/etc/passwd')).status,404);
    assert.equal((await fetch(base+'/',{method:'POST'})).status,405);
    assert.equal((await fetch(base+'/audio/yahiko-v38/master.wav',{headers:{Range:'bytes=999999999-'}})).status,416);
  } finally {server.closeAllConnections(); await new Promise(resolve => server.close(resolve));}
});

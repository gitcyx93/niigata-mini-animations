#!/usr/bin/env node
'use strict';
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const {ROOT, readCatalog} = require('./lib/catalog.cjs');
const {DevPreview, EVENTS_PATH, injectDevClient} = require('./lib/dev-preview.cjs');
const TYPES = {'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.md':'text/plain; charset=utf-8','.txt':'text/plain; charset=utf-8','.wav':'audio/wav','.m4a':'audio/mp4','.mp3':'audio/mpeg','.ogg':'audio/ogg','.flac':'audio/flac','.mp4':'video/mp4','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2'};

function parseRange(header, size) {
  if (!header) return null;
  const match = /^bytes=(\d*)-(\d*)$/.exec(header);
  if (!match || (!match[1] && !match[2]) || size <= 0) throw Error('Invalid byte range');
  let start, end;
  if (!match[1]) {
    const tail = Number(match[2]);
    if (!Number.isSafeInteger(tail) || tail <= 0) throw Error('Invalid suffix range');
    start = Math.max(0, size - tail); end = size - 1;
  } else {
    start = Number(match[1]); end = match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start > end || start >= size) throw Error('Unsatisfiable range');
  }
  return {start, end};
}

function escapeHTML(value) { return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char])); }

function createPreviewServer({watch = false, development = {}} = {}) {
  const catalog = readCatalog();
  const aliases = new Map();
  const yahiko = catalog.find(item => item.id === 'yahiko');
  const devPages = new Set(Object.values(yahiko?.locales || {}).map(variant => variant.page));
  const dev = watch && yahiko ? new DevPreview({
    sourceDirectory: path.join(ROOT, yahiko.source),
    build: () => {
      const {renderLocale} = require('./build-yahiko-v38.cjs');
      return new Map(Object.entries(yahiko.locales).map(([locale, variant]) => [variant.page, renderLocale(locale)]));
    },
    ...development
  }) : null;
  if (yahiko) for (const [locale, variant] of Object.entries(yahiko.locales)) aliases.set(locale === 'zh' ? '/yahiko' : '/' + locale, variant.page);
  for (const item of catalog) for (const [locale, variant] of Object.entries(item.locales)) aliases.set('/' + item.id + '/' + locale, variant.page);
  const listing = '<!doctype html><meta charset="utf-8"><title>Niigata Mini Animations</title><h1>Niigata Mini Animations</h1><ul>' + catalog.map(item => '<li>' + escapeHTML(item.title) + ' — ' + Object.entries(item.locales).map(([locale, variant]) => '<a href="/' + variant.page + '">' + escapeHTML(locale) + '</a>').join(' · ') + '</li>').join('') + '</ul>';
  const server = http.createServer((req, res) => {
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405, {Allow:'GET, HEAD'}); return res.end(); }
    let url, pathname;
    try { url = new URL(req.url, 'http://127.0.0.1'); pathname = decodeURIComponent(url.pathname); }
    catch { res.writeHead(400); return res.end('Invalid URL'); }
    if (dev && pathname === EVENTS_PATH) {
      if (req.method === 'HEAD') {res.writeHead(200, {'Content-Type': 'text/event-stream'}); return res.end();}
      return dev.subscribe(res);
    }
    if (pathname === '/') {
      res.writeHead(200, {'Content-Type':'text/html; charset=utf-8', 'Content-Length':Buffer.byteLength(listing), 'Cache-Control':'no-store'});
      return res.end(req.method === 'HEAD' ? undefined : listing);
    }
    if (aliases.has(pathname)) { res.writeHead(302, {Location:'/' + aliases.get(pathname) + url.search}); return res.end(); }
    if (pathname.startsWith('/audio/yahiko-v38/')) pathname = '/viz/autumn' + pathname;
    const download = /^\/downloads\/yahiko-v38-(zh|en|tw)\.mp4$/.test(pathname);
    if (download) pathname = '/output/autumn/yahiko-v38-social/' + path.basename(pathname).replace('.mp4', '-social.mp4');
    const relative = pathname.replace(/^\//, '');
    const file = path.resolve(ROOT, relative);
    if (!/^(viz|output|reference\/licenses)\//.test(relative) || relative.split(/[\\/]/).some(p => p.startsWith('.')) || !file.startsWith(ROOT + path.sep) || !TYPES[path.extname(file)]) {
      res.writeHead(404); return res.end('Not found');
    }
    if (dev && devPages.has(relative) && !url.searchParams.has('record')) {
      // Generated files stay untouched, and ?record continues to use the saved release.
      let source = dev.pages.get(relative);
      if (source === undefined) {
        try {source = fs.readFileSync(file, 'utf8');}
        catch {res.writeHead(503, {'Content-Type': 'text/plain; charset=utf-8'}); return res.end('Preview unavailable: fix the source build or restore the generated HTML.');}
      }
      const html = injectDevClient(source, dev.version);
      res.writeHead(200, {'Content-Type': TYPES['.html'], 'Cache-Control': 'no-store', 'Content-Length': Buffer.byteLength(html)});
      return res.end(req.method === 'HEAD' ? undefined : html);
    }
    fs.stat(file, (error, stat) => {
      if (error || !stat.isFile()) { res.writeHead(404); return res.end('Not found'); }
      fs.realpath(file, (realError, real) => {
        if (realError || !real.startsWith(ROOT + path.sep)) { res.writeHead(404); return res.end('Not found'); }
        let range;
        try { range = parseRange(req.headers.range, stat.size); }
        catch { res.writeHead(416, {'Content-Range':`bytes */${stat.size}`}); return res.end(); }
        const headers = {'Content-Type':TYPES[path.extname(file)], 'Cache-Control':'no-store', 'Accept-Ranges':'bytes', 'Content-Length':range ? range.end-range.start+1 : stat.size};
        if (download) headers['Content-Disposition'] = 'attachment; filename="' + path.basename(file) + '"';
        if (range) headers['Content-Range'] = `bytes ${range.start}-${range.end}/${stat.size}`;
        res.writeHead(range ? 206 : 200, headers);
        if (req.method === 'HEAD') return res.end();
        const stream = fs.createReadStream(real, range || {});
        stream.on('error', () => res.destroy());
        res.on('close', () => stream.destroy());
        stream.pipe(res);
      });
    });
  });
  server.development = dev;
  const close = server.close;
  server.close = function(callback) {
    dev?.close();
    return close.call(this, callback);
  };
  return server;
}

function main(argv = process.argv.slice(2)) {
  let port = 8941, watch = true;
  for (let i=0;i<argv.length;i++) {
    if (argv[i] === '--help') { console.log('Usage: npm run dev -- [--port 8941] [--no-watch]\nV38 source changes rebuild the live preview; saved HTML and ?record remain static.'); return; }
    if (argv[i] === '--no-watch') {watch = false; continue;}
    if (argv[i] !== '--port' || !argv[i+1]) throw Error('Unknown option: ' + argv[i]);
    port = Number(argv[++i]);
  }
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw Error('--port must be 1..65535');
  const server = createPreviewServer({watch});
  server.on('error', error => { server.development?.close(); console.error(error.message); process.exitCode=1; });
  server.listen(port, '127.0.0.1', () => console.log(`http://127.0.0.1:${port}/`));
  const stop = () => server.close();
  process.once('SIGINT', stop); process.once('SIGTERM', stop);
  server.once('close', () => {process.removeListener('SIGINT', stop); process.removeListener('SIGTERM', stop);});
  return server;
}
if (require.main === module) { try { main(); } catch (error) { console.error(error.message); process.exitCode=1; } }
module.exports = {createPreviewServer, parseRange, main};

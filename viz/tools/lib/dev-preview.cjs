'use strict';

const fs = require('node:fs');
const crypto = require('node:crypto');
const {EventEmitter} = require('node:events');

const EVENTS_PATH = '/__mini_dev/events';

class DevPreview extends EventEmitter {
  constructor({sourceDirectory, build, debounceMs = 120}) {
    super();
    this.build = build;
    this.debounceMs = debounceMs;
    this.pages = new Map();
    this.version = null;
    this.error = null;
    this.clients = new Set();
    this.closed = false;
    this.busy = false;
    this.pending = false;
    this.watcher = fs.watch(sourceDirectory, {recursive: true}, () => this.schedule());
    this.watcher.on('error', error => this.failed(error));
    this.heartbeat = setInterval(() => {
      for (const client of this.clients) client.write(': keep-alive\n\n');
    }, 20000);
    this.heartbeat.unref();
    this.ready = this.rebuild();
  }

  state() {return {version: this.version, error: this.error};}

  notify() {
    const state = this.state();
    for (const client of this.clients) client.write(`data: ${JSON.stringify(state)}\n\n`);
    this.emit('change', state);
  }

  failed(error) {
    if (this.closed) return;
    this.error = error.message;
    this.notify();
  }

  schedule() {
    if (this.closed) return;
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.rebuild(), this.debounceMs);
  }

  async rebuild() {
    if (this.closed) return;
    clearTimeout(this.timer);
    if (this.busy) {this.pending = true; return;}
    this.busy = true;
    try {
      const pages = await this.build();
      if (!(pages instanceof Map) || !pages.size || [...pages.values()].some(html => typeof html !== 'string')) {
        throw Error('The preview builder must return a nonempty map of HTML pages');
      }
      const version = crypto.createHash('sha256').update(JSON.stringify([...pages].sort(([a], [b]) => a.localeCompare(b)))).digest('hex');
      if (this.closed) return;
      // Publish all languages together; a failed build leaves the last working pages available.
      this.pages = pages;
      this.version = version;
      this.error = null;
      this.notify();
    } catch (error) {this.failed(error);}
    finally {
      this.busy = false;
      if (this.pending && !this.closed) {this.pending = false; this.schedule();}
    }
  }

  subscribe(res) {
    res.writeHead(200, {'Content-Type': 'text/event-stream', 'Cache-Control': 'no-store', Connection: 'keep-alive'});
    this.clients.add(res);
    res.on('close', () => this.clients.delete(res));
    res.write(`data: ${JSON.stringify(this.state())}\n\n`);
  }

  close() {
    if (this.closed) return;
    this.closed = true;
    clearTimeout(this.timer);
    clearInterval(this.heartbeat);
    this.watcher.close();
    for (const client of this.clients) client.end();
    this.clients.clear();
  }
}

// This function is injected only into normal development previews, never into saved HTML.
function previewClient(version, eventsPath) {
  const storageKey = 'niigata-preview:' + location.pathname;
  let notice, saved, reloading = false, buildError = false;
  function show(message, resume) {
    if (!notice) {
      notice = document.createElement('aside');
      notice.id = 'mini-dev-status';
      notice.setAttribute('role', 'status');
      notice.style.cssText = 'position:fixed;right:12px;bottom:12px;z-index:9999;max-width:min(600px,90vw);padding:12px 16px;background:#15202bee;color:#fff;white-space:pre-wrap;font:13px/1.5 system-ui;border-radius:8px';
      document.body.appendChild(notice);
    }
    notice.hidden = !message;
    notice.textContent = message || '';
    if (resume) {
      const button = document.createElement('button');
      button.textContent = '继续播放';
      button.style.marginLeft = '12px';
      button.onclick = async () => {await resume(); show('');};
      notice.appendChild(button);
    }
  }
  try {saved = JSON.parse(sessionStorage.getItem(storageKey)); sessionStorage.removeItem(storageKey);} catch {}
  async function restore() {
    if (!saved) return;
    const controller = window.YahikoSound;
    if (!window.READY || !controller || controller.audio.readyState < 1) {
      setTimeout(restore, 50);
      return;
    }
    const state = saved;
    saved = null;
    const audio = controller.audio;
    if (typeof state.muted === 'boolean') audio.muted = state.muted;
    if (typeof state.loop === 'boolean') audio.loop = state.loop;
    if (Number.isFinite(state.volume)) audio.volume = Math.max(0, Math.min(1, state.volume));
    const volume = document.getElementById('sound-volume'), loop = document.getElementById('sound-loop');
    if (volume) volume.value = String(audio.volume);
    if (loop) loop.checked = audio.loop;
    if (Number.isFinite(state.time)) controller.seek(state.time);
    if (!state.paused) {
      await controller.play();
      if (audio.paused) show('预览已更新，播放位置已恢复。', () => controller.play());
    }
  }
  restore();
  const events = new EventSource(eventsPath);
  events.onmessage = event => {
    const next = JSON.parse(event.data);
    if (next.error) {buildError = true; show('源码构建失败；继续显示上次可用画面。\n' + next.error); return;}
    if (buildError) {buildError = false; show('');}
    if (next.version === version || !next.version || reloading) return;
    reloading = true;
    try {
      const state = saved || window.YahikoSound?.getState();
      if (state) sessionStorage.setItem(storageKey, JSON.stringify(state));
    } catch {}
    location.reload();
  };
  window.addEventListener('beforeunload', () => events.close(), {once: true});
}

function injectDevClient(html, version) {
  const script = `<script data-mini-dev>(${previewClient.toString()})(${JSON.stringify(version)},${JSON.stringify(EVENTS_PATH)});</script>`;
  return /<\/body\s*>/i.test(html) ? html.replace(/<\/body\s*>/i, () => script + '</body>') : html + script;
}

module.exports = {DevPreview, EVENTS_PATH, injectDevClient};

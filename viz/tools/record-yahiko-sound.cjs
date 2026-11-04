// Export the latest v16-travel picture twice: silent and environment-only.
// Requirements: Node, Playwright (+ a browser), FFmpeg. No network in the page.
// Optional BROWSER_EXE points to a local Chrome; --force replaces generated MP4s.
const { chromium } = require('playwright');
const { spawn, spawnSync } = require('node:child_process');
const { once } = require('node:events');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
const root = path.resolve(__dirname, '../..');
const source = path.join(root, 'viz/autumn/yahiko-v16-travel.html');
const master = path.join(root, 'viz/autumn/audio/yahiko-v16-travel/master.flac');
const output = path.join(root, 'output/autumn/yahiko-v16-travel');
const reference = path.join(root, 'reference/yahiko-v16-travel-sound');
const silent = path.join(output, 'yahiko-v16-travel-silent.mp4');
const sound = path.join(output, 'yahiko-v16-travel-ambience.mp4');
const overwrite = process.argv.includes('--force') ? '-y' : '-n';

(async () => {
  if (overwrite === '-n' && [silent, sound].some(fs.existsSync)) throw new Error('Output exists. Use --force only to replace generated exports.');
  fs.mkdirSync(output, { recursive: true });
  fs.mkdirSync(reference, { recursive: true });
  let browser, encoder;
  const errors = [], requests = [];
  try {
    browser = await chromium.launch({ headless: true, ...(process.env.BROWSER_EXE ? { executablePath: process.env.BROWSER_EXE } : {}) });
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
    page.on('pageerror', error => errors.push(error.message));
    page.on('request', request => { if (/^https?:/.test(request.url())) requests.push(request.url()); });
    await page.goto(pathToFileURL(source).href + '?record');
    await page.waitForFunction(() => window.READY === true, null, { timeout: 60000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    const metadata = await page.evaluate(() => ({ seconds: window.LOOP_SECONDS, width: document.getElementById('c').width, height: document.getElementById('c').height }));
    if (metadata.seconds !== 22.8 || metadata.width !== 1080 || metadata.height !== 1920) throw new Error('Unexpected visual timeline: ' + JSON.stringify(metadata));
    const fps = 30, frames = 684;
    encoder = spawn('ffmpeg', ['-nostdin', overwrite, '-v', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-i', 'pipe:0', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '18', '-preset', 'medium', '-movflags', '+faststart', silent], { stdio: ['pipe', 'ignore', 'pipe'] });
    let stderr = '';
    encoder.stderr.on('data', data => stderr += data.toString());
    const exit = new Promise((resolve, reject) => {
      encoder.once('error', reject);
      encoder.once('close', code => code === 0 ? resolve() : reject(new Error(`FFmpeg ${code}: ${stderr}`)));
    });
    exit.catch(() => {});
    const samples = new Set([0, 84, 108, 210, 255, 351, 444, 555, 645]);
    for (let i = 0; i < frames; i++) {
      const data = await page.evaluate(({ time, sample }) => {
        window.render(time);
        const canvas = document.getElementById('c');
        return { png: canvas.toDataURL('image/png'), jpg: sample ? canvas.toDataURL('image/jpeg', 0.84) : null };
      }, { time: i / fps, sample: samples.has(i) });
      if (!encoder.stdin.write(Buffer.from(data.png.split(',')[1], 'base64'))) await once(encoder.stdin, 'drain');
      if (data.jpg) fs.writeFileSync(path.join(reference, `frame-${String(i).padStart(4, '0')}.jpg`), Buffer.from(data.jpg.split(',')[1], 'base64'));
      if (i % 120 === 0) console.log(`Yahiko render: ${i}/${frames}`);
    }
    encoder.stdin.end();
    await exit;
    if (errors.length || requests.length) throw new Error(JSON.stringify({ errors, requests }));
    const mux = spawnSync('ffmpeg', ['-nostdin', overwrite, '-v', 'error', '-i', silent, '-i', master, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '256k', '-t', '22.8', '-movflags', '+faststart', sound], { encoding: 'utf8' });
    if (mux.status !== 0) throw new Error(mux.stderr || 'Audio mux failed');
    fs.writeFileSync(path.join(reference, 'render.json'), JSON.stringify({ source: path.relative(root, source), master: path.relative(root, master), ...metadata, fps, frames, sampledFrames: [...samples], pageErrors: errors, externalRequests: requests, mode: 'deterministic frame-by-frame, unchanged visual source', music: false, limitations: 'Export/decode and sampled-frame evidence are not a claim of human continuous motion or auditory review.' }, null, 2) + '\n');
    console.log('Exported latest picture: silent + environment-only MP4.');
  } finally {
    if (encoder && encoder.exitCode === null) encoder.kill();
    if (browser) await browser.close();
  }
})().catch(error => { console.error(error); process.exitCode = 1; });

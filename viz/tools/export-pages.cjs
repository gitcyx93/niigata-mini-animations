// 把册页式动画按 PLAN 逐页导出：每页一张 GIF（循环）+ 一张静帧 PNG，适合发图集让人左右切。
// 用法：node viz/tools/export-pages.cjs <页面.html> <输出目录> [宽度，默认 720] [fps，默认 12]
// 页面需要 window.render(t)、window.PLAN（[名字, 起, 止]）并支持 ?record=1；翻页段（TURN，默认 0.7 秒）不导出。
const { chromium } = require('playwright');
const { spawnSync } = require('child_process');
const fs = require('fs'), path = require('path');

(async () => {
  const [src, outDir, wArg, fpsArg] = process.argv.slice(2);
  if (!src || !outDir) { console.error('用法：node viz/tools/export-pages.cjs <页面.html> <输出目录> [宽度] [fps]'); process.exit(1); }
  const width = Number(wArg) || 720, fps = Number(fpsArg) || 12, height = Math.round(width * 16 / 9);
  fs.mkdirSync(outDir, { recursive: true });
  const tmp = fs.mkdtempSync(path.join(outDir, '.frames-'));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + path.resolve(src) + '?record=1');
  await page.waitForFunction('window.READY === true');
  const plan = await page.evaluate('window.PLAN');
  const turn = await page.evaluate('window.TURN_SECONDS || 0.7');
  const grab = t => page.evaluate(t => { window.render(t); return document.getElementById('c').toDataURL('image/png'); }, t)
    .then(d => Buffer.from(d.split(',')[1], 'base64'));
  for (let p = 0; p < plan.length; p++) {
    const [name, t0, t1] = plan[p], tag = String(p + 1).padStart(2, '0') + '-' + name;
    const frames = Math.floor((t1 - t0 - turn) * fps);
    const dir = path.join(tmp, tag); fs.mkdirSync(dir);
    for (let i = 0; i < frames; i++) fs.writeFileSync(path.join(dir, String(i).padStart(4, '0') + '.png'), await grab(t0 + i / fps));
    fs.writeFileSync(path.join(outDir, tag + '.png'), await grab(t1 - turn - 0.05));      // 静帧：本页文字全部出齐
    const scale = `scale=${width}:${height}:flags=lanczos`;
    const r = spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(dir, '%04d.png'),
      '-vf', `${scale},split[a][b];[a]palettegen=max_colors=128:stats_mode=full[p];[b][p]paletteuse=dither=none`, '-loop', '0',
      path.join(outDir, tag + '.gif')], { stdio: 'inherit' });
    if (r.status) throw new Error('ffmpeg 失败：' + tag);
    spawnSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(outDir, tag + '.png'), '-vf', scale, path.join(outDir, tag + '.png.tmp.png')]);
    fs.renameSync(path.join(outDir, tag + '.png.tmp.png'), path.join(outDir, tag + '.png'));
    console.log(tag, frames + ' 帧', (fs.statSync(path.join(outDir, tag + '.gif')).size / 1048576).toFixed(1) + ' MB');
  }
  await browser.close();
  fs.rmSync(tmp, { recursive: true, force: true });
})();

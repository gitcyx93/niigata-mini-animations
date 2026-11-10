#!/usr/bin/env node
// 汤泽雪国：把「重剪」这一组结构改动套到简体、繁體、日语三个页面上（只动时间、镜头和文字样式，不动任何文案）。
// 三个页面的场景代码相同、注释和文案各自不同，所以每一处都按代码本身定位，并要求正好命中一次。
// 已经改过的页面会直接报错（不会重复套用）。用法：node viz/tools/recut-yuzawa.cjs
const fs = require('node:fs'), path = require('node:path');
const dir = path.resolve(__dirname, '../winter');
const FILES = ['yuzawa-yukiguni.html', 'yuzawa-yukiguni-tw.html', 'yuzawa-yukiguni-ja.html'];

const CUT = `// ======== 剪辑 ========
// 场景本身仍是 20 秒一圈的首尾无缝循环（下面的 T）；成片 FILM 秒，由 PLAN 把成片时间映射到场景时间，速度始终 1:1，只在切点跳。
// [镜头, 成片起, 成片止, 对应的场景起点]
//   0–3.3      隧道口：新干线冲出来（第 0 秒当封面）
//   3.3–8.7    雪道跟拍：一趟刻滑到急停。整段只放一句大字，两句旁白先后出现
//   8.7–12.3   夜里的雪山：沿着缆车慢慢升上去，几条亮着灯的雪道一起入画（「约 11 座雪场」配这个画面）
//   12.3–16.6  露天温泉：推近、干杯
//   16.6–23.6  拉远到全景，再推回隧道口，接回第 0 秒
const FILM = 23.6;
const PLAN = [['tunnel', 0, 3.3, 0], ['ski', 3.3, 8.7, 3.3], ['mountain', 8.7, 12.3, 4.4], ['onsen', 12.3, 16.6, 8.7], ['panorama', 16.6, 23.6, 13]];
const wrapFilm = f => fract(f / FILM) * FILM;
const planAt = f => { f = wrapFilm(f); return PLAN.find(p => f >= p[1] && f < p[2]) || PLAN[0]; };
const shotAt = f => planAt(f)[0];
const sourceTime = f => { const p = planAt(f); return p[3] + wrapFilm(f) - p[1]; };
// 雪山镜头：从温泉街的屋顶往山顶升，同时很慢地推近（升降镜头，不是平移）
const MOUNTAIN_CAM = [[640, 712, 1.5], [662, 640, 1.7]];   // 楼顶始终压在大字下面，大字落在暗的杉树林上
function mountainCam(k) {
  const [a, b] = MOUNTAIN_CAM, e = lerp(.08, .92, k);                       // 整个镜头都在匀速运动，切进切出时不停顿
  return {x: lerp(a[0], b[0], e), y: lerp(a[1], b[1], e), z: Math.exp(lerp(Math.log(a[2]), Math.log(b[2]), e))};
}
// 大字的出场/退场，按成片时间算（跨成片首尾）
function sceneF(f, from, to) {
  const age = wrapFilm(f - from), dur = wrapFilm(to - from);
  if (age > dur) return 0;
  return {p: from > to && f < to ? 1 : easeOut(age / .55), out: clamp((dur - age) / .35), age};
}

`;

const HEADLINE = `function headline(s, segs, sub, subColor, P) {
  rise(s, () => {
    const wt = P.ink ? 400 : HL.weight;                      // 深色字压在白雪上会显得更细，加一档字重
    const sw = P.ink || P.shade ? 400 : SUBT.weight;
    g.shadowColor = P.ink ? 'rgba(255,255,255,.85)' : P.shade || 'rgba(4,8,22,.55)'; g.shadowBlur = P.shade ? 20 : 12; g.shadowOffsetY = 0;
    rich(segs, LINE1, HL.size, wt, HL.sp, P); if (P.shade) rich(segs, LINE1, HL.size, wt, HL.sp, P);   // 浅色水面上叠两次，字影更实
    if (sub.startsWith('——')) {
      const w = segs.reduce((p, [q]) => p + measure(q, HL.size, wt, HL.sp) + HL.sp, -HL.sp);
      g.globalAlpha *= .72; text(sub, (W + w) / 2, LINE2 - 4, 24, subColor, SUBT.weight, 'right', 1);
    } else for (let k = 0; k < (P.shade ? 2 : 1); k++) text(sub, W / 2, LINE2 + 6, SUBT.size, subColor, sw, 'center', SUBT.sp);
    g.shadowColor = 'transparent'; g.shadowBlur = 0;
  });
}
`;

// [说明, 查找（字符串或正则）, 替换]
const EDITS = [
  ['旧的分镜注释', /(?:^\/\/   \d+–\d+ .*\n){5}/m, ''],
  ['旁白 2', '[3.8, 6.2, ', '[3.6, 5.9, '],
  ['旁白 3', '[6.4, 8.6, ', '[6.1, 8.5, '],
  ['旁白 4', '[9.1, 13.0, ', '[12.7, 16.6, '],
  ['旁白 5', '[14.5, 18.6, ', '[18.1, 22.2, '],
  // 雪地上的字：不再用「暖白字 + 深色光晕」（白底上发灰、琥珀色的关键词几乎看不见），改成深藏青的字，关键词用雪服的橙红
  ['雪地配色', "return onSnow(t) ? {...FIXED_P, glow: 'rgba(16,22,40,.92)'} : FIXED_P;",
    "return onSnow(t) ? {...FIXED_P, head: '#16233f', key: '#d2481f', sub: 'rgba(22,35,63,.88)', ink: 1}\n"
    + "    : t >= 12.3 && t < 17 ? {...FIXED_P, key: '#ffa24f', shade: 'rgba(6,40,46,.8)'} : FIXED_P;   // 温泉的水面是浅绿色：字影换成深的青绿，托住暖白的字"],
  // 滑雪镜头顶上的渐暗加深：旁白压在发亮的雪树上，原来太淡
  ['滑雪顶部压暗', "verticalSprite('skitop-soft', [[0, [12, 26, 46, 54]], [.45, [12, 26, 46, 36]], [1, [12, 26, 46, 0]]])",
    "verticalSprite('skitop-soft2', [[0, [10, 22, 40, 120]], [.5, [10, 22, 40, 96]], [1, [10, 22, 40, 0]]])"],
  ['大字画法', /function headline\(s, segs, sub, subColor, P\) \{\n[\s\S]*?\n\}\n(?=const TEXT_WINDOWS)/, HEADLINE],
  ['大字时间', /const TEXT_WINDOWS = \[\[19\.3, 3\.2\], \[3\.8, 6\.2\], \[6\.4, 8\.6\], \[9\.2, 13\.0\], \[14\.8, 18\.7\]\];.*/,
    'const TEXT_WINDOWS = [[22.9, 3.2], [3.7, 8.5], [9.1, 12.1], [12.8, 16.6], [18.4, 22.3]];   // 成片时间；每个镜头只有一句大字'],
  ['textVis', 'const s = scene(t, a, b); return s', 'const s = sceneF(t, a, b); return s'],
  ['typoFront', 'headline(scene(t, a, b), ...HEADLINES[i](P))', 'headline(sceneF(t, a, b), ...HEADLINES[i](P))'],
  ['render 入口', /^function render\(t\) \{\n  t = fract\(t \/ T\) \* T;\n  const a = trainA\(t\), C = camAt\(t\);/m,
    CUT + `function render(f) {
  f = wrapFilm(f);
  const plan = planAt(f), mountain = plan[0] === 'mountain', t = sourceTime(f);
  const a = trainA(t), C = mountain ? mountainCam((f - plan[1]) / (plan[2] - plan[1])) : camAt(t);`],
  ['滑雪镜头开关', 'const ski = t >= 3.3 && t < 8.7 ? 1 : 0;', 'const ski = plan[0] === \'ski\' ? 1 : 0;'],
  ['标题区用成片时间', 'drawHeader(t, {light: 0, lc: [255, 236, 210], x: W / 2}, HEADER);', 'drawHeader(f, {light: 0, lc: [255, 236, 210], x: W / 2}, HEADER);'],
  ['大字用成片时间', /^  typoFront\(t\);\n\}/m, '  typoFront(f);\n}'],
  ['成片时长', /^boot\(render\);$/m, 'boot(render);\nwindow.LOOP_SECONDS = FILM;   // 导出和检查按成片时长，不是场景循环的 T'],
];

for (const name of FILES) {
  const file = path.join(dir, name);
  let html = fs.readFileSync(file, 'utf8');
  for (const [label, find, to] of EDITS) {
    const n = typeof find === 'string' ? html.split(find).length - 1 : (html.match(new RegExp(find.source, find.flags.replace('g', '') + 'g')) || []).length;
    if (n !== 1) throw new Error(`${name}：「${label}」应命中 1 次，实际 ${n} 次`);
    html = html.replace(find, () => to);
  }
  fs.writeFileSync(file, html);
  console.log('recut ' + name);
}

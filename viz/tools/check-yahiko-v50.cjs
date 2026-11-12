// Focused checks for the V50 door and phone-light fixes; no rendering dependencies.
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const root = path.resolve(__dirname, '../..');
const fx = fs.readFileSync(path.join(root, 'viz/autumn/yahiko-v50-fx.js'), 'utf8');
const html = fs.readFileSync(path.join(root, 'viz/autumn/yahiko-v50.html'), 'utf8');
new vm.Script(fx);
assert(html.includes(fx), 'Rebuild the HTML after editing FX');
for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)) {
  if (!/type=["'](?:application\/json|text\/plain)/i.test(m[1])) new vm.Script(m[2]);
}
const noop = () => {};
const context2d = () => new Proxy({ createLinearGradient: () => ({ addColorStop: noop }) }, {
  get: (o, key) => o[key] || noop,
  set: (o, key, value) => { o[key] = value; return true; }
});
const b = context2d(), people = [], lights = [];
const c = vm.createContext({
  Math, clamp: x => Math.max(0, Math.min(1, x)), ease: x => x*x*(3-2*x),
  lerp: (a,b,t) => a+(b-a)*t, TAU: Math.PI*2, NU: false,
  glow: (...args) => lights.push(args),
  person41: (b,x,y,s,o) => people.push({x,y,s,o}),
  bridgeVisitors: noop, V41V: 7.3
});
vm.runInContext(fx.slice(fx.indexOf('const TOWN_DOOR48='), fx.indexOf('townMoonTime=')), c);
let previous;
for (let i = 151; i <= 530; i++) {
  people.length = 0;
  c.townCoupleV25(b, i/100);
  const inn = people.filter(p => p.o.col[0] === 34);
  assert.equal(inn.length, 1, `Duplicate/missing innkeeper at ${i/100}`);
  assert.equal(inn[0].o.dir, -1, 'Face the visitors to the left, not the right');
  if (previous) assert(Math.hypot(inn[0].x-previous.x, inn[0].y-previous.y) < 1);
  previous = inn[0];
}
vm.runInContext(fx.slice(fx.indexOf('const bridgeHug41='), fx.indexOf('// 拜殿：')), c);
for (const v of [4.2, 5.0, 7.3]) {
  c.V41V = v; people.length = 0;
  c.bridgeVisitors(b, 0);
  const lit = people.filter(p => p.o.phone && p.o.phoneLight);
  assert.equal(lit.length, 3);
  const queued = lit.find(p => p.o.phoneLight[0] === 466);
  const shift = 14*(.5-.5*Math.cos(Math.PI*c.clamp((v-4.7)/.7)));
  assert.equal(queued.x, 466+shift);
}
const target = people.find(p => p.o.phoneLight && p.o.phoneLight[0] === 466);
c.person41C = { getContext: () => context2d() };
vm.runInContext(fx.slice(fx.indexOf('function person41('), fx.indexOf('function flash41(')), c);
lights.length = 0;
c.person41(b,target.x,target.y,target.s,target.o);
assert(lights.length > 0, 'Phone light must be drawn inside the moving person transform');
assert(Math.abs(lights[0][1] - (11+(18-11)*target.o.arm+.5)) < 1e-9);
console.log('PASS: syntax, embedded FX, one continuous left-facing innkeeper, moving phone lights.');

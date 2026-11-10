#!/usr/bin/env node
'use strict';

// Compare the cache to the previous release's integrator using the actual film
// wind and leaf definitions. Exercise forward playback, reverse and random seeks.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { performance } = require('node:perf_hooks');
const { createLeafStateSampler } = require('../../src/yahiko-v38/leaf-motion.js');
const source = path.resolve(__dirname, '../../src/yahiko-v38');
const series = fs.readFileSync(path.join(source, 'series.js'), 'utf8');
const animation = fs.readFileSync(path.join(source, 'animation.js'), 'utf8');
const helpers = series.split('\n').filter(line => /^const (TAU|fract|rnd|clamp|lerp) =/.test(line)).join('\n');
const motion = animation.slice(animation.indexOf('const WINDS='), animation.indexOf('const TORII_GROUND='));
// Keep both implementations in the same JavaScript realm so the timing does
// not include VM global-access overhead in only the old implementation.
const { windField, OPEN_LEAVES: leaves } = Function(`${helpers}\n${motion}\nreturn {windField, OPEN_LEAVES};`)();

// Frozen integration used before the optimisation; the new cache must preserve
// every floating-point state, including the original resting/release behaviour.
function reference(leaf, time) {
  if (time < leaf.born) return null;
  const dt = 1 / 60, n = Math.floor((time - leaf.born) / dt);
  let x = leaf.x, y = leaf.y, vx = leaf.vx, vy = leaf.vy, spin = leaf.ph, w = 1, rest = false;
  for (let i = 0; i < n; i++) {
    const t = leaf.born + i * dt;
    if (rest) { const [wx] = windField(x, y, t); if (wx < 250) continue; rest = false; }
    const [wx, wy] = windField(x, y, t), flutter = Math.sin(t * 5.2 + leaf.ph) * 55;
    vx += ((wx + flutter) - vx) * leaf.k * dt;
    vy += (wy - vy) * leaf.k * dt + 420 * dt;
    x += vx * dt; y += vy * dt;
    const torque = (wx - vx) * .009 * Math.cos(spin + leaf.ph) + Math.sin(t * 2.3 + leaf.ph) * .9;
    w += (torque - 1.8 * w) * dt; spin += w * dt;
    if (leaf.land !== null && t > 3.2 && y >= leaf.land) { y = leaf.land; vx = 0; vy = 0; rest = true; }
  }
  return { x, y, spin, rest };
}

let seed = 0x38;
function random() { seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5; return (seed >>> 0) / 2 ** 32; }
const forward = Array.from({ length: 385 }, (_, i) => i / 60);
const randomTimes = Array.from({ length: 80 }, () => random() * 7.4 - 1);
const times = [...forward, 6.4, 0, ...randomTimes, ...forward.slice().reverse(), -.85, -.6, 6.400001, 9, 2.45, 27.8 - 27.8];
const cached = createLeafStateSampler(windField);
let comparisons = 0;
for (const leaf of leaves) {
  for (const t of [...times, leaf.born - 1e-8, leaf.born, leaf.born + 1 / 60 - 1e-9, leaf.born + 1 / 60]) {
    assert.deepEqual(cached(leaf, t), reference(leaf, t), `Leaf born at ${leaf.born}, time ${t}`);
    comparisons++;
  }
}

const timings = [];
if (process.argv.includes('--benchmark')) for (const [name, sample] of [['previous', reference], ['cached', cached]]) {
  const started = performance.now();
  let sum = 0;
  for (let pass = 0; pass < 3; pass++) for (const t of forward) for (const leaf of leaves) {
    const state = sample(leaf, t);
    if (state) sum += state.x;
  }
  timings.push({ name, milliseconds: +(performance.now() - started).toFixed(2), checksum: sum });
}
if (timings.length) assert.equal(timings[0].checksum, timings[1].checksum);
const cacheBytes = leaves.reduce((sum, leaf) => sum + (Math.max(0, Math.floor((6.4 - leaf.born) * 60)) + 1) * 7 * 8, 0);
console.log(JSON.stringify({ passed: true, leaves: leaves.length, exactStateComparisons: comparisons, cacheBytes, timings,
  warmLookupSpeedup: timings.length ? +(timings[0].milliseconds / timings[1].milliseconds).toFixed(1) : null }, null, 2));

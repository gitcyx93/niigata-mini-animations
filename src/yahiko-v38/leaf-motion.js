// Reuse the exact 60 Hz integration states when rendering or seeking. Each leaf
// owns a bounded Float64 buffer; no frame history or playback order is required.
function createLeafStateSampler(windField, maxTime = 6.4) {
  const dt = 1 / 60;
  const stride = 7;
  const cache = new WeakMap();

  return function openLeafState(leaf, time) {
    if (time < leaf.born) return null;
    const steps = Math.floor((time - leaf.born) / dt);
    let saved = cache.get(leaf);
    if (!saved) {
      const limit = Math.max(0, Math.floor((maxTime - leaf.born) / dt));
      saved = { limit, steps: 0, data: new Float64Array((limit + 1) * stride) };
      saved.data.set([leaf.x, leaf.y, leaf.vx, leaf.vy, leaf.ph, 1, 0]);
      cache.set(leaf, saved);
    }
    if (steps <= saved.steps) {
      const offset = steps * stride;
      return { x: saved.data[offset], y: saved.data[offset + 1], spin: saved.data[offset + 4], rest: !!saved.data[offset + 6] };
    }

    const offset = saved.steps * stride;
    let [x, y, vx, vy, spin, w, resting] = saved.data.subarray(offset, offset + stride);
    let rest = !!resting;
    for (let i = saved.steps; i < steps; i++) {
      const t = leaf.born + i * dt;
      let stopped = false;
      if (rest) {
        const [wx] = windField(x, y, t);
        if (wx < 250) stopped = true;
        else rest = false;
      }
      if (!stopped) {
        const [wx, wy] = windField(x, y, t);
        const flutter = Math.sin(t * 5.2 + leaf.ph) * 55;
        vx += ((wx + flutter) - vx) * leaf.k * dt;
        vy += (wy - vy) * leaf.k * dt + 420 * dt;
        x += vx * dt;
        y += vy * dt;
        const torque = (wx - vx) * .009 * Math.cos(spin + leaf.ph) + Math.sin(t * 2.3 + leaf.ph) * .9;
        w += (torque - 1.8 * w) * dt;
        spin += w * dt;
        if (leaf.land !== null && t > 3.2 && y >= leaf.land) {
          y = leaf.land;
          vx = 0;
          vy = 0;
          rest = true;
        }
      }
      // Calls outside the visible interval still return the original result,
      // while the cache remains bounded by the visible animation segment.
      if (i + 1 <= saved.limit) {
        saved.data.set([x, y, vx, vy, spin, w, Number(rest)], (i + 1) * stride);
      }
    }
    saved.steps = Math.min(steps, saved.limit);
    return { x, y, spin, rest };
  };
}

if (typeof module !== 'undefined' && module.exports) module.exports = { createLeafStateSampler };

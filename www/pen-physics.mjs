/* পেন ফাইট physics: pens are capsules sliding on a rough wooden bench.
   Grip has three parts, so a pen stops like a real pen on wood instead of skating:
   - sliding friction (a steady brake, much stronger once a pen is slow) plus a speed drag, all scaled by the pen's grip;
   - spin friction, so a clipped pen turns a little and then stops turning;
   - static grip: a resting pen soaks up a light knock and only moves when it is hit hard. */

export const W = 480, H = 780, R = 7, POWER = 1500;
const STICK = 5000, STICK_BELOW = 260;
const SLIDE = 2600, DRAG = 0.8, SPIN = 34, SPIN_DRAG = 2.2, HOLD = 50, HOLD_SPIN = 2.4, MAX_SPIN = 18;

export const ends = p => { const c = Math.cos(p.a) * p.L / 2, d = Math.sin(p.a) * p.L / 2; return [p.x - c, p.y - d, p.x + c, p.y + d]; };

// Closest points between two segments.
function closest(a0x, a0y, a1x, a1y, b0x, b0y, b1x, b1y) {
  const ux = a1x - a0x, uy = a1y - a0y, vx = b1x - b0x, vy = b1y - b0y, wx = a0x - b0x, wy = a0y - b0y;
  const a = ux * ux + uy * uy, b = ux * vx + uy * vy, c = vx * vx + vy * vy, d = ux * wx + uy * wy, e = vx * wx + vy * wy, D = a * c - b * b;
  let sN, sD = D, tN, tD = D;
  if (D < 1e-6) { sN = 0; sD = 1; tN = e; tD = c; } else { sN = b * e - c * d; tN = a * e - b * d; if (sN < 0) { sN = 0; tN = e; tD = c; } else if (sN > sD) { sN = sD; tN = e + b; tD = c; } }
  if (tN < 0) { tN = 0; sN = Math.min(Math.max(-d, 0), a); sD = a; } else if (tN > tD) { tN = tD; sN = Math.min(Math.max(b - d, 0), a); sD = a; }
  const sc = Math.abs(sN) < 1e-6 ? 0 : sN / sD, tc = Math.abs(tN) < 1e-6 ? 0 : tN / tD;
  return [a0x + sc * ux, a0y + sc * uy, b0x + tc * vx, b0y + tc * vy];
}

const still = p => Math.hypot(p.vx, p.vy) < 6 && Math.abs(p.w) < .2;
// A pen that was sitting still keeps its place unless the knock beats its grip.
function holdGround(p) {
  const v = Math.hypot(p.vx, p.vy), hold = HOLD * p.grip;
  if (v <= hold) { p.vx = p.vy = 0; } else { p.vx *= (v - hold) / v; p.vy *= (v - hold) / v; }
  const hs = HOLD_SPIN * p.grip * p.spin; p.w = Math.abs(p.w) <= hs ? 0 : p.w - Math.sign(p.w) * hs;
}

function collide(A, B, on) {
  const [ax, ay, bx, by] = closest(...ends(A), ...ends(B)), dx = bx - ax, dy = by - ay, dist = Math.hypot(dx, dy);
  if (dist >= R * 2 || dist < 1e-6) return;
  const nx = dx / dist, ny = dy / dist, overlap = R * 2 - dist, total = 1 / A.m + 1 / B.m;
  A.x -= nx * overlap / A.m / total; A.y -= ny * overlap / A.m / total; B.x += nx * overlap / B.m / total; B.y += ny * overlap / B.m / total;
  const rax = ax - A.x, ray = ay - A.y, rbx = bx - B.x, rby = by - B.y;
  const vax = A.vx - A.w * ray, vay = A.vy + A.w * rax, vbx = B.vx - B.w * rby, vby = B.vy + B.w * rbx;
  const rel = (vbx - vax) * nx + (vby - vay) * ny; if (rel > 0) return;
  const restA = still(A), restB = still(B), e = Math.max(A.bounce, B.bounce);
  const ca = rax * ny - ray * nx, cb = rbx * ny - rby * nx;
  const j = -(1 + e) * rel / (total + ca * ca / A.I + cb * cb / B.I);
  A.vx -= j * nx / A.m; A.vy -= j * ny / A.m; A.w -= ca * j / A.I; B.vx += j * nx / B.m; B.vy += j * ny / B.m; B.w += cb * j / B.I;
  A.w = Math.max(-MAX_SPIN, Math.min(MAX_SPIN, A.w)); B.w = Math.max(-MAX_SPIN, Math.min(MAX_SPIN, B.w));
  if (restA) holdGround(A); if (restB) holdGround(B);
  on?.hit?.((ax + bx) / 2, (ay + by) / 2, -rel);
}

/* One small time step. on.out(pen) is called when a pen's middle leaves the bench. */
export function step(r, dt, on) {
  const live = r.pens.filter(p => !p.out);
  for (const p of r.pens) {
    if (p.out) { p.fall = Math.min(1, (p.fall || 0) + dt * 2.6); p.x += p.vx * dt * .4; p.y += p.vy * dt * .4; p.a += p.w * dt * .5; continue; }
    // Slow pens bite into the wood (STICK), so a slide ends crisply instead of gliding to a stop.
    const v = Math.hypot(p.vx, p.vy), brake = ((SLIDE + STICK * Math.max(0, 1 - v / STICK_BELOW)) * p.grip + DRAG * p.grip * v) * dt;
    if (v <= brake) { p.vx = p.vy = 0; } else { p.vx *= (v - brake) / v; p.vy *= (v - brake) / v; }
    const spinBrake = (SPIN * p.grip * p.spin + SPIN_DRAG * p.spin * Math.abs(p.w)) * dt;
    p.w = Math.abs(p.w) <= spinBrake ? 0 : p.w - Math.sign(p.w) * spinBrake;
    p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.w * dt;
  }
  for (let i = 0; i < live.length; i++) for (let k = i + 1; k < live.length; k++) collide(live[i], live[k], on);
  for (const p of live) if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) { p.out = true; p.fall = 0; r.out.push(p.pid); on?.out?.(p); }
}

export const resting = r => r.pens.every(p => p.out ? (p.fall || 0) >= 1 : Math.hypot(p.vx, p.vy) < 2 && Math.abs(p.w) < .05);

/* A flick: an impulse (jx, jy) at a point (cx, cy) on the pen. */
export function push(p, cx, cy, jx, jy) {
  p.vx += jx / p.m; p.vy += jy / p.m; p.w += ((cx - p.x) * jy - (cy - p.y) * jx) / p.I; p.w = Math.max(-MAX_SPIN, Math.min(MAX_SPIN, p.w));
}

/* Runs a round copy until everything stops. */
export function simulate(r, on, limit = 2400) { for (let k = 0; k < limit && !resting(r); k++) step(r, 1 / 240, on); return r; }

/* ক্যারম: the board, the pieces, the physics and the rules. No drawing here, so it can be tested and simulated.
   The playing surface is S × S units; pockets sit in the four corners. Player 0 shoots from the bottom line, player 1 from the top. */

export const S = 1000, COIN = 19, STRIKER = 25, POCKET = 40, POCKET_AT = 38;
export const BASE = { y: [S - 150, 150], x0: 210, x1: S - 210 };
export const POCKETS = [[POCKET_AT, POCKET_AT], [S - POCKET_AT, POCKET_AT], [POCKET_AT, S - POCKET_AT], [S - POCKET_AT, S - POCKET_AT]];
export const POWER = 2600;
const DECEL = 330, DAMP = 0.6, WALL = 0.72, HIT = 0.92, DT = 1 / 240;
export const QUEEN_POINTS = 3;
/* Board friction: 1 is a freshly powdered board. Every shot rubs some boric powder off (friction rises);
   each player may spread powder once a game, which brings it back down. */
export const FRICTION = { start: 0.75, worn: 0.06, max: 1.7, powder: 0.55, min: 0.6, needs: 0.9 };
export const canPowder = (g, side = g.turn) => g.winner === null && (g.powder?.[side] ?? 1) > 0 && (g.friction ?? 1) >= FRICTION.needs;
export function spreadPowder(g, side = g.turn) {
  if (!canPowder(g, side)) return false;
  g.powder = g.powder || [1, 1]; g.powder[side]--; g.friction = Math.max(FRICTION.min, (g.friction ?? 1) - FRICTION.powder); g.last = { side, powder: true };
  return true;
}

/* 9 white, 9 black around the red queen, in the usual two rings. */
export function rack() {
  const c = S / 2, pieces = [{ id: 'q', kind: 'queen', x: c, y: c }], gap = COIN * 2.06;
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3 + Math.PI / 6; pieces.push({ id: 'i' + k, kind: k % 2 ? 'black' : 'white', x: c + Math.cos(a) * gap, y: c + Math.sin(a) * gap }); }
  for (let k = 0; k < 12; k++) {
    const a = k * Math.PI / 6 + Math.PI / 6, rr = k % 2 ? gap * 1.78 : gap * 2;
    pieces.push({ id: 'o' + k, kind: k % 2 ? 'white' : 'black', x: c + Math.cos(a) * rr, y: c + Math.sin(a) * rr });
  }
  return pieces.map(p => ({ ...p, r: COIN, m: 1, vx: 0, vy: 0, in: false }));
}
export const striker = (side, x = S / 2) => ({ id: 's', kind: 'striker', x, y: BASE.y[side], r: STRIKER, m: 1.6, vx: 0, vy: 0, in: false });

/* One small step of motion: sliding friction, walls, collisions, pockets. Returns ids pocketed in this step. */
export function step(pieces, dt = DT, friction = 1) {
  const live = pieces.filter(p => !p.in), fell = [];
  for (const p of live) {
    const sp = Math.hypot(p.vx, p.vy); if (!sp) continue;
    const slow = Math.max(0, sp - DECEL * friction * dt) * (1 - DAMP * dt) / sp; p.vx *= slow; p.vy *= slow;
    if (Math.hypot(p.vx, p.vy) < 4) { p.vx = p.vy = 0; }
    p.x += p.vx * dt; p.y += p.vy * dt;
    if (p.x < p.r) { p.x = p.r; p.vx = -p.vx * WALL; } if (p.x > S - p.r) { p.x = S - p.r; p.vx = -p.vx * WALL; }
    if (p.y < p.r) { p.y = p.r; p.vy = -p.vy * WALL; } if (p.y > S - p.r) { p.y = S - p.r; p.vy = -p.vy * WALL; }
  }
  for (let i = 0; i < live.length; i++) for (let j = i + 1; j < live.length; j++) {
    const a = live[i], b = live[j], dx = b.x - a.x, dy = b.y - a.y, d = Math.hypot(dx, dy), min = a.r + b.r;
    if (d >= min || d === 0) continue;
    const nx = dx / d, ny = dy / d, push = (min - d) / 2; a.x -= nx * push; a.y -= ny * push; b.x += nx * push; b.y += ny * push;
    const rel = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny; if (rel > 0) continue;
    const j2 = -(1 + HIT) * rel / (1 / a.m + 1 / b.m);
    a.vx -= j2 * nx / a.m; a.vy -= j2 * ny / a.m; b.vx += j2 * nx / b.m; b.vy += j2 * ny / b.m;
  }
  for (const p of live) for (const [px, py] of POCKETS) if (Math.hypot(p.x - px, p.y - py) < POCKET - p.r * .35) { p.in = true; p.vx = p.vy = 0; p.x = px; p.y = py; fell.push(p.id); break; }
  return fell;
}
export const resting = pieces => pieces.every(p => p.in || (!p.vx && !p.vy));

/* Runs a shot to the end (for the computer's planning and for tests). */
export function simulate(pieces, dt = 1 / 120, friction = 1) {
  const fell = []; let n = 0;
  while (!resting(pieces) && n++ < 2400) fell.push(...step(pieces, dt, friction));
  return fell;
}

/* ---------- Rules ----------
   game = {pieces, turn, side colours ['white','black'], pocketed: {0: [ids], 1: [ids]}, queen: null|{by, covered}, pendingQueen, winner} */
export const COLOURS = ['white', 'black'];
export function newGame() { return { pieces: rack(), turn: 0, pocketed: [[], []], queenBy: null, queenPending: null, winner: null, friction: FRICTION.start, powder: [1, 1], shots: 0, last: null }; }
export const score = (g, side) => g.pocketed[side].length + (g.queenBy === side ? QUEEN_POINTS : 0);
const byId = (g, id) => g.pieces.find(p => p.id === id);
function returnToCentre(g, piece) {
  // Put a piece back near the middle, on the first free spot.
  const c = S / 2;
  for (let ring = 0; ring < 8; ring++) for (let k = 0; k < Math.max(1, ring * 6); k++) {
    const a = k / Math.max(1, ring * 6) * Math.PI * 2, x = c + Math.cos(a) * ring * COIN * 2.1, y = c + Math.sin(a) * ring * COIN * 2.1;
    if (g.pieces.every(p => p.in || p === piece || Math.hypot(p.x - x, p.y - y) > p.r + piece.r + 1)) { Object.assign(piece, { x, y, vx: 0, vy: 0, in: false }); return; }
  }
}

/* After a shot comes to rest: fell = ids pocketed during the shot (striker id 's' if it fell). */
export function settle(g, fell) {
  const side = g.turn, mine = COLOURS[side], theirs = COLOURS[1 - side];
  const own = fell.filter(id => byId(g, id).kind === mine), other = fell.filter(id => byId(g, id).kind === theirs);
  const queen = fell.includes('q'), foul = fell.includes('s');
  const last = { side, own: own.length, other: other.length, queen, foul, note: '' };
  g.pocketed[side].push(...own); g.pocketed[1 - side].push(...other);
  let again = own.length > 0;
  // The queen must be covered: pocket one of your own on the same or the next shot.
  if (queen && !foul) { if (own.length) { g.queenBy = side; last.note = 'covered'; } else { g.queenPending = side; again = true; last.note = 'queen'; } }
  else if (g.queenPending === side) { if (own.length && !foul) { g.queenBy = side; last.note = 'covered'; } else { returnToCentre(g, byId(g, 'q')); last.note = 'uncovered'; } g.queenPending = null; }
  if (queen && foul) { returnToCentre(g, byId(g, 'q')); }
  if (foul) {
    // Striker in a pocket: lose the turn and give one pocketed coin back to the middle.
    again = false; const back = g.pocketed[side].pop(); if (back) returnToCentre(g, byId(g, back));
  }
  g.shots++; g.last = last; g.friction = Math.min(FRICTION.max, (g.friction ?? 1) + FRICTION.worn);
  // A side that has all nine of its coins in ends the game; the higher score (queen included) wins.
  if (g.pocketed[0].length >= 9 || g.pocketed[1].length >= 9) { const s0 = score(g, 0), s1 = score(g, 1); g.winner = g.pocketed[0].length >= 9 ? (s0 >= s1 ? 0 : 1) : (s1 >= s0 ? 1 : 0); }
  g.pieces = g.pieces.filter(p => p.id !== 's');
  if (g.winner === null && !again) g.turn = 1 - side;
  return g;
}

/* ---------- Computer ----------
   Tries shots aimed through a coin towards a pocket, plays each one out on a copy, keeps the best. */
export const CPU_LEVELS = { easy: { name: 'সহজ', tries: 18, err: .09 }, medium: { name: 'মাঝারি', tries: 60, err: .035 }, hard: { name: 'কঠিন', tries: 140, err: .008 } };
const clone = p => p.map(q => ({ ...q }));
export function plan(g, level = 'medium', rnd = Math.random) {
  const side = g.turn, mine = COLOURS[side], L = CPU_LEVELS[level] || CPU_LEVELS.medium, y = BASE.y[side];
  const targets = g.pieces.filter(p => !p.in && (p.kind === mine || p.kind === 'queen' || (g.queenPending === side && p.kind === mine)));
  let best = null;
  for (let n = 0; n < L.tries; n++) {
    const coin = targets[Math.floor(rnd() * targets.length)] || g.pieces.find(p => !p.in && p.kind !== 'striker');
    const [px, py] = POCKETS[Math.floor(rnd() * 4)], dx = px - coin.x, dy = py - coin.y, d = Math.hypot(dx, dy) || 1;
    const gx = coin.x - dx / d * (COIN + STRIKER), gy = coin.y - dy / d * (COIN + STRIKER);
    let x = BASE.x0 + rnd() * (BASE.x1 - BASE.x0);
    if (g.pieces.some(p => !p.in && Math.hypot(p.x - x, p.y - y) < p.r + STRIKER + 1)) continue;
    const ax = gx - x, ay = gy - y, len = Math.hypot(ax, ay) || 1, power = Math.min(1, .45 + (len + d) / 2400) * POWER;
    const shot = { x, vx: ax / len * power, vy: ay / len * power };
    const sim = clone(g.pieces); const st = striker(side, x); st.vx = shot.vx; st.vy = shot.vy; sim.push(st);
    const fell = simulate(sim, 1 / 120, g.friction ?? 1), kinds = fell.map(id => id === 's' ? 'striker' : sim.find(p => p.id === id).kind);
    const value = kinds.filter(k => k === mine).length * 10 + (kinds.includes('queen') ? (kinds.includes(mine) ? 14 : 5) : 0) - kinds.filter(k => k === COLOURS[1 - side]).length * 7 - (kinds.includes('striker') ? 16 : 0) + rnd();
    if (!best || value > best.value) best = { ...shot, value };
  }
  best ||= { x: S / 2, vx: 0, vy: (side ? 1 : -1) * POWER * .7, value: 0 };
  const e = (rnd() - .5) * 2 * L.err, c = Math.cos(e), s = Math.sin(e);
  return { x: best.x, vx: best.vx * c - best.vy * s, vy: best.vx * s + best.vy * c };
}

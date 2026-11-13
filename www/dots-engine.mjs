/* জায়গা দখল (dots and boxes): draw one line a turn; close a box and it is yours, and you draw again.
   A board of R × C boxes. Lines are 'h:r:c' (r 0..R, c 0..C-1) and 'v:r:c' (r 0..R-1, c 0..C).
   Shared by the page and the online server. */

export function newGame(rows, cols, players) {
  rows = Math.max(2, Math.min(9, rows | 0)); cols = Math.max(2, Math.min(9, cols | 0));
  return { rows, cols, players: players.map(p => ({ name: p.name, cpu: p.cpu || null })), lines: {}, boxes: {}, turn: 0, last: null, over: false };
}
export const allLines = g => {
  const out = [];
  for (let r = 0; r <= g.rows; r++) for (let c = 0; c < g.cols; c++) out.push(`h:${r}:${c}`);
  for (let r = 0; r < g.rows; r++) for (let c = 0; c <= g.cols; c++) out.push(`v:${r}:${c}`);
  return out;
};
export const free = g => allLines(g).filter(l => !(l in g.lines));
const sides = (r, c) => [`h:${r}:${c}`, `h:${r + 1}:${c}`, `v:${r}:${c}`, `v:${r}:${c + 1}`];
export const drawn = (g, r, c) => sides(r, c).filter(l => l in g.lines).length;
/* The boxes a line borders. */
export function touching(g, line) {
  const [k, a, b] = line.split(':'), r = +a, c = +b, out = [];
  if (k === 'h') { if (r > 0) out.push([r - 1, c]); if (r < g.rows) out.push([r, c]); }
  else { if (c > 0) out.push([r, c - 1]); if (c < g.cols) out.push([r, c]); }
  return out;
}
export const scores = g => g.players.map((_, k) => Object.values(g.boxes).filter(o => o === k).length);

/* Plays a line for whoever's turn it is. Returns a new game, or the same one if the line is taken or invalid. */
export function play(g0, line) {
  if (g0.over || line in g0.lines || !allLines(g0).includes(line)) return g0;
  const g = structuredClone(g0), me = g.turn; g.lines[line] = me;
  const closed = touching(g, line).filter(([r, c]) => drawn(g, r, c) === 4 && !(`${r}:${c}` in g.boxes));
  closed.forEach(([r, c]) => { g.boxes[`${r}:${c}`] = me; });
  g.last = { line, by: me, closed: closed.length };
  if (Object.keys(g.boxes).length === g.rows * g.cols) g.over = true;
  else if (!closed.length) g.turn = (g.turn + 1) % g.players.length;
  return g;
}
/* Places, best first (ties share a place). */
export function standings(g) {
  const s = scores(g);
  return g.players.map((p, k) => ({ k, score: s[k] })).sort((a, b) => b.score - a.score);
}

/* ---------- Computer ---------- */
export const CPU_LEVELS = { easy: 'সহজ', medium: 'মাঝারি', hard: 'কঠিন' };
// A line is "safe" if it gives no box its third side.
const safe = (g, l) => touching(g, l).every(([r, c]) => drawn(g, r, c) < 2);
const closes = (g, l) => touching(g, l).some(([r, c]) => drawn(g, r, c) === 3);
// How many boxes the next player could take in a row after this line.
function giveaway(g, l) {
  let h = play(g, l), n = 0; const who = h.turn;
  while (!h.over && h.turn === who) { const take = free(h).find(x => closes(h, x)); if (!take) break; h = play(h, take); n++; }
  return n;
}
export function choose(g, level = 'medium', rnd = Math.random) {
  const options = free(g), pick = list => list[Math.floor(rnd() * list.length)];
  if (level === 'easy') { const grab = options.filter(l => closes(g, l)); return grab.length && rnd() < .6 ? pick(grab) : pick(options); }
  const grab = options.filter(l => closes(g, l)); if (grab.length) return pick(grab);
  const calm = options.filter(l => safe(g, l)); if (calm.length) return pick(calm);
  if (level === 'medium') return pick(options);
  // Hard: when every line gives something away, give away the least.
  let best = null, least = Infinity;
  for (const l of options) { const n = giveaway(g, l); if (n < least) { least = n; best = l; } }
  return best;
}

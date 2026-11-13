/* লুডু: two games on one engine. Shared by the page (offline and computer play) and the server (online rooms).
   'ludo'  — the four-colour board: a 6 brings a piece out, captures send it home, first with all four home wins.
   'snake' — সাপ লুডু: one piece each on 1–100, ladders climb, snakes bite; exactly 100 wins. */

export const COLOURS = ['red', 'green', 'yellow', 'blue'];
export const COLOUR_NAMES = { red: 'লাল', green: 'সবুজ', yellow: 'হলুদ', blue: 'নীল' };
export const SEATS = { 2: ['red', 'yellow'], 3: ['red', 'green', 'yellow'], 4: COLOURS };
export const START = { red: 0, green: 13, yellow: 26, blue: 39 };
export const SAFE = new Set([0, 8, 13, 21, 26, 34, 39, 47]);
export const HOME = 56; // progress 0–50 on the shared track, 51–55 in the home lane, 56 home
export const SNAKES = { 98: 28, 95: 56, 87: 24, 62: 18, 54: 34, 49: 11, 46: 25, 17: 7 };
export const LADDERS = { 2: 38, 4: 14, 9: 31, 21: 42, 28: 84, 36: 44, 51: 67, 71: 91, 80: 100 };
export const CPU_LEVELS = { easy: 'সহজ', medium: 'মাঝারি', hard: 'কঠিন' };

/* players: [{name, cpu?: 'easy'|'medium'|'hard', id?}] */
export function newMatch(kind, players) {
  const seats = SEATS[players.length] || SEATS[4];
  return {
    kind: kind === 'snake' ? 'snake' : 'ludo', turn: 0, dice: null, rolled: false, sixes: 0, winner: null, edition: 0, last: null,
    players: players.map((p, i) => ({ ...p, colour: seats[i], tokens: kind === 'snake' ? [0] : [-1, -1, -1, -1] }))
  };
}

export const track = (colour, p) => (START[colour] + p) % 52;
const clone = m => structuredClone(m);

/* Which pieces can move with this dice. */
export function movable(m, dice = m.dice) {
  const me = m.players[m.turn]; if (!dice || m.winner !== null) return [];
  if (m.kind === 'snake') return me.tokens[0] + dice <= 100 ? [0] : [];
  return me.tokens.map((p, i) => (p === -1 ? dice === 6 : p + dice <= HOME) ? i : -1).filter(i => i >= 0);
}

const nextTurn = m => { m.turn = (m.turn + 1) % m.players.length; m.dice = null; m.rolled = false; m.sixes = 0; };

/* Rolls for the player whose turn it is. Three sixes in a row lose the turn. */
export function roll(m0, value) {
  const m = clone(m0); if (m.winner !== null || m.rolled) return m;
  m.dice = value; m.rolled = true; m.edition++; m.last = { roll: value, by: m.turn };
  if (value === 6) m.sixes++;
  if (m.kind === 'ludo' && m.sixes === 3) { m.last.note = 'three'; nextTurn(m); return m; }
  if (!movable(m).length) { m.last.note = 'stuck'; if (value === 6 && m.kind === 'snake') { m.rolled = false; m.dice = null; } else nextTurn(m); }
  return m;
}

/* Moves piece i by the rolled dice. Returns the new match; m.last says what happened. */
export function move(m0, i) {
  const m = clone(m0); if (!m.rolled || !movable(m).includes(i)) return m0;
  const me = m.players[m.turn], dice = m.dice; let again = dice === 6;
  m.edition++; m.last = { by: m.turn, piece: i, roll: dice };
  if (m.kind === 'snake') {
    let to = me.tokens[0] + dice;
    if (LADDERS[to]) { m.last.ladder = [to, LADDERS[to]]; to = LADDERS[to]; }
    else if (SNAKES[to]) { m.last.snake = [to, SNAKES[to]]; to = SNAKES[to]; }
    me.tokens[0] = to;
    if (to === 100) m.winner = m.turn;
  } else {
    const p = me.tokens[i] === -1 ? 0 : me.tokens[i] + dice;
    me.tokens[i] = p;
    if (p <= 50) {
      const at = track(me.colour, p);
      if (!SAFE.has(at)) for (const [k, other] of m.players.entries()) if (k !== m.turn) other.tokens.forEach((q, j) => {
        if (q >= 0 && q <= 50 && track(other.colour, q) === at) { other.tokens[j] = -1; m.last.captured = [...(m.last.captured || []), k]; again = true; }
      });
    }
    if (p === HOME) { again = true; m.last.home = true; if (me.tokens.every(q => q === HOME)) m.winner = m.turn; }
  }
  if (m.winner !== null) { m.dice = null; m.rolled = false; return m; }
  if (again) { m.dice = null; m.rolled = false; } else nextTurn(m);
  return m;
}

/* How far along each player is, 0–1, for ordering the losers. */
export const progress = (m, k) => m.kind === 'snake' ? m.players[k].tokens[0] / 100 : m.players[k].tokens.reduce((a, p) => a + (p + 1), 0) / (4 * (HOME + 1));
export const standings = m => m.players.map((p, k) => ({ k, score: m.winner === k ? 2 : progress(m, k) })).sort((a, b) => b.score - a.score).map(x => x.k);

/* ---------- Computer ---------- */
function danger(m, colour, p) {
  // How many opponent pieces sit 1–6 squares behind square p on the shared track.
  if (p > 50 || p < 0) return 0; const at = track(colour, p); if (SAFE.has(at)) return 0;
  let n = 0;
  for (const o of m.players) if (o.colour !== colour) for (const q of o.tokens) if (q >= 0 && q <= 50) { const d = (at - track(o.colour, q) + 52) % 52; if (d >= 1 && d <= 6) n++; }
  return n;
}
export function choose(m, level = 'medium', rnd = Math.random) {
  const options = movable(m); if (!options.length) return null;
  if (m.kind === 'snake' || options.length === 1) return options[0];
  if (level === 'easy') return options[Math.floor(rnd() * options.length)];
  const me = m.players[m.turn];
  const value = i => {
    const after = move(m, i), from = me.tokens[i], to = after.players[m.turn].tokens[i];
    let v = to - Math.max(from, 0);
    if (after.last.captured) v += 60 + (level === 'hard' ? 10 * after.last.captured.length : 0);
    if (to === HOME) v += 45;
    if (from === -1) v += 30;
    if (to <= 50 && SAFE.has(track(me.colour, to))) v += 12;
    if (to > 50 && to < HOME) v += 15;
    if (level === 'hard') { v -= 28 * danger(after, me.colour, to); v += 20 * danger(m, me.colour, from); v += rnd() * 2; }
    else v += rnd() * 8;
    return v;
  };
  return options.map(i => ({ i, v: value(i) })).sort((a, b) => b.v - a.v)[0].i;
}

/* ---------- Board geometry (15 × 15 grid, rows and columns 0–14) ---------- */
export const PATH = (() => {
  const p = [], run = (r, c, dr, dc, n) => { for (let k = 0; k < n; k++) p.push([r + dr * k, c + dc * k]); };
  run(6, 1, 0, 1, 5); run(5, 6, -1, 0, 6); p.push([0, 7]); run(0, 8, 1, 0, 6); run(6, 9, 0, 1, 6); p.push([7, 14]); run(8, 14, 0, -1, 6);
  run(9, 8, 1, 0, 6); p.push([14, 7]); run(14, 6, -1, 0, 6); run(8, 5, 0, -1, 6); p.push([7, 0]); p.push([6, 0]);
  return p;
})();
export const LANE = { red: [[7, 1], [7, 2], [7, 3], [7, 4], [7, 5]], green: [[1, 7], [2, 7], [3, 7], [4, 7], [5, 7]], yellow: [[7, 13], [7, 12], [7, 11], [7, 10], [7, 9]], blue: [[13, 7], [12, 7], [11, 7], [10, 7], [9, 7]] };
export const BASE = { red: [[1.5, 1.5], [1.5, 3.5], [3.5, 1.5], [3.5, 3.5]], green: [[1.5, 10.5], [1.5, 12.5], [3.5, 10.5], [3.5, 12.5]], yellow: [[10.5, 10.5], [10.5, 12.5], [12.5, 10.5], [12.5, 12.5]], blue: [[10.5, 1.5], [10.5, 3.5], [12.5, 1.5], [12.5, 3.5]] };
export const CENTRE = { red: [7, 6.3], green: [6.3, 7], yellow: [7, 7.7], blue: [7.7, 7] };
/* Grid cell [row, col] (may be fractional) for a piece. */
export function cell(colour, p, i) {
  if (p === -1) return BASE[colour][i];
  if (p === HOME) return CENTRE[colour];
  if (p > 50) return LANE[colour][p - 51];
  return PATH[track(colour, p)];
}
/* Snake board: square n (1–100) to [row, col], row 0 at the top, rows snake back and forth. */
export function snakeCell(n) {
  if (n <= 0) return [10, -0.2];
  const r = Math.floor((n - 1) / 10), c = (n - 1) % 10;
  return [9 - r, r % 2 ? 9 - c : c];
}

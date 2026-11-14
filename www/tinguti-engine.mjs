/* তিন গুটি: a 3 × 3 board scratched into the courtyard, three pebbles each.
   First everyone places their three pebbles, one at a time. Then a turn moves one pebble along a line to the next empty point.
   Three of your pebbles in a straight line (row, column or diagonal) wins. A player who cannot move loses.
   Points 0–8 read row by row; the diagonals meet in the middle (4). Shared by the page and the online server. */

export const LINES = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
export const ADJ = { 0: [1, 3, 4], 1: [0, 2, 4], 2: [1, 5, 4], 3: [0, 6, 4], 4: [0, 1, 2, 3, 5, 6, 7, 8], 5: [2, 8, 4], 6: [3, 7, 4], 7: [6, 8, 4], 8: [7, 5, 4] };
export const CPU_LEVELS = { easy: 'সহজ', medium: 'মাঝারি', hard: 'কঠিন' };
const MAX_MOVES = 60;

export function newGame(players) {
  return { players: players.map(p => ({ name: p.name, cpu: p.cpu || null })), board: Array(9).fill(null), turn: 0, placed: [0, 0], moves: 0, winner: null, draw: false, last: null, seen: {} };
}
export const placing = (g, side = g.turn) => g.placed[side] < 3;
export function legal(g) {
  if (g.winner !== null || g.draw) return [];
  if (placing(g)) return g.board.map((v, i) => v === null ? { to: i } : null).filter(Boolean);
  const out = [];
  g.board.forEach((v, i) => { if (v === g.turn) for (const j of ADJ[i]) if (g.board[j] === null) out.push({ from: i, to: j }); });
  return out;
}
export const wins = (board, side) => LINES.some(l => l.every(i => board[i] === side));
const key = g => g.board.map(v => v === null ? '.' : v).join('') + g.turn;

/* Plays a move; returns the new game, or the same object if the move is not allowed. */
export function play(g0, m) {
  if (!m || !legal(g0).some(x => x.to === m.to && (x.from ?? null) === (m.from ?? null))) return g0;
  const g = structuredClone(g0), me = g.turn;
  if (m.from === undefined || m.from === null) g.placed[me]++; else { g.board[m.from] = null; g.moves++; }
  g.board[m.to] = me; g.last = { by: me, from: m.from ?? null, to: m.to };
  if (wins(g.board, me)) { g.winner = me; return g; }
  g.turn = 1 - me;
  if (!placing(g) && !placing(g, me) && !legal(g).length) { g.winner = me; g.last.blocked = true; return g; }
  const k = key(g); g.seen[k] = (g.seen[k] || 0) + 1;
  if (g.seen[k] >= 3 || g.moves >= MAX_MOVES) g.draw = true;
  return g;
}

/* ---------- Computer ---------- */
function search(g, depth, alpha, beta) {
  if (g.winner !== null) return g.winner === g.turn ? 1000 + depth : -1000 - depth;
  if (g.draw || depth === 0) return 0;
  let best = -Infinity;
  for (const m of legal(g)) {
    const n = play(g, m), v = n.winner !== null ? (n.winner === g.turn ? 1000 + depth : -1000 - depth) : -search(n, depth - 1, -beta, -alpha);
    if (v > best) best = v; if (v > alpha) alpha = v; if (alpha >= beta) break;
  }
  return best === -Infinity ? 0 : best;
}
export function choose(g, level = 'medium', rnd = Math.random) {
  const options = legal(g); if (!options.length) return null;
  if (level === 'easy') {
    // Takes an obvious win, otherwise anything.
    const win = options.find(m => play(g, m).winner === g.turn);
    return win || options[Math.floor(rnd() * options.length)];
  }
  const depth = level === 'hard' ? 7 : 3;
  let best = [], top = -Infinity;
  for (const m of options) {
    const n = play(g, m), v = n.winner === g.turn ? 2000 : -search(n, depth - 1, -Infinity, Infinity);
    if (v > top) { top = v; best = [m]; } else if (v === top) best.push(m);
  }
  return best[Math.floor(rnd() * best.length)];
}

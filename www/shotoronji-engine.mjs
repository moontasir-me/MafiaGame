/* শতরঞ্জি: full chess rules (castling, en passant, promotion, check, mate, stalemate, draws) and a small computer player.
   Board: 64 squares, index = row * 8 + col, row 0 is black's back rank. White pieces are capitals: K Q R B N P. */

export const NAMES = { k: 'রাজা', q: 'মন্ত্রী', r: 'নৌকা', b: 'হাতি', n: 'ঘোড়া', p: 'বোড়ে' };
export const VALUE = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 0 };
const START = 'rnbqkbnrpppppppp' + '.'.repeat(32) + 'PPPPPPPPRNBQKBNR';

export function newGame() { return { b: START.split('').map(c => c === '.' ? null : c), turn: 'w', castle: 'KQkq', ep: -1, half: 0, seen: {} }; }
export const colour = p => p ? (p === p.toUpperCase() ? 'w' : 'b') : null;
const other = c => c === 'w' ? 'b' : 'w';
const on = (r, c) => r >= 0 && r < 8 && c >= 0 && c < 8;
const KN = [[-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]];
const KG = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
const DIAG = [[-1, -1], [-1, 1], [1, -1], [1, 1]], LINE = [[-1, 0], [1, 0], [0, -1], [0, 1]];

/* Is square sq attacked by side `by`? */
export function attacked(b, sq, by) {
  const r = sq >> 3, c = sq & 7, is = (rr, cc, set) => { const p = b[rr * 8 + cc]; return p && colour(p) === by && set.includes(p.toLowerCase()); };
  const pr = by === 'w' ? r + 1 : r - 1;
  for (const dc of [-1, 1]) if (on(pr, c + dc) && is(pr, c + dc, 'p')) return true;
  for (const [dr, dc] of KN) if (on(r + dr, c + dc) && is(r + dr, c + dc, 'n')) return true;
  for (const [dr, dc] of KG) if (on(r + dr, c + dc) && is(r + dr, c + dc, 'k')) return true;
  for (const [dirs, set] of [[DIAG, 'bq'], [LINE, 'rq']]) for (const [dr, dc] of dirs) {
    let rr = r + dr, cc = c + dc;
    while (on(rr, cc)) { const p = b[rr * 8 + cc]; if (p) { if (colour(p) === by && set.includes(p.toLowerCase())) return true; break; } rr += dr; cc += dc; }
  }
  return false;
}
export const kingAt = (b, side) => b.indexOf(side === 'w' ? 'K' : 'k');
export const inCheck = (g, side = g.turn) => attacked(g.b, kingAt(g.b, side), other(side));

function pseudo(g) {
  const { b, turn } = g, out = [], add = (from, to, extra = {}) => out.push({ from, to, ...extra });
  for (let sq = 0; sq < 64; sq++) {
    const p = b[sq]; if (!p || colour(p) !== turn) continue;
    const r = sq >> 3, c = sq & 7, t = p.toLowerCase();
    const slide = dirs => { for (const [dr, dc] of dirs) { let rr = r + dr, cc = c + dc; while (on(rr, cc)) { const q = b[rr * 8 + cc]; if (q && colour(q) === turn) break; add(sq, rr * 8 + cc); if (q) break; rr += dr; cc += dc; } } };
    const step = dirs => { for (const [dr, dc] of dirs) if (on(r + dr, c + dc)) { const q = b[(r + dr) * 8 + c + dc]; if (!q || colour(q) !== turn) add(sq, (r + dr) * 8 + c + dc); } };
    if (t === 'p') {
      const d = turn === 'w' ? -1 : 1, home = turn === 'w' ? 6 : 1, last = turn === 'w' ? 0 : 7;
      const push = (to, extra = {}) => (to >> 3) === last ? 'qrbn'.split('').forEach(pr => add(sq, to, { ...extra, promo: pr })) : add(sq, to, extra);
      if (on(r + d, c) && !b[(r + d) * 8 + c]) { push((r + d) * 8 + c); if (r === home && !b[(r + 2 * d) * 8 + c]) add(sq, (r + 2 * d) * 8 + c, { double: true }); }
      for (const dc of [-1, 1]) if (on(r + d, c + dc)) {
        const to = (r + d) * 8 + c + dc, q = b[to];
        if (q && colour(q) !== turn) push(to); else if (to === g.ep) add(sq, to, { ep: true });
      }
    } else if (t === 'n') step(KN); else if (t === 'b') slide(DIAG); else if (t === 'r') slide(LINE); else if (t === 'q') slide([...DIAG, ...LINE]);
    else if (t === 'k') {
      step(KG);
      const row = turn === 'w' ? 56 : 0, [ks, qs] = turn === 'w' ? ['K', 'Q'] : ['k', 'q'], them = other(turn);
      if (sq === row + 4 && !attacked(b, sq, them)) {
        if (g.castle.includes(ks) && !b[row + 5] && !b[row + 6] && !attacked(b, row + 5, them) && !attacked(b, row + 6, them)) add(sq, row + 6, { castle: 'k' });
        if (g.castle.includes(qs) && !b[row + 3] && !b[row + 2] && !b[row + 1] && !attacked(b, row + 3, them) && !attacked(b, row + 2, them)) add(sq, row + 2, { castle: 'q' });
      }
    }
  }
  return out;
}

/* Plays a move and returns the new game (the old one is untouched). */
export function play(g, m) {
  const b = g.b.slice(), p = b[m.from], side = g.turn, took = b[m.to] || (m.ep ? b[m.to + (side === 'w' ? 8 : -8)] : null);
  b[m.to] = m.promo ? (side === 'w' ? m.promo.toUpperCase() : m.promo) : p; b[m.from] = null;
  if (m.ep) b[m.to + (side === 'w' ? 8 : -8)] = null;
  if (m.castle) { const row = m.to & ~7; if (m.castle === 'k') { b[row + 5] = b[row + 7]; b[row + 7] = null; } else { b[row + 3] = b[row]; b[row] = null; } }
  let castle = g.castle;
  const drop = s => { castle = castle.replace(s, ''); };
  if (p === 'K') { drop('K'); drop('Q'); } if (p === 'k') { drop('k'); drop('q'); }
  for (const [sq, s] of [[63, 'K'], [56, 'Q'], [7, 'k'], [0, 'q']]) if (m.from === sq || m.to === sq) drop(s);
  const next = { b, turn: other(side), castle, ep: m.double ? (m.from + m.to) / 2 : -1, half: p.toLowerCase() === 'p' || took ? 0 : g.half + 1, seen: { ...g.seen }, last: { from: m.from, to: m.to }, took };
  const key = b.map(x => x || '.').join('') + next.turn + castle + next.ep; next.seen[key] = (next.seen[key] || 0) + 1;
  return next;
}

export const legal = g => pseudo(g).filter(m => { const n = play(g, m); return !attacked(n.b, kingAt(n.b, g.turn), n.turn); });

function tooFew(b) {
  const rest = b.filter(p => p && p.toLowerCase() !== 'k').map(p => p.toLowerCase());
  return !rest.length || (rest.length === 1 && 'bn'.includes(rest[0]));
}
/* 'mate' | 'stale' | 'fifty' | 'repeat' | 'material' | null. */
export function result(g) {
  if (!legal(g).length) return inCheck(g) ? 'mate' : 'stale';
  if (g.half >= 100) return 'fifty';
  if (Object.values(g.seen).some(n => n >= 3)) return 'repeat';
  if (tooFew(g.b)) return 'material';
  return null;
}

/* ---------- Computer ---------- */
// Pieces like the middle; pawns like moving up.
const centre = sq => { const r = sq >> 3, c = sq & 7; return 3.5 - Math.max(Math.abs(r - 3.5), Math.abs(c - 3.5)); };
function score(b, side) {
  let s = 0;
  for (let sq = 0; sq < 64; sq++) {
    const p = b[sq]; if (!p) continue; const t = p.toLowerCase(), w = colour(p) === side ? 1 : -1;
    let v = VALUE[t] * 100;
    if (t === 'n' || t === 'b') v += centre(sq) * 8; else if (t === 'p') v += (colour(p) === 'w' ? 6 - (sq >> 3) : (sq >> 3) - 1) * 6 + centre(sq) * 3; else if (t === 'q') v += centre(sq) * 2;
    s += w * v;
  }
  return s;
}
const order = (g, list) => list.map(m => ({ m, k: (g.b[m.to] ? VALUE[g.b[m.to].toLowerCase()] * 10 - VALUE[g.b[m.from].toLowerCase()] : 0) + (m.promo === 'q' ? 50 : 0) })).sort((a, b) => b.k - a.k).map(x => x.m);
function search(g, depth, alpha, beta) {
  const list = legal(g);
  if (!list.length) return inCheck(g) ? -100000 - depth : 0;
  if (depth === 0) return score(g.b, g.turn);
  for (const m of order(g, list)) {
    const v = -search(play(g, m), depth - 1, -beta, -alpha);
    if (v >= beta) return beta; if (v > alpha) alpha = v;
  }
  return alpha;
}
export const LEVELS = { easy: { name: 'সহজ', depth: 1, wobble: 120 }, medium: { name: 'মাঝারি', depth: 2, wobble: 25 }, hard: { name: 'কঠিন', depth: 3, wobble: 0 } };
export function bestMove(g, level = 'medium', rnd = Math.random) {
  const { depth, wobble } = LEVELS[level] || LEVELS.medium, list = order(g, legal(g));
  let best = null, top = -Infinity;
  for (const m of list) {
    const v = -search(play(g, m), depth - 1, -Infinity, Infinity) + rnd() * wobble;
    if (v > top) { top = v; best = m; }
  }
  return best;
}

/* Colour Rush: a colour-and-number matching card game for 2–20 players, played online.
   Classic: match the colour or the symbol; Skip, Reverse, Draw 2, Wild, Wild Draw 4. Draw one card if you can't play.
   Ruthless: a bigger, meaner deck. Draw cards stack, you draw until you can play, 7 swaps hands, 0 passes every hand on,
   and anyone holding 25 cards is knocked out. First to empty their hand wins.
   Runs on the server; players only ever see their own hand. */

export const COLOURS = ['r', 'y', 'g', 'b'];
export const COLOUR_NAME = { r: 'Red', y: 'Yellow', g: 'Green', b: 'Blue', w: 'Wild' };
export const DRAW = { d2: 2, d4c: 4, wd4: 4, wd6: 6, wd10: 10, wrev4: 4 };
export const LABEL = { skip: 'Skip', rev: 'Reverse', d2: '+2', d4c: '+4', skipall: 'Skip all', discall: 'Discard all', wild: 'Wild', wd4: 'Wild +4', wd6: 'Wild +6', wd10: 'Wild +10', wrev4: 'Wild reverse +4' };
const HAND = 7, KNOCKOUT = 25;

function oneDeck(mode) {
  const d = [];
  for (const c of COLOURS) {
    d.push({ c, v: '0' });
    for (let n = 1; n <= 9; n++) d.push({ c, v: String(n) }, { c, v: String(n) });
    for (const v of ['skip', 'rev', 'd2']) d.push({ c, v }, { c, v });
    if (mode === 'ruthless') d.push({ c, v: 'd4c' }, { c, v: 'd4c' }, { c, v: 'skipall' }, { c, v: 'skipall' }, { c, v: 'discall' });
  }
  for (let k = 0; k < 4; k++) {
    d.push({ c: 'w', v: 'wild' }, { c: 'w', v: 'wd4' });
    if (mode === 'ruthless') d.push({ c: 'w', v: 'wd6' }, { c: 'w', v: 'wd10' }, { c: 'w', v: 'wrev4' });
  }
  return d;
}
function shuffle(a, rnd) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

export function newGame(players, mode = 'classic', rnd = Math.random) {
  mode = mode === 'ruthless' ? 'ruthless' : 'classic';
  // Enough decks for everyone's hand plus a healthy draw pile.
  const decks = Math.max(1, Math.ceil((players.length * HAND + 60) / (mode === 'ruthless' ? 168 : 108)));
  let id = 0; const pile = shuffle(Array.from({ length: decks }, () => oneDeck(mode)).flat().map(c => ({ ...c, id: 'k' + (id++) })), rnd);
  const g = { mode, players: players.map(p => ({ name: p.name, hand: [], out: false })), draw: pile, discard: [], colour: null, dir: 1, turn: 0, pending: 0, drew: null, winner: null, order: [], last: null, seq: 0 };
  for (let k = 0; k < HAND; k++) for (const p of g.players) p.hand.push(g.draw.pop());
  // The first face-up card is a plain number.
  let top; do { top = g.draw.pop(); if (/^\d$/.test(top.v)) break; g.draw.unshift(top); } while (true);
  g.discard.push(top); g.colour = top.c;
  return g;
}

export const top = g => g.discard[g.discard.length - 1];
const live = g => g.players.map((p, i) => i).filter(i => !g.players[i].out);
function step(g, from = g.turn, n = 1) { let i = from; for (let k = 0; k < n;) { i = (i + g.dir + g.players.length) % g.players.length; if (!g.players[i].out) k++; } return i; }
function drawCards(g, k, n) {
  const got = [];
  for (let i = 0; i < n; i++) {
    if (!g.draw.length) { const t = g.discard.pop(); g.draw = shuffle(g.discard.map(c => ({ ...c, chosen: undefined })), Math.random); g.discard = [t]; if (!g.draw.length) break; }
    const c = g.draw.pop(); g.players[k].hand.push(c); got.push(c);
  }
  return got;
}
export function playable(g, card) {
  const t = top(g);
  if (g.pending) return g.mode === 'ruthless' && DRAW[card.v] !== undefined;
  if (card.c === 'w') return true;
  return card.c === g.colour || card.v === t.v;
}
function knockouts(g) {
  if (g.mode !== 'ruthless') return;
  g.players.forEach((p, i) => { if (!p.out && p.hand.length >= KNOCKOUT) { p.out = true; g.order.unshift(i); g.discard.splice(0, 0, ...p.hand); p.hand = []; g.last = { ...g.last, knocked: [...(g.last?.knocked || []), i] }; } });
  const left = live(g); if (left.length === 1 && g.winner === null) { g.winner = left[0]; }
  if (g.players[g.turn].out && g.winner === null) g.turn = step(g);
}
function finishTurn(g, skip = 0) { g.drew = null; g.turn = step(g, g.turn, 1 + skip); }

/* Moves: {type:'play', card, colour?, target?} | {type:'draw'} | {type:'pass'}. Returns a new game or throws an error code. */
export function act(g0, who, move) {
  if (g0.winner !== null) throw Error('PHASE');
  if (who !== g0.turn) throw Error('TURN');
  const g = structuredClone(g0), me = g.players[who];
  g.seq++;
  if (move.type === 'draw') {
    if (g.drew) throw Error('ACTION');
    if (g.pending) { const n = g.pending; drawCards(g, who, n); g.pending = 0; g.last = { by: who, drewN: n }; finishTurn(g); knockouts(g); return g; }
    let got;
    if (g.mode === 'ruthless') { got = []; do { const c = drawCards(g, who, 1); if (!c.length) break; got.push(c[0]); } while (!playable(g, got[got.length - 1]) && got.length < 40); }
    else got = drawCards(g, who, 1);
    g.last = { by: who, drewN: got.length };
    const lastCard = got[got.length - 1];
    if (lastCard && playable(g, lastCard)) g.drew = lastCard.id; else finishTurn(g);
    knockouts(g); return g;
  }
  if (move.type === 'pass') { if (!g.drew) throw Error('ACTION'); finishTurn(g); return g; }
  if (move.type !== 'play') throw Error('ACTION');
  const at = me.hand.findIndex(c => c.id === move.card); if (at < 0) throw Error('ACTION');
  const card = me.hand[at];
  if (g.drew && g.drew !== card.id) throw Error('ACTION');
  if (!playable(g, card)) throw Error('ACTION');
  if (card.c === 'w' && !COLOURS.includes(move.colour)) throw Error('COLOUR');
  me.hand.splice(at, 1); g.discard.push({ ...card, chosen: card.c === 'w' ? move.colour : undefined });
  g.colour = card.c === 'w' ? move.colour : card.c;
  g.last = { by: who, card: card.v, colour: g.colour };
  const n = live(g).length; let skip = 0;
  if (card.v === 'skip') skip = 1;
  else if (card.v === 'rev' || card.v === 'wrev4') { g.dir *= -1; if (n === 2 && card.v === 'rev') skip = 1; }
  else if (card.v === 'skipall') skip = n - 1;
  else if (card.v === 'discall') { const keep = me.hand.filter(c => c.c !== card.c); g.discard.splice(g.discard.length - 1, 0, ...me.hand.filter(c => c.c === card.c)); g.last.discarded = me.hand.length - keep.length; me.hand = keep; }
  if (DRAW[card.v] !== undefined) {
    if (g.mode === 'ruthless') g.pending += DRAW[card.v];
    else { const victim = step(g); drawCards(g, victim, DRAW[card.v]); g.last.victim = victim; skip = 1; }
  }
  if (g.mode === 'ruthless' && me.hand.length) {
    if (card.v === '7') {
      const t = Number(move.target); if (!Number.isInteger(t) || t === who || !g.players[t] || g.players[t].out) throw Error('TARGET');
      [me.hand, g.players[t].hand] = [g.players[t].hand, me.hand]; g.last.swap = t;
    } else if (card.v === '0') {
      const seats = live(g), hands = seats.map(i => g.players[i].hand);
      seats.forEach((i, k) => { g.players[i].hand = hands[(k - g.dir + seats.length) % seats.length]; }); g.last.rotate = true;
    }
  }
  if (!me.hand.length) { g.winner = who; g.last.won = true; return g; }
  if (me.hand.length === 1) g.last.lastCard = true;
  finishTurn(g, skip); knockouts(g);
  return g;
}

/* What one player may see: their own hand, everyone's card counts, the top of the pile. */
export function viewFor(g, who) {
  if (!g) return g;
  return {
    mode: g.mode, colour: g.colour, dir: g.dir, turn: g.turn, pending: g.pending, winner: g.winner, last: g.last, seq: g.seq,
    drew: g.turn === who ? g.drew : null, drawCount: g.draw.length, top: top(g),
    players: g.players.map((p, i) => ({ name: p.name, count: p.hand.length, out: p.out })),
    hand: who >= 0 && g.players[who] ? g.players[who].hand : [],
    standings: g.winner === null ? null : g.players.map((p, i) => ({ i, n: p.out ? 999 : p.hand.length })).sort((a, b) => a.n - b.n).map(x => x.i)
  };
}
/* An absent player's turn: draw (and play the drawn card if it fits), so a 20-player table never stalls. */
export function autoMove(g) {
  const who = g.turn; let n = act(g, who, { type: 'draw' });
  if (n.drew && n.turn === who) { const c = n.players[who].hand.find(x => x.id === n.drew); n = act(n, who, { type: 'play', card: c.id, colour: c.c === 'w' ? COLOURS[0] : undefined, target: step(n) }); }
  return n;
}

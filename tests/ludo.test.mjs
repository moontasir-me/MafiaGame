import { test } from 'node:test';
import assert from 'node:assert/strict';
import { newMatch, roll, move, movable, choose, standings, PATH, HOME } from '../www/ludo-engine.mjs';
import { LudoRooms, MemoryLudoStore } from '../lib/ludo-online.mjs';

test('the ludo track has 52 different squares and each colour starts on its own', () => {
  assert.equal(PATH.length, 52); assert.equal(new Set(PATH.map(String)).size, 52);
});
test('a six brings a piece out, a capture sends the other home and gives another turn', () => {
  let m = newMatch('ludo', [{ name: 'A' }, { name: 'B' }]);
  m = roll(m, 3); assert.equal(m.turn, 1, 'no six, nothing to move: turn passes');
  m = roll(m, 6); assert.deepEqual(movable(m), [0, 1, 2, 3]); m = move(m, 0); assert.equal(m.turn, 1, 'a six plays again');
  // Put B's piece one step from A's piece on the shared track and capture it.
  m.players[0].tokens[0] = 30; m.players[1].tokens[0] = 3; // yellow starts at 26: 26+3 = 29, red 30 → square 30
  m = roll(m, 1); m = move(m, 0);
  assert.equal(m.players[0].tokens[0], -1); assert.ok(m.last.captured); assert.equal(m.turn, 1);
});
test('exact count to get home, and all four home wins', () => {
  let m = newMatch('ludo', [{ name: 'A' }, { name: 'B' }]);
  m.players[0].tokens = [HOME, HOME, HOME, 54];
  m = roll(m, 3); assert.equal(m.turn, 1, '54 + 3 overshoots');
  m.turn = 0; m = roll(m, 2); m = move(m, 3); assert.equal(m.winner, 0); assert.equal(standings(m)[0], 0);
});
test('সাপ লুডু: ladders climb, snakes bite, exactly 100 wins', () => {
  let m = newMatch('snake', [{ name: 'A' }, { name: 'B' }]);
  m = roll(m, 4); m = move(m, 0); assert.equal(m.players[0].tokens[0], 14);
  m.turn = 0; m.players[0].tokens[0] = 12; m = roll(m, 5); m = move(m, 0); assert.equal(m.players[0].tokens[0], 7);
  m.turn = 0; m.players[0].tokens[0] = 97; m = roll(m, 4); assert.equal(m.players[0].tokens[0], 97);
  m.turn = 0; m.rolled = false; m = roll(m, 3); m = move(m, 0); assert.equal(m.winner, 0);
});
test('the hard computer beats the easy one most of the time', () => {
  let hard = 0;
  for (let g = 0; g < 40; g++) {
    let m = newMatch('ludo', [{ name: 'H', cpu: 'hard' }, { name: 'E', cpu: 'easy' }]), n = 0;
    while (m.winner === null && n++ < 4000) { m = roll(m, 1 + Math.floor(Math.random() * 6)); if (m.rolled) m = move(m, choose(m, m.players[m.turn].cpu)); }
    if (m.winner === 0) hard++;
  }
  assert.ok(hard >= 26, `hard won ${hard}/40`);
});
test('online room: join by code, only the player whose turn it is may roll, the server rolls', async () => {
  let face = 6; const rooms = new LudoRooms(new MemoryLudoStore(), { dice: () => face });
  const a = await rooms.handle({ op: 'create', name: 'Rafi', kind: 'ludo' });
  assert.match(a.code, /^[A-Z0-9]{5}$/);
  const b = await rooms.handle({ op: 'join', name: 'Mitu', code: a.code.toLowerCase() });
  await assert.rejects(rooms.handle({ op: 'start', code: a.code, token: b.token }), /HOST_ONLY/);
  let v = await rooms.handle({ op: 'start', code: a.code, token: a.token });
  assert.equal(v.started, true); assert.deepEqual(v.match.players.map(p => p.colour), ['red', 'yellow']);
  await assert.rejects(rooms.handle({ op: 'roll', code: a.code, token: b.token }), /TURN/);
  v = await rooms.handle({ op: 'roll', code: a.code, token: a.token }); assert.equal(v.match.dice, 6);
  v = await rooms.handle({ op: 'move', code: a.code, token: a.token, piece: 2 }); assert.equal(v.match.players[0].tokens[2], 0);
  await assert.rejects(rooms.handle({ op: 'join', name: 'Joy', code: a.code }), /STARTED/);
  await assert.rejects(rooms.handle({ op: 'state', code: 'ZZZZZ', token: a.token }), /ROOM_GONE/);
});

test('rooms: a finished ludo game keeps its room 10 minutes, a game in play 2 hours', async () => {
  const saves = [];
  class Store extends MemoryLudoStore { async save(id, rev, payload, seconds) { saves.push(seconds); return super.save(id, rev, payload); } }
  let face = 6; const rooms = new LudoRooms(new Store(), { dice: () => face });
  const a = await rooms.handle({ op: 'create', name: 'A', kind: 'snake' }), b = await rooms.handle({ op: 'join', name: 'B', code: a.code });
  await rooms.handle({ op: 'start', code: a.code, token: a.token });
  assert.equal(saves.at(-1), 7200);
  const key = 'LUDO-' + a.code, row = rooms.store.rows.get(key); row.payload.match.players[0].tokens[0] = 97; face = 3;
  await rooms.handle({ op: 'roll', code: a.code, token: a.token }); await rooms.handle({ op: 'move', code: a.code, token: a.token, piece: 0 });
  assert.equal(saves.at(-1), 600);
});

test('online চতুরঙ্গ: host is white, moves are checked, resign ends it', async () => {
  const rooms = new LudoRooms(new MemoryLudoStore());
  const a = await rooms.handle({ op: 'create', name: 'A', game: 'chess' }), b = await rooms.handle({ op: 'join', name: 'B', code: a.code, game: 'chess' });
  await assert.rejects(rooms.handle({ op: 'join', name: 'C', code: a.code, game: 'chess' }), /FULL/);
  await assert.rejects(rooms.handle({ op: 'join', name: 'D', code: a.code, game: 'ludo' }), /WRONG_GAME/);
  await rooms.handle({ op: 'start', code: a.code, token: a.token });
  await assert.rejects(rooms.handle({ op: 'move', code: a.code, token: b.token, move: { from: 12, to: 28 } }), /TURN/);
  await assert.rejects(rooms.handle({ op: 'move', code: a.code, token: a.token, move: { from: 52, to: 28 } }), /ACTION/);
  let v = await rooms.handle({ op: 'move', code: a.code, token: a.token, move: { from: 52, to: 36 } });
  assert.equal(v.match.g.turn, 'b');
  v = await rooms.handle({ op: 'resign', code: a.code, token: b.token });
  assert.equal(v.match.winner, 'w');
});
test('online পেন ফাইট: only the shooter (or host) may report, and stale reports are refused', async () => {
  const rooms = new LudoRooms(new MemoryLudoStore());
  const a = await rooms.handle({ op: 'create', name: 'A', game: 'pen', pen: 'iteen' }), b = await rooms.handle({ op: 'join', name: 'B', code: a.code, pen: 'econo' });
  let v = await rooms.handle({ op: 'start', code: a.code, token: a.token });
  assert.deepEqual(v.match.pens, ['iteen', 'econo']);
  await assert.rejects(rooms.handle({ op: 'sync', code: a.code, token: b.token, seq: 0, data: { round: { turn: 'p0' } } }), /TURN/);
  v = await rooms.handle({ op: 'sync', code: a.code, token: a.token, seq: 0, data: { phase: 'play', round: { turn: 'p1' } } });
  await assert.rejects(rooms.handle({ op: 'sync', code: a.code, token: b.token, seq: 0, data: {} }), /STALE/);
  v = await rooms.handle({ op: 'sync', code: a.code, token: b.token, seq: 1, data: { phase: 'play', round: { turn: 'p0' } }, shot: { pid: 'p1', cx: 1, cy: 2, jx: 3, jy: 4 } });
  assert.equal(v.match.shot.by, 1); assert.equal(v.match.seq, 2);
});

import * as C from '../www/carrom-physics.mjs';
test('ক্যারম: 9 white, 9 black and the queen, rack without overlap; own coin plays again, striker in a pocket is a foul', () => {
  const r = C.rack(); assert.equal(r.length, 19); assert.equal(r.filter(p => p.kind === 'white').length, 9);
  for (let i = 0; i < r.length; i++) for (let j = i + 1; j < r.length; j++) assert.ok(Math.hypot(r[i].x - r[j].x, r[i].y - r[j].y) >= 2 * C.COIN);
  let g = C.newGame(); const w = g.pieces.find(p => p.kind === 'white'); w.in = true;
  C.settle(g, [w.id]); assert.equal(g.turn, 0); assert.equal(C.score(g, 0), 1);
  g.pieces.push({ ...C.striker(0), in: true }); C.settle(g, ['s']); assert.equal(g.turn, 1); assert.equal(C.score(g, 0), 0, 'a pocketed coin goes back');
});
test('ক্যারম: the queen counts only when covered', () => {
  let g = C.newGame(); const q = g.pieces.find(p => p.id === 'q'); q.in = true;
  C.settle(g, ['q']); assert.equal(g.queenPending, 0); assert.equal(g.turn, 0);
  C.settle(g, []); assert.equal(g.queenBy, null); assert.equal(q.in, false, 'uncovered queen goes back');
  g = C.newGame(); const q2 = g.pieces.find(p => p.id === 'q'), w = g.pieces.find(p => p.kind === 'white'); q2.in = w.in = true;
  C.settle(g, ['q', w.id]); assert.equal(C.score(g, 0), 1 + C.QUEEN_POINTS);
});

test('online ক্যারম: two players, host racks, only the shooter reports, a win closes the room soon', async () => {
  const saves = [];
  class Store extends MemoryLudoStore { async save(id, rev, payload, seconds) { saves.push(seconds); return super.save(id, rev, payload); } }
  const rooms = new LudoRooms(new Store());
  const a = await rooms.handle({ op: 'create', name: 'A', game: 'carrom' }), b = await rooms.handle({ op: 'join', name: 'B', code: a.code, game: 'carrom' });
  await assert.rejects(rooms.handle({ op: 'join', name: 'C', code: a.code, game: 'carrom' }), /FULL/);
  await rooms.handle({ op: 'start', code: a.code, token: a.token });
  await assert.rejects(rooms.handle({ op: 'sync', code: a.code, token: b.token, seq: 0, data: { g: { turn: 0, winner: null } } }), /TURN/);
  await rooms.handle({ op: 'sync', code: a.code, token: a.token, seq: 0, data: { g: { turn: 1, winner: null } } });
  await assert.rejects(rooms.handle({ op: 'sync', code: a.code, token: a.token, seq: 1, data: { g: { turn: 0, winner: null } } }), /TURN/);
  await rooms.handle({ op: 'sync', code: a.code, token: b.token, seq: 1, data: { g: { turn: 1, winner: 1 } }, shot: { x: 500, vx: 0, vy: 900 } });
  assert.equal(saves.at(-1), 600);
});

test('ক্যারম: shots wear the powder off, each player may powder once, a powdered board slides further', () => {
  const g = C.newGame(); assert.equal(C.canPowder(g, 0), false, 'a freshly powdered board needs nothing yet');
  for (let i = 0; i < 3; i++) C.settle(g, []);
  assert.equal(C.spreadPowder(g, 0), true, 'after a few shots it may be powdered');
  assert.equal(C.spreadPowder(g, 0), false, 'only once each');
  for (let i = 0; i < 8; i++) C.settle(g, []);
  assert.ok(g.friction > C.FRICTION.needs);
  const run = f => { const p = [C.striker(0)]; p[0].vy = -400; C.simulate(p, 1 / 240, f); return p[0].y; };
  assert.ok(run(0.6) < run(1.6), 'less friction carries the striker further up the board');
});

import * as D from '../www/dots-engine.mjs';
test('জায়গা দখল: closing a box keeps the turn, the fourth side owns it, online checks turns', async () => {
  let g = D.newGame(2, 2, [{ name: 'A' }, { name: 'B' }]);
  g = D.play(g, 'h:0:0'); g = D.play(g, 'v:0:0'); g = D.play(g, 'v:0:1'); assert.equal(g.turn, 1);
  g = D.play(g, 'h:1:0'); assert.equal(g.boxes['0:0'], 1); assert.equal(g.turn, 1, 'closing a box draws again');
  assert.equal(D.play(g, 'h:1:0'), g, 'a drawn line cannot be drawn again');
  const rooms = new LudoRooms(new MemoryLudoStore());
  const a = await rooms.handle({ op: 'create', name: 'A', game: 'dots', size: [3, 3] }), b = await rooms.handle({ op: 'join', name: 'B', code: a.code, game: 'dots' });
  let v = await rooms.handle({ op: 'start', code: a.code, token: a.token }); assert.equal(v.match.rows, 3);
  await assert.rejects(rooms.handle({ op: 'line', code: a.code, token: b.token, line: 'h:0:0' }), /TURN/);
  v = await rooms.handle({ op: 'line', code: a.code, token: a.token, line: 'h:0:0' }); assert.equal(v.match.turn, 1);
});

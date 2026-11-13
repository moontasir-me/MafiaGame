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

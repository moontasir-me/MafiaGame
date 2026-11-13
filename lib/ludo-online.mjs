/* Online table rooms for লুডু, শতরঞ্জি and কলম যুদ্ধ: a 5-letter join code, the server keeps the game.
   লুডু and শতরঞ্জি are checked move by move on the server. কলম যুদ্ধ is physics on the shooter's phone:
   the server only checks that the sender is the one whose turn it is, then shares the result with the table.
   Rooms live in the same store as the Mafia rooms, under "LUDO-<code>". */
import {randomBytes, randomInt} from 'node:crypto';
import {newMatch, roll, move, movable} from '../www/ludo-engine.mjs';
import {newGame, legal, play as chessPlay, result as chessResult} from '../www/shotoronji-engine.mjs';

const fail = code => { throw Error(code); };
const LETTERS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const IDLE = 60000; // a ludo player who does nothing for a minute loses the turn
const key = code => 'LUDO-' + code;
const cleanName = n => String(n || '').trim().replace(/\s+/g, ' ').slice(0, 20);
export const ROOM_GAMES = {ludo: {min: 2, max: 4}, chess: {min: 2, max: 2}, pen: {min: 2, max: 4}, carrom: {min: 2, max: 2}};

function begin(room) {
  const names = room.members.map(m => m.name);
  if (room.game === 'chess') return {g: newGame(), moves: [], end: null, winner: null};
  if (room.game === 'pen') return {seq: 0, data: null, pens: room.members.map(m => m.pen || 'pinpoint')};
  if (room.game === 'carrom') return {seq: 0, data: null};
  return newMatch(room.kind, names.map(name => ({name})));
}
export function finished(room) {
  const m = room.match; if (!m) return false;
  if (room.game === 'chess') return !!m.end;
  if (room.game === 'pen') return m.data?.phase === 'over';
  if (room.game === 'carrom') return m.data?.g?.winner != null;
  return m.winner !== null;
}

export class LudoRooms {
  constructor(store, {now = Date.now, dice = () => randomInt(1, 7)} = {}) { this.store = store; this.now = now; this.dice = dice; }

  view(room, token) {
    const me = room.members.findIndex(m => m.token === token);
    return {code: room.code, game: room.game || 'ludo', kind: room.kind, me, host: me === 0, started: !!room.match, members: room.members.map(m => m.name), match: room.match, turnAt: room.turnAt, now: this.now()};
  }
  idle(room) {
    const m = room.match;
    if ((room.game || 'ludo') !== 'ludo' || !m || m.winner !== null || this.now() - room.turnAt < IDLE) return false;
    // Roll and play the first legal piece for the absent player, so the game never stalls.
    let next = m.rolled ? m : roll(m, this.dice());
    if (next.rolled && next.turn === m.turn) next = move(next, movable(next)[0]);
    room.match = next; room.turnAt = this.now(); return true;
  }
  act(room, me, op, body) {
    const m = room.match, game = room.game || 'ludo'; if (!m) fail('PHASE');
    if (game === 'ludo') {
      if (m.winner !== null) fail('PHASE'); if (m.turn !== me) fail('TURN');
      if (op === 'roll') { if (m.rolled) fail('PHASE'); room.match = roll(m, this.dice()); return; }
      if (op === 'move') { const next = move(m, Number(body.piece)); if (next === m) fail('ACTION'); room.match = next; return; }
    }
    if (game === 'chess') {
      if (m.end) fail('PHASE'); const side = me === 0 ? 'w' : 'b';
      if (op === 'resign') { m.end = 'resign'; m.winner = side === 'w' ? 'b' : 'w'; return; }
      if (op === 'move') {
        if (m.g.turn !== side) fail('TURN');
        const want = body.move || {}, choice = legal(m.g).find(x => x.from === want.from && x.to === want.to && (x.promo || null) === (want.promo || null));
        if (!choice) fail('ACTION');
        m.g = chessPlay(m.g, choice); m.moves.push(String(body.note || '').slice(0, 40)); delete m.g.seen; m.g.seen = {};
        const end = chessResult(m.g); if (end && end !== 'repeat') { m.end = end; m.winner = end === 'mate' ? side : null; }
        return;
      }
    }
    if ((game === 'pen' || game === 'carrom') && op === 'sync') {
      // Physics runs on the shooter's phone. The host sets the board up; after that only the shooter may report.
      if (Number(body.seq) !== m.seq) fail('STALE');
      const mayReport = game === 'pen' ? (me === 0 || m.data?.round?.turn === 'p' + me) : (m.data ? m.data.g?.turn === me && m.data.g?.winner == null : me === 0);
      if (!mayReport) fail('TURN');
      const data = body.data; if (!data || typeof data !== 'object' || JSON.stringify(data).length > 60000) fail('ACTION');
      m.data = data; m.seq++; m.shot = body.shot && typeof body.shot === 'object' ? {...body.shot, by: me, seq: m.seq} : null; return;
    }
    fail('ACTION');
  }

  async handle(body = {}) {
    const op = String(body.op || '');
    if (op === 'create') {
      const name = cleanName(body.name); if (!name) fail('NAME');
      const game = ROOM_GAMES[body.game] ? body.game : 'ludo';
      for (let attempt = 0; attempt < 8; attempt++) {
        const code = Array.from({length: 5}, () => LETTERS[randomInt(LETTERS.length)]).join(''), token = randomBytes(16).toString('hex');
        const room = {code, game, kind: body.kind === 'snake' ? 'snake' : 'ludo', members: [{name, token, pen: String(body.pen || '').slice(0, 20)}], match: null, turnAt: this.now()};
        if (await this.store.create(key(code), room)) return {token, ...this.view(room, token)};
      }
      fail('BUSY');
    }
    const code = String(body.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!/^[A-Z0-9]{5}$/.test(code)) fail('ROOM_GONE');
    for (let attempt = 0; attempt < 16; attempt++) {
      const record = await this.store.load(key(code)); if (!record) fail('ROOM_GONE');
      const room = record.payload; room.game ||= 'ludo'; let token = String(body.token || ''), changed = false;
      if (body.game && body.game !== room.game) fail('WRONG_GAME');
      if (op === 'join') {
        const name = cleanName(body.name); if (!name) fail('NAME');
        const again = room.members.find(m => m.name.toLocaleLowerCase() === name.toLocaleLowerCase());
        if (again) { if (room.match) return {token: again.token, ...this.view(room, again.token)}; fail('NAME_TAKEN'); }
        if (room.match) fail('STARTED'); if (room.members.length >= ROOM_GAMES[room.game].max) fail('FULL');
        token = randomBytes(16).toString('hex'); room.members.push({name, token, pen: String(body.pen || '').slice(0, 20)}); changed = true;
      } else {
        const me = room.members.findIndex(m => m.token === token); if (me < 0) fail('AUTH');
        if (op === 'state') changed = this.idle(room);
        else if (op === 'start') {
          if (me !== 0) fail('HOST_ONLY'); if (room.match) fail('STARTED'); if (room.members.length < ROOM_GAMES[room.game].min) fail('COUNTS');
          room.match = begin(room); room.turnAt = this.now(); changed = true;
        } else if (op === 'again') {
          if (me !== 0) fail('HOST_ONLY'); if (!finished(room)) fail('PHASE');
          room.match = begin(room); room.turnAt = this.now(); changed = true;
        } else { this.act(room, me, op, body); room.turnAt = this.now(); changed = true; }
      }
      if (!changed) { await this.store.touch?.(key(code)); return {token, ...this.view(room, token)}; }
      // A finished game keeps its room 10 minutes for the result, then the database drops it.
      if (await this.store.save(key(code), record.revision, room, finished(room) ? 600 : 7200)) return {token, ...this.view(room, token)};
      await new Promise(r => setTimeout(r, Math.random() * 30 * (attempt + 1)));
    }
    fail('BUSY');
  }
}
export {LudoRooms as TableRooms};

/* A store in memory, for the local server and tests. */
export class MemoryLudoStore {
  constructor() { this.rows = new Map(); }
  async create(id, payload) { if (this.rows.has(id)) return false; this.rows.set(id, {revision: 1, payload: structuredClone(payload)}); return true; }
  async load(id) { const r = this.rows.get(id); return r ? structuredClone(r) : null; }
  async save(id, revision, payload) { const r = this.rows.get(id); if (!r || r.revision !== revision) return false; this.rows.set(id, {revision: revision + 1, payload: structuredClone(payload)}); return true; }
  async touch() {}
}

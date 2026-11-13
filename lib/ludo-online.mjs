/* Online লুডু rooms: a 5-letter join code, 2–4 people, the server rolls the dice and checks every move.
   Rooms live in the same store as the Mafia rooms, under the key "LUDO-<code>". */
import {randomBytes, randomInt} from 'node:crypto';
import {newMatch, roll, move, movable} from '../www/ludo-engine.mjs';

const fail = code => { throw Error(code); };
const LETTERS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const IDLE = 60000; // a player who does nothing for a minute loses the turn
const key = code => 'LUDO-' + code;
const cleanName = n => String(n || '').trim().replace(/\s+/g, ' ').slice(0, 20);

export class LudoRooms {
  constructor(store, {now = Date.now, dice = () => randomInt(1, 7)} = {}) { this.store = store; this.now = now; this.dice = dice; }

  view(room, token) {
    const me = room.members.findIndex(m => m.token === token);
    return {code: room.code, kind: room.kind, me, host: me === 0, started: !!room.match, members: room.members.map(m => m.name), match: room.match, turnAt: room.turnAt, now: this.now()};
  }
  idle(room) {
    const m = room.match;
    if (!m || m.winner !== null || this.now() - room.turnAt < IDLE) return false;
    // Roll and play the first legal piece for the absent player, so the game never stalls.
    let next = m.rolled ? m : roll(m, this.dice());
    if (next.rolled && next.turn === m.turn) next = move(next, movable(next)[0]);
    room.match = next; room.turnAt = this.now(); return true;
  }

  async handle(body = {}) {
    const op = String(body.op || '');
    if (op === 'create') {
      const name = cleanName(body.name); if (!name) fail('NAME');
      for (let attempt = 0; attempt < 8; attempt++) {
        const code = Array.from({length: 5}, () => LETTERS[randomInt(LETTERS.length)]).join(''), token = randomBytes(16).toString('hex');
        const room = {code, kind: body.kind === 'snake' ? 'snake' : 'ludo', members: [{name, token}], match: null, turnAt: this.now()};
        if (await this.store.create(key(code), room)) return {token, ...this.view(room, token)};
      }
      fail('BUSY');
    }
    const code = String(body.code || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (!/^[A-Z0-9]{5}$/.test(code)) fail('ROOM_GONE');
    for (let attempt = 0; attempt < 16; attempt++) {
      const record = await this.store.load(key(code)); if (!record) fail('ROOM_GONE');
      const room = record.payload; let token = String(body.token || ''), changed = false;
      if (op === 'join') {
        const name = cleanName(body.name); if (!name) fail('NAME');
        const again = room.members.find(m => m.name.toLocaleLowerCase() === name.toLocaleLowerCase());
        if (again) { if (room.match) return {token: again.token, ...this.view(room, again.token)}; fail('NAME_TAKEN'); }
        if (room.match) fail('STARTED'); if (room.members.length >= 4) fail('FULL');
        token = randomBytes(16).toString('hex'); room.members.push({name, token}); changed = true;
      } else {
        const me = room.members.findIndex(m => m.token === token); if (me < 0) fail('AUTH');
        if (op === 'state') changed = this.idle(room);
        else if (op === 'start') {
          if (me !== 0) fail('HOST_ONLY'); if (room.match) fail('STARTED'); if (room.members.length < 2) fail('COUNTS');
          room.match = newMatch(room.kind, room.members.map(m => ({name: m.name}))); room.turnAt = this.now(); changed = true;
        } else if (op === 'roll' || op === 'move') {
          const m = room.match; if (!m || m.winner !== null) fail('PHASE'); if (m.turn !== me) fail('TURN');
          if (op === 'roll') { if (m.rolled) fail('PHASE'); room.match = roll(m, this.dice()); }
          else { const next = move(m, Number(body.piece)); if (next === m) fail('ACTION'); room.match = next; }
          room.turnAt = this.now(); changed = true;
        } else fail('ACTION');
      }
      if (!changed) { await this.store.touch?.(key(code)); return {token, ...this.view(room, token)}; }
      // A finished game keeps its room 10 minutes for the result, then the database drops it.
      if (await this.store.save(key(code), record.revision, room, room.match?.winner != null ? 600 : 7200)) return {token, ...this.view(room, token)};
      await new Promise(r => setTimeout(r, Math.random() * 30 * (attempt + 1)));
    }
    fail('BUSY');
  }
}

/* A store in memory, for the local server and tests. */
export class MemoryLudoStore {
  constructor() { this.rows = new Map(); }
  async create(id, payload) { if (this.rows.has(id)) return false; this.rows.set(id, {revision: 1, payload: structuredClone(payload)}); return true; }
  async load(id) { const r = this.rows.get(id); return r ? structuredClone(r) : null; }
  async save(id, revision, payload) { const r = this.rows.get(id); if (!r || r.revision !== revision) return false; this.rows.set(id, {revision: revision + 1, payload: structuredClone(payload)}); return true; }
  async touch() {}
}

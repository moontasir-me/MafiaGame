import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ensureAccount, readAccounts, addCoins, buyGear, toggleGear, fitted, deleteAccount } from '../www/accounts.mjs';
import { saveMatch, readHistory } from '../www/history.mjs';
import { penStats } from '../www/pen-gear.mjs';
import { push, simulate, POWER } from '../www/pen-physics.mjs';
import { byLevel } from '../www/riddle-levels.mjs';
import { RIDDLES } from '../www/riddles.mjs';
import { BANKS, makeQuestion } from '../www/fib-questions.mjs';

const memory = () => { const m = new Map(); return { getItem: k => m.get(k) ?? null, setItem: (k, v) => m.set(k, String(v)) }; };

test('accounts are made from a name, shared by case, and earn and spend coins', () => {
  const st = memory(), a = ensureAccount('  Rafi ', st);
  assert.equal(a.name, 'Rafi');
  assert.equal(ensureAccount('rafi', st).id, a.id);
  ensureAccount('Mitu', st);
  assert.equal(readAccounts(st).length, 2);
  assert.throws(() => buyGear(a.id, 'gripper', st), /COINS/);
  addCoins('RAFI', 30, st);
  buyGear(a.id, 'gripper', st); buyGear(a.id, 'gripper', st);
  const after = readAccounts(st).find(x => x.id === a.id);
  assert.equal(after.coins, 30 - 8 - 12); assert.equal(after.earned, 30); assert.equal(after.gear.gripper, 2);
  toggleGear(a.id, 'gripper', st);
  assert.equal(fitted(readAccounts(st)[0]).gripper, 0);
});

test('deleting an account removes its coins and its ranking points', () => {
  const st = memory(), a = ensureAccount('Rafi', st); ensureAccount('Mitu', st);
  saveMatch({ id: 'm1', game: 'pen', players: [{ name: 'Rafi', points: 5 }, { name: 'Mitu', points: 2 }] }, st);
  saveMatch({ id: 'm2', game: 'fib', players: [{ name: 'rafi', points: 4 }] }, st);
  deleteAccount(a.id, st);
  assert.deepEqual(readAccounts(st).map(x => x.name), ['Mitu']);
  assert.deepEqual(readHistory(st).map(m => m.players.map(p => p.name)), [['Mitu']]);
});

test('add-ons change the pen: grippers add grip and weight, a back head adds reach', () => {
  const plain = penStats('pinpoint', {}), gripped = penStats('pinpoint', { gripper: 3 }), long = penStats('pinpoint', { back: 1 });
  assert.ok(gripped.grip > plain.grip * 1.5 && gripped.m > plain.m);
  assert.ok(long.L > plain.L);
  assert.ok(penStats('pinpoint', { rubber: 1 }).bounce > plain.bounce);
});

const pen = (pid, x, y, gear = {}) => ({ pid, x, y, a: 0, vx: 0, vy: 0, w: 0, out: false, ...penStats('pinpoint', gear) });
test('a resting pen holds its place against a light knock but moves on a hard hit', () => {
  const light = { pens: [pen('a', 240, 600), pen('b', 240, 560)], out: [] };
  push(light.pens[0], 240, 600, 0, -.25 * POWER); simulate(light);
  assert.ok(560 - light.pens[1].y < 5, 'a light knock barely moves it');
  const hard = { pens: [pen('a', 240, 600), pen('b', 240, 480)], out: [] };
  push(hard.pens[0], 240, 600, 0, -POWER); simulate(hard);
  assert.ok(480 - hard.pens[1].y > 60, 'a full flick pushes it well back');
  const alone = { pens: [pen('a', 240, 700)], out: [] };
  push(alone.pens[0], 240, 700, 0, -POWER); simulate(alone);
  assert.ok(700 - alone.pens[0].y < 600, 'a pen on its own stops on the bench');
});

test('every riddle has exactly one level and each level has plenty', () => {
  const b = byLevel(RIDDLES), all = [...b.easy, ...b.medium, ...b.hard];
  assert.equal(all.length, RIDDLES.length); assert.equal(new Set(all).size, RIDDLES.length);
  for (const k of ['easy', 'medium', 'hard']) assert.ok(b[k].length > 200, k);
});

test('Fibonacci questions at all four levels have four different options and one right answer', () => {
  for (const [i, bank] of BANKS.entries()) for (const make of bank) for (let n = 0; n < 60; n++) {
    const it = make(Math.random);
    assert.ok(!/NaN|undefined|Infinity/.test(it.q + it.a + it.why), `level ${i + 1}: ${it.q}`);
  }
  for (const level of [1, 2, 3, 4]) for (let n = 0; n < 200; n++) {
    const x = makeQuestion(level);
    assert.equal(x.options.length, 4); assert.equal(new Set(x.options).size, 4);
    assert.equal(x.options.filter(o => o === x.a).length, 1);
  }
});

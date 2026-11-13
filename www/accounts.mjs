/* Player accounts on this device: just a name. Several accounts can live on one phone.
   Every game adds players from here, and the ranking groups results by the account name.
   Coins are won only in কলম যুদ্ধ fights (against people or the computer) and spent in its shop. */
import { cleanGear, GEAR, nextPrice } from './pen-gear.mjs';
import { removePlayer } from './history.mjs';

const KEY = 'jomfa.accounts.v1', MAX = 40;
const clean = a => ({ id: String(a.id), name: String(a.name).trim().slice(0, 20), coins: Math.max(0, Math.floor(Number(a.coins) || 0)), earned: Math.max(0, Math.floor(Number(a.earned) || 0)), created: String(a.created || new Date().toISOString()), gear: cleanGear(a.gear), off: cleanGear(a.off) });

export function readAccounts(storage = localStorage) {
  try { const list = JSON.parse(storage.getItem(KEY)); return Array.isArray(list) ? list.filter(a => a?.id && a?.name).map(clean) : []; } catch { return []; }
}
function write(list, storage) { try { storage.setItem(KEY, JSON.stringify(list.map(clean))); return true; } catch { return false; } }

export const sameName = (a, b) => String(a).trim().toLocaleLowerCase() === String(b).trim().toLocaleLowerCase();
export const findAccount = (name, storage = localStorage) => readAccounts(storage).find(a => sameName(a.name, name)) || null;

/* Returns the account with that name, making it if it is new. Errors: 'EMPTY', 'FULL'. */
export function ensureAccount(name, storage = localStorage) {
  name = String(name || '').trim().replace(/\s+/g, ' ').slice(0, 20);
  if (!name) throw Error('EMPTY');
  const list = readAccounts(storage), found = list.find(a => sameName(a.name, name));
  if (found) return found;
  if (list.length >= MAX) throw Error('FULL');
  const acc = clean({ id: crypto.randomUUID(), name, coins: 0, gear: {} });
  list.push(acc); write(list, storage); return acc;
}

/* Deletes the account, its coins and add-ons, and its results in the ranking. */
export function deleteAccount(id, storage = localStorage) {
  const list = readAccounts(storage), acc = list.find(a => a.id === id);
  if (!acc) return false;
  write(list.filter(a => a.id !== id), storage); removePlayer(acc.name, storage); return true;
}

function update(id, fn, storage) {
  const list = readAccounts(storage), acc = list.find(a => a.id === id);
  if (!acc) return null;
  const result = fn(acc); if (result === false) return null;
  write(list, storage); return acc;
}

export const addCoins = (name, n, storage = localStorage) => { const acc = findAccount(name, storage); return acc && n > 0 ? update(acc.id, a => { a.coins += n; a.earned += n; }, storage) : null; };

/* Buys the next level of an add-on. Errors: 'MAX', 'COINS'. */
export function buyGear(id, key, storage = localStorage) {
  const acc = readAccounts(storage).find(a => a.id === id); if (!acc || !GEAR[key]) throw Error('NONE');
  const price = nextPrice(key, acc.gear[key]); if (price == null) throw Error('MAX');
  if (acc.coins < price) throw Error('COINS');
  return update(id, a => { a.coins -= price; a.gear[key]++; a.off[key] = 0; }, storage);
}
/* Owned add-ons can be taken off and put back for free. */
export const toggleGear = (id, key, storage = localStorage) => update(id, a => { if (!a.gear[key]) return false; a.off[key] = a.off[key] ? 0 : 1; }, storage);
export const fitted = acc => Object.fromEntries(Object.entries(acc?.gear || {}).map(([k, v]) => [k, acc.off?.[k] ? 0 : v]));

/* Small tap-to-add chips for the accounts not already in the game. A tap fills the name box and submits it,
   so the game's own name checks still run. */
export function accountChips(taken = [], label = 'অ্যাকাউন্ট থেকে') {
  const here = new Set(taken.map(n => String(n).trim().toLocaleLowerCase())), list = readAccounts().filter(a => !here.has(a.name.toLocaleLowerCase()));
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  return list.length ? `<div class="acc-mini" aria-label="${esc(label)}"><span>${esc(label)}</span>${list.map(a => `<button type="button" data-account="${esc(a.name)}">+ ${esc(a.name)}</button>`).join('')}</div>` : '';
}
export function bindAccountChips(root = document) {
  root.querySelectorAll('[data-account]').forEach(el => el.onclick = e => {
    e.preventDefault(); const input = root.querySelector('#player-name'), form = root.querySelector('#name-form');
    if (!input || !form) return; input.value = el.dataset.account; form.requestSubmit();
  });
}

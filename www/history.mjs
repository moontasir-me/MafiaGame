// One shared record of finished matches (game sets) for every game on this device.
// A match: {id, game:'mafia'|'spy'|'kalidas'|'pen'|'fib'|'shotoronji'|'chor', date, games, players:[{name, points}]}
const KEY = 'jomfa.history.v1', LIMIT = 500;
export const GAMES = { mafia: 'Mafia', spy: 'Spy', kalidas: 'কহেন কবি কালিদাস', pen: 'পেন ফাইট', fib: 'Fibonacci', shotoronji: 'চতুরঙ্গ', chor: 'চোর ডাকাত পুলিশ বাবু', ludo: 'লুডু', carrom: 'ক্যারম', dots: 'জায়গা দখল', tinguti: 'তিন গুটি' };

export function readHistory(storage = localStorage) {
  try { const list = JSON.parse(storage.getItem(KEY)); return Array.isArray(list) ? list.filter(m => m && GAMES[m.game] && Array.isArray(m.players)) : []; } catch { return []; }
}

export function saveMatch(match, storage = localStorage) {
  const list = readHistory(storage);
  if (!match?.players?.length || list.some(m => m.id === match.id)) return false;
  const clean = { id: String(match.id || crypto.randomUUID()), game: match.game, date: match.date || new Date().toISOString(), games: Number(match.games) || 1,
    players: match.players.map(p => ({ name: String(p.name).slice(0, 40), points: Number.isFinite(p.points) ? p.points : 0,
      recent: (Array.isArray(p.recent) ? p.recent : []).slice(0, 5).map(r => ({ won: !!r.won, img: String(r.img || ''), label: String(r.label || '') })) })) };
  list.unshift(clean);
  try { storage.setItem(KEY, JSON.stringify(list.slice(0, LIMIT))); } catch { return false; }
  return true;
}

const winners = m => { const top = Math.max(...m.players.map(p => p.points)); return new Set(m.players.filter(p => p.points === top).map(p => p.name.toLocaleLowerCase())); };

/* Total points across matches, plus matches played and matches won (top score of the match). */
export function overallRanking(list, game = null) {
  const rows = new Map();
  for (const m of list) {
    if (game && m.game !== game) continue;
    const won = winners(m);
    for (const p of m.players) {
      const key = p.name.toLocaleLowerCase(), row = rows.get(key) || { name: p.name, points: 0, matches: 0, wins: 0, recent: [] };
      row.points += p.points; row.matches++; if (won.has(key)) row.wins++;
      // Last five single games, newest first: the role that player actually had in each game.
      for (const r of (p.recent?.length ? p.recent : [{ won: won.has(key) }])) if (row.recent.length < 5) row.recent.push({ ...r, game: m.game });
      rows.set(key, row);
    }
  }
  return [...rows.values()].sort((a, b) => b.points - a.points || b.wins - a.wins || a.name.localeCompare(b.name));
}

/* Hall of fame: the highest single-match scores among the last 100 matches. */
export function hallOfFame(list, game = null, last = 100, top = 10) {
  const recent = list.filter(m => !game || m.game === game).slice(0, last);
  return recent.flatMap(m => m.players.map(p => ({ name: p.name, points: p.points, game: m.game, date: m.date, games: m.games })))
    .sort((a, b) => b.points - a.points || b.date.localeCompare(a.date)).slice(0, top);
}

export function clearHistory(game = null, storage = localStorage) {
  const keep = game ? readHistory(storage).filter(m => m.game !== game) : [];
  storage.setItem(KEY, JSON.stringify(keep));
}

/* Takes one player out of every match (when their account is deleted); empty matches go too. */
export function removePlayer(name, storage = localStorage) {
  const key = String(name).trim().toLocaleLowerCase();
  const keep = readHistory(storage).map(m => ({ ...m, players: m.players.filter(p => p.name.toLocaleLowerCase() !== key) })).filter(m => m.players.length);
  try { storage.setItem(KEY, JSON.stringify(keep)); } catch { }
}

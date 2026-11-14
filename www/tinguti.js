import { newGame, play, choose, legal, placing, LINES, CPU_LEVELS } from './tinguti-engine.mjs';
import { sound } from './sound.mjs';
import { saveMatch, readHistory, overallRanking, hallOfFame } from './history.mjs';
import { readAccounts, ensureAccount } from './accounts.mjs';
import { esc, icon, appShell, pageHead, rankTable, fameTable, enterScreen, leaveScreen } from './ui-kit.mjs';
import { $, $$, bn, toast, confirmBox, openMenu, SHELL_LABELS, TABS, BACK } from './lamp.mjs';
import { onlineEntry, bindOnlineEntry, onlineLobby, bindLobby, tableApi, isOnlineMode, ONLINE_ERRORS } from './online-ui.mjs';

/* তিন গুটি: pebbles on lines scratched into the courtyard. Two on one phone, against the computer, or online. */
const KEY = 'tinguti.v1', ART = 'assets/tinguti/cover.svg';
const STONE = ['white', 'dark'], STONE_NAME = ['সাদা নুড়ি', 'তেঁতুল বিচি'];
const ONLINE = isOnlineMode() || new URLSearchParams(location.search).has('online');
// Point i sits at column i % 3, row ⌊i / 3⌋ on a 3 × 3 grid.
const XY = i => [60 + (i % 3) * 140, 60 + Math.floor(i / 3) * 140];

function fresh() { return { v: 1, phase: 'setup', mode: 'cpu', level: 'medium', names: ['', ''], g: null, saved: false }; }
let s = fresh(), view = 'play', lastScreen = '', busy = false, online = null, poll = 0, pick = null;
try { const d = JSON.parse(localStorage.getItem(KEY)); if (d?.v === 1) s = { ...fresh(), ...d }; } catch { }
const save = () => { if (online) return; try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { } };
const button = (label, action, cls, ic, extra = '') => `<button type="button" class="btn ${cls}" data-action="${action}" ${extra}>${icon(ic)}${label}</button>`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const myTurn = () => { const g = s.g; if (!g || g.winner !== null || g.draw) return false; return online ? g.turn === online.me : !g.players[g.turn].cpu; };
const seg = (name, map, value) => `<div class="tg-seg" role="radiogroup">${Object.entries(map).map(([k, l]) => `<button type="button" role="radio" aria-checked="${value === k}" class="${value === k ? 'is-on' : ''}" data-action="${name}" data-id="${k}">${l}</button>`).join('')}</div>`;
const stone = (side, cls = '') => `<span class="tg-stone ${STONE[side]} ${cls}"></span>`;

/* ---------- Screens ---------- */
function chips() {
  const taken = s.names.map(x => x.trim().toLocaleLowerCase()), list = readAccounts().filter(a => !taken.includes(a.name.toLocaleLowerCase()));
  return list.length ? `<div class="acc-mini"><span>অ্যাকাউন্ট থেকে</span>${list.map(a => `<button type="button" data-action="fill" data-id="${esc(a.name)}">+ ${esc(a.name)}</button>`).join('')}</div>` : '';
}
const head = sub => `<header class="tg-head"><img src="${ART}" alt="" width="640" height="420"><div><h1>তিন গুটি</h1><p>${sub}</p></div></header>`;
function setup() {
  if (ONLINE) return online ? onlineLobby({ code: online.code, members: online.members, me: online.me, host: online.host, min: 2, max: 2, title: 'তিন গুটি · অনলাইন ঘর' }) : `${head('অনলাইন: বন্ধু নিজের ফোন থেকে খেলবে।')}${onlineEntry({ len: 5 })}`;
  return `${head('উঠোনের মাটিতে দাগ কাটা ঘর, তিনটা করে গুটি। এক লাইনে তিনটা মেলালেই জয়।')}
  <section class="tg-panel"><h2>কার সাথে</h2>${seg('mode', { cpu: 'কম্পিউটার', friends: 'বন্ধুর সাথে' }, s.mode)}${s.mode === 'cpu' ? `<div class="tg-gap">${seg('level', CPU_LEVELS, s.level)}</div>` : ''}</section>
  <section class="tg-panel"><h2>নাম</h2><label class="tg-field">${stone(0)}<input data-name="0" maxlength="20" autocomplete="off" placeholder="${s.mode === 'cpu' ? 'আপনার নাম' : 'সাদা নুড়ির খেলোয়াড়'}" value="${esc(s.names[0])}"></label>
  ${s.mode === 'friends' ? `<label class="tg-field">${stone(1)}<input data-name="1" maxlength="20" autocomplete="off" placeholder="তেঁতুল বিচির খেলোয়াড়" value="${esc(s.names[1])}"></label>` : ''}${chips()}</section>
  ${button('খেলা শুরু', 'start', 'primary wide', 'play')}`;
}
function board(g) {
  const can = myTurn() && !busy, moves = can ? legal(g) : [], targets = new Set(moves.filter(m => placing(g) ? true : m.from === pick).map(m => m.to));
  const movable = new Set(can && !placing(g) ? moves.map(m => m.from) : []);
  const win = g.winner !== null ? LINES.find(l => l.every(i => g.board[i] === g.winner)) : null;
  const lines = [[0, 2], [3, 5], [6, 8], [0, 6], [1, 7], [2, 8], [0, 8], [2, 6]].map(([a, b]) => { const [x1, y1] = XY(a), [x2, y2] = XY(b); return `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`; }).join('');
  const glow = win ? (() => { const [x1, y1] = XY(win[0]), [x2, y2] = XY(win[2]); return `<line class="tg-win" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"/>`; })() : '';
  const points = g.board.map((v, i) => {
    const [x, y] = XY(i), cls = [v !== null ? 'has ' + STONE[v] : 'empty', targets.has(i) && 'target', movable.has(i) && 'movable', pick === i && 'picked', g.last?.to === i && 'last'].filter(Boolean).join(' ');
    return `<g class="tg-pt ${cls}" data-pt="${i}" role="button" tabindex="${targets.has(i) || movable.has(i) ? 0 : -1}" aria-label="ঘর ${bn(i + 1)}${v !== null ? ', ' + STONE_NAME[v] : ''}"><circle class="hit" cx="${x}" cy="${y}" r="46"/><circle class="hole" cx="${x}" cy="${y}" r="9"/>${v !== null ? `<circle class="pebble" cx="${x}" cy="${y}" r="30"/>` : targets.has(i) ? `<circle class="ghost ${STONE[g.turn]}" cx="${x}" cy="${y}" r="24"/>` : ''}</g>`;
  }).join('');
  return `<div class="tg-ground"><svg class="tg-board" viewBox="0 0 400 400" aria-label="তিন গুটির ঘর"><g class="tg-lines">${lines}</g>${glow}${points}</svg></div>`;
}
function seat(side) {
  const g = s.g, on = g.winner === null && !g.draw && g.turn === side, left = 3 - g.placed[side];
  const prompt = on ? (online ? (side === online.me ? (placing(g) ? 'একটা ঘরে গুটি রাখুন' : 'নিজের গুটি ছুঁয়ে পাশের ঘরে সরান') : 'চালের অপেক্ষা…') : g.players[side].cpu ? 'ভাবছে…' : placing(g) ? 'একটা ঘরে গুটি রাখুন' : 'নিজের গুটি ছুঁয়ে পাশের ঘরে সরান') : '';
  return `<div class="tg-seat${on ? ' is-on' : ''}${!online && s.mode === 'friends' && side === 1 ? ' flip' : ''}">${stone(side)}<span><b>${esc(g.players[side].name)}</b><small>${prompt || (left ? `হাতে ${bn(left)}টা গুটি` : STONE_NAME[side])}</small></span><span class="tg-hand">${Array.from({ length: left }, () => stone(side, 'small')).join('')}</span></div>`;
}
function playing() {
  const g = s.g, near = online ? online.me : 0;
  return `<div class="tg-table">${seat(1 - near)}${board(g)}${seat(near)}</div>
  ${g.winner !== null || g.draw ? over(g) : button(online ? 'ঘর ছেড়ে দিন' : 'খেলা ছেড়ে দিন', online ? 'leave' : 'quit', 'text wide', 'close')}`;
}
function over(g) {
  const title = g.draw ? 'ড্র! কেউ মেলাতে পারেননি।' : `${esc(g.players[g.winner].name)} জিতলেন!${g.last?.blocked ? ' (প্রতিপক্ষ আটকে গেছেন)' : ''}`;
  return `<section class="tg-over"><h2>${title}</h2>${online ? (online.host ? button('আবার খেলি', 'again', 'primary wide', 'play') : '<p class="ol-note">ঘর যিনি খুলেছেন তিনি আবার শুরু করতে পারবেন।</p>') + button('ঘর ছেড়ে দিন', 'leave', 'secondary wide', 'close') : button('আবার খেলি', 'again', 'primary wide', 'play') + button('তিন গুটির শুরুর পাতা', 'game-home', 'secondary wide', 'home')}</section>`;
}
function rules() {
  return `${pageHead('নিয়ম', 'তিন গুটি', '')}<ol class="plain-rules">
  <li>দুজন খেলেন, প্রত্যেকের তিনটা গুটি। ঘর হলো তিন সারি তিন কলামের নয়টা বিন্দু, কোনাকুনি দাগও আছে।</li>
  <li>প্রথমে পালা করে একটা একটা গুটি খালি বিন্দুতে রাখুন।</li>
  <li>ছয়টা গুটি বসে গেলে পালা করে নিজের একটা গুটি দাগ ধরে পাশের খালি বিন্দুতে সরান।</li>
  <li>নিজের তিনটা গুটি এক সোজা লাইনে (আড়াআড়ি, খাড়া বা কোনাকুনি) মেলালেই জয়। যে আর সরাতে পারে না, সে হারে।</li>
  <li>একই অবস্থা তিনবার এলে বা অনেকক্ষণ কেউ না জিতলে ড্র। র‍্যাঙ্কিংয়ে জয়ে ৩, ড্রয়ে ১।</li></ol>`;
}
const labels = { caption: 'ফলাফল', rank: '#', player: 'খেলোয়াড় · শেষ পাঁচ খেলা', points: 'পয়েন্ট', win: 'সবুজ: জয়', loss: 'লাল: হার বা ড্র', order: 'নতুনটি বাঁ দিকে', empty: 'এখনও কোনো খেলা শেষ হয়নি।', noGames: 'এখনও খেলেননি', number: bn };
function ranking() {
  const list = readHistory(), all = overallRanking(list, 'tinguti').map(r => ({ name: r.name, score: r.points, note: bn(r.matches) + 'টি খেলা · ' + bn(r.wins) + 'টিতে জয়', history: r.recent.map(h => ({ won: h.won, img: h.img || ART, label: h.label || '' })) }));
  return `${pageHead('র‍্যাঙ্কিং', 'তিন গুটি', 'জয়ে ৩, ড্রয়ে ১।')}<section class="rank-section">${rankTable(all, labels)}</section>
  <section class="fame-section"><h2>${icon('trophy')}হল অব ফেম</h2>${fameTable(hallOfFame(list, 'tinguti'), { caption: 'হল অব ফেম', player: 'খেলোয়াড়', points: 'পয়েন্ট', empty: 'এখনও কেউ নেই।', number: bn, meta: e => new Date(e.date).toLocaleDateString('bn-BD') })}</section>`;
}

/* ---------- Shell ---------- */
const inGame = () => online ? online.started && s.g : s.phase === 'play' && s.g;
function render() {
  const key = view + (inGame() ? 'g' : 's') + (online?.started ? 'o' : ''), changed = key !== lastScreen; lastScreen = key;
  const body = view === 'rules' ? rules() : view === 'ranking' ? ranking() : inGame() ? playing() : setup();
  $('#app').innerHTML = appShell({ brand: 'তিন গুটি', brandSub: 'উঠোনের খেলা', brandIcon: 'tinguti', brandAction: 'tab-play', crumb: view === 'rules' ? 'নিয়ম' : view === 'ranking' ? 'র‍্যাঙ্কিং' : '', active: view, contentClass: 'game-content tinguti-content', labels: SHELL_LABELS, backHref: BACK, tabs: TABS, body });
  $$('[data-action]').forEach(el => el.onclick = e => { e.preventDefault(); act(el.dataset.action, el.dataset.id); });
  $$('[data-name]').forEach(el => el.oninput = () => { s.names[Number(el.dataset.name)] = el.value; save(); });
  $$('[data-pt]').forEach(el => { el.onclick = () => tap(Number(el.dataset.pt)); el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(Number(el.dataset.pt)); } }; });
  if (view === 'play' && ONLINE && !online) bindOnlineEntry($('#screen'), { onCreate: name => enter({ op: 'create', name }), onJoin: (name, code) => enter({ op: 'join', name, code }) });
  if (view === 'play' && online && !online.started) bindLobby($('#screen'), { code: online.code, game: 'তিন গুটি', onStart: () => send({ op: 'start' }), onLeave: () => leave() });
  if (changed) enterScreen($('#screen'));
}
const transition = () => leaveScreen($('#screen'), () => { render(); scrollTo({ top: 0, behavior: 'instant' }); });

/* ---------- Play ---------- */
function tap(i) {
  const g = s.g; if (!myTurn() || busy) return;
  if (placing(g)) return go({ to: i });
  if (g.board[i] === g.turn) { pick = pick === i ? null : i; return render(); }
  if (pick !== null && legal(g).some(m => m.from === pick && m.to === i)) { const m = { from: pick, to: i }; pick = null; return go(m); }
  if (pick === null) toast('আগে নিজের একটা গুটি ছুঁয়ে বাছুন।');
}
async function go(m) {
  if (online) return send({ op: 'move', move: m });
  const before = s.g; s.g = play(s.g, m); if (s.g === before) return;
  afterMove(); save(); render(); cpu();
}
function afterMove() { sound(s.g.winner !== null ? 'win' : 'vote'); if (s.g.winner !== null || s.g.draw) finish(); }
async function cpu() {
  const g = s.g; if (!g || g.winner !== null || g.draw || online || !g.players[g.turn].cpu || busy) return;
  busy = true; render(); await wait(1300);
  if (s.g !== g) { busy = false; return; }
  s.g = play(g, choose(g, g.players[g.turn].cpu)); busy = false; afterMove(); save(); render(); cpu();
}
function finish() {
  if (s.saved) return; s.saved = true;
  const g = s.g, sides = online ? [online.me] : s.mode === 'cpu' ? [0] : [0, 1];
  saveMatch({ id: crypto.randomUUID(), game: 'tinguti', players: sides.filter(k => !g.players[k].cpu).map(k => ({ name: g.players[k].name, points: g.draw ? 1 : g.winner === k ? 3 : 0, recent: [{ won: g.winner === k, img: ART, label: `তিন গুটি · ${g.draw ? 'ড্র' : g.winner === k ? 'জয়' : 'হার'}` }] })) });
}

/* ---------- Online ---------- */
function adopt(v) {
  online = { ...online, code: v.code, token: v.token || online?.token, me: v.me, host: v.host, members: v.members, started: v.started };
  try { sessionStorage.setItem('tinguti.online', JSON.stringify({ code: online.code, token: online.token })); } catch { }
  if (v.match) { const before = s.g; if (!v.match.last) s.saved = false; else if (before && JSON.stringify(before.last) !== JSON.stringify(v.match.last)) sound('vote'); s.g = v.match; if (s.g.winner !== null || s.g.draw) finish(); }
}
async function enter(body) { try { online = null; adopt(await tableApi({ game: 'tinguti', ...body })); startPolling(); transition(); } catch (e) { online = null; toast(ONLINE_ERRORS[e.message] || 'সংযোগে সমস্যা, আবার চেষ্টা করুন।'); } }
async function send(body) { if (busy) return; busy = true; try { const was = online.started; adopt(await tableApi({ game: 'tinguti', code: online.code, token: online.token, ...body })); busy = false; was ? render() : transition(); } catch (e) { busy = false; toast(ONLINE_ERRORS[e.message] || 'সংযোগে সমস্যা।'); render(); } }
function startPolling() {
  clearInterval(poll);
  poll = setInterval(async () => {
    if (!online || document.hidden || busy) return;
    try { const sig = JSON.stringify([online.members, online.started, s.g?.last, s.g?.winner, s.g?.draw]); adopt(await tableApi({ game: 'tinguti', op: 'state', code: online.code, token: online.token })); if (JSON.stringify([online.members, online.started, s.g?.last, s.g?.winner, s.g?.draw]) !== sig) render(); }
    catch (e) { if (['ROOM_GONE', 'AUTH'].includes(e.message)) { clearInterval(poll); online = null; s.g = null; toast('ঘরটা আর নেই।'); render(); } }
  }, 1100);
}
async function leave() { if (!await confirmBox('ঘর ছেড়ে দেবেন?', '', 'হ্যাঁ')) return; clearInterval(poll); online = null; s.g = null; try { sessionStorage.removeItem('tinguti.online'); } catch { } view = 'play'; transition(); }

async function act(action, id) {
  switch (action) {
    case 'tab-play': case 'tab-rules': case 'tab-ranking': { const nx = action.slice(4); if (view === nx) return; view = nx; return transition(); }
    case 'app-menu': return openMenu(inGame() ? [[online ? 'ঘর ছেড়ে দিন' : 'খেলা ছেড়ে নতুন করে সাজান', 'edit', online ? 'leave' : 'quit', 'tone-danger']] : [], act);
    case 'mode': s.mode = id === 'friends' ? 'friends' : 'cpu'; save(); return render();
    case 'level': if (CPU_LEVELS[id]) s.level = id; save(); return render();
    case 'fill': { const i = s.mode === 'friends' && s.names[0].trim() ? 1 : 0; s.names[i] = id; save(); return render(); }
    case 'start': {
      const n = s.mode === 'friends' ? 2 : 1, list = s.names.slice(0, n).map(x => x.trim().replace(/\s+/g, ' '));
      if (list.some(x => !x)) return toast('আগে নাম লিখুন।');
      if (n === 2 && list[0].toLocaleLowerCase() === list[1].toLocaleLowerCase()) return toast('দুজনের নাম আলাদা হতে হবে।');
      const names = list.map(x => { try { return ensureAccount(x).name; } catch { return x; } });
      s.g = newGame(s.mode === 'cpu' ? [{ name: names[0] }, { name: 'কম্পিউটার', cpu: s.level }] : names.map(name => ({ name })));
      s.saved = false; s.phase = 'play'; pick = null; view = 'play'; save(); sound('notice'); return transition();
    }
    case 'again': if (online) return send({ op: 'again' }); s.g = newGame(s.g.players); s.saved = false; pick = null; save(); render(); return cpu();
    case 'quit': if (await confirmBox('খেলা ছেড়ে দেবেন?', 'র‍্যাঙ্কিংয়ে কিছু যোগ হবে না।', 'হ্যাঁ')) { s.phase = 'setup'; s.g = null; busy = false; save(); transition(); } return;
    case 'leave': return leave();
    case 'game-home': view = 'play'; if (!online && s.g && (s.g.winner !== null || s.g.draw)) { s.phase = 'setup'; s.g = null; } save(); return transition();
  }
}

if (ONLINE) { s = { ...fresh() }; try { const saved = JSON.parse(sessionStorage.getItem('tinguti.online')); if (saved) tableApi({ game: 'tinguti', op: 'state', ...saved }).then(v => { online = { ...saved }; adopt(v); startPolling(); render(); }).catch(() => { }); } catch { } }
render(); cpu();
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => { });

import { newMatch, roll, move, movable, choose, standings, cell, snakeCell, SNAKES, LADDERS, SAFE, PATH, LANE, START, HOME, COLOUR_NAMES, CPU_LEVELS } from './ludo-engine.mjs';
import { sound } from './sound.mjs';
import { saveMatch, readHistory, overallRanking, hallOfFame } from './history.mjs';
import { readAccounts, ensureAccount } from './accounts.mjs';
import { esc, icon, appShell, pageHead, rankTable, fameTable, enterScreen, leaveScreen } from './ui-kit.mjs';
import { $, $$, bn, toast, confirmBox, openMenu, SHELL_LABELS, TABS, BACK } from './lamp.mjs';
import { onlineEntry, bindOnlineEntry, onlineLobby, bindLobby, tableApi, isOnlineMode, ONLINE_ERRORS } from './online-ui.mjs';
// The home page's Online/Offline switch decides which version opens.
const ONLINE = isOnlineMode() || new URLSearchParams(location.search).has('online');

/* লুডু: the four-colour board or সাপ লুডু, on one phone, against the computer, or online with a join code. */
const KEY = 'ludo.v1', ART = 'assets/ludo/cover.svg', CPU_NAMES = ['কম্পিউটার ১', 'কম্পিউটার ২', 'কম্পিউটার ৩'];
const KINDS = { ludo: 'লুডু', snake: 'সাপ লুডু' };
const MODES = { local: 'এক ফোনে', cpu: 'কম্পিউটার' };
const ERR = { ...ONLINE_ERRORS, ROOM_GONE: 'এই কোডের কোনো ঘর নেই।', FULL: 'ঘরে চারজন হয়ে গেছে।', STARTED: 'খেলা শুরু হয়ে গেছে।', NAME_TAKEN: 'এই নাম ঘরে আছে, অন্য নাম দিন।', NAME: 'নাম লিখুন।', TURN: 'এখন আপনার চাল নয়।', COUNTS: 'অন্তত দুজন লাগবে।', RATE_LIMIT: 'একটু পরে আবার চেষ্টা করুন।' };

function fresh() { return { v: 1, kind: 'ludo', mode: 'local', count: 2, names: ['', '', '', ''], cpus: 1, level: 'medium', phase: 'setup', match: null, online: null, saved: false }; }
let s = fresh(), view = 'play', lastScreen = '', busy = false, poll = 0, rolling = false;
try { const d = JSON.parse(localStorage.getItem(KEY)); if (d?.v === 1) s = { ...fresh(), ...d }; } catch { }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { } };
const button = (label, action, cls, ic, extra = '') => `<button type="button" class="btn ${cls}" data-action="${action}" ${extra}>${icon(ic)}${label}</button>`;
const m = () => s.match;
const online = () => !!s.online;
const myTurn = () => { const x = m(); if (!x || x.winner !== null) return false; if (online()) return x.turn === s.online.me; return !x.players[x.turn].cpu; };

/* ---------- Setup ---------- */

function seg(name, map, value) { return `<div class="ludo-seg" role="radiogroup">${Object.entries(map).map(([k, l]) => `<button type="button" role="radio" aria-checked="${value === k}" class="${value === k ? 'is-on' : ''}" data-action="${name}" data-id="${k}">${l}</button>`).join('')}</div>`; }
function chips(n) {
  const taken = s.names.slice(0, n).map(x => x.trim().toLocaleLowerCase()), list = readAccounts().filter(a => !taken.includes(a.name.toLocaleLowerCase()));
  return list.length ? `<div class="acc-mini"><span>অ্যাকাউন্ট থেকে</span>${list.map(a => `<button type="button" data-action="fill" data-id="${esc(a.name)}">+ ${esc(a.name)}</button>`).join('')}</div>` : '';
}
const nameField = (i, ph) => `<label class="ludo-field"><span class="pawn ${['red', 'green', 'yellow', 'blue'][i]}"></span><input data-name="${i}" maxlength="20" autocomplete="off" placeholder="${ph}" value="${esc(s.names[i])}"></label>`;
function setup() {
  if (ONLINE) return `<header class="ludo-head"><div class="ludo-dice-art">${diceFace(5)}${diceFace(3)}</div><div><h1>লুডু</h1><p>অনলাইন: বন্ধুরা নিজের ফোন থেকে</p></div></header>
  <section class="ludo-panel"><h2>কোন লুডু</h2>${seg('kind', KINDS, s.kind)}</section>${onlineEntry({ len: 5 })}`;
  if (s.mode === 'online') s.mode = 'local';
  const n = s.mode === 'local' ? s.count : 1;
  return `<header class="ludo-head"><div class="ludo-dice-art">${diceFace(5)}${diceFace(3)}</div><div><h1>লুডু</h1><p>ছক্কা উঠলে ঘুঁটি বের হবে।</p></div></header>
  <section class="ludo-panel"><h2>কোন লুডু</h2>${seg('kind', KINDS, s.kind)}</section>
  <section class="ludo-panel"><h2>কীভাবে খেলবেন</h2>${seg('mode', MODES, s.mode)}
  ${s.mode === 'local' ? `<div class="ludo-count"><span>কয়জন</span>${seg('count', { 2: '২', 3: '৩', 4: '৪' }, String(s.count))}</div>` : ''}
  ${s.mode === 'cpu' ? `<div class="ludo-count"><span>কম্পিউটার কয়টা</span>${seg('cpus', { 1: '১', 2: '২', 3: '৩' }, String(s.cpus))}</div><div class="ludo-count"><span>কেমন খেলবে</span>${seg('level', CPU_LEVELS, s.level)}</div>` : ''}</section>
  <section class="ludo-panel"><h2>${n > 1 ? 'নাম' : 'আপনার নাম'}</h2>${Array.from({ length: n }, (_, i) => nameField(i, n > 1 ? `খেলোয়াড় ${bn(i + 1)}` : 'নাম')).join('')}${chips(n)}</section>
  ${button('খেলা শুরু', 'start', 'primary wide', 'play')}`;
}
function lobby() { const o = s.online; return onlineLobby({ code: o.code, members: o.members, me: o.me, host: o.host, min: 2, max: 4, title: KINDS[o.kind] + ' · অনলাইন ঘর' }); }

/* ---------- Board ---------- */

const PIPS = { 1: [5], 2: [1, 9], 3: [1, 5, 9], 4: [1, 3, 7, 9], 5: [1, 3, 5, 7, 9], 6: [1, 3, 4, 6, 7, 9] };
function diceFace(n, cls = '') { return `<span class="die ${cls}">${Array.from({ length: 9 }, (_, k) => `<i class="${PIPS[n]?.includes(k + 1) ? 'on' : ''}"></i>`).join('')}</span>`; }
const pct = v => (v / 15 * 100).toFixed(3) + '%';
function ludoBoard(x) {
  const cls = new Map(), set = (r, c, k) => cls.set(r * 15 + c, k);
  PATH.forEach(([r, c], i) => set(r, c, 'path' + (SAFE.has(i) ? ' safe' : '') + (Object.entries(START).find(([, v]) => v === i) ? ' start-' + Object.entries(START).find(([, v]) => v === i)[0] : '')));
  for (const [col, cells] of Object.entries(LANE)) cells.forEach(([r, c]) => set(r, c, 'lane-' + col));
  let grid = '';
  for (let r = 0; r < 15; r++) for (let c = 0; c < 15; c++) { const k = cls.get(r * 15 + c); if (k) grid += `<i class="cell ${k}" style="grid-area:${r + 1}/${c + 1}"></i>`; }
  const yards = ['red', 'green', 'yellow', 'blue'].map(col => `<div class="yard yard-${col}"><span></span></div>`).join('');
  return `<div class="board ludo-board">${yards}${grid}<div class="centre"></div>${pieces(x, (col, p, i) => cell(col, p, i), 15)}</div>`;
}
function snakeBoard(x) {
  let grid = '';
  for (let n = 1; n <= 100; n++) { const [r, c] = snakeCell(n); grid += `<i class="sq n${n % 2}${n === 100 ? ' goal' : ''}" style="grid-area:${r + 1}/${c + 1}">${bn(n)}</i>`; }
  const at = n => { const [r, c] = snakeCell(n); return [c * 10 + 5, r * 10 + 5]; };
  const ladders = Object.entries(LADDERS).map(([a, b]) => { const [x1, y1] = at(+a), [x2, y2] = at(+b), dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy), ox = -dy / len * 1.6, oy = dx / len * 1.6, rungs = Math.max(2, Math.round(len / 4));
    return `<g class="ladder"><path d="M${x1 + ox} ${y1 + oy}L${x2 + ox} ${y2 + oy}M${x1 - ox} ${y1 - oy}L${x2 - ox} ${y2 - oy}"/>${Array.from({ length: rungs }, (_, k) => { const t = (k + .5) / rungs, cx = x1 + dx * t, cy = y1 + dy * t; return `<path d="M${cx + ox} ${cy + oy}L${cx - ox} ${cy - oy}"/>`; }).join('')}</g>`; }).join('');
  const snakes = Object.entries(SNAKES).map(([a, b], k) => { const [x1, y1] = at(+a), [x2, y2] = at(+b), mx = (x1 + x2) / 2, my = (y1 + y2) / 2, bend = (k % 2 ? 1 : -1) * 9;
    return `<g class="snake s${k % 4}"><path d="M${x1} ${y1}C${mx + bend} ${y1 + (y2 - y1) * .25} ${mx - bend} ${y1 + (y2 - y1) * .75} ${x2} ${y2}"/><circle cx="${x1}" cy="${y1}" r="2.3"/></g>`; }).join('');
  return `<div class="board snake-board">${grid}<svg class="snake-art" viewBox="0 0 100 100" aria-hidden="true">${ladders}${snakes}</svg>${pieces(x, (col, p) => { const [r, c] = snakeCell(p); return [r, c]; }, 10)}</div>`;
}
function pieces(x, where, size) {
  const can = myTurn() && x.rolled ? movable(x) : [], spots = new Map(), out = [];
  x.players.forEach((pl, k) => pl.tokens.forEach((p, i) => { const [r, c] = where(pl.colour, p, i), key = r + ',' + c; spots.set(key, [...(spots.get(key) || []), [k, i]]); }));
  for (const [key, list] of spots) {
    const [r, c] = key.split(',').map(Number);
    list.forEach(([k, i], n) => {
      const pl = x.players[k], shift = list.length > 1 ? (n - (list.length - 1) / 2) * .28 : 0, live = k === x.turn && can.includes(i);
      out.push(`<button type="button" class="piece ${pl.colour}${live ? ' live' : ''}${k === x.turn ? ' turn' : ''}" style="left:${(((c + .5 + shift) / size) * 100).toFixed(2)}%;top:${(((r + .5) / size) * 100).toFixed(2)}%" ${live ? `data-piece="${i}"` : 'tabindex="-1"'} aria-label="${COLOUR_NAMES[pl.colour]} ঘুঁটি ${bn(i + 1)}"></button>`);
    });
  }
  return out.join('');
}
function strip(x) {
  return `<div class="ludo-players">${x.players.map((p, k) => `<div class="lp ${p.colour}${k === x.turn && x.winner === null ? ' is-turn' : ''}"><span class="pawn ${p.colour}"></span><b>${esc(p.name)}</b>${p.cpu ? `<small>${CPU_LEVELS[p.cpu]}</small>` : ''}${x.kind === 'ludo' ? `<small>${bn(p.tokens.filter(t => t === HOME).length)}/৪</small>` : `<small>${bn(p.tokens[0])}</small>`}</div>`).join('')}</div>`;
}
function message(x) {
  const l = x.last, who = l ? esc(x.players[l.by].name) : '';
  if (!l) return 'প্রথম চাল';
  if (l.note === 'three') return `${who}: পরপর তিন ছক্কা, চাল বাতিল`;
  if (l.note === 'stuck') return `${who} ${bn(l.roll)} পেলেন, চালার মতো ঘুঁটি নেই`;
  if (l.captured) return `${who} ঘুঁটি কেটে দিলেন! আবার চাল`;
  if (l.ladder) return `${who} মই বেয়ে ${bn(l.ladder[0])} থেকে ${bn(l.ladder[1])}!`;
  if (l.snake) return `সাপে কাটল! ${who} ${bn(l.snake[0])} থেকে ${bn(l.snake[1])}`;
  if (l.home) return `${who}-এর একটা ঘুঁটি ঘরে পৌঁছাল`;
  if (l.piece !== undefined) return `${who} ${bn(l.roll)} চাললেন`;
  return `${who} ${bn(l.roll)} পেলেন`;
}
/* The phone lies in the middle of the table. Each colour's seat sits on its own side of the board:
   red and green across the top (turned to face those players), blue and yellow along the bottom.
   The dice lives in the seat whose turn it is. Online, everyone has their own phone, so nothing is turned. */
const SIDES = { top: ['red', 'green'], bottom: ['blue', 'yellow'] };
function seatCard(x, colour, top) {
  const k = x.players.findIndex(p => p.colour === colour); if (k < 0) return '<div class="seat4 empty"></div>';
  const p = x.players[k], turn = k === x.turn && x.winner === null, mine = turn && myTurn(), last = x.last?.by === k ? x.last.roll : null;
  const prompt = mine ? (x.rolled ? 'ঘুঁটি বাছুন' : 'ছক্কা চালুন') : turn ? (p.cpu ? 'ভাবছে…' : online() ? 'চালের অপেক্ষা…' : 'আপনার চাল') : '';
  const done = x.kind === 'ludo' ? `${bn(p.tokens.filter(t => t === HOME).length)}/৪ ঘরে` : `ঘর ${bn(p.tokens[0])}`;
  return `<div class="seat4 ${colour}${turn ? ' is-turn' : ''}${top && !online() && x.players.filter(q => !q.cpu).length > 1 ? ' flip' : ''}"><div class="seat4-name"><span class="pawn ${colour}"></span><b>${esc(p.name)}</b><small>${done}</small></div>
  ${turn ? `<button type="button" class="dice-btn" data-action="roll" ${mine && !x.rolled && !busy ? '' : 'disabled'} aria-label="${esc(p.name)}: ছক্কা চালুন">${diceFace(x.dice || last || 6, rolling ? 'spin' : '')}</button><small class="seat4-prompt">${prompt}</small>`
    : last ? `<span class="seat4-last">${diceFace(last, 'small')}</span>` : ''}</div>`;
}
function playing() {
  const x = m();
  return `<div class="table4"><div class="seat-row">${SIDES.top.map(c => seatCard(x, c, true)).join('')}</div>
  <div class="board-wrap">${x.kind === 'snake' ? snakeBoard(x) : ludoBoard(x)}</div>
  <div class="seat-row">${SIDES.bottom.map(c => seatCard(x, c, false)).join('')}</div></div>
  <p class="ludo-msg" role="status">${message(x)}</p>${x.winner !== null ? over(x) : ''}`;
}
function over(x) {
  const order = standings(x);
  return `<section class="ludo-over"><h2>${esc(x.players[x.winner].name)} জিতলেন!</h2><ol>${order.map(k => `<li><span class="pawn ${x.players[k].colour}"></span>${esc(x.players[k].name)}</li>`).join('')}</ol>
  <div class="ludo-actions">${online() ? '' : button('আবার খেলি', 'again', 'primary wide', 'play')}${button('লুডুর শুরুর পাতা', 'game-home', 'secondary wide', 'home')}</div></section>`;
}

/* ---------- Other tabs ---------- */
function rules() {
  return `${pageHead('নিয়ম', 'লুডু', '')}<h2 class="ludo-rule-h">লুডু</h2><ol class="plain-rules">
  <li>২–৪ জন। ছক্কা (৬) উঠলে ঘুঁটি ঘর থেকে বের হয়।</li><li>ছক্কা উঠলে, কারও ঘুঁটি কাটলে বা ঘুঁটি ঘরে পৌঁছালে আবার চাল। পরপর তিন ছক্কায় চাল বাতিল।</li>
  <li>অন্যের ঘুঁটির ঘরে পড়লে সেটা কেটে নিজের ঘরে ফেরত যায়। তারা-চিহ্ন আর রঙিন শুরুর ঘর নিরাপদ।</li><li>চারটা ঘুঁটি আগে মাঝের ঘরে তুললে জয়। ঘরে ঢুকতে ঠিক সংখ্যা লাগে।</li></ol>
  <h2 class="ludo-rule-h">সাপ লুডু</h2><ol class="plain-rules"><li>১ থেকে ১০০। মইয়ের গোড়ায় পড়লে ওপরে, সাপের মুখে পড়লে লেজে।</li><li>ছক্কায় আবার চাল। ঠিক ১০০-তে পৌঁছালে জয়।</li><li>সাপ লুডুতে সব দানই ভাগ্য, তাই কম্পিউটারের স্তরে পার্থক্য নেই।</li></ol>
  <p class="lede">জয়ী ৩, দ্বিতীয় ২, তৃতীয় ১ পয়েন্ট পান।</p>`;
}
const labels = { caption: 'ফলাফল', rank: '#', player: 'খেলোয়াড় · শেষ পাঁচ খেলা', points: 'পয়েন্ট', win: 'সবুজ: জয়', loss: 'লাল: হার', order: 'নতুনটি বাঁ দিকে', empty: 'এখনও কোনো খেলা শেষ হয়নি।', noGames: 'এখনও খেলেননি', number: bn };
function ranking() {
  const list = readHistory(), all = overallRanking(list, 'ludo').map(r => ({ name: r.name, score: r.points, note: bn(r.matches) + 'টি খেলা · ' + bn(r.wins) + 'টিতে জয়', history: r.recent.map(h => ({ won: h.won, img: h.img || ART, label: h.label || '' })) }));
  return `${pageHead('র‍্যাঙ্কিং', 'লুডু', 'জয়ী ৩, দ্বিতীয় ২, তৃতীয় ১।')}<section class="rank-section">${rankTable(all, labels)}</section>
  <section class="fame-section"><h2>${icon('trophy')}হল অব ফেম</h2>${fameTable(hallOfFame(list, 'ludo'), { caption: 'হল অব ফেম', player: 'খেলোয়াড়', points: 'পয়েন্ট', empty: 'এখনও কেউ নেই।', number: bn, meta: e => new Date(e.date).toLocaleDateString('bn-BD') })}</section>
  <a class="btn secondary wide" href="ranking.html?game=ludo">${icon('trophy')}সব খেলার র‍্যাঙ্কিং ও অ্যাকাউন্ট</a>`;
}

/* ---------- Shell ---------- */
function render() {
  const key = view + s.phase, changed = key !== lastScreen; lastScreen = key;
  const body = view === 'rules' ? rules() : view === 'ranking' ? ranking() : s.phase === 'lobby' ? lobby() : s.phase === 'play' && m() ? playing() : setup();
  $('#app').innerHTML = appShell({ brand: 'লুডু', brandSub: KINDS[s.kind], brandIcon: 'grid', brandAction: 'tab-play', crumb: view === 'rules' ? 'নিয়ম' : view === 'ranking' ? 'র‍্যাঙ্কিং' : s.phase === 'play' ? KINDS[m()?.kind || s.kind] : s.phase === 'lobby' ? 'অনলাইন ঘর' : 'খেলা সাজান', active: view, contentClass: 'game-content ludo-content', labels: SHELL_LABELS, backHref: BACK, tabs: TABS, body });
  $$('[data-action]').forEach(el => el.onclick = e => { e.preventDefault(); act(el.dataset.action, el.dataset.id); });
  $$('[data-piece]').forEach(el => el.onclick = () => play(Number(el.dataset.piece)));
  $$('[data-name]').forEach(el => el.oninput = () => { s.names[Number(el.dataset.name)] = el.value; save(); });
  if (view === 'play' && s.phase === 'setup' && ONLINE) bindOnlineEntry($('#screen'), { onCreate: name => enter({ op: 'create', name, kind: s.kind }), onJoin: (name, code) => enter({ op: 'join', name, code }) });
  if (view === 'play' && s.phase === 'lobby') bindLobby($('#screen'), { code: s.online.code, game: 'লুডু', onStart: () => act('online-start'), onLeave: () => act('leave') });
  if (changed) enterScreen($('#screen'));
}
const transition = () => leaveScreen($('#screen'), () => { render(); scrollTo({ top: 0, behavior: 'instant' }); });

/* ---------- Play ---------- */
const wait = ms => new Promise(r => setTimeout(r, ms));
const api = body => tableApi({ game: 'ludo', ...body });
async function enter(body) {
  if (busy) return; busy = true;
  try { const v = await api(body); s.online = { token: v.token }; s.saved = false; adopt(v); startPolling(); transition(); }
  catch (e) { toast(ERR[e.message] || 'সংযোগে সমস্যা, আবার চেষ্টা করুন।'); }
  busy = false;
}
function adopt(v) {
  const before = s.match?.edition;
  s.online = { ...s.online, code: v.code, kind: v.kind, me: v.me, host: v.host, members: v.members, token: v.token || s.online?.token };
  s.kind = v.kind; s.match = v.match; s.phase = v.started ? 'play' : 'lobby';
  if (v.match && v.match.edition !== before && v.match.last?.roll && !v.match.last.piece && before !== undefined) sound('vote');
  if (v.match?.winner !== null && v.match) finish();
  save();
}
function startPolling() {
  clearInterval(poll);
  poll = setInterval(async () => {
    if (!online() || document.hidden || busy) return;
    try { const v = await api({ op: 'state', code: s.online.code, token: s.online.token }); const ed = s.match?.edition, ph = s.phase, n = s.online.members.length; adopt(v); if (s.match?.edition !== ed || s.phase !== ph || v.members.length !== n) render(); }
    catch (e) { if (e.message === 'ROOM_GONE' || e.message === 'AUTH') { clearInterval(poll); s.online = null; s.phase = 'setup'; s.match = null; save(); toast('ঘরটা আর নেই।'); render(); } }
  }, 1200);
}

async function doRoll() {
  if (!myTurn() || m().rolled || busy) return;
  busy = true; rolling = true; render(); sound('vote'); await wait(700);
  try {
    if (online()) adopt(await api({ op: 'roll', code: s.online.code, token: s.online.token }));
    else s.match = roll(m(), 1 + Math.floor(Math.random() * 6));
  } catch (e) { toast(ERR[e.message] || 'সংযোগে সমস্যা।'); }
  rolling = false; busy = false; save(); render();
  const x = m(); if (!x) return;
  // One choice only: play it without asking.
  if (x.rolled && myTurn()) { const can = movable(x); if (can.length === 1) { await wait(1000); return play(can[0]); } }
  if (!x.rolled) await wait(1200); // a roll with nothing to move stays on screen a moment
  render(); next();
}
async function play(i) {
  if (!myTurn() || !m().rolled || busy) return;
  busy = true;
  try {
    if (online()) adopt(await api({ op: 'move', code: s.online.code, token: s.online.token, piece: i }));
    else s.match = move(m(), i);
  } catch (e) { toast(ERR[e.message] || 'সংযোগে সমস্যা।'); }
  busy = false; const l = m().last; sound(l?.captured || l?.snake ? 'hit' : l?.ladder || l?.home ? 'coin' : 'notice');
  if (m().winner !== null) finish();
  save(); render(); next();
}
/* Computer turns, one step at a time so people can follow them. */
async function next() {
  const x = m(); if (!x || online() || x.winner !== null) return;
  const p = x.players[x.turn]; if (!p.cpu || busy) return;
  busy = true; render(); await wait(2000);
  if (s.match !== x) { busy = false; return; }
  rolling = true; render(); sound('vote'); await wait(700); rolling = false;
  s.match = roll(x, 1 + Math.floor(Math.random() * 6)); render();
  if (s.match.rolled && s.match.turn === x.turn) { await wait(1300); s.match = move(s.match, choose(s.match, p.cpu)); const l = s.match.last; sound(l?.captured || l?.snake ? 'hit' : 'notice'); }
  busy = false; if (s.match.winner !== null) finish(); save(); render(); next();
}
function finish() {
  if (s.saved) return; s.saved = true;
  const x = m(), order = standings(x), pts = [3, 2, 1, 0];
  const humans = x.players.map((p, k) => ({ p, k })).filter(({ p }) => !p.cpu);
  saveMatch({ id: crypto.randomUUID(), game: 'ludo', players: humans.map(({ p, k }) => { const place = order.indexOf(k); return { name: p.name, points: pts[place] ?? 0, recent: [{ won: x.winner === k, img: ART, label: `${KINDS[x.kind]} · ${bn(place + 1)}ম` }] }; }) });
  sound('win');
}

function names(n) {
  const list = s.names.slice(0, n).map(x => x.trim().replace(/\s+/g, ' '));
  if (list.some(x => !x)) { toast(n > 1 ? 'সবার নাম লিখুন।' : 'আপনার নাম লিখুন।'); return null; }
  if (new Set(list.map(x => x.toLocaleLowerCase())).size < n) { toast('নামগুলো আলাদা হতে হবে।'); return null; }
  return list.map(x => { try { return ensureAccount(x).name; } catch { return x; } });
}
async function act(action, id) {
  switch (action) {
    case 'tab-play': case 'tab-rules': case 'tab-ranking': { const nx = action.slice(4); if (view === nx) return; view = nx; return transition(); }
    case 'app-menu': return openMenu(s.phase !== 'setup' ? [['খেলা ছেড়ে নতুন করে সাজান', 'edit', 'quit', 'tone-danger']] : [], act);
    case 'kind': s.kind = KINDS[id] ? id : 'ludo'; save(); return render();
    case 'mode': s.mode = MODES[id] ? id : 'local'; save(); return render();
    case 'count': s.count = Math.max(2, Math.min(4, Number(id))); save(); return render();
    case 'cpus': s.cpus = Math.max(1, Math.min(3, Number(id))); save(); return render();
    case 'level': if (CPU_LEVELS[id]) s.level = id; save(); return render();
    case 'fill': { const n = s.mode === 'local' ? s.count : 1, i = s.names.slice(0, n).findIndex(x => !x.trim()); s.names[i >= 0 ? i : 0] = id; save(); return render(); }
    case 'start': {
      const list = names(s.mode === 'local' ? s.count : 1); if (!list) return;
      const players = s.mode === 'cpu' ? [...CPU_NAMES.slice(0, s.cpus).map(n => ({ name: n, cpu: s.level })), { name: list[0] }] : list.map(n => ({ name: n }));
      s.match = newMatch(s.kind, players); s.phase = 'play'; s.saved = false; view = 'play'; save(); sound('notice'); transition(); return;
    }
    case 'again': s.match = newMatch(m().kind, m().players.map(p => ({ name: p.name, cpu: p.cpu }))); s.saved = false; save(); render(); return next();
    case 'roll': return doRoll();
    case 'online-start': try { adopt(await api({ op: 'start', code: s.online.code, token: s.online.token })); render(); } catch (e) { toast(ERR[e.message] || 'সংযোগে সমস্যা।'); } return;
    case 'share': { const text = `শীতলপাটিতে লুডু খেলি! কোড: ${s.online.code}`; try { if (navigator.share) await navigator.share({ text, url: location.href.split('?')[0] }); else { await navigator.clipboard.writeText(text); toast('কোড কপি হয়েছে।'); } } catch { } return; }
    case 'leave': case 'quit':
      if (!await confirmBox(online() ? 'ঘর ছেড়ে দেবেন?' : 'খেলা ছেড়ে দেবেন?', '', 'হ্যাঁ')) return;
      clearInterval(poll); s.online = null; s.match = null; s.phase = 'setup'; save(); return transition();
    case 'game-home': view = 'play'; if (m()?.winner !== null && m()) { clearInterval(poll); s.online = null; s.match = null; s.phase = 'setup'; } save(); return transition();
  }
}

render();
if (online()) startPolling(); else next();
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => { });

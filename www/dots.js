import { newGame, play, choose, free, scores, standings, touching, drawn, CPU_LEVELS } from './dots-engine.mjs';
import { sound } from './sound.mjs';
import { saveMatch, readHistory, overallRanking, hallOfFame } from './history.mjs';
import { readAccounts, ensureAccount } from './accounts.mjs';
import { esc, icon, appShell, pageHead, rankTable, fameTable, enterScreen, leaveScreen, numberPick, bindNumberPick } from './ui-kit.mjs';
import { $, $$, bn, toast, confirmBox, openMenu, SHELL_LABELS, TABS, BACK } from './lamp.mjs';
import { onlineEntry, bindOnlineEntry, onlineLobby, bindLobby, tableApi, isOnlineMode, ONLINE_ERRORS } from './online-ui.mjs';

/* জায়গা দখল: dots and boxes on a khata page. Two to four people on one phone, against the computer, or online. */
const KEY = 'dots.v1', ART = 'assets/dots/cover.svg';
const INK = ['#1f4fbf', '#d0342c', '#1e8a4c', '#9a3fb8'];
const ONLINE = isOnlineMode() || new URLSearchParams(location.search).has('online');

function fresh() { return { v: 1, phase: 'setup', mode: 'cpu', level: 'medium', count: 2, size: 4, names: ['', '', '', ''], g: null, saved: false }; }
let s = fresh(), view = 'play', lastScreen = '', busy = false, online = null, poll = 0;
try { const d = JSON.parse(localStorage.getItem(KEY)); if (d?.v === 1) s = { ...fresh(), ...d }; } catch { }
const save = () => { if (online) return; try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { } };
const button = (label, action, cls, ic, extra = '') => `<button type="button" class="btn ${cls}" data-action="${action}" ${extra}>${icon(ic)}${label}</button>`;
const wait = ms => new Promise(r => setTimeout(r, ms));
const myTurn = () => { const g = s.g; if (!g || g.over) return false; return online ? g.turn === online.me : !g.players[g.turn].cpu; };
const seg = (name, map, value) => `<div class="dt-seg" role="radiogroup">${Object.entries(map).map(([k, l]) => `<button type="button" role="radio" aria-checked="${String(value) === k}" class="${String(value) === k ? 'is-on' : ''}" data-action="${name}" data-id="${k}">${l}</button>`).join('')}</div>`;

/* ---------- Screens ---------- */
function chips(n) {
  const taken = s.names.slice(0, n).map(x => x.trim().toLocaleLowerCase()), list = readAccounts().filter(a => !taken.includes(a.name.toLocaleLowerCase()));
  return list.length ? `<div class="acc-mini"><span>অ্যাকাউন্ট থেকে</span>${list.map(a => `<button type="button" data-action="fill" data-id="${esc(a.name)}">+ ${esc(a.name)}</button>`).join('')}</div>` : '';
}
const head = sub => `<header class="dt-head"><svg class="dt-mark" viewBox="0 0 60 60" aria-hidden="true"><g fill="#2b2420"><circle cx="10" cy="10" r="3.5"/><circle cx="30" cy="10" r="3.5"/><circle cx="50" cy="10" r="3.5"/><circle cx="10" cy="30" r="3.5"/><circle cx="30" cy="30" r="3.5"/><circle cx="50" cy="30" r="3.5"/><circle cx="10" cy="50" r="3.5"/><circle cx="30" cy="50" r="3.5"/><circle cx="50" cy="50" r="3.5"/></g><rect x="10" y="10" width="20" height="20" fill="#1f4fbf33"/><rect x="30" y="30" width="20" height="20" fill="#d0342c33"/><path d="M10 10h20v20H10z" fill="none" stroke="#1f4fbf" stroke-width="3"/><path d="M30 30h20v20H30z" fill="none" stroke="#d0342c" stroke-width="3"/></svg><div><h1>জায়গা দখল</h1><p>${sub}</p></div></header>`;
function setup() {
  if (ONLINE) return online ? onlineLobby({ code: online.code, members: online.members, me: online.me, host: online.host, min: 2, max: 4, title: `জায়গা দখল · ${bn(online.size?.[0] || s.size)}×${bn(online.size?.[1] || s.size)}` })
    : `${head('অনলাইন: ২–৪ জন, যার যার ফোনে')}<section class="dt-panel">${numberPick({ name: 'size', label: 'ঘরের মাপ (প্রতি দিকে কটা বাক্স)', value: s.size, presets: [3, 4, 5, 6], min: 2, max: 9 })}</section>${onlineEntry({ len: 5 })}`;
  const n = s.mode === 'friends' ? s.count : 1;
  return `${head('দুটো বিন্দু জুড়ে দাগ টানুন। বাক্সের চার দিক যে বন্ধ করে, বাক্স তার।')}
  <section class="dt-panel"><h2>কার সাথে</h2>${seg('mode', { cpu: 'কম্পিউটার', friends: 'বন্ধুদের সাথে' }, s.mode)}
  ${s.mode === 'cpu' ? `<div class="dt-gap">${seg('level', CPU_LEVELS, s.level)}</div>` : `<div class="dt-gap dt-row"><span>কয়জন</span>${seg('count', { 2: '২', 3: '৩', 4: '৪' }, s.count)}</div>`}</section>
  <section class="dt-panel">${numberPick({ name: 'size', label: 'ঘরের মাপ (প্রতি দিকে কটা বাক্স)', value: s.size, presets: [3, 4, 5, 6], min: 2, max: 9 })}</section>
  <section class="dt-panel"><h2>${n > 1 ? 'নাম' : 'আপনার নাম'}</h2>${Array.from({ length: n }, (_, i) => `<label class="dt-field"><span class="dt-ink" style="--ink:${INK[i]}"></span><input data-name="${i}" maxlength="20" autocomplete="off" placeholder="${n > 1 ? `খেলোয়াড় ${bn(i + 1)}` : 'নাম'}" value="${esc(s.names[i])}"></label>`).join('')}${chips(n)}</section>
  ${button('খেলা শুরু', 'start', 'primary wide', 'play')}`;
}
function board(g) {
  const U = 60, P = 18, W = g.cols * U + P * 2, H = g.rows * U + P * 2, can = myTurn() && !busy;
  let boxes = '', lines = '', dots = '';
  for (const [key, k] of Object.entries(g.boxes)) { const [r, c] = key.split(':').map(Number); boxes += `<g class="dt-box"><rect x="${P + c * U + 3}" y="${P + r * U + 3}" width="${U - 6}" height="${U - 6}" rx="4" fill="${INK[k]}" fill-opacity=".18"/><text x="${P + c * U + U / 2}" y="${P + r * U + U / 2 + 7}" fill="${INK[k]}">${esc(g.players[k].name.charAt(0))}</text></g>`; }
  const seg = (l, x1, y1, x2, y2) => {
    const who = g.lines[l], last = g.last?.line === l;
    if (who !== undefined) return `<line class="dt-line${last ? ' last' : ''}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${INK[who]}"/>`;
    return can ? `<g class="dt-slot" data-line="${l}" role="button" tabindex="0" aria-label="দাগ টানুন"><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="hit"/><line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="ghost" stroke="${INK[g.turn]}"/></g>` : '';
  };
  for (let r = 0; r <= g.rows; r++) for (let c = 0; c < g.cols; c++) lines += seg(`h:${r}:${c}`, P + c * U, P + r * U, P + (c + 1) * U, P + r * U);
  for (let r = 0; r < g.rows; r++) for (let c = 0; c <= g.cols; c++) lines += seg(`v:${r}:${c}`, P + c * U, P + r * U, P + c * U, P + (r + 1) * U);
  for (let r = 0; r <= g.rows; r++) for (let c = 0; c <= g.cols; c++) dots += `<circle cx="${P + c * U}" cy="${P + r * U}" r="4.5"/>`;
  return `<div class="dt-paper"><svg class="dt-board" viewBox="0 0 ${W} ${H}" aria-label="জায়গা দখলের বোর্ড">${boxes}${lines}<g class="dt-dots">${dots}</g></svg></div>`;
}
function playing() {
  const g = s.g, sc = scores(g);
  const strip = `<div class="dt-players">${g.players.map((p, k) => `<div class="dt-p${k === g.turn && !g.over ? ' is-turn' : ''}" style="--ink:${INK[k]}"><span class="dt-ink"></span><b>${esc(p.name)}</b><strong>${bn(sc[k])}</strong></div>`).join('')}</div>`;
  const p = g.players[g.turn], who = online ? (g.turn === online.me ? 'আপনার চাল' : `${esc(p.name)}-এর চালের অপেক্ষা…`) : p.cpu ? `${esc(p.name)} ভাবছে…` : `${esc(p.name)}-এর চাল`;
  const msg = g.over ? '' : g.last?.closed ? `${esc(g.players[g.last.by].name)} ${bn(g.last.closed)}টা বাক্স দখল করলেন! আবার চাল · ${who}` : who;
  return `${strip}${board(g)}<p class="dt-msg" role="status">${msg}</p>${g.over ? over(g) : button(online ? 'ঘর ছেড়ে দিন' : 'খেলা ছেড়ে দিন', online ? 'leave' : 'quit', 'text wide', 'close')}`;
}
function over(g) {
  const order = standings(g), top = order[0].score, tie = order.filter(x => x.score === top).length > 1;
  return `<section class="dt-over"><h2>${tie ? 'সমানে সমান!' : `${esc(g.players[order[0].k].name)} জিতলেন!`}</h2><ol>${order.map(x => `<li style="--ink:${INK[x.k]}"><span class="dt-ink"></span>${esc(g.players[x.k].name)} <b>${bn(x.score)}</b></li>`).join('')}</ol>
  ${online ? (online.host ? button('আবার খেলি', 'again', 'primary wide', 'play') : '<p class="ol-note">ঘর যিনি খুলেছেন তিনি আবার শুরু করতে পারবেন।</p>') + button('ঘর ছেড়ে দিন', 'leave', 'secondary wide', 'close') : button('আবার খেলি', 'again', 'primary wide', 'play') + button('জায়গা দখলের শুরুর পাতা', 'game-home', 'secondary wide', 'home')}</section>`;
}
function rules() {
  return `${pageHead('নিয়ম', 'জায়গা দখল', '')}<ol class="plain-rules">
  <li>পালা করে পাশাপাশি দুটো বিন্দু জুড়ে একটা করে দাগ টানুন (খাড়া বা আড়াআড়ি)।</li>
  <li>কোনো বাক্সের চতুর্থ দিকটা যে টানে, বাক্সটা তার। তখন সে আবার দাগ টানে।</li>
  <li>সাবধান: কোনো বাক্সের তৃতীয় দিক টানলে পরের জন সেটা নিয়ে নিতে পারে।</li>
  <li>সব বাক্স ভরে গেলে যার বাক্স বেশি সে জেতে। র‍্যাঙ্কিংয়ে প্রথম ৩, দ্বিতীয় ২, তৃতীয় ১।</li></ol>`;
}
const labels = { caption: 'ফলাফল', rank: '#', player: 'খেলোয়াড় · শেষ পাঁচ খেলা', points: 'পয়েন্ট', win: 'সবুজ: জয়', loss: 'লাল: হার', order: 'নতুনটি বাঁ দিকে', empty: 'এখনও কোনো খেলা শেষ হয়নি।', noGames: 'এখনও খেলেননি', number: bn };
function ranking() {
  const list = readHistory(), all = overallRanking(list, 'dots').map(r => ({ name: r.name, score: r.points, note: bn(r.matches) + 'টি খেলা · ' + bn(r.wins) + 'টিতে জয়', history: r.recent.map(h => ({ won: h.won, img: h.img || ART, label: h.label || '' })) }));
  return `${pageHead('র‍্যাঙ্কিং', 'জায়গা দখল', 'প্রথম ৩, দ্বিতীয় ২, তৃতীয় ১।')}<section class="rank-section">${rankTable(all, labels)}</section>
  <section class="fame-section"><h2>${icon('trophy')}হল অব ফেম</h2>${fameTable(hallOfFame(list, 'dots'), { caption: 'হল অব ফেম', player: 'খেলোয়াড়', points: 'পয়েন্ট', empty: 'এখনও কেউ নেই।', number: bn, meta: e => new Date(e.date).toLocaleDateString('bn-BD') })}</section>`;
}

/* ---------- Shell ---------- */
const inGame = () => online ? online.started && s.g : s.phase === 'play' && s.g;
function render() {
  const key = view + (inGame() ? 'g' : 's') + (online?.started ? 'o' : ''), changed = key !== lastScreen; lastScreen = key;
  const body = view === 'rules' ? rules() : view === 'ranking' ? ranking() : inGame() ? playing() : setup();
  $('#app').innerHTML = appShell({ brand: 'জায়গা দখল', brandSub: 'বিন্দু আর বাক্স', brandIcon: 'boxes', brandAction: 'tab-play', crumb: view === 'rules' ? 'নিয়ম' : view === 'ranking' ? 'র‍্যাঙ্কিং' : inGame() ? `${bn(s.g.rows)}×${bn(s.g.cols)}` : '', active: view, contentClass: 'game-content dots-content', labels: SHELL_LABELS, backHref: BACK, tabs: TABS, body });
  $$('[data-action]').forEach(el => el.onclick = e => { e.preventDefault(); act(el.dataset.action, el.dataset.id); });
  $$('[data-name]').forEach(el => el.oninput = () => { s.names[Number(el.dataset.name)] = el.value; save(); });
  $$('[data-line]').forEach(el => { el.onclick = () => draw(el.dataset.line); el.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); draw(el.dataset.line); } }; });
  bindNumberPick(document, 'size', 2, 9, n => { s.size = n; save(); render(); });
  if (view === 'play' && ONLINE && !online) bindOnlineEntry($('#screen'), { onCreate: name => enter({ op: 'create', name, size: [s.size, s.size] }), onJoin: (name, code) => enter({ op: 'join', name, code }) });
  if (view === 'play' && online && !online.started) bindLobby($('#screen'), { code: online.code, game: 'জায়গা দখল', onStart: () => send({ op: 'start' }), onLeave: () => leave() });
  if (changed) enterScreen($('#screen'));
}
const transition = () => leaveScreen($('#screen'), () => { render(); scrollTo({ top: 0, behavior: 'instant' }); });

/* ---------- Play ---------- */
async function draw(line) {
  if (!myTurn() || busy) return;
  if (online) return send({ op: 'line', line });
  const before = s.g; s.g = play(s.g, line); if (s.g === before) return;
  afterMove(); save(); render(); cpu();
}
function afterMove() {
  const l = s.g.last; sound(l?.closed ? 'coin' : 'vote');
  if (s.g.over) finish();
}
async function cpu() {
  const g = s.g; if (!g || g.over || online || !g.players[g.turn].cpu || busy) return;
  busy = true; render(); await wait(g.last?.closed && g.last.by === g.turn ? 700 : 1100);
  if (s.g !== g) { busy = false; return; }
  s.g = play(g, choose(g, g.players[g.turn].cpu)); busy = false; afterMove(); save(); render(); cpu();
}
function finish() {
  if (s.saved) return; s.saved = true; sound('win');
  const g = s.g, order = standings(g), pts = [3, 2, 1, 0];
  const mine = g.players.map((p, k) => ({ p, k })).filter(({ p, k }) => !p.cpu && (!online || k === online.me));
  saveMatch({ id: crypto.randomUUID(), game: 'dots', players: mine.map(({ p, k }) => { const place = order.findIndex(x => x.k === k); return { name: p.name, points: pts[place] ?? 0, recent: [{ won: place === 0, img: ART, label: `জায়গা দখল · ${bn(scores(g)[k])} বাক্স` }] }; }) });
}

/* ---------- Online ---------- */
function adopt(v) {
  online = { ...online, code: v.code, token: v.token || online?.token, me: v.me, host: v.host, members: v.members, started: v.started, size: v.match ? [v.match.rows, v.match.cols] : online?.size };
  try { sessionStorage.setItem('dots.online', JSON.stringify({ code: online.code, token: online.token })); } catch { }
  const before = s.g; if (v.match) { if (!before || v.match.last?.line !== before.last?.line || v.match.over !== before.over) { if (before && v.match.last) sound(v.match.last.closed ? 'coin' : 'vote'); if (!v.match.last) s.saved = false; } s.g = v.match; if (s.g.over) finish(); }
}
async function enter(body) { try { online = null; adopt(await tableApi({ game: 'dots', ...body })); startPolling(); transition(); } catch (e) { online = null; toast(ONLINE_ERRORS[e.message] || 'সংযোগে সমস্যা, আবার চেষ্টা করুন।'); } }
async function send(body) { if (busy) return; busy = true; try { const was = online.started; adopt(await tableApi({ game: 'dots', code: online.code, token: online.token, ...body })); busy = false; was ? render() : transition(); } catch (e) { busy = false; toast(ONLINE_ERRORS[e.message] || 'সংযোগে সমস্যা।'); render(); } }
function startPolling() {
  clearInterval(poll);
  poll = setInterval(async () => {
    if (!online || document.hidden || busy) return;
    try { const sig = JSON.stringify([online.members, online.started, s.g?.last, s.g?.over]); adopt(await tableApi({ game: 'dots', op: 'state', code: online.code, token: online.token })); if (JSON.stringify([online.members, online.started, s.g?.last, s.g?.over]) !== sig) render(); }
    catch (e) { if (['ROOM_GONE', 'AUTH'].includes(e.message)) { clearInterval(poll); online = null; s.g = null; toast('ঘরটা আর নেই।'); render(); } }
  }, 1100);
}
async function leave() { if (!await confirmBox('ঘর ছেড়ে দেবেন?', '', 'হ্যাঁ')) return; clearInterval(poll); online = null; s.g = null; try { sessionStorage.removeItem('dots.online'); } catch { } view = 'play'; transition(); }

async function act(action, id) {
  switch (action) {
    case 'tab-play': case 'tab-rules': case 'tab-ranking': { const nx = action.slice(4); if (view === nx) return; view = nx; return transition(); }
    case 'app-menu': return openMenu(inGame() ? [[online ? 'ঘর ছেড়ে দিন' : 'খেলা ছেড়ে নতুন করে সাজান', 'edit', online ? 'leave' : 'quit', 'tone-danger']] : [], act);
    case 'mode': s.mode = id === 'friends' ? 'friends' : 'cpu'; save(); return render();
    case 'level': if (CPU_LEVELS[id]) s.level = id; save(); return render();
    case 'count': s.count = Math.max(2, Math.min(4, Number(id))); save(); return render();
    case 'fill': { const n = s.mode === 'friends' ? s.count : 1, i = s.names.slice(0, n).findIndex(x => !x.trim()); s.names[i >= 0 ? i : 0] = id; save(); return render(); }
    case 'start': {
      const n = s.mode === 'friends' ? s.count : 1, list = s.names.slice(0, n).map(x => x.trim().replace(/\s+/g, ' '));
      if (list.some(x => !x)) return toast(n > 1 ? 'সবার নাম লিখুন।' : 'আপনার নাম লিখুন।');
      if (new Set(list.map(x => x.toLocaleLowerCase())).size < n) return toast('নামগুলো আলাদা হতে হবে।');
      const names = list.map(x => { try { return ensureAccount(x).name; } catch { return x; } });
      const players = s.mode === 'cpu' ? [{ name: names[0] }, { name: 'কম্পিউটার', cpu: s.level }] : names.map(name => ({ name }));
      s.g = newGame(s.size, s.size, players); s.saved = false; s.phase = 'play'; view = 'play'; save(); sound('notice'); return transition();
    }
    case 'again': if (online) return send({ op: 'again' }); s.g = newGame(s.g.rows, s.g.cols, s.g.players); s.saved = false; save(); render(); return cpu();
    case 'quit': if (await confirmBox('খেলা ছেড়ে দেবেন?', 'র‍্যাঙ্কিংয়ে কিছু যোগ হবে না।', 'হ্যাঁ')) { s.phase = 'setup'; s.g = null; busy = false; save(); transition(); } return;
    case 'leave': return leave();
    case 'game-home': view = 'play'; if (!online && s.g?.over) { s.phase = 'setup'; s.g = null; } save(); return transition();
  }
}

if (ONLINE) { s = { ...fresh(), size: s.size }; try { const saved = JSON.parse(sessionStorage.getItem('dots.online')); if (saved) tableApi({ game: 'dots', op: 'state', ...saved }).then(v => { online = { ...saved }; adopt(v); startPolling(); render(); }).catch(() => { }); } catch { } }
render(); cpu();
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => { });

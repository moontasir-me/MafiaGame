import { newGame, legal, play, result, inCheck, bestMove, colour, NAMES, VALUE, LEVELS } from './shotoronji-engine.mjs';
import { sound } from './sound.mjs';
import { saveMatch, readHistory, overallRanking, hallOfFame } from './history.mjs';
import { readAccounts, ensureAccount } from './accounts.mjs';
import { esc, icon, appShell, pageHead, rankTable, fameTable, enterScreen, leaveScreen } from './ui-kit.mjs';
import { onlineEntry, bindOnlineEntry, onlineLobby, bindLobby, tableApi, isOnlineMode, ONLINE_ERRORS } from './online-ui.mjs';
import { $, $$, bn, LANTERN, toast, confirmBox, chooseBox, openMenu, SHELL_LABELS, TABS, BACK } from './lamp.mjs';

/* চতুরঙ্গ: chess on one phone, against a friend or the computer. Win 3 points, draw 1. */
const KEY = 'shotoronji.v1', ART = 'assets/shotoronji/cover.svg', CPU = 'কম্পিউটার';
const GLYPH = { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' };
const FILES = 'কখগঘঙচছজ';
const ENDS = { mate: 'কিস্তিমাত!', stale: 'অচল: ড্র', fifty: '৫০ চালে কেউ কিছু খায়নি: ড্র', repeat: 'একই অবস্থা তিনবার: ড্র', material: 'মাত করার মতো ঘুঁটি নেই: ড্র', resign: 'হার মেনে নিলেন', draw: 'দুজনে মিলে ড্র' };

function fresh() { return { v: 1, phase: 'setup', mode: 'cpu', level: 'medium', pick: 'w', side: 'w', names: ['', ''], g: newGame(), past: [], moves: [], sel: -1, end: null, winner: null }; }
let s = fresh(), view = 'play', lastScreen = '', thinking = false;
try { const d = JSON.parse(localStorage.getItem(KEY)); if (d?.v === 1) s = { ...fresh(), ...d, sel: -1 }; } catch { }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify({ ...s, past: s.past.slice(-6) })); } catch { } };
const you = () => s.side || 'w';
const nameOf = side => online ? (online.members[side === 'w' ? 0 : 1] || '') : s.mode === 'cpu' ? (side === you() ? s.names[0] : `${CPU} (${LEVELS[s.level].name})`) : side === 'w' ? s.names[0] : s.names[1];
// The home page's Online/Offline switch decides which version opens.
const ONLINE = isOnlineMode() || new URLSearchParams(location.search).has('online');
let online = null, poll = 0; // {code, token, me, host, members, started}
const mySide = () => online ? (online.me === 0 ? 'w' : 'b') : s.mode === 'cpu' ? you() : null;
const cpuTurn = () => !online && s.mode === 'cpu' && s.phase === 'play' && s.g.turn !== you() && !s.end;
const button = (label, action, cls, ic, extra = '') => `<button type="button" class="btn ${cls}" data-action="${action}" ${extra}>${icon(ic)}${label}</button>`;
const piece = p => `<span class="sq-piece ${colour(p)}" aria-hidden="true">${GLYPH[p.toLowerCase()]}︎</span>`;
const sqName = sq => FILES[sq & 7] + bn(8 - (sq >> 3));

/* ---------- Screens ---------- */

function chips() {
  const taken = s.names.map(n => n.trim().toLocaleLowerCase()), list = readAccounts().filter(a => !taken.includes(a.name.toLocaleLowerCase()));
  return list.length ? `<div class="acc-mini"><span>অ্যাকাউন্ট থেকে</span>${list.map(a => `<button type="button" data-action="fill" data-id="${esc(a.name)}">+ ${esc(a.name)}</button>`).join('')}</div>` : '';
}
function setup() {
  if (ONLINE) return `<header class="lamp-head"><div><h1>চতুরঙ্গ</h1><p>অনলাইন: বন্ধু নিজের ফোন থেকে খেলবে। যিনি ঘর খোলেন তিনি সাদা।</p></div></header>${onlineEntry({ len: 5 })}`;
  const mini = 'rnbqkbnr'.split('').slice(2, 6), cells = Array.from({ length: 16 }, (_, k) => { const r = k >> 2, c = k & 3, p = r === 0 ? mini[c] : r === 1 ? 'p' : r === 2 ? (c === 1 ? 'P' : '') : ['R', 'N', 'Q', 'K'][c]; return `<i class="${(r + c) % 2 ? 'dk' : 'lt'}">${p ? `<span class="${p === p.toUpperCase() ? 'w' : 'b'}">${GLYPH[p.toLowerCase()]}\uFE0E</span>` : ''}</i>`; }).join('');
  const card = (k, glyph, title, sub) => `<button type="button" role="radio" aria-checked="${s.mode === k}" class="cg-card${s.mode === k ? ' is-on' : ''}" data-action="mode" data-id="${k}"><span class="cg-glyph">${glyph}</span><b>${title}</b><small>${sub}</small></button>`;
  return `<header class="cg-hero"><div class="cg-hero-text"><h1>চতুরঙ্গ</h1><p class="chess-verse">তোমার নৌকোর মুখোমুখি আমার সৈন্যদল<br>বাঁচার লড়াই...<br>আমার মন্ত্রী খোয়া গেছে একটা চালের ভুল<br>কোথায় দাঁড়াই...</p></div><div class="cg-mini" aria-hidden="true">${cells}</div></header>
  <figure class="cg-proverb"><blockquote>দাবা খেলা শেষে রাজা এবং সৈন্য—সবাইকে কিন্তু একই বাক্সেই ফিরে যেতে হয়।</blockquote><figcaption>ইতালীয় প্রবাদ</figcaption></figure>
  <div class="cg-modes" role="radiogroup" aria-label="কার সাথে">${card('cpu', '♚\uFE0E', 'কম্পিউটারের সাথে', 'একা খেলুন, তিন স্তর')}${card('friends', '♚\uFE0E<em>♔\uFE0E</em>', 'বন্ধুর সাথে', 'এক ফোনে মুখোমুখি')}</div>
  ${s.mode === 'cpu' ? `<div class="cg-colour" role="radiogroup" aria-label="আপনি কোন রং নেবেন"><span>আপনার ঘুঁটি</span>${[['w', '♔\uFE0E', 'সাদা', 'আগে চাল'], ['b', '♚\uFE0E', 'কালো', 'পরে চাল'], ['random', '?', 'যেকোনো', 'ভাগ্যে যা']].map(([k, g, t, sub]) => `<button type="button" role="radio" aria-checked="${s.pick === k}" class="${s.pick === k ? 'is-on' : ''} pick-${k}" data-action="pick" data-id="${k}"><span class="cg-side ${k === 'b' ? 'b' : 'w'}">${g}</span><b>${t}</b><small>${sub}</small></button>`).join('')}</div>` : ''}
  ${s.mode === 'cpu' ? `<div class="cg-levels" role="radiogroup" aria-label="কম্পিউটার কেমন খেলবে">${Object.entries(LEVELS).map(([k, l], n) => `<button type="button" role="radio" aria-checked="${s.level === k}" class="${s.level === k ? 'is-on' : ''}" data-action="level" data-id="${k}"><span>${'♟\uFE0E'.repeat(n + 1)}</span>${l.name}</button>`).join('')}</div>` : ''}
  <section class="cg-names"><label class="cg-name"><span class="cg-side ${s.mode === 'cpu' && s.pick === 'b' ? 'b' : 'w'}">${s.mode === 'cpu' && s.pick === 'b' ? '♚' : '♔'}\uFE0E</span><input id="name-w" maxlength="20" autocomplete="off" placeholder="${s.mode === 'cpu' ? 'আপনার নাম' : 'সাদা ঘুঁটির খেলোয়াড়'}" value="${esc(s.names[0])}"></label>
  ${s.mode === 'friends' ? `<label class="cg-name"><span class="cg-side b">♚\uFE0E</span><input id="name-b" maxlength="20" autocomplete="off" placeholder="কালো ঘুঁটির খেলোয়াড়" value="${esc(s.names[1])}"></label>` : ''}
  ${chips()}</section>
  ${button('দান শুরু', 'start', 'primary wide cg-start', 'play')}`;
}

function captured(side) {
  // Pieces of `side` that were taken, from the board count.
  const full = { p: 8, n: 2, b: 2, r: 2, q: 1 }, now = {};
  for (const p of s.g.b) if (p && colour(p) === side) now[p.toLowerCase()] = (now[p.toLowerCase()] || 0) + 1;
  return Object.entries(full).flatMap(([t, n]) => Array(Math.max(0, n - (now[t] || 0))).fill(t));
}
function seat(side) {
  const lost = captured(side === 'w' ? 'b' : 'w'), gain = lost.reduce((a, t) => a + VALUE[t], 0) - captured(side).reduce((a, t) => a + VALUE[t], 0);
  const on = !s.end && s.g.turn === side;
  const across = !online && s.mode === 'friends' && side === 'b';
  return `<div class="seat ${side} ${on ? 'is-on' : ''}${across ? ' flip' : ''}"><span class="side-dot ${side}"></span><b>${esc(nameOf(side))}</b><span class="took">${lost.map(t => `<i class="${side === 'w' ? 'b' : 'w'}">${GLYPH[t]}︎</i>`).join('')}${gain > 0 ? `<small>+${bn(gain)}</small>` : ''}</span>${on && thinking ? '<em>ভাবছে…</em>' : ''}</div>`;
}
function board() {
  const g = s.g, targets = s.sel >= 0 ? legal(g).filter(m => m.from === s.sel).map(m => m.to) : [], king = inCheck(g) ? g.b.indexOf(g.turn === 'w' ? 'K' : 'k') : -1;
  let cells = '';
  for (let k = 0; k < 64; k++) {
    const sq = mySide() === 'b' ? 63 - k : k, p = g.b[sq], dark = ((sq >> 3) + (sq & 7)) % 2 === 1, cls = [dark ? 'dk' : 'lt', sq === s.sel && 'sel', targets.includes(sq) && (p ? 'hit' : 'to'), g.last && (sq === g.last.from || sq === g.last.to) && 'last', sq === king && 'check'].filter(Boolean).join(' ');
    cells += `<button type="button" class="sq ${cls}" data-sq="${sq}" aria-label="${sqName(sq)}${p ? ' ' + NAMES[p.toLowerCase()] : ''}">${p ? piece(p) : ''}${(sq & 7) === (mySide() === 'b' ? 7 : 0) ? `<small class="rk">${bn(8 - (sq >> 3))}</small>` : ''}${sq >> 3 === (mySide() === 'b' ? 0 : 7) ? `<small class="fl">${FILES[sq & 7]}</small>` : ''}</button>`;
  }
  return `<div class="board-wrap"><div class="board" role="grid" aria-label="চতুরঙ্গের ছক">${cells}</div></div>`;
}
function playing() {
  const check = !s.end && inCheck(s.g);
  const status = s.end ? `<p class="lamp-status end">${ENDS[s.end]}${s.winner ? ` ${esc(nameOf(s.winner))} জিতলেন।` : ''}</p>` : `<p class="lamp-status ${check ? 'check' : ''}">${check ? 'কিস্তি! ' : ''}${esc(nameOf(s.g.turn))}-এর চাল</p>`;
  const log = s.moves.length ? `<ol class="move-log">${s.moves.map((m, i) => `<li class="${i % 2 ? 'b' : 'w'}">${m}</li>`).join('')}</ol>` : '';
  const top = mySide() === 'b' ? 'w' : 'b';
  return `<div class="chess">${seat(top)}${board()}${seat(top === 'w' ? 'b' : 'w')}</div>${status}
  <div class="lamp-actions">${online ? (s.end ? (online.host ? button('আবার খেলি', 'again', 'primary wide', 'play') : '<p class="ol-note">ঘর যিনি খুলেছেন তিনি আবার শুরু করতে পারবেন।</p>') + button('ঘর ছেড়ে দিন', 'leave', 'secondary wide', 'close') : button('হার মানি', 'resign', 'text wide', 'close')) : s.end ? button('আবার খেলি', 'again', 'primary wide', 'play') + button('চতুরঙ্গের শুরুর পাতা', 'game-home', 'secondary wide', 'home')
    : button('চাল ফেরত', 'undo', 'secondary', 'back', s.past.length ? '' : 'disabled') + (s.mode === 'friends' ? button('ড্র', 'draw', 'secondary', 'shield') : '') + button('হার মানি', 'resign', 'text', 'close')}</div>${log}`;
}

function rules() {
  return `${pageHead('নিয়ম', 'চতুরঙ্গ', '')}<ol class="plain-rules">
  <li><b>রাজা</b> এক ঘর যেকোনো দিকে। <b>মন্ত্রী</b> সোজা বা কোনাকুনি যত ঘর খুশি। <b>নৌকা</b> সোজা। <b>হাতি</b> কোনাকুনি। <b>ঘোড়া</b> আড়াই ঘর, ডিঙিয়ে যায়। <b>বোড়ে</b> সামনে এক ঘর (প্রথমবার দুই), খায় কোনাকুনি।</li>
  <li>রাজার ওপর আক্রমণ হলে <b>কিস্তি</b>; বাঁচার পথ না থাকলে <b>কিস্তিমাত</b>, খেলা শেষ।</li>
  <li>বোড়ে শেষ সারিতে পৌঁছালে মন্ত্রী, নৌকা, হাতি বা ঘোড়া হয়ে যায়।</li>
  <li>রাজা আর নৌকা না নড়লে এক চালে দুজনে জায়গা বদলাতে পারে (দুর্গ)। পাশ কাটানো বোড়েকে ঠিক পরের চালে খাওয়া যায়।</li>
  <li>চাল না থাকলে কিন্তু কিস্তি নেই, তবে ড্র। জয়ে ৩, ড্রয়ে ১ পয়েন্ট।</li></ol>`;
}
const labels = { caption: 'ফলাফল', rank: '#', player: 'খেলোয়াড় · শেষ পাঁচ দান', points: 'পয়েন্ট', win: 'সবুজ: জয়', loss: 'লাল: হার বা ড্র', order: 'নতুনটি বাঁ দিকে', empty: 'এখনও কোনো দান শেষ হয়নি।', noGames: 'এখনও খেলেননি', number: bn };
function ranking() {
  const list = readHistory(), all = overallRanking(list, 'shotoronji').map(r => ({ name: r.name, score: r.points, note: bn(r.matches) + 'টি দান · ' + bn(r.wins) + 'টিতে জয়', history: r.recent.map(h => ({ won: h.won, img: h.img || ART, label: h.label || '' })) }));
  return `${pageHead('র‍্যাঙ্কিং', 'চতুরঙ্গ', 'জয়ে ৩, ড্রয়ে ১।')}<section class="rank-section">${rankTable(all, labels)}</section>
  <section class="fame-section"><h2>${icon('trophy')}হল অব ফেম</h2>${fameTable(hallOfFame(list, 'shotoronji'), { caption: 'হল অব ফেম', player: 'খেলোয়াড়', points: 'পয়েন্ট', empty: 'এখনও কেউ নেই।', number: bn, meta: e => new Date(e.date).toLocaleDateString('bn-BD') })}</section>
  <a class="btn secondary wide" href="ranking.html?game=shotoronji">${icon('trophy')}সব খেলার র‍্যাঙ্কিং ও অ্যাকাউন্ট</a>`;
}

/* ---------- Shell ---------- */

function render() {
  const key = view + s.phase, changed = key !== lastScreen; lastScreen = key;
  const body = view === 'rules' ? rules() : view === 'ranking' ? ranking() : online && !online.started ? onlineLobby({ code: online.code, members: online.members, me: online.me, host: online.host, min: 2, max: 2, title: 'চতুরঙ্গ · অনলাইন ঘর' }) : online ? playing() : s.phase === 'setup' || ONLINE ? setup() : playing();
  $('#app').innerHTML = appShell({ brand: 'চতুরঙ্গ', brandSub: 'দাদুর ছক', brandIcon: 'knight', brandAction: 'tab-play', crumb: view === 'rules' ? 'নিয়ম' : view === 'ranking' ? 'র‍্যাঙ্কিং' : s.phase === 'setup' ? '' : s.end ? 'দান শেষ' : 'দান চলছে', active: view, contentClass: 'game-content lamp-content', labels: SHELL_LABELS, backHref: BACK, tabs: TABS, body });
  $$('[data-action]').forEach(el => el.onclick = e => { e.preventDefault(); act(el.dataset.action, el.dataset.id); });
  $$('[data-sq]').forEach(el => el.onclick = () => tap(Number(el.dataset.sq)));
  $$('#name-w,#name-b').forEach((el, i) => el.oninput = () => { s.names[el.id === 'name-w' ? 0 : 1] = el.value; save(); });
  const log = $('.move-log'); if (log) log.scrollLeft = log.scrollWidth;
  if (view === 'play' && ONLINE && !online) bindOnlineEntry($('#screen'), { onCreate: name => enter({ op: 'create', name }), onJoin: (name, code) => enter({ op: 'join', name, code }) });
  if (view === 'play' && online && !online.started) bindLobby($('#screen'), { code: online.code, game: 'চতুরঙ্গ', onStart: () => send({ op: 'start' }), onLeave: () => act('leave') });
  if (changed) enterScreen($('#screen'));
}
const transition = () => leaveScreen($('#screen'), () => { render(); scrollTo({ top: 0, behavior: 'instant' }); });

/* ---------- Moves ---------- */

function note(g, m) {
  const p = g.b[m.from].toLowerCase();
  if (m.castle) return m.castle === 'k' ? 'ছোট দুর্গ' : 'বড় দুর্গ';
  return `${NAMES[p]} ${sqName(m.to)}${g.b[m.to] || m.ep ? ' ✕' : ''}${m.promo ? ' → ' + NAMES[m.promo] : ''}`;
}
function move(m) {
  s.past.push(s.g); s.moves.push(note(s.g, m));
  s.g = play(s.g, m); s.sel = -1;
  const end = result(s.g);
  if (end) finish(end, end === 'mate' ? (s.g.turn === 'w' ? 'b' : 'w') : null);
  else sound(inCheck(s.g) ? 'timer' : s.g.took ? 'hit' : 'vote');
  save(); render();
  if (cpuTurn()) cpuMove();
}
function cpuMove() {
  thinking = true; render();
  setTimeout(() => { const m = bestMove(s.g, s.level); thinking = false; if (m && cpuTurn()) move(m); else render(); }, 2000);
}
async function tap(sq) {
  if (s.end || thinking || cpuTurn() || (online && s.g.turn !== mySide())) return;
  const g = s.g, p = g.b[sq];
  if (s.sel >= 0) {
    const options = legal(g).filter(m => m.from === s.sel && m.to === sq);
    if (options.length) {
      let m = options[0];
      if (options.length > 1) {
        const pick = await chooseBox('বোড়ে কী হবে?', 'qrbn'.split('').map(t => ({ id: t, label: `<span class="promo-glyph">${GLYPH[t]}︎</span>${NAMES[t]}` })));
        if (!pick) return; m = options.find(o => o.promo === pick);
      }
      if (online) { s.sel = -1; return send({ op: 'move', move: { from: m.from, to: m.to, promo: m.promo || null }, note: note(s.g, m) }); }
      return move(m);
    }
  }
  s.sel = p && colour(p) === g.turn && s.sel !== sq ? sq : -1; render();
}
function finish(end, winner) {
  s.end = end; s.winner = winner; sound(winner ? 'win' : 'notice');
  const sides = online ? [mySide()] : s.mode === 'cpu' ? [you()] : ['w', 'b'];
  const label = winner ? 'জয়' : 'ড্র';
  saveMatch({ id: crypto.randomUUID(), game: 'shotoronji', players: sides.map(side => ({ name: nameOf(side), points: winner === side ? 3 : winner ? 0 : 1, recent: [{ won: winner === side, img: ART, label: `চতুরঙ্গ · ${winner === side ? 'জয়' : winner ? 'হার' : label}` }] })) });
}

async function act(action, id) {
  switch (action) {
    case 'tab-play': case 'tab-rules': case 'tab-ranking': { const next = action.slice(4); if (view === next) return; view = next; return transition(); }
    case 'app-menu': return openMenu(s.phase === 'play' && !s.end ? [['দান বাতিল করে নতুন করে সাজান', 'edit', 'quit', 'tone-danger']] : [], act);
    case 'mode': s.mode = id === 'friends' ? 'friends' : 'cpu'; save(); return render();
    case 'level': if (LEVELS[id]) s.level = id; save(); return render();
    case 'fill': { const i = s.names[0].trim() && s.mode === 'friends' ? 1 : 0; s.names[i] = id; save(); return render(); }
    case 'start': {
      const need = s.mode === 'cpu' ? [0] : [0, 1];
      if (need.some(i => !s.names[i].trim())) return toast('আগে নাম লিখুন।');
      if (s.mode === 'friends' && s.names[0].trim().toLocaleLowerCase() === s.names[1].trim().toLocaleLowerCase()) return toast('দুজনের নাম আলাদা হতে হবে।');
      need.forEach(i => { try { s.names[i] = ensureAccount(s.names[i]).name; } catch { s.names[i] = s.names[i].trim(); } });
      s.side = s.mode === 'cpu' ? (s.pick === 'random' ? (Math.random() < .5 ? 'w' : 'b') : s.pick) : 'w';
      Object.assign(s, { phase: 'play', g: newGame(), past: [], moves: [], sel: -1, end: null, winner: null }); view = 'play'; save(); sound('notice'); transition(); if (cpuTurn()) setTimeout(cpuMove, 400); return;
    }
    case 'pick': if (['w', 'b', 'random'].includes(id)) s.pick = id; save(); return render();
    case 'again': if (online) return send({ op: 'again' });
      if (s.mode === 'cpu' && s.pick === 'random') s.side = Math.random() < .5 ? 'w' : 'b';
      Object.assign(s, { g: newGame(), past: [], moves: [], sel: -1, end: null, winner: null }); save(); render(); if (cpuTurn()) cpuMove(); return;
    case 'undo': {
      if (!s.past.length || thinking) return;
      const back = s.mode === 'cpu' && s.past.length >= 2 && s.g.turn === you() ? 2 : 1;
      for (let i = 0; i < back; i++) { s.g = s.past.pop(); s.moves.pop(); }
      s.sel = -1; save(); return render();
    }
    case 'resign': if (online) { if (await confirmBox('হার মেনে নেবেন?', '', 'হ্যাঁ, হার মানি')) send({ op: 'resign' }); return; }
      if (await confirmBox('হার মেনে নেবেন?', '', 'হ্যাঁ, হার মানি')) { const loser = s.mode === 'cpu' ? you() : s.g.turn; finish('resign', loser === 'w' ? 'b' : 'w'); save(); render(); } return;
    case 'draw': if (await confirmBox('দুজনেই ড্র চান?', '', 'হ্যাঁ, ড্র')) { finish('draw', null); save(); render(); } return;
    case 'quit': if (await confirmBox('এই দান বাতিল করবেন?', 'র‍্যাঙ্কিংয়ে কিছু যোগ হবে না।', 'হ্যাঁ, বাতিল')) { s.phase = 'setup'; save(); transition(); } return;
    case 'leave': if (!await confirmBox('ঘর ছেড়ে দেবেন?', '', 'হ্যাঁ')) return; clearInterval(poll); online = null; s.phase = 'setup'; s.end = null; save(); return transition();
    case 'game-home': view = 'play'; if (s.end) s.phase = 'setup'; save(); return transition();
  }
}

/* ---------- Online ---------- */
const ERR = ONLINE_ERRORS;
function adopt(v) {
  const was = online?.started, ended = s.end, edition = s.moves.length;
  online = { code: v.code, token: v.token || online?.token, me: v.me, host: v.host, members: v.members, started: v.started };
  if (v.match) {
    s.g = { ...v.match.g, seen: {} }; s.moves = v.match.moves; s.sel = s.moves.length !== edition ? -1 : s.sel; s.phase = 'play';
    if (v.match.end && !ended) finish(v.match.end, v.match.winner); else if (!v.match.end) { s.end = null; s.winner = null; if (s.moves.length > edition) sound(inCheck(s.g) ? 'timer' : 'vote'); }
  }
  try { sessionStorage.setItem('shotoronji.online', JSON.stringify({ code: online.code, token: online.token })); } catch { }
  return !was && v.started;
}
async function enter(body) {
  try { adopt(await tableApi({ game: 'chess', ...body })); startPolling(); transition(); } catch (e) { toast(ERR[e.message] || 'সংযোগে সমস্যা, আবার চেষ্টা করুন।'); }
}
async function send(body) {
  try { adopt(await tableApi({ game: 'chess', code: online.code, token: online.token, ...body })); render(); } catch (e) { toast(ERR[e.message] || 'সংযোগে সমস্যা।'); }
}
function startPolling() {
  clearInterval(poll);
  poll = setInterval(async () => {
    if (!online || document.hidden) return;
    try { const before = JSON.stringify([online.members, s.moves.length, s.end, online.started]); adopt(await tableApi({ game: 'chess', op: 'state', code: online.code, token: online.token })); if (JSON.stringify([online.members, s.moves.length, s.end, online.started]) !== before) render(); }
    catch (e) { if (['ROOM_GONE', 'AUTH'].includes(e.message)) { clearInterval(poll); online = null; s.phase = 'setup'; toast('ঘরটা আর নেই।'); render(); } }
  }, 1200);
}
if (ONLINE) try { const saved = JSON.parse(sessionStorage.getItem('shotoronji.online')); if (saved) { online = { ...saved, me: 0, members: [], started: false }; tableApi({ game: 'chess', op: 'state', ...saved }).then(v => { adopt(v); startPolling(); render(); }).catch(() => { online = null; render(); }); } } catch { }

render();
if (cpuTurn()) cpuMove();
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => { });

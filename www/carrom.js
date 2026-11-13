import { S, COIN, STRIKER, BASE, POCKETS, POWER, newGame, striker, step, resting, settle, score, plan, COLOURS, CPU_LEVELS, QUEEN_POINTS } from './carrom-physics.mjs';
import { sound } from './sound.mjs';
import { saveMatch, readHistory, overallRanking, hallOfFame } from './history.mjs';
import { readAccounts, ensureAccount } from './accounts.mjs';
import { esc, icon, appShell, pageHead, rankTable, fameTable, enterScreen, leaveScreen } from './ui-kit.mjs';
import { $, $$, bn, toast, confirmBox, openMenu, SHELL_LABELS, TABS, BACK } from './lamp.mjs';

/* ক্যারম: two players on one phone (sitting on opposite sides) or against the computer.
   Slide the striker along your line, then pull back from it and let go. */
const KEY = 'carrom.v1', ART = 'assets/carrom/cover.svg', CPU_NAME = 'কম্পিউটার';
const COLOUR_NAME = { white: 'সাদা', black: 'কালো' };

function fresh() { return { v: 1, phase: 'setup', mode: 'cpu', level: 'medium', names: ['', ''], g: null, saved: false }; }
let s = fresh(), view = 'play', lastScreen = '', moving = false, fell = [], aim = null, sx = S / 2, raf = 0, busy = false;
try { const d = JSON.parse(localStorage.getItem(KEY)); if (d?.v === 1) s = { ...fresh(), ...d }; } catch { }
if (s.g) s.g.pieces = s.g.pieces.filter(p => p.id !== 's');
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { } };
const button = (label, action, cls, ic, extra = '') => `<button type="button" class="btn ${cls}" data-action="${action}" ${extra}>${icon(ic)}${label}</button>`;
const nameOf = side => side === 1 && s.mode === 'cpu' ? `${CPU_NAME} (${CPU_LEVELS[s.level].name})` : s.names[side];
const cpuTurn = () => s.mode === 'cpu' && s.phase === 'play' && s.g && s.g.turn === 1 && s.g.winner === null;
const wait = ms => new Promise(r => setTimeout(r, ms));

/* ---------- Screens ---------- */
function chips() {
  const taken = s.names.map(n => n.trim().toLocaleLowerCase()), list = readAccounts().filter(a => !taken.includes(a.name.toLocaleLowerCase()));
  return list.length ? `<div class="acc-mini"><span>অ্যাকাউন্ট থেকে</span>${list.map(a => `<button type="button" data-action="fill" data-id="${esc(a.name)}">+ ${esc(a.name)}</button>`).join('')}</div>` : '';
}
const seg = (name, map, value) => `<div class="cr-seg" role="radiogroup">${Object.entries(map).map(([k, l]) => `<button type="button" role="radio" aria-checked="${value === k}" class="${value === k ? 'is-on' : ''}" data-action="${name}" data-id="${k}">${l}</button>`).join('')}</div>`;
function setup() {
  return `<header class="cr-head"><img src="${ART}" alt="" width="640" height="420"><div><h1>ক্যারম</h1><p>স্ট্রাইকার টেনে ছাড়ুন, নিজের গুটি পকেটে ফেলুন।</p></div></header>
  <section class="cr-panel"><h2>কার সাথে</h2>${seg('mode', { cpu: 'কম্পিউটার', friends: 'বন্ধুর সাথে' }, s.mode)}${s.mode === 'cpu' ? `<div class="cr-gap">${seg('level', Object.fromEntries(Object.entries(CPU_LEVELS).map(([k, v]) => [k, v.name])), s.level)}</div>` : ''}</section>
  <section class="cr-panel"><h2>নাম</h2><label class="cr-field"><span class="cr-coin white"></span><input data-name="0" maxlength="20" autocomplete="off" placeholder="${s.mode === 'cpu' ? 'আপনার নাম' : 'সাদা গুটি (নিচে বসবেন)'}" value="${esc(s.names[0])}"></label>
  ${s.mode === 'friends' ? `<label class="cr-field"><span class="cr-coin black"></span><input data-name="1" maxlength="20" autocomplete="off" placeholder="কালো গুটি (উল্টো দিকে বসবেন)" value="${esc(s.names[1])}"></label>` : ''}${chips()}</section>
  ${button('খেলা শুরু', 'start', 'primary wide', 'play')}`;
}
function seat(side) {
  const g = s.g, on = g.winner === null && g.turn === side && !moving, colour = COLOURS[side];
  const prompt = on ? (side === 1 && s.mode === 'cpu' ? 'নিশানা ঠিক করছে…' : 'স্ট্রাইকার সরিয়ে টেনে ছাড়ুন') : '';
  return `<div class="cr-seat ${colour}${on ? ' is-on' : ''}${side === 1 && s.mode === 'friends' ? ' flip' : ''}"><span class="cr-coin ${colour}"></span><span class="cr-who"><b>${esc(nameOf(side))}</b><small>${prompt || `${bn(g.pocketed[side].length)}/৯ গুটি${g.queenBy === side ? ' · রানি' : ''}`}</small></span><strong>${bn(score(g, side))}</strong></div>`;
}
function message(g) {
  const l = g.last; if (!l) return 'প্রথম শট';
  const who = esc(nameOf(l.side));
  if (l.foul) return `${who}-এর স্ট্রাইকার পকেটে! একটা গুটি মাঝে ফেরত`;
  if (l.note === 'covered') return `${who} রানি তুলে নিলেন! +${bn(QUEEN_POINTS)}`;
  if (l.note === 'queen') return `রানি পকেটে! এবার নিজের একটা গুটি ফেলে ঢেকে দিতে হবে`;
  if (l.note === 'uncovered') return 'রানি ঢাকা হয়নি, মাঝে ফেরত গেল';
  if (l.own) return `${who} ${bn(l.own)}টা গুটি ফেললেন, আবার শট`;
  if (l.other) return `${who} প্রতিপক্ষের গুটি ফেলে দিলেন`;
  return `${who}-এর শটে কিছু পড়েনি`;
}
function playing() {
  const g = s.g;
  return `<div class="cr-table">${seat(1)}<div class="cr-board-wrap"><canvas id="board" aria-label="ক্যারম বোর্ড"></canvas></div>${seat(0)}</div>
  <p class="cr-msg" role="status">${message(g)}</p>
  ${g.winner !== null ? `<section class="cr-over"><h2>${esc(nameOf(g.winner))} জিতলেন!</h2><p>${bn(score(g, 0))} — ${bn(score(g, 1))}</p>${button('আবার খেলি', 'again', 'primary wide', 'play')}${button('ক্যারমের শুরুর পাতা', 'game-home', 'secondary wide', 'home')}</section>`
    : button('খেলা ছেড়ে দিন', 'quit', 'text wide', 'close')}`;
}
function rules() {
  return `${pageHead('নিয়ম', 'ক্যারম', '')}<ol class="plain-rules">
  <li>দুজন খেলেন, মুখোমুখি বসে। একজনের সাদা গুটি, অন্যজনের কালো। মাঝে লাল রানি।</li>
  <li>নিজের লাইনে স্ট্রাইকার সরিয়ে রাখুন, তারপর স্ট্রাইকার থেকে আঙুল পেছনে টেনে ছেড়ে দিন। যত লম্বা টান, তত জোর।</li>
  <li>নিজের গুটি পকেটে পড়লে আবার শট। প্রতিপক্ষের গুটি ফেললে সেটা তার হিসাবে যায়।</li>
  <li>রানি ফেললে পরের শটে (বা একই শটে) নিজের একটা গুটি ফেলে ঢাকতে হয়, তবেই রানির ${bn(QUEEN_POINTS)} পয়েন্ট। না পারলে রানি মাঝে ফেরে।</li>
  <li>স্ট্রাইকার পকেটে পড়লে ফাউল: চাল যায়, আর নিজের একটা পকেটের গুটি মাঝে ফেরত।</li>
  <li>যে আগে নয়টা গুটি ফেলে, খেলা শেষ। বেশি পয়েন্ট যার (রানিসহ) সে জেতে। র‍্যাঙ্কিংয়ে জয়ে ৩ পয়েন্ট।</li></ol>`;
}
const labels = { caption: 'ফলাফল', rank: '#', player: 'খেলোয়াড় · শেষ পাঁচ খেলা', points: 'পয়েন্ট', win: 'সবুজ: জয়', loss: 'লাল: হার', order: 'নতুনটি বাঁ দিকে', empty: 'এখনও কোনো খেলা শেষ হয়নি।', noGames: 'এখনও খেলেননি', number: bn };
function ranking() {
  const list = readHistory(), all = overallRanking(list, 'carrom').map(r => ({ name: r.name, score: r.points, note: bn(r.matches) + 'টি খেলা · ' + bn(r.wins) + 'টিতে জয়', history: r.recent.map(h => ({ won: h.won, img: h.img || ART, label: h.label || '' })) }));
  return `${pageHead('র‍্যাঙ্কিং', 'ক্যারম', 'জয়ে ৩ পয়েন্ট।')}<section class="rank-section">${rankTable(all, labels)}</section>
  <section class="fame-section"><h2>${icon('trophy')}হল অব ফেম</h2>${fameTable(hallOfFame(list, 'carrom'), { caption: 'হল অব ফেম', player: 'খেলোয়াড়', points: 'পয়েন্ট', empty: 'এখনও কেউ নেই।', number: bn, meta: e => new Date(e.date).toLocaleDateString('bn-BD') })}</section>`;
}

/* ---------- Drawing ---------- */
let ctx = null, scale = 1;
function sizeBoard() {
  const c = $('#board'); if (!c) return; const box = c.parentElement.getBoundingClientRect(), dpr = devicePixelRatio || 1;
  const size = Math.min(box.width - 28, innerHeight - 260); c.style.width = c.style.height = size + 'px'; c.width = c.height = Math.round(size * dpr); scale = c.width / S; ctx = c.getContext('2d'); draw();
}
function drawPiece(p) {
  const g = ctx, x = p.x * scale, y = p.y * scale, r = p.r * scale;
  g.save(); g.shadowColor = '#0006'; g.shadowBlur = r * .5; g.shadowOffsetY = r * .2;
  const fill = { white: ['#fffaf0', '#d9cfb8'], black: ['#3a3a3a', '#111'], queen: ['#e2463c', '#8e1b16'], striker: ['#f6f3ff', '#9fb4e8'] }[p.kind];
  const grad = g.createRadialGradient(x - r * .3, y - r * .3, r * .1, x, y, r); grad.addColorStop(0, fill[0]); grad.addColorStop(1, fill[1]);
  g.fillStyle = grad; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); g.restore();
  g.strokeStyle = p.kind === 'black' ? '#ffffff30' : '#00000025'; g.lineWidth = r * .12; g.beginPath(); g.arc(x, y, r * .62, 0, 7); g.stroke();
  if (p.kind === 'striker') { g.strokeStyle = '#2f5fbf'; g.lineWidth = r * .1; g.beginPath(); g.arc(x, y, r * .82, 0, 7); g.stroke(); }
}
function draw() {
  if (!ctx) return; const g = ctx, k = scale, W = S * k;
  // Plywood with a light grain and boric-powder sheen.
  g.fillStyle = '#ecd3a0'; g.fillRect(0, 0, W, W);
  g.globalAlpha = .07; g.strokeStyle = '#7a4a1e'; for (let i = 0; i < 60; i++) { g.lineWidth = 1 + (i % 3); g.beginPath(); g.moveTo(0, i * W / 60 + Math.sin(i) * 6); g.bezierCurveTo(W * .3, i * W / 60 + 8, W * .7, i * W / 60 - 8, W, i * W / 60 + Math.cos(i) * 6); g.stroke(); } g.globalAlpha = 1;
  g.strokeStyle = '#2b1a0e'; g.lineWidth = 2 * k;
  // Base lines with their end circles, on all four sides.
  for (let r = 0; r < 4; r++) {
    g.save(); g.translate(W / 2, W / 2); g.rotate(r * Math.PI / 2); g.translate(-W / 2, -W / 2);
    const y = (S - 150) * k, x0 = BASE.x0 * k, x1 = BASE.x1 * k, h = 26 * k;
    g.beginPath(); g.moveTo(x0, y - h); g.lineTo(x1, y - h); g.moveTo(x0, y + h); g.lineTo(x1, y + h); g.stroke();
    g.fillStyle = '#c0392b'; for (const x of [x0, x1]) { g.beginPath(); g.arc(x, y, h, 0, 7); g.stroke(); g.beginPath(); g.arc(x, y, h * .6, 0, 7); g.fill(); }
    // Corner arrow
    g.beginPath(); g.moveTo(150 * k, 150 * k); g.lineTo(300 * k, 300 * k); g.stroke(); g.beginPath(); g.arc(320 * k, 320 * k, 26 * k, Math.PI * .75, Math.PI * 1.75 + 1.4); g.stroke();
    g.restore();
  }
  g.beginPath(); g.arc(W / 2, W / 2, 125 * k, 0, 7); g.stroke(); g.beginPath(); g.arc(W / 2, W / 2, 30 * k, 0, 7); g.stroke();
  g.fillStyle = '#c0392b'; g.globalAlpha = .25; g.beginPath(); g.arc(W / 2, W / 2, 30 * k, 0, 7); g.fill(); g.globalAlpha = 1;
  // Pockets
  for (const [px, py] of POCKETS) { g.fillStyle = '#1a0e06'; g.beginPath(); g.arc(px * k, py * k, 40 * k, 0, 7); g.fill(); g.strokeStyle = '#8a5a2e'; g.lineWidth = 3 * k; g.stroke(); }
  for (const p of s.g.pieces) if (!p.in && p.id !== 's') drawPiece(p);
  const st = s.g.pieces.find(p => p.id === 's') || (s.g.winner === null && !moving ? striker(s.g.turn, sx) : null);
  if (st && !st.in) drawPiece(st);
  if (aim) {
    const dx = aim.x - aim.px, dy = aim.y - aim.py, len = Math.min(Math.hypot(dx, dy), 260);
    if (len > 8) {
      const ux = dx / Math.hypot(dx, dy), uy = dy / Math.hypot(dx, dy);
      g.setLineDash([8 * k, 10 * k]); g.strokeStyle = '#2f5fbfcc'; g.lineWidth = 4 * k; g.beginPath(); g.moveTo(aim.x * k, aim.y * k); g.lineTo((aim.x + ux * (200 + len * 2)) * k, (aim.y + uy * (200 + len * 2)) * k); g.stroke(); g.setLineDash([]);
      g.fillStyle = `hsl(${120 - len / 260 * 120} 70% 45%)`; g.fillRect(16 * k, 16 * k, len / 260 * (S - 32) * k, 10 * k);
    }
  }
}

/* ---------- Shooting ---------- */
const human = () => s.g && s.g.winner === null && !moving && !busy && !cpuTurn();
function shoot(x, vx, vy) {
  const st = striker(s.g.turn, x); st.vx = vx; st.vy = vy; s.g.pieces.push(st); moving = true; fell = []; sound('notice');
  let last = performance.now();
  const tick = now => {
    const dt = Math.min(.05, (now - last) / 1000), n = Math.ceil(dt / (1 / 240)); last = now;
    for (let i = 0; i < n && !resting(s.g.pieces); i++) { const f = step(s.g.pieces, dt / n); if (f.length) { fell.push(...f); sound(f.includes('s') ? 'wrong' : 'coin'); } }
    draw();
    if (!resting(s.g.pieces)) raf = requestAnimationFrame(tick); else done();
  };
  raf = requestAnimationFrame(tick);
}
async function done() {
  moving = false; settle(s.g, fell); sx = S / 2;
  if (s.g.winner !== null) finish();
  save(); render();
  if (cpuTurn()) cpuMove();
}
async function cpuMove() {
  busy = true; render(); await wait(2000); if (!cpuTurn()) { busy = false; return; }
  const p = plan(s.g, s.level); sx = p.x; draw();
  const len = Math.hypot(p.vx, p.vy), pull = len / POWER * 260; aim = { x: p.x, y: BASE.y[1], px: p.x - p.vx / len * pull, py: BASE.y[1] - p.vy / len * pull }; draw();
  await wait(900); aim = null; busy = false; shoot(p.x, p.vx, p.vy);
}
function bindBoard() {
  const c = $('#board'); if (!c) return; sizeBoard();
  const world = e => { const b = c.getBoundingClientRect(); return [(e.clientX - b.left) / b.width * S, (e.clientY - b.top) / b.height * S]; };
  let mode = null;
  c.onpointerdown = e => {
    if (!human()) return; const [x, y] = world(e), side = s.g.turn, by = BASE.y[side];
    try { c.setPointerCapture(e.pointerId); } catch { }
    if (Math.hypot(x - sx, y - by) < STRIKER * 2.2) { mode = 'aim'; aim = { x: sx, y: by, px: x, py: y }; }
    else if (Math.abs(y - by) < 90) { mode = 'slide'; sx = Math.max(BASE.x0, Math.min(BASE.x1, x)); }
    else return toast('নিজের লাইনে স্ট্রাইকার ধরে পেছনে টানুন।');
    draw();
  };
  // Move and release are heard on the whole window, so a pull that leaves the board still shoots.
  window.onpointermove = e => { if (!mode) return; const [x, y] = world(e); if (mode === 'slide') sx = Math.max(BASE.x0, Math.min(BASE.x1, x)); else { aim.px = x; aim.py = y; } draw(); };
  window.onpointerup = () => {
    if (mode === 'aim') {
      const dx = aim.x - aim.px, dy = aim.y - aim.py, len = Math.hypot(dx, dy); aim = null;
      if (len > 20) {
        if (s.g.pieces.some(p => !p.in && Math.hypot(p.x - sx, p.y - BASE.y[s.g.turn]) < p.r + STRIKER)) { toast('স্ট্রাইকার কোনো গুটির ওপর। একটু সরান।'); draw(); }
        else { const power = Math.min(len, 260) / 260 * POWER; shoot(sx, dx / len * power, dy / len * power); }
      } else draw();
    }
    mode = null;
  };
  window.onpointercancel = () => { mode = null; aim = null; draw(); };
}
addEventListener('resize', sizeBoard);

function finish() {
  if (s.saved) return; s.saved = true; sound('win');
  const g = s.g, sides = s.mode === 'cpu' ? [0] : [0, 1];
  saveMatch({ id: crypto.randomUUID(), game: 'carrom', players: sides.map(side => ({ name: nameOf(side), points: g.winner === side ? 3 : 0, recent: [{ won: g.winner === side, img: ART, label: `ক্যারম · ${bn(score(g, 0))}–${bn(score(g, 1))}` }] })) });
}

/* ---------- Shell ---------- */
function render() {
  const key = view + s.phase, changed = key !== lastScreen; lastScreen = key;
  const body = view === 'rules' ? rules() : view === 'ranking' ? ranking() : s.phase === 'play' && s.g ? playing() : setup();
  $('#app').innerHTML = appShell({ brand: 'ক্যারম', brandSub: 'বোর্ডের খেলা', brandIcon: 'grid', brandAction: 'tab-play', crumb: view === 'rules' ? 'নিয়ম' : view === 'ranking' ? 'র‍্যাঙ্কিং' : s.phase === 'play' ? 'খেলা চলছে' : 'খেলা সাজান', active: view, contentClass: 'game-content carrom-content', labels: SHELL_LABELS, backHref: BACK, tabs: TABS, body });
  $$('[data-action]').forEach(el => el.onclick = e => { e.preventDefault(); act(el.dataset.action, el.dataset.id); });
  $$('[data-name]').forEach(el => el.oninput = () => { s.names[Number(el.dataset.name)] = el.value; save(); });
  if (view === 'play' && s.phase === 'play') bindBoard();
  if (changed) enterScreen($('#screen'));
}
const transition = () => leaveScreen($('#screen'), () => { render(); scrollTo({ top: 0, behavior: 'instant' }); });

async function act(action, id) {
  switch (action) {
    case 'tab-play': case 'tab-rules': case 'tab-ranking': { const nx = action.slice(4); if (view === nx) return; view = nx; return transition(); }
    case 'app-menu': return openMenu(s.phase === 'play' ? [['খেলা ছেড়ে নতুন করে সাজান', 'edit', 'quit', 'tone-danger']] : [], act);
    case 'mode': s.mode = id === 'friends' ? 'friends' : 'cpu'; save(); return render();
    case 'level': if (CPU_LEVELS[id]) s.level = id; save(); return render();
    case 'fill': { const i = s.mode === 'friends' && s.names[0].trim() ? 1 : 0; s.names[i] = id; save(); return render(); }
    case 'start': {
      const need = s.mode === 'cpu' ? [0] : [0, 1];
      if (need.some(i => !s.names[i].trim())) return toast('আগে নাম লিখুন।');
      if (s.mode === 'friends' && s.names[0].trim().toLocaleLowerCase() === s.names[1].trim().toLocaleLowerCase()) return toast('দুজনের নাম আলাদা হতে হবে।');
      need.forEach(i => { try { s.names[i] = ensureAccount(s.names[i]).name; } catch { s.names[i] = s.names[i].trim(); } });
      s.g = newGame(); s.saved = false; s.phase = 'play'; sx = S / 2; view = 'play'; save(); sound('notice'); return transition();
    }
    case 'again': s.g = newGame(); s.saved = false; sx = S / 2; save(); return render();
    case 'quit': if (await confirmBox('খেলা ছেড়ে দেবেন?', 'র‍্যাঙ্কিংয়ে কিছু যোগ হবে না।', 'হ্যাঁ')) { cancelAnimationFrame(raf); moving = false; s.phase = 'setup'; s.g = null; save(); transition(); } return;
    case 'game-home': view = 'play'; if (s.g?.winner !== null) { s.phase = 'setup'; s.g = null; } save(); return transition();
  }
}

render();
if (cpuTurn()) cpuMove();
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => { });

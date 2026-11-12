import { sound, soundEnabled, toggleSound } from './sound.mjs';
import { saveMatch, readHistory, overallRanking, hallOfFame } from './history.mjs';
import { esc, icon, appShell, pageHead, rankTable, fameTable, playerColour, playerDot, enterScreen, leaveScreen } from './ui-kit.mjs';

/* কলম যুদ্ধ: the school-bench pen fight. Players take turns flicking their own pen;
   a pen whose middle goes past the edge of the bench has fallen. Last pen on the bench wins the round. */

const $ = q => document.querySelector(q), $$ = q => [...document.querySelectorAll(q)];
const bn = n => Number(n).toLocaleString('bn-BD');
const KEY = 'pen.v1', ROUNDS = 5, W = 480, H = 780, R = 7;
export const PENS = {
  pinpoint: { name: 'Matador Pinpoint', short: 'পিনপয়েন্ট', L: 150, m: 1, grip: 1, body: '#f4f6f8', cap: '#1d4fa3', note: 'মাঝারি ওজন, সোজা চলে' },
  hischool: { name: 'Matador Hi-School', short: 'হাই-স্কুল', L: 162, m: 1.22, grip: 1.1, body: '#fdf7e6', cap: '#c62828', note: 'লম্বা আর ভারী, সহজে পড়ে না' },
  iteen: { name: 'Matador i-Teen', short: 'আই-টিন', L: 136, m: 0.84, grip: 0.82, body: '#6ec3e8', cap: '#ffffff', note: 'হালকা, জোরে ছোটে' },
  econo: { name: 'Econo DX', short: 'ইকোনো', L: 146, m: 1.05, grip: 0.95, body: '#dfe9ef', cap: '#0b2f6b', note: 'ঘুরে গিয়ে ধাক্কা দেয়' }
};
const PEN_KEYS = Object.keys(PENS), penImg = k => `assets/pen/${k}.svg`;

let s = load(), view = 'play', lastScreen = '', world = null, aim = null, raf = 0, modalResolve = null;

function fresh() { return { v: 1, phase: 'setup', players: [], set: null, round: null }; }
function load() { try { const d = JSON.parse(localStorage.getItem(KEY)); if (d?.v === 1) return d; } catch {} return fresh(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }
const byId = id => s.players.find(p => p.id === id);

/* ---------- Physics ---------- */

function placePens(starter) {
  const n = s.players.length, pens = s.players.map((p, i) => {
    const t = Math.PI / 2 + (i / n) * Math.PI * 2, spec = PENS[p.pen];
    return { pid: p.id, x: W / 2 + Math.cos(t) * 140, y: H / 2 + Math.sin(t) * 230, a: t + Math.PI / 2 + (Math.random() - .5) * .7, vx: 0, vy: 0, w: 0, out: false, L: spec.L, m: spec.m, grip: spec.grip, I: spec.m * spec.L * spec.L / 12 };
  });
  s.round = { pens, turn: starter, out: [], moving: false };
}
const ends = p => { const c = Math.cos(p.a) * p.L / 2, d = Math.sin(p.a) * p.L / 2; return [p.x - c, p.y - d, p.x + c, p.y + d]; };
function closest(a0x, a0y, a1x, a1y, b0x, b0y, b1x, b1y) {
  // Closest points between two segments.
  const ux = a1x - a0x, uy = a1y - a0y, vx = b1x - b0x, vy = b1y - b0y, wx = a0x - b0x, wy = a0y - b0y;
  const a = ux * ux + uy * uy, b = ux * vx + uy * vy, c = vx * vx + vy * vy, d = ux * wx + uy * wy, e = vx * wx + vy * wy, D = a * c - b * b;
  let sN, sD = D, tN, tD = D;
  if (D < 1e-6) { sN = 0; sD = 1; tN = e; tD = c; } else { sN = b * e - c * d; tN = a * e - b * d; if (sN < 0) { sN = 0; tN = e; tD = c; } else if (sN > sD) { sN = sD; tN = e + b; tD = c; } }
  if (tN < 0) { tN = 0; sN = Math.min(Math.max(-d, 0), a); sD = a; } else if (tN > tD) { tN = tD; sN = Math.min(Math.max(b - d, 0), a); sD = a; }
  const sc = Math.abs(sN) < 1e-6 ? 0 : sN / sD, tc = Math.abs(tN) < 1e-6 ? 0 : tN / tD;
  return [a0x + sc * ux, a0y + sc * uy, b0x + tc * vx, b0y + tc * vy];
}
function collide(A, B) {
  const [ax, ay, bx, by] = closest(...ends(A), ...ends(B)), dx = bx - ax, dy = by - ay, dist = Math.hypot(dx, dy);
  if (dist >= R * 2 || dist < 1e-6) return;
  const nx = dx / dist, ny = dy / dist, pen = R * 2 - dist, total = 1 / A.m + 1 / B.m;
  A.x -= nx * pen * (1 / A.m) / total; A.y -= ny * pen * (1 / A.m) / total; B.x += nx * pen * (1 / B.m) / total; B.y += ny * pen * (1 / B.m) / total;
  const rax = ax - A.x, ray = ay - A.y, rbx = bx - B.x, rby = by - B.y;
  const vax = A.vx - A.w * ray, vay = A.vy + A.w * rax, vbx = B.vx - B.w * rby, vby = B.vy + B.w * rbx;
  const rel = (vbx - vax) * nx + (vby - vay) * ny; if (rel > 0) return;
  const ca = rax * ny - ray * nx, cb = rbx * ny - rby * nx;
  const j = -(1 + .3) * rel / (total + ca * ca / A.I + cb * cb / B.I);
  A.vx -= j * nx / A.m; A.vy -= j * ny / A.m; A.w -= ca * j / A.I; B.vx += j * nx / B.m; B.vy += j * ny / B.m; B.w += cb * j / B.I;
  if (Math.abs(rel) > 60) sound('notice');
}
function step(dt) {
  const r = s.round, live = r.pens.filter(p => !p.out);
  for (const p of r.pens) {
    if (p.out) { p.fall = Math.min(1, (p.fall || 0) + dt * 2.6); p.x += p.vx * dt * .4; p.y += p.vy * dt * .4; continue; }
    const v = Math.hypot(p.vx, p.vy), dec = 560 * p.grip * dt;
    if (v <= dec) { p.vx = p.vy = 0; } else { p.vx *= (v - dec) / v; p.vy *= (v - dec) / v; }
    const wd = 7 * p.grip * dt; p.w = Math.abs(p.w) <= wd ? 0 : p.w - Math.sign(p.w) * wd; p.w *= .997;
    p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.w * dt;
  }
  for (let i = 0; i < live.length; i++) for (let k = i + 1; k < live.length; k++) collide(live[i], live[k]);
  for (const p of live) if (p.x < 0 || p.x > W || p.y < 0 || p.y > H) { p.out = true; p.fall = 0; r.out.push(p.pid); sound('out'); }
}
const resting = () => s.round.pens.every(p => p.out ? (p.fall || 0) >= 1 : Math.hypot(p.vx, p.vy) < 2 && Math.abs(p.w) < .05);

function flick(p, cx, cy, jx, jy) {
  p.vx += jx / p.m; p.vy += jy / p.m; p.w += ((cx - p.x) * jy - (cy - p.y) * jx) / p.I;
  p.w = Math.max(-26, Math.min(26, p.w)); s.round.moving = true; s.round.knockedThisTurn = [];
  sound('notice'); loop();
}

function settle() {
  const r = s.round, shooter = byId(r.turn), fresh = r.out.filter(id => !r.counted?.includes(id));
  r.counted = [...(r.counted || []), ...fresh]; r.moving = false;
  for (const id of fresh) if (id !== shooter.id) shooter.score++;
  const live = r.pens.filter(p => !p.out);
  if (live.length <= 1) return endRound(live[0]?.pid || null, fresh);
  const order = s.players.map(p => p.id), alive = new Set(live.map(p => p.pid));
  let i = order.indexOf(r.turn); do { i = (i + 1) % order.length; } while (!alive.has(order[i]));
  r.turn = order[i]; save(); render();
  if (fresh.length) toast(fresh.map(id => byId(id).name).join(' ও ') + ' বেঞ্চ থেকে পড়ে গেছে।');
}
function endRound(winner) {
  if (winner) byId(winner).score += 2;
  for (const p of s.players) { p.history = [{ won: p.id === winner, img: penImg(p.pen), label: `${PENS[p.pen].name} · ${p.id === winner ? 'রাউন্ড জয়' : 'পড়ে গেছে'}` }, ...(p.history || [])].slice(0, 5); }
  s.set.rounds++; s.lastWinner = winner; s.phase = 'roundover'; save(); sound(winner ? 'win' : 'notice'); transition();
}

/* ---------- Drawing ---------- */

function drawDesk(g) {
  const wood = g.createLinearGradient(0, 0, W, H); wood.addColorStop(0, '#b98250'); wood.addColorStop(1, '#8e5a2c');
  g.fillStyle = wood; g.fillRect(0, 0, W, H);
  g.strokeStyle = '#6b3f1a'; g.globalAlpha = .18; g.lineWidth = 1.2;
  for (let y = 18; y < H; y += 26) { g.beginPath(); g.moveTo(0, y); for (let x = 0; x <= W; x += 30) g.lineTo(x, y + Math.sin((x + y) / 47) * 5); g.stroke(); }
  g.globalAlpha = .22; g.fillStyle = '#1b2c5a'; g.beginPath(); g.ellipse(70, 470, 26, 15, .5, 0, 7); g.fill();
  g.globalAlpha = .3; g.strokeStyle = '#3b210c'; g.lineWidth = 2; g.font = '600 22px Poppins, sans-serif'; g.strokeText('জম্ফা + ১০ক', 196, 92);
  g.globalAlpha = 1; g.strokeStyle = '#5a3312'; g.lineWidth = 6; g.strokeRect(3, 3, W - 6, H - 6);
}
function drawPen(g, p, colour, active) {
  const spec = PENS[byId(p.pid)?.pen] || PENS.pinpoint, L = p.L, f = p.out ? 1 - (p.fall || 0) : 1;
  if (f <= 0) return;
  g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.scale(f, f); g.globalAlpha = f;
  g.fillStyle = '#0000002e'; g.beginPath(); g.roundRect(-L / 2 + 3, -R + 4, L, R * 2, R); g.fill();
  if (active) { g.strokeStyle = colour; g.lineWidth = 4; g.globalAlpha = f * .85; g.beginPath(); g.roundRect(-L / 2 - 6, -R - 6, L + 12, R * 2 + 12, R + 6); g.stroke(); g.globalAlpha = f; }
  g.fillStyle = '#d9c9a8'; g.beginPath(); g.moveTo(-L / 2, 0); g.lineTo(-L / 2 + 16, -R + 2); g.lineTo(-L / 2 + 16, R - 2); g.closePath(); g.fill();
  g.fillStyle = '#222'; g.beginPath(); g.arc(-L / 2 + 1, 0, 1.6, 0, 7); g.fill();
  g.fillStyle = spec.body; g.strokeStyle = '#00000040'; g.lineWidth = 1; g.beginPath(); g.roundRect(-L / 2 + 15, -R, L * .62, R * 2, 2); g.fill(); g.stroke();
  g.fillStyle = spec.cap; g.beginPath(); g.roundRect(L / 2 - L * .27, -R - 1, L * .27, R * 2 + 2, 4); g.fill(); g.stroke();
  g.fillRect(L / 2 - L * .22, -R - 4, L * .19, 3.5);
  const shine = g.createLinearGradient(0, -R, 0, R); shine.addColorStop(0, '#ffffffaa'); shine.addColorStop(.45, '#ffffff00'); shine.addColorStop(1, '#00000030');
  g.fillStyle = shine; g.beginPath(); g.roundRect(-L / 2 + 15, -R, L - 15, R * 2, 3); g.fill();
  g.fillStyle = colour; g.beginPath(); g.arc(L / 2 - L * .13, 0, 3.4, 0, 7); g.fill();
  g.restore();
}
function draw() {
  const c = $('#bench'); if (!c || !s.round) return;
  const g = c.getContext('2d'), k = c.width / W; g.setTransform(k, 0, 0, k, 0, 0); drawDesk(g);
  const r = s.round, idx = id => s.players.findIndex(p => p.id === id);
  for (const p of r.pens) drawPen(g, p, playerColour(byId(p.pid).name, idx(p.pid)), !r.moving && p.pid === r.turn && !p.out);
  for (const p of r.pens) if (!p.out) { const n = byId(p.pid).name; g.font = '600 12px Poppins, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#fffaf0'; g.strokeStyle = '#3b210c'; g.lineWidth = 3; g.strokeText(n, p.x, p.y - 22); g.fillText(n, p.x, p.y - 22); }
  if (aim) {
    const dx = aim.sx - aim.x, dy = aim.sy - aim.y, len = Math.min(Math.hypot(dx, dy), 200), u = Math.hypot(dx, dy) || 1, ex = aim.cx - dx / u * len * .9, ey = aim.cy - dy / u * len * .9;
    g.setLineDash([6, 6]); g.strokeStyle = '#fffaf0'; g.lineWidth = 3; g.beginPath(); g.moveTo(aim.cx, aim.cy); g.lineTo(ex, ey); g.stroke(); g.setLineDash([]);
    g.fillStyle = len > 150 ? '#e5533d' : '#f2c230'; g.beginPath(); g.arc(ex, ey, 6, 0, 7); g.fill();
    g.strokeStyle = '#ffffff88'; g.lineWidth = 2; g.beginPath(); g.arc(aim.cx, aim.cy, 10 + len / 6, 0, 7); g.stroke();
  }
}
const next = f => document.hidden ? -setTimeout(() => f(performance.now()), 50) : requestAnimationFrame(f);
const stop = () => raf < 0 ? clearTimeout(-raf) : cancelAnimationFrame(raf);
function loop() {
  stop(); let last = performance.now();
  const tick = now => {
    // Catch up on the real time that passed (slow phones, background tabs) in small fixed steps.
    const dt = Math.min(3, (now - last) / 1000), n = Math.ceil(dt / .004); last = now;
    if (s.round?.moving) { for (let i = 0; i < n && !resting(); i++) step(dt / n); if (resting()) { draw(); return settle(); } }
    draw(); if (s.round?.moving || aim) raf = next(tick);
  };
  raf = next(tick);
}
function sizeBench() {
  const c = $('#bench'); if (!c) return;
  const box = c.parentElement.getBoundingClientRect(), maxH = Math.max(360, innerHeight * .78), cssW = Math.min(box.width, maxH * W / H), dpr = devicePixelRatio || 1;
  c.style.width = cssW + 'px'; c.style.height = cssW * H / W + 'px'; c.width = Math.round(cssW * dpr); c.height = Math.round(cssW * H / W * dpr); draw();
}
function bindBench() {
  const c = $('#bench'); if (!c) return; sizeBench();
  const toWorld = e => { const b = c.getBoundingClientRect(); return [(e.clientX - b.left) / b.width * W, (e.clientY - b.top) / b.height * H]; };
  c.onpointerdown = e => {
    if (s.round.moving) return; const p = s.round.pens.find(q => q.pid === s.round.turn && !q.out); if (!p) return;
    const [x, y] = toWorld(e), [a0, a1, b0, b1] = ends(p), ux = b0 - a0, uy = b1 - a1, t = Math.max(0, Math.min(1, ((x - a0) * ux + (y - a1) * uy) / (ux * ux + uy * uy))), cx = a0 + ux * t, cy = a1 + uy * t;
    if (Math.hypot(x - cx, y - cy) > 34) return toast(`${byId(p.pid).name}-এর কলম ধরে টেনে ছাড়ুন।`);
    aim = { pen: p, cx, cy, x, y, sx: x, sy: y }; c.setPointerCapture(e.pointerId); loop();
  };
  c.onpointermove = e => { if (!aim) return; [aim.sx, aim.sy] = toWorld(e); };
  const release = () => {
    if (!aim) return; const a = aim; aim = null;
    const dx = a.x - a.sx, dy = a.y - a.sy, len = Math.hypot(dx, dy); if (len < 12) return draw();
    const power = Math.min(len, 200) / 200 * 760 * a.pen.m; flick(a.pen, a.cx, a.cy, dx / len * power, dy / len * power);
  };
  c.onpointerup = release; c.onpointercancel = () => { aim = null; draw(); };
}
addEventListener('resize', () => sizeBench());

/* ---------- Screens ---------- */

const penPick = (p, i) => `<div class="pen-row" style="--dot:${playerColour(p.name, i)}">${playerDot(p.name, i)}<b>${esc(p.name)}</b><button type="button" class="pen-choice" data-action="cycle-pen" data-id="${p.id}" aria-label="${esc(p.name)}-এর কলম বদলান: এখন ${esc(PENS[p.pen].name)}"><img src="${penImg(p.pen)}" alt="" width="44" height="44"><span><b>${esc(PENS[p.pen].name)}</b><small>${esc(PENS[p.pen].note)}</small></span>${icon('arrow')}</button><button type="button" class="icon-btn" data-action="remove" data-id="${p.id}" aria-label="${esc(p.name)} বাদ দিন">${icon('close')}</button></div>`;

function setup() {
  return `${pageHead('কলম যুদ্ধ', 'বেঞ্চের ওপর কলমের লড়াই', 'নিজের কলম টোকা দিয়ে অন্যের কলম বেঞ্চ থেকে ফেলে দিন। বেঞ্চে শেষ যে কলম থাকবে, রাউন্ড তার।')}
  <div class="pen-shelf">${PEN_KEYS.map(k => `<figure><img src="${penImg(k)}" alt="" width="72" height="72"><figcaption><b>${esc(PENS[k].name)}</b><small>${esc(PENS[k].note)}</small></figcaption></figure>`).join('')}</div>
  <section class="pen-setup" id="players"><h2>খেলোয়াড় (২–৪ জন)</h2>
  <form id="name-form" class="name-form"><input id="player-name" maxlength="20" autocomplete="off" placeholder="নাম লিখুন" aria-label="খেলোয়াড়ের নাম" ${s.players.length >= 4 ? 'disabled' : ''}><button class="btn primary" type="submit" ${s.players.length >= 4 ? 'disabled' : ''}>${icon('plus')}যোগ করুন</button></form>
  <div class="pen-list">${s.players.map(penPick).join('')}</div>
  <p class="pen-hint">কলমের ছবিতে চাপ দিলে কলম বদলাবে। এক ম্যাচে ${bn(ROUNDS)} রাউন্ড, পরে চাইলে আরও খেলা যাবে।</p>
  ${button('খেলা শুরু', 'start', 'primary wide', 'play', s.players.length < 2 ? 'disabled' : '')}</section>`;
}
function play() {
  const r = s.round, p = byId(r.turn), i = s.players.indexOf(p);
  return `<div class="pen-turn" style="--dot:${playerColour(p.name, i)}">${playerDot(p.name, i)}<span><b>${esc(p.name)}-এর চাল</b><small>${r.moving ? 'কলম চলছে…' : 'নিজের কলম ধরে পেছনে টেনে ছেড়ে দিন'}</small></span><span class="pen-round">রাউন্ড ${bn(s.set.rounds + 1)}/${bn(s.set.total)}</span></div>
  <div class="bench-wrap"><canvas id="bench" aria-label="বেঞ্চ: ${s.round.pens.filter(q => !q.out).map(q => byId(q.pid).name).join(', ')}-এর কলম আছে"></canvas></div>
  <div class="pen-scores">${s.players.map((q, k) => `<span class="${r.pens.find(x => x.pid === q.id)?.out ? 'is-out' : ''}">${playerDot(q.name, k)}${esc(q.name)} <b>${bn(q.score)}</b></span>`).join('')}</div>`;
}
const table = () => rankTable(s.players.map(p => ({ name: p.name, score: p.score, history: (p.history || []).map(h => ({ ...h })) })), labels);
const labels = { caption: 'ম্যাচের ফল', rank: '#', player: 'খেলোয়াড় · শেষ পাঁচ রাউন্ড', points: 'পয়েন্ট', win: 'সবুজ: রাউন্ড জয়', loss: 'লাল: কলম পড়ে গেছে', order: 'নতুনটি বাঁ দিকে', empty: 'এখনও কোনো রাউন্ড শেষ হয়নি।', noGames: 'এখনও খেলেননি', number: bn };
function roundOver() {
  const w = s.lastWinner && byId(s.lastWinner), done = s.set.rounds >= s.set.total;
  return `${pageHead(`রাউন্ড ${bn(s.set.rounds)} শেষ`, w ? `${esc(w.name)}-এর কলম টিকে গেছে` : 'সব কলম পড়ে গেছে', w ? `${esc(PENS[w.pen].name)} বেঞ্চে শেষ পর্যন্ত ছিল। +২ পয়েন্ট।` : 'এই রাউন্ডে কেউ জেতেনি।')}
  ${w ? `<div class="result-portrait win pen-winner"><img src="${penImg(w.pen)}" alt="" width="112" height="112"></div>` : ''}
  <section class="rank-section"><h2>ম্যাচের পয়েন্ট</h2>${table()}</section>
  <div class="pen-actions">${done ? button('আরও এক রাউন্ড', 'more', 'secondary', 'plus') : button('পরের রাউন্ড', 'next', 'primary', 'arrow')}${button('ম্যাচ শেষ', 'end', done ? 'primary' : 'text', 'trophy')}</div>`;
}
function rules() {
  return `${pageHead('নিয়ম', 'কলম যুদ্ধ', '')}<ol class="plain-rules">
  <li>প্রত্যেকে একটা কলম বেছে নিন। কলমের ওজন আর দৈর্ঘ্য আলাদা।</li>
  <li>যার চাল, সে নিজের কলমে আঙুল রেখে পেছনে টেনে ছেড়ে দেবে। যত বেশি টানবেন, তত জোরে যাবে।</li>
  <li>কলমের মাঝখান বেঞ্চের কিনারা পার হলে কলম পড়ে গেছে।</li>
  <li>অন্যের কলম ফেললে +১, রাউন্ডে শেষ পর্যন্ত টিকে থাকলে +২।</li>
  <li>নিজের কলম নিজে ফেলে দিলে কোনো পয়েন্ট নেই।</li>
  <li>এক ম্যাচে ${bn(ROUNDS)} রাউন্ড। মোট পয়েন্টে ম্যাচের র‍্যাঙ্কিং।</li></ol>`;
}
function ranking() {
  const list = readHistory(), rows = overallRanking(list, 'pen').map(r => ({ name: r.name, score: r.points, note: bn(r.matches) + 'টি ম্যাচ', history: r.recent.map(h => ({ won: h.won, img: h.img || penImg('pinpoint'), label: h.label || '' })) }));
  return `${pageHead('র‍্যাঙ্কিং', 'কলম যুদ্ধ', 'শেষ হওয়া প্রতিটি ম্যাচের মোট পয়েন্ট।')}
  ${s.set?.rounds ? `<section class="rank-section"><h2>চলমান ম্যাচ</h2>${table()}</section>` : ''}
  <section class="rank-section"><h2>সব ম্যাচ মিলিয়ে</h2>${rankTable(rows, labels)}</section>
  <section class="fame-section"><h2>${icon('trophy')}হল অব ফেম</h2><p>শেষ ১০০টি ম্যাচে এক ম্যাচে সবচেয়ে বেশি পয়েন্ট।</p>${fameTable(hallOfFame(list, 'pen'), { caption: 'হল অব ফেম', player: 'খেলোয়াড়', points: 'পয়েন্ট', empty: 'এখনও কেউ হল অব ফেমে ওঠেননি।', number: bn, meta: e => new Date(e.date).toLocaleDateString('bn-BD') + ' · ' + bn(e.games) + 'টি রাউন্ড' })}</section>
  <a class="btn secondary wide" href="ranking.html?game=pen">${icon('trophy')}সব খেলার র‍্যাঙ্কিং</a>`;
}
const button = (label, action, cls, ic, extra = '') => `<button type="button" class="btn ${cls}" data-action="${action}" ${extra}>${icon(ic)}${label}</button>`;

function screenKey() { return view + s.phase + (s.set?.rounds || 0); }
function render() {
  const key = screenKey(), changed = key !== lastScreen; lastScreen = key;
  const body = view === 'rules' ? rules() : view === 'ranking' ? ranking() : s.phase === 'play' ? play() : s.phase === 'roundover' ? roundOver() : setup();
  $('#app').innerHTML = appShell({ brand: 'কলম যুদ্ধ', brandSub: 'বেঞ্চের খেলা', brandIcon: 'edit', brandAction: 'tab-play', crumb: view === 'rules' ? 'নিয়ম' : view === 'ranking' ? 'র‍্যাঙ্কিং' : s.phase === 'setup' ? 'কলম বাছাই' : `রাউন্ড ${bn(s.set.rounds + (s.phase === 'play' ? 1 : 0))}`, active: view, contentClass: 'game-content pen-content', labels: { back: 'সব খেলা', menu: 'মেনু', sections: 'খেলার অংশ' },
    tabs: [{ id: 'play', label: 'খেলা', icon: 'play', action: 'tab-play' }, { id: 'rules', label: 'নিয়ম', icon: 'book', action: 'tab-rules' }, { id: 'ranking', label: 'র‍্যাঙ্কিং', icon: 'trophy', action: 'tab-ranking' }], body });
  $$('[data-action]').forEach(el => el.onclick = e => { e.preventDefault(); act(el.dataset.action, el.dataset.id); });
  $('#name-form')?.addEventListener('submit', e => {
    e.preventDefault(); const name = $('#player-name').value.trim().replace(/\s+/g, ' ');
    if (!name) return; if (s.players.some(p => p.name.toLocaleLowerCase() === name.toLocaleLowerCase())) return toast('এই নাম আগেই আছে।');
    s.players.push({ id: crypto.randomUUID(), name, pen: PEN_KEYS[s.players.length % PEN_KEYS.length], score: 0, history: [] }); save(); render(); $('#player-name')?.focus();
  });
  if (view === 'play' && s.phase === 'play') { bindBench(); if (s.round.moving) loop(); }
  if (changed) enterScreen($('#screen'));
}
function transition() { const el = $('#screen'); el ? leaveScreen(el, render) : render(); }

function startRound() { placePens(s.players[s.set.rounds % s.players.length].id); s.phase = 'play'; save(); transition(); }
async function act(action, id) {
  switch (action) {
    case 'tab-play': case 'tab-rules': case 'tab-ranking': { const next = action.slice(4); if (view === next) return; view = next; return transition(); }
    case 'app-menu': return openMenu();
    case 'games': location.href = 'index.html'; return;
    case 'cycle-pen': { const p = byId(id); p.pen = PEN_KEYS[(PEN_KEYS.indexOf(p.pen) + 1) % PEN_KEYS.length]; save(); return render(); }
    case 'remove': s.players = s.players.filter(p => p.id !== id); save(); return render();
    case 'start': if (s.players.length < 2) return; s.players.forEach(p => { p.score = 0; p.history = []; }); s.set = { id: crypto.randomUUID(), total: ROUNDS, rounds: 0 }; return startRound();
    case 'next': return startRound();
    case 'more': s.set.total++; return startRound();
    case 'end': case 'new':
      if (s.phase === 'setup') return;
      if (!await confirm('ম্যাচ শেষ করবেন?', 'ম্যাচের ফল র‍্যাঙ্কিংয়ে সেভ হবে, তারপর নতুন খেলা শুরু করা যাবে।')) return;
      if (s.set?.rounds) saveMatch({ id: s.set.id, game: 'pen', games: s.set.rounds, players: s.players.map(p => ({ name: p.name, points: p.score, recent: p.history || [] })) });
      stop(); s = { ...fresh(), players: s.players.map(p => ({ ...p, score: 0, history: [] })) }; save(); view = 'ranking'; return transition();
  }
}

/* ---------- Dialogs ---------- */

function toast(text) { const t = $('#toast'); t.textContent = text; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600); }
function closeOverlay() { $('#overlay').innerHTML = ''; modalResolve?.(false); modalResolve = null; }
function confirm(title, text) {
  return new Promise(resolve => {
    closeOverlay(); modalResolve = resolve;
    $('#overlay').innerHTML = `<div class="scrim"><section class="dialog" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="dialog-mark">${icon('trophy')}</div><h2>${esc(title)}</h2><p>${esc(text)}</p><div class="dialog-actions"><button class="btn primary" id="confirm-yes">হ্যাঁ, শেষ করুন</button><button class="btn secondary" id="confirm-no">খেলা চলুক</button></div></section></div>`;
    $('#confirm-yes').onclick = () => { modalResolve = null; $('#overlay').innerHTML = ''; resolve(true); };
    $('#confirm-no').onclick = closeOverlay; $('#confirm-no').focus();
  });
}
function openMenu() {
  closeOverlay();
  const items = [...(s.phase !== 'setup' ? [['ম্যাচ শেষ করুন', 'trophy', 'end', 'tone-danger']] : []), ['শব্দ: ' + (soundEnabled() ? 'চালু' : 'বন্ধ'), 'sound', 'sound', ''], ['সব খেলায় ফিরে যান', 'back', 'games', 'tone-quiet']];
  $('#overlay').innerHTML = `<div class="scrim"><section class="dialog app-menu-dialog" role="dialog" aria-modal="true" aria-labelledby="menu-title"><div class="picker-title"><h2 id="menu-title">মেনু</h2><button type="button" id="close-menu" class="icon-btn" aria-label="বন্ধ করুন">${icon('close')}</button></div><div class="app-menu-items">${items.map(([label, ic, a, tone]) => `<button class="btn secondary wide ${tone}" type="button" data-menu="${a}">${icon(ic)}${label}${icon('arrow')}</button>`).join('')}</div></section></div>`;
  $('#close-menu').onclick = closeOverlay;
  $$('[data-menu]').forEach(el => el.onclick = () => { const a = el.dataset.menu; closeOverlay(); if (a === 'sound') { toggleSound(); openMenu(); } else act(a); });
}
addEventListener('keydown', e => { if (e.key === 'Escape' && $('#overlay').innerHTML) closeOverlay(); });

// A roll interrupted by a reload resumes from where the pens were last saved.
if (s.round?.moving) { s.round.moving = false; s.round.pens.forEach(p => { p.vx = p.vy = p.w = 0; if (p.out) p.fall = 1; }); }
render();

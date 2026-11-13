import { sound, soundEnabled, toggleSound } from './sound.mjs';
import { saveMatch, readHistory, overallRanking, hallOfFame } from './history.mjs';
import { numberPick, bindNumberPick, esc, icon, appShell, pageHead, rankTable, fameTable, playerColour, playerDot, enterScreen, leaveScreen } from './ui-kit.mjs';
import { W, H, R, POWER, ends, step, resting, push, simulate } from './pen-physics.mjs';
import { PENS, PRO_PENS, GEAR, GEAR_KEYS, penStats, ratings, nextPrice } from './pen-gear.mjs';
import { readAccounts, ensureAccount, findAccount, addCoins, buyGear, toggleGear, fitted } from './accounts.mjs';

/* কলম যুদ্ধ: the school-bench pen fight. Players take turns flicking their own pen;
   a pen whose middle goes past the edge of the bench has fallen. Last pen on the bench wins the round.
   Every point won is also a coin for the player's account, spent in the shop on add-ons. */

const $ = q => document.querySelector(q), $$ = q => [...document.querySelectorAll(q)];
const bn = n => Number(n).toLocaleString('bn-BD');
const KEY = 'pen.v2', ROUNDS = 5;
const PEN_KEYS = Object.keys(PENS), penImg = k => `assets/pen/${k}.svg`;
const CPU = {
  easy: { label: 'সহজ', tries: 40, err: .25, gear: {} },
  medium: { label: 'মাঝারি', tries: 150, err: .1, gear: { gripper: 1 } },
  hard: { label: 'কঠিন', tries: 350, err: .04, gear: { gripper: 2, head: 1, tape: 1 } }
};

let s = load(), view = 'play', lastScreen = '', aim = null, raf = 0, modalResolve = null, shopFor = null;
let fx = [], shake = 0, banner = null;
// The round banner runs on the real clock, so nothing waits on screen repaints.
const bannerUp = () => { if (banner && performance.now() >= banner.until) banner = null; return !!banner; };

function fresh() { return { v: 2, phase: 'setup', mode: 'cpu', players: [], cpuLevel: 'medium', rounds: ROUNDS, set: null, round: null }; }
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY)); if (d?.v === 2) return d;
    // Players from the first version become accounts.
    const old = JSON.parse(localStorage.getItem('pen.v1'));
    if (old?.players) { const f = fresh(); f.players = old.players.map(p => { if (!p.cpu) try { ensureAccount(p.name); } catch { } return { ...p, score: 0, history: [] }; }); return f; }
  } catch { }
  return fresh();
}
function save() { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { } }
const byId = id => s.players.find(p => p.id === id);
const gearOf = p => p.cpu ? CPU[s.cpuLevel].gear : fitted(findAccount(p.name));

/* ---------- Bench ---------- */

function placePens(starter) {
  const n = s.players.length, pens = s.players.map((p, i) => {
    const t = Math.PI / 2 + (i / n) * Math.PI * 2, gear = gearOf(p);
    return { pid: p.id, x: W / 2 + Math.cos(t) * 120, y: H / 2 + Math.sin(t) * 150, a: t + Math.PI / 2 + (Math.random() - .5) * .7, vx: 0, vy: 0, w: 0, out: false, gear, ...penStats(p.pen, gear) };
  });
  s.round = { pens, turn: starter, out: [], moving: false };
}

const effects = {
  hit(x, y, speed) {
    if (speed < 40) return;
    const n = Math.min(14, 3 + speed / 70 | 0);
    for (let i = 0; i < n; i++) { const a = Math.random() * 7, v = 40 + Math.random() * speed * .25; fx.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: .5 + Math.random() * .3, max: .8, kind: 'dust' }); }
    shake = Math.max(shake, Math.min(9, speed / 90)); if (speed > 160) sound('hit');
  },
  out(p) { sound('out'); shake = 10; navigator.vibrate?.(60); fx.push({ x: Math.max(30, Math.min(W - 30, p.x)), y: Math.max(40, Math.min(H - 20, p.y)), vx: 0, vy: -40, life: 1.4, max: 1.4, kind: 'text', text: byId(p.pid).name + ' পড়ে গেল!' }); }
};

function flick(p, cx, cy, jx, jy) {
  push(p, cx, cy, jx, jy); s.round.moving = true;
  sound('notice'); loop();
}

function settle() {
  const r = s.round, shooter = byId(r.turn), fresh = r.out.filter(id => !r.counted?.includes(id));
  r.counted = [...(r.counted || []), ...fresh]; r.moving = false;
  const gain = fresh.filter(id => id !== shooter.id).length;
  if (gain) { shooter.score += gain; coins(shooter, gain); }
  const live = r.pens.filter(p => !p.out);
  if (live.length <= 1) return endRound(live[0]?.pid || null);
  const order = s.players.map(p => p.id), alive = new Set(live.map(p => p.pid));
  let i = order.indexOf(r.turn); do { i = (i + 1) % order.length; } while (!alive.has(order[i]));
  r.turn = order[i]; save(); render(); cpuTurn();
  if (fresh.length) toast(fresh.map(id => byId(id).name).join(' ও ') + ' বেঞ্চ থেকে পড়ে গেছে।' + (gain && !shooter.cpu ? ` ${shooter.name} +${bn(gain)} কয়েন।` : ''));
}
function coins(p, n) { if (!p.cpu && addCoins(p.name, n)) setTimeout(() => sound('coin'), 250); }

/* Computer opponent: tries many flicks on a copy of the bench, keeps the best, then shoots with some human error. */
function plan() {
  const r = s.round, me = r.pens.find(p => p.pid === r.turn), foes = r.pens.filter(p => !p.out && p.pid !== me.pid), lvl = CPU[s.cpuLevel];
  const edge = p => Math.min(p.x, W - p.x, p.y, H - p.y);
  let best = null;
  for (let n = 0; n < lvl.tries; n++) {
    const foe = foes[n % foes.length], t = .25 + Math.random() * .5, [a0, a1, b0, b1] = ends(me), cx = a0 + (b0 - a0) * t, cy = a1 + (b1 - a1) * t;
    const [f0, f1, g0, g1] = ends(foe), u = Math.random(), tx = f0 + (g0 - f0) * u, ty = f1 + (g1 - f1) * u, d = Math.hypot(tx - cx, ty - cy) || 1;
    const force = (.5 + Math.random() * .5) * POWER * me.m, shot = { cx, cy, jx: (tx - cx) / d * force, jy: (ty - cy) / d * force };
    const sim = JSON.parse(JSON.stringify(r)), sm = sim.pens.find(p => p.pid === me.pid); push(sm, cx, cy, shot.jx, shot.jy); simulate(sim);
    const out = sim.pens.filter(p => p.out && p.pid !== me.pid).length, score = out * 100 - (sm.out ? 160 : 0) + sim.pens.filter(p => !p.out && p.pid !== me.pid).reduce((a, p) => a - edge(p) * .15, 0) + (sm.out ? 0 : edge(sm) * .1);
    if (!best || score > best.score) best = { ...shot, score };
  }
  const err = (Math.random() - .5) * lvl.err * 2, c = Math.cos(err), sn = Math.sin(err);
  return { ...best, jx: best.jx * c - best.jy * sn, jy: best.jx * sn + best.jy * c };
}
let cpuTimer = 0;
function cpuTurn() {
  clearTimeout(cpuTimer);
  if (s.phase !== 'play' || view !== 'play' || s.round.moving || !byId(s.round.turn)?.cpu) return;
  // Wait until the round banner has gone, so the computer never shoots under it.
  cpuTimer = setTimeout(() => {
    if (s.phase !== 'play' || view !== 'play' || s.round.moving || !byId(s.round.turn)?.cpu) return;
    if (bannerUp()) return cpuTurn();
    const me = s.round.pens.find(p => p.pid === s.round.turn), shot = plan(), len = Math.hypot(shot.jx, shot.jy), pull = len / (POWER * me.m) * 200;
    aim = { pen: me, cx: shot.cx, cy: shot.cy, x: shot.cx, y: shot.cy, sx: shot.cx - shot.jx / len * pull, sy: shot.cy - shot.jy / len * pull }; loop();
    setTimeout(() => { aim = null; flick(me, shot.cx, shot.cy, shot.jx, shot.jy); }, 700);
  }, bannerUp() ? 400 : 750);
}
function endRound(winner) {
  if (winner) { byId(winner).score += 2; coins(byId(winner), 2); }
  for (const p of s.players) { p.history = [{ won: p.id === winner, img: penImg(p.pen), label: `${PENS[p.pen].name} · ${p.id === winner ? 'রাউন্ড জয়' : 'পড়ে গেছে'}` }, ...(p.history || [])].slice(0, 5); }
  s.set.rounds++; s.lastWinner = winner; s.phase = 'roundover'; save(); sound(winner ? 'win' : 'notice');
  setTimeout(transition, 500);
}

/* ---------- Drawing ---------- */

// The bench is drawn once per size into its own canvas: rough old wood with what students scratch into it.
const CARVINGS = [['রনি + মিতু', 70, 120, -.12, 20], ['পরীক্ষা কবে?', 330, 210, .08, 17], ['৯ম শ্রেণি খ শাখা', 120, 560, -.05, 16], ['আমি পাস করবই', 300, 680, .1, 18], ['বাংলা ১ম পত্র', 360, 430, -.2, 15], ['টিফিনে মাঠে', 110, 330, .14, 16], ['স্যার আসছে!!', 290, 70, -.06, 17], ['A + B = ♥', 400, 300, .25, 15], ['২+২=৫', 60, 700, -.3, 16], ['রোল ৩৭', 230, 470, .04, 14]];
let deskCache = null;
function drawDesk(g) {
  const k = g.getTransform().a, size = Math.round(W * k);
  if (deskCache?.size !== size) {
    const c = document.createElement('canvas'); c.width = size; c.height = Math.round(H * k); const d = c.getContext('2d'); d.scale(k, k);
    let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const wood = d.createLinearGradient(0, 0, W, H); wood.addColorStop(0, '#a87346'); wood.addColorStop(.5, '#946036'); wood.addColorStop(1, '#7c4c27');
    d.fillStyle = wood; d.fillRect(0, 0, W, H);
    d.strokeStyle = '#5b3414'; d.lineWidth = 1.3;
    for (let y = 8; y < H; y += 11) { d.globalAlpha = .1 + rnd() * .14; d.beginPath(); d.moveTo(0, y); for (let x = 0; x <= W; x += 24) d.lineTo(x, y + Math.sin((x + y * 3) / 61) * 6 + rnd() * 2); d.stroke(); }
    for (let i = 0; i < 2600; i++) { d.globalAlpha = .05 + rnd() * .12; d.fillStyle = rnd() > .5 ? '#3b1f08' : '#d9a877'; d.fillRect(rnd() * W, rnd() * H, 1 + rnd() * 2, 1 + rnd() * 1.5); }
    d.strokeStyle = '#3b1f08'; d.lineWidth = 1;
    for (let i = 0; i < 70; i++) { const x = rnd() * W, y = rnd() * H, a = rnd() * 7, l = 8 + rnd() * 40; d.globalAlpha = .15 + rnd() * .2; d.beginPath(); d.moveTo(x, y); d.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); d.stroke(); }
    for (const [x, y, rx, ry] of [[92, 470, 30, 17], [380, 150, 18, 11], [250, 740, 22, 9]]) { d.globalAlpha = .22; d.fillStyle = '#16244d'; d.beginPath(); d.ellipse(x, y, rx, ry, .5, 0, 7); d.fill(); }
    d.globalAlpha = .55; d.fillStyle = '#4a2a0e'; for (const [x, y, r] of [[420, 610, 9], [40, 260, 6]]) { d.beginPath(); d.ellipse(x, y, r, r * .7, .3, 0, 7); d.fill(); }
    d.textAlign = 'center';
    for (const [t, x, y, a, f] of CARVINGS) { d.save(); d.translate(x, y); d.rotate(a); d.font = `600 ${f}px Poppins, sans-serif`; d.globalAlpha = .4; d.strokeStyle = '#2e1806'; d.lineWidth = 1.6; d.strokeText(t, 0, 0); d.globalAlpha = .25; d.strokeStyle = '#e0b07a'; d.lineWidth = .8; d.strokeText(t, .8, .8); d.restore(); }
    d.globalAlpha = .4; d.strokeStyle = '#2e1806'; d.lineWidth = 1.6; d.save(); d.translate(390, 520); d.rotate(.1);
    for (const v of [12, 24]) { d.beginPath(); d.moveTo(v, 0); d.lineTo(v, 36); d.moveTo(0, v); d.lineTo(36, v); d.stroke(); }
    d.beginPath(); d.arc(6, 6, 4, 0, 7); d.moveTo(14, 26); d.lineTo(22, 34); d.moveTo(22, 26); d.lineTo(14, 34); d.stroke(); d.restore();
    // Lamp light from the classroom window, and a darker rim near the edges so the drop feels real.
    d.globalAlpha = 1; const light = d.createRadialGradient(W * .3, H * .25, 40, W * .5, H * .5, H * .75); light.addColorStop(0, '#fff3d02e'); light.addColorStop(1, '#00000038'); d.fillStyle = light; d.fillRect(0, 0, W, H);
    d.strokeStyle = '#4a280c'; d.lineWidth = 7; d.strokeRect(3.5, 3.5, W - 7, H - 7);
    deskCache = { size, c };
  }
  g.drawImage(deskCache.c, 0, 0, W, H);
}

/* A pen lying flat: nib on the left (-L/2), cap on the right. Add-ons are drawn on it. */
export function paintPen(g, penKey, gear, L, colour, active, f = 1) {
  const spec = PENS[penKey] || PENS.pinpoint, gr = gear || {};
  const body0 = -L / 2 + 15, body1 = L / 2 - (gr.back ? 16 : 0), capL = (body1 - body0) * .32;
  g.fillStyle = '#0000002e'; g.beginPath(); g.roundRect(-L / 2 + 3, -R + 4, L, R * 2, R); g.fill();
  if (active) { g.strokeStyle = colour; g.lineWidth = 4; g.globalAlpha = f * .85; g.beginPath(); g.roundRect(-L / 2 - 6, -R - 6, L + 12, R * 2 + 12, R + 6); g.stroke(); g.globalAlpha = f; }
  const nib = (x0, dir, brass) => { g.fillStyle = brass ? '#c9a13b' : '#d9c9a8'; g.beginPath(); g.moveTo(x0, 0); g.lineTo(x0 + 16 * dir, -R + 2); g.lineTo(x0 + 16 * dir, R - 2); g.closePath(); g.fill(); if (brass) { g.fillStyle = '#f3dc8a'; g.fillRect(x0 + 6 * dir - (dir < 0 ? 4 : 0), -2, 4, 2); } g.fillStyle = '#222'; g.beginPath(); g.arc(x0 + dir, 0, 1.6, 0, 7); g.fill(); };
  nib(-L / 2, 1, gr.head);
  if (gr.back) nib(L / 2, -1, false);
  g.fillStyle = spec.body; g.strokeStyle = '#00000040'; g.lineWidth = 1; g.beginPath(); g.roundRect(body0, -R, body1 - body0 - capL + 2, R * 2, 2); g.fill(); g.stroke();
  g.fillStyle = spec.cap; g.beginPath(); g.roundRect(body1 - capL, -R - 1, capL, R * 2 + 2, 4); g.fill(); g.stroke();
  // Grippers: ribbed rubber bands near the nib.
  for (let i = 0; i < (gr.gripper || 0); i++) { const x = body0 + 2 + i * 12; g.fillStyle = '#2f3a33'; g.beginPath(); g.roundRect(x, -R - 1.5, 10, R * 2 + 3, 3); g.fill(); g.strokeStyle = '#5d6b61'; g.lineWidth = 1; for (let k = 2; k < 10; k += 3) { g.beginPath(); g.moveTo(x + k, -R); g.lineTo(x + k, R); g.stroke(); } }
  if (gr.tape) { g.save(); g.beginPath(); g.rect(body0 + 38, -R, 34, R * 2); g.clip(); g.fillStyle = '#f1e7b3aa'; g.fillRect(body0 + 38, -R, 34, R * 2); g.strokeStyle = '#c9b56e'; for (let k = -10; k < 44; k += 6) { g.beginPath(); g.moveTo(body0 + 38 + k, -R); g.lineTo(body0 + 46 + k, R); g.stroke(); } g.restore(); }
  if (gr.clip) { g.fillStyle = '#c7ccd2'; g.strokeStyle = '#7b8189'; g.beginPath(); g.roundRect(body1 - capL + 3, -R - 4.5, capL * .78, 3.6, 1.5); g.fill(); g.stroke(); }
  else { g.fillStyle = spec.cap; g.fillRect(body1 - capL * .82, -R - 4, capL * .7, 3.5); }
  if (gr.rubber) { g.fillStyle = '#ef8fa3'; g.strokeStyle = '#b4566b'; g.beginPath(); g.roundRect(body1 - 7, -R - 1.5, 9, R * 2 + 3, 3); g.fill(); g.stroke(); }
  const shine = g.createLinearGradient(0, -R, 0, R); shine.addColorStop(0, '#ffffffaa'); shine.addColorStop(.45, '#ffffff00'); shine.addColorStop(1, '#00000030');
  g.fillStyle = shine; g.beginPath(); g.roundRect(body0, -R, body1 - body0, R * 2, 3); g.fill();
  g.fillStyle = colour; g.beginPath(); g.arc(body1 - capL * .45, 0, 3.4, 0, 7); g.fill();
}
function drawPen(g, p, colour, active) {
  const f = p.out ? 1 - (p.fall || 0) : 1; if (f <= 0) return;
  g.save(); g.translate(p.x, p.y); g.rotate(p.a); g.scale(f, f); g.globalAlpha = f;
  paintPen(g, byId(p.pid)?.pen, p.gear, p.L, colour, active, f);
  g.restore();
}
function draw() {
  const c = $('#bench'); if (!c || !s.round) return;
  const g = c.getContext('2d'), k = c.width / W, sx = shake ? (Math.random() - .5) * shake : 0, sy = shake ? (Math.random() - .5) * shake : 0;
  g.setTransform(k, 0, 0, k, 0, 0); g.fillStyle = '#3b210c'; g.fillRect(0, 0, W, H); g.setTransform(k, 0, 0, k, sx * k, sy * k); drawDesk(g);
  const r = s.round, idx = id => s.players.findIndex(p => p.id === id);
  for (const p of r.pens) drawPen(g, p, playerColour(byId(p.pid).name, idx(p.pid)), !r.moving && p.pid === r.turn && !p.out);
  for (const p of r.pens) if (!p.out) { const n = byId(p.pid).name; g.font = '600 12px Poppins, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#fffaf0'; g.strokeStyle = '#3b210c'; g.lineWidth = 3; g.strokeText(n, p.x, p.y - 22); g.fillText(n, p.x, p.y - 22); }
  for (const e of fx) {
    const t = e.life / e.max;
    if (e.kind === 'dust') { g.globalAlpha = t * .8; g.fillStyle = '#f3dfbf'; g.beginPath(); g.arc(e.x, e.y, 1.5 + (1 - t) * 2.5, 0, 7); g.fill(); }
    else { g.globalAlpha = Math.min(1, t * 2); g.font = '700 20px Poppins, sans-serif'; g.textAlign = 'center'; g.lineWidth = 5; g.strokeStyle = '#3b210c'; g.fillStyle = '#ffd34d'; g.strokeText(e.text, e.x, e.y); g.fillText(e.text, e.x, e.y); }
  }
  g.globalAlpha = 1;
  if (aim) {
    const dx = aim.sx - aim.x, dy = aim.sy - aim.y, len = Math.min(Math.hypot(dx, dy), 200), u = Math.hypot(dx, dy) || 1, ex = aim.cx - dx / u * len * .9, ey = aim.cy - dy / u * len * .9, pct = len / 200;
    g.setLineDash([6, 6]); g.strokeStyle = '#fffaf0'; g.lineWidth = 3; g.beginPath(); g.moveTo(aim.cx, aim.cy); g.lineTo(ex, ey); g.stroke(); g.setLineDash([]);
    g.fillStyle = pct > .75 ? '#e5533d' : pct > .4 ? '#f2c230' : '#7bd389'; g.beginPath(); g.arc(ex, ey, 6, 0, 7); g.fill();
    g.strokeStyle = '#ffffff88'; g.lineWidth = 2; g.beginPath(); g.arc(aim.cx, aim.cy, 10 + len / 6, 0, 7); g.stroke();
    // Power bar along the bottom of the bench.
    g.fillStyle = '#00000066'; g.beginPath(); g.roundRect(W / 2 - 90, H - 34, 180, 14, 7); g.fill();
    g.fillStyle = pct > .75 ? '#e5533d' : pct > .4 ? '#f2c230' : '#7bd389'; g.beginPath(); g.roundRect(W / 2 - 88, H - 32, 176 * pct, 10, 5); g.fill();
    g.font = '600 12px Poppins, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#fffaf0'; g.fillText('জোর ' + bn(Math.round(pct * 100)) + '%', W / 2, H - 42);
  }
  if (bannerUp()) {
    const t = (banner.until - performance.now()) / 1600, a = Math.min(1, t * 3, (1 - t) * 6 + .2);
    g.globalAlpha = a * .55; g.fillStyle = '#1b0f05'; g.fillRect(0, H / 2 - 50, W, 100); g.globalAlpha = a;
    g.font = '700 34px Poppins, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#ffd34d'; g.fillText(banner.text, W / 2, H / 2 + 4);
    g.font = '500 15px Poppins, sans-serif'; g.fillStyle = '#fffaf0'; g.fillText(banner.sub, W / 2, H / 2 + 32); g.globalAlpha = 1;
  }
}
// Next frame: a repaint when the browser gives one, otherwise a timer, so a paused screen never stalls the game.
const next = f => {
  let done = false; const go = () => { if (done) return; done = true; cancelAnimationFrame(h.a); clearTimeout(h.b); f(performance.now()); };
  const h = { a: document.hidden ? 0 : requestAnimationFrame(go), b: setTimeout(go, document.hidden ? 50 : 100) }; return h;
};
const stop = () => { if (raf) { cancelAnimationFrame(raf.a); clearTimeout(raf.b); } };
let loopGen = 0;
function loop() {
  stop(); let last = performance.now(); const gen = ++loopGen;
  const tick = now => {
    if (gen !== loopGen) return;
    // Catch up on the real time that passed (slow phones, background tabs) in small fixed steps.
    const dt = Math.min(3, (now - last) / 1000), n = Math.ceil(dt / .004); last = now;
    for (const e of fx) { e.life -= dt; e.x += e.vx * dt; e.y += e.vy * dt; e.vx *= .92; e.vy *= .92; }
    fx = fx.filter(e => e.life > 0); shake = shake > .3 ? shake * Math.pow(.02, dt) : 0;
    bannerUp();
    if (s.round?.moving) { for (let i = 0; i < n && !resting(s.round); i++) step(s.round, dt / n, effects); if (resting(s.round)) { draw(); settle(); if (gen !== loopGen) return; } }
    if (!$('#bench')) return;
    draw(); if (s.round?.moving || aim || fx.length || shake || banner) raf = next(tick);
  };
  raf = next(tick);
}
function sizeBench() {
  const c = $('#bench'); if (!c) return;
  // Fit the bench between its own top and the bottom tab bar, leaving room for the scores under it.
  const box = c.parentElement.getBoundingClientRect(), tabs = $('.kit-tabs')?.getBoundingClientRect(), bottom = tabs && getComputedStyle($('.kit-tabs')).display !== 'none' ? tabs.top : innerHeight;
  const maxH = Math.max(320, bottom - Math.max(0, box.top) - 64), cssW = Math.min(box.width, maxH * W / H), dpr = devicePixelRatio || 1;
  c.style.width = cssW + 'px'; c.style.height = cssW * H / W + 'px'; c.width = Math.round(cssW * dpr); c.height = Math.round(cssW * H / W * dpr); draw();
}
function bindBench() {
  const c = $('#bench'); if (!c) return; sizeBench();
  const toWorld = e => { const b = c.getBoundingClientRect(); return [(e.clientX - b.left) / b.width * W, (e.clientY - b.top) / b.height * H]; };
  c.onpointerdown = e => {
    if (s.round.moving || byId(s.round.turn)?.cpu) return; const p = s.round.pens.find(q => q.pid === s.round.turn && !q.out); if (!p) return;
    const [x, y] = toWorld(e), [a0, a1, b0, b1] = ends(p), ux = b0 - a0, uy = b1 - a1, t = Math.max(0, Math.min(1, ((x - a0) * ux + (y - a1) * uy) / (ux * ux + uy * uy))), cx = a0 + ux * t, cy = a1 + uy * t;
    if (Math.hypot(x - cx, y - cy) > 34) return toast(`${byId(p.pid).name}-এর কলম ধরে টেনে ছাড়ুন।`);
    aim = { pen: p, cx, cy, x, y, sx: x, sy: y }; c.setPointerCapture(e.pointerId); loop();
  };
  c.onpointermove = e => { if (!aim) return; [aim.sx, aim.sy] = toWorld(e); };
  const release = () => {
    if (!aim) return; const a = aim; aim = null;
    const dx = a.x - a.sx, dy = a.y - a.sy, len = Math.hypot(dx, dy); if (len < 12) return draw();
    const power = Math.min(len, 200) / 200 * POWER * a.pen.m; flick(a.pen, a.cx, a.cy, dx / len * power, dy / len * power);
  };
  c.onpointerup = release; c.onpointercancel = () => { aim = null; draw(); };
}
addEventListener('resize', () => sizeBench());

/* ---------- Screens ---------- */

const stars = n => `<span class="stars" aria-label="৫-এর মধ্যে ${bn(n)}">${'●'.repeat(n)}<i>${'●'.repeat(5 - n)}</i></span>`;
const statLine = (pen, gear) => { const r = ratings(pen, gear); return `<span class="pen-stats"><span>ওজন ${stars(r.weight)}</span><span>গ্রিপ ${stars(r.grip)}</span><span>নাগাল ${stars(r.reach)}</span></span>`; };
// Small drawings for the shop shelf.
const GEAR_ART = {
  gripper: '<svg viewBox="0 0 64 64"><rect x="8" y="26" width="48" height="12" rx="6" fill="#f4f6f8" stroke="#00000033"/><rect x="14" y="23" width="10" height="18" rx="3" fill="#2f3a33"/><rect x="27" y="23" width="10" height="18" rx="3" fill="#2f3a33"/><rect x="40" y="23" width="10" height="18" rx="3" fill="#2f3a33"/><path d="M17 24v16M20 24v16M30 24v16M33 24v16M43 24v16M46 24v16" stroke="#5d6b61"/></svg>',
  head: '<svg viewBox="0 0 64 64"><path d="M6 32 26 22v20Z" fill="#c9a13b"/><rect x="24" y="24" width="34" height="16" rx="4" fill="#fdf7e6" stroke="#00000033"/><circle cx="7" cy="32" r="2" fill="#222"/><path d="M12 30h8" stroke="#f3dc8a" stroke-width="2"/></svg>',
  back: '<svg viewBox="0 0 64 64"><path d="M4 32 18 24v16Z" fill="#d9c9a8"/><path d="M60 32 46 24v16Z" fill="#d9c9a8"/><rect x="17" y="25" width="30" height="14" rx="3" fill="#6ec3e8" stroke="#00000033"/></svg>',
  tape: '<svg viewBox="0 0 64 64"><rect x="6" y="26" width="52" height="12" rx="5" fill="#dfe9ef" stroke="#00000033"/><rect x="20" y="24" width="24" height="16" fill="#f1e7b3"/><path d="M20 40l8-16M27 40l8-16M34 40l8-16" stroke="#c9b56e"/><circle cx="50" cy="14" r="9" fill="none" stroke="#c9b56e" stroke-width="5"/></svg>',
  rubber: '<svg viewBox="0 0 64 64"><rect x="6" y="26" width="40" height="12" rx="5" fill="#f4f6f8" stroke="#00000033"/><rect x="44" y="23" width="14" height="18" rx="4" fill="#ef8fa3" stroke="#b4566b"/><path d="M52 14l4-6M58 18l5-3" stroke="#e5533d" stroke-width="2" stroke-linecap="round"/></svg>',
  clip: '<svg viewBox="0 0 64 64"><rect x="6" y="28" width="52" height="12" rx="5" fill="#1d4fa3"/><path d="M30 26h24a3 3 0 0 1 0 6H34" fill="none" stroke="#7b8189" stroke-width="3"/><rect x="30" y="22" width="26" height="5" rx="2" fill="#c7ccd2"/></svg>'
};
const gearCount = gear => Object.values(gear || {}).reduce((a, b) => a + b, 0);

const humans = () => s.players.filter(p => !p.cpu);
const vsCpu = () => s.mode === 'cpu';
function playerCard(p, i) {
  const acc = !p.cpu && findAccount(p.name), gear = gearOf(p), k = PEN_KEYS.indexOf(p.pen);
  return `<article class="pc" style="--dot:${playerColour(p.name, i)}"><header>${playerDot(p.name, i)}<span><b>${esc(p.name)}</b><small>${p.cpu ? 'প্রতিপক্ষ' : `${bn(acc?.coins || 0)} কয়েন${gearCount(gear) ? ' · ' + bn(gearCount(gear)) + 'টি জিনিস লাগানো' : ''}`}</small></span>${p.cpu ? '' : `<button type="button" class="icon-btn" data-action="remove" data-id="${p.id}" aria-label="${esc(p.name)} বাদ দিন">${icon('close')}</button>`}</header>
  <div class="pc-pen"><button type="button" class="pc-arrow" data-action="prev-pen" data-id="${p.id}" aria-label="আগের কলম">‹</button><img src="${penImg(p.pen)}" alt="" width="64" height="64"><span><b>${esc(PENS[p.pen].name)}</b><small>${esc(PENS[p.pen].note)}</small>${statLine(p.pen, gear)}</span><button type="button" class="pc-arrow" data-action="cycle-pen" data-id="${p.id}" aria-label="পরের কলম">›</button></div>
  <small class="pc-count">কলম ${bn(k + 1)}/${bn(PEN_KEYS.length)}</small>
  ${p.cpu ? `<div class="cpu-level" role="radiogroup" aria-label="কম্পিউটার কতটা কঠিন">${Object.entries(CPU).map(([key, c]) => `<button type="button" role="radio" aria-checked="${s.cpuLevel === key}" class="${s.cpuLevel === key ? 'is-on' : ''}" data-action="cpu-level" data-id="${key}">${c.label}</button>`).join('')}</div>` : `<button type="button" class="btn secondary wide pc-shop" data-action="shop" data-id="${acc?.id || ''}">${icon('spark')}দোকান: গ্রিপার, ভারী মাথা…</button>`}</article>`;
}
function accountChips() {
  const here = new Set(s.players.map(p => p.name.toLocaleLowerCase())), list = readAccounts().filter(a => !here.has(a.name.toLocaleLowerCase()));
  return list.length ? `<div class="acc-chips"><span>আগের অ্যাকাউন্ট:</span>${list.map(a => `<button type="button" class="acc-chip" data-action="add-acc" data-id="${a.id}">${playerDot(a.name)}${esc(a.name)}<small>${bn(a.coins)}</small></button>`).join('')}</div>` : '';
}
function setup() {
  const need = vsCpu() ? 1 : 2, room = vsCpu() ? humans().length < 1 : humans().length < 4, ready = humans().length >= need;
  return `<header class="pen-head"><img src="assets/pen/cover.svg" alt="" width="640" height="420"><div><h1>কলম যুদ্ধ</h1><p>বেঞ্চে কলম টোকা দিয়ে অন্যের কলম ফেলে দিন। শেষ পর্যন্ত যার কলম টিকে থাকে, রাউন্ড তার।</p></div></header>
  <ol class="pen-steps">
  <li><h2><i>১</i>কার সাথে খেলবেন?</h2><div class="pen-modes" role="radiogroup" aria-label="কার সাথে খেলবেন">
   <button type="button" role="radio" aria-checked="${vsCpu()}" class="${vsCpu() ? 'is-on' : ''}" data-action="mode" data-id="cpu">${icon('person')}<b>কম্পিউটারের সাথে</b><small>একা খেলুন</small></button>
   <button type="button" role="radio" aria-checked="${!vsCpu()}" class="${vsCpu() ? '' : 'is-on'}" data-action="mode" data-id="friends">${icon('people')}<b>বন্ধুদের সাথে</b><small>২–৪ জন, এক ফোনে পালা করে</small></button></div></li>
  <li><h2><i>২</i>${vsCpu() ? 'আপনার নাম' : 'খেলোয়াড়দের নাম'}</h2>
   ${room ? `<form id="name-form" class="name-form"><input id="player-name" maxlength="20" autocomplete="off" placeholder="নাম লিখুন" aria-label="খেলোয়াড়ের নাম"><button class="btn primary" type="submit">${icon('plus')}যোগ</button></form>${accountChips()}<p class="pen-hint">নাম দিলেই অ্যাকাউন্ট খুলে যায়। জেতা পয়েন্ট কয়েন হয়ে জমে।</p>` : `<p class="pen-hint">${humans().map(p => esc(p.name)).join(', ')} খেলছেন। অন্য কাউকে নিতে নিচের কার্ডে ✕ চাপুন।</p>`}
  </li>
  <li><h2><i>৩</i>কলম বাছুন</h2>${s.players.length ? `<div class="pc-grid">${s.players.map(playerCard).join('')}</div>` : '<p class="pen-hint">ওপরে নাম দিলে এখানে কলম বাছাই দেখা যাবে।</p>'}</li>
  <li><h2><i>৪</i>কত রাউন্ড</h2>${numberPick({ name: 'rounds', label: 'এক ম্যাচে', value: s.rounds || ROUNDS, presets: [3, 5, 7], min: 1, max: 50, unit: 'রাউন্ড' })}</li></ol>
  <div class="pen-go">${button(ready ? 'খেলা শুরু' : vsCpu() ? 'আগে আপনার নাম দিন' : `আরও ${bn(need - humans().length)} জনের নাম দিন`, 'start', 'primary wide', 'play', ready ? '' : 'disabled')}<small>${bn(s.rounds || ROUNDS)} রাউন্ডের ম্যাচ</small></div>`;
}

function shop() {
  const accounts = readAccounts();
  if (!accounts.length) return `${pageHead('দোকান', 'কলমের জিনিসপত্র', 'আগে খেলা ট্যাবে নাম দিয়ে অ্যাকাউন্ট খুলুন, তারপর লড়াই জিতে কয়েন জমান।')}`;
  const acc = accounts.find(a => a.id === shopFor) || accounts.find(a => s.players.some(p => !p.cpu && p.name.toLocaleLowerCase() === a.name.toLocaleLowerCase())) || accounts[0];
  shopFor = acc.id;
  const pen = s.players.find(p => p.name.toLocaleLowerCase() === acc.name.toLocaleLowerCase())?.pen || 'pinpoint', gear = fitted(acc);
  return `${s.phase === 'setup' ? button('খেলায় ফিরুন', 'tab-play', 'text shop-back', 'back') : ''}${pageHead('দোকান', 'কলমের জিনিসপত্র', 'লড়াইয়ে জেতা প্রতিটা পয়েন্ট এক কয়েন। কেনা জিনিস যেকোনো সময় খুলে রাখা বা আবার লাগানো যায়।')}
  <h2 class="shop-h">কার জন্য কিনবেন?</h2>
  <div class="acc-chips shop-accs" role="radiogroup" aria-label="কার জন্য কিনবেন">${accounts.map(a => `<button type="button" role="radio" aria-checked="${a.id === acc.id}" class="acc-chip ${a.id === acc.id ? 'is-on' : ''}" data-action="shop" data-id="${a.id}">${playerDot(a.name)}${esc(a.name)}<small>${bn(a.coins)}</small></button>`).join('')}</div>
  <section class="shop-preview"><canvas id="pen-preview" width="560" height="120" aria-label="${esc(acc.name)}-এর কলম, লাগানো জিনিসসহ"></canvas><div><span class="wallet">${icon('spark')}<b>${bn(acc.coins)}</b> কয়েন</span><small>মোট জেতা ${bn(acc.earned)}</small>${statLine(pen, gear)}</div></section>
  <div class="shop-grid">${GEAR_KEYS.map(k => {
    const it = GEAR[k], owned = acc.gear[k], price = nextPrice(k, owned), on = owned && !acc.off[k];
    return `<article class="shop-item ${owned ? 'is-owned' : ''}"><div class="shop-icon" aria-hidden="true">${GEAR_ART[k]}</div><div class="shop-copy"><h3>${esc(it.name)}${it.max > 1 ? ` <small>${bn(owned)}/${bn(it.max)}</small>` : ''}</h3><p>${esc(it.note)}</p></div><div class="shop-buy">
    ${price != null ? `<button type="button" class="btn primary" data-action="buy" data-id="${k}" ${acc.coins < price ? 'disabled' : ''}>${icon('spark')}${bn(price)}</button>` : `<span class="sold">${icon('check')}পুরোটা কেনা</span>`}
    ${owned ? `<button type="button" class="btn text" data-action="wear" data-id="${k}">${on ? 'খুলে রাখুন' : 'লাগান'}</button>` : ''}</div></article>`;
  }).join('')}</div>
  <h2 class="pro-title">${icon('lock')}Pro কলম <small>শীঘ্রই আসছে</small></h2>
  <div class="pen-shelf pro-shelf">${Object.entries(PRO_PENS).map(([k, p]) => `<button type="button" class="pro-pen" data-action="pro" aria-label="${esc(p.name)}: লক করা, Pro সংস্করণে আসবে"><img src="${penImg(k)}" alt="" width="72" height="72"><span><b>${esc(p.name)}</b><small>${esc(p.note)}</small></span><i>${icon('lock')}Pro</i></button>`).join('')}</div>`;
}
function drawPreview() {
  const c = $('#pen-preview'), acc = readAccounts().find(a => a.id === shopFor); if (!c || !acc) return;
  const pen = s.players.find(p => p.name.toLocaleLowerCase() === acc.name.toLocaleLowerCase())?.pen || 'pinpoint', gear = fitted(acc), st = penStats(pen, gear);
  const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, c.width, c.height);
  g.setTransform(2.6, 0, 0, 2.6, c.width / 2, c.height / 2); paintPen(g, pen, gear, st.L, playerColour(acc.name), false);
}

function play() {
  const r = s.round, p = byId(r.turn), i = s.players.indexOf(p);
  return `<div class="pen-turn" style="--dot:${playerColour(p.name, i)}">${playerDot(p.name, i)}<span><b>${esc(p.name)}-এর চাল</b><small>${r.moving ? 'কলম চলছে…' : p.cpu ? 'কম্পিউটার নিশানা ঠিক করছে…' : 'নিজের কলম ধরে পেছনে টেনে ছেড়ে দিন'}</small></span><span class="pen-round">রাউন্ড ${bn(s.set.rounds + 1)}/${bn(s.set.total)}</span></div>
  <div class="bench-wrap"><canvas id="bench" aria-label="বেঞ্চ: ${s.round.pens.filter(q => !q.out).map(q => byId(q.pid).name).join(', ')}-এর কলম আছে"></canvas></div>
  <div class="pen-scores">${s.players.map((q, k) => `<span class="${r.pens.find(x => x.pid === q.id)?.out ? 'is-out' : ''}">${playerDot(q.name, k)}${esc(q.name)} <b>${bn(q.score)}</b></span>`).join('')}</div>
  ${button('ম্যাচ শেষ করুন', 'end', 'text wide pen-end', 'trophy')}`;
}
const table = () => rankTable(s.players.map(p => ({ name: p.name, score: p.score, history: (p.history || []).map(h => ({ ...h })) })), labels);
const labels = { caption: 'ম্যাচের ফল', rank: '#', player: 'খেলোয়াড় · শেষ পাঁচ রাউন্ড', points: 'পয়েন্ট', win: 'সবুজ: রাউন্ড জয়', loss: 'লাল: কলম পড়ে গেছে', order: 'নতুনটি বাঁ দিকে', empty: 'এখনও কোনো রাউন্ড শেষ হয়নি।', noGames: 'এখনও খেলেননি', number: bn };
function roundOver() {
  const w = s.lastWinner && byId(s.lastWinner), done = s.set.rounds >= s.set.total;
  return `${pageHead(`রাউন্ড ${bn(s.set.rounds)} শেষ`, w ? `${esc(w.name)}-এর কলম টিকে গেছে` : 'সব কলম পড়ে গেছে', w ? `${esc(PENS[w.pen].name)} বেঞ্চে শেষ পর্যন্ত ছিল। +২ পয়েন্ট${w.cpu ? '' : ', +২ কয়েন'}।` : 'এই রাউন্ডে কেউ জেতেনি।')}
  ${w ? `<div class="result-portrait win pen-winner"><img src="${penImg(w.pen)}" alt="" width="112" height="112"></div>` : ''}
  <section class="rank-section"><h2>ম্যাচের পয়েন্ট</h2>${table()}</section>
  <div class="pen-actions">${done ? button('আরও এক রাউন্ড', 'more', 'secondary', 'plus') : button('পরের রাউন্ড', 'next', 'primary', 'arrow')}${button('ম্যাচ শেষ', 'end', done ? 'primary' : 'text', 'trophy')}</div>`;
}
function rules() {
  return `${pageHead('নিয়ম', 'কলম যুদ্ধ', '')}<ol class="plain-rules">
  <li>প্রত্যেকে নাম দিয়ে খেলায় ঢোকেন; নামটাই অ্যাকাউন্ট। একটা ফোনে অনেক অ্যাকাউন্ট রাখা যায়, র‍্যাঙ্কিং পাতা থেকে মোছা যায়।</li>
  <li>প্রত্যেকে একটা কলম বেছে নিন। কলমের ওজন, গ্রিপ আর দৈর্ঘ্য আলাদা।</li>
  <li>যার চাল, সে নিজের কলমে আঙুল রেখে পেছনে টেনে ছেড়ে দেবে। যত বেশি টানবেন, তত জোরে যাবে।</li>
  <li>বেঞ্চ খসখসে কাঠের: স্থির কলম হালকা ধাক্কায় নড়ে না, জোরে লাগাতে হয়।</li>
  <li>কলমের মাঝখান বেঞ্চের কিনারা পার হলে কলম পড়ে গেছে।</li>
  <li>অন্যের কলম ফেললে +১, রাউন্ডে শেষ পর্যন্ত টিকে থাকলে +২। নিজের কলম নিজে ফেলে দিলে কিছু নেই।</li>
  <li>প্রতিটা পয়েন্ট অ্যাকাউন্টে এক কয়েন। কয়েন দিয়ে দোকান থেকে গ্রিপার, ভারী মাথা, পেছনে বাড়তি মাথা, টেপ, ইরেজার বাম্পার, ক্লিপ কেনা যায়।</li>
  <li>এক ম্যাচে ${bn(s.rounds || ROUNDS)} রাউন্ড (খেলার আগে বদলানো যায়)। মোট পয়েন্টে ম্যাচের র‍্যাঙ্কিং।</li></ol>`;
}
function ranking() {
  const list = readHistory(), rows = overallRanking(list, 'pen').map(r => ({ name: r.name, score: r.points, note: bn(r.matches) + 'টি ম্যাচ', history: r.recent.map(h => ({ won: h.won, img: h.img || penImg('pinpoint'), label: h.label || '' })) }));
  return `${pageHead('র‍্যাঙ্কিং', 'কলম যুদ্ধ', 'শেষ হওয়া প্রতিটি ম্যাচের মোট পয়েন্ট।')}
  ${s.set?.rounds ? `<section class="rank-section"><h2>চলমান ম্যাচ</h2>${table()}</section>` : ''}
  <section class="rank-section"><h2>সব ম্যাচ মিলিয়ে</h2>${rankTable(rows, labels)}</section>
  <section class="fame-section"><h2>${icon('trophy')}হল অব ফেম</h2><p>শেষ ১০০টি ম্যাচে এক ম্যাচে সবচেয়ে বেশি পয়েন্ট।</p>${fameTable(hallOfFame(list, 'pen'), { caption: 'হল অব ফেম', player: 'খেলোয়াড়', points: 'পয়েন্ট', empty: 'এখনও কেউ হল অব ফেমে ওঠেননি।', number: bn, meta: e => new Date(e.date).toLocaleDateString('bn-BD') + ' · ' + bn(e.games) + 'টি রাউন্ড' })}</section>
  ${s.phase === 'setup' ? button('কলম যুদ্ধের শুরুর পাতা', 'game-home', 'primary wide', 'home') : ''}
  <a class="btn secondary wide" href="ranking.html?game=pen">${icon('trophy')}সব খেলার র‍্যাঙ্কিং ও অ্যাকাউন্ট</a>`;
}
const button = (label, action, cls, ic, extra = '') => `<button type="button" class="btn ${cls}" data-action="${action}" ${extra}>${icon(ic)}${label}</button>`;

function screenKey() { return view + s.phase + (s.set?.rounds || 0); }
function render() {
  const key = screenKey(), changed = key !== lastScreen; lastScreen = key;
  const body = view === 'rules' ? rules() : view === 'ranking' ? ranking() : view === 'shop' ? shop() : s.phase === 'play' ? play() : s.phase === 'roundover' ? roundOver() : setup();
  $('#app').innerHTML = appShell({ brand: 'কলম যুদ্ধ', brandSub: 'বেঞ্চের খেলা', brandIcon: 'edit', brandAction: 'tab-play', crumb: ({ rules: 'নিয়ম', ranking: 'র‍্যাঙ্কিং', shop: 'দোকান' })[view] || (s.phase === 'setup' ? 'কলম বাছাই' : `রাউন্ড ${bn(s.set.rounds + (s.phase === 'play' ? 1 : 0))}`), active: view, contentClass: 'game-content pen-content', labels: { back: 'সব খেলা', menu: 'মেনু', sections: 'খেলার অংশ' },
    tabs: [{ id: 'play', label: 'খেলা', icon: 'play', action: 'tab-play' }, { id: 'shop', label: 'দোকান', icon: 'spark', action: 'tab-shop' }, { id: 'rules', label: 'নিয়ম', icon: 'book', action: 'tab-rules' }, { id: 'ranking', label: 'র‍্যাঙ্কিং', icon: 'trophy', action: 'tab-ranking' }], body });
  $$('[data-action]').forEach(el => el.onclick = e => { e.preventDefault(); act(el.dataset.action, el.dataset.id); });
  $('#name-form')?.addEventListener('submit', e => {
    e.preventDefault(); const name = $('#player-name').value.trim().replace(/\s+/g, ' ');
    if (!name) return; addPlayer(name); $('#player-name')?.focus();
  });
  bindNumberPick(document, 'rounds', 1, 50, n => { s.rounds = n; save(); render(); });
  if (view === 'shop') drawPreview();
  if (view === 'play' && s.phase === 'play') { bindBench(); if (s.round.moving || bannerUp() || fx.length) loop(); cpuTurn(); }
  if (changed) enterScreen($('#screen'));
}
function addPlayer(name) {
  if (vsCpu() ? humans().length >= 1 : humans().length >= 4) return toast(vsCpu() ? 'কম্পিউটারের সাথে একজন খেলে। আগের নাম বাদ দিন।' : 'সর্বোচ্চ ৪ জন।');
  if (s.players.some(p => p.name.toLocaleLowerCase() === name.toLocaleLowerCase())) return toast('এই নাম আগেই আছে।');
  let acc; try { acc = ensureAccount(name); } catch (e) { return toast(e.message === 'FULL' ? 'এই ফোনে আর অ্যাকাউন্ট খোলা যাবে না। পুরোনো কোনোটা মুছুন।' : 'একটা নাম দিন।'); }
  s.players.splice(humans().length, 0, { id: crypto.randomUUID(), name: acc.name, pen: PEN_KEYS[humans().length % PEN_KEYS.length], score: 0, history: [] }); save(); render();
}
/* Against the computer: one person plus the computer. With friends: two to four people. */
function setMode(mode) {
  s.mode = mode === 'cpu' ? 'cpu' : 'friends';
  const people = humans();
  s.players = s.mode === 'cpu' ? [...people.slice(0, 1), { id: crypto.randomUUID(), name: 'কম্পিউটার', cpu: true, pen: 'hischool', score: 0, history: [] }] : people;
}
function transition() { const el = $('#screen'); el ? leaveScreen(el, render) : render(); }

function startRound() {
  placePens(s.players[s.set.rounds % s.players.length].id); s.phase = 'play'; fx = []; shake = 0;
  banner = { text: `রাউন্ড ${bn(s.set.rounds + 1)}`, sub: `প্রথম চাল: ${byId(s.round.turn).name}`, until: performance.now() + 1600 };
  save(); transition();
}
async function act(action, id) {
  switch (action) {
    case 'tab-play': case 'tab-rules': case 'tab-ranking': case 'tab-shop': { const next = action.slice(4); if (view === next) return; view = next; clearTimeout(cpuTimer); return transition(); }
    case 'app-menu': return openMenu();
    case 'games': location.href = 'index.html'; return;
    case 'pro': return toast('এই দামি কলমগুলো Pro সংস্করণে খোলা হবে।');
    case 'mode': setMode(id); save(); return render();
    case 'prev-pen': { const p = byId(id); p.pen = PEN_KEYS[(PEN_KEYS.indexOf(p.pen) + PEN_KEYS.length - 1) % PEN_KEYS.length]; save(); return render(); }
    case 'game-home': clearTimeout(cpuTimer); view = 'play'; return transition();
    case 'cpu-level': s.cpuLevel = CPU[id] ? id : 'medium'; save(); return render();
    case 'add-acc': { const a = readAccounts().find(x => x.id === id); if (a) addPlayer(a.name); return; }
    case 'cycle-pen': { const p = byId(id); p.pen = PEN_KEYS[(PEN_KEYS.indexOf(p.pen) + 1) % PEN_KEYS.length]; save(); return render(); }
    case 'remove': s.players = s.players.filter(p => p.id !== id); save(); return render();
    case 'shop': shopFor = id || shopFor; if (view !== 'shop') { view = 'shop'; return transition(); } return render();
    case 'buy': try { buyGear(shopFor, id); sound('coin'); toast(GEAR[id].name + ' লাগানো হয়েছে।'); } catch (e) { toast(e.message === 'COINS' ? 'কয়েন কম। আরও লড়াই জিতে আসুন।' : 'এটা আর কেনা যাবে না।'); } return render();
    case 'wear': toggleGear(shopFor, id); return render();
    case 'start': if (humans().length < (vsCpu() ? 1 : 2)) return; s.players.forEach(p => { p.score = 0; p.history = []; }); s.set = { id: crypto.randomUUID(), total: s.rounds || ROUNDS, rounds: 0 }; return startRound();
    case 'next': return startRound();
    case 'more': s.set.total++; return startRound();
    case 'end': case 'new':
      if (s.phase === 'setup') return;
      if (!await confirm('ম্যাচ শেষ করবেন?', 'ম্যাচের ফল র‍্যাঙ্কিংয়ে সেভ হবে, তারপর নতুন খেলা শুরু করা যাবে।')) return;
      if (s.set?.rounds) saveMatch({ id: s.set.id, game: 'pen', games: s.set.rounds, players: s.players.map(p => ({ name: p.name, points: p.score, recent: p.history || [] })) });
      stop(); s = { ...fresh(), mode: s.mode, cpuLevel: s.cpuLevel, rounds: s.rounds, players: s.players.map(p => ({ ...p, score: 0, history: [] })) }; save(); view = 'ranking'; return transition();
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
// Players removed from the device accounts since the last visit leave the table.
if (s.phase === 'setup') { s.players = s.players.filter(p => p.cpu || findAccount(p.name)); setMode(s.mode || (s.players.some(p => p.cpu) || !s.players.length ? 'cpu' : 'friends')); }
if (new URLSearchParams(location.search).get('view') === 'shop') view = 'shop';
render();

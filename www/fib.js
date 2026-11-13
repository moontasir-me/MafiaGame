import { LEVELS, makeQuestion } from './fib-questions.mjs';
import { sound, soundEnabled, toggleSound } from './sound.mjs';
import { saveMatch, readHistory, overallRanking, hallOfFame } from './history.mjs';
import { readAccounts, ensureAccount } from './accounts.mjs';
import { esc, icon, appShell, pageHead, rankTable, fameTable, playerColour, playerDot, enterScreen, leaveScreen } from './ui-kit.mjs';

/* Fibonacci: a quick maths quiz on one phone. Each player plays a full run, then passes the phone.
   Timer mode: as many right answers as possible before the clock runs out; +1 right, −1 wrong.
   Infinity mode: no clock, three hearts; +1 right, a wrong answer costs a heart. */

const $ = q => document.querySelector(q), $$ = q => [...document.querySelectorAll(q)];
const bn = n => (n < 0 ? '−' : '') + Math.abs(Number(n)).toLocaleString('bn-BD');
const KEY = 'fib.v2', TIMES = [60, 90, 120], HEARTS = 3, LETTERS = ['ক', 'খ', 'গ', 'ঘ'], ART = 'assets/fib/spiral.svg';
const MODES = {
  timer: { name: 'সময়ের খেলা', note: 'ঠিক +১ · ভুল −১' },
  infinity: { name: 'অসীম খেলা', note: '৩টা প্রাণ · ঠিক +১' }
};
const math = t => esc(String(t)).replace(/(^|[\s(,=\[])-(?=\d)/g, '$1−');

function fresh() { return { v: 2, phase: 'setup', mode: 'timer', level: 1, seconds: 60, players: [], cur: 0, current: null, picked: null, endsAt: null, hearts: HEARTS }; }
let s = fresh(), view = 'play', lastScreen = '', modalResolve = null, advanceTimer = 0;
try { const d = JSON.parse(localStorage.getItem(KEY)); if (d?.v === 2) s = { ...fresh(), ...d }; else { const old = JSON.parse(localStorage.getItem('fib.v1')); if (old?.players) s.players = old.players.map(p => ({ id: p.id, name: p.name })); } } catch { }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { } };
const lv = () => LEVELS[s.level - 1];
const me = () => s.players[s.cur];
const left = () => s.endsAt ? Math.max(0, Math.ceil((s.endsAt - Date.now()) / 1000)) : 0;
const button = (label, action, cls, ic, extra = '') => `<button type="button" class="btn ${cls}" data-action="${action}" ${extra}>${icon(ic)}${label}</button>`;
const heartRow = n => `<span class="fib-hearts" aria-label="${bn(n)}টা প্রাণ বাকি">${Array.from({ length: HEARTS }, (_, i) => `<i class="${i < n ? '' : 'lost'}">♥</i>`).join('')}</span>`;
const clockText = n => `${Math.floor(n / 60)}:${String(n % 60).padStart(2, '0')}`.replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);

/* ---------- Screens ---------- */

const SPIRAL = `<svg class="fib-mark" viewBox="0 0 89 55" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1"><rect x="0" y="0" width="55" height="55"/><rect x="55" y="0" width="34" height="34"/><rect x="68" y="34" width="21" height="21"/><rect x="55" y="42" width="13" height="13"/><rect x="55" y="34" width="8" height="8"/></g><path d="M0 55A55 55 0 0 1 55 0A34 34 0 0 1 89 34A21 21 0 0 1 68 55A13 13 0 0 1 55 42A8 8 0 0 1 63 34" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`;
const MODE_ART = { timer: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="8" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M12 9v4l3 2M9 2h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>', infinity: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 8c-3 0-5 2-5 4s2 4 5 4c4 0 6-8 10-8 3 0 5 2 5 4s-2 4-5 4c-4 0-6-8-10-8Z" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>' };

function accountChips() {
  const here = new Set(s.players.map(p => p.name.toLocaleLowerCase())), list = readAccounts().filter(a => !here.has(a.name.toLocaleLowerCase()));
  return list.length && s.players.length < 8 ? `<div class="fib-accs"><span>আগের অ্যাকাউন্ট:</span>${list.map(a => `<button type="button" class="fib-acc" data-action="add-acc" data-id="${a.id}">${playerDot(a.name)}${esc(a.name)}</button>`).join('')}</div>` : '';
}
function setup() {
  return `<header class="fib-head">${SPIRAL}<div><h1>Fibonacci</h1><p>অঙ্কের দ্রুত প্রশ্ন, চার স্তরে</p></div></header>
  <ol class="fib-steps">
  <li><h2><i>১</i>ধরন</h2><div class="fib-modes" role="radiogroup" aria-label="খেলার ধরন">${Object.entries(MODES).map(([k, m]) => `<button type="button" role="radio" aria-checked="${s.mode === k}" class="${s.mode === k ? 'is-on' : ''}" data-action="mode" data-id="${k}">${MODE_ART[k]}<b>${m.name}</b><small>${m.note}</small></button>`).join('')}</div>
   ${s.mode === 'timer' ? `<div class="fib-count" role="radiogroup" aria-label="কত সময়"><span>সময়</span>${TIMES.map(n => `<button type="button" role="radio" aria-checked="${s.seconds === n}" class="${s.seconds === n ? 'is-on' : ''}" data-action="time" data-id="${n}">${bn(n)} সেকেন্ড</button>`).join('')}</div>` : ''}</li>
  <li><h2><i>২</i>স্তর</h2><div class="fib-levels" role="radiogroup" aria-label="স্তর">${LEVELS.map(l => `<button type="button" role="radio" aria-checked="${s.level === l.id}" class="fib-level l${l.id} ${s.level === l.id ? 'is-on' : ''}" data-action="level" data-id="${l.id}"><span class="fib-num">${bn(l.id)}</span><b>${l.name}</b><small>${l.age}</small></button>`).join('')}</div></li>
  <li id="players"><h2><i>৩</i>খেলোয়াড় <small>${bn(s.players.length)} / ৮</small></h2>
  ${s.players.length < 8 ? `<form id="name-form" class="name-form"><input id="player-name" maxlength="20" autocomplete="off" placeholder="নাম লিখুন" aria-label="খেলোয়াড়ের নাম"><button class="btn primary" type="submit">${icon('plus')}যোগ</button></form>` : ''}
  ${accountChips()}
  ${s.players.length ? `<div class="fib-list">${s.players.map((p, i) => `<div class="fib-row" style="--dot:${playerColour(p.name, i)}">${playerDot(p.name, i)}<b>${esc(p.name)}</b><button type="button" class="icon-btn" data-action="remove" data-id="${p.id}" aria-label="${esc(p.name)} বাদ দিন">${icon('close')}</button></div>`).join('')}</div>` : ''}</li></ol>
  <div class="fib-go">${button(s.players.length ? 'শুরু করুন' : 'আগে একটা নাম দিন', 'start', 'primary wide', 'play', s.players.length ? '' : 'disabled')}</div>`;
}

function handover() {
  const p = me(), i = s.cur;
  return `<section class="fib-ready" style="--dot:${playerColour(p.name, i)}">${playerDot(p.name, i)}<span class="eyebrow">${s.players.length > 1 ? `খেলোয়াড় ${bn(i + 1)}/${bn(s.players.length)}` : MODES[s.mode].name}</span><h1>${esc(p.name)}-এর পালা</h1>
  <p>${s.mode === 'timer' ? `${bn(s.seconds)} সেকেন্ড · ${MODES.timer.note}` : `${heartRow(HEARTS)} · ঠিক +১`}</p>${button('শুরু!', 'go', 'primary wide', 'play')}</section>
  ${s.cur ? `<section class="rank-section"><h2>এ পর্যন্ত</h2>${rankTable(rows().filter(r => r.done), labels)}</section>` : ''}`;
}

function playing() {
  const c = s.current, p = me(), i = s.cur, done = s.picked !== null, right = done && c.options[s.picked] === c.a, n = left();
  const status = s.mode === 'timer'
    ? `<div class="fib-clock ${n <= 10 ? 'is-urgent' : ''}" role="timer" aria-label="বাকি সময়"><svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19" class="track"/><circle cx="22" cy="22" r="19" class="ring" id="timer-ring" style="stroke-dashoffset:${119.4 * (1 - n / s.seconds)}"/></svg><span id="timer-clock">${clockText(n)}</span></div>`
    : heartRow(s.hearts);
  return `<div class="fib-bar" style="--dot:${playerColour(p.name, i)}">${playerDot(p.name, i)}<span><b>${esc(p.name)}</b><small>${MODES[s.mode].name} · স্তর ${bn(s.level)}</small></span><span class="fib-score" aria-label="পয়েন্ট"><b>${bn(p.score)}</b><small>পয়েন্ট</small></span>${status}</div>
  <section class="fib-card ${done ? (right ? 'is-right' : 'is-wrong') : ''}">${SPIRAL}<small class="fib-qn">প্রশ্ন ${bn((p.right || 0) + (p.wrong || 0) + (done ? 0 : 1))}</small><p class="fib-q">${math(c.q)}</p>
  ${done ? `<div class="fib-verdict ${right ? 'right' : 'wrong'}" role="status">${right ? '✓ ঠিক! +১' : `✗ ভুল${s.mode === 'timer' ? ' · −১' : ' · একটা প্রাণ গেল'}<span>ঠিক উত্তর: <b>${math(c.a)}</b></span><small>${math(c.why)}</small>`}</div>` : ''}</section>
  <div class="fib-options">${c.options.map((o, k) => `<button type="button" class="fib-opt ${done && o === c.a ? 'is-answer' : ''} ${done && k === s.picked && o !== c.a ? 'is-miss' : ''}" data-action="pick" data-id="${k}" ${done ? 'disabled' : ''}><i>${LETTERS[k]}</i><span>${math(o)}</span></button>`).join('')}</div>
  ${done && !right ? button(s.mode === 'infinity' && !s.hearts ? 'দফা শেষ' : 'পরের প্রশ্ন', 'next', 'primary wide fib-next', 'arrow') : ''}
  ${button('দফা শেষ করুন', 'stop', 'text wide fib-stop', 'close')}`;
}

const labels = { caption: 'ফলাফল', rank: '#', player: 'খেলোয়াড় · শেষ পাঁচ প্রশ্ন', points: 'পয়েন্ট', win: 'সবুজ: ঠিক', loss: 'লাল: ভুল', order: 'নতুনটি বাঁ দিকে', empty: 'এখনও কেউ খেলেননি।', noGames: 'এখনও খেলেননি', number: bn };
const rows = () => s.players.map(p => ({ name: p.name, score: p.score || 0, done: p.done, note: `${bn(p.right || 0)} ঠিক · ${bn(p.wrong || 0)} ভুল`, history: p.history || [] }));
function summary() {
  const ranked = [...s.players].sort((a, b) => b.score - a.score), best = ranked[0], tie = ranked.length > 1 && ranked[1].score === best.score;
  return `<div class="fib-over">${SPIRAL}<span class="eyebrow">${MODES[s.mode].name} · স্তর ${bn(s.level)} ${lv().name}</span><h1>${s.players.length === 1 ? `${bn(best.score)} পয়েন্ট!` : tie ? 'সমানে সমান!' : esc(best.name) + ' জিতলেন!'}</h1><p class="lede">${s.players.length === 1 ? `${bn(best.right || 0)}টা ঠিক, ${bn(best.wrong || 0)}টা ভুল।` : tie ? 'আরেক দফা হয়ে যাক।' : `${bn(best.score)} পয়েন্ট নিয়ে সবার আগে।`}</p></div>
  <section class="rank-section"><h2>ফলাফল</h2>${rankTable(rows(), labels)}</section>
  <div class="fib-actions">${button('আবার খেলুন', 'start', 'primary wide', 'play')}${button('ধরন, স্তর বা নাম বদলান', 'edit', 'secondary wide', 'edit')}${button('Fibonacci-র শুরুর পাতা', 'game-home', 'text wide', 'home')}</div>`;
}
function rules() {
  return `${pageHead('নিয়ম', 'Fibonacci', '')}<ol class="plain-rules">
  <li><b>সময়ের খেলা:</b> সময় শেষের আগে যত পারেন। ঠিক +১, ভুল −১।</li>
  <li><b>অসীম খেলা:</b> ৩টা প্রাণ। ঠিক +১, ভুলে একটা প্রাণ যায়।</li>
  <li>কয়েকজন খেললে একে একে নিজের দফা খেলুন।</li>
  <li>স্তর ১ (৯–১২ বছর) থেকে স্তর ৪ (স্নাতক)।</li></ol>`;
}
function ranking() {
  const list = readHistory(), all = overallRanking(list, 'fib').map(r => ({ name: r.name, score: r.points, note: bn(r.matches) + 'টি খেলা', history: r.recent.map(h => ({ won: h.won, img: h.img || ART, label: h.label || '' })) }));
  return `${pageHead('র‍্যাঙ্কিং', 'Fibonacci', 'শেষ হওয়া প্রতিটা খেলার মোট পয়েন্ট।')}
  ${s.phase !== 'setup' ? `<section class="rank-section"><h2>এই খেলা</h2>${rankTable(rows(), labels)}</section>` : ''}
  <section class="rank-section"><h2>সব খেলা মিলিয়ে</h2>${rankTable(all, labels)}</section>
  <section class="fame-section"><h2>${icon('trophy')}হল অব ফেম</h2><p>শেষ ১০০টি খেলায় এক খেলায় সবচেয়ে বেশি পয়েন্ট।</p>${fameTable(hallOfFame(list, 'fib'), { caption: 'হল অব ফেম', player: 'খেলোয়াড়', points: 'পয়েন্ট', empty: 'এখনও কেউ হল অব ফেমে ওঠেননি।', number: bn, meta: e => new Date(e.date).toLocaleDateString('bn-BD') + ' · ' + bn(e.games) + 'টি প্রশ্ন' })}</section>
  <a class="btn secondary wide" href="ranking.html?game=fib">${icon('trophy')}সব খেলার র‍্যাঙ্কিং ও অ্যাকাউন্ট</a>`;
}

/* ---------- Shell ---------- */

function screenKey() { return view !== 'play' ? view : s.phase + s.cur; }
function render() {
  const key = screenKey(), changed = key !== lastScreen; lastScreen = key;
  const body = view === 'rules' ? rules() : view === 'ranking' ? ranking() : s.phase === 'play' ? playing() : s.phase === 'handover' ? handover() : s.phase === 'over' ? summary() : setup();
  $('#app').innerHTML = appShell({ brand: 'Fibonacci', brandSub: 'অঙ্কের খেলা', brandIcon: 'grid', brandAction: 'tab-play', crumb: view === 'rules' ? 'নিয়ম' : view === 'ranking' ? 'র‍্যাঙ্কিং' : s.phase === 'play' || s.phase === 'handover' ? `${me().name}-এর পালা` : s.phase === 'over' ? 'ফলাফল' : 'খেলা সাজান', active: view, contentClass: 'game-content fib-content', labels: { back: 'সব খেলা', menu: 'মেনু', sections: 'খেলার অংশ' },
    tabs: [{ id: 'play', label: 'খেলা', icon: 'play', action: 'tab-play' }, { id: 'rules', label: 'নিয়ম', icon: 'book', action: 'tab-rules' }, { id: 'ranking', label: 'র‍্যাঙ্কিং', icon: 'trophy', action: 'tab-ranking' }], body });
  $$('[data-action]').forEach(el => el.onclick = e => { e.preventDefault(); act(el.dataset.action, el.dataset.id); });
  $('#name-form')?.addEventListener('submit', e => { e.preventDefault(); if (addPlayer($('#player-name').value.trim())) { render(); $('#player-name')?.focus(); } });
  if (changed) enterScreen($('#screen'));
}
const transition = () => leaveScreen($('#screen'), () => { render(); scrollTo({ top: 0, behavior: 'instant' }); });
function toast(text) { const t = $('#toast'); t.textContent = text; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600); }
function addPlayer(name) {
  name = name.replace(/\s+/g, ' ');
  if (!name) return false;
  if (s.players.length >= 8) { toast('সর্বোচ্চ ৮ জন।'); return false; }
  if (s.players.some(p => p.name.toLocaleLowerCase() === name.toLocaleLowerCase())) { toast('এই নাম আগেই আছে।'); return false; }
  try { name = ensureAccount(name).name; } catch { }
  s.players.push({ id: crypto.randomUUID(), name }); save(); return true;
}

/* ---------- A run ---------- */

function newQuestion() { s.current = makeQuestion(s.level); s.picked = null; }
function beginRun() {
  const p = me(); Object.assign(p, { score: 0, right: 0, wrong: 0, history: [], done: false });
  s.hearts = HEARTS; s.endsAt = s.mode === 'timer' ? Date.now() + s.seconds * 1000 : null; newQuestion(); s.phase = 'play';
}
function answer(k) {
  if (s.phase !== 'play' || s.picked !== null) return;
  const p = me(), ok = s.current.options[k] === s.current.a;
  s.picked = k;
  if (ok) { p.score++; p.right++; } else { p.wrong++; if (s.mode === 'timer') p.score--; else s.hearts--; }
  p.history = [{ won: ok, img: ART, label: `স্তর ${bn(s.level)} · ${ok ? 'ঠিক' : 'ভুল'}` }, ...p.history].slice(0, 5);
  save(); render(); sound(ok ? 'win' : 'wrong');
  // A right answer moves on by itself; a wrong one waits on "পরের প্রশ্ন" so the right answer can be read.
  clearTimeout(advanceTimer);
  if (ok) advanceTimer = setTimeout(nextOrEnd, 600);
  else $('.fib-next')?.focus({ preventScroll: true });
}
function nextOrEnd() {
  clearTimeout(advanceTimer);
  if (s.phase !== 'play') return;
  if (s.mode === 'infinity' && s.hearts <= 0) return endRun();
  if (s.mode === 'timer' && left() <= 0) return endRun();
  newQuestion(); save(); render();
}
function endRun() {
  clearTimeout(advanceTimer);
  me().done = true; s.endsAt = null; s.picked = null;
  if (s.cur + 1 < s.players.length) { s.cur++; s.phase = 'handover'; sound('notice'); }
  else {
    s.phase = 'over'; sound('win');
    const answered = s.players.reduce((a, p) => a + (p.right || 0) + (p.wrong || 0), 0);
    if (answered) saveMatch({ id: crypto.randomUUID(), game: 'fib', games: answered, players: s.players.map(p => ({ name: p.name, points: p.score || 0, recent: p.history || [] })) });
  }
  save(); transition();
}

async function act(action, id) {
  switch (action) {
    case 'tab-play': case 'tab-rules': case 'tab-ranking': { const next = action.slice(4); if (view === next) return; view = next; return transition(); }
    case 'app-menu': return openMenu();
    case 'games': location.href = 'index.html'; return;
    case 'mode': s.mode = MODES[id] ? id : 'timer'; save(); return render();
    case 'time': s.seconds = TIMES.includes(Number(id)) ? Number(id) : 60; save(); return render();
    case 'level': s.level = Math.max(1, Math.min(4, Number(id))); save(); return render();
    case 'add-acc': { const a = readAccounts().find(x => x.id === id); if (a && addPlayer(a.name)) render(); return; }
    case 'remove': s.players = s.players.filter(p => p.id !== id); save(); return render();
    case 'start': if (!s.players.length) return; view = 'play'; s.cur = 0; s.players.forEach(p => Object.assign(p, { score: 0, right: 0, wrong: 0, history: [], done: false })); s.phase = 'handover'; save(); return transition();
    case 'go': beginRun(); save(); sound('notice'); return transition();
    case 'pick': return answer(Number(id));
    case 'next': return nextOrEnd();
    case 'stop': if (await confirm('এই দফা শেষ করবেন?', 'এ পর্যন্ত যা পয়েন্ট হয়েছে তা থাকবে।', 'হ্যাঁ, শেষ')) endRun(); return;
    case 'game-home': view = 'play'; if (s.phase === 'over') s.phase = 'setup'; save(); return transition();
    case 'edit': s.phase = 'setup'; save(); return transition();
    case 'end':
      if (s.phase === 'setup') return;
      if (s.phase === 'over') { s.phase = 'setup'; save(); return transition(); }
      if (!await confirm('পুরো খেলা থামাবেন?', 'যাঁরা খেলেছেন তাঁদের পয়েন্ট র‍্যাঙ্কিংয়ে সেভ হবে।', 'হ্যাঁ, থামান')) return;
      if (s.phase === 'play') me().done = true;
      { const played = s.players.filter(p => p.done); if (played.length) saveMatch({ id: crypto.randomUUID(), game: 'fib', games: played.reduce((a, p) => a + p.right + p.wrong, 0), players: played.map(p => ({ name: p.name, points: p.score || 0, recent: p.history || [] })) }); }
      clearTimeout(advanceTimer); s.phase = 'setup'; s.endsAt = null; save(); return transition();
  }
}

/* ---------- Dialogs and clock ---------- */

function closeOverlay() { $('#overlay').innerHTML = ''; modalResolve?.(false); modalResolve = null; }
function confirm(title, text, yes) {
  return new Promise(resolve => {
    closeOverlay(); modalResolve = resolve;
    $('#overlay').innerHTML = `<div class="scrim"><section class="dialog" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="dialog-mark">${icon('grid')}</div><h2>${esc(title)}</h2><p>${esc(text)}</p><div class="dialog-actions"><button class="btn primary" id="confirm-yes">${esc(yes)}</button><button class="btn secondary" id="confirm-no">খেলা চলুক</button></div></section></div>`;
    $('#confirm-yes').onclick = () => { modalResolve = null; $('#overlay').innerHTML = ''; resolve(true); };
    $('#confirm-no').onclick = closeOverlay; $('#confirm-no').focus();
  });
}
function openMenu() {
  closeOverlay();
  const items = [...(s.phase === 'play' || s.phase === 'handover' ? [['পুরো খেলা থামান', 'trophy', 'end', 'tone-danger']] : []), ['শব্দ: ' + (soundEnabled() ? 'চালু' : 'বন্ধ'), 'sound', 'sound', ''], ['সব খেলায় ফিরে যান', 'back', 'games', 'tone-quiet']];
  $('#overlay').innerHTML = `<div class="scrim"><section class="dialog app-menu-dialog" role="dialog" aria-modal="true" aria-labelledby="menu-title"><div class="picker-title"><h2 id="menu-title">মেনু</h2><button type="button" id="close-menu" class="icon-btn" aria-label="বন্ধ করুন">${icon('close')}</button></div><div class="app-menu-items">${items.map(([label, ic, a, tone]) => `<button class="btn secondary wide ${tone}" type="button" data-menu="${a}">${icon(ic)}${label}${icon('arrow')}</button>`).join('')}</div></section></div>`;
  $('#close-menu').onclick = closeOverlay;
  $$('[data-menu]').forEach(el => el.onclick = () => { const a = el.dataset.menu; closeOverlay(); if (a === 'sound') { toggleSound(); openMenu(); } else act(a); });
}
addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('#overlay').innerHTML) return closeOverlay();
  // Keys 1–4 pick an answer on a keyboard.
  if (view === 'play' && s.phase === 'play' && s.picked === null && /^[1-4]$/.test(e.key) && !e.target.closest('input')) answer(Number(e.key) - 1);
});
setInterval(() => {
  if (s.phase !== 'play' || s.mode !== 'timer' || !s.endsAt) return;
  const n = left();
  if (n <= 0) { toast('সময় শেষ!'); return endRun(); }
  const c = $('#timer-clock'), ring = $('#timer-ring');
  if (c) c.textContent = clockText(n); if (ring) ring.style.strokeDashoffset = String(119.4 * (1 - n / s.seconds));
  $('.fib-clock')?.classList.toggle('is-urgent', n <= 10);
}, 250);
// A run cut off by a reload carries on (timer mode keeps its end time).
if (s.phase === 'play' && s.picked !== null) newQuestion();

render();
if ('serviceWorker' in navigator && !window.Android && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => { });

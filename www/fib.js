import { LEVELS, makeQuestion } from './fib-questions.mjs';
import { sound, soundEnabled, toggleSound } from './sound.mjs';
import { saveMatch, readHistory, overallRanking, hallOfFame } from './history.mjs';
import { readAccounts, ensureAccount } from './accounts.mjs';
import { esc, icon, appShell, pageHead, rankTable, fameTable, playerColour, playerDot, enterScreen, leaveScreen } from './ui-kit.mjs';

/* Fibonacci: a quick maths quiz on one phone. Players take turns; each gets the same number of questions.
   A right answer is worth the level number (1–4) in points. */

const $ = q => document.querySelector(q), $$ = q => [...document.querySelectorAll(q)];
const bn = n => Number(n).toLocaleString('bn-BD');
const KEY = 'fib.v1', COUNTS = [5, 10, 15], LETTERS = ['ক', 'খ', 'গ', 'ঘ'], ART = 'assets/fib/spiral.svg';
const math = t => esc(String(t)).replace(/(^|[\s(,=\[])-(?=\d)/g, '$1−');

function fresh() { return { v: 1, phase: 'setup', players: [], level: 1, per: 5, asked: 0, current: null, picked: null, endsAt: null }; }
let s = fresh(), view = 'play', lastScreen = '', modalResolve = null;
try { const d = JSON.parse(localStorage.getItem(KEY)); if (d?.v === 1) s = { ...fresh(), ...d }; } catch { }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { } };
const lv = () => LEVELS[s.level - 1];
const total = () => s.players.length * s.per;
const turn = () => s.players[(s.asked - 1) % s.players.length];
const left = () => s.endsAt ? Math.max(0, Math.ceil((s.endsAt - Date.now()) / 1000)) : 0;
const button = (label, action, cls, ic, extra = '') => `<button type="button" class="btn ${cls}" data-action="${action}" ${extra}>${icon(ic)}${label}</button>`;

/* ---------- Screens ---------- */

const SPIRAL = `<svg class="fib-mark" viewBox="0 0 89 55" aria-hidden="true"><g fill="none" stroke="currentColor" stroke-width="1"><rect x="0" y="0" width="55" height="55"/><rect x="55" y="0" width="34" height="34"/><rect x="68" y="34" width="21" height="21"/><rect x="55" y="42" width="13" height="13"/><rect x="55" y="34" width="8" height="8"/></g><path d="M0 55A55 55 0 0 1 55 0A34 34 0 0 1 89 34A21 21 0 0 1 68 55A13 13 0 0 1 55 42A8 8 0 0 1 63 34" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round"/></svg>`;

function accountChips() {
  const here = new Set(s.players.map(p => p.name.toLocaleLowerCase())), list = readAccounts().filter(a => !here.has(a.name.toLocaleLowerCase()));
  return list.length && s.players.length < 8 ? `<div class="fib-accs"><span>অ্যাকাউন্ট থেকে যোগ করুন</span>${list.map(a => `<button type="button" class="fib-acc" data-action="add-acc" data-id="${a.id}">${playerDot(a.name)}${esc(a.name)}</button>`).join('')}</div>` : '';
}
function setup() {
  return `<section class="fib-hero"><div class="fib-hero-copy"><span class="fib-kicker">১, ১, ২, ৩, ৫, ৮, ১৩ …</span><h1>Fibonacci</h1><p>ছোট ছোট অঙ্কের প্রশ্ন, চার স্তরে। নয় বছরের ক্লাস ফোর থেকে বিজ্ঞানের স্নাতক পর্যন্ত, যে যার স্তর বেছে নিন। প্রতিটা প্রশ্ন নতুন করে বানানো, তাই একই প্রশ্ন বারবার আসে না।</p></div>${SPIRAL}</section>
  <h2 class="fib-title">কোন স্তর?</h2>
  <div class="fib-levels" role="radiogroup" aria-label="স্তর">${LEVELS.map(l => `<button type="button" role="radio" aria-checked="${s.level === l.id}" class="fib-level l${l.id} ${s.level === l.id ? 'is-on' : ''}" data-action="level" data-id="${l.id}"><span class="fib-num">${bn(l.id)}</span><b>${l.name}</b><small>${l.age}</small><em>${l.note}</em><i>ঠিক উত্তরে +${bn(l.id)} · ${bn(l.seconds)} সেকেন্ড</i></button>`).join('')}</div>
  <section class="panel fib-setup" id="players"><h2>কারা খেলছেন? <small>${bn(s.players.length)} / ৮</small></h2>
  <form id="name-form" class="name-form"><input id="player-name" maxlength="20" autocomplete="off" placeholder="নাম লিখুন" aria-label="খেলোয়াড়ের নাম" ${s.players.length >= 8 ? 'disabled' : ''}><button class="btn primary" type="submit" ${s.players.length >= 8 ? 'disabled' : ''}>${icon('plus')}যোগ করুন</button></form>
  ${accountChips()}
  ${s.players.length ? `<div class="fib-list">${s.players.map((p, i) => `<div class="fib-row" style="--dot:${playerColour(p.name, i)}">${playerDot(p.name, i)}<b>${esc(p.name)}</b><button type="button" class="icon-btn" data-action="remove" data-id="${p.id}" aria-label="${esc(p.name)} বাদ দিন">${icon('close')}</button></div>`).join('')}</div>` : '<p class="fib-hint">একা খেললেও নাম দিন। নাম দিলেই অ্যাকাউন্ট খুলে যায়, পয়েন্ট র‍্যাঙ্কিংয়ে জমে।</p>'}
  <div class="fib-count" role="radiogroup" aria-label="প্রত্যেকে কয়টা প্রশ্ন"><span>প্রত্যেকে</span>${COUNTS.map(n => `<button type="button" role="radio" aria-checked="${s.per === n}" class="${s.per === n ? 'is-on' : ''}" data-action="per" data-id="${n}">${bn(n)}টা প্রশ্ন</button>`).join('')}</div>
  ${button('শুরু করুন', 'start', 'primary wide', 'play', s.players.length ? '' : 'disabled')}</section>`;
}

function asking() {
  const c = s.current, p = turn(), i = s.players.indexOf(p), n = left(), done = s.picked !== null, right = done && c.options[s.picked] === c.a;
  return `<div class="fib-turn" style="--dot:${playerColour(p.name, i)}">${playerDot(p.name, i)}<span><b>${esc(p.name)}-এর পালা</b><small>প্রশ্ন ${bn(s.asked)}/${bn(total())} · স্তর ${bn(s.level)} ${lv().name}</small></span>
  <div class="fib-timer ${done ? 'is-done' : n <= 5 ? 'is-urgent' : ''}" role="timer" aria-label="বাকি সময়"><svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19" class="track"/><circle cx="22" cy="22" r="19" class="ring" id="timer-ring" style="stroke-dashoffset:${done ? 0 : 119.4 * (1 - n / lv().seconds)}"/></svg><span id="timer-clock">${done ? (right ? '✓' : '✗') : bn(n)}</span></div></div>
  <section class="fib-card ${done ? (right ? 'is-right' : 'is-wrong') : ''}">${SPIRAL}<p class="fib-q">${math(c.q)}</p></section>
  <div class="fib-options">${c.options.map((o, k) => `<button type="button" class="fib-opt ${done && o === c.a ? 'is-answer' : ''} ${done && k === s.picked && o !== c.a ? 'is-miss' : ''}" data-action="pick" data-id="${k}" ${done ? 'disabled' : ''}><i>${LETTERS[k]}</i><span>${math(o)}</span></button>`).join('')}</div>
  ${done ? `<div class="fib-why ${right ? 'right' : 'wrong'}"><b>${right ? `ঠিক! +${bn(s.level)}` : s.picked === -1 ? 'সময় শেষ!' : 'হলো না।'}</b> উত্তর ${math(c.a)}। ${math(c.why)}</div>${button(s.asked >= total() ? 'ফলাফল দেখুন' : 'পরের প্রশ্ন', 'next', 'primary wide', s.asked >= total() ? 'trophy' : 'arrow')}` : ''}
  <div class="fib-scores">${s.players.map((q, k) => `<span class="${q === p ? 'is-turn' : ''}">${playerDot(q.name, k)}${esc(q.name)} <b>${bn(q.score)}</b></span>`).join('')}</div>`;
}

const labels = { caption: 'ফলাফল', rank: '#', player: 'খেলোয়াড় · শেষ পাঁচ প্রশ্ন', points: 'পয়েন্ট', win: 'সবুজ: ঠিক', loss: 'লাল: ভুল', order: 'নতুনটি বাঁ দিকে', empty: 'এখনও কোনো প্রশ্ন খেলা হয়নি।', noGames: 'এখনও খেলেননি', number: bn };
const rows = () => s.players.map(p => ({ name: p.name, score: p.score, note: `${bn(p.right || 0)}/${bn(s.per)} ঠিক`, history: p.history || [] }));
function summary() {
  const ranked = [...s.players].sort((a, b) => b.score - a.score), best = ranked[0], tie = ranked.length > 1 && ranked[1].score === best.score;
  return `<div class="fib-over">${SPIRAL}<span class="eyebrow">স্তর ${bn(s.level)} · ${lv().name}</span><h1>${s.players.length === 1 ? `${bn(best.right || 0)}/${bn(s.per)} ঠিক!` : tie ? 'সমানে সমান!' : esc(best.name) + ' জিতলেন!'}</h1><p class="lede">${s.players.length === 1 ? `${bn(best.score)} পয়েন্ট পেলেন।` : tie ? 'আরেক দফা হয়ে যাক।' : `${bn(best.score)} পয়েন্ট নিয়ে সবার আগে।`}</p></div>
  <section class="rank-section"><h2>ফলাফল</h2>${rankTable(rows(), labels)}</section>
  <div class="fib-actions">${button('আবার খেলুন', 'start', 'primary wide', 'play')}${button('স্তর বা নাম বদলান', 'edit', 'secondary wide', 'edit')}</div>`;
}
function rules() {
  return `${pageHead('নিয়ম', 'Fibonacci', '')}<ol class="plain-rules">
  <li>নাম দিয়ে বা অ্যাকাউন্ট থেকে খেলোয়াড় যোগ করুন। একা বা কয়েকজন মিলে খেলা যায়।</li>
  <li>স্তর বেছে নিন: ১ অঙ্কুর (৯–১২ বছর), ২ পাতা (৭ম–১০ম শ্রেণি), ৩ শাখা (একাদশ–দ্বাদশ), ৪ মহীরুহ (বিজ্ঞানের স্নাতক)।</li>
  <li>পালা করে একেকজন একটা করে প্রশ্নের উত্তর দেবেন। চারটা উত্তরের একটাই ঠিক।</li>
  <li>ঠিক উত্তরে স্তরের সমান পয়েন্ট: স্তর ১-এ +১, স্তর ৪-এ +৪। ভুল বা সময় শেষ হলে কিছু নেই।</li>
  <li>উত্তরের পর ছোট করে কীভাবে হলো দেখানো হয়।</li>
  <li>সবার প্রশ্ন শেষ হলে ফল র‍্যাঙ্কিংয়ে সেভ হয়।</li></ol>`;
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

function screenKey() { return view !== 'play' ? view : s.phase + s.asked; }
function render() {
  const key = screenKey(), changed = key !== lastScreen; lastScreen = key;
  const body = view === 'rules' ? rules() : view === 'ranking' ? ranking() : s.phase === 'ask' ? asking() : s.phase === 'over' ? summary() : setup();
  $('#app').innerHTML = appShell({ brand: 'Fibonacci', brandSub: 'অঙ্কের খেলা', brandIcon: 'grid', brandAction: 'tab-play', crumb: view === 'rules' ? 'নিয়ম' : view === 'ranking' ? 'র‍্যাঙ্কিং' : s.phase === 'ask' ? `প্রশ্ন ${bn(s.asked)}` : s.phase === 'over' ? 'ফলাফল' : 'স্তর বাছাই', active: view, contentClass: 'game-content fib-content', labels: { back: 'সব খেলা', menu: 'মেনু', sections: 'খেলার অংশ' },
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
  s.players.push({ id: crypto.randomUUID(), name, score: 0, right: 0, history: [] }); save(); return true;
}
function nextQuestion() { s.asked++; s.current = makeQuestion(s.level); s.picked = null; s.endsAt = Date.now() + lv().seconds * 1000; s.phase = 'ask'; }
function answer(k) {
  if (s.phase !== 'ask' || s.picked !== null) return;
  const p = turn(), ok = k >= 0 && s.current.options[k] === s.current.a;
  s.picked = k; s.endsAt = null;
  if (ok) { p.score += s.level; p.right = (p.right || 0) + 1; }
  p.history = [{ won: ok, img: ART, label: `স্তর ${bn(s.level)} · ${ok ? 'ঠিক' : 'ভুল'}` }, ...(p.history || [])].slice(0, 5);
  save(); sound(ok ? 'win' : 'wrong'); render();
}
function finish() {
  s.phase = 'over'; s.endsAt = null;
  saveMatch({ id: crypto.randomUUID(), game: 'fib', games: s.asked, players: s.players.map(p => ({ name: p.name, points: p.score, recent: p.history })) });
  save(); sound('win');
}

async function act(action, id) {
  switch (action) {
    case 'tab-play': case 'tab-rules': case 'tab-ranking': { const next = action.slice(4); if (view === next) return; view = next; return transition(); }
    case 'app-menu': return openMenu();
    case 'games': location.href = 'index.html'; return;
    case 'level': s.level = Math.max(1, Math.min(4, Number(id))); save(); return render();
    case 'per': s.per = COUNTS.includes(Number(id)) ? Number(id) : 5; save(); return render();
    case 'add-acc': { const a = readAccounts().find(x => x.id === id); if (a && addPlayer(a.name)) render(); return; }
    case 'remove': s.players = s.players.filter(p => p.id !== id); save(); return render();
    case 'start': if (!s.players.length) return; view = 'play'; s.asked = 0; s.players.forEach(p => { p.score = 0; p.right = 0; p.history = []; }); nextQuestion(); save(); sound('notice'); return transition();
    case 'pick': return answer(Number(id));
    case 'next': if (s.picked === null) return; if (s.asked >= total()) finish(); else nextQuestion(); save(); return transition();
    case 'edit': s.phase = 'setup'; save(); return transition();
    case 'end': case 'new':
      if (s.phase !== 'ask') { s.phase = 'setup'; save(); return transition(); }
      if (!await confirm('খেলা থামাবেন?', 'এ পর্যন্ত যা পয়েন্ট হয়েছে, তা র‍্যাঙ্কিংয়ে সেভ হবে।')) return;
      if (s.picked === null) s.asked--;
      if (s.asked > 0) finish(); else s.phase = 'setup';
      save(); return transition();
  }
}

/* ---------- Dialogs and timer ---------- */

function closeOverlay() { $('#overlay').innerHTML = ''; modalResolve?.(false); modalResolve = null; }
function confirm(title, text) {
  return new Promise(resolve => {
    closeOverlay(); modalResolve = resolve;
    $('#overlay').innerHTML = `<div class="scrim"><section class="dialog" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="dialog-mark">${icon('grid')}</div><h2>${esc(title)}</h2><p>${esc(text)}</p><div class="dialog-actions"><button class="btn primary" id="confirm-yes">হ্যাঁ, থামান</button><button class="btn secondary" id="confirm-no">খেলা চলুক</button></div></section></div>`;
    $('#confirm-yes').onclick = () => { modalResolve = null; $('#overlay').innerHTML = ''; resolve(true); };
    $('#confirm-no').onclick = closeOverlay; $('#confirm-no').focus();
  });
}
function openMenu() {
  closeOverlay();
  const items = [...(s.phase === 'ask' ? [['খেলা থামান', 'trophy', 'end', 'tone-danger']] : []), ['শব্দ: ' + (soundEnabled() ? 'চালু' : 'বন্ধ'), 'sound', 'sound', ''], ['সব খেলায় ফিরে যান', 'back', 'games', 'tone-quiet']];
  $('#overlay').innerHTML = `<div class="scrim"><section class="dialog app-menu-dialog" role="dialog" aria-modal="true" aria-labelledby="menu-title"><div class="picker-title"><h2 id="menu-title">মেনু</h2><button type="button" id="close-menu" class="icon-btn" aria-label="বন্ধ করুন">${icon('close')}</button></div><div class="app-menu-items">${items.map(([label, ic, a, tone]) => `<button class="btn secondary wide ${tone}" type="button" data-menu="${a}">${icon(ic)}${label}${icon('arrow')}</button>`).join('')}</div></section></div>`;
  $('#close-menu').onclick = closeOverlay;
  $$('[data-menu]').forEach(el => el.onclick = () => { const a = el.dataset.menu; closeOverlay(); if (a === 'sound') { toggleSound(); openMenu(); } else act(a); });
}
addEventListener('keydown', e => {
  if (e.key === 'Escape' && $('#overlay').innerHTML) return closeOverlay();
  // Keys 1–4 pick an answer on a keyboard.
  if (view === 'play' && s.phase === 'ask' && s.picked === null && /^[1-4]$/.test(e.key) && !e.target.closest('input')) answer(Number(e.key) - 1);
});
setInterval(() => {
  if (view !== 'play' || s.phase !== 'ask' || s.picked !== null || !s.endsAt) return;
  const n = left(); if (n <= 0) return answer(-1);
  const c = $('#timer-clock'), ring = $('#timer-ring');
  if (c) c.textContent = bn(n); if (ring) ring.style.strokeDashoffset = String(119.4 * (1 - n / lv().seconds));
  $('.fib-timer')?.classList.toggle('is-urgent', n <= 5);
}, 250);

render();
if ('serviceWorker' in navigator && !window.Android && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => { });

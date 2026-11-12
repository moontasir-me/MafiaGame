import { RIDDLES } from './riddles.mjs';
import { sound, soundEnabled, toggleSound } from './sound.mjs';
import { esc, icon, rankTable, enterScreen, leaveScreen, appShell, pageHead } from './ui-kit.mjs';

const $ = q => document.querySelector(q), $$ = q => [...document.querySelectorAll(q)];
const bn = n => Number(n).toLocaleString('bn-BD');
const KEY = 'kalidas.v1', ART = { HIMU: 'assets/kalidas/himu.svg', MISIR: 'assets/kalidas/misir.svg' };
const TIMES = [15, 30, 45, 60, 90, 120], ROUNDS = [5, 10, 20, 30, 50];

// Riddles never repeat until the whole collection has been played once.
function shuffled(n) { const a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function fresh() { return { v: 1, phase: 'setup', players: [], seconds: 45, rounds: 10, deck: shuffled(RIDDLES.length), pos: 0, asked: 0, turn: 0, endsAt: null, timedOut: false, current: null, group: { score: 0, history: [] } }; }
let s = fresh(), view = 'play', lastScreen = '', toastTimer, modalResolve, newRow = null;
try {
  const raw = JSON.parse(localStorage.getItem(KEY));
  if (raw?.v === 1 && Array.isArray(raw.deck) && raw.deck.length <= RIDDLES.length) {
    // Riddles added since the last visit join the unplayed part of the deck; scores are kept.
    const known = new Set(raw.deck), added = shuffled(RIDDLES.length).filter(i => !known.has(i));
    s = { ...fresh(), ...raw, deck: [...raw.deck, ...added] };
  }
} catch { }

const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { toast('তথ্য সেভ করা যায়নি।'); } };
function toast(text) { clearTimeout(toastTimer); const t = $('#toast'); t.textContent = text; t.classList.add('visible'); toastTimer = setTimeout(() => t.classList.remove('visible'), 2600); }
const button = (text, action, cls = 'primary', ico = 'arrow', extra = '') => `<button type="button" class="btn ${cls}" data-action="${action}" ${extra}>${text}${ico ? icon(ico) : ''}</button>`;
const riddle = () => RIDDLES[s.current] || ['', ''];
const answerer = () => s.players.length ? s.players[s.turn % s.players.length] : null;
const left = () => s.endsAt ? Math.max(0, Math.ceil((s.endsAt - Date.now()) / 1000)) : s.seconds;
const clock = n => `${bn(Math.floor(n / 60))}:${bn(n % 60).padStart(2, '০')}`;

/* ---------- Screens ---------- */

function setup() {
  return `<section class="hero minimal-hero kalidas-hero"><div class="hero-copy"><span class="world-chip">${icon('book')}হুমায়ূন আহমেদের হিমু ও মিসির আলিকে শ্রদ্ধা</span><h1>কহেন কবি<br><em>কালিদাস</em></h1><p>হলুদ পাঞ্জাবি পরে হিমু ধাঁধা ধরবে, ঘড়ি চলবে টিক টিক। মিসির আলির মতো মাথা খাটান; না পারলে সময়ের আগেই উত্তর দেখে নিন।</p><div class="hero-buttons">${button('ধাঁধা শুরু', 'start', 'primary', 'play')}<a class="btn secondary" href="#players">খেলোয়াড় যোগ করুন</a></div></div><div class="hero-art kalidas-cover"><img src="assets/kalidas/cover.svg" width="640" height="420" alt="জানালার বাইরে ল্যাম্পপোস্টের নিচে হলুদ পাঞ্জাবিতে হিমু প্রশ্ন ছুড়ছে; ভেতরে হারিকেনের আলোয় খাতা হাতে মিসির আলি"></div></section>
  <details class="cast-drawer"><summary>চরিত্রগুলো দেখুন</summary><div class="cast-grid kalidas-cast"><article class="cast-card"><img class="character-avatar" src="${ART.HIMU}" alt="" width="80" height="80"><h3>হিমু</h3><small>ধাঁধা ধরে</small><p>হলুদ পাঞ্জাবি, খালি পা, রহস্যময় হাসি। প্রশ্ন ছুড়ে দিয়ে চুপ করে থাকে।</p></article><article class="cast-card"><img class="character-avatar" src="${ART.MISIR}" alt="" width="80" height="80"><h3>মিসির আলি</h3><small>উত্তর খোঁজেন · আপনি</small><p>যুক্তি দিয়ে ভাবেন। ঠিক উত্তরে সবুজ ফ্রেম, ভুলে লাল।</p></article></div></details>
  <section class="panel kalidas-setup" id="players"><div class="list-heading"><span>কারা খেলছেন? <small>(ঐচ্ছিক)</small></span><span>${bn(s.players.length)} / ২০</span></div>
  <form id="name-form" class="name-form"><div class="input-wrap">${icon('person')}<input id="player-name" placeholder="খেলোয়াড়ের নাম" autocomplete="off" maxlength="20" aria-label="খেলোয়াড়ের নাম"></div><button class="btn primary" type="submit">যোগ করুন${icon('plus')}</button></form>
  ${s.players.length ? `<div class="name-list">${s.players.map((p, i) => `<div class="name-row kalidas-row ${p.id === newRow ? 'is-new' : ''}"><span class="seat-initial" aria-hidden="true">${esc(p.name.charAt(0))}</span><div class="seat-name"><span class="player-name">${esc(p.name)}</span><small class="seat-number">${bn(i + 1)}</small></div><button type="button" class="icon-btn" data-action="remove" data-id="${p.id}" aria-label="${esc(p.name)} সরান">${icon('trash')}</button></div>`).join('')}</div>` : `<p class="kalidas-hint">নাম না দিলে সবাই মিলে এক দল হয়ে খেলবেন। নাম দিলে একে একে পালা আসবে।</p>`}
  <div class="spy-prefs"><label for="seconds">প্রতি ধাঁধার সময়<select id="seconds">${TIMES.map(n => `<option value="${n}" ${s.seconds === n ? 'selected' : ''}>${bn(n)} সেকেন্ড</option>`).join('')}</select></label><label for="rounds">এক খেলায় ধাঁধা<select id="rounds">${ROUNDS.map(n => `<option value="${n}" ${s.rounds === n ? 'selected' : ''}>${bn(n)}টি</option>`).join('')}</select></label></div>
  <div class="form-bottom"><small>${bn(RIDDLES.length)}টি ধাঁধা · ${bn(RIDDLES.length - s.pos)}টি এখনও আসেনি</small>${button('ধাঁধা শুরু', 'start', 'primary', 'play')}</div></section>`;
}

function asking() {
  const [q, a] = riddle(), p = answerer(), n = left(), revealed = s.phase === 'reveal';
  const pct = Math.max(0, Math.min(1, n / s.seconds));
  return `<div class="reveal-step"><span>ধাঁধা ${bn(s.asked)} / ${bn(s.rounds)}</span><span>${p ? esc(p.name) + '-এর পালা' : 'সবাই মিলে'}</span></div><div class="reveal-progress"><i style="width:${s.asked / s.rounds * 100}%"></i></div>
  <section class="riddle-card ${revealed ? 'is-revealed' : ''}"><div class="riddle-asker"><img src="${ART.HIMU}" alt="" width="56" height="56"><span><b>হিমু জিজ্ঞেস করছে</b><small>${p ? esc(p.name) + ', বলুন তো' : 'বলুন তো দেখি'}</small></span>
  <div class="riddle-timer ${n <= 5 && !revealed ? 'is-urgent' : ''} ${revealed ? 'is-done' : ''}" role="timer" aria-label="বাকি সময়"><svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19" class="track"/><circle cx="22" cy="22" r="19" class="ring" id="timer-ring" style="stroke-dashoffset:${119.4 * (1 - pct)}"/></svg><span id="timer-clock">${revealed ? '✓' : clock(n)}</span></div></div>
  <blockquote class="riddle-text">${q.split('\n').map(esc).join('<br>')}</blockquote>
  ${revealed ? `<div class="riddle-answer"><span>${s.timedOut ? 'সময় শেষ! উত্তর' : 'উত্তর'}</span><strong>${esc(a)}</strong></div>` : ''}</section>
  ${revealed ? `<p class="kalidas-ask">${p ? esc(p.name) + ' কি পেরেছেন?' : 'পেরেছেন?'}</p><div class="answer-actions">${button('পেরেছি', 'right', 'primary right-btn', 'check')}${button('পারিনি', 'wrong', 'secondary wrong-btn', 'close')}</div>`
    : `<div class="reveal-actions">${button('উত্তর দেখাও', 'reveal', 'primary wide', 'eye')}<small>সময় শেষ হলে উত্তর নিজে থেকেই দেখাবে।</small></div>`}`;
}

function rows() {
  const cell = h => ({ won: h.won, img: h.won ? ART.MISIR : ART.HIMU, label: h.won ? 'ঠিক উত্তর' : 'পারেননি' });
  return s.players.length ? s.players.map(p => ({ name: p.name, score: p.score, history: p.history.map(cell) })) : (s.group.history.length || s.group.score ? [{ name: 'সবাই মিলে', score: s.group.score, history: s.group.history.map(cell) }] : []);
}
const labels = { caption: 'ধাঁধার র‍্যাঙ্কিং', rank: '#', player: 'খেলোয়াড় · শেষ পাঁচ ধাঁধা', points: 'পয়েন্ট', win: 'সবুজ ফ্রেম ঠিক উত্তর', loss: 'লাল ফ্রেম পারেননি', order: 'নতুনটি বাঁ দিকে', empty: 'এখনও কোনো ধাঁধার উত্তর দেওয়া হয়নি।', noGames: 'এখনও খেলেননি', number: bn };

function summary() {
  const ranked = rows().sort((a, b) => b.score - a.score), best = ranked[0], tie = ranked.length > 1 && ranked[1].score === best.score;
  return `<div class="over-heading"><div class="result-portrait win"><img src="${ART.MISIR}" alt="" width="112" height="112"></div><span class="eyebrow">খেলা শেষ · ${bn(s.rounds)}টি ধাঁধা</span><h1>${!best ? 'খেলা শেষ!' : tie ? 'সমানে সমান!' : s.players.length ? esc(best.name) + ' এগিয়ে!' : bn(best.score) + 'টি ধাঁধা ভাঙলেন!'}</h1><p class="lede">হিমু হাসছে। পরের খেলায় নতুন ধাঁধা আসবে; আগেরগুলো আবার আসবে সব শেষ হলে।</p></div>
  <section class="rank-section"><h2>র‍্যাঙ্কিং</h2><p>মোট পয়েন্ট আর শেষ পাঁচ ধাঁধার ফল।</p>${rankTable(rows(), labels)}</section>
  <div class="end-actions">${button('আরেক দফা', 'start', 'primary wide', 'play')}${button('নাম বা সময় বদলান', 'edit', 'secondary wide', 'edit')}</div>`;
}

function rulesScreen() {
  const steps = [['ধাঁধা', 'হিমু একটি করে বাংলা ধাঁধা ধরবে। পুরোনো দিনের লোকজ ধাঁধা—ছড়ায়, ছন্দে।'], ['ঘড়ি', 'প্রতিটি ধাঁধার জন্য সময় বেছে নিন। সময় শেষ হলে উত্তর নিজে থেকে দেখা যাবে।'], ['উত্তর', 'না পারলে সময়ের আগেই “উত্তর দেখাও” চাপুন।'], ['পয়েন্ট', 'ঠিক উত্তরে ১ পয়েন্ট। নাম দিলে পালা একে একে ঘুরবে; না দিলে সবাই মিলে এক দল।'], ['নতুন ধাঁধা', 'সব ধাঁধা একবার করে না আসা পর্যন্ত কোনোটি আবার আসবে না।']];
  return `${pageHead('খেলার নিয়ম', 'কহেন কবি কালিদাস', 'এক ফোনে বাংলা ধাঁধার খেলা। একা বা দলে।')}<div class="rules-list">${steps.map((r, i) => `<article><b>${bn(i + 1)}</b><div><h3>${r[0]}</h3><p>${r[1]}</p></div></article>`).join('')}</div><p class="spy-source">“কহেন কবি কালিদাস” হুমায়ূন আহমেদের মিসির আলি-উপন্যাসের নাম; হিমু ও মিসির আলি তাঁর সৃষ্টি। এই খেলা ভক্তের শ্রদ্ধাঞ্জলি, ছবিগুলো এই অ্যাপের জন্য আঁকা ক্যারিকেচার। মোট ${bn(RIDDLES.length)}টি ধাঁধা। বেশিরভাগ <a href="https://github.com/Labib1610/BanglaRiddleEval">BanglaRiddleEval</a> (MIT লাইসেন্স) থেকে, যা বাংলা ধাঁধার বই থেকে সংকলিত; বাকিগুলো বিভিন্ন বাংলা ধাঁধার ওয়েবপাতা থেকে বাছাই করা প্রচলিত ধাঁধা।</p>`;
}

function rankingScreen() {
  const can = rows().length && ['setup', 'over'].includes(s.phase);
  return `${pageHead('র‍্যাঙ্কিং · মোট পয়েন্ট', 'কে বেশি ধাঁধা ভাঙল?', 'ঠিক উত্তরে এক পয়েন্ট।')}${rankTable(rows(), labels)}${can ? `<button class="btn text wide" type="button" data-action="reset-scores">${icon('trash')}পয়েন্ট মুছে নতুন শুরু</button>` : ''}`;
}

/* ---------- Shell ---------- */

const playing = () => ['ask', 'reveal'].includes(s.phase);
function screenKey() { return view !== 'play' ? view : playing() ? 'q:' + s.asked + ':' + s.phase : s.phase; }
function render() {
  const draft = $('#player-name')?.value, focused = document.activeElement?.id, key = screenKey(), changed = key !== lastScreen; lastScreen = key;
  const body = view === 'rules' ? rulesScreen() : view === 'ranking' ? rankingScreen() : s.phase === 'setup' ? setup() : s.phase === 'over' ? summary() : asking();
  $('#app').innerHTML = appShell({ brand: 'কহেন কবি কালিদাস', brandSub: 'বাংলা ধাঁধা', brandIcon: 'spark', brandAction: 'tab-play', crumb: view === 'rules' ? 'নিয়ম' : view === 'ranking' ? 'র‍্যাঙ্কিং' : playing() ? `ধাঁধা ${bn(s.asked)} / ${bn(s.rounds)}` : s.phase === 'over' ? 'ফলাফল' : 'হিমুর ধাঁধা', active: view, contentClass: view === 'play' && s.phase === 'setup' ? 'home-content kalidas-content' : 'game-content kalidas-content', labels: { back: 'সব খেলা', menu: 'মেনু', sections: 'খেলার অংশ' },
    tabs: [{ id: 'play', label: 'খেলা', icon: 'play', action: 'tab-play' }, { id: 'rules', label: 'নিয়ম', icon: 'book', action: 'tab-rules' }, { id: 'ranking', label: 'র‍্যাঙ্কিং', icon: 'trophy', action: 'tab-ranking' }], body });
  if (draft && $('#player-name')) $('#player-name').value = draft;
  if (focused === 'player-name') $('#player-name')?.focus();
  newRow = null; bind();
  if (changed) enterScreen($('#screen'));
}

function bind() {
  $$('[data-action]').forEach(el => el.onclick = e => { if (el.type === 'submit') return; e.preventDefault(); act(el.dataset.action, el.dataset.id); });
  $('.hero-buttons a[href="#players"]')?.addEventListener('click', e => { e.preventDefault(); $('#players').scrollIntoView({ behavior: 'smooth' }); setTimeout(() => $('#player-name')?.focus({ preventScroll: true }), 400); });
  $('#name-form')?.addEventListener('submit', e => {
    e.preventDefault(); const name = $('#player-name').value.trim();
    if (!name || name.length > 20 || s.players.some(p => p.name.toLocaleLowerCase() === name.toLocaleLowerCase())) return toast('একটি আলাদা নাম দিন, সর্বোচ্চ ২০ অক্ষরে।');
    if (s.players.length >= 20) return toast('সর্বোচ্চ ২০ জন।');
    const id = crypto.randomUUID(); s.players.push({ id, name, score: 0, history: [] }); newRow = id; $('#player-name').value = ''; save(); render(); $('#player-name').focus();
  });
  $('#seconds')?.addEventListener('change', e => { s.seconds = Number(e.target.value); save(); });
  $('#rounds')?.addEventListener('change', e => { s.rounds = Number(e.target.value); save(); });
}

const transition = fn => leaveScreen($('#screen'), () => { fn?.(); render(); window.scrollTo({ top: 0, behavior: 'instant' }); });
function nextRiddle() {
  if (s.pos >= s.deck.length) { s.deck = shuffled(RIDDLES.length); s.pos = 0; }
  s.current = s.deck[s.pos++]; s.asked++; s.phase = 'ask'; s.timedOut = false; s.endsAt = Date.now() + s.seconds * 1000;
}
function reveal(timedOut = false) { if (s.phase !== 'ask') return; s.phase = 'reveal'; s.timedOut = timedOut; s.endsAt = null; save(); sound(timedOut ? 'timer' : 'notice'); render(); }
function score(won) {
  const p = answerer(), target = p || s.group;
  if (won) target.score++;
  target.history.unshift({ won, at: Date.now() }); target.history = target.history.slice(0, 5);
  sound(won ? 'win' : 'out');
  if (s.asked >= s.rounds) { s.phase = 'over'; s.endsAt = null; } else { s.turn++; nextRiddle(); }
  save(); transition();
}

async function act(action, id) {
  switch (action) {
    case 'tab-play': case 'tab-rules': case 'tab-ranking': { const next = action.slice(4); if (view === next) return; view = next; return transition(); }
    case 'app-menu': return openMenu();
    case 'games': location.href = 'index.html'; return;
    case 'remove': s.players = s.players.filter(p => p.id !== id); save(); return render();
    case 'start': view = 'play'; s.asked = 0; s.turn = 0; nextRiddle(); save(); sound('notice'); return transition();
    case 'reveal': return reveal(false);
    case 'right': return score(true);
    case 'wrong': return score(false);
    case 'edit': view = 'play'; s.phase = 'setup'; save(); return transition();
    case 'new': if (playing() && !await confirmDialog('এই খেলা থামাবেন?', 'এখন পর্যন্ত পাওয়া পয়েন্ট থেকে যাবে।')) return; view = 'play'; s.phase = 'setup'; s.endsAt = null; save(); return transition();
    case 'reset-scores': if (!await confirmDialog('সব পয়েন্ট মুছবেন?', 'নাম থাকবে, পয়েন্ট ও শেষ পাঁচ ধাঁধার ফল মুছে যাবে।')) return; s.players.forEach(p => { p.score = 0; p.history = []; }); s.group = { score: 0, history: [] }; save(); return render();
  }
}

/* ---------- Dialogs ---------- */

function closeOverlay() { const r = modalResolve; modalResolve = null; $('#overlay').innerHTML = ''; r?.(false); }
function confirmDialog(title, text) {
  closeOverlay();
  return new Promise(resolve => {
    modalResolve = resolve;
    $('#overlay').innerHTML = `<div class="scrim"><section class="dialog" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="dialog-mark">${icon('spark')}</div><h2>${esc(title)}</h2><p>${esc(text)}</p><div class="dialog-actions"><button class="btn primary" id="confirm-yes">হ্যাঁ, নিশ্চিত</button><button class="btn secondary" id="confirm-no">থাক</button></div></section></div>`;
    $('#confirm-yes').onclick = () => { modalResolve = null; $('#overlay').innerHTML = ''; resolve(true); };
    $('#confirm-no').onclick = closeOverlay; $('#confirm-no').focus();
  });
}
function openMenu() {
  closeOverlay();
  const items = [[playing() ? 'এই খেলা থামিয়ে নতুন খেলা' : 'নতুন খেলা', playing() ? 'close' : 'plus', 'new'], ['শব্দ: ' + (soundEnabled() ? 'চালু' : 'বন্ধ'), 'sound', 'sound'], ['সব খেলায় ফিরে যান', 'back', 'games']];
  $('#overlay').innerHTML = `<div class="scrim"><section class="dialog app-menu-dialog" role="dialog" aria-modal="true" aria-labelledby="menu-title"><div class="picker-title"><h2 id="menu-title">মেনু</h2><button type="button" id="close-menu" class="icon-btn" aria-label="বন্ধ করুন">${icon('close')}</button></div><div class="app-menu-items">${items.map(([label, ic, a]) => `<button class="btn secondary wide" type="button" data-menu="${a}">${icon(ic)}${label}${icon('arrow')}</button>`).join('')}</div></section></div>`;
  $('#close-menu').onclick = closeOverlay;
  $$('[data-menu]').forEach(el => el.onclick = () => { const a = el.dataset.menu; closeOverlay(); if (a === 'sound') { toggleSound(); openMenu(); } else act(a); });
}

/* ---------- Timer ---------- */

setInterval(() => {
  if (s.phase !== 'ask' || view !== 'play') return;
  const n = left();
  if (n <= 0) return reveal(true);
  const c = $('#timer-clock'), ring = $('#timer-ring');
  if (c) c.textContent = clock(n);
  if (ring) ring.style.strokeDashoffset = String(119.4 * (1 - n / s.seconds));
  $('.riddle-timer')?.classList.toggle('is-urgent', n <= 5);
}, 200);
window.onNativeBack = () => { if ($('#overlay').children.length) return closeOverlay(); if (view !== 'play') return act('tab-play'); if (s.phase === 'setup') location.href = 'index.html'; else openMenu(); };

render();
if ('serviceWorker' in navigator && !window.Android && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => { });

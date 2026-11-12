import { RIDDLES } from './riddles.mjs';
import { sound, soundEnabled, toggleSound } from './sound.mjs';
import { saveMatch, readHistory, hallOfFame } from './history.mjs';
import { fameTable, playerColour, esc, icon, rankTable, enterScreen, leaveScreen, appShell, pageHead } from './ui-kit.mjs';

const $ = q => document.querySelector(q), $$ = q => [...document.querySelectorAll(q)];
const bn = n => Number(n).toLocaleString('bn-BD');
const KEY = 'kalidas.v1', ART = { HIMU: 'assets/kalidas/himu.svg', MISIR: 'assets/kalidas/misir.svg' };
const TIMES = [15, 30, 45, 60, 90, 120];
const NOBODY = 'nobody', US = 'us';
// A fresh short folk riddle on every visit (short enough to read at a glance, with a one-word answer).
const SHORT = RIDDLES.filter(([q, a]) => q.length <= 70 && a.length <= 14 && !/[A-Za-z?]/.test(q)), HERO = SHORT[crypto.getRandomValues(new Uint32Array(1))[0] % SHORT.length] || RIDDLES[0];

// Riddles never repeat until the whole collection has been played once.
function shuffled(n) { const a = Array.from({ length: n }, (_, i) => i); for (let i = n - 1; i > 0; i--) { const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
function fresh() { return { v: 1, phase: 'setup', players: [], seconds: 45, deck: shuffled(RIDDLES.length), pos: 0, asked: 0, endsAt: null, revealed: false, timedOut: false, current: null, choice: null, group: { score: 0, history: [] } }; }
let s = fresh(), view = 'play', lastScreen = '', toastTimer, modalResolve, newRow = null;
try {
  const raw = JSON.parse(localStorage.getItem(KEY));
  if (raw?.v === 1 && Array.isArray(raw.deck) && raw.deck.length <= RIDDLES.length) {
    // Riddles added since the last visit join the unplayed part of the deck; names and scores are kept.
    const known = new Set(raw.deck), added = shuffled(RIDDLES.length).filter(i => !known.has(i));
    s = { ...fresh(), ...raw, deck: [...raw.deck, ...added] };
    if (s.phase === 'reveal') { s.phase = 'ask'; s.revealed = true; }
  }
} catch { }

const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { toast('তথ্য সেভ করা যায়নি।'); } };
function toast(text) { clearTimeout(toastTimer); const t = $('#toast'); t.textContent = text; t.classList.add('visible'); toastTimer = setTimeout(() => t.classList.remove('visible'), 2600); }
const button = (text, action, cls = 'primary', ico = 'arrow', extra = '') => `<button type="button" class="btn ${cls}" data-action="${action}" ${extra}>${text}${ico ? icon(ico) : ''}</button>`;
const riddle = () => RIDDLES[s.current] || ['', ''];
const left = () => s.endsAt ? Math.max(0, Math.ceil((s.endsAt - Date.now()) / 1000)) : 0;
const clock = n => `${bn(Math.floor(n / 60))}:${bn(n % 60).padStart(2, '০')}`;
const playing = () => s.phase === 'ask';

/* ---------- Screens ---------- */

function setup() {
  return `<section class="hero minimal-hero kalidas-hero"><div class="hero-copy"><h1>কহেন কবি<br><em>কালিদাস</em></h1><blockquote class="hero-riddle">${HERO[0].split('\n').map(esc).join('<br>')}<cite>প্রচলিত বাংলা ধাঁধা · উত্তর: ${esc(HERO[1])}</cite></blockquote><div class="hero-buttons">${button('ধাঁধা শুরু', 'start', 'primary', 'play')}<a class="btn secondary" href="#players">খেলোয়াড় যোগ করুন</a></div></div><div class="hero-art kalidas-cover"><img src="assets/kalidas/cover.svg" width="640" height="420" alt="জানালার বাইরে ল্যাম্পপোস্টের নিচে হলুদ পাঞ্জাবিতে হিমু প্রশ্ন ছুড়ছে; ভেতরে হারিকেনের আলোয় খাতা হাতে মিসির আলি"></div></section>
  <details class="cast-drawer"><summary>চরিত্রগুলো দেখুন</summary><div class="cast-grid kalidas-cast"><article class="cast-card"><img class="character-avatar" src="${ART.HIMU}" alt="" width="80" height="80"><h3>হিমু</h3><small>ধাঁধা ধরে</small><p>হলুদ পাঞ্জাবি, খালি পা, রহস্যময় হাসি। প্রশ্ন ছুড়ে দিয়ে চুপ করে থাকে।</p></article><article class="cast-card"><img class="character-avatar" src="${ART.MISIR}" alt="" width="80" height="80"><h3>মিসির আলি</h3><small>উত্তর খোঁজেন · আপনারা</small><p>যুক্তি দিয়ে ভাবেন। ঠিক উত্তরে সবুজ ফ্রেম, না পারলে লাল।</p></article></div></details>
  <section class="panel kalidas-setup" id="players"><div class="list-heading"><span>কারা খেলছেন?</span><span>${bn(s.players.length)} / ২০</span></div>
  <form id="name-form" class="name-form"><div class="input-wrap">${icon('person')}<input id="player-name" placeholder="খেলোয়াড়ের নাম" autocomplete="off" maxlength="20" aria-label="খেলোয়াড়ের নাম"></div><button class="btn primary" type="submit">যোগ করুন${icon('plus')}</button></form>
  ${s.players.length ? `<div class="name-list">${s.players.map((p, i) => `<div class="name-row kalidas-row ${p.id === newRow ? 'is-new' : ''}"><span class="seat-initial coloured" style="--dot:${playerColour(p.name, i)}" aria-hidden="true">${esc(p.name.charAt(0))}</span><div class="seat-name"><span class="player-name">${esc(p.name)}</span><small class="seat-number">${bn(i + 1)}</small></div><button type="button" class="icon-btn" data-action="remove" data-id="${p.id}" aria-label="${esc(p.name)} সরান">${icon('trash')}</button></div>`).join('')}</div>` : `<p class="kalidas-hint">নাম না দিলে সবাই মিলে এক দল হয়ে খেলবেন।</p>`}
  <div class="spy-prefs one"><label for="seconds">প্রতি ধাঁধার সময়<select id="seconds">${TIMES.map(n => `<option value="${n}" ${s.seconds === n ? 'selected' : ''}>${bn(n)} সেকেন্ড</option>`).join('')}</select></label></div>
  <div class="form-bottom"><small>${s.players.length ? 'সবাই প্রস্তুত?' : 'একা বা দলে'}</small>${button('ধাঁধা শুরু', 'start', 'primary', 'play')}</div></section>`;
}

function choices() {
  const opts = s.players.length ? [...s.players.map(p => [p.id, p.name]), [NOBODY, 'কেউ পারেনি']] : [[US, 'আমরা পেরেছি'], [NOBODY, 'কেউ পারেনি']];
  return `<fieldset class="guess-players winner-pick"><legend>${s.players.length ? 'কে ঠিক বলল?' : 'পেরেছেন?'}</legend>${opts.map(([id, name]) => `<label class="guess-option ${id === NOBODY ? 'is-nobody' : ''}"><input type="radio" name="winner" value="${esc(id)}" ${s.choice === id ? 'checked' : ''}><span class="generic-person ${id === NOBODY || id === US ? '' : 'coloured'}" style="--dot:${playerColour(name, s.players.findIndex(p => p.id === id))}">${id === NOBODY ? icon('close') : id === US ? icon('check') : esc(name.charAt(0))}</span><strong>${esc(name)}</strong></label>`).join('')}</fieldset>`;
}

function asking() {
  const [q, a] = riddle(), n = left(), pct = s.seconds ? n / s.seconds : 0;
  return `<div class="reveal-step"><span>ধাঁধা ${bn(s.asked)}</span><span>${s.players.length ? bn(s.players.length) + ' জন খেলছেন' : 'সবাই মিলে'}</span></div>
  <section class="riddle-card ${s.revealed ? 'is-revealed' : ''}"><div class="riddle-asker"><img src="${ART.HIMU}" alt="" width="56" height="56"><span><b>হিমু জিজ্ঞেস করছে</b><small>যে আগে বলবে, পয়েন্ট তার</small></span>
  <div class="riddle-timer ${n <= 5 && !s.revealed ? 'is-urgent' : ''} ${s.revealed ? 'is-done' : ''}" role="timer" aria-label="বাকি সময়"><svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="19" class="track"/><circle cx="22" cy="22" r="19" class="ring" id="timer-ring" style="stroke-dashoffset:${119.4 * (1 - pct)}"/></svg><span id="timer-clock">${s.revealed ? '✓' : clock(n)}</span></div></div>
  <blockquote class="riddle-text">${q.split('\n').map(esc).join('<br>')}</blockquote>
  ${s.revealed ? `<div class="riddle-answer"><span>${s.timedOut ? 'সময় শেষ! উত্তর' : 'উত্তর'}</span><strong>${esc(a)}</strong></div>` : ''}</section>
  ${choices()}
  <div class="riddle-actions">${s.revealed ? '' : button('উত্তর দেখাও', 'reveal', 'secondary', 'eye')}${button('পরের ধাঁধা', 'next', 'primary', 'arrow', s.choice ? '' : 'disabled')}</div>
  <small class="riddle-help" id="riddle-help">${s.choice ? 'ঠিক করা হয়েছে। পরের ধাঁধায় যান।' : 'যে ঠিক বলল তাকে বেছে নিন, তারপর পরের ধাঁধা।'}</small>
  ${button('খেলা শেষ', 'end', 'text wide end-game', 'trophy')}`;
}

function rows() {
  const cell = h => ({ won: h.won, img: h.won ? ART.MISIR : ART.HIMU, label: h.won ? 'ঠিক উত্তর' : 'পারেননি' });
  return s.players.length ? s.players.map(p => ({ name: p.name, score: p.score, history: p.history.map(cell) })) : (s.asked ? [{ name: 'সবাই মিলে', score: s.group.score, history: s.group.history.map(cell) }] : []);
}
const labels = { caption: 'খেলার ফল', rank: '#', player: 'খেলোয়াড় · শেষ পাঁচ ধাঁধা', points: 'পয়েন্ট', win: 'সবুজ ফ্রেম ঠিক উত্তর', loss: 'লাল ফ্রেম পারেননি', order: 'নতুনটি বাঁ দিকে', empty: 'এখনও কোনো ধাঁধা খেলা হয়নি।', noGames: 'এখনও খেলেননি', number: bn };

function summary() {
  const ranked = rows().sort((a, b) => b.score - a.score), best = ranked[0], tie = ranked.length > 1 && ranked[1].score === best?.score;
  const answered = s.asked;
  return `<div class="over-heading"><div class="result-portrait win"><img src="${ART.MISIR}" alt="" width="112" height="112"></div><span class="eyebrow">খেলা শেষ · ${bn(answered)}টি ধাঁধা</span><h1>${!best ? 'খেলা শেষ!' : tie ? 'সমানে সমান!' : s.players.length ? esc(best.name) + ' জিতলেন!' : bn(best.score) + 'টি ধাঁধা ভাঙলেন!'}</h1><p class="lede">${best && !tie && s.players.length ? `${bn(best.score)} পয়েন্ট নিয়ে সবার আগে।` : 'হিমু হাসছে। পরের খেলায় নতুন ধাঁধা আসবে।'}</p></div>
  <section class="rank-section"><h2>ফলাফল</h2><p>ঠিক উত্তরে এক পয়েন্ট।</p>${rankTable(rows(), labels)}</section>
  <div class="end-actions">${button('আবার খেলুন', 'start', 'primary wide', 'play')}${button('নাম বা সময় বদলান', 'edit', 'secondary wide', 'edit')}</div>
  <section class="fame-section"><h2>${icon('trophy')}হল অব ফেম</h2><p>শেষ ১০০টি খেলায় এক খেলায় সবচেয়ে বেশি ধাঁধা ভাঙা।</p>${fameTable(hallOfFame(readHistory(), 'kalidas'), { caption: 'হল অব ফেম', player: 'খেলোয়াড়', points: 'পয়েন্ট', empty: 'এখনও কেউ হল অব ফেমে ওঠেননি।', number: bn, meta: e => new Date(e.date).toLocaleDateString('bn-BD') + ' · ' + bn(e.games) + 'টি ধাঁধা' })}</section>`;
}

function rulesScreen() {
  const steps = [['নাম ও সময়', 'খেলোয়াড়দের নাম লিখুন, প্রতিটি ধাঁধার সময় বেছে নিন। নাম না দিলে সবাই মিলে এক দল।'], ['ধাঁধা', 'হিমু একের পর এক বাংলা ধাঁধা ধরবে। কোনো নির্দিষ্ট সংখ্যা নেই; থামাতে চাইলে “খেলা শেষ”।'], ['কে পারল', 'যে আগে ঠিক উত্তর বলবে, তার নামের পাশে টিক দিন। কেউ না পারলে “কেউ পারেনি”।'], ['উত্তর', 'সময়ের আগেই “উত্তর দেখাও” চাপতে পারেন। সময় শেষ হলে উত্তর নিজে থেকে দেখাবে।'], ['ফল', '“খেলা শেষ” চাপলে টেবিলে সবার পয়েন্ট আর শেষ পাঁচ ধাঁধার ফল দেখা যাবে।']];
  return `${pageHead('খেলার নিয়ম', 'কহেন কবি কালিদাস', 'এক ফোনে বাংলা ধাঁধার খেলা।')}<div class="rules-list">${steps.map((r, i) => `<article><b>${bn(i + 1)}</b><div><h3>${r[0]}</h3><p>${r[1]}</p></div></article>`).join('')}</div><p class="spy-source">“কহেন কবি কালিদাস” হুমায়ূন আহমেদের মিসির আলি-উপন্যাসের নাম; হিমু ও মিসির আলি তাঁর সৃষ্টি। এই খেলা ভক্তের শ্রদ্ধাঞ্জলি, ছবিগুলো এই অ্যাপের জন্য আঁকা ক্যারিকেচার। ধাঁধার বেশিরভাগ <a href="https://github.com/Labib1610/BanglaRiddleEval">BanglaRiddleEval</a> (MIT লাইসেন্স) থেকে, যা বাংলা ধাঁধার বই থেকে সংকলিত; বাকিগুলো বিভিন্ন বাংলা ধাঁধার ওয়েবপাতা থেকে বাছাই করা প্রচলিত ধাঁধা।</p>`;
}

function rankingScreen() {
  return `${pageHead(playing() ? 'চলমান খেলা' : 'শেষ খেলা', 'ফলাফল', 'ঠিক উত্তরে এক পয়েন্ট। নতুন খেলা শুরু করলে পয়েন্ট শূন্য থেকে গোনা হয়।')}${rankTable(rows(), labels)}`;
}

/* ---------- Shell ---------- */

function screenKey() { return view !== 'play' ? view : playing() ? 'q:' + s.asked : s.phase; }
function render() {
  const draft = $('#player-name')?.value, focused = document.activeElement?.id, key = screenKey(), changed = key !== lastScreen; lastScreen = key;
  const body = view === 'rules' ? rulesScreen() : view === 'ranking' ? rankingScreen() : s.phase === 'setup' ? setup() : s.phase === 'over' ? summary() : asking();
  $('#app').innerHTML = appShell({ brand: 'কহেন কবি কালিদাস', brandSub: 'বাংলা ধাঁধা', brandIcon: 'spark', brandAction: 'tab-play', crumb: view === 'rules' ? 'নিয়ম' : view === 'ranking' ? 'ফলাফল' : playing() ? `ধাঁধা ${bn(s.asked)}` : s.phase === 'over' ? 'ফলাফল' : 'হিমুর ধাঁধা', active: view, contentClass: view === 'play' && s.phase === 'setup' ? 'home-content kalidas-content' : 'game-content kalidas-content', labels: { back: 'সব খেলা', menu: 'মেনু', sections: 'খেলার অংশ' },
    tabs: [{ id: 'play', label: 'খেলা', icon: 'play', action: 'tab-play' }, { id: 'rules', label: 'নিয়ম', icon: 'book', action: 'tab-rules' }, { id: 'ranking', label: 'ফলাফল', icon: 'trophy', action: 'tab-ranking' }], body });
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
  // Picking who got it right never re-renders, so the timer and answer stay put.
  $$('input[name=winner]').forEach(el => el.onchange = () => {
    s.choice = el.value; save();
    const next = $('[data-action=next]'); if (next.disabled) { next.disabled = false; next.classList.add('just-enabled'); }
    $('#riddle-help').textContent = 'ঠিক করা হয়েছে। পরের ধাঁধায় যান।';
  });
}

const transition = fn => leaveScreen($('#screen'), () => { fn?.(); render(); window.scrollTo({ top: 0, behavior: 'instant' }); });
function nextRiddle() {
  if (s.pos >= s.deck.length) { s.deck = shuffled(RIDDLES.length); s.pos = 0; }
  s.current = s.deck[s.pos++]; s.asked++; s.phase = 'ask'; s.revealed = false; s.timedOut = false; s.choice = null; s.endsAt = Date.now() + s.seconds * 1000;
}
function reveal(timedOut = false) { if (!playing() || s.revealed) return; s.revealed = true; s.timedOut = timedOut; s.endsAt = null; save(); sound(timedOut ? 'timer' : 'notice'); render(); }
function record() {
  const mark = (p, won) => { if (won) p.score++; p.history.unshift({ won, at: Date.now() }); p.history = p.history.slice(0, 5); };
  if (s.players.length) s.players.forEach(p => mark(p, p.id === s.choice));
  else mark(s.group, s.choice === US);
  sound(s.choice === NOBODY ? 'out' : 'win');
}

async function act(action, id) {
  switch (action) {
    case 'tab-play': case 'tab-rules': case 'tab-ranking': { const next = action.slice(4); if (view === next) return; view = next; return transition(); }
    case 'app-menu': return openMenu();
    case 'games': location.href = 'index.html'; return;
    case 'remove': s.players = s.players.filter(p => p.id !== id); save(); return render();
    case 'start':
      view = 'play'; s.asked = 0; s.group = { score: 0, history: [] }; s.players.forEach(p => { p.score = 0; p.history = []; });
      nextRiddle(); save(); sound('notice'); return transition();
    case 'reveal': return reveal(false);
    case 'next': if (!s.choice) return; record(); nextRiddle(); save(); return transition();
    case 'end': {
      if (!await confirmDialog('খেলা শেষ করবেন?', s.choice ? 'এই ধাঁধার ফলও যোগ হবে, তারপর ফলাফল দেখাবে।' : 'এই ধাঁধাটি গোনা হবে না। ফলাফলের টেবিল দেখাবে।')) return;
      if (s.choice) record(); else s.asked = Math.max(0, s.asked - 1);
      s.phase = 'over'; s.endsAt = null; s.choice = null; view = 'play';
      if (s.asked) saveMatch({ id: crypto.randomUUID(), game: 'kalidas', games: s.asked, players: rows().map(r => ({ name: r.name, points: r.score, recent: r.history })) });
      save(); sound('win'); return transition();
    }
    case 'edit': view = 'play'; s.phase = 'setup'; s.endsAt = null; save(); return transition();
    case 'new': if (playing()) return act('end'); view = 'play'; s.phase = 'setup'; save(); return transition();
  }
}

/* ---------- Dialogs ---------- */

function closeOverlay() { const r = modalResolve; modalResolve = null; $('#overlay').innerHTML = ''; r?.(false); }
function confirmDialog(title, text) {
  closeOverlay();
  return new Promise(resolve => {
    modalResolve = resolve;
    $('#overlay').innerHTML = `<div class="scrim"><section class="dialog" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="dialog-mark">${icon('spark')}</div><h2>${esc(title)}</h2><p>${esc(text)}</p><div class="dialog-actions"><button class="btn primary" id="confirm-yes">হ্যাঁ, শেষ করুন</button><button class="btn secondary" id="confirm-no">খেলা চলুক</button></div></section></div>`;
    $('#confirm-yes').onclick = () => { modalResolve = null; $('#overlay').innerHTML = ''; resolve(true); };
    $('#confirm-no').onclick = closeOverlay; $('#confirm-no').focus();
  });
}
function openMenu() {
  closeOverlay();
  const items = [[playing() ? 'খেলা শেষ করুন' : 'নতুন খেলা', playing() ? 'trophy' : 'plus', 'new'], ['শব্দ: ' + (soundEnabled() ? 'চালু' : 'বন্ধ'), 'sound', 'sound'], ['সব খেলায় ফিরে যান', 'back', 'games']];
  $('#overlay').innerHTML = `<div class="scrim"><section class="dialog app-menu-dialog" role="dialog" aria-modal="true" aria-labelledby="menu-title"><div class="picker-title"><h2 id="menu-title">মেনু</h2><button type="button" id="close-menu" class="icon-btn" aria-label="বন্ধ করুন">${icon('close')}</button></div><div class="app-menu-items">${items.map(([label, ic, a]) => `<button class="btn secondary wide ${({close:'tone-danger',trophy:'tone-danger',plus:'tone-primary',lock:'tone-primary',spark:'tone-world',person:'tone-people',people:'tone-people',sound:'',back:'tone-quiet'})[ic]||''}" type="button" data-menu="${a}">${icon(ic)}${label}${icon('arrow')}</button>`).join('')}</div></section></div>`;
  $('#close-menu').onclick = closeOverlay;
  $$('[data-menu]').forEach(el => el.onclick = () => { const a = el.dataset.menu; closeOverlay(); if (a === 'sound') { toggleSound(); openMenu(); } else act(a); });
}

/* ---------- Timer ---------- */

setInterval(() => {
  if (!playing() || s.revealed || view !== 'play') return;
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

import { newSpySession, addSpyPlayer, removeSpyPlayer, dealSpy, spyIdentity, nextSpyReveal, endSpyDiscussion, tickSpy, voteSpy, leaveSpyPlayer, resetSpy, restoreSpy } from './spy-local.mjs';
import { newTimer, startTimer, pauseTimer, secondsLeft } from './game-tools.mjs';
import { sound, soundEnabled, toggleSound } from './sound.mjs';
import { characterImage } from './characters.mjs';
import { readHistory, saveMatch, overallRanking, hallOfFame } from './history.mjs';
import { fameTable, playerColour, esc, icon, tapCard, bindTapCard, setTapCard, rankTable, enterScreen, leaveScreen, appShell, pageHead } from './ui-kit.mjs';

const $ = q => document.querySelector(q), $$ = q => [...document.querySelectorAll(q)];
const bn = n => Number(n).toLocaleString('bn-BD');
const KEY = 'mafia.spy.pass.v1';
let s = newSpySession(), view = 'play', shown = false, seen = false, choice = null, toastTimer, modalResolve, lastScreen = '', newRow = null;

try { const raw = JSON.parse(localStorage.getItem(KEY)); if (raw) s = restoreSpy(raw); } catch { }
// Carry over the roster from the old single-phone room version.
if (!localStorage.getItem(KEY)) try { const old = JSON.parse(localStorage.getItem('mafia.spy.local')); for (const p of old?.locals || []) addSpyPlayer(s, p.view.me.name); } catch { }

import { accountChips, bindAccountChips, ensureAccount } from './accounts.mjs';
const button = (text, action, cls = 'primary', ico = 'arrow', extra = '') => `<button type="button" class="btn ${cls}" data-action="${action}" ${extra}>${text}${ico ? icon(ico) : ''}</button>`;
const clock = n => `${bn(Math.floor(n / 60)).padStart(2, '০')}:${bn(n % 60).padStart(2, '০')}`;

function save() { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { toast('তথ্য সেভ করা যায়নি। ফোনে কিছু জায়গা খালি করুন।'); } }
function toast(text) { clearTimeout(toastTimer); const t = $('#toast'); t.textContent = text; t.classList.add('visible'); toastTimer = setTimeout(() => t.classList.remove('visible'), 2800); }
const current = () => s.players.find(p => p.id === s.order[s.revealIndex]);
const byId = id => s.players.find(p => p.id === id);

/* ---------- Detective theme ---------- */

// Every game is a numbered case file.
const caseOf = id => 'নং ' + bn(100 + [...String(id || 'case')].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % 900);
const portrait = role => characterImage(role);
const ROLE = { WORD: 'গোয়েন্দা', SPY: 'গুপ্তচর' };

/* ---------- Screens ---------- */

function setup() {
  const last = s.lastSpyId && byId(s.lastSpyId);
  return `<section class="hero minimal-hero spy-hero"><div class="hero-copy"><h1>সবাই গোয়েন্দা।<br><em>একজন গুপ্তচর।</em></h1><p>সবার নোটবুকে একই গোপন শব্দ। শুধু গুপ্তচরের পাতা ফাঁকা, তবু সে এমন ভাব করবে যেন সব জানে। সূত্র মিলিয়ে তাকে ধরুন।</p><div class="hero-buttons"><a class="btn primary" href="#players">${s.players.length ? 'খেলোয়াড় দেখুন' : 'খেলোয়াড় যোগ করুন'}${icon('arrow')}</a></div></div><div class="hero-art spy-cover"><img src="assets/spy/cover.svg" width="640" height="420" alt="বৃষ্টির রাতে ল্যাম্পপোস্টের নিচে আতশকাচ হাতে গোয়েন্দা; দেয়ালের আড়াল থেকে উঁকি দিচ্ছে কালো চশমার গুপ্তচর"></div></section>
  <details class="cast-drawer"><summary>চরিত্রগুলো দেখুন</summary><div class="cast-grid spy-cast"><article class="cast-card"><img class="character-avatar" src="${portrait('WORD')}" alt="" width="80" height="80"><h3>গোয়েন্দা</h3><small>শব্দ জানেন · বাকি সবাই</small><p>আতশকাচ হাতে সূত্র মেলান, অসঙ্গতি খোঁজেন।</p></article><article class="cast-card"><img class="character-avatar" src="${portrait('SPY')}" alt="" width="80" height="80"><h3>গুপ্তচর</h3><small>শব্দ জানে না · একজন</small><p>কালো চশমা, তোলা কলার। শব্দ জানে না, জানার ভান করে।</p></article></div></details>
  <section class="panel spy-setup" id="players"><div class="list-heading"><span>কারা খেলছেন?</span><span>${bn(s.players.length)} / ২০</span></div>
  <form id="name-form" class="name-form"><div class="input-wrap">${icon('person')}<input id="player-name" placeholder="খেলোয়াড়ের নাম" autocomplete="off" maxlength="20" aria-label="খেলোয়াড়ের নাম"></div><button class="btn primary" type="submit">যোগ করুন${icon('plus')}</button></form>${accountChips(s.players.map(p => p.name))}
  ${s.players.length ? `<div class="name-list">${s.players.map((p, i) => `<div class="name-row spy-row ${p.id === newRow ? 'is-new' : ''}"><span class="seat-initial coloured" style="--dot:${playerColour(p.name, i)}" aria-hidden="true">${esc(p.name.charAt(0))}</span><div class="seat-name"><span class="player-name">${esc(p.name)}</span><small class="seat-number">${bn(i + 1)}</small></div><button type="button" class="icon-btn" data-action="remove" data-id="${p.id}" aria-label="${esc(p.name)} সরান">${icon('trash')}</button></div>`).join('')}</div>` : `<div class="empty">${icon('people')}<h3>প্রথম নামটি লিখুন</h3><p>৩ থেকে ২০ জন। কোনো হোস্ট লাগবে না।</p></div>`}
  <div class="spy-prefs"><label for="minutes">আলোচনার সময়<select id="minutes">${[1, 2, 3, 4, 5, 7, 10, 15, 20, 30].map(n => `<option value="${n}" ${s.duration === n * 60 ? 'selected' : ''}>${bn(n)} মিনিট</option>`).join('')}</select></label><label for="pool">স্তর<select id="pool"><option value="common" ${s.pool === 'common' ? 'selected' : ''}>সহজ</option><option value="extended" ${s.pool === 'extended' ? 'selected' : ''}>কঠিন</option></select></label></div>
  ${last ? `<p class="spy-start-note">${icon('arrow')} গতবার গুপ্তচর ছিলেন <strong>${esc(last.name)}</strong>; এবার ফোন শুরু হবে তাঁর হাত থেকে।</p>` : ''}
  <div class="form-bottom"><small>${s.players.length < 3 ? 'কমপক্ষে ৩ জন লাগবে' : 'সবাই এসে গেছেন?'}</small>${button('কেস শুরু করুন', 'start', 'primary', 'arrow', s.players.length < 3 ? 'disabled' : '')}</div></section>`;
}

function rulesScreen() {
  const steps = [['শব্দ বণ্টন', 'ফোন একে একে ঘুরবে। কার্ড ছুঁয়ে নিজের পাতা দেখুন। সবাই গোয়েন্দা, একই শব্দ পাবেন; একজন গুপ্তচর, তার পাতা ফাঁকা।'], ['সূত্র', 'শব্দটা সরাসরি বলবেন না। ছোট সূত্র দিন। খুব সহজ সূত্র দিলে গুপ্তচর শব্দটা ধরে ফেলবে।'], ['যুক্তি', 'কার সূত্র বেমানান? আলোচনার সময় শেষে সবাই মিলে একজনকে বাদ দিন।'], ['রায়', 'গুপ্তচর বাদ পড়লে কেস সমাধান। দুজন বাকি থাকতে গুপ্তচর টিকে থাকলে সে পালিয়ে যায়, জিতে যায়।'], ['পয়েন্ট', 'গুপ্তচরের জয়ে ৩। গোয়েন্দাদের জয়ে প্রত্যেকে ১। খেলা ছেড়ে গেলে পয়েন্ট নেই।']];
  return `${pageHead('খেলার নিয়ম', 'গোয়েন্দা বনাম গুপ্তচর', 'এক ফোন, কোনো হোস্ট নেই। ৩ থেকে ২০ জন।')}<div class="rules-list">${steps.map((r, i) => `<article><b>${bn(i + 1)}</b><div><h3>${r[0]}</h3><p>${r[1]}</p></div></article>`).join('')}</div><p class="spy-source">শব্দতালিকা: <a href="https://github.com/hermitdave/FrequencyWords">FrequencyWords · CC BY-SA 4.0</a></p>`;
}

function revealBack() {
  const p = current(), id = spyIdentity(s, p.id), spy = id.role === 'SPY';
  return `<span class="secret-kicker">${esc(p.name)}, আপনি</span><img class="secret-portrait" src="${portrait(id.role)}" alt="" width="128" height="128">${spy ? `<span class="secret-title red">আপনি গুপ্তচর</span><span class="secret-text">আপনার পাতা ফাঁকা। মুখ শান্ত রাখুন; অন্যদের সূত্র শুনে শব্দটা আন্দাজ করুন, ধরা পড়বেন না।</span>` : `<span class="secret-sub">গোয়েন্দা · গোপন শব্দ</span><span class="secret-word">${esc(id.word)}</span><span class="secret-text">শব্দটা সরাসরি বলবেন না। ছোট সূত্র দিন, অসঙ্গতি খুঁজুন।</span>`}<span class="secret-close">আবার ছুঁয়ে ঢেকে দিন</span>`;
}

function reveal() {
  const p = current(), prev = s.revealIndex ? byId(s.order[s.revealIndex - 1]) : null, next = byId(s.order[s.revealIndex + 1]);
  const front = `<span class="tap-seal">${icon('lens')}</span><strong>ছুঁয়ে নোটবুক খুলুন</strong><small>অন্যরা চোখ সরিয়ে রাখুন। শুধু ${esc(p.name)} দেখবেন।</small><span class="tap-hint"><i></i>কার্ডে ট্যাপ করুন</span>`;
  return `<section class="reveal-screen"><div class="reveal-step"><span>কেস ${caseOf(s.gameId)}</span><span>${bn(s.revealIndex + 1)} / ${bn(s.order.length)}</span></div><div class="reveal-progress"><i style="width:${(s.revealIndex + 1) / s.order.length * 100}%"></i></div>
  ${prev ? `<p class="handoff"><span>${esc(prev.name)}</span>${icon('arrow')}<b>${esc(p.name)}</b></p>` : ''}<h1>${esc(p.name)}, আপনার পালা</h1><p class="lede">ফোনটি শুধু আপনার হাতে রাখুন।</p>
  ${tapCard({ open: shown, front, back: shown ? revealBack() : '', openLabel: 'কার্ড ছুঁয়ে পরিচয় দেখুন', closeLabel: 'কার্ড ঢেকে দিন' })}
  <div class="reveal-actions">${button(next ? 'পরের খেলোয়াড় · ' + esc(next.name) : 'আলোচনা শুরু করুন', 'next', 'primary wide', 'arrow', seen ? '' : 'disabled')}<small id="next-hint">${seen ? 'ঢেকে দিয়ে ফোনটি এগিয়ে দিন।' : 'কার্ড দেখার পর বোতামটি চালু হবে।'}</small></div></section>`;
}

function timerBlock() {
  const n = secondsLeft(s.timer), vote = s.phase === 'vote';
  return `<section class="host-tools spy-timer"><div class="tool-heading"><div><span class="eyebrow">রাউন্ড ${bn(s.round)}</span><h2>${vote ? 'আলোচনা শেষ' : 'আলোচনার সময়'}</h2></div><img class="spy-timer-art" src="${portrait('WORD')}" alt="" width="64" height="64"></div><div class="discussion-timer ${n === 0 ? 'expired' : ''}"><div><div class="timer-digits" id="timer-clock" role="timer" aria-label="বাকি সময়">${clock(n)}</div><div class="timer-state">${vote ? 'এবার সবাই মিলে একজনকে বেছে নিন।' : s.timer.running ? 'সূত্র দিন, প্রশ্ন করুন, অসঙ্গতি খুঁজুন।' : 'বিরতি চলছে। প্রস্তুত হলে আবার শুরু করুন।'}</div></div>${vote ? '' : `<div class="timer-actions">${button(s.timer.running ? 'বিরতি' : 'চালু', 'pause', 'secondary', s.timer.running ? 'pause' : 'play')}${button('এখনই ভোট', 'end-discussion', 'primary', 'arrow')}</div>`}</div></section>`;
}

function playing() {
  const alive = s.players.filter(p => p.alive), vote = s.phase === 'vote';
  return `${pageHead(`কেস ${caseOf(s.gameId)}`, vote ? 'কে গুপ্তচর?' : 'এবার কথা হোক।', `${bn(alive.length)} জন খেলায় আছেন · পরিচয় গোপন রাখুন`)}
  ${s.verdict ? `<div class="finale-result spy-verdict">${icon(s.verdict.left ? 'logout' : 'shield')}<div><strong>${esc(s.verdict.name)}</strong><p>${s.verdict.left ? 'খেলা ছেড়েছেন।' : 'গোয়েন্দাই ছিলেন। গুপ্তচর এখনও আপনাদের মধ্যেই আছে।'}</p></div></div>` : ''}
  ${timerBlock()}
  ${vote ? `<form id="spy-ballot" class="spy-ballot"><fieldset class="guess-players"><legend>সবাই মিলে একজনকে বাদ দিন</legend>${alive.map(p => `<label class="guess-option"><input type="radio" name="candidate" value="${p.id}" ${choice === p.id ? 'checked' : ''} required><span class="generic-person coloured" style="--dot:${playerColour(p.name, s.players.indexOf(p))}">${esc(p.name.charAt(0))}</span><strong>${esc(p.name)}</strong></label>`).join('')}</fieldset><button class="btn primary wide" type="submit" ${choice ? '' : 'disabled'}>ভোট চূড়ান্ত করুন${icon('lock')}</button></form>` : ''}
  <details class="cast-drawer spy-roster"><summary>খেলোয়াড়দের অবস্থা</summary><div class="name-list">${s.players.map(p => `<div class="name-row spy-row ${p.alive ? '' : 'is-out'}"><span class="seat-initial coloured" style="--dot:${playerColour(p.name, s.players.indexOf(p))}" aria-hidden="true">${esc(p.name.charAt(0))}</span><div class="seat-name"><span class="player-name">${esc(p.name)}</span><small class="seat-number">${p.quit ? 'খেলা ছেড়েছেন' : !p.alive ? 'বাদ পড়েছেন' : bn(p.score) + ' পয়েন্ট'}</small></div>${p.alive ? button('ছেড়ে যান', 'leave', 'text', '', `data-id="${p.id}"`) : ''}</div>`).join('')}</div></details>`;
}

function rankingRows() {
  return s.players.map(p => ({ name: p.name, score: p.score, history: p.history.map(h => ({ won: h.won, img: portrait(h.role), label: `${ROLE[h.role] || h.role} · ${h.quit ? 'ছেড়ে গেছেন' : h.won ? 'জয়' : 'পরাজয়'}` })) }));
}
const rankLabels = { caption: 'Spy র‍্যাঙ্কিং', rank: '#', player: 'খেলোয়াড় · শেষ পাঁচ খেলা', points: 'পয়েন্ট', win: 'সবুজ ফ্রেম জয়', loss: 'লাল ফ্রেম পরাজয়', order: 'নতুন খেলা বাঁ দিকে', empty: 'এখনও কোনো কেস শেষ হয়নি।', noGames: 'এখনও খেলেননি', number: bn };

function rankingScreen() {
  const rows = overallRanking(readHistory(), 'spy').map(r => ({ name: r.name, score: r.points, note: bn(r.matches) + 'টি ম্যাচ', history: r.recent.map(h => ({ won: h.won, img: h.img || portrait('WORD'), label: h.label || (h.won ? 'ম্যাচে প্রথম' : 'প্রথম নয়') })) }));
  return `${pageHead('র‍্যাঙ্কিং', 'Spy র‍্যাঙ্কিং', 'শেষ হওয়া প্রতিটি ম্যাচের মোট পয়েন্ট।')}${s.set?.games.length ? matchPanel() : ''}<section class="rank-section"><h2>সব ম্যাচ মিলিয়ে</h2>${rankTable(rows, { ...rankLabels, empty: 'এখনও কোনো ম্যাচ শেষ হয়নি।' })}</section>${famePanel()}<a class="btn secondary wide" href="ranking.html?game=spy">${icon('trophy')}সব খেলার র‍্যাঙ্কিং</a>`;
}

function results() {
  const spy = byId(s.spyId), won = s.winner === 'WORD';
  return `<div class="over-heading"><div class="result-portrait win"><img src="${portrait(won ? 'WORD' : 'SPY')}" alt="" width="112" height="112"></div><span class="eyebrow">কেস ${caseOf(s.gameId)} · ${won ? 'সমাধান' : 'অমীমাংসিত'}</span><h1>${won ? 'গুপ্তচর ধরা পড়েছে!' : 'গুপ্তচর পালিয়ে গেল!'}</h1><p class="lede"><strong>${esc(spy.name)}</strong> ছিলেন গুপ্তচর। ${won ? 'গোয়েন্দাদের সূত্র মিলে গেল।' : 'কেউ তাকে ধরতে পারেনি।'}</p></div>
  <div class="spy-word-reveal"><span>গোপন শব্দটি ছিল</span><strong>${esc(s.word)}</strong></div>
  ${matchPanel()}
  <div class="end-actions">${matchActions()}${button('নাম বা সময় বদলান', 'edit', 'secondary wide', 'edit')}${button('Spy-এর শুরুর পাতা', 'game-home', 'text wide', 'home')}</div>
  ${famePanel()}`;
}

/* ---------- Shell (shared with Mafia) ---------- */

function screenKey() { return view !== 'play' ? view : s.phase === 'reveal' ? 'reveal:' + s.revealIndex : ['discussion', 'vote'].includes(s.phase) ? `play:${s.round}:${s.phase}` : s.phase; }
function crumb() { return view === 'rules' ? 'নিয়ম' : view === 'ranking' ? 'র‍্যাঙ্কিং' : ({ setup: 'গোয়েন্দা বনাম গুপ্তচর', reveal: 'কেস ' + caseOf(s.gameId), discussion: 'কেস ' + caseOf(s.gameId), vote: 'ভোট · কেস ' + caseOf(s.gameId), over: 'রায় · কেস ' + caseOf(s.gameId) })[s.phase]; }

function render() {
  if (s.phase === 'over' && s.set && s.gameId && !s.set.games.includes(s.gameId)) { s.set.games.push(s.gameId); save(); }
  const draft = $('#player-name')?.value, focused = document.activeElement?.id;
  const key = screenKey(), changed = key !== lastScreen; lastScreen = key;
  const privateReveal = view === 'play' && s.phase === 'reveal';
  window.Android?.setSecure?.(privateReveal && shown);
  window.Android?.setPlaying?.(!['setup', 'over'].includes(s.phase));
  document.body.classList.toggle('private-mode', privateReveal);
  const body = view === 'rules' ? rulesScreen() : view === 'ranking' ? rankingScreen() : s.phase === 'setup' ? setup() : s.phase === 'reveal' ? reveal() : s.phase === 'over' ? results() : playing();
  $('#app').innerHTML = appShell({ brand: 'Spy', brandSub: 'গোয়েন্দা বনাম গুপ্তচর', brandIcon: 'lens', brandAction: 'tab-play', crumb: crumb(), active: view, hideTabs: privateReveal, contentClass: view === 'play' && s.phase === 'setup' ? 'home-content spy-content' : 'game-content spy-content', labels: { back: 'সব খেলা', menu: 'মেনু', sections: 'খেলার অংশ' },
    tabs: [{ id: 'play', label: 'খেলা', icon: 'play', action: 'tab-play' }, { id: 'rules', label: 'নিয়ম', icon: 'book', action: 'tab-rules' }, { id: 'ranking', label: 'র‍্যাঙ্কিং', icon: 'trophy', action: 'tab-ranking' }], body });
  if (draft && $('#player-name')) $('#player-name').value = draft;
  if (focused === 'player-name') $('#player-name')?.focus();
  newRow = null;
  bind();
  if (changed) enterScreen($('#screen'));
}

function bind() {
  $$('[data-action]').forEach(el => el.onclick = e => { if (el.type === 'submit') return; e.preventDefault(); act(el.dataset.action, el.dataset.id); });
  $('.hero-buttons a[href="#players"]')?.addEventListener('click', e => { e.preventDefault(); $('#players').scrollIntoView({ behavior: 'smooth', block: 'start' }); setTimeout(() => $('#player-name')?.focus({ preventScroll: true }), 400); });
  bindTapCard($('#app'), { back: revealBack, onChange: open => { shown = open; window.Android?.setSecure?.(open); if (open && !seen) { seen = true; const next = $('[data-action=next]'); next.disabled = false; next.classList.add('just-enabled'); $('#next-hint').textContent = 'ঢেকে দিয়ে ফোনটি এগিয়ে দিন।'; sound('notice'); } } });
  bindAccountChips();
  $('#name-form')?.addEventListener('submit', e => { e.preventDefault(); const input = $('#player-name'); try { addSpyPlayer(s, input.value); try { ensureAccount(input.value); } catch { } newRow = s.players.at(-1).id; input.value = ''; save(); render(); $('#player-name').focus(); } catch (err) { toast(err.message === 'FULL' ? 'সর্বোচ্চ ২০ জন খেলতে পারেন।' : err.message === 'PHASE' ? 'খেলা চলাকালে নাম যোগ করা যাবে না।' : 'একটি আলাদা নাম দিন, সর্বোচ্চ ২০ অক্ষরে।'); } });
  $('#minutes')?.addEventListener('change', e => { s.duration = Number(e.target.value) * 60; s.timer = newTimer(s.duration); save(); });
  $('#pool')?.addEventListener('change', e => { s.pool = e.target.value; save(); });
  $$('input[name=candidate]').forEach(el => el.onchange = () => { choice = el.value; const submit = $('#spy-ballot [type=submit]'); if (submit.disabled) { submit.disabled = false; submit.classList.add('just-enabled'); } });
  $('#spy-ballot')?.addEventListener('submit', async e => {
    e.preventDefault(); const id = new FormData(e.target).get('candidate'), p = byId(id);
    if (!p || !await confirmDialog('এই ভোটই চূড়ান্ত?', `${p.name}কে বাদ দেওয়া হবে।`)) return;
    voteSpy(s, id); choice = null; save(); sound(s.phase === 'over' ? 'win' : 'out'); transition();
  });
}

function transition(fn) { leaveScreen($('#screen'), () => { fn?.(); render(); window.scrollTo({ top: 0, behavior: 'instant' }); }); }

async function act(action, id) {
  try {
    switch (action) {
      case 'games': location.href = 'index.html'; return;
      case 'tab-play': case 'tab-rules': case 'tab-ranking': { const next = action.slice(4); if (view === next) return; hide(); view = next; return transition(); }
      case 'app-menu': return openMenu();
      case 'remove': removeSpyPlayer(s, id); break;
      case 'start': view = 'play'; if (!s.set) { s.set = { id: crypto.randomUUID(), total: 5, games: [] }; s.players.forEach(p => { p.score = 0; }); } dealSpy(s); shown = false; seen = false; save(); sound('notice'); return transition();
      case 'next': {
        if (!seen) return;
        const card = $('[data-tap-card]');
        if (shown) setTapCard(card, false, revealBack, open => shown = open);
        nextSpyReveal(s); seen = false; save();
        if (s.phase === 'discussion') sound('timer');
        return setTimeout(() => transition(), shown ? 0 : 120);
      }
      case 'pause': s.timer = s.timer.running ? pauseTimer(s.timer) : startTimer(s.timer); break;
      case 'end-discussion': if (!await confirmDialog('আলোচনা শেষ করবেন?', 'এখন সবাই মিলে ভোট দিতে পারবেন।')) return; endSpyDiscussion(s); sound('timer'); save(); return transition();
      case 'rematch': view = 'play'; resetSpy(s); dealSpy(s); shown = false; seen = false; save(); return transition();
      case 'edit': view = 'play'; resetSpy(s); save(); return transition();
      case 'game-home': hide(); view = 'play'; if (s.phase === 'over') { resetSpy(s); save(); } return transition();
      case 'new':
        if (!['setup', 'over'].includes(s.phase) && !await confirmDialog('এই খেলা ছেড়ে যাবেন?', 'এই খেলার ফল যোগ হবে না। নাম রেখে নতুন খেলা শুরু করতে পারবেন।')) return;
        view = 'play'; resetSpy(s); shown = false; seen = false; save(); return transition();
      case 'more-game': s.set.total++; return act('rematch');
      case 'end-match': return endMatch();
      case 'reset-scores':
        if (!await confirmDialog('সব পয়েন্ট মুছবেন?', 'নাম থাকবে, কিন্তু পয়েন্ট আর শেষ পাঁচ খেলার ইতিহাস মুছে যাবে।')) return;
        s.players.forEach(p => { p.score = 0; p.history = []; }); save(); toast('পয়েন্ট মুছে নতুন খাতা খোলা হলো।'); break;
      case 'leave': {
        const p = byId(id); if (!await confirmDialog('খেলা ছেড়ে যাবেন?', `${p.name} এই খেলায় আর অংশ নেবেন না।`)) return;
        leaveSpyPlayer(s, id); choice = null; sound(s.phase === 'over' ? 'win' : 'out'); save(); return transition();
      }
      default: return;
    }
    save(); render();
  } catch { toast('কাজটি করা যায়নি। আবার চেষ্টা করুন।'); }
}

/* ---------- Dialogs (same markup as Mafia) ---------- */

function closeOverlay() { const resolve = modalResolve; modalResolve = null; $('#overlay').innerHTML = ''; resolve?.(false); }
function trapKeys(dialog, close) { dialog.onkeydown = e => { if (e.key === 'Escape') { e.preventDefault(); close(); } if (e.key === 'Tab') { const c = [...dialog.querySelectorAll('button:not([disabled]),a,input,select')], first = c[0], last = c.at(-1); if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); } else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); } } }; }

function confirmDialog(title, text) {
  closeOverlay();
  return new Promise(resolve => {
    modalResolve = resolve;
    $('#overlay').innerHTML = `<div class="scrim"><section class="dialog" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="dialog-mark">${icon('lens')}</div><h2>${esc(title)}</h2><p>${esc(text)}</p><div class="dialog-actions"><button class="btn primary" id="confirm-yes">হ্যাঁ, নিশ্চিত</button><button class="btn secondary" id="confirm-no">থাক</button></div></section></div>`;
    $('#confirm-yes').onclick = () => { modalResolve = null; $('#overlay').innerHTML = ''; resolve(true); };
    $('#confirm-no').onclick = closeOverlay;
    trapKeys($('#overlay .dialog'), closeOverlay); $('#confirm-no').focus();
  });
}

function openMenu() {
  closeOverlay();
  const playing = !['setup', 'over'].includes(s.phase);
  const items = [[playing ? 'এই খেলা ছেড়ে নতুন খেলা' : 'নতুন খেলা', playing ? 'close' : 'plus', 'new'], ['শব্দ: ' + (soundEnabled() ? 'চালু' : 'বন্ধ'), 'sound', 'sound'], ['সব খেলায় ফিরে যান', 'back', 'games']];
  $('#overlay').innerHTML = `<div class="scrim"><section class="dialog app-menu-dialog" role="dialog" aria-modal="true" aria-labelledby="menu-title"><div class="picker-title"><h2 id="menu-title">মেনু</h2><button type="button" id="close-menu" class="icon-btn" aria-label="বন্ধ করুন">${icon('close')}</button></div><div class="app-menu-items">${items.map(([label, ic, action]) => `<button class="btn secondary wide ${({close:'tone-danger',trophy:'tone-danger',plus:'tone-primary',lock:'tone-primary',spark:'tone-world',person:'tone-people',people:'tone-people',sound:'',back:'tone-quiet'})[ic]||''}" type="button" data-menu="${action}">${icon(ic)}${label}${icon('arrow')}</button>`).join('')}</div></section></div>`;
  $('#close-menu').onclick = closeOverlay;
  $$('[data-menu]').forEach(el => el.onclick = () => { const a = el.dataset.menu; closeOverlay(); if (a === 'sound') { toggleSound(); openMenu(); } else act(a); });
  trapKeys($('.app-menu-dialog'), closeOverlay); $('#close-menu').focus();
}

/* ---------- Privacy, back button and timer ---------- */

function hide() { if (shown) setTapCard($('[data-tap-card]'), false, revealBack, open => { shown = open; window.Android?.setSecure?.(false); }); }
window.addEventListener('blur', hide);
document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
window.onNativePause = hide;
window.onNativeBack = () => { if ($('#overlay').children.length) { closeOverlay(); return; } if (view !== 'play') act('tab-play'); else if (s.phase === 'setup') location.href = 'index.html'; else openMenu(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#overlay').children.length) hide(); });

setInterval(() => {
  if (s.phase !== 'discussion') return;
  const phase = s.phase; tickSpy(s);
  if (s.phase !== phase) { choice = null; save(); sound('timer'); transition(); return; }
  const el = $('#timer-clock'); if (el) el.textContent = clock(secondsLeft(s.timer));
}, 250);

tickSpy(s); save(); render();
if ('serviceWorker' in navigator && !window.Android && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => { });

/* A match is a set of games: 5 to start, and more can be added once they are played. Points add up across the set. */
function matchPanel() {
  const st = s.set; if (!st) return '';
  return `<section class="rank-section"><div class="set-progress"><b>ম্যাচ · খেলা ${bn(st.games.length)} / ${bn(st.total)}</b><span class="pips">${Array.from({ length: st.total }, (_, i) => `<i class="${i < st.games.length ? 'done' : ''}"></i>`).join('')}</span></div><h2>ম্যাচের পয়েন্ট</h2><p>এই ম্যাচের সব খেলার পয়েন্ট যোগ করে।</p>${rankTable(rankingRows(), rankLabels)}</section>`;
}
function matchActions() {
  const st = s.set, played = st?.games.length || 0;
  if (!st) return button('নতুন ম্যাচ', 'rematch', 'primary wide', 'play');
  return `${played < st.total ? button(`পরের খেলা (${bn(played + 1)} / ${bn(st.total)})`, 'rematch', 'primary wide', 'play') : button('আরও একটি খেলা যোগ করুন', 'more-game', 'primary wide', 'plus')}${button('ম্যাচ শেষ করুন ও ফল সেভ করুন', 'end-match', 'secondary wide', 'trophy')}`;
}
function famePanel() {
  return `<section class="fame-section"><h2>${icon('trophy')}হল অব ফেম</h2><p>শেষ ১০০টি ম্যাচে এক ম্যাচে সবচেয়ে বেশি পয়েন্ট।</p>${fameTable(hallOfFame(readHistory(), 'spy'), { caption: 'হল অব ফেম', player: 'খেলোয়াড়', points: 'পয়েন্ট', empty: 'এখনও কেউ হল অব ফেমে ওঠেননি।', number: bn, meta: e => new Date(e.date).toLocaleDateString('bn-BD') + ' · ' + bn(e.games) + 'টি খেলা' })}</section>`;
}
async function endMatch() {
  if (!await confirmDialog('ম্যাচ শেষ করবেন?', 'ম্যাচের ফল র‍্যাঙ্কিংয়ে সেভ হবে, তারপর নতুন করে শুরু।')) return;
  if (s.set?.games.length) saveMatch({ id: s.set.id, game: 'spy', games: s.set.games.length, players: s.players.map(p => ({ name: p.name, points: p.score, recent: p.history.slice(0, 5).map(h => ({ won: h.won, img: portrait(h.role), label: `${ROLE[h.role] || h.role} · ${h.won ? 'জয়' : 'পরাজয়'}` })) })) });
  s.set = null; s.players.forEach(p => { p.score = 0; }); resetSpy(s); view = 'play'; save(); toast('ম্যাচের ফল সেভ হয়েছে'); transition();
}

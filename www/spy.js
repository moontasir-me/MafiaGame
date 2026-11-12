import { newSpySession, addSpyPlayer, removeSpyPlayer, dealSpy, spyIdentity, nextSpyReveal, endSpyDiscussion, tickSpy, voteSpy, leaveSpyPlayer, resetSpy, restoreSpy } from './spy-local.mjs';
import { newTimer, startTimer, pauseTimer, secondsLeft } from './game-tools.mjs';
import { sound, soundEnabled, toggleSound } from './sound.mjs';
import { characterImage } from './characters.mjs';
import { esc, icon, menuIcon, tapCard, bindTapCard, setTapCard, rankTable, enterScreen, leaveScreen } from './ui-kit.mjs';

const $ = q => document.querySelector(q), $$ = q => [...document.querySelectorAll(q)];
const bn = n => Number(n).toLocaleString('bn-BD');
const KEY = 'mafia.spy.pass.v1';
let s = newSpySession(), shown = false, seen = false, choice = null, toastTimer, modalResolve, lastScreen = '', newRow = null;

try { const raw = JSON.parse(localStorage.getItem(KEY)); if (raw) s = restoreSpy(raw); } catch { }
// Carry over the roster from the old single-phone room version.
if (!localStorage.getItem(KEY)) try { const old = JSON.parse(localStorage.getItem('mafia.spy.local')); for (const p of old?.locals || []) addSpyPlayer(s, p.view.me.name); } catch { }

const button = (text, action, cls = 'primary', ico = 'arrow', extra = '') => `<button type="button" class="btn ${cls}" data-action="${action}" ${extra}>${text}${ico ? icon(ico) : ''}</button>`;
const heading = (kicker, title, text) => `<div class="eyebrow">${kicker}</div><h1>${title}</h1>${text ? `<p class="lede">${text}</p>` : ''}`;
const clock = n => `${bn(Math.floor(n / 60)).padStart(2, '০')}:${bn(n % 60).padStart(2, '০')}`;

function save() { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { toast('তথ্য সেভ করা যায়নি। ফোনে কিছু জায়গা খালি করুন।'); } }
function toast(text) { clearTimeout(toastTimer); const t = $('#toast'); t.textContent = text; t.classList.add('visible'); toastTimer = setTimeout(() => t.classList.remove('visible'), 2800); }
const current = () => s.players.find(p => p.id === s.order[s.revealIndex]);
const byId = id => s.players.find(p => p.id === id);

/* ---------- Screens ---------- */

function setup() {
  const last = s.lastSpyId && byId(s.lastSpyId);
  return `<section class="hero minimal-hero spy-hero"><div class="hero-copy">${heading('মিসির আলির খাতা · এক ফোন, হোস্ট ছাড়া', 'সবার খাতায় একই শব্দ।<br><em>একজনের পাতা ফাঁকা।</em>', 'রহস্যের পেছনে যুক্তি থাকে। ফোন ঘুরবে একে একে; কার্ড ছুঁয়ে নিজের পাতা দেখুন, ঢেকে দিন, পরের জনকে দিন।')}</div><div class="hero-art spy-cover"><img src="assets/spy/casebook.svg" width="640" height="420" alt="বৃষ্টির রাতে হারিকেনের আলোয় খোলা খাতা, চশমা আর চায়ের কাপ"></div></section>
  <section class="panel spy-setup"><div class="list-heading"><span>কারা খেলছেন?</span><span>${bn(s.players.length)} / ২০</span></div>
  <form id="name-form" class="name-form"><div class="input-wrap">${icon('person')}<input id="player-name" placeholder="খেলোয়াড়ের নাম" autocomplete="off" maxlength="20" aria-label="খেলোয়াড়ের নাম"></div><button class="btn primary" type="submit">যোগ করুন${icon('plus')}</button></form>
  ${s.players.length ? `<div class="name-list">${s.players.map((p, i) => `<div class="name-row spy-row ${p.id === newRow ? 'is-new' : ''}"><span class="seat-initial" aria-hidden="true">${esc(p.name.charAt(0))}</span><div class="seat-name"><span class="player-name">${esc(p.name)}</span><small class="seat-number">${bn(i + 1)}</small></div><button type="button" class="icon-btn" data-action="remove" data-id="${p.id}" aria-label="${esc(p.name)} সরান">${icon('trash')}</button></div>`).join('')}</div>` : `<div class="empty">${icon('people')}<h3>প্রথম নামটি লিখুন</h3><p>৩ থেকে ২০ জন। কোনো হোস্ট লাগবে না।</p></div>`}
  <div class="spy-prefs"><label for="minutes">আলোচনার সময়<select id="minutes">${[1, 2, 3, 4, 5, 7, 10, 15, 20, 30].map(n => `<option value="${n}" ${s.duration === n * 60 ? 'selected' : ''}>${bn(n)} মিনিট</option>`).join('')}</select></label><label for="pool">শব্দের তালিকা<select id="pool"><option value="common" ${s.pool === 'common' ? 'selected' : ''}>সহজ · ৫৫৮ শব্দ</option><option value="extended" ${s.pool === 'extended' ? 'selected' : ''}>বড় · ২০,০০০ শব্দরূপ</option></select></label></div>
  ${last ? `<p class="spy-start-note">${icon('arrow')} গতবার গুপ্তচর ছিলেন <strong>${esc(last.name)}</strong>; এবার ফোন শুরু হবে তাঁর হাত থেকে।</p>` : ''}
  <div class="form-bottom"><small>${s.players.length < 3 ? 'কমপক্ষে ৩ জন লাগবে' : 'সবাই এসে গেছেন?'}</small>${button('পরিচয় বিলিয়ে শুরু', 'start', 'primary', 'arrow', s.players.length < 3 ? 'disabled' : '')}</div></section>
  ${rulesBlock()}`;
}

function rulesBlock() {
  return `<details class="cast-drawer spy-rules"><summary>কীভাবে খেলবেন?</summary><ol class="spy-rule-list"><li><b>শব্দ বণ্টন।</b> সবাই একই বাংলা শব্দ পাবেন, শুধু একজন গুপ্তচরের পাতা ফাঁকা থাকবে।</li><li><b>ইঙ্গিত।</b> শব্দটি সরাসরি না বলে ছোট ইঙ্গিত দিন। খুব সহজ ইঙ্গিত দিলে গুপ্তচর শব্দটা ধরে ফেলবে।</li><li><b>যুক্তি।</b> কার ইঙ্গিত অন্যরকম শোনাল? আলোচনা শেষে সবাই মিলে একজনকে বাদ দিন।</li><li><b>ফল।</b> গুপ্তচর বাদ পড়লে রহস্যের মীমাংসা; দুজন বাকি থাকতে টিকে থাকলে গুপ্তচরের জয়।</li><li><b>পয়েন্ট।</b> গুপ্তচরের জয়ে ৩, শব্দ জানা দলের জয়ে প্রত্যেকে ১।</li></ol><p class="spy-source">সহজ তালিকায় ৫৫৮টি দৈনন্দিন শব্দ; বড় তালিকায় কম পরিচিত শব্দরূপও আছে। <a href="https://github.com/hermitdave/FrequencyWords">FrequencyWords · CC BY-SA 4.0</a></p></details>`;
}

function revealBack() {
  const p = current(), id = spyIdentity(s, p.id), spy = id.role === 'SPY';
  return `<span class="secret-kicker">${spy ? 'আপনার পরিচয়' : 'আপনার খাতার শব্দ'}</span><img class="secret-portrait" src="${characterImage(id.role)}" alt="" width="128" height="128">${spy ? `<span class="secret-title red">আপনি গুপ্তচর</span><span class="secret-text">আপনার পাতা ফাঁকা। অন্যদের ইঙ্গিত শুনে শব্দটা আন্দাজ করুন, আর ধরা পড়বেন না।</span>` : `<span class="secret-word">${esc(id.word)}</span><span class="secret-text">শব্দটি সরাসরি বলবেন না। এমন ইঙ্গিত দিন যা শুধু জানা লোকেরা বুঝবে।</span>`}<span class="secret-close">আবার ছুঁয়ে ঢেকে দিন</span>`;
}

function reveal() {
  const p = current(), prev = s.revealIndex ? byId(s.order[s.revealIndex - 1]) : null, next = byId(s.order[s.revealIndex + 1]);
  const front = `<span class="tap-seal">${icon('lens')}</span><strong>ছুঁয়ে পাতা খুলুন</strong><small>অন্যরা চোখ সরিয়ে রাখুন। শুধু ${esc(p.name)} দেখবেন।</small><span class="tap-hint"><i></i>কার্ডে ট্যাপ করুন</span>`;
  return `<section class="reveal-screen"><div class="reveal-step"><span>পরিচয় বণ্টন</span><span>${bn(s.revealIndex + 1)} / ${bn(s.order.length)}</span></div><div class="reveal-progress"><i style="width:${(s.revealIndex + 1) / s.order.length * 100}%"></i></div>
  ${prev ? `<p class="handoff"><span>${esc(prev.name)}</span>${icon('arrow')}<b>${esc(p.name)}</b></p>` : ''}<h1>${esc(p.name)}, আপনার পালা</h1><p class="lede">ফোনটি শুধু আপনার হাতে রাখুন।</p>
  ${tapCard({ open: shown, front, back: revealBack(), openLabel: 'কার্ড ছুঁয়ে পরিচয় দেখুন', closeLabel: 'কার্ড ঢেকে দিন' })}
  <div class="reveal-actions">${button(next ? 'পরের খেলোয়াড় · ' + esc(next.name) : 'আলোচনা শুরু করুন', 'next', 'primary wide', 'arrow', seen ? '' : 'disabled')}<small id="next-hint">${seen ? 'ঢেকে দিয়ে ফোনটি এগিয়ে দিন।' : 'কার্ড দেখার পর বোতামটি চালু হবে।'}</small></div></section>`;
}

function timerBlock() {
  const n = secondsLeft(s.timer), vote = s.phase === 'vote';
  return `<section class="host-tools spy-timer"><div class="tool-heading"><div><span class="eyebrow">রাউন্ড ${bn(s.round)}</span><h2>${vote ? 'আলোচনা শেষ' : 'আলোচনার সময়'}</h2></div></div><div class="discussion-timer ${n === 0 ? 'expired' : ''}"><div><div class="timer-digits" id="timer-clock" role="timer" aria-label="বাকি সময়">${clock(n)}</div><div class="timer-state">${vote ? 'এবার সবাই মিলে একজনকে বেছে নিন।' : s.timer.running ? 'ইঙ্গিত দিন, প্রশ্ন করুন, অসঙ্গতি খুঁজুন।' : 'বিরতি চলছে। প্রস্তুত হলে আবার শুরু করুন।'}</div></div>${vote ? '' : `<div class="timer-actions">${button(s.timer.running ? 'বিরতি' : 'চালু', 'pause', 'secondary', s.timer.running ? 'pause' : 'play')}${button('এখনই ভোট', 'end-discussion', 'primary', 'arrow')}</div>`}</div></section>`;
}

function playing() {
  const alive = s.players.filter(p => p.alive), vote = s.phase === 'vote';
  return `<div class="spy-play-head">${heading('যুক্তি দিয়ে ভাবুন', vote ? 'কে গুপ্তচর?' : 'এবার কথা হোক।', `${bn(alive.length)} জন খেলায় আছেন · পরিচয় গোপন রাখুন`)}</div>
  ${s.verdict ? `<div class="finale-result spy-verdict">${icon(s.verdict.left ? 'logout' : 'shield')}<div><strong>${esc(s.verdict.name)}</strong><p>${s.verdict.left ? 'খেলা ছেড়েছেন।' : 'গুপ্তচর ছিলেন না। খাতায় নতুন সূত্র যোগ হলো, আলোচনা চলুক।'}</p></div></div>` : ''}
  ${timerBlock()}
  ${vote ? `<form id="spy-ballot" class="spy-ballot"><fieldset class="guess-players"><legend>সবাই মিলে একজনকে বাদ দিন</legend>${alive.map(p => `<label class="guess-option"><input type="radio" name="candidate" value="${p.id}" ${choice === p.id ? 'checked' : ''} required><span class="generic-person">${esc(p.name.charAt(0))}</span><strong>${esc(p.name)}</strong></label>`).join('')}</fieldset><button class="btn primary wide" type="submit" ${choice ? '' : 'disabled'}>ভোট চূড়ান্ত করুন${icon('lock')}</button></form>` : ''}
  <details class="cast-drawer spy-roster"><summary>খেলোয়াড়দের অবস্থা</summary><div class="name-list">${s.players.map(p => `<div class="name-row spy-row ${p.alive ? '' : 'is-out'}"><span class="seat-initial" aria-hidden="true">${esc(p.name.charAt(0))}</span><div class="seat-name"><span class="player-name">${esc(p.name)}</span><small class="seat-number">${p.quit ? 'খেলা ছেড়েছেন' : !p.alive ? 'বাদ পড়েছেন' : bn(p.score) + ' পয়েন্ট'}</small></div>${p.alive ? button('ছেড়ে যান', 'leave', 'text', '', `data-id="${p.id}"`) : ''}</div>`).join('')}</div></details>`;
}

function rankingRows() {
  return s.players.map(p => ({ name: p.name, score: p.score, history: p.history.map(h => ({ won: h.won, img: characterImage(h.role), label: `${h.role === 'SPY' ? 'গুপ্তচর' : 'শব্দ জানা'} · ${h.quit ? 'ছেড়ে গেছেন' : h.won ? 'জয়' : 'পরাজয়'}` })) }));
}
const rankLabels = { caption: 'Spy র‍্যাঙ্কিং', rank: '#', player: 'খেলোয়াড় · শেষ পাঁচ খেলা', points: 'পয়েন্ট', win: 'সবুজ ফ্রেম জয়', loss: 'লাল ফ্রেম পরাজয়', order: 'নতুন খেলা বাঁ দিকে', empty: 'এখনও কোনো খেলা শেষ হয়নি।', noGames: 'এখনও খেলেননি', number: bn };

function results() {
  const spy = byId(s.spyId), won = s.winner === 'WORD';
  return `<div class="over-heading"><div class="result-portrait ${won ? 'win' : 'loss'}"><img src="${characterImage(won ? 'WORD' : 'SPY')}" alt="" width="112" height="112"></div><span class="eyebrow">${won ? 'রহস্যের মীমাংসা' : 'রহস্য অমীমাংসিত'}</span><h1>${won ? 'গুপ্তচর ধরা পড়েছে!' : 'গুপ্তচরের জয়!'}</h1><p class="lede"><strong>${esc(spy.name)}</strong> ছিলেন গুপ্তচর।</p></div>
  <div class="spy-word-reveal"><span>খাতার শব্দটি ছিল</span><strong>${esc(s.word)}</strong></div>
  <section class="rank-section"><h2>র‍্যাঙ্কিং</h2><p>মোট পয়েন্ট আর শেষ পাঁচ খেলার ফল।</p>${rankTable(rankingRows(), rankLabels)}</section>
  <div class="end-actions">${button('আবার খেলুন', 'rematch', 'primary wide', 'play')}${button('নাম বা সময় বদলান', 'edit', 'secondary wide', 'edit')}<small class="spy-start-note">পরের খেলায় ফোন শুরু হবে ${esc(spy.name)} থেকে।</small></div>`;
}

/* ---------- Shell (same structure as the Mafia app) ---------- */

function screenKey() { return s.phase === 'reveal' ? 'reveal:' + s.revealIndex : ['discussion', 'vote'].includes(s.phase) ? `play:${s.round}:${s.phase}` : s.phase; }
function crumb() { return ({ setup: 'খেলোয়াড়', reveal: 'গোপন পাতা', discussion: 'আলোচনা', vote: 'ভোট', over: 'ফলাফল' })[s.phase]; }

function render() {
  const draft = $('#player-name')?.value, focused = document.activeElement?.id;
  const key = screenKey(), changed = key !== lastScreen; lastScreen = key;
  window.Android?.setSecure?.(s.phase === 'reveal' && shown);
  window.Android?.setPlaying?.(!['setup', 'over'].includes(s.phase));
  document.body.classList.toggle('private-mode', s.phase === 'reveal');
  $('#app').innerHTML = `<aside class="sidebar"><a class="brand" href="index.html"><span class="brand-icon">${icon('lens')}</span><span>Spy<small>মিসির আলির খাতা</small></span></a><div class="nav-label">আপনার আসর</div><nav>${button('সব খেলা', 'games', 'nav-item', 'home')}${button('কীভাবে খেলবেন', 'rules', 'nav-item', 'book')}${button('র‍্যাঙ্কিং', 'ranking', 'nav-item', 'trophy')}${s.phase !== 'setup' ? button('চলমান খেলা', 'noop', 'nav-item selected', 'play') : ''}</nav><div class="sidebar-bottom court-seal">${icon('lens')}<span>যুক্তি · রহস্য · বৃষ্টি</span></div></aside>
  <main><header class="topbar"><a class="mobile-brand" href="index.html" aria-label="সব খেলা">${icon('lens')} Spy</a><span class="breadcrumb">মিসির আলির খাতা / ${crumb()}</span><div class="header-controls">${s.phase === 'reveal' ? '' : `<button type="button" class="universe-toggle" data-action="ranking">${icon('trophy')}<span>র‍্যাঙ্কিং</span></button>`}<button type="button" class="app-menu-toggle" data-action="menu" aria-label="মেনু" aria-haspopup="dialog">${menuIcon()}</button></div></header>
  <div class="content game-content spy-content" id="spy-content">${s.phase === 'setup' ? setup() : s.phase === 'reveal' ? reveal() : s.phase === 'over' ? results() : playing()}</div><footer class="app-credit">Developed by Tanim</footer></main>`;
  if (draft && $('#player-name')) $('#player-name').value = draft;
  if (focused === 'player-name') $('#player-name')?.focus();
  newRow = null;
  bind();
  if (changed) enterScreen($('#spy-content'));
}

function bind() {
  $$('[data-action]').forEach(el => el.onclick = e => { if (el.type === 'submit') return; e.preventDefault(); act(el.dataset.action, el.dataset.id); });
  bindTapCard($('#app'), { back: revealBack, onChange: open => { shown = open; window.Android?.setSecure?.(open); if (open && !seen) { seen = true; const next = $('[data-action=next]'); next.disabled = false; next.classList.add('just-enabled'); $('#next-hint').textContent = 'ঢেকে দিয়ে ফোনটি এগিয়ে দিন।'; sound('notice'); } } });
  $('#name-form')?.addEventListener('submit', e => { e.preventDefault(); const input = $('#player-name'); try { addSpyPlayer(s, input.value); newRow = s.players.at(-1).id; input.value = ''; save(); render(); $('#player-name').focus(); } catch (err) { toast(err.message === 'FULL' ? 'সর্বোচ্চ ২০ জন খেলতে পারেন।' : err.message === 'PHASE' ? 'খেলা চলাকালে নাম যোগ করা যাবে না।' : 'একটি আলাদা নাম দিন, সর্বোচ্চ ২০ অক্ষরে।'); } });
  $('#minutes')?.addEventListener('change', e => { s.duration = Number(e.target.value) * 60; s.timer = newTimer(s.duration); save(); });
  $('#pool')?.addEventListener('change', e => { s.pool = e.target.value; save(); });
  $$('input[name=candidate]').forEach(el => el.onchange = () => { choice = el.value; const submit = $('#spy-ballot [type=submit]'); if (submit.disabled) { submit.disabled = false; submit.classList.add('just-enabled'); } });
  $('#spy-ballot')?.addEventListener('submit', async e => {
    e.preventDefault(); const id = new FormData(e.target).get('candidate'), p = byId(id);
    if (!p || !await confirmDialog('এই ভোটই চূড়ান্ত?', `${p.name}কে বাদ দেওয়া হবে।`)) return;
    voteSpy(s, id); choice = null; save(); sound(s.phase === 'over' ? 'win' : 'out'); transition();
  });
}

function transition(fn) { leaveScreen($('#spy-content'), () => { fn?.(); render(); window.scrollTo({ top: 0, behavior: 'instant' }); }); }

async function act(action, id) {
  try {
    switch (action) {
      case 'games': location.href = 'index.html'; return;
      case 'rules': return openRules();
      case 'ranking': return openRanking();
      case 'menu': return openMenu();
      case 'noop': return;
      case 'remove': removeSpyPlayer(s, id); break;
      case 'start': dealSpy(s); shown = false; seen = false; save(); sound('notice'); return transition();
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
      case 'rematch': resetSpy(s); dealSpy(s); shown = false; seen = false; save(); return transition();
      case 'edit': resetSpy(s); save(); return transition();
      case 'new':
        if (!['setup', 'over'].includes(s.phase) && !await confirmDialog('এই খেলা ছেড়ে যাবেন?', 'এই খেলার ফল যোগ হবে না। নাম রেখে নতুন খেলা শুরু করতে পারবেন।')) return;
        resetSpy(s); shown = false; seen = false; save(); return transition();
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

function sheet(title, kicker, body) {
  closeOverlay();
  $('#overlay').innerHTML = `<div class="scrim"><section class="rank-sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-title"><div class="picker-title"><div><span class="eyebrow">${kicker}</span><h2 id="sheet-title">${title}</h2></div><button type="button" class="icon-btn" id="close-sheet" aria-label="বন্ধ করুন">${icon('close')}</button></div>${body}</section></div>`;
  $('#close-sheet').onclick = closeOverlay; $('.scrim').onclick = e => { if (e.target === e.currentTarget) closeOverlay(); };
  trapKeys($('.rank-sheet'), closeOverlay); $('#close-sheet').focus();
}

function openRanking() {
  sheet('কে এগিয়ে?', 'র‍্যাঙ্কিং · মোট পয়েন্ট', `<p class="sheet-note">চলমান খেলার পরিচয় এখানে দেখা যায় না; শুধু শেষ হওয়া খেলার ফল।</p>${rankTable(rankingRows(), rankLabels)}${s.players.some(p => p.score || p.history.length) && ['setup', 'over'].includes(s.phase) ? `<button class="btn text wide" type="button" id="reset-scores">${icon('trash')}পয়েন্ট মুছে নতুন খাতা</button>` : ''}`);
  const reset = $('#reset-scores'); if (reset) reset.onclick = () => act('reset-scores');
}
function openRules() { sheet('কীভাবে খেলবেন', 'মিসির আলির খাতা', rulesBlock().replace('<details class="cast-drawer spy-rules">', '<details class="cast-drawer spy-rules" open>')); }

function openMenu() {
  closeOverlay();
  const items = [['র‍্যাঙ্কিং', 'trophy', 'ranking'], ['কীভাবে খেলবেন', 'book', 'rules'], [s.phase === 'setup' ? 'নতুন খেলা' : 'এই খেলা ছেড়ে নতুন খেলা', 'plus', 'new'], ['শব্দ: ' + (soundEnabled() ? 'চালু' : 'বন্ধ'), 'sound', 'sound'], ['সব খেলা', 'home', 'games']];
  $('#overlay').innerHTML = `<div class="scrim"><section class="dialog app-menu-dialog" role="dialog" aria-modal="true" aria-labelledby="menu-title"><div class="picker-title"><h2 id="menu-title">মেনু</h2><button type="button" id="close-menu" class="icon-btn" aria-label="বন্ধ করুন">${icon('close')}</button></div><div class="app-menu-items">${items.map(([label, ic, action]) => `<button class="btn secondary wide" type="button" data-menu="${action}">${icon(ic)}${label}${icon('arrow')}</button>`).join('')}</div></section></div>`;
  $('#close-menu').onclick = closeOverlay;
  $$('[data-menu]').forEach(el => el.onclick = () => { const a = el.dataset.menu; closeOverlay(); if (a === 'sound') { toggleSound(); openMenu(); } else act(a); });
  trapKeys($('.app-menu-dialog'), closeOverlay); $('#close-menu').focus();
}

/* ---------- Privacy, back button and timer ---------- */

function hide() { if (shown) setTapCard($('[data-tap-card]'), false, revealBack, open => { shown = open; window.Android?.setSecure?.(false); }); }
window.addEventListener('blur', hide);
document.addEventListener('visibilitychange', () => { if (document.hidden) hide(); });
window.onNativePause = hide;
window.onNativeBack = () => { if ($('#overlay').children.length) { closeOverlay(); return; } if (s.phase === 'setup') location.href = 'index.html'; else openMenu(); };
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#overlay').children.length) hide(); });

setInterval(() => {
  if (s.phase !== 'discussion') return;
  const phase = s.phase; tickSpy(s);
  if (s.phase !== phase) { choice = null; save(); sound('timer'); transition(); return; }
  const el = $('#timer-clock'); if (el) el.textContent = clock(secondsLeft(s.timer));
}, 250);

tickSpy(s); save(); render();
if ('serviceWorker' in navigator && !window.Android && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => { });

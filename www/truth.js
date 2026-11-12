import { sound, soundEnabled, toggleSound } from './sound.mjs';
import { esc, icon, appShell, pageHead, playerColour, playerDot, enterScreen, leaveScreen } from './ui-kit.mjs';

/* Truth or Dare: names first, then a bottle spins in the middle of the circle. No points, just turns. */

const $ = q => document.querySelector(q), $$ = q => [...document.querySelectorAll(q)];
const KEY = 'truth.v1';

export const TRUTHS = [
  'What is the most embarrassing thing you have done in front of a teacher?', 'Who in this room do you text the most?', 'What is a secret talent nobody here knows about?',
  'What was your most awkward moment at a wedding?', 'Have you ever pretended to be sick to skip class or work?', 'What is the silliest thing you are afraid of?',
  'What is the last lie you told?', 'Which app do you waste the most time on?', 'What is your most-played song right now, honestly?',
  'Who was your first crush?', 'What is the weirdest food combination you secretly love?', 'What is something you are glad your parents never found out?',
  'Have you ever laughed at the wrong moment? What happened?', 'What is the worst gift you have ever received?', 'What is the most childish thing you still do?',
  'If you could swap lives with someone here for a day, who would it be?', 'What is the longest you have gone without showering?', 'What is a habit you would never admit to on a first date?',
  'Have you ever blamed someone else for something you did?', 'What is the strangest dream you remember?', 'What is your guilty-pleasure TV show or film?',
  'What is the most money you have spent on something useless?', 'Which person here would survive longest in a zombie film?', 'What is your most embarrassing nickname?',
  'What was the last thing you searched on your phone?', 'Have you ever cried at a cartoon?', 'What is one thing you would change about yourself?',
  'What is the worst haircut you have ever had?', 'Who here is the worst at keeping secrets?', 'What is the biggest mistake you made in an exam?',
  'Have you ever sent a message to the wrong person?', 'What is something you pretend to understand but do not?', 'What is your biggest pet peeve?',
  'What is the most trouble you got into as a child?', 'Have you ever eaten food that fell on the floor?', 'What is a rumour you once believed?',
  'Which song do you sing loudest when you are alone?', 'What is your most irrational fear?', 'What is the nicest thing someone here has done for you?',
  'What is one thing on your bucket list?', 'What was your worst cooking disaster?', 'Who was your favourite teacher and why?',
  'What is the oddest thing in your bag right now?', 'Have you ever fallen asleep somewhere you should not have?', 'What would you do with one day of being invisible?'
];
export const DARES = [
  'Do your best impression of someone in this room until somebody guesses who.', 'Sing the chorus of a song chosen by the person on your left.', 'Talk in a robot voice until your next turn.',
  'Do ten jumping jacks while saying the alphabet backwards.', 'Let the group post one harmless emoji to your status.', 'Speak only in questions until your next turn.',
  'Dance with no music for thirty seconds.', 'Show the third photo in your gallery.', 'Do your best runway walk across the room.',
  'Balance a book on your head for one minute.', 'Tell a joke. If nobody laughs, tell another.', 'Act like a cat until someone gives you a snack.',
  'Say a tongue twister three times fast.', 'Hold a plank for thirty seconds.', 'Let the person on your right draw a moustache on your hand.',
  'Narrate what everyone is doing like a nature documentary for one minute.', 'Speak in an accent of the group’s choice until your next turn.', 'Do your best evil villain laugh.',
  'Pretend to be a news reader announcing something that happened today.', 'Eat a spoonful of something the group picks from the kitchen.', 'Swap one item of clothing with the person on your left.',
  'Try to lick your elbow.', 'Do an advert for the nearest object as if you are selling it on TV.', 'Keep a straight face while everyone tries to make you laugh for thirty seconds.',
  'Call a friend and sing them happy birthday, even if it is not their birthday.', 'Write a two-line poem about the person opposite you and read it aloud.', 'Walk like a penguin to the door and back.',
  'Do your best celebrity impression.', 'Let the group choose your profile picture for the next hour.', 'Say something nice about every person here.',
  'Mime brushing your teeth in slow motion.', 'Pretend you are a tour guide showing everyone this room.', 'Spin around five times and then try to walk straight.',
  'Give a dramatic speech about why your favourite snack is the best.', 'Make up a dance move and teach it to everyone.', 'Hum a song and let the others guess it.',
  'Wear your socks on your hands until your next turn.', 'Do your best opera singing for fifteen seconds.', 'Show everyone your best dance move from a wedding.',
  'Pretend to be a waiter and take everyone’s order.', 'Say the months of the year in reverse order.', 'Keep your eyes closed until your next turn.'
];
const COLOURS = ['#ff5d8f', '#ffb000', '#2ec4b6', '#7b61ff', '#ff7a3d', '#3a86ff', '#8ac926', '#e05cff'];

let s = load(), view = 'play', lastScreen = '', spinning = false;
function fresh() { return { v: 1, phase: 'setup', players: [], angle: 0, chosen: null, card: null, used: { truth: [], dare: [] } }; }
function load() { try { const d = JSON.parse(localStorage.getItem(KEY)); if (d?.v === 1) return d; } catch {} return fresh(); }
function save() { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} }
const rand = n => crypto.getRandomValues(new Uint32Array(1))[0] % n;
const colour = i => COLOURS[i % COLOURS.length];

// Prompts don't repeat until the whole list has been used.
function draw(kind) {
  const list = kind === 'truth' ? TRUTHS : DARES, used = s.used[kind];
  if (used.length >= list.length) used.length = 0;
  const left = list.map((_, i) => i).filter(i => !used.includes(i)), pick = left[rand(left.length)];
  used.push(pick); return list[pick];
}

/* ---------- Screens ---------- */

function setup() {
  return `${pageHead('Party game', 'Truth or Dare', 'Add everyone sitting in the circle, then spin the bottle.')}
  <section class="td-setup" id="players"><form id="name-form" class="name-form"><input id="player-name" maxlength="18" autocomplete="off" placeholder="Player name" aria-label="Player name" ${s.players.length >= 12 ? 'disabled' : ''}><button class="btn primary" type="submit" ${s.players.length >= 12 ? 'disabled' : ''}>${icon('plus')}Add</button></form>
  <div class="td-chips">${s.players.map((p, i) => `<span class="td-chip" style="--c:${colour(i)}">${esc(p)}<button type="button" data-action="remove" data-id="${i}" aria-label="Remove ${esc(p)}">${icon('close')}</button></span>`).join('') || '<p class="td-empty">No players yet. Add at least two.</p>'}</div>
  ${button('Start the circle', 'start', 'primary wide td-go', 'play', s.players.length < 2 ? 'disabled' : '')}</section>`;
}
function circle() {
  const n = s.players.length, radius = n > 8 ? 42 : 40;
  return `<div class="td-circle" style="--n:${n}">${s.players.map((p, i) => { const a = i / n * 2 * Math.PI - Math.PI / 2; return `<span class="td-seat${s.chosen === i && !spinning ? ' is-chosen' : ''}" style="--c:${colour(i)};left:${50 + Math.cos(a) * radius}%;top:${50 + Math.sin(a) * radius}%">${esc(p)}</span>`; }).join('')}
  <button type="button" class="td-bottle" data-action="spin" aria-label="Spin the bottle" ${spinning ? 'disabled' : ''}><svg viewBox="0 0 60 200" style="transform:rotate(${s.angle}deg)" aria-hidden="true"><defs><linearGradient id="glass" x1="0" x2="1"><stop offset="0" stop-color="#1f9e5a"/><stop offset=".45" stop-color="#5ee39a"/><stop offset="1" stop-color="#137a43"/></linearGradient></defs><rect x="23" y="2" width="14" height="10" rx="3" fill="#ffb000"/><path d="M24 12h12v34c0 10 16 18 16 36v104c0 8-6 12-14 12H22c-8 0-14-4-14-12V82c0-18 16-26 16-36z" fill="url(#glass)" stroke="#0d5c32" stroke-width="2"/><rect x="12" y="104" width="36" height="46" rx="6" fill="#fff6d6"/><path d="M18 127h24" stroke="#ff5d8f" stroke-width="5" stroke-linecap="round"/><path d="M16 88c2-8 6-12 10-16" stroke="#ffffffaa" stroke-width="4" stroke-linecap="round" fill="none"/></svg></button></div>`;
}
function play() {
  const who = s.chosen != null ? s.players[s.chosen] : null, c = s.chosen != null ? colour(s.chosen) : '#7b61ff';
  let panel;
  if (spinning) panel = `<p class="td-status">Spinning…</p>`;
  else if (s.card) panel = `<article class="td-card ${s.card.kind}" style="--c:${c}"><span class="td-kind">${s.card.kind === 'truth' ? 'Truth' : 'Dare'} for ${esc(who)}</span><p>${esc(s.card.text)}</p></article><div class="td-actions">${button('Another one', 'again', 'secondary', 'spark')}${button('Spin again', 'spin', 'primary', 'play')}</div>`;
  else if (who) panel = `<p class="td-status"><b style="color:${c}">${esc(who)}</b>, truth or dare?</p><div class="td-choice">${button('Truth', 'truth', 'td-truth', 'eye')}${button('Dare', 'dare', 'td-dare', 'spark')}</div>`;
  else panel = `<p class="td-status">Tap the bottle to spin.</p>`;
  return `${circle()}<div class="td-panel">${panel}</div>`;
}
function rules() {
  return `${pageHead('How to play', 'Truth or Dare', '')}<ol class="plain-rules">
  <li>Sit in a circle and add everyone's name in seating order.</li>
  <li>Tap the bottle. Whoever it points at picks Truth or Dare.</li>
  <li>Truth: answer honestly. Dare: do it, or let the group pick a different one.</li>
  <li>Nobody keeps score. Skip anything that makes someone uncomfortable.</li>
  <li>Spin again for the next person.</li></ol>`;
}
const button = (label, action, cls, ic, extra = '') => `<button type="button" class="btn ${cls}" data-action="${action}" ${extra}>${icon(ic)}${label}</button>`;

function render() {
  const key = view + s.phase, changed = key !== lastScreen; lastScreen = key;
  const body = view === 'rules' ? rules() : s.phase === 'play' ? play() : setup();
  $('#app').innerHTML = appShell({ brand: 'Truth or Dare', brandSub: 'Spin the bottle', brandIcon: 'spark', brandAction: 'tab-play', crumb: view === 'rules' ? 'Rules' : s.phase === 'play' ? `${s.players.length} players` : 'Players', active: view, contentClass: 'game-content td-content', labels: { back: 'All games', menu: 'Menu', sections: 'Sections' },
    tabs: [{ id: 'play', label: 'Play', icon: 'play', action: 'tab-play' }, { id: 'rules', label: 'Rules', icon: 'book', action: 'tab-rules' }], body });
  $$('[data-action]').forEach(el => el.onclick = e => { e.preventDefault(); act(el.dataset.action, el.dataset.id); });
  $('#name-form')?.addEventListener('submit', e => {
    e.preventDefault(); const name = $('#player-name').value.trim().replace(/\s+/g, ' ');
    if (!name) return; if (s.players.some(p => p.toLowerCase() === name.toLowerCase())) return toast('That name is already in the circle.');
    s.players.push(name); save(); render(); $('#player-name')?.focus();
  });
  if (changed) enterScreen($('#screen'));
}
function transition() { const el = $('#screen'); el ? leaveScreen(el, render) : render(); }

function spin() {
  if (spinning || s.players.length < 2) return;
  const n = s.players.length; let target = rand(n); if (target === s.chosen && n > 2) target = (target + 1 + rand(n - 1)) % n;
  // The bottle's neck points up at 0deg; seat i sits at i/n of a full turn clockwise from the top.
  const base = Math.ceil(s.angle / 360) * 360, jitter = (Math.random() - .5) * (300 / n);
  s.angle = base + 360 * (4 + rand(3)) + target / n * 360 + jitter; s.chosen = target; s.card = null; spinning = true; save(); render();
  sound('timer');
  setTimeout(() => { spinning = false; sound('notice'); render(); }, 3200);
}
function act(action, id) {
  switch (action) {
    case 'tab-play': case 'tab-rules': { const next = action.slice(4); if (view === next) return; view = next; return transition(); }
    case 'app-menu': return openMenu();
    case 'games': location.href = 'index.html'; return;
    case 'remove': s.players.splice(Number(id), 1); save(); return render();
    case 'start': if (s.players.length < 2) return; s.phase = 'play'; s.chosen = null; s.card = null; save(); return transition();
    case 'spin': return spin();
    case 'truth': case 'dare': s.card = { kind: action, text: draw(action) }; save(); sound('vote'); return render();
    case 'again': s.card = { kind: s.card.kind, text: draw(s.card.kind) }; save(); return render();
    case 'players': s.phase = 'setup'; s.card = null; save(); view = 'play'; return transition();
  }
}

function toast(text) { const t = $('#toast'); t.textContent = text; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600); }
function closeOverlay() { $('#overlay').innerHTML = ''; }
function openMenu() {
  const items = [...(s.phase === 'play' ? [['Change players', 'people', 'players', 'tone-people']] : []), ['Sound: ' + (soundEnabled() ? 'on' : 'off'), 'sound', 'sound', ''], ['Back to all games', 'back', 'games', 'tone-quiet']];
  $('#overlay').innerHTML = `<div class="scrim"><section class="dialog app-menu-dialog" role="dialog" aria-modal="true" aria-labelledby="menu-title"><div class="picker-title"><h2 id="menu-title">Menu</h2><button type="button" id="close-menu" class="icon-btn" aria-label="Close">${icon('close')}</button></div><div class="app-menu-items">${items.map(([label, ic, a, tone]) => `<button class="btn secondary wide ${tone}" type="button" data-menu="${a}">${icon(ic)}${label}${icon('arrow')}</button>`).join('')}</div></section></div>`;
  $('#close-menu').onclick = closeOverlay;
  $$('[data-menu]').forEach(el => el.onclick = () => { const a = el.dataset.menu; closeOverlay(); if (a === 'sound') { toggleSound(); openMenu(); } else act(a); });
}
addEventListener('keydown', e => { if (e.key === 'Escape' && $('#overlay').innerHTML) closeOverlay(); });
render();

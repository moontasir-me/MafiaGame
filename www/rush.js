import { COLOURS, COLOUR_NAME, LABEL, DRAW } from './rush-engine.mjs';
import { sound } from './sound.mjs';
import { saveMatch, readHistory, overallRanking, hallOfFame } from './history.mjs';
import { esc, icon, appShell, pageHead, rankTable, fameTable, enterScreen, leaveScreen } from './ui-kit.mjs';
import { $, $$, toast, confirmBox, openMenu } from './lamp.mjs';
import { onlineName, tableApi } from './online-ui.mjs';
import { readProfile, saveProfile } from './profile.mjs';

/* Colour Rush: always online, 2–20 players, Classic or Ruthless. English throughout. */
const ART = 'assets/rush/cover.svg', RULES = { classic: 'Classic', ruthless: 'Ruthless' };
const ERR = { ROOM_GONE: 'No room with that code.', FULL: 'That room is full (20 players).', STARTED: 'That game has already started.', NAME_TAKEN: 'Someone in the room already has that name. Change your name and try again.', NAME: 'Enter your name.', TURN: "It's not your turn.", ACTION: "That card can't be played now.", COLOUR: 'Pick a colour.', TARGET: 'Pick a player to swap with.', COUNTS: 'At least two players are needed.', RATE_LIMIT: 'Too many tries. Wait a moment.', WRONG_GAME: 'That code belongs to another game.', ONLINE_NOT_CONFIGURED: 'Online play is not available right now.' };
let view = 'play', lastScreen = '', online = null, poll = 0, busy = false, rule = 'classic', saved = false;
try { rule = localStorage.getItem('rush.rule') === 'ruthless' ? 'ruthless' : 'classic'; } catch { }
const button = (label, action, cls, ic, extra = '') => `<button type="button" class="btn ${cls}" data-action="${action}" ${extra}>${icon(ic)}${label}</button>`;
const m = () => online?.match;
const myTurn = () => m() && m().winner === null && m().turn === online.me;
const SYMBOL = { skip: '⊘', rev: '⇄', d2: '+2', d4c: '+4', skipall: '⊘⊘', discall: '✕', wild: '★', wd4: '+4', wd6: '+6', wd10: '+10', wrev4: '⇄+4' };
const label = c => /^\d$/.test(c.v) ? c.v : LABEL[c.v];

function card(c, { cls = '', attrs = '' } = {}) {
  const sym = /^\d$/.test(c.v) ? c.v : SYMBOL[c.v], col = c.c === 'w' ? (c.chosen || 'w') : c.c;
  return `<button type="button" class="rc rc-${col} ${c.c === 'w' ? 'is-wild' : ''} ${cls}" ${attrs} aria-label="${COLOUR_NAME[c.c]} ${label(c)}"><span class="rc-corner">${sym}</span><span class="rc-face">${sym}</span><span class="rc-corner b">${sym}</span></button>`;
}

/* ---------- Screens ---------- */
function entry() {
  const name = onlineName();
  return `<header class="rs-head"><img src="${ART}" alt="" width="640" height="420"><div><h1>Colour Rush</h1><p>Match the colour or the symbol. Empty your hand first. 2–20 players, each on their own phone.</p></div></header>
  <section class="rs-panel"><h2>Rules</h2><div class="rs-seg" role="radiogroup">${Object.entries(RULES).map(([k, l]) => `<button type="button" role="radio" aria-checked="${rule === k}" class="${rule === k ? 'is-on' : ''}" data-action="rule" data-id="${k}"><b>${l}</b><small>${k === 'classic' ? 'The familiar game' : 'Stacking draws, swaps, knock-outs'}</small></button>`).join('')}</div></section>
  <section class="ol-card"><div class="ol-me">${name ? `<span class="ol-face">${esc(name.charAt(0))}</span><span><small>You'll play as</small><b>${esc(name)}</b></span>` : `<label class="ol-name"><small>Your name (used in every online game)</small><input id="rs-name" maxlength="20" autocomplete="nickname" placeholder="Your name"></label>`}</div>
  <button type="button" class="btn primary wide" data-action="create">Open a new room</button>
  <div class="ol-or"><span>or join with a code</span></div>
  <div class="otp" role="group" aria-label="Room code">${Array.from({ length: 5 }, (_, i) => `<input class="otp-box" maxlength="1" autocapitalize="characters" autocomplete="one-time-code" aria-label="Code letter ${i + 1}">`).join('')}</div>
  <button type="button" class="btn secondary wide" data-action="join" disabled>Join</button></section>`;
}
function lobby() {
  const o = online;
  return `<section class="ol-card ol-lobby"><span class="ol-eyebrow">Colour Rush · ${RULES[o.rule] || 'Classic'}</span>
  <div class="otp otp-show" aria-label="Room code ${esc(o.code)}">${[...o.code].map(c => `<b>${esc(c)}</b>`).join('')}</div>
  <button type="button" class="ol-link" data-action="share">Share the code</button>
  <ul class="ol-members">${o.members.map((n, i) => `<li><span class="ol-face">${esc(n.charAt(0))}</span>${esc(n)}${i === 0 ? '<small>host</small>' : ''}${i === o.me ? '<small>you</small>' : ''}</li>`).join('')}<li class="ol-empty">${o.members.length}/20 players</li></ul>
  ${o.host ? button(o.members.length < 2 ? 'Waiting for players…' : `Deal to ${o.members.length} players`, 'start', 'primary wide', 'play', o.members.length < 2 ? 'disabled' : '') : '<p class="ol-note">The host will start the game.</p>'}
  ${button('Leave room', 'leave', 'text wide', 'close')}</section>`;
}
function table() {
  const g = m(), me = online.me, t = g.top, mine = myTurn();
  const ring = g.players.map((p, i) => `<li class="rs-seat${i === g.turn && g.winner === null ? ' is-turn' : ''}${p.out ? ' is-out' : ''}${i === me ? ' is-me' : ''}"><span class="ol-face">${esc(p.name.charAt(0))}</span><b>${esc(i === me ? 'You' : p.name)}</b><span class="rs-count" aria-label="${p.count} cards">${p.out ? 'out' : p.count}</span></li>`).join('');
  const hand = g.hand.map(c => { const ok = mine && (!g.drew || g.drew === c.id) && playableHere(g, c); return card(c, { cls: ok ? 'can' : 'cannot', attrs: `data-card="${c.id}"${ok ? '' : ' aria-disabled="true"'}` }); }).join('');
  const msg = message(g);
  return `<div class="rs-table">
  <ol class="rs-ring" aria-label="Players">${ring}</ol>
  <div class="rs-centre rs-${g.colour}"><div class="rs-dir ${g.dir > 0 ? 'cw' : 'ccw'}" aria-label="${g.dir > 0 ? 'Clockwise' : 'Anticlockwise'}">${g.dir > 0 ? '↻' : '↺'}</div>
   <button type="button" class="rs-deck" data-action="draw" ${mine && !g.drew && !busy ? '' : 'disabled'} aria-label="Draw">${g.pending ? `<b>+${g.pending}</b>` : '<b>Draw</b>'}<small>${g.drawCount} left</small></button>
   ${card(t, { cls: 'top', attrs: 'tabindex="-1"' })}
   <span class="rs-colour" aria-label="Colour in play: ${COLOUR_NAME[g.colour]}">${COLOUR_NAME[g.colour]}</span></div>
  <p class="rs-msg" role="status">${msg}</p>
  ${g.winner !== null ? over(g) : `<div class="rs-actions">${g.drew && mine ? button('Keep it, pass', 'pass', 'secondary', 'arrow') : ''}${mine && g.pending ? button(`Take ${g.pending} cards`, 'draw', 'secondary', 'plus') : ''}</div>`}
  <div class="rs-hand-wrap"><div class="rs-hand" aria-label="Your hand">${hand}</div><small class="rs-hand-n">${g.hand.length} card${g.hand.length === 1 ? '' : 's'} in your hand</small></div></div>`;
}
function playableHere(g, c) {
  if (g.pending) return g.mode === 'ruthless' && DRAW[c.v] !== undefined;
  return c.c === 'w' || c.c === g.colour || c.v === g.top.v;
}
function message(g) {
  const name = i => i === online.me ? 'You' : esc(g.players[i].name), l = g.last, turn = g.players[g.turn];
  if (g.winner !== null) return '';
  let s = '';
  if (l) {
    if (l.drewN !== undefined) s = `${name(l.by)} drew ${l.drewN} card${l.drewN === 1 ? '' : 's'}.`;
    else if (l.card) s = `${name(l.by)} played ${LABEL[l.card] || l.card}${l.card.startsWith('w') ? ` and chose ${COLOUR_NAME[l.colour]}` : ''}.`;
    if (l.victim !== undefined) s += ` ${name(l.victim)} draws and misses a turn.`;
    if (l.swap !== undefined) s += ` Hands swapped with ${name(l.swap)}.`;
    if (l.rotate) s += ' Every hand moved on.';
    if (l.discarded) s += ` ${l.discarded} more discarded.`;
    if (l.lastCard) s += ` <b>${name(l.by)} ${l.by === online.me ? 'have' : 'has'} one card left!</b>`;
    if (l.knocked) s += ` ${l.knocked.map(name).join(', ')} knocked out with 25 cards.`;
  }
  const now = g.turn === online.me ? (g.drew ? 'Play the card you drew, or pass.' : g.pending ? `Stack a draw card, or take ${g.pending}.` : 'Your turn.') : `${esc(turn.name)}'s turn…`;
  return `${s} ${now}`;
}
function over(g) {
  const order = g.standings || [];
  return `<section class="rs-over"><h2>${g.winner === online.me ? 'You win!' : `${esc(g.players[g.winner].name)} wins!`}</h2><ol>${order.slice(0, 20).map(i => `<li>${esc(g.players[i].name)} <small>${g.players[i].out ? 'knocked out' : `${g.players[i].count} left`}</small></li>`).join('')}</ol>
  ${online.host ? button('Deal again', 'again', 'primary wide', 'play') : '<p class="ol-note">The host can deal again.</p>'}${button('Leave room', 'leave', 'secondary wide', 'close')}</section>`;
}
function rules() {
  return `${pageHead('Rules', 'Colour Rush', 'Every player uses their own phone. 2 to 20 players.')}<ol class="plain-rules">
  <li>Everyone gets 7 cards. On your turn, play a card that matches the colour or the symbol of the top card. Wild cards go on anything; you pick the next colour.</li>
  <li><b>Skip</b> skips the next player, <b>Reverse</b> turns the direction (with two players it acts as Skip), <b>+2</b> and <b>Wild +4</b> make the next player draw.</li>
  <li>Can't play? Draw. If the drawn card fits, you may play it, or keep it and pass.</li>
  <li>First to empty their hand wins. Ranking: 3 points for first, 2 for second, 1 for third (fewest cards left).</li></ol>
  <h2 class="rs-rule-h">Ruthless</h2><ol class="plain-rules">
  <li>Extra cards: coloured +4, Skip all (you play again), Discard all (drop every card of that colour), Wild +6, Wild +10, Wild reverse +4.</li>
  <li>Draw cards stack: answer a draw card with any draw card to pass the total on. Otherwise you take the whole pile.</li>
  <li>With no card to play, keep drawing until one fits.</li>
  <li>Play a 7 to swap hands with someone. Play a 0 and every hand moves on one seat.</li>
  <li>Reach 25 cards and you are knocked out. The last player standing also wins.</li></ol>
  <p class="lede">Someone who does nothing for 45 seconds draws automatically, so big tables keep moving.</p>`;
}
const labels = { caption: 'Results', rank: '#', player: 'Player · last five games', points: 'Points', win: 'Green: won', loss: 'Red: lost', order: 'Newest on the left', empty: 'No finished games yet.', noGames: 'No games yet', number: n => String(n) };
function ranking() {
  const list = readHistory(), all = overallRanking(list, 'rush').map(r => ({ name: r.name, score: r.points, note: `${r.matches} games · ${r.wins} won`, history: r.recent.map(h => ({ won: h.won, img: h.img || ART, label: h.label || '' })) }));
  return `${pageHead('Ranking', 'Colour Rush', '3 for first, 2 for second, 1 for third.')}<section class="rank-section">${rankTable(all, labels)}</section>
  <section class="fame-section"><h2>${icon('trophy')}Hall of fame</h2>${fameTable(hallOfFame(list, 'rush'), { caption: 'Hall of fame', player: 'Player', points: 'Points', empty: 'Nobody yet.', number: n => String(n), meta: e => new Date(e.date).toLocaleDateString('en-GB') })}</section>`;
}

/* ---------- Shell ---------- */
function render() {
  const screen = !online ? 'entry' : !online.started ? 'lobby' : 'table', key = view + screen, changed = key !== lastScreen; lastScreen = key;
  const keepScroll = $('.rs-hand')?.scrollLeft;
  const body = view === 'rules' ? rules() : view === 'ranking' ? ranking() : screen === 'entry' ? entry() : screen === 'lobby' ? lobby() : table();
  $('#app').innerHTML = appShell({ brand: 'Colour Rush', brandSub: RULES[online?.rule || rule], brandIcon: 'cards', brandAction: 'tab-play', crumb: view === 'rules' ? 'Rules' : view === 'ranking' ? 'Ranking' : screen === 'table' ? `Room ${online.code}` : '', active: view, contentClass: 'game-content rush-content', labels: { back: 'All games', menu: 'Menu', sections: 'Sections' }, backHref: 'index.html', tabs: [{ id: 'play', label: 'Play', icon: 'play', action: 'tab-play' }, { id: 'rules', label: 'Rules', icon: 'book', action: 'tab-rules' }, { id: 'ranking', label: 'Ranking', icon: 'trophy', action: 'tab-ranking' }], body });
  $$('[data-action]').forEach(el => el.onclick = e => { e.preventDefault(); act(el.dataset.action, el.dataset.id); });
  $$('[data-card]').forEach(el => el.onclick = () => play(el.dataset.card));
  if (keepScroll && $('.rs-hand')) $('.rs-hand').scrollLeft = keepScroll;
  bindCode();
  if (changed) enterScreen($('#screen'));
}
const transition = () => leaveScreen($('#screen'), () => { render(); scrollTo({ top: 0, behavior: 'instant' }); });
function bindCode() {
  const boxes = $$('.otp-box'), join = $('[data-action=join]'); if (!boxes.length) return;
  const code = () => boxes.map(b => b.value).join(''), refresh = () => { join.disabled = code().length !== 5; };
  const fill = (from, text) => { const chars = [...text.toUpperCase()].filter(c => /[A-Z0-9]/.test(c)); let i = from; for (const c of chars) { if (i >= 5) break; boxes[i++].value = c; } boxes[Math.min(i, 4)].focus(); refresh(); };
  boxes.forEach((b, i) => { b.oninput = () => { const v = b.value; b.value = ''; fill(i, v); }; b.onkeydown = e => { if (e.key === 'Backspace' && !b.value && i) { boxes[i - 1].value = ''; boxes[i - 1].focus(); refresh(); e.preventDefault(); } else if (e.key === 'Enter' && !join.disabled) join.click(); }; b.onpaste = e => { e.preventDefault(); fill(i, e.clipboardData.getData('text')); }; });
  join.dataset.code = ''; join.onclick = e => { e.preventDefault(); act('join', code()); };
}

/* ---------- Online ---------- */
const api = body => tableApi({ game: 'rush', ...body });
function adopt(v) {
  const before = online?.match;
  online = { ...online, code: v.code, token: v.token || online?.token, me: v.me, host: v.host, members: v.members, started: v.started, rule: v.rule, match: v.match };
  try { sessionStorage.setItem('rush.online', JSON.stringify({ code: online.code, token: online.token })); } catch { }
  const g = v.match;
  if (g && before && g.seq !== before.seq) { if (g.turn === v.me && before.turn !== v.me && g.winner === null) { sound('notice'); navigator.vibrate?.(40); } else sound('vote'); }
  if (g && !g.last) saved = false;
  if (g && g.winner !== null) finish(g);
}
function finish(g) {
  if (saved) return; saved = true; sound(g.winner === online.me ? 'win' : 'out');
  const place = (g.standings || []).indexOf(online.me), pts = [3, 2, 1][place] ?? 0;
  saveMatch({ id: crypto.randomUUID(), game: 'rush', players: [{ name: g.players[online.me].name, points: pts, recent: [{ won: g.winner === online.me, img: ART, label: `Colour Rush · ${place + 1}${['st', 'nd', 'rd'][place] || 'th'}` }] }] });
}
function startPolling() {
  clearInterval(poll);
  poll = setInterval(async () => {
    if (!online || document.hidden || busy) return;
    try { const sig = JSON.stringify([online.members, online.started, online.match?.seq]); adopt(await api({ op: 'state', code: online.code, token: online.token })); if (JSON.stringify([online.members, online.started, online.match?.seq]) !== sig) render(); }
    catch (e) { if (['ROOM_GONE', 'AUTH'].includes(e.message)) { clearInterval(poll); online = null; toast('The room has closed.'); render(); } }
  }, 1000);
}
async function send(body) {
  if (busy) return; busy = true;
  try { const was = online.started; adopt(await api({ code: online.code, token: online.token, ...body })); busy = false; was === online.started ? render() : transition(); }
  catch (e) { busy = false; toast(ERR[e.message] || 'Connection problem. Try again.'); render(); }
}
function myName() {
  const input = $('#rs-name'); if (!input) return onlineName();
  const n = input.value.trim().replace(/\s+/g, ' ').slice(0, 20); if (!n) { input.focus(); toast('Enter your name.'); return ''; }
  saveProfile({ ...readProfile(), name: n }); return n;
}
function chooser(title, options) {
  return new Promise(resolve => {
    $('#overlay').innerHTML = `<div class="scrim"><section class="dialog" role="dialog" aria-modal="true" aria-label="${esc(title)}"><h2>${esc(title)}</h2><div class="rs-choices">${options.map(o => `<button type="button" class="btn secondary ${o.cls || ''}" data-pick="${o.id}">${o.label}</button>`).join('')}</div><button type="button" class="btn text wide" data-pick="">Cancel</button></section></div>`;
    $$('[data-pick]').forEach(b => b.onclick = () => { $('#overlay').innerHTML = ''; resolve(b.dataset.pick || null); });
  });
}
async function play(id) {
  const g = m(); if (!myTurn() || busy) return;
  const c = g.hand.find(x => x.id === id); if (!c) return;
  if (!playableHere(g, c) || (g.drew && g.drew !== id)) { navigator.vibrate?.(20); return toast(g.pending ? 'Stack a draw card or take the cards.' : "That card doesn't match."); }
  let colour, target;
  if (c.c === 'w') { colour = await chooser('Choose the next colour', COLOURS.map(k => ({ id: k, label: COLOUR_NAME[k], cls: `pick-${k}` }))); if (!colour) return; }
  if (g.mode === 'ruthless' && c.v === '7' && g.hand.length > 1) { target = await chooser('Swap hands with', g.players.map((p, i) => ({ p, i })).filter(({ p, i }) => i !== online.me && !p.out).map(({ p, i }) => ({ id: String(i), label: `${esc(p.name)} · ${p.count}` }))); if (target === null) return; target = Number(target); }
  send({ op: 'play', card: id, colour, target });
}

async function act(action, id) {
  switch (action) {
    case 'tab-play': case 'tab-rules': case 'tab-ranking': { const nx = action.slice(4); if (view === nx) return; view = nx; return transition(); }
    case 'app-menu': return openMenu(online ? [['Leave room', 'close', 'leave', 'tone-danger']] : [], act);
    case 'rule': rule = id === 'ruthless' ? 'ruthless' : 'classic'; try { localStorage.setItem('rush.rule', rule); } catch { } return render();
    case 'create': case 'join': {
      const name = myName(); if (!name) return;
      if (action === 'join' && !/^[A-Z0-9]{5}$/.test(id || '')) return toast('Type the 5-letter code.');
      try { busy = true; online = null; adopt(await api(action === 'create' ? { op: 'create', name, rule } : { op: 'join', name, code: id })); busy = false; saved = false; startPolling(); transition(); }
      catch (e) { busy = false; online = null; toast(ERR[e.message] || 'Connection problem. Try again.'); }
      return;
    }
    case 'share': { const text = `Play Colour Rush with me on শীতলপাটি. Code: ${online.code}`; try { if (navigator.share) await navigator.share({ text, url: location.href.split('?')[0] }); else { await navigator.clipboard.writeText(text); toast('Code copied.'); } } catch { } return; }
    case 'start': return send({ op: 'start' });
    case 'again': saved = false; return send({ op: 'again' });
    case 'draw': return send({ op: 'draw' });
    case 'pass': return send({ op: 'pass' });
    case 'leave': if (!await confirmBox('Leave this room?', '', 'Leave', 'Stay')) return; clearInterval(poll); online = null; try { sessionStorage.removeItem('rush.online'); } catch { } view = 'play'; return transition();
    case 'game-home': view = 'play'; return transition();
  }
}

try { const s = JSON.parse(sessionStorage.getItem('rush.online')); if (s) api({ op: 'state', ...s }).then(v => { online = { ...s }; adopt(v); startPolling(); render(); }).catch(() => { }); } catch { }
render();
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => { });

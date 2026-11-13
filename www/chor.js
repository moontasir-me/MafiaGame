import { ROLES, deal, score, targetOf } from './chor-engine.mjs';
import { sound } from './sound.mjs';
import { saveMatch, readHistory, overallRanking, hallOfFame } from './history.mjs';
import { readAccounts, ensureAccount } from './accounts.mjs';
import { numberPick, bindNumberPick, esc, icon, appShell, pageHead, rankTable, fameTable, playerDot, playerColour, enterScreen, leaveScreen } from './ui-kit.mjs';
import { $, $$, bn, LANTERN, toast, confirmBox, openMenu, SHELL_LABELS, TABS, BACK } from './lamp.mjs';

/* চোর ডাকাত পুলিশ বাবু on one phone: four players take turns drawing a folded chit and peek alone.
   বাবু speaks up, পুলিশ names the চোর. Ranking points are the total divided by 100. */
const KEY = 'chor.v1', ART = 'assets/chor/cover.svg', ROUND_CHOICES = [5, 10, 15];

function fresh() { return { v: 1, phase: 'setup', rounds: 5, round: 0, names: ['', '', '', ''], totals: [0, 0, 0, 0], chits: [], owner: [], drawer: 0, start: 0, guess: -1, gained: [], history: [[], [], [], []] }; }
let s = fresh(), view = 'play', lastScreen = '';
try { const d = JSON.parse(localStorage.getItem(KEY)); if (d?.v === 1) s = { ...fresh(), ...d }; } catch { }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { } };
const button = (label, action, cls, ic, extra = '') => `<button type="button" class="btn ${cls}" data-action="${action}" ${extra}>${icon(ic)}${label}</button>`;
const roleOf = player => s.chits[s.owner.indexOf(player)];
const who = role => s.owner[s.chits.indexOf(role)];
const order = k => (s.start + k) % 4;
const pname = i => esc(s.names[i]);
const chit = (inner, cls = '', attrs = '') => `<button type="button" class="chit ${cls}" ${attrs}>${inner}</button>`;
const roleChit = (role, extra = '') => `<span class="chit open" style="--ink:${ROLES[role].colour}"><b>${ROLES[role].name}</b><small>${bn(ROLES[role].points)}</small>${extra}</span>`;

/* ---------- Screens ---------- */

function chips() {
  const taken = s.names.map(n => n.trim().toLocaleLowerCase()), list = readAccounts().filter(a => !taken.includes(a.name.toLocaleLowerCase()));
  return list.length && s.names.some(n => !n.trim()) ? `<div class="acc-mini"><span>অ্যাকাউন্ট থেকে</span>${list.map(a => `<button type="button" data-action="fill" data-id="${esc(a.name)}">+ ${esc(a.name)}</button>`).join('')}</div>` : '';
}
function setup() {
  return `<header class="lamp-head"><div><h1><span class="cr c1">চোর</span> <span class="cr c2">ডাকাত</span> <span class="cr c3">পুলিশ</span> <span class="cr c4">বাবু</span></h1><p>চারটা কাগজ ভাঁজ করা। পুলিশ এক দানে চোর, পরের দানে ডাকাত খোঁজেন।</p></div></header>
  <section class="lamp-panel"><h2>চারজন</h2>${s.names.map((n, i) => `<label class="lamp-field"><span class="side-dot" style="background:${playerColour('', i)}"></span><input data-name="${i}" maxlength="20" autocomplete="off" placeholder="খেলোয়াড় ${bn(i + 1)}" value="${esc(n)}"></label>`).join('')}${chips()}</section>
  <section class="lamp-panel">${numberPick({ name: 'rounds', label: 'কত দান', value: s.rounds, presets: ROUND_CHOICES, min: 1, max: 100, unit: 'দান' })}</section>
  <div class="chit-legend">${Object.keys(ROLES).map(r => roleChit(r)).join('')}</div>
  ${button('কাগজ ভাঁজ করুন', 'start', 'primary wide', 'play')}`;
}
function roundTag() { return `<span class="eyebrow">দান ${bn(s.round + 1)} / ${bn(s.rounds)}</span>`; }
function draw() {
  const p = order(s.drawer);
  return `<section class="lamp-stage">${roundTag()}<h1>${playerDot(s.names[p], p)} ${pname(p)}, একটা কাগজ তুলুন</h1><p class="lede">অন্যরা চোখ সরান।</p>
  <div class="chit-table">${s.chits.map((_, k) => s.owner[k] >= 0 ? `<span class="chit taken">${playerDot(s.names[s.owner[k]], s.owner[k])}</span>` : chit('<span class="fold"></span>', 'folded', `data-action="pick" data-id="${k}" aria-label="ভাঁজ করা কাগজ"`)).join('')}</div></section>`;
}
function peek() {
  const p = order(s.drawer), role = roleOf(p);
  return `<section class="lamp-stage">${roundTag()}<h1>${pname(p)}, চুপ!</h1><div class="chit-reveal">${roleChit(role)}</div>
  <p class="lede">${role === 'babu' ? 'আপনি বাবু। পরে নিজেই বলবেন।' : role === 'police' ? 'আপনি পুলিশ। চোর ধরতে হবে।' : 'কাউকে বুঝতে দেবেন না।'}</p>
  ${button(s.drawer < 3 ? 'ভাঁজ করে পরের জনকে দিন' : 'ভাঁজ করে রাখুন', 'fold', 'primary wide', 'arrow')}</section>`;
}
function guess() {
  const babu = who('babu'), police = who('police'), rest = [0, 1, 2, 3].filter(i => i !== babu && i !== police);
  return `<section class="lamp-stage">${roundTag()}
  <div class="call-row"><span>${playerDot(s.names[babu], babu)}<b>${pname(babu)}</b>: “আমি বাবু!”</span>${roleChit('babu')}</div>
  <div class="call-row"><span>${playerDot(s.names[police], police)}<b>${pname(police)}</b>: “আমি পুলিশ!”</span>${roleChit('police')}</div>
  <h1>${pname(police)}, ${ROLES[targetOf(s.round)].name} কে?</h1>
  <div class="suspects">${rest.map(i => `<button type="button" class="suspect" data-action="accuse" data-id="${i}" style="--dot:${playerColour(s.names[i], i)}">${playerDot(s.names[i], i)}<b>${pname(i)}</b></button>`).join('')}</div></section>`;
}
function totalsTable() {
  return rankTable(s.names.map((n, i) => ({ name: n, score: s.totals[i], note: s.gained.length ? `এই দানে ${bn(s.gained[i])}` : '', history: s.history[i] })), labels);
}
function reveal() {
  const police = who('police'), t = targetOf(s.round), tn = ROLES[t].name, caught = s.chits[s.owner.indexOf(s.guess)] === t, last = s.round + 1 >= s.rounds;
  return `<section class="lamp-stage">${roundTag()}<h1>${caught ? `${tn} ধরা পড়েছে!` : `ভুল ধরেছে! ${tn} পালিয়েছে।`}</h1>
  <p class="lede">${caught ? `${pname(police)} ঠিক ধরেছেন। ${pname(who(t))} পেলেন ০।` : `${pname(police)} পেলেন ০, ${pname(who(t))} রাখলেন ${bn(ROLES[t].points)}।`}</p>
  <div class="chit-table open-all">${[0, 1, 2, 3].map(i => `<div class="chit-owner">${roleChit(roleOf(i), `<em>+${bn(s.gained[i])}</em>`)}<span>${pname(i)}</span></div>`).join('')}</div></section>
  <section class="rank-section"><h2>${last ? 'শেষ ফল' : 'মোট'}</h2>${totalsTable()}</section>
  <div class="lamp-actions">${last ? button('আবার খেলি', 'again', 'primary wide', 'play') + button('চোর ডাকাতের শুরুর পাতা', 'game-home', 'secondary wide', 'home') : button('পরের দান', 'next', 'primary wide', 'arrow')}</div>`;
}
function rules() {
  return `${pageHead('নিয়ম', 'চোর ডাকাত পুলিশ বাবু', '')}<ol class="plain-rules">
  <li>চারজন খেলবেন। প্রতি দানে চারটা ভাঁজ করা কাগজ: বাবু, পুলিশ, ডাকাত, চোর।</li>
  <li>একে একে ফোন হাতে নিয়ে একটা কাগজ তুলুন, একা দেখুন, ভাঁজ করে পরের জনকে দিন।</li>
  <li>বাবু আর পুলিশ নিজেদের পরিচয় দেন। পুলিশ পালা করে খোঁজেন: এক দানে চোর, পরের দানে ডাকাত।</li>
  <li>বাবু ১০০০, পুলিশ ৮০০, ডাকাত ৫০০, চোর ৪০০। যাকে খোঁজা হচ্ছে সে ধরা পড়লে শুধু সে পায় ০, পুলিশ রাখেন ৮০০। ভুল ধরলে পুলিশ পায় ০, বাকিরা নিজের পয়েন্ট রাখে।</li>
  <li>সব দান শেষে যার মোট বেশি সে জিতল। র‍্যাঙ্কিংয়ে মোটের একশো ভাগের এক ভাগ যোগ হয়।</li></ol>`;
}
const labels = { caption: 'ফলাফল', rank: '#', player: 'খেলোয়াড় · শেষ পাঁচ দান', points: 'পয়েন্ট', win: 'সবুজ: ভালো দান', loss: 'লাল: খারাপ দান', order: 'নতুনটি বাঁ দিকে', empty: 'এখনও কেউ খেলেননি।', noGames: 'এখনও খেলেননি', number: bn };
function ranking() {
  const list = readHistory(), all = overallRanking(list, 'chor').map(r => ({ name: r.name, score: r.points, note: bn(r.matches) + 'টি খেলা', history: r.recent.map(h => ({ won: h.won, img: h.img || ART, label: h.label || '' })) }));
  return `${pageHead('র‍্যাঙ্কিং', 'চোর ডাকাত পুলিশ বাবু', 'প্রতিটা খেলার মোট ÷ ১০০।')}${s.phase !== 'setup' ? `<section class="rank-section"><h2>এই খেলা</h2>${totalsTable()}</section>` : ''}<section class="rank-section"><h2>সব খেলা মিলিয়ে</h2>${rankTable(all, labels)}</section>
  <section class="fame-section"><h2>${icon('trophy')}হল অব ফেম</h2>${fameTable(hallOfFame(list, 'chor'), { caption: 'হল অব ফেম', player: 'খেলোয়াড়', points: 'পয়েন্ট', empty: 'এখনও কেউ নেই।', number: bn, meta: e => new Date(e.date).toLocaleDateString('bn-BD') })}</section>
  <a class="btn secondary wide" href="ranking.html?game=chor">${icon('trophy')}সব খেলার র‍্যাঙ্কিং ও অ্যাকাউন্ট</a>`;
}

/* ---------- Shell ---------- */

function render() {
  const key = view + s.phase + s.round + s.drawer, changed = key !== lastScreen; lastScreen = key;
  const body = view === 'rules' ? rules() : view === 'ranking' ? ranking() : ({ draw, peek, guess, reveal }[s.phase] || setup)();
  $('#app').innerHTML = appShell({ brand: 'চোর ডাকাত পুলিশ বাবু', brandSub: 'কাগজ ভাঁজের খেলা', brandIcon: 'people', brandAction: 'tab-play', crumb: view === 'rules' ? 'নিয়ম' : view === 'ranking' ? 'র‍্যাঙ্কিং' : s.phase === 'setup' ? 'খেলা সাজান' : `দান ${bn(s.round + 1)}`, active: view, contentClass: 'game-content lamp-content', labels: SHELL_LABELS, backHref: BACK, tabs: TABS, body });
  $$('[data-action]').forEach(el => el.onclick = e => { e.preventDefault(); act(el.dataset.action, el.dataset.id); });
  bindNumberPick(document, 'rounds', 1, 100, n => { s.rounds = n; save(); render(); });
  $$('[data-name]').forEach(el => el.oninput = () => { s.names[Number(el.dataset.name)] = el.value; save(); });
  if (changed) enterScreen($('#screen'));
}
const transition = () => leaveScreen($('#screen'), () => { render(); scrollTo({ top: 0, behavior: 'instant' }); });

function newRound() { s.chits = deal(); s.owner = [-1, -1, -1, -1]; s.drawer = 0; s.start = s.round % 4; s.guess = -1; s.gained = []; s.phase = 'draw'; }
function endGame() {
  saveMatch({ id: crypto.randomUUID(), game: 'chor', games: s.rounds, players: s.names.map((n, i) => ({ name: n, points: Math.round(s.totals[i] / 100), recent: s.history[i] })) });
}

async function act(action, id) {
  switch (action) {
    case 'tab-play': case 'tab-rules': case 'tab-ranking': { const next = action.slice(4); if (view === next) return; view = next; return transition(); }
    case 'app-menu': return openMenu(s.phase !== 'setup' ? [['খেলা থামিয়ে নতুন করে সাজান', 'edit', 'quit', 'tone-danger']] : [], act);
    case 'fill': { const i = s.names.findIndex(n => !n.trim()); if (i >= 0) s.names[i] = id; save(); return render(); }
    case 'rounds': s.rounds = ROUND_CHOICES.includes(Number(id)) ? Number(id) : 5; save(); return render();
    case 'start': {
      const names = s.names.map(n => n.trim().replace(/\s+/g, ' '));
      if (names.some(n => !n)) return toast('চারজনের নামই লাগবে।');
      if (new Set(names.map(n => n.toLocaleLowerCase())).size < 4) return toast('নামগুলো আলাদা হতে হবে।');
      s.names = names.map(n => { try { return ensureAccount(n).name; } catch { return n; } });
      Object.assign(s, { round: 0, totals: [0, 0, 0, 0], history: [[], [], [], []] }); newRound(); view = 'play'; save(); sound('notice'); return transition();
    }
    case 'pick': { const k = Number(id); if (s.phase !== 'draw' || s.owner[k] >= 0) return; s.owner[k] = order(s.drawer); s.phase = 'peek'; save(); sound('vote'); return transition(); }
    case 'fold': if (s.phase !== 'peek') return; if (s.drawer < 3) { s.drawer++; s.phase = 'draw'; } else s.phase = 'guess'; save(); return transition();
    case 'accuse': {
      const g = Number(id); if (s.phase !== 'guess') return;
      const roles = [0, 1, 2, 3].map(roleOf); s.guess = g; s.gained = score(roles, g, targetOf(s.round));
      s.totals = s.totals.map((t, i) => t + s.gained[i]);
      s.history = s.history.map((h, i) => [{ won: s.gained[i] >= 800, img: ART, label: `${ROLES[roles[i]].name} · ${bn(s.gained[i])}` }, ...h].slice(0, 5));
      s.phase = 'reveal'; if (s.round + 1 >= s.rounds) endGame(); save(); sound(roles[g] === targetOf(s.round) ? 'win' : 'wrong'); return transition();
    }
    case 'next': s.round++; newRound(); save(); return transition();
    case 'again': Object.assign(s, { round: 0, totals: [0, 0, 0, 0], history: [[], [], [], []] }); newRound(); save(); return transition();
    case 'quit': if (await confirmBox('খেলা থামাবেন?', 'এই খেলার পয়েন্ট র‍্যাঙ্কিংয়ে যাবে না।', 'হ্যাঁ, থামান')) { s.phase = 'setup'; save(); transition(); } return;
    case 'game-home': view = 'play'; if (s.phase === 'reveal' && s.round + 1 >= s.rounds) s.phase = 'setup'; save(); return transition();
  }
}

render();
if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('./sw.js').catch(() => { });

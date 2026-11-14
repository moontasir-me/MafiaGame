import { readHistory, overallRanking, hallOfFame, clearHistory, GAMES } from './history.mjs';
import { readAccounts, ensureAccount, deleteAccount } from './accounts.mjs';
import { esc, icon, appShell, pageHead, rankTable, fameTable, playerDot, enterScreen } from './ui-kit.mjs';

const $ = q => document.querySelector(q);
const bn = n => Number(n).toLocaleString('bn-BD');
const date = d => new Date(d).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
const ART = { mafia: 'assets/bn/mafia.png', spy: 'assets/spy/detective.svg', kalidas: 'assets/kalidas/kalidas.svg', pen: 'assets/pen/pinpoint.svg', fib: 'assets/fib/spiral.svg', shotoronji: 'assets/shotoronji/cover.svg', chor: 'assets/chor/cover.svg', ludo: 'assets/ludo/cover.svg', carrom: 'assets/carrom/cover.svg', dots: 'assets/dots/cover.svg' };
let filter = new URLSearchParams(location.search).get('game');
if (!GAMES[filter]) filter = null;

function overall(list) {
  const rows = overallRanking(list, filter).map(r => ({ name: r.name, score: r.points, note: `${bn(r.matches)}টি ম্যাচ · ${bn(r.wins)}টিতে প্রথম`, history: r.recent.map(h => ({ won: h.won, img: h.img || ART[h.game], label: h.label || `${GAMES[h.game]} · ${h.won ? 'প্রথম' : 'প্রথম নয়'}` })) }));
  return rankTable(rows, { caption: 'সামগ্রিক র‍্যাঙ্কিং', rank: '#', player: 'খেলোয়াড় · শেষ পাঁচ খেলা', points: 'মোট পয়েন্ট', win: 'সবুজ: জয়', loss: 'লাল: হার', order: 'নতুনটি বাঁ দিকে', empty: 'এখনও কোনো ম্যাচ শেষ হয়নি। খেলা শেষ হলে এখানে দেখা যাবে।', noGames: '', number: bn });
}

function matches(list) {
  const shown = list.filter(m => !filter || m.game === filter);
  if (!shown.length) return '';
  return `<section class="fame-section"><h2>${icon('book')}সব ম্যাচ</h2><p>তারিখ অনুযায়ী, নতুনটি আগে।</p><div class="match-list">${shown.slice(0, 60).map(m => { const sorted = [...m.players].sort((a, b) => b.points - a.points); return `<details class="match-card"><summary><img src="${ART[m.game]}" alt="" width="40" height="40"><span><b>${GAMES[m.game]}</b><small>${date(m.date)} · ${bn(m.games)}টি খেলা</small></span><span class="match-winner">${playerDot(sorted[0].name)}${esc(sorted[0].name)} · ${bn(sorted[0].points)}</span></summary><ol>${sorted.map(p => `<li>${playerDot(p.name)}<span>${esc(p.name)}</span><strong>${bn(p.points)}</strong></li>`).join('')}</ol></details>`; }).join('')}</div></section>`;
}

/* Accounts on this phone: name only. Ranking rows with the same name belong to the account. */
function accounts(list) {
  const accs = readAccounts(), totals = new Map(overallRanking(list).map(r => [r.name.toLocaleLowerCase(), r]));
  return `<section class="fame-section acc-section" id="accounts"><h2>${icon('people')}অ্যাকাউন্ট</h2><p>শুধু নাম দিলেই অ্যাকাউন্ট। এক ফোনে অনেকগুলো রাখা যায়; প্রতিটা খেলায় এই নাম বেছে নিলে পয়েন্ট এখানেই জমে। কয়েন জেতা যায় পেন ফাইটের লড়াইয়ে।</p>
  <form id="acc-form" class="acc-form"><input id="acc-name" maxlength="20" autocomplete="off" placeholder="নতুন অ্যাকাউন্টের নাম" aria-label="নতুন অ্যাকাউন্টের নাম"><button class="btn primary" type="submit">${icon('plus')}খুলুন</button></form>
  ${accs.length ? `<ul class="acc-list">${accs.map(a => { const t = totals.get(a.name.toLocaleLowerCase()); return `<li>${playerDot(a.name)}<span><b>${esc(a.name)}</b><small>${bn(t?.points || 0)} পয়েন্ট · ${bn(t?.matches || 0)}টি ম্যাচ · ${bn(a.coins)} কয়েন</small></span><a class="icon-btn" href="pen.html?view=shop" aria-label="${esc(a.name)}-এর কলমের দোকান">${icon('spark')}</a><button type="button" class="icon-btn" data-delete="${a.id}" aria-label="${esc(a.name)} অ্যাকাউন্ট মুছুন">${icon('trash')}</button></li>`; }).join('')}</ul>` : '<p class="acc-empty">এখনও কোনো অ্যাকাউন্ট নেই।</p>'}</section>`;
}

function body() {
  const list = readHistory(), title = filter ? GAMES[filter] : 'সব খেলা';
  return `${pageHead('র‍্যাঙ্কিং', title, 'প্রতিটি ম্যাচ (খেলার সেট) শেষ হলে পয়েন্ট এখানে জমা হয়।')}
  ${filter ? '' : accounts(list)}
  ${overall(list)}
  <section class="fame-section"><h2>${icon('trophy')}হল অব ফেম</h2><p>শেষ ১০০টি ম্যাচে এক ম্যাচে সবচেয়ে বেশি পয়েন্ট।</p>${fameTable(hallOfFame(list, filter), { caption: 'হল অব ফেম', player: 'খেলোয়াড়', points: 'পয়েন্ট', empty: 'এখনও কেউ হল অব ফেমে ওঠেননি।', number: bn, meta: e => `${GAMES[e.game]} · ${date(e.date)}` })}</section>
  ${matches(list)}
  ${list.some(m => !filter || m.game === filter) ? `<button class="btn text wide" type="button" id="clear">${icon('trash')}${filter ? GAMES[filter] + '-এর' : 'সব'} ইতিহাস মুছুন</button>` : ''}`;
}

function render(animate = true) {
  const tabs = [['all', 'সব', 'grid'], ['mafia', 'Mafia', 'mask'], ['spy', 'Spy', 'lens'], ['kalidas', 'ধাঁধা', 'spark'], ['pen', 'পেন ফাইট', 'edit'], ['fib', 'অঙ্ক', 'grid'], ['shotoronji', 'চতুরঙ্গ', 'grid'], ['chor', 'চোর', 'people'], ['ludo', 'লুডু', 'grid'], ['carrom', 'ক্যারম', 'grid'], ['dots', 'জায়গা দখল', 'grid']].map(([id, label, ic]) => ({ id, label, icon: ic, action: id }));
  $('#app').innerHTML = appShell({ brand: 'শীতলপাটি', brandSub: 'র‍্যাঙ্কিং', brandIcon: 'trophy', brandAction: 'all', homeAction: 'all', crumb: 'র‍্যাঙ্কিং · ' + (filter ? GAMES[filter] : 'সব খেলা'), active: filter || 'all', tabs, body: body(), contentClass: 'game-content', labels: { back: 'সব খেলা', menu: 'মেনু', sections: 'খেলা বেছে নিন' } });
  document.querySelectorAll('[data-action]').forEach(el => el.onclick = e => {
    e.preventDefault(); const a = el.dataset.action;
    if (a === 'app-menu') return (location.href = 'index.html');
    filter = a === 'all' ? null : a; history.replaceState(null, '', filter ? '?game=' + filter : location.pathname); render();
  });
  $('#acc-form')?.addEventListener('submit', e => {
    e.preventDefault(); const v = $('#acc-name').value;
    try { ensureAccount(v); render(false); $('#acc-name').focus(); } catch (err) { alert(err.message === 'FULL' ? 'এই ফোনে আর অ্যাকাউন্ট খোলা যাবে না।' : 'একটা নাম দিন।'); }
  });
  document.querySelectorAll('[data-delete]').forEach(el => el.onclick = () => {
    const a = readAccounts().find(x => x.id === el.dataset.delete);
    if (a && confirm(`${a.name} অ্যাকাউন্ট মুছবেন? কয়েন, কেনা জিনিস আর র‍্যাঙ্কিংয়ের সব পয়েন্ট মুছে যাবে।`)) { deleteAccount(a.id); render(false); }
  });
  $('#clear')?.addEventListener('click', () => { if (confirm('ইতিহাস মুছবেন? এটা ফেরত আনা যাবে না।')) { clearHistory(filter); render(); } });
  if (animate) enterScreen($('#screen'));
  if (animate && location.hash === '#accounts') $('#accounts')?.scrollIntoView();
}
render();

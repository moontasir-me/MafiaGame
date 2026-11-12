import { readHistory, overallRanking, hallOfFame, clearHistory, GAMES } from './history.mjs';
import { esc, icon, appShell, pageHead, rankTable, fameTable, playerDot, enterScreen } from './ui-kit.mjs';

const $ = q => document.querySelector(q);
const bn = n => Number(n).toLocaleString('bn-BD');
const date = d => new Date(d).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
const ART = { mafia: 'assets/bn/mafia.png', spy: 'assets/spy/detective.svg', kalidas: 'assets/kalidas/misir.svg', pen: 'assets/pen/pinpoint.svg' };
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

function body() {
  const list = readHistory(), title = filter ? GAMES[filter] : 'সব খেলা';
  return `${pageHead('র‍্যাঙ্কিং', title, 'প্রতিটি ম্যাচ (খেলার সেট) শেষ হলে পয়েন্ট এখানে জমা হয়।')}
  ${overall(list)}
  <section class="fame-section"><h2>${icon('trophy')}হল অব ফেম</h2><p>শেষ ১০০টি ম্যাচে এক ম্যাচে সবচেয়ে বেশি পয়েন্ট।</p>${fameTable(hallOfFame(list, filter), { caption: 'হল অব ফেম', player: 'খেলোয়াড়', points: 'পয়েন্ট', empty: 'এখনও কেউ হল অব ফেমে ওঠেননি।', number: bn, meta: e => `${GAMES[e.game]} · ${date(e.date)}` })}</section>
  ${matches(list)}
  ${list.some(m => !filter || m.game === filter) ? `<button class="btn text wide" type="button" id="clear">${icon('trash')}${filter ? GAMES[filter] + '-এর' : 'সব'} ইতিহাস মুছুন</button>` : ''}`;
}

function render(animate = true) {
  const tabs = [['all', 'সব', 'grid'], ['mafia', 'Mafia', 'mask'], ['spy', 'Spy', 'lens'], ['kalidas', 'ধাঁধা', 'spark'], ['pen', 'কলম', 'edit']].map(([id, label, ic]) => ({ id, label, icon: ic, action: id }));
  $('#app').innerHTML = appShell({ brand: 'জম্ফা', brandSub: 'র‍্যাঙ্কিং', brandIcon: 'trophy', brandAction: 'all', crumb: 'র‍্যাঙ্কিং · ' + (filter ? GAMES[filter] : 'সব খেলা'), active: filter || 'all', tabs, body: body(), contentClass: 'game-content', labels: { back: 'সব খেলা', menu: 'মেনু', sections: 'খেলা বেছে নিন' } });
  document.querySelectorAll('[data-action]').forEach(el => el.onclick = e => {
    e.preventDefault(); const a = el.dataset.action;
    if (a === 'app-menu') return (location.href = 'index.html');
    filter = a === 'all' ? null : a; history.replaceState(null, '', filter ? '?game=' + filter : location.pathname); render();
  });
  $('#clear')?.addEventListener('click', () => { if (confirm('ইতিহাস মুছবেন? এটা ফেরত আনা যাবে না।')) { clearHistory(filter); render(); } });
  if (animate) enterScreen($('#screen'));
}
render();

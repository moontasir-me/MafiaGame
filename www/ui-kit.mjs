// Shared pieces for Mafia and Spy, so both games look and behave the same way.
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const paths = { mask: 'M3 7c6 3 12 3 18 0l-2 9c-3 4-5 3-7 1-2 2-4 3-7-1L3 7Zm3 4 4 1-2 2Zm12 0-4 1 2 2Z', arrow: 'M5 12h14m-5-5 5 5-5 5', plus: 'M12 5v14M5 12h14', person: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2', people: 'M16 21v-2a6 6 0 0 0-12 0v2M14 3a4 4 0 0 1 0 8m6 10v-2a6 6 0 0 0-3-5M14 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z', shield: 'm12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Zm-3 9 2 2 4-4', heart: 'M12 20 3 11C-2 3 8-1 12 6c4-7 14-3 9 5l-9 9Z', lock: 'M6 10h12v11H6V10Zm3 0V6a3 3 0 0 1 6 0v4m-3 4v3', moon: 'M20 15A9 9 0 0 1 9 4 9 9 0 1 0 20 15Z', home: 'm3 11 9-8 9 8M5 9v12h14V9M9 21v-7h6v7', book: 'M4 3h7l1 2 1-2h7v17h-7l-1 1-1-1H4V3Zm8 2v16', check: 'm5 12 4 4L19 6', close: 'm6 6 12 12M6 18 18 6', edit: 'm4 16 12-12 4 4L8 20H4v-4Zm10-10 4 4', trash: 'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7', eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z', back: 'M19 12H5m5-5-5 5 5 5', spark: 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z', trophy: 'M8 3h8v8a4 4 0 0 1-8 0V3Zm0 2H3v3a5 5 0 0 0 5 5m8-8h5v3a5 5 0 0 1-5 5m-4 0v7m-5 1h10', play: 'm9 5 11 7-11 7V5', pause: 'M8 5v14m8-14v14', logout: 'M10 4H4v16h6m4-13 5 5-5 5m-5-5h14', wifi: 'M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0m-9 4a5 5 0 0 1 6 0m-3 4h.01M3 3l18 18', lens: 'M15.5 15.5 21 21M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z', grid: 'M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z', sound: 'M4 9h4l5-4v14l-5-4H4V9Zm13 0a4 4 0 0 1 0 6m2-9a8 8 0 0 1 0 12', spiral: 'M12 12a1.5 1.5 0 0 1 1.5 1.5A3 3 0 0 1 10.5 16.5 4.5 4.5 0 0 1 6 12a6 6 0 0 1 6-6 7.5 7.5 0 0 1 7.5 7.5A9 9 0 0 1 10.5 22.5', knight: 'M7 21h11M8 21c0-4 2-6 4-8l-3-1-2 1-2-2 4-5 1-3 1 2c4 0 7 3 7 9v7', dice: 'M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3.5 4.5h.01M15.5 4.5h.01M12 12h.01M8.5 16.5h.01M15.5 16.5h.01M8.5 7.5h.01', tinguti: 'M5 5h14v14H5ZM5 5l14 14M19 5 5 19M12 5v14M5 12h14', boxes: 'M5 5h.01M12 5h.01M19 5h.01M5 12h.01M12 12h.01M19 12h.01M5 19h.01M12 19h.01M19 19h.01M5 5h7v7H5ZM12 12h7v7h-7Z', carrom: 'M3 3h18v18H3V3Zm1.5 1.5h2v2h-2Zm13 0h2v2h-2Zm-13 13h2v2h-2Zm13 0h2v2h-2ZM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm-5 3.5h10' };
export const icon = (n, cls = '') => `<svg class="icon ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.65" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[n] || paths.spark}"/></svg>`;
export const menuIcon = () => '<svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';

const reduceMotion = () => typeof matchMedia === 'function' && matchMedia('(prefers-reduced-motion: reduce)').matches;

/* Plays the entrance animation on freshly rendered content. */
export function enterScreen(el) {
  if (!el || reduceMotion()) return;
  el.classList.remove('screen-in'); void el.offsetWidth; el.classList.add('screen-in');
  el.addEventListener('animationend', () => el.classList.remove('screen-in'), { once: true });
}

/* Slides the current screen away, then runs the change. Keeps taps feeling deliberate. */
export function leaveScreen(el, then, ms = 170) {
  if (!el || reduceMotion()) return then();
  el.classList.add('screen-out');
  setTimeout(then, ms);
}

/* A private card: the face shows nothing until its owner taps it. */
export function tapCard({ open = false, front, back, openLabel, closeLabel, tone = '' }) {
  return `<div class="tap-card-stage"><button type="button" class="tap-card ${tone} ${open ? 'is-open' : ''}" data-tap-card aria-pressed="${open}" aria-label="${esc(open ? closeLabel : openLabel)}" data-open-label="${esc(openLabel)}" data-close-label="${esc(closeLabel)}"><span class="tap-card-inner"><span class="tap-face tap-front" aria-hidden="${open}">${front}</span><span class="tap-face tap-back" aria-hidden="${!open}">${open ? back : ''}</span></span></button></div>`;
}

/* Flips in place, without re-rendering the page, so the turn animation runs smoothly.
   The back face is only filled in while the card is open. */
export function bindTapCard(root, { back, onChange }) {
  const card = root.querySelector('[data-tap-card]');
  if (!card) return;
  card.onclick = () => setTapCard(card, !card.classList.contains('is-open'), back, onChange);
}
export function setTapCard(card, open, back, onChange) {
  if (!card) return;
  const backFace = card.querySelector('.tap-back');
  if (open) backFace.innerHTML = back();
  card.classList.toggle('is-open', open);
  card.setAttribute('aria-pressed', String(open));
  card.setAttribute('aria-label', open ? card.dataset.closeLabel : card.dataset.openLabel);
  card.querySelector('.tap-front').setAttribute('aria-hidden', String(open));
  backFace.setAttribute('aria-hidden', String(!open));
  if (!open) setTimeout(() => { if (!card.classList.contains('is-open')) backFace.innerHTML = ''; }, reduceMotion() ? 0 : 420);
  onChange?.(open);
}

/* Competition ranking: equal scores share a place (1, 2, 2, 4). */
export function rankRows(rows) {
  const sorted = [...rows].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
  return sorted.map((row, i) => ({ ...row, rank: i && row.score === sorted[i - 1].score ? null : i + 1 }))
    .map((row, i, all) => ({ ...row, rank: row.rank ?? all.slice(0, i).reverse().find(r => r.rank)?.rank ?? 1 }));
}

/* rows: [{name, score, note?, history:[{won, quit, img, label}]}], newest game first. */
export function rankTable(rows, t) {
  if (!rows.length) return `<div class="rank-empty">${icon('trophy')}<p>${esc(t.empty)}</p></div>`;
  const ranked = rankRows(rows), fmt = t.number || (n => String(n));
  return `<div class="rank-table-wrap"><table class="rank-table"><caption class="sr-only">${esc(t.caption)}</caption><thead><tr><th scope="col">${esc(t.rank)}</th><th scope="col">${esc(t.player)}</th><th scope="col" class="num">${esc(t.points)}</th></tr></thead><tbody>${ranked.map((row, i) => `<tr class="${row.rank === 1 ? 'leader' : ''}" style="--row:${i}"><td class="rank-cell"><span class="rank-no">${row.rank === 1 ? icon('trophy') : fmt(row.rank)}</span></td><th scope="row"><span class="rank-name">${playerDot(row.name)}${esc(row.name)}</span>${row.note ? `<small class="rank-note">${esc(row.note)}</small>` : ''}<span class="result-strip">${row.history.length ? row.history.map(h => `<span class="result-avatar ${h.won ? 'win' : 'loss'}" title="${esc(h.label)}"><img src="${esc(h.img)}" alt="" width="34" height="34" loading="lazy"><span class="sr-only">${esc(h.label)}</span></span>`).join('') : `<small class="rank-note">${esc(t.noGames)}</small>`}</span></th><td class="num"><strong>${fmt(row.score)}</strong></td></tr>`).join('')}</tbody></table></div>${ranked.some(r => r.history.length) ? `<p class="rank-legend"><span><i class="result-avatar win"></i>${esc(t.win)}</span><span><i class="result-avatar loss"></i>${esc(t.loss)}</span><span>${esc(t.order)}</span></p>` : ''}`;
}

/* One page frame for both games.
   Top bar: back to the game chooser · game title + where you are · Menu.
   Sections (Play / Rules / Rankings): bottom tabs on phones, sidebar on wide screens. */
export function appShell({ brand, brandSub, brandIcon, brandAction, homeAction = 'game-home', backHref = 'index.html', crumb, tabs, active, hideTabs = false, body, contentClass = '', labels, credit = 'Developed by Tanim' }) {
  const item = (t, cls) => `<button type="button" class="${cls}${t.id === active ? ' is-active' : ''}" data-action="${t.action}"${t.id === active ? ' aria-current="page"' : ''}>${icon(t.icon)}<span>${t.label}</span></button>`;
  return `<div class="kit-shell${hideTabs ? ' no-tabs' : ''}">
<aside class="kit-side"><a class="kit-brand" href="#" data-action="${brandAction}"><span class="kit-brand-icon">${icon(brandIcon)}</span><span>${brand}${brandSub && brandSub !== brand ? `<small>${brandSub}</small>` : ''}</span></a>${hideTabs ? '' : `<nav class="kit-side-nav" aria-label="${esc(labels.sections)}">${tabs.map(t => item(t, 'kit-side-item')).join('')}</nav>`}</aside>
<main class="kit-main"><header class="kit-top"><a class="kit-pill kit-back" href="${backHref}">${icon('back')}<span>${labels.back}</span></a><button type="button" class="kit-title" data-action="${homeAction}" aria-label="${esc(brand)}: এই খেলার শুরুর পাতা"><strong>${brand}</strong>${crumb && crumb !== brand ? `<small>${crumb}</small>` : ''}</button><button type="button" class="kit-pill kit-menu" data-action="app-menu" aria-haspopup="dialog">${menuIcon()}<span>${labels.menu}</span></button></header>
<div class="content ${contentClass}" id="screen">${body}</div><footer class="app-credit">${credit}</footer></main>
${hideTabs ? '' : `<nav class="kit-tabs" aria-label="${esc(labels.sections)}">${tabs.map(t => item(t, 'kit-tab')).join('')}</nav>`}</div>`;
}

/* The page title block every screen starts with, always left-aligned. */
export const pageHead = (kicker, title, text = '') => `<header class="page-head">${kicker ? `<span class="eyebrow">${kicker}</span>` : ''}<h1>${title}</h1>${text ? `<p class="lede">${text}</p>` : ''}</header>`;

/* A quotation, or a game note, in one consistent block. */
export function quoteCard(q, { label = '', source = 'Source' } = {}) {
  if (!q) return '';
  const who = q.poet ? `<b>${esc(q.poet)}</b>${q.work ? ` · <cite>${esc(q.work)}</cite>` : ''}` : `<b>${esc(q.credit || '')}</b>`;
  return `<figure class="quote-card${q.kind === 'note' ? ' is-note' : ''}">${label ? `<span class="quote-label">${label}</span>` : ''}<blockquote>${String(q.text).split('\n').map(esc).join('<br>')}</blockquote><figcaption>${who}${q.url ? ` <a href="${esc(q.url)}" target="_blank" rel="noopener">${esc(source)} ↗</a>` : ''}${q.note ? `<small>${esc(q.note)}</small>` : ''}</figcaption></figure>`;
}

/* A stable colour for each player, so the same name keeps the same circle everywhere. */
const PLAYER_COLOURS = ['#c0392b', '#2471a3', '#1e8449', '#b9770e', '#7d3c98', '#117a65', '#a04000', '#2e4053', '#c2185b', '#5d6d7e', '#6c3483', '#196f3d'];
export function playerColour(name = '', index = null) {
  if (Number.isInteger(index)) return PLAYER_COLOURS[index % PLAYER_COLOURS.length];
  let h = 7; for (const c of String(name)) h = (h * 31 + c.codePointAt(0)) >>> 0;
  return PLAYER_COLOURS[h % PLAYER_COLOURS.length];
}
export const playerDot = (name, index = null) => `<span class="player-dot" style="--dot:${playerColour(name, index)}" aria-hidden="true">${esc(String(name).charAt(0))}</span>`;

/* Hall of fame: best single-match scores. entries from history.hallOfFame(). */
export function fameTable(entries, t) {
  if (!entries.length) return `<div class="rank-empty">${icon('trophy')}<p>${esc(t.empty)}</p></div>`;
  const fmt = t.number || (n => String(n));
  return `<div class="rank-table-wrap fame"><table class="rank-table"><caption class="sr-only">${esc(t.caption)}</caption><thead><tr><th scope="col">#</th><th scope="col">${esc(t.player)}</th><th scope="col" class="num">${esc(t.points)}</th></tr></thead><tbody>${entries.map((e, i) => `<tr class="${i === 0 ? 'leader' : ''}" style="--row:${i}"><td class="rank-cell"><span class="rank-no">${i === 0 ? icon('trophy') : fmt(i + 1)}</span></td><th scope="row">${playerDot(e.name)}<span class="rank-name inline">${esc(e.name)}</span><small class="rank-note">${esc(t.meta(e))}</small></th><td class="num"><strong>${fmt(e.points)}</strong></td></tr>`).join('')}</tbody></table></div>`;
}

/* A number setting: a few quick choices plus a box to type any number in range. */
const bnNum = n => Number(n).toLocaleString('bn-BD');
export function numberPick({ name, label, value, presets, min, max, unit = '' }) {
  const own = !presets.includes(value);
  return `<div class="num-pick" data-num="${name}"><span class="num-label">${label}</span><div class="num-row">${presets.map(n => `<button type="button" data-num-set="${n}" class="${n === value ? 'is-on' : ''}" aria-pressed="${n === value}">${bnNum(n)}</button>`).join('')}<label class="num-own ${own ? 'is-on' : ''}"><input type="number" inputmode="numeric" min="${min}" max="${max}" step="1" value="${own ? value : ''}" placeholder="অন্য" aria-label="${esc(label)}: নিজে লিখুন (${bnNum(min)}–${bnNum(max)})">${unit ? `<small>${unit}</small>` : ''}</label></div><small class="num-hint">${bnNum(min)} থেকে ${bnNum(max)}${unit ? ' ' + unit : ''}</small></div>`;
}
/* onSet(n) gets a whole number already clamped to min..max. */
export function bindNumberPick(root, name, min, max, onSet) {
  const box = root.querySelector(`[data-num="${name}"]`); if (!box) return;
  box.querySelectorAll('[data-num-set]').forEach(b => b.onclick = e => { e.preventDefault(); onSet(Number(b.dataset.numSet)); });
  const input = box.querySelector('input'), commit = () => { const n = Math.round(Number(input.value)); if (input.value === '' || !Number.isFinite(n)) return; onSet(Math.max(min, Math.min(max, n))); };
  input.onchange = commit; input.onkeydown = e => { if (e.key === 'Enter') { e.preventDefault(); commit(); } };
}

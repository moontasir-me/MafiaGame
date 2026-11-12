// Shared pieces for Mafia and Spy, so both games look and behave the same way.
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const paths = { mask: 'M3 7c6 3 12 3 18 0l-2 9c-3 4-5 3-7 1-2 2-4 3-7-1L3 7Zm3 4 4 1-2 2Zm12 0-4 1 2 2Z', arrow: 'M5 12h14m-5-5 5 5-5 5', plus: 'M12 5v14M5 12h14', person: 'M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2', people: 'M16 21v-2a6 6 0 0 0-12 0v2M14 3a4 4 0 0 1 0 8m6 10v-2a6 6 0 0 0-3-5M14 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z', shield: 'm12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Zm-3 9 2 2 4-4', heart: 'M12 20 3 11C-2 3 8-1 12 6c4-7 14-3 9 5l-9 9Z', lock: 'M6 10h12v11H6V10Zm3 0V6a3 3 0 0 1 6 0v4m-3 4v3', moon: 'M20 15A9 9 0 0 1 9 4 9 9 0 1 0 20 15Z', home: 'm3 11 9-8 9 8M5 9v12h14V9M9 21v-7h6v7', book: 'M4 3h7l1 2 1-2h7v17h-7l-1 1-1-1H4V3Zm8 2v16', check: 'm5 12 4 4L19 6', close: 'm6 6 12 12M6 18 18 6', edit: 'm4 16 12-12 4 4L8 20H4v-4Zm10-10 4 4', trash: 'M4 6h16M9 6V3h6v3M6 6l1 15h10l1-15M10 10v7m4-7v7', eye: 'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Zm13 0a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z', back: 'M19 12H5m5-5-5 5 5 5', spark: 'm12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3 3-7Z', trophy: 'M8 3h8v8a4 4 0 0 1-8 0V3Zm0 2H3v3a5 5 0 0 0 5 5m8-8h5v3a5 5 0 0 1-5 5m-4 0v7m-5 1h10', play: 'm9 5 11 7-11 7V5', pause: 'M8 5v14m8-14v14', logout: 'M10 4H4v16h6m4-13 5 5-5 5m-5-5h14', wifi: 'M3 8a15 15 0 0 1 18 0M6 12a10 10 0 0 1 12 0m-9 4a5 5 0 0 1 6 0m-3 4h.01M3 3l18 18', lens: 'M15.5 15.5 21 21M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z', grid: 'M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z', sound: 'M4 9h4l5-4v14l-5-4H4V9Zm13 0a4 4 0 0 1 0 6m2-9a8 8 0 0 1 0 12' };
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
  return `<div class="rank-table-wrap"><table class="rank-table"><caption class="sr-only">${esc(t.caption)}</caption><thead><tr><th scope="col">${esc(t.rank)}</th><th scope="col">${esc(t.player)}</th><th scope="col" class="num">${esc(t.points)}</th></tr></thead><tbody>${ranked.map((row, i) => `<tr class="${row.rank === 1 ? 'leader' : ''}" style="--row:${i}"><td class="rank-cell"><span class="rank-no">${row.rank === 1 ? icon('trophy') : fmt(row.rank)}</span></td><th scope="row"><span class="rank-name">${esc(row.name)}</span>${row.note ? `<small class="rank-note">${esc(row.note)}</small>` : ''}<span class="result-strip">${row.history.length ? row.history.map(h => `<span class="result-avatar ${h.won ? 'win' : 'loss'}" title="${esc(h.label)}"><img src="${esc(h.img)}" alt="" width="34" height="34" loading="lazy"><span class="sr-only">${esc(h.label)}</span></span>`).join('') : `<small class="rank-note">${esc(t.noGames)}</small>`}</span></th><td class="num"><strong>${fmt(row.score)}</strong></td></tr>`).join('')}</tbody></table></div><p class="rank-legend"><span><i class="result-avatar win"></i>${esc(t.win)}</span><span><i class="result-avatar loss"></i>${esc(t.loss)}</span><span>${esc(t.order)}</span></p>`;
}

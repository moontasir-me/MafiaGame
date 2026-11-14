/* The one online entry used by every শীতলপাটি game: your profile name, "open a room", or type a code in OTP-style boxes. */
import { readProfile, saveProfile } from './profile.mjs';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
/* Inside the Android app the pages come from the phone itself, so online calls go to the live site. */
export const API_BASE = location.hostname === 'appassets.androidplatform.net' ? 'https://mafiagame-tau.vercel.app' : '';
export const onlineName = () => readProfile().name || '';
export const isOnlineMode = () => { try { return localStorage.getItem('shitolpati.online') === '1'; } catch { return false; } };

/* Entry card. len: code length. allowed: regex for one character. */
export function onlineEntry({ len = 5, note = '' } = {}) {
  const name = onlineName();
  return `<section class="ol-card">
  <div class="ol-me">${name ? `<span class="ol-face">${esc(name.charAt(0))}</span><span><small>আপনি খেলবেন এই নামে</small><b>${esc(name)}</b></span><button type="button" class="ol-link" data-ol="rename">বদলান</button>`
    : `<label class="ol-name"><small>প্রথমবার: আপনার নাম দিন, সব অনলাইন খেলায় এটাই থাকবে</small><input id="ol-name" maxlength="20" autocomplete="nickname" placeholder="আপনার নাম"></label>`}</div>
  <button type="button" class="btn primary wide ol-create" data-ol="create">নতুন ঘর খুলুন</button>
  <div class="ol-or"><span>অথবা বন্ধুর কোড দিন</span></div>
  <div class="otp" role="group" aria-label="ঘরের কোড">${Array.from({ length: len }, (_, i) => `<input class="otp-box" inputmode="text" autocomplete="one-time-code" autocapitalize="characters" spellcheck="false" maxlength="1" aria-label="কোডের ${i + 1} নম্বর অক্ষর">`).join('')}</div>
  <button type="button" class="btn secondary wide" data-ol="join" disabled>যোগ দিন</button>
  ${note ? `<p class="ol-note">${note}</p>` : ''}</section>`;
}

/* handlers: onCreate(name), onJoin(name, code). allowed: which characters a code can hold. */
export function bindOnlineEntry(root, { onCreate, onJoin, allowed = /[A-Z0-9]/ }) {
  const boxes = [...root.querySelectorAll('.otp-box')], join = root.querySelector('[data-ol=join]');
  const code = () => boxes.map(b => b.value).join('');
  const name = () => {
    const input = root.querySelector('#ol-name');
    if (!input) return onlineName();
    const n = input.value.trim().replace(/\s+/g, ' ').slice(0, 20); if (!n) { input.focus(); return ''; }
    saveProfile({ ...readProfile(), name: n }); return n;
  };
  const refresh = () => { join.disabled = code().length !== boxes.length; };
  const fill = (from, text) => { const chars = [...text.toUpperCase()].filter(c => allowed.test(c)); let i = from; for (const c of chars) { if (i >= boxes.length) break; boxes[i++].value = c; } boxes[Math.min(i, boxes.length - 1)].focus(); refresh(); if (code().length === boxes.length) join.focus(); };
  boxes.forEach((b, i) => {
    b.oninput = () => { const v = b.value; b.value = ''; fill(i, v); };
    b.onkeydown = e => {
      if (e.key === 'Backspace' && !b.value && i) { boxes[i - 1].value = ''; boxes[i - 1].focus(); refresh(); e.preventDefault(); }
      else if (e.key === 'ArrowLeft' && i) boxes[i - 1].focus(); else if (e.key === 'ArrowRight' && i < boxes.length - 1) boxes[i + 1].focus();
      else if (e.key === 'Enter' && !join.disabled) join.click();
    };
    b.onpaste = e => { e.preventDefault(); fill(i, e.clipboardData.getData('text')); };
    b.onfocus = () => b.select();
  });
  root.querySelector('[data-ol=create]').onclick = () => { const n = name(); if (n) onCreate(n); };
  join.onclick = () => { const n = name(); if (n && code().length === boxes.length) onJoin(n, code()); };
  const rename = root.querySelector('[data-ol=rename]');
  if (rename) rename.onclick = () => {
    const box = root.querySelector('.ol-me'), old = onlineName();
    box.innerHTML = `<label class="ol-name"><small>নতুন নাম (সব অনলাইন খেলায় এটাই থাকবে)</small><input id="ol-name" maxlength="20" value="${esc(old)}"></label>`;
    root.querySelector('#ol-name').focus();
  };
}

/* Waiting room. */
export function onlineLobby({ code, members, me, host, min = 2, max = 4, title = '' }) {
  return `<section class="ol-card ol-lobby"><span class="ol-eyebrow">${esc(title)}</span>
  <div class="otp otp-show" aria-label="ঘরের কোড ${esc(code)}">${[...code].map(c => `<b>${esc(c)}</b>`).join('')}</div>
  <button type="button" class="ol-link" data-ol="share">কোড শেয়ার করুন</button>
  <ul class="ol-members">${members.map((n, i) => `<li><span class="ol-face">${esc(n.charAt(0))}</span>${esc(n)}${i === 0 ? '<small>ঘর খুলেছেন</small>' : ''}${i === me ? '<small>আপনি</small>' : ''}</li>`).join('')}${members.length < max ? `<li class="ol-empty">অপেক্ষা… (${members.length}/${max})</li>` : ''}</ul>
  ${host ? `<button type="button" class="btn primary wide" data-ol="start" ${members.length < min ? 'disabled' : ''}>${members.length < min ? 'আরেকজনের অপেক্ষা…' : 'খেলা শুরু'}</button>` : '<p class="ol-note">ঘর যিনি খুলেছেন তিনি শুরু করবেন।</p>'}
  <button type="button" class="btn text wide" data-ol="leave">ঘর ছেড়ে দিন</button></section>`;
}
export function bindLobby(root, { code, game, onStart, onLeave }) {
  root.querySelector('[data-ol=start]')?.addEventListener('click', onStart);
  root.querySelector('[data-ol=leave]')?.addEventListener('click', onLeave);
  root.querySelector('[data-ol=share]')?.addEventListener('click', async () => {
    const text = `শীতলপাটিতে ${game} খেলি! কোড: ${code}`;
    try { if (navigator.share) await navigator.share({ text, url: location.href.split('?')[0] + '?online=1' }); else { await navigator.clipboard.writeText(text); } } catch { }
  });
}

export async function tableApi(body) {
  const res = await fetch(API_BASE + '/api/table', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  const data = await res.json().catch(() => ({ error: 'NETWORK' }));
  if (!res.ok || data.error) throw Error(data.error || 'NETWORK');
  return data;
}
export const ONLINE_ERRORS = { ROOM_GONE: 'এই কোডের কোনো ঘর নেই।', FULL: 'ঘর ভরে গেছে।', STARTED: 'খেলা শুরু হয়ে গেছে।', NAME_TAKEN: 'এই নাম ঘরে আছে। প্রোফাইলের নাম বদলে আবার চেষ্টা করুন।', NAME: 'নাম লিখুন।', TURN: 'এখন আপনার চাল নয়।', COUNTS: 'আরও খেলোয়াড় লাগবে।', RATE_LIMIT: 'একটু পরে আবার চেষ্টা করুন।', WRONG_GAME: 'এই কোড অন্য খেলার ঘরের।', ONLINE_NOT_CONFIGURED: 'অনলাইন খেলা এখন চালু নেই।', STALE: 'খেলা এগিয়ে গেছে, আবার চেষ্টা করুন।' };

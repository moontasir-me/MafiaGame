/* Shared bits for the two hurricane-lamp games (চতুরঙ্গ, চোর ডাকাত পুলিশ বাবু): the lamp drawing, dialogs, toast. */
import { esc, icon } from './ui-kit.mjs';
import { soundEnabled, toggleSound } from './sound.mjs';

/* The night's light: moonlight or the hurricane lamp. Chosen on the শীতলপাটি page, remembered on this phone. */
export const readLight = () => { try { return localStorage.getItem('shitolpati.light') === 'lamp' ? 'lamp' : 'moon'; } catch { return 'moon'; } };
export function setLight(v) { try { localStorage.setItem('shitolpati.light', v); } catch { } document.documentElement.dataset.light = v; }

export const $ = q => document.querySelector(q), $$ = q => [...document.querySelectorAll(q)];
export const bn = n => (n < 0 ? '−' : '') + Math.abs(Number(n)).toLocaleString('bn-BD');

/* A hurricane lantern with a living flame. */
export const LANTERN = `<svg class="lantern" viewBox="0 0 60 92" aria-hidden="true"><path d="M30 2a9 9 0 0 1 9 9" fill="none" stroke="#6b5a45" stroke-width="2.4" stroke-linecap="round"/><path d="M21 11a9 9 0 0 1 9-9" fill="none" stroke="#6b5a45" stroke-width="2.4" stroke-linecap="round"/><rect x="17" y="11" width="26" height="7" rx="2" fill="#3c4a3e"/><path d="M19 18h22l5 14v20l-5 14H19l-5-14V32Z" fill="#ffd27a" fill-opacity=".16" stroke="#9aa79a" stroke-width="1.6"/><ellipse class="lantern-glow" cx="30" cy="44" rx="15" ry="18" fill="#ffb347" fill-opacity=".35"/><path class="lantern-flame" d="M30 32c5 7 6 11 3 15a4 4 0 0 1-6 0c-3-4-2-8 3-15Z" fill="#ffcf5c"/><path d="M30 41c2 3 2 5 1 6h-2c-1-1-1-3 1-6Z" fill="#fff4d0"/><rect x="25" y="49" width="10" height="4" rx="1" fill="#5a4a36"/><path d="M14 66h32l4 8c0 6-6 9-20 9s-20-3-20-9Z" fill="#41503f"/><path d="M12 80h36" stroke="#2d382c" stroke-width="3" stroke-linecap="round"/><path d="M16 18 12 30m32-12 4 12M12 54l4 12m32-12-4 12" stroke="#6b7a68" stroke-width="1.6" stroke-linecap="round"/></svg>`;

export function toast(text) { const t = $('#toast'); t.textContent = text; t.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2600); }

let modalResolve = null;
export function closeOverlay() { $('#overlay').innerHTML = ''; modalResolve?.(false); modalResolve = null; }
export function confirmBox(title, text, yes, no = 'খেলা চলুক') {
  return new Promise(resolve => {
    closeOverlay(); modalResolve = resolve;
    $('#overlay').innerHTML = `<div class="scrim"><section class="dialog" role="dialog" aria-modal="true" aria-label="${esc(title)}"><h2>${esc(title)}</h2>${text ? `<p>${esc(text)}</p>` : ''}<div class="dialog-actions"><button class="btn primary" id="confirm-yes">${esc(yes)}</button><button class="btn secondary" id="confirm-no">${esc(no)}</button></div></section></div>`;
    $('#confirm-yes').onclick = () => { modalResolve = null; $('#overlay').innerHTML = ''; resolve(true); };
    $('#confirm-no').onclick = closeOverlay; $('#confirm-no').focus();
  });
}
/* Pick one of several choices; resolves with its id, or null. */
export function chooseBox(title, choices) {
  return new Promise(resolve => {
    closeOverlay(); modalResolve = () => resolve(null);
    $('#overlay').innerHTML = `<div class="scrim"><section class="dialog" role="dialog" aria-modal="true" aria-label="${esc(title)}"><h2>${esc(title)}</h2><div class="lamp-choices">${choices.map(c => `<button type="button" class="btn secondary" data-choice="${esc(c.id)}">${c.label}</button>`).join('')}</div></section></div>`;
    $$('[data-choice]').forEach(el => el.onclick = () => { modalResolve = null; $('#overlay').innerHTML = ''; resolve(el.dataset.choice); });
  });
}
export function openMenu(items, act) {
  closeOverlay();
  const all = [...items, ['শব্দ: ' + (soundEnabled() ? 'চালু' : 'বন্ধ'), 'sound', 'sound', ''], ['সব খেলায় ফিরে যান', 'back', 'games', 'tone-quiet']];
  $('#overlay').innerHTML = `<div class="scrim"><section class="dialog app-menu-dialog" role="dialog" aria-modal="true" aria-labelledby="menu-title"><div class="picker-title"><h2 id="menu-title">মেনু</h2><button type="button" id="close-menu" class="icon-btn" aria-label="বন্ধ করুন">${icon('close')}</button></div><div class="app-menu-items">${all.map(([label, ic, a, tone]) => `<button class="btn secondary wide ${tone}" type="button" data-menu="${a}">${icon(ic)}${label}</button>`).join('')}</div></section></div>`;
  $('#close-menu').onclick = closeOverlay;
  $$('[data-menu]').forEach(el => el.onclick = () => { const a = el.dataset.menu; closeOverlay(); if (a === 'sound') { toggleSound(); openMenu(items, act); } else if (a === 'light') { setLight(readLight() === 'moon' ? 'lamp' : 'moon'); openMenu(items, act); } else if (a === 'games') location.href = 'index.html'; else act(a); });
}
addEventListener('keydown', e => { if (e.key === 'Escape' && $('#overlay')?.innerHTML) closeOverlay(); });

export const BACK = 'index.html';
export const SHELL_LABELS = { back: 'সব খেলা', menu: 'মেনু', sections: 'অংশ' };
export const TABS = [{ id: 'play', label: 'খেলা', icon: 'play', action: 'tab-play' }, { id: 'rules', label: 'নিয়ম', icon: 'book', action: 'tab-rules' }, { id: 'ranking', label: 'র‍্যাঙ্কিং', icon: 'trophy', action: 'tab-ranking' }];

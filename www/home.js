import { bindTeaHost } from './tea-host.mjs';
import { getLanguage, saveLanguage, t } from './locale.mjs';
import { readProfile, saveProfile, photoFromFile } from './profile.mjs';
import { soundEnabled, toggleSound, sound } from './sound.mjs';
const $ = q => document.querySelector(q);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function paintProfile() {
  const p = readProfile();
  $('#profile-face').innerHTML = p.photo ? `<img src="${p.photo}" alt="">` : esc((p.name || '?').charAt(0));
  $('#profile-label').textContent = p.name || t('প্রোফাইল','Profile');
}

function openProfile() {
  let profile = saveProfile(readProfile()), photo = profile.photo;
  const close = () => { $('#home-overlay').innerHTML = ''; $('#profile-button').focus(); };
  $('#home-overlay').innerHTML = `<div class="home-scrim"><form class="home-dialog" id="profile-form" role="dialog" aria-modal="true" aria-labelledby="profile-title"><div class="home-dialog-head"><h2 id="profile-title">আমার প্রোফাইল</h2><button type="button" class="home-close" id="profile-close" aria-label="বন্ধ করুন">×</button></div><label class="photo-pick" for="profile-photo"><span class="profile-big" id="profile-big">${photo ? `<img src="${photo}" alt="">` : esc((profile.name || '?').charAt(0))}</span><span>ছবি বদলান</span></label><input id="profile-photo" type="file" accept="image/png,image/jpeg,image/webp" hidden><label class="field" for="profile-name">নাম<input id="profile-name" value="${esc(profile.name)}" maxlength="20" placeholder="আপনার নাম" required></label><p class="home-error" id="profile-error" role="alert"></p><button class="home-save" type="submit">সেভ করুন</button></form></div>`;
  $('#profile-close').onclick = close;
  $('.home-scrim').onclick = e => { if (e.target === e.currentTarget) close(); };
  $('#profile-photo').onchange = async e => { try { photo = await photoFromFile(e.target.files[0]); $('#profile-big').innerHTML = `<img src="${photo}" alt="">`; } catch { $('#profile-error').textContent = '৫ মেগাবাইটের কম JPEG, PNG বা WebP ছবি দিন।'; } };
  $('#profile-form').onsubmit = e => { e.preventDefault(); const name = $('#profile-name').value.trim(); if (!name) return; saveProfile({ ...profile, name, photo }); paintProfile(); close(); };
  $('#profile-form').onkeydown = e => { if (e.key === 'Escape') close(); };
  $('#profile-name').focus();
}

/* The courtyard stays dark: lantern warmth or cool moonlight. New visitors arrive with the lamp lit. */
const lit = () => { try { return localStorage.getItem('shitolpati.light') !== 'moon'; } catch { return true; } };
function paintLight() { const on = lit(); document.documentElement.dataset.light = on ? 'lamp' : 'moon'; document.querySelector('meta[name="theme-color"]').content = on ? '#17140f' : '#101b24'; const b = $('#lantern'); b.classList.toggle('is-lit', on); b.setAttribute('aria-pressed', on); b.setAttribute('aria-label', on ? 'হারিকেন নিভিয়ে দিন' : 'হারিকেন জ্বালান'); }
$('#lantern').onclick = () => { try { localStorage.setItem('shitolpati.light', lit() ? 'moon' : 'lamp'); } catch { } paintLight(); $('#lantern').classList.remove('swing'); void $('#lantern').offsetWidth; $('#lantern').classList.add('swing'); if (lit()) sound('notice'); };
paintLight();

/* Offline: every game, on one phone. Online: only games that have an online room, opened in their online version. */
const playOnline = () => { try { return localStorage.getItem('shitolpati.online') === '1'; } catch { return false; } };
function paintPlay() {
  const on = playOnline();
  document.querySelectorAll('[data-play-set]').forEach(b => { const me = (b.dataset.playSet === 'online') === on; b.classList.toggle('is-on', me); b.setAttribute('aria-checked', me); });
  document.querySelectorAll('.game-tile').forEach(a => {
    const ok = on ? !!a.dataset.online : !a.dataset.onlyOnline;
    a.classList.toggle('is-off', !ok); a.toggleAttribute('aria-disabled', !ok); a.tabIndex = ok ? 0 : -1;
    if (a.dataset.offline) a.href = on ? a.dataset.online : a.dataset.offline;
    const count = a.querySelector('.tile-players');
    if (count) { const label = on && count.dataset.countOnline ? count.dataset.countOnline : count.dataset.countOffline; count.querySelector('span').textContent = label; count.title = on && count.dataset.countOnline ? (a.classList.contains('mafia-tile') ? label + ' খেলোয়াড়, সঙ্গে ১ জন হোস্ট' : label + ' খেলোয়াড়') : count.dataset.countHint; }
    a.querySelector('.tile-badge')?.remove();
    if (on) a.querySelector('.tile-copy').insertAdjacentHTML('beforeend', `<span class="tile-badge">${ok ? 'অনলাইন' : 'শুধু অফলাইনে'}</span>`);
    else if (a.dataset.onlyOnline) a.querySelector('.tile-copy').insertAdjacentHTML('beforeend', '<span class="tile-badge">শুধু অনলাইনে</span>');
  });
}
document.querySelectorAll('[data-play-set]').forEach(b => b.onclick = () => { try { localStorage.setItem('shitolpati.online', b.dataset.playSet === 'online' ? '1' : '0'); } catch { } paintPlay(); });
document.querySelectorAll('.game-tile').forEach(a => a.addEventListener('click', e => { if (a.classList.contains('is-off')) e.preventDefault(); }));
paintPlay();

/* Inside the Android app there is nothing to download. */
if (location.hostname === 'appassets.androidplatform.net' || window.Android) $('#apk-link')?.remove();

/* The profile pill opens a small menu. */
const menu = $('#profile-menu'), pill = $('#profile-button');
function paintSound() { const on = soundEnabled(); $('#sound-label').textContent = 'শব্দ: ' + (on ? 'চালু' : 'বন্ধ'); menu.querySelector('[data-menu=sound]').setAttribute('aria-checked', on); }
function showMenu(open) { menu.hidden = !open; pill.setAttribute('aria-expanded', open); if (open) { paintSound(); menu.querySelector('[role^=menuitem]').focus(); } }
pill.onclick = e => { e.stopPropagation(); showMenu(menu.hidden); };
menu.querySelector('[data-menu=profile]').onclick = () => { showMenu(false); openProfile(); };
menu.querySelector('[data-menu=sound]').onclick = e => { e.stopPropagation(); toggleSound(); paintSound(); };
document.addEventListener('click', e => { if (!menu.hidden && !menu.contains(e.target)) showMenu(false); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !menu.hidden) { showMenu(false); pill.focus(); } });
paintProfile();
if ('serviceWorker' in navigator && !window.Android) navigator.serviceWorker.register('./sw.js').catch(() => {});

function openLanguage() {
  const close = () => { $('#home-overlay').innerHTML = ''; pill.focus(); };
  $('#home-overlay').innerHTML = `<div class="home-scrim"><section class="home-dialog" role="dialog" aria-modal="true" aria-labelledby="language-title"><div class="home-dialog-head"><h2 id="language-title">${t('ভাষা বেছে নিন','Choose language')}</h2><button type="button" class="home-close" id="language-close" aria-label="${t('বন্ধ করুন','Close')}">×</button></div><p class="language-note">${t('সব খেলা আপনার পছন্দের ভাষায় দেখাবে। Colour Rush সবসময় ইংরেজিতে থাকবে।','Your choice applies to every game. Colour Rush stays in English.')}</p><div class="language-options" role="radiogroup" aria-label="Language">${[['bn','বাংলা'],['en','English']].map(([id,label])=>`<button type="button" data-language="${id}" role="radio" aria-checked="${getLanguage()===id}" data-no-translate><span>${label}</span><span aria-hidden="true">${getLanguage()===id?'✓':''}</span></button>`).join('')}</div></section></div>`;
  $('#language-close').onclick=close;
  $('.home-scrim').onclick=e=>{if(e.target===e.currentTarget)close();};
  $('.home-dialog').onkeydown=e=>{if(e.key==='Escape')close();};
  document.querySelectorAll('[data-language]').forEach(b=>b.onclick=()=>{saveLanguage(b.dataset.language);location.reload();});
  document.querySelector(`[data-language="${getLanguage()}"]`).focus();
}
menu.querySelector('[data-menu=language]').onclick=()=>{showMenu(false);openLanguage();};

// Mama greets, pours, then offers a fresh glass.
bindTeaHost(document.querySelector('.tong-hero'),{sound});

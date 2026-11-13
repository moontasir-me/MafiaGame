import { readProfile, saveProfile, photoFromFile } from './profile.mjs';
const $ = q => document.querySelector(q);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

function paintProfile() {
  const p = readProfile();
  $('#profile-face').innerHTML = p.photo ? `<img src="${p.photo}" alt="">` : esc((p.name || '?').charAt(0));
  $('#profile-label').textContent = p.name || 'প্রোফাইল';
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

/* Moonlight or the hurricane lamp, remembered on this phone. */
const light = () => { try { return localStorage.getItem('shitolpati.light') === 'lamp' ? 'lamp' : 'moon'; } catch { return 'moon'; } };
function paintLight() { document.documentElement.dataset.light = light(); document.querySelectorAll('[data-light-set]').forEach(b => { const on = b.dataset.lightSet === light(); b.classList.toggle('is-on', on); b.setAttribute('aria-checked', on); }); }
document.querySelectorAll('[data-light-set]').forEach(b => b.onclick = () => { try { localStorage.setItem('shitolpati.light', b.dataset.lightSet); } catch { } paintLight(); });
paintLight();

$('#profile-button').onclick = openProfile;
paintProfile();
if ('serviceWorker' in navigator && !window.Android) navigator.serviceWorker.register('./sw.js').catch(() => {});

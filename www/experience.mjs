import {startAccessibility} from './a11y.mjs';
import './app-controls.mjs';
import { startLocalization } from './localization.mjs';
startLocalization();
startAccessibility();
/* Shared visual feedback only. No game state, timers, rules or board coordinates. */
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
document.addEventListener('pointerdown',event => {
  if (reduced.matches || document.hidden) return;
  const control = event.target instanceof Element && event.target.closest('.btn,.kit-pill,.home-pill,.kit-tab,.kit-side-item,.play-switch button');
  if (!control || control.matches(':disabled,[aria-disabled="true"]')) return;
  control.classList.remove('ui-feedback');
  requestAnimationFrame(() => {
    if (!control.isConnected) return;
    control.classList.add('ui-feedback');
    control.addEventListener('animationend',()=>control.classList.remove('ui-feedback'),{once:true});
  });
},{passive:true});
reduced.addEventListener('change',() => {
  if (reduced.matches) document.querySelectorAll('.ui-arrive,.ui-feedback').forEach(el=>el.classList.remove('ui-arrive','ui-feedback'));
});

/* Shared visual feedback only. No game state, timers, rules or board coordinates. */
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const targets = '.game-tile,.home-hero,.library-heading,.play-switch';
const observed = new WeakSet();
const observer = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  for (const {target,isIntersecting} of entries) {
    if (!isIntersecting) continue;
    if (!reduced.matches) target.classList.add('ui-arrive');
    observer.unobserve(target);
  }
}, {threshold:.12}) : null;
function enhance(root) {
  const elements = [...(root.matches?.(targets) ? [root] : []), ...root.querySelectorAll(targets)];
  for (const [i,el] of elements.entries()) {
    if (observed.has(el)) continue;
    observed.add(el);
    el.style.setProperty('--ui-delay',`${Math.min(i%4,3)*45}ms`);
    observer?.observe(el);
  }
}
enhance(document);
// The lobby is static; game screens already use the shared enterScreen transition.
// Observe new lobby cards only, never the continuously redrawn game boards.
const library = document.querySelector('.game-tiles');
if (library) new MutationObserver(records => {
  for (const r of records) for (const node of r.addedNodes) if (node instanceof Element) enhance(node);
}).observe(library,{childList:true});
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

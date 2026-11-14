# শীতলপাটি visual system

`www/experience.css` is the shared finish, loaded after each page’s existing world and game styles. `www/experience.mjs` adds progressive home-card entrances and optional control feedback. Both are cached for offline use.

The home keeps the village-at-night identity and lamp interaction: ink-blue background, brass highlights, ivory game cards, understated woven texture, and the existing Bengali verse. Every game keeps its own palette, illustration and board. Shared controls use the same corner shapes, spacing, focus treatment, navigation, dialog surfaces and heading rhythm.

Use 18–24px panel corners, 13px controls, 48px primary touch targets, consistent 18px phone gutters, and short 180–500ms transitions. Do not add remote fonts or illustration dependencies. The existing local Poppins and approved Bengali fallback remain in place.

Motion must respect reduced-motion settings. Entrances are progressive: content remains visible if JavaScript, IntersectionObserver or animation is unavailable. Avoid animations on board hit regions, physics canvases or private card content; keep secrets under each game’s existing reveal/privacy logic. Game panels may change finish, not board coordinates.

Validation for this refresh covers all 12 game starts, ranking and online entry at 320px and 390px widths, desktop layout, representative active card and board play, private-card reveal/hide, menus and the existing automated regressions.

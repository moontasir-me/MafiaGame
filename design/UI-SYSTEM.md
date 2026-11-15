# আনোয়ার মামা টি স্টল visual system

`www/experience.css` is the shared finish, loaded after each page’s existing world and game styles. `www/experience.mjs` adds progressive home-card entrances and optional control feedback. Both are cached for offline use.

The home uses a shaded cartoon village background with a visible warm lantern toggle. Tong mama greets visitors and pours tea when tapped. Each game tile is a walnut-coloured vintage TV case, with the illustration inside curved screen glass, decorative tuning dials, speaker vents and feet. On phones and compact tablets, the controls sit below the screen to preserve image space. Titles and player counts remain readable, and hover/focus retains the inverse colour treatment. Every game keeps its own palette, illustration and board. Shared controls use the same corner shapes, spacing, focus treatment, navigation, dialog surfaces and heading rhythm.

Use 18–24px panel corners, 13px controls, 48px primary touch targets, consistent 18px phone gutters, and short 180–500ms transitions. Do not add remote fonts or illustration dependencies. The existing local Poppins and approved Bengali fallback remain in place.

Motion must respect reduced-motion settings. Entrances are progressive: content remains visible if JavaScript, IntersectionObserver or animation is unavailable. Avoid animations on board hit regions, physics canvases or private card content; keep secrets under each game’s existing reveal/privacy logic. Game panels may change finish, not board coordinates.

Validation includes the automated game regressions, offline asset inventory, legacy ranking-image migration, and CSS parsing. Manual browser verification should include all 12 game starts, ranking and online entry at 320px, 390px and desktop widths, private-card reveal/hide, and menus.

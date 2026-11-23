# Usability and accessibility review — 18 November 2026

Implemented opaque paper surfaces, dark headings, a shared teal/cream palette, keyboard focus rings, 44px common controls, native saved-name suggestions, and text alongside pen-life colors. The lantern is the only day/night control. Game boxes sit on wooden showcase shelves using the existing Bangladeshi cartoon covers.

Automated checks cover 4.5:1 contrast for the shared normal-text pairs and 3:1 for selected control boundaries, board sizing at phone/tablet dimensions, saved-name suggestions, pen impact damage/cooldown, durability limits, and drag-force limits. These are targeted WCAG 2.2 checks, not a full accessibility certification. Canvas games still require separate assistive-technology review.

Browser checks: home in Bangla/English and both lantern states; Pen Fight setup and active board at 390×844; Ludo active board at 1180×820 and 390×844. Both Ludo viewports had document height equal to viewport height. Verified pen-life bars, smaller drag board, Mama home link, and language controls. Fixed the cream-on-cream shelf heading and an inherited rule hiding the wooden showcase during review.

Spatial boards fit the available play area. Setup forms, rankings, and long content can scroll to preserve readability, including at enlarged text sizes. Real-device touch and screen-reader testing remain recommended; no claim of complete WCAG conformance is made.

## App-wide revision — 23 November 2026

Reviewed all fifteen game entry screens (Mafia, Spy, Kalidas, Pen Fight, Fibonacci, Chess, Chor, Ludo, Carrom, Dots, Three Stones, Colour Rush, Dhoni, Baghaduli and Poker) at 320px and 1180px. DOM checks found no horizontal page overflow or header controls outside the viewport; no completed image loads were broken. Reviewed the online Mafia entry screen separately. This is entry-screen coverage, not a claim that every possible match state has been manually exercised.

Findings and changes:
- Replaced competing setup/hero/control colors with paper, ink, teal action and muted text tokens. Corrected dark-on-dark Dhoni headings, light-on-light Fibonacci text, Chess/Colour Rush navigation labels and low-contrast segmented options.
- Unified spacing, button sizes, inputs, selected states and modal surfaces. Kept board/piece colors meaningful. Removed repetitive hero paragraphs, the sample riddle, duplicate numeric range hints and decorative quotes from the main action flow.
- Removed delayed opacity reveals that briefly made content appear faded. Respect reduced motion. Added skip links, explicit Chess player labels, arrow-key radio selection, modal focus wrapping and focus restoration. Browser-tested Fibonacci radio selection plus Shift+Tab/Escape in its menu.
- Found and fixed inherited full-width rules pushing fixed game windows outside their bounds. Baghaduli's canvas previously extended below the tablet viewport; it now fits with controls at 1180×820 and 390×844. Short landscape windows use scrolling instead of clipping controls.
- Replaced Baghaduli's pulse button with marble pull/release. Verified a pointer drag launched a marble and updated the result. Added letterbox-aware coordinates, a generous launch hit area, canceled/short-pull handling and a keyboard alternative. Tested exiting to Baghaduli setup and restarting, its real menu, and English switching.
- Removed the unused pulse-control module and its obsolete test. Corrected copied Poker/Baghaduli property-game metadata.

Validation: full automated suite and JavaScript syntax checks. Browser contrast measurements on solid surfaces guided fixes; decorative images, gradients, all board artwork and all live match permutations are not covered by that measurement. Real-device touch/assistive-technology validation and full WCAG conformance remain outside this audit. Reference targets: [WCAG contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html), [unobscured focus](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html).

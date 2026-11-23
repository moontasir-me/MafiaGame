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

## Live gameplay audit — 23 November 2026

Exercised the actual UI of all fifteen games in a local browser, measuring live states at 390×844 (phone) and 1180×820 (iPad landscape). These are browser viewport checks, not physical-device certification. Measurements include both the original faults and post-fix observations in `gameplay-measurements.json`.

| Game | Gameplay exercised |
| --- | --- |
| Mafia | Five private reveals, host PIN unlock, timer, daytime elimination, correct final Police guess reversing the winner, +3 Mafia points, next game and secure re-deal |
| Spy | Three private reveals, discussion, manual end, vote confirmation, caught spy, automatic next case beginning with that spy |
| Kalidas | Timed question, answer reveal, correct-player choice and next riddle |
| Fibonacci | Live question, correct answer adding one point, end-turn confirmation, result and replay |
| Chor | Four private chit draws, police accusation, correct result and round totals, next round |
| Chess | e2–e4 and handoff to the computer turn |
| Three Stones | Placement and computer turn |
| Dots & Boxes | Keyboard line selection and turn change |
| Ludo | Dice animation, resolved roll with no legal move, turn passing to the second player |
| Carrom | Drag shot, computer shot response and pocket/score feedback |
| Pen Fight | Shot, collisions, both life bars reducing from 100 to 68 |
| Baghaduli | Launch, repeated completed shots and marble-count updates |
| Poker | Private hand, fold, pot award, next hand |
| Dhoni | Roll, property landing, buy decision, cash/ownership update |
| Colour Rush | Deal, legal card play and turn change; Draw/Rush/hand placement |

Fixed during this pass:
- Dots line groups had zero-height geometry: added rectangular interaction targets and distinct line labels; keyboard activation verified afterward.
- Spy could expose the next identity under the old heading after a fast handoff tap. Disabled the old card and made handoff content inert immediately; applied the same guard to Mafia. Shared transitions now reject duplicate transitions and block stale controls until the new screen renders.
- Baghaduli could crash on an early animation timestamp producing frame −1. Clamped the animation index and tested repeated completed shots afterward.
- Colour Rush's full table/hand exceeded the viewport. Added a fixed play window, compact opponents and seven-card hand, retaining internal hand scrolling when necessary.
- Dhoni's phone purchase actions fell below the board. Split the phone play window between the board and current-action panel, placing the current action before secondary property/history information.
- Mafia's host timer and elimination controls required long page scrolling. Bounded the host window, compacted the timer and roster, and kept the round action visible. Long rosters scroll internally. Also bounded the final-guess ballot.
- Bounded quiz, chit and private-card screens, including riddle/player choices and the chit round-result/next-round control. Bounded Spy's timer/ballot with a pinned confirmation action.

Regression validation: 184 tests pass, including new early-frame and duplicate/stale-transition tests; syntax checks and whitespace checks pass. Final fixed-state observations show viewport-sized documents for the corrected play windows. Secondary property lists, long rosters, many-card hands, long questions and histories may scroll inside their panels to preserve readable text and usable targets. Extremely short landscape windows retain a scroll fallback. Closed-details descendants may appear in raw DOM clipping measurements despite being hidden; these do not represent visible controls.

Limits: this is a representative gameplay smoke test across every game, not exhaustive testing of all combinations, rules variants, full-length matches, online concurrency or every device/browser. No new deployment credentials or production rooms were used. Existing uncommitted Carrom wording changes and `.claude/` content were left untouched and excluded from this commit.

Final screenshot follow-up: an inherited mobile timer rule still stacked Mafia's buttons. Increased the scoped rule's specificity and rechecked: the five-row host roster had `clientHeight = scrollHeight = 256px` at 390×844, so all five elimination controls were visible together. Also replaced the dark elimination buttons with clear, outlined danger controls.

## Marble controls, unbreakable pens and invitations

Removed the pen-damage mechanic entirely: no health, cracks or damage elimination. Only falling from the bench eliminates a pen. Old saved rounds recover pens previously marked broken. Added thicker illustrated barrels, ink outlines, highlights, metal collars, clips and brand marks, while retaining readable player/status cards and round wins.

Baghaduli now has a visible 48px pull handle over its launcher instead of relying on users finding a tiny marble on the canvas. A valid short pull now reaches the engine's minimum launch strength. Each flight owns its animation callback and completion deadline, so callbacks from a previous game cannot interfere after a restart. Optional tap controls provide a no-drag route; Pen Fight also has direction, power and tap-shoot controls. Reference: [W3C dragging alternatives](https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html) and [target size](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html). This is targeted accessibility work, not a claim of full WCAG conformance.

Browser validation: the new handle launched a marble and advanced the count from 3/5 to 4/5. The tap alternative completed the fifth marble and advanced to the computer's turn. Pen Fight loaded a previously damaged round without health indicators or broken graphics; keyboard and tap controls remained available. The host's Mafia lobby displayed a QR code. Opening its invitation in a fresh browser origin showed only a name form; entering a name joined the correct room and updated the host's roster. No code typing was required. The QR preserves a four-module white quiet zone; its destination contains the public invitation token, never the host's session token. Sharing supports a PNG QR file when the browser supports file sharing, with a room-link fallback. A QR download test stalled in the preview environment, so native download/file-sharing behavior is not claimed as verified.

Validation: 186 automated tests pass, including collision survival, old-save recovery, edge-only elimination, short-pull power and URL-to-room joining. Syntax checks pass. Physical camera scanning, native share sheets and screen-reader testing remain outside the verified coverage.


## Mobile exit, universal online invitations and lantern follow-up

The reported “swap” issue referred to swiping down to reach End match. Baghaduli now has a labelled 44px End game action beside the round heading, returning to its own setup. Canvas background touches allow vertical scrolling; only the dedicated green handle captures a touch drag. The panel can scroll for expanded tap controls or longer results. Shortened duplicate instructions. Upward and sideways handle pulls also work, flight animations finish within 1.6 seconds, and resuming a backgrounded tab recovers overdue animation completion.

Every online game now offers a QR invitation: Mafia, Pen Fight, Chess, Ludo, Carrom, Dots & Boxes, Three Stones, Colour Rush and Dhoni. Shared lobby invitations and Colour Rush's custom lobby point directly to a name-only join form, with a normal link and share fallback. Dhoni's existing QR now has a four-module quiet zone. Invalid room codes and unsupported game paths are rejected by the URL helper. Colour Rush's shared controls and QR copy stay English even when the device preference is Bangla.

Moved the lantern from the navigation into the shop awning and added a contrasting backing so it remains discoverable against the illustration. Menus, secondary actions, selected number buttons and profile actions use explicit readable foreground/background pairs in both lantern states. Observed night menu: #233e37 text on #f0e4c6.

Browser checks: completed a five-shot Baghaduli round with upward/sideways pulls; verified End game then starting again. Final layouts checked at 360×740, 390×844 and 1024×768: board and End game remain inside the play window. Inspected QR lobbies for all eight table-based online games; Mafia's QR was verified in the preceding pass. Used separate browser origins to join Pen Fight, Colour Rush and Dhoni by invitation with only a name. Checked lantern day/night and night menu colors.

Validation: 189 automated tests pass; syntax and whitespace checks pass. The suite covers game engines and online room behavior; this follow-up focuses on the reported controls and invitation flows. Physical camera scanning, native sharing, real devices and exhaustive full-length multiplayer matches remain unverified. Existing Carrom wording edits and .claude content remain excluded.

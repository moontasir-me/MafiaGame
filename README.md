# Mafia — Polashi & Sicily

A light-themed mobile social deduction game for **5–20 players plus a separate host**. The app name stays **Mafia**; the universe picker changes the cast, language, quotations, artwork, and paper motif.

- **Polashi / পলাশী:** Mughal floral motifs, textured cream paper, Bengali literary excerpts, and named historical figures.
- **Sicily:** vintage Italian acanthus ornament, antique paper, and characters from Mario Puzo’s *The Godfather*.

## Run

Node.js 20+; no npm install is required.

```sh
npm start
npm test
npm run check
npm run test:lan
```

Open `http://localhost:5173`. Use the menu’s separate-phone option for QR multiplayer. The QR encoder is vendored with its MIT license; no external QR service or cloud room is used.

## The host is not a player

The host controls dealing, timing, votes, eliminations, investigations, scoring, and results. They receive **no player role**, cannot vote, cannot be attacked or eliminated, and are excluded from the 5–20 player count. Their controller portrait is **Siraj ud-Daulah** in Polashi and **Vito Corleone** in Sicily.

A completed result awards the host **1 point exactly once**. Cancelled or unfinished games award nothing. Host duties transfer **between games**, preventing anyone from controlling a game while holding a player role. Scores and the last five completed results stay with the person when they become a player or host in the next game.

## Points

| Result | Automatic points |
| --- | --- |
| Mafia win | Actual Mafia: 3 each; Betrayer: 2 each |
| Village win | Doctor and Police: 2 each; other village roles: 1 each; Betrayer: 0 |
| Completed game | Host: 1 |

Eliminated winning teammates receive their normal victory points. Manual player points add to automatic awards. Reloading or repeating a result cannot award a second time.

Before a village victory, actual Mafia share **one final Police/Senapati guess**. Any configured Police player counts, alive or out. A correct guess flips the winner; a wrong or skipped guess preserves the village win. With no Police, the guess step is skipped. A surviving Betrayer cannot continue night attacks after all actual Mafia are gone.

## Cast

| Game role | Polashi identity | Sicily identity |
| --- | --- | --- |
| Host | Siraj ud-Daulah | Vito Corleone |
| Mafia 1 | Robert Clive | Michael Corleone |
| Mafia 2 | Mir Jafar | Sonny Corleone |
| Mafia 3 | Mir Qasim | Emilio Barzini |
| Doctor / Rajboiddo | Hakim Ali Gilani | Dr. Jules Segal |
| Police / Senapati | Mir Madan | Al Neri |
| Betrayer | Ghaseti Begum | Carlo Rizzi |
| Gonok / Consigliere | Varahamihira | Tom Hagen |
| Protector / Spy | Mohanlal | Luca Brasi |
| Villager | Lalon Shah | Amerigo Bonasera |

Additional copies of a role reuse its identity set. In single-phone mode, the numbered Mafia identities follow actual reveal order. Gonok/Consigliere survives Mafia night attacks but can be voted out. The host narrates protection and investigation in person; a private host-only inspection supports resolving night actions.

Character cards contain short sourced biographies. Mir Jafar and Mir Qasim are called **Nawabs**, with their reigns and deaths described separately. Mir Qasim’s later conflict with the Company is retained. Ghaseti’s death account is identified as a traditional account. Earlier/later figures such as Ali Gilani, Varahamihira, and Lalon carry their own eras. See [literary and historical sources](design/LITERARY-SOURCES.md).

## One-phone mode

Enter only players, excluding the host. The menu lets the host set their own name and optional photo. A matching host name cannot be added to the player roster.

The player list defines the phone sequence: **1 → 2 → 3 → 4**, continuing to the last player. Drag a dotted grip to insert someone between positions; keyboard Space lifts/drops, arrows move, and Escape cancels. Named **from → to** arrows guide each handoff. Rematches start at position 1 and keep the current host until an explicit handover.

Roles can be random or manually assigned, with exact configurable counts. The host panel uses a salted PBKDF2 password and supports night/vote eliminations, restore, discussion timers, manual scores, and plan notes. Completed results are recorded locally; the host completion award is idempotent.

## QR multiplayer

1. On an Android phone with the built app, enable its hotspot in system settings. Open QR mode and create a room. Keep this original device and app open.
2. Everyone connects to that hotspot first, then scans the room QR in their camera and enters a name. Guests use their regular browser, including on iPhone; no install is needed.
3. The host configures and deals roles once 5–20 players join. The host is a sixth person in a five-player game.
4. Each player gets only their own current role, points, rank, notes, and synchronized timer. Roles start hidden, hide with a second tap, and hide on blur/backgrounding. A new random quote is assigned for each game, with distinct quote indexes across players.
5. When the discussion deadline expires, living players see a **radio-button ballot**. They select one person and confirm once. A confirmed vote cannot change that round. The host receives live totals.
6. The host can finish a round manually, choosing **zero, one, or two** living players for elimination. This clears the ballots, advances the round, and resets the timer. The host is never a candidate. Night eliminations remain separate controls for players only.
7. The ranksheet button opens cumulative standings plus each person’s **last five completed games**. Small role portraits carry green win/completion markers or red loss markers, with accessible text labels. It never reveals ongoing roles.
8. The menu edits name/photo and opens the world picker. Photos are optional, resized locally, stored with the profile, and shared only with the local room. The native Android chooser requires no broad photo-library permission.
9. The host can change the room’s universe. Everyone changes together without redealing. Past-game portraits keep their original universe; captions use the current interface language.
10. After the result, transfer host duties if desired, then rematch. Connected players, cumulative points, and history persist. The original hotspot/server device remains the connection point.

Updates use authenticated requests every 700 ms and a clock synchronized to the authority’s deadline. Rejoining with the same browser storage restores the session. Lost connections hide exposed cards and show reconnection status. Notifications cover dealing, host/world changes, results, and timer expiry.

Browser preview hosting uses the Node server on a computer; the invitation contains that computer’s LAN address on port **5173**. A static browser page cannot start a phone hotspot server. Android includes a foreground local HTTP transport and serves the same assets and authority logic. Rooms expire after six inactive hours and close if the original server/app is killed. Local HTTP is intended for a trusted hotspot, not internet hosting.

## Quotations and artwork

Both universes contain **103 distinct entries**. Polashi has 103 public-domain excerpts from Girish Chandra Ghosh’s *Sirajoddoula* (1905), each linked to its scene. Sicily has one brief credited Puzo excerpt plus 102 original Mafia-themed lines, explicitly identified as original. They are never falsely attributed to Puzo. The complete list is in [QUOTE-CATALOG.md](design/QUOTE-CATALOG.md).

Twenty named caricatures and two ensemble covers are active under `www/assets/bn` and `www/assets/en`. Portraits use historical portrait conventions or familiar Godfather screen interpretations; covers show the complete cast without a cropping frame. See [art prompts](www/assets/PROMPTS.md). Obsolete archived designs and old workspace preview PNGs were removed; final preview images live outside the app assets.

## Android build and verification

**Mafia 2.1 APK is built and signed for direct installation:** [Download the APK](releases/Mafia-2.1-debug.apk). This is a debug-signed build for personal testing, not a Play Store release. Physical Android/hotspot testing still needs a real device.

Use Android Studio, SDK Platform 35, JDK 17, and Gradle **8.9** (Android Gradle Plugin **8.7.3**). The checked-in wrapper verifies the Gradle distribution checksum. Run `cd android` then `./gradlew assembleDebug lintDebug` with `JAVA_HOME` pointing to JDK 17 and `ANDROID_HOME` pointing to the SDK. The debug APK appears at `android/app/build/outputs/apk/debug/app-debug.apk`.

The app packages `www`, supports Android 8+ with an updated WebView, blocks screenshots/recent-app previews, keeps the screen awake during play, and disables backups. Internet/network permissions support the LAN server. Native hosting must stay in the foreground; hotspot client isolation depends on the device/router. A UI password protects ordinary handoffs, while developer tools/storage access can inspect a local authority’s data.

Automated verification covers host exclusion, authorization, voting deadlines and immutable ballots, two-player round elimination, exactly-once host/victory awards, role identities, private projections, final guesses, cumulative history, snapshots, profile sanitation, handoff seating, and all offline assets. The LAN test uses an actual HTTP host plus five player clients. Browser QA also checks QR joining, photo selection, vote submission/live totals, host changes, both worlds, role privacy, history markers, and rightward named handoffs. The displayed QR was decoded from a browser screenshot and matched its invitation.

## Version 2.1 verification

- 48 automated tests, JavaScript syntax checks, and local HTTP multiplayer integration pass.
- Android `assembleDebug` and `lintDebug` pass (two advisory portrait-orientation warnings).
- APK signature verification passes; version 2.1 / code 8, minimum Android 8, target Android 15.
- Two browser phone sessions verified timer-gated voting, one confirmed vote, matching live totals, and a host-confirmed Doctor elimination shown publicly only as **Villager**.
- Fixed host through rematches; only explicit handover changes the host. Phone handoffs now always follow player-list order from position 1.
- Polashi uses only 103 Sirajuddoula literary excerpts; Sicily’s fixed copy and quote deck contain no Bengali.
- Unused design images and drafts were removed; active character art and source/catalog documentation remain.

Vote totals are public; individual ballots are not published. Only the host confirms eliminations. Public verdicts contain a name and **Mafia/Villager** side, never a precise role or character identity. Each player still sees their own private role; only the host can inspect other current roles. The five-game ranksheet retains completed-game roles.

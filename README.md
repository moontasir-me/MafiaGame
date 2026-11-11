# মসনদ / Mafia — A Sicilian Affair

A Bengali and English social deduction game with pass-the-phone and QR multiplayer modes for 5–20 players, with two illustrated worlds:

- Bengali: a fictional Nawabi court after Sirajuddaulah’s death. Ghatok (East India Company), Rajboiddo, Senapati, Proja, Mir Zafar, Jotishi and Peyada.
- English: a Sicilian village with Mafia, Doctor, Police, Villager, Betrayer, Witch and Spy.

## Run the preview

Node.js 20+ is required; there are no npm dependencies.

```sh
npm start
```

Open http://localhost:5173. Run `npm test` for game-rule tests and `npm run check` for JavaScript syntax checks.

## Seating and role assignment

The names list is physical **clockwise seating order**. Drag the dotted grip to insert a player between other rows; intervening players shift one seat. On a keyboard, use Space to lift, arrow keys to move, Space to drop, and Escape to cancel. Names, manual role choices and the rematch starter stay associated with the person when seats change.

The phone travels **counterclockwise**. The seating preview shows the actual reveal sequence. A rematch begins with the **last actual Mafia/Ghatok in the previous reveal order**, regardless of elimination order. It retains names and configured role counts, then lets the host correct seats before starting. A fresh game starts from the first seat.

The top of role configuration offers **Random roles** or **Host assigns**. Every role count is configurable, except there must be at least one actual Mafia. Remaining players become villagers/Proja. The Mafia team (including Betrayers) must begin in the minority.

In manual mode the host selects one role per named player. The app blocks incomplete assignments and counts that do not match the configuration. Roles are assigned only when the host locks the game, and remain fixed after saving or reopening.

## House rules

| Stable role | Bengali | English | Team / ability |
| --- | --- | --- | --- |
| MAFIA | ঘাতক | Mafia | Mafia team; night attack |
| DOCTOR | রাজবৈদ্য | Doctor | Village; protect one person each night |
| POLICE | সেনাপতি | Police | Village; investigate through the host |
| VILLAGER | প্রজা | Villager | Village; discussion and voting |
| BETRAYER | মীরজাফর | Betrayer | Optional Mafia teammate; counts at parity |
| ASTROLOGER | জ্যোতিষী | Witch | Optional villager; immune to Mafia night attacks, vulnerable to votes |
| BODYGUARD | পেয়াদা | Spy | Optional villager; protection resolved by the host |

The host narrates night actions, protection and voting in person. Elimination controls distinguish a night attack from a vote-out and block night attacks on Jotishi/Witch. The host can restore a player to correct a mistake.

The village can win once all actual Mafia are eliminated. A surviving Betrayer cannot continue night attacks alone. The Mafia team can win by reaching parity with the others. The app suggests the outcome; the host confirms.

Before a village victory, the Mafia team may make **one shared final Police/Senapati guess**. Any actual Police player counts, alive or eliminated. A correct guess flips the result to a Mafia win. A wrong or skipped guess preserves the village win. With no Police configured, the guess step is skipped. The guess screen shows names without roles or role-specific avatars; victory points are awarded only after the guess is resolved.

## Points and rankings

- Mafia team victory: each Mafia and Betrayer receives **3 points**.
- Village victory: each Doctor/Rajboiddo and Police/Senapati receives **2 points**, with no investigation-success condition.
- Other winning villagers receive **1 point each**, including Jotishi/Witch and Peyada/Spy.
- Eliminated players on the winning team also receive points.
- Victory points add to the host’s manual points **once**. Results show the automatic award separately; reloading cannot award it again.
- The host can open the ranking sheet during any round to record points and plan notes. Ties share competition ranks (1, 1, 3). Rematches start with fresh points.

## Other features

Private role handoffs, salted PBKDF2 host passwords, saved/resumed games, a 1–30 minute discussion timer, a permanently light palette, and a remembered universe choice. The browser caches both worlds after its first successful load; HTTPS or localhost is required for secure browser features.

The public interface has no developer credit or technical connectivity slogans. Quotes carry author/work credits and source links. See [literary sources](design/LITERARY-SOURCES.md) and [generated-art prompts](www/assets/PROMPTS.md).

## Android build

Android source is included; a compiled APK is not included. Android compilation and device behavior require verification with the Android SDK.

1. Install Android Studio, Android SDK Platform 35, JDK 17 and Gradle **8.9** (the project pins Android Gradle Plugin **8.7.3**).
2. From `android`, run `gradle wrapper --gradle-version 8.9` to generate a wrapper, or configure Android Studio to use your local Gradle 8.9 installation. The standard wrapper is not included in this repository.
3. Open the `android` directory in Android Studio and let Gradle sync.
4. Run on a connected phone or choose **Build → Build App Bundle(s) / APK(s) → Build APK(s)**.
5. The debug APK appears at `android/app/build/outputs/apk/debug/app-debug.apk`.

The Android project packages `www` directly, supports Android 8.0+ with an updated System WebView, uses portrait orientation, blocks screenshots/recent-app previews and keeps the screen awake during play. Internet/network permissions enable its local hotspot HTTP server; it uses no cloud room service. Host credentials and game data use WebView local storage with Android backups disabled. The UI lock protects normal pass-the-phone use; someone with developer tools or app-storage access can inspect saved roles. Browser screenshots cannot be blocked.

Toolchain reference: https://developer.android.com/build/releases/agp-8-7-0-release-notes

## Verification

Automated tests cover all supported standard configurations, custom counts, manual assignments, seat insertion/reordering, counterclockwise order, last-Mafia rematches, immunity, team parity, final guesses, exactly-once awards, saved-state migration, passwords, timers and ranking ties.

Browser checks verified manual assignments across ten players, counterclockwise handoffs, a rematch starter after seat reordering, Witch vote-out/restore and blocked night attacks, a correct final Police guess, a Mafia victory with preserved manual points, saved results without duplicate awards, and the next rematch’s last-Mafia starter.

## Presentation and interaction

- Seating now uses a dotted drag grip with insertion ordering, touch/pointer handling, edge auto-scroll, and keyboard lift/move/drop/cancel support. Orders save on drop; cancelling restores the original list.
- Hero art is shown at its full natural proportions with no arch, clipping mask, decorative border or cropped frame.
- The former language control is a universe picker. Only Mosnod and Sicily are offered. Mosnod’s built-in interface uses Bengali; Sicily’s uses English. Player-entered names and notes remain exactly as entered. A world change keeps game state and manual assignments.
- Both worlds always use light colors, including install metadata and the Android system-bar palette. The former theme button is an extensible menu containing existing relevant game actions.
- The Bengali story, character copy and explanatory guidance use original rhythmic court satire. The rotating short Ray excerpts remain clearly credited. The Sicilian hero uses original writing about loyalty, favors and power; its Puzo quotation remains separate and credited.
- Browser verification covered pointer dragging, keyboard movement and cancellation, saved order after reload, preserved rematch starter, a script-pure home screen for each world, the picker/menu, and uncropped hero proportions.

## QR multiplayer (version 1.5)

Open **Menu → Play on separate phones**, or `/room.html`. The top-right universe picker offers **Mosnod** and **Sicily**, with the same ensemble illustrations, light navy/cream/sage/tan gradients, literary credits, and private illustrated role cards as the single-phone game. The host can change the entire room’s universe without changing roles, scores, or the timer. Players’ names and notes are preserved verbatim.

### Playing on phones

1. On an Android phone with the built app, turn on its hotspot in system settings. Open QR mode and create a room. Keep this phone and the app open throughout the game.
2. Connect every player’s phone to that hotspot. Choose the hotspot’s address in the invitation panel, then scan its QR with each phone’s camera. This is a room-invitation QR; hotspot connection happens first in the phone’s Wi-Fi settings.
3. Each guest enters a unique name. Guests use their normal browser; no installation is needed, including on iPhone.
4. With 5–20 players, the host configures role counts, chooses automatic or manual assignment, and deals roles. Each phone gets only its own role and personal rank, points, notes, and timer. Role cards start hidden, hide with another tap, and hide on blur/backgrounding.
5. The host runs night/vote eliminations, restores mistakes, records scores and plan notes in styled sheets, and controls the shared discussion timer. A host-only role inspection in a score sheet supports resolving night investigations; this information is never broadcast to other players and closes on backgrounding.
6. **Make host** transfers controls immediately and notifies the room. The original hotspot/server device remains the connection point even after transferring the facilitator role. Other phones keep their roles and sessions.
7. The final Police/Senapati guess is shared across actual Mafia players. The first accepted guess resolves the result. Host skip and exactly-once victory awards use the same house rules as single-phone mode. Rematch keeps connected players and host, but resets roles and points.

### Browser development preview

Run `npm start` on a computer connected to the same hotspot or local Wi-Fi. The server binds port **5173** on the computer. Create the room at `http://localhost:5173/room.html`; its invitation uses the computer’s LAN address, discovered by `/api/network`. This computer is the connection point for the browser preview. A static browser page alone cannot start a phone hotspot server; the Android source includes that transport.

Updates use authenticated requests every 700 ms, plus a local clock synchronized to the authority’s deadline. Reconnecting with the same browser storage restores the same player, role, and score. Lost connections hide exposed cards and show a reconnecting state. Local in-page notifications announce role assignment, host/world changes, results, and timer expiry. Rooms live in server memory, expire after six hours without activity, and close if the server/app is killed. Use a trusted local network: LAN transport is HTTP, not encrypted.

### Verification and limits

- `npm test`: game rules, private projections, host authorization/revocation, universe changes, final guesses, immunity, scoring, rematches, timers, and seating.
- `npm run check`: syntax checks for all application and server modules.
- `npm run test:lan`: real HTTP clients test joining, role privacy, host transfer, timer, inspection permissions, origin checks, and static routes.
- Browser QA: five-player table with separate host/player origins, both universes, manual deal, tap-to-hide, shared timer, score/plan sheet, host handoff, session recovery after reload, both final-guess results, Jotishi night immunity, vote-out/restore, and rematch.
- The displayed QR was decoded from the actual browser screenshot with macOS Vision and matched its invitation URL.
- Phone layouts verified at 414 px. Active art is limited to the two worlds; 19 old design/preview files (28.9 MiB) were removed.
- **Android APK compilation and physical hotspot-device testing are still required.** This machine has Java 11 and no Android SDK; the project requires JDK 17 and SDK 35. Native hosting must remain in the foreground, and some hotspot/router configurations isolate clients.

The QR encoder is vendored under `www/vendor`, with its MIT license. No npm installation or third-party QR service is required to run the game.

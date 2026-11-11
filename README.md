# মাফিয়া — Mafia Host

A Bengali, offline, pass-the-phone Mafia host app based on Shoyaeb's specification. Includes a responsive browser app and an Android WebView shell that bundles the same interface without requiring internet permission.

## Preview now

Requires Node.js 20 or newer. No npm dependencies are needed.

```sh
npm start
```

Open http://localhost:5173. Use `npm test` for engine tests and `npm run check` for JavaScript syntax checks.

## Build for your Android phone

This repository contains Android source, not a compiled APK. Android compilation and device behavior have not been verified on this computer because Android SDK, Gradle and Android Studio are absent.

1. Install Android Studio and Android SDK Platform 35, with JDK 17.
2. Use Gradle **8.9**, compatible with the pinned Android Gradle Plugin **8.7.3**. If needed, install Gradle 8.9 and run `gradle wrapper --gradle-version 8.9` from the `android` folder to generate the standard Gradle wrapper. The wrapper is not included in this repository.
3. Open the `android` folder in Android Studio. Configure its Gradle distribution as the generated wrapper or a local Gradle 8.9 installation. Let Gradle sync and download build dependencies.
4. Connect an Android phone with USB debugging enabled and click Run, or use **Build → Build App Bundle(s) / APK(s) → Build APK(s)**.
5. The debug APK is created at `android/app/build/outputs/apk/debug/app-debug.apk`. Transfer and install it on your phone.

The Gradle project packages `../www` directly as assets: changes to the web interface automatically go into the next Android build. Android 8.0+ is supported by the project configuration; use an updated Android System WebView.

Toolchain compatibility: https://developer.android.com/build/releases/agp-8-7-0-release-notes

## Included

- Bengali UI, responsive layouts, custom illustrated midnight city and Mafia character.
- 5–20 players; add, edit and remove names; trim and case-insensitive duplicate checks.
- Mafia count limits and live role counts; one doctor and one police officer.
- Rejection-sampled cryptographic random values and Fisher–Yates role shuffle.
- Salted PBKDF2 SHA-256 host password hashing; no plaintext password saved.
- One-player role reveal and immediate hiding on handoff; hidden again when focus is lost.
- Host unlock, rounds, elimination confirmations, restore and alive/dead counts.
- Suggested wins, continue-playing banner, manual winner selection, result screen and rematches.
- Local save after important changes. Reload opens home; resume returns to the saved setup/reveal step or asks for host password.
- Offline service worker for the browser edition after its first successful load.
- Android portrait orientation, secure screenshot/recent-app protection, native back handling and screen-awake control.

## Privacy and platform notes

The Android application requests no internet permission, uses bundled assets under a secure local origin, disables Android backups, and blocks external WebView navigation. `FLAG_SECURE` is always enabled, including on setup screens, to keep recent-app previews protected. Password and game data are stored in WebView local storage, not Room; the UI lock is intended for sharing a phone during an in-person game. A person with developer tools or access to app storage can inspect saved roles. The browser edition cannot prevent screenshots; that control is Android-only.

All screens use the system Bengali font fallback (including Noto Sans Bengali where available); no remote fonts or image dependencies are requested. The browser's install/home-screen behavior depends on the browser. Use HTTPS when hosting the browser edition: Web Crypto and service workers require a secure context (localhost also works). An HTTP LAN URL is not sufficient for phone gameplay. The Android build works entirely offline after installation.

## Validation

Automated tests cover name validation, all valid player/Mafia configurations, role counts, initial minority, player identity, citizen wins, parity/majority wins, restore behavior and salted password hashing. Syntax checks cover the app, game engine and service worker.

The browser walkthrough verified a five-player setup, configuration, password lock, every player handoff, host unlock, round confirmation, elimination, citizen-win suggestion and final results. Android compilation, installation, lifecycle behavior and screenshot protection require an Android device/emulator validation pass.

## Files

- `www/app.js`: screens, persistence, interactions and privacy lifecycle.
- `www/engine.mjs`: role allocation, validation, win checks and password derivation.
- `www/style.css`: desktop and phone layouts.
- `android/`: Android Studio project.
- `server.mjs`: dependency-free development server.
- `tests/engine.test.mjs`: game-rule tests.

## Version 1.1 additions

- The top-right sun/moon switch changes between warm light mode and midnight dark mode; the বাংলা/EN control switches the whole UI between Bengali and English. Both preferences persist locally, and changing either keeps your current form input.
- The host panel includes a 1–30 minute discussion countdown with start, pause, resume and reset. The saved deadline continues while the host panel is locked or the app is backgrounded. A visible time-up message appears at expiry. Round changes do not restart the timer automatically.
- **Scores & rankings** opens a host-only sheet during any round, even before round one; it is also available with the final results. Assign each player integer points from -9999 to 9999 and add a plan/play note of up to 500 characters. Ranking follows score, includes eliminated players, and uses shared competition ranks for ties (1, 1, 3). Scores and notes save immediately; rematches reset them.
- Four locally bundled Bangladeshi cartoon avatars appear in the role catalogue, private reveals, host roster and ranking sheet. Role-specific player avatars appear only after roles are revealed or inside authenticated host screens. Full generation prompts are in `www/assets/PROMPTS.md`.
- Existing v1 saved games receive a default discussion timer and zero scores when loaded.

The Android source uses the same updates, including theme-aware system bars. APK compilation/device testing still requires the Android toolchain described above.

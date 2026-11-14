# শীতলপাটি

> এসো, বসো আমার উঠানে...
> বুক ভরে নাও শ্বাস।
> শীতল পাটি বিছিয়ে দিবো-
> তালপাখার বাতাস।

A collection of Bangla party and board games for one phone or many. The home page is a moonlit village courtyard during loadshedding; tap the hanging hurricane lamp to light it.

**Play:** [mafiagame-tau.vercel.app](https://mafiagame-tau.vercel.app) · **Android app:** [Shitolpati.apk](https://github.com/moontasir-me/MafiaGame/releases/download/apk-latest/Shitolpati.apk)

## Games

| # | Game | Players | Offline | Computer | Online |
|---|---|---|---|---|---|
| ০১ | **Mafia** — social deduction with a host | 5–20 + host | ✓ | | ✓ |
| ০২ | **Spy** — find the one without the word | 3+ | ✓ | | |
| ০৩ | **কহেন কবি কালিদাস** — Bangla riddles, three levels | 1+ | ✓ | | |
| ০৪ | **পেন ফাইট** — flick pens off a school bench; shop for add-ons with coins | 1–4 | ✓ | 3 levels | ✓ |
| ০৫ | **Fibonacci** — quick maths quiz, four levels, timer or three-heart mode | 1–8 | ✓ | | |
| ০৬ | **চতুরঙ্গ** — chess on grandfather's board | 2 | ✓ | 3 levels | ✓ |
| ০৭ | **চোর ডাকাত পুলিশ বাবু** — four folded chits | 4 | ✓ | | |
| ০৮ | **লুডু** — classic ludo or সাপ লুডু, seats on four sides | 2–4 | ✓ | 3 levels | ✓ |
| ০৯ | **ক্যারম** — real board physics, queen, fouls, boric powder | 2 | ✓ | 3 levels | ✓ |
| ১০ | **জায়গা দখল** — dots and boxes on a khata page | 2–4 | ✓ | 3 levels | ✓ |
| ১১ | **তিন গুটি** — three pebbles each on a board scratched into the courtyard | 2 | ✓ | 3 levels | ✓ |

The **অফলাইন / অনলাইন** switch on the home page decides which version opens. Online, only games with an online room are active.

## Accounts, ranking, profile

- **Accounts** are just names, saved on the phone; several can live on one device. Every game offers them as quick chips.
- **Ranking** collects every finished match per game and overall, with a hall of fame. Deleting an account removes its results.
- **Profile** (the name button on the home page) holds your online name and photo, ranking, saved accounts, sound and the APK download.

## Online rooms

One person opens a room and shares the code; others type it into the code boxes (5 letters, Mafia 6). Your profile name is used everywhere.

- Rooms live in Neon Postgres behind the Vercel API (`/api/table` for the board games, `/api/*` for Mafia).
- লুডু, চতুরঙ্গ, জায়গা দখল and তিন গুটি are checked move by move on the server; পেন ফাইট and ক্যারম run physics on the shooter's phone and share the result.
- A room is deleted 2 hours after its last action, 10 minutes after the game ends, or at once when the host closes it.
- Setup: connect Neon to the Vercel project and set `DATABASE_URL` (server only, never committed). See [design/VERCEL.md](design/VERCEL.md).

## Android app

Every push to `main` runs [.github/workflows/apk.yml](.github/workflows/apk.yml): it builds a signed release APK, deletes the previous one and publishes the new build at the same link. Version codes rise with each build, so updates install over the old app and keep its data. The app packages `www`, and its online games talk to the live site.

The signing key `android/app/shitolpati.keystore` is in the repo so every build shares one signature; its password can be overridden with `APK_STORE_PASSWORD`. APK files are never committed.

Local build (JDK 17, Android SDK 35): `cd android && ./gradlew assembleRelease`. Delete the APK afterwards.

## Development

Node.js 22+.

```sh
npm ci
npm start        # http://localhost:5173, with in-memory online rooms
npm test
npm run check
```

All pages are plain ES modules in `www/`; game rules live in their own testable modules (`ludo-engine.mjs`, `shotoronji-engine.mjs`, `carrom-physics.mjs`, `dots-engine.mjs`, `pen-physics.mjs`, …). The service worker caches everything for offline play; bump its cache name when files change.

## Mafia notes

The host runs the game and holds no role. Points: Mafia win — Mafia 3, Betrayer 2; village win — Doctor and Police 2, other villagers 1; host 1 per finished game. Before a village win the Mafia get one shared guess at the Police. Worlds: Polashi, Sicily and Classic, each with its own cast. See [literary and historical sources](design/LITERARY-SOURCES.md).

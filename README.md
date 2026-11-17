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
| ১২ | **Colour Rush** — English colour-matching card game, Classic or Ruthless rules | 2–20 online, 4 offline | ✓ (vs 3 bots) | 3 bots | ✓ |

| ১৩ | **ধনী হবার মজার খেলা** — Bangladesh property trading, auctions, building and deals | 1–6 offline, 2–6 online | ✓ | ✓ | ✓ |

The **অফলাইন / অনলাইন** switch on the home page decides which version opens. Online, only games with an online room are active.

## Dhoni Hobar Mojar Khela

Choose **Online**, open **ধনী হবার মজার খেলা**, and create a room. Share the join link, five-character code, or QR with friends; each person joins on their own phone. Any internet connection works. The room owner plays too and chooses a 30, 45, 60 minute game or no time limit.

For iPad, choose **Offline** and open the same game. Set 1–6 human seats and optional computer opponents (2–6 seats total). Play pass-and-play on one iPad or alone against computers. The board and controls adapt to portrait, landscape and split-screen widths. During auctions, select the human bidder; trade offers must be reviewed by the recipient. Local games autosave, pause when the app is hidden, and restore paused so time never runs while the app is closed. Open the site once online to cache the game before disconnecting; Safari’s Add to Home Screen also works.

The original 32-space Bangladesh board uses game taka and locations from Old Dhaka to Cox’s Bazar. Dice, purchases, auctions, rent, even building, mortgages, consensual trades, jail, bankruptcy, turn deadlines and results are validated on the server. Shared rooms use the existing Neon/Vercel backend; no extra services or secrets are needed. Bangla and English follow the profile language setting. A finished game records points on participating devices; the room owner can return everyone to a lobby for the next game.

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

## Mixed offline tables and consecutive Spy cases

Ludo (including Snake Ludo) and Dots & Boxes now let you choose human and computer counts together, within four total seats. Name every human; computer difficulty remains configurable. Pen Fight’s computer mode allows up to three people alongside its computer, preserving each person’s pen and account. Colour Rush supports 2–4 total human/computer seats, including an all-human table. Human cards stay out of the page between turns and while computers play; a named handoff screen opens the next hand only after confirmation. Completed games record every human’s ranking points.

When a Spy is caught by a confirmed vote, the case ends and points are recorded once. The result stays visible for five seconds, then a fresh word and new roles are dealt, starting the phone order from the caught Spy. “ফল দেখে থাকুন” pauses automatic progression for reading scores. Automatic progression also pauses in background tabs, menus and other sections. Existing match scores continue across cases; the match can still be finished and saved manually.

## Welcoming day/night update

The small controls beside the menu switch Bangla/English without restarting a game, toggle daylight/lantern night, and end the current game back at its own setup screen. Colour Rush continues to use English. Hidden words and dealt cards retain their identities when the UI language changes. Online/offline preference no longer blocks opening games that only use one device.

Pen Fight supports tap-to-aim and a pulsing strength button, with a manual power slider; dragging a pen remains available. Dhoni uses Dhaka locations, proper pip dice, house/hotel pieces and an independent scrolling information panel next to the board on tablets and desktops.

**Baghaduli** plays five marbles per round on a simulated sloped peg board; the red pocket ends that round with zero round points. **Poker** is offline Texas Hold’em for 2–6 seats, with friends, computers, private-card handoffs, blinds, legal raises, side pots and split pots. Both use the same cartoon tea-stall illustration style and save their games locally.

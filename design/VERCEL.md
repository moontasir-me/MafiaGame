# Vercel + Neon online multiplayer

1. In the Vercel project, open Storage → Create Database → Neon. If it is listed under Marketplace, choose Neon there. Connect the database to this project for **Production** (and Preview if wanted). Choose a database region close to the Vercel function region and your players.
2. Confirm the integration added **DATABASE_URL** in Project Settings → Environment Variables. POSTGRES_URL is also accepted as a fallback. The connection must have read/write and table-creation permissions. Never add this URL to browser code or paste credentials into chat.
3. Deploy the latest main branch. The checked-in configuration installs dependencies, publishes www, and routes /api/* to a Node Vercel Function. Leave Root Directory at the repository root. An old dashboard build/install override may need resetting to the repository configuration.
4. Open /room.html on the deployed HTTPS domain. The first request initializes the private mafia_rooms and mafia_rate_limits tables automatically. No SQL-editor step is needed. Existing unrelated tables are not changed.
5. Create a room, choose a universe, and share its invitation or scan the QR from another phone. Phones can use mobile data, different Wi-Fi networks, or different locations. A Vercel Preview URL must be accessible to guests; use the public production URL for a friend circle.

## Behavior

- Host remains a separate non-player and changes only by explicit handover. Online rooms do not depend on the original phone staying awake/open. Anyone can return through the same browser, whose private session token is saved locally.
- Each player receives only their own current role. Only the host can inspect exact roles, change universe, deal, score, or eliminate. Everyone sees live vote totals. Confirmed public eliminations reveal only Mafia/Villager.
- Updates poll about every 1.5–2 seconds; background tabs poll less frequently. Discussion uses a server deadline, so it survives reloads and cold starts. The expired timer turns red.
- Neon persists each room. Atomic revision-checked updates retry safely when players act together. Request receipts prevent duplicate joins/votes/result actions; stale round confirmations cannot advance a newer round. Final scores and host points are committed together, once.
- Successful activity renews a six-hour room expiry. Expired room data is deleted during later room creation. Completed histories and profile scores are also kept in browser storage for future rooms. Browser storage clearing loses that browser's identity/session; reopening an invitation alone cannot recover a lost secret token.
- SQL state includes secret roles and session credentials: keep DATABASE_URL server-only and database access private. The browser never connects directly to Neon. API responses are not cached and cross-origin browser requests are rejected. New-room/join attempts are rate-limited.
- Function-local caches avoid repeatedly downloading all room photos from PostgreSQL, but every read checks the database revision first. Caches are not authoritative.
- The existing Android/native and local Node hotspot modes remain separate and continue to work without the cloud database. An old APK is not changed by this web deployment; open the HTTPS website for online rooms.

## Verification

Check GET /api/network: it should return mode online and available true. A missing DATABASE_URL returns available false; an invalid connection or denied database permissions returns BACKEND_UNAVAILABLE without revealing credentials. After changing environment variables, redeploy.

The application initializes tables using an advisory lock so simultaneous cold starts do not race table creation. Run npm test, npm run check, and npm run test:lan before deployment. The online tests cover separate serverless instances, concurrent votes, join retries, duplicate results, host handover, private role projections, body/origin restrictions, and rate limits.

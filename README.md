# وێنە بکێشە · WÊNE BIKÊŞE

A real-time multiplayer **draw & guess** game for Kurdish (Sorani) speakers. One player draws a secret Kurdish word, everyone else races to guess it in the chat. It's built mobile-first, with a right-to-left Kurdish interface (English is optional).

- **Frontend:** React 19 · TypeScript · Vite · Tailwind CSS 4 · Motion · HTML Canvas
- **Backend:** Node.js 22 · TypeScript · Express 5 · Socket.IO 4 · SQLite (built-in `node:sqlite`)
- **Server-authoritative:** timers, turns, word choice, guess checking, scoring and drawing permissions all run on the server.

---

## Features

| Area | What's included |
| --- | --- |
| Rooms | Quick play (public matchmaking with a 15 s auto-start), private rooms with 6-character codes, invite links (`/?room=CODE`), native share sheet, 2–12 players, host badge, ready status, host-only settings, kicking, automatic host migration |
| Settings | Rounds 2/3/5/8 · draw time 60/80/100/120 s · max players · difficulty Easy/Medium/Hard/Mixed · categories · custom word packs (optionally custom-only) · letter hints |
| Turns | The artist picks 1 of 3 words. A word is picked automatically after 15 s. Guessers see blanks, and up to two letters are revealed at 50 % and 75 % of the time. The turn ends early once everyone has guessed. Round results and final podium |
| Drawing | Smooth strokes, 18 colours, 5 brush sizes, eraser, flood fill, undo/redo (Ctrl+Z / Ctrl+Y), clear, mouse/touch/pen. All clients share a fixed 1200×900 logical canvas, so drawings look the same on every screen |
| Guessing | Kurdish-aware normalisation, near-miss ("زۆر نزیکی!") shown only to the guesser, and correct answers are never broadcast. Players who already guessed chat in a private channel. The artist cannot type the word |
| Scoring | Guessers get 500 → 100 points depending on remaining time. The artist gets up to 400 points, in proportion to how many players guessed |
| Social | Live chat, 8 Kurdish-themed reactions (بژی!، دەستخۆش، چایەک!…), confetti, mute and report players, online count |
| Kurdish identity | Optional scenes (mountains, Newroz, village, bazaar), a kilim-style diamond motif, and avatar accessories (Newroz flower crown, jamana scarf, headscarf…) |
| Accessibility | Light/dark/system themes, reduce-motion toggle, sound toggle, on-screen Sorani keyboard, Eastern Arabic numerals in Kurdish mode |
| Reliability | Auto-reconnect, reload-safe sessions (`sessionStorage`), 60 s disconnect grace, game state and canvas restored on rejoin, duplicate-tab detection, idle room expiry |
| Admin | `/admin`: approve/reject/edit/delete words, bulk actions, CSV import/export, categories, reports, blocked terms, statistics |

Sound effects are made on the fly with the Web Audio API, and all artwork is original SVG. No third-party audio or images are used.

---

## ⚠️ About the word list

The repository ships with an **81-word demonstration list** (`server/src/data/demo-words.ts`) of common Sorani words. **It has not been reviewed by a native-speaker editor.** Each entry is seeded with status `pending` and source `demo`.

- In **development** (`ALLOW_UNREVIEWED_WORDS` defaults to `true`), pending words can be played so the game works out of the box.
- In **production** (`NODE_ENV=production`) only **approved** words are used. Review the list in **Admin → Words**, approve the correct entries, and add your own. Until at least one word is approved, starting a game shows "no words available".

Players can suggest words (Settings → Suggest a word). These arrive as `pending` and need an admin to approve them.

---

## Quick start (development)

Requirements: **Node.js ≥ 22.13** (for the built-in `node:sqlite`).

```bash
npm install
cp .env.example .env            # optional in development
npm run hash-password           # optional: prints ADMIN_PASSWORD_HASH=... for .env
npm run dev                     # server on :3001, Vite client on :5173 (proxies /api and /socket.io)
```

Open http://localhost:5173. To play against yourself, open a **second tab or a private window**. Each tab is a separate player, because session tokens live in `sessionStorage`.

To play on your phone on the same Wi-Fi, open `http://<your-computer-ip>:5173`.

### Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Server (tsx watch) + client (Vite) |
| `npm run build` | Builds `client/dist` and `server/dist` |
| `npm start` | Runs the built server, which also serves `client/dist` |
| `npm test` | Server unit and Socket.IO integration tests (Vitest) |
| `npm run typecheck` | `tsc --noEmit` for server and client |
| `npm run hash-password` | Creates a scrypt hash for `ADMIN_PASSWORD_HASH` |

---

## Environment variables

See [`.env.example`](.env.example). Key ones:

| Variable | Purpose |
| --- | --- |
| `SESSION_SECRET` | **Required in production** (≥ 32 chars). Signs admin session cookies. The server refuses to start without it |
| `ADMIN_PASSWORD_HASH` | scrypt hash from `npm run hash-password`. If it is unset, admin login is disabled. Plain passwords are never stored |
| `DATABASE_PATH` | SQLite file (default `./data/wene.sqlite`) |
| `ALLOW_UNREVIEWED_WORDS` | Lets pending/demo words appear in games. Default: `true` in dev, `false` in prod |
| `CORS_ORIGINS` | Comma-separated allowed origins, only needed when the frontend is hosted separately |
| `TRUST_PROXY` | `true` behind a reverse proxy, so per-IP rate limits use `X-Forwarded-For` |
| `VITE_SERVER_URL` | Client build-time setting: backend URL when the frontend is hosted separately |

Only `VITE_*` variables reach the browser bundle. No secrets are exposed to the frontend.

---

## Deployment

### Option A — single service (recommended)

The Node server serves the built client, so everything runs on one origin. WebSockets, cookies and CSP then work with no CORS setup.

```bash
npm ci && npm run build
NODE_ENV=production SESSION_SECRET=... ADMIN_PASSWORD_HASH=... npm start
```

**Docker:**

```bash
docker build -t wene-bikeshe .
docker run -p 3001:3001 -v wene-data:/data \
  -e SESSION_SECRET=$(openssl rand -hex 32) \
  -e ADMIN_PASSWORD_HASH='scrypt$...' \
  wene-bikeshe
```

Any host that supports persistent WebSocket connections and a persistent disk works, such as Render (`render.yaml` included), Fly.io, Railway or a VPS. Put it behind HTTPS (the platform's TLS, or Caddy/nginx) so the browser uses `wss://`, and set `TRUST_PROXY=true` behind a proxy. Mount a volume for `DATABASE_PATH`.

### Option B — static frontend + separate backend

1. Deploy the backend as above, with `CORS_ORIGINS=https://your-frontend.example`.
2. Build the client with `VITE_SERVER_URL=https://your-backend.example npm run build -w client`, then upload `client/dist` to Netlify, Vercel, Cloudflare Pages or similar. Invite links use `?room=` query strings, so no SPA rewrites are needed for the game.
3. Use the admin dashboard at `https://your-backend.example/admin`. Admin cookies are `SameSite=Strict` and scoped to the API origin.

### Scaling note

Active rooms live in memory in one Node process, which handles many concurrent rooms. To run several instances you would need sticky sessions plus a shared room store (for example Redis with `@socket.io/redis-adapter` and moving room state out of process). The `RoomManager` is the seam where that would go. **Redis support is not implemented.**

---

## Testing

```bash
npm test
```

**40 automated tests** (Vitest), all passing:

- `normalize.test.ts`: Arabic→Kurdish variants (ي/ى→ی, ك→ک, ھ→ه, ة and legacy ه+ZWNJ → ە), combining-mark spellings of ێ ۆ ڵ ڕ, removal of tatweel, harakat and bidi marks, **distinct Kurdish letters never merged** (ە≠ه, ێ≠ی, ۆ≠و, ڕ≠ر, ڵ≠ل…), near-miss detection, Latin nickname case preserved.
- `scoring.test.ts`: time-based guess points, artist bonus, hint counts, word selection (one word per difficulty in Mixed, difficulty/category filters, avoids repeats, custom-only packs).
- `room.test.ts`: host/start rules, duplicate nicknames, capacity, **turn rotation over rounds**, **choose-timer auto-pick**, **draw-timer expiry**, scoring once per player, early turn end, the artist can't guess or reveal the word, near-miss privacy, spam, **secret-word privacy** (no message to a guesser contains the word or the choices), **drawing authorization and op validation**, undo/redo, canvas restore for late joiners, **reconnection within grace**, removal after grace, **host migration**, artist leaving, fallback to lobby, kick bans, late joiners.
- `integration.test.ts`: real Socket.IO clients against the real server: create/join, start, choose, draw relay, wrong/correct guesses, **no leak of choices or word in any event before the guess**, bad codes, full rooms, bad names, host-only settings, **reconnect with the same session plus duplicate-tab replacement**, quick-play matchmaking, admin route protection.

**Browser end-to-end** (`e2e/two-players.cjs`, Playwright, two separate browser contexts: desktop Chromium and an emulated phone):

```bash
npm run build && npm start &               # or npm run dev and BASE_URL=http://localhost:5173
node e2e/two-players.cjs                   # optional: ADMIN_PASSWORD=... to also test the admin login
```

It plays a full 2-round game (4 turns): joining via the invite link, drawing with mouse/touch, a near-miss and a correct guess each turn, **reloading the guesser's page mid-turn** (the game and canvas are restored), the final podium, play-again, the English UI and settings, and admin login/approval. Screenshots go to `e2e/screenshots/`.

### What was and wasn't tested

- ✅ Everything above, run in this environment: headless Chromium with desktop and emulated mobile (iPhone 13 / Pixel 7 profiles), on one machine. Both browser contexts rendered pixel-identical canvases, and no page or console errors occurred.
- ❌ Not tested: real phones and real mobile keyboards (iOS Safari keyboard/viewport behaviour in particular), real slow or lossy networks, more than 3 simultaneous players in a browser, load testing, the Docker image build, and an actual cloud deployment.
- ❌ The Kurdish vocabulary and interface translations have **not** been reviewed by a native-speaker editor.

---

## Project structure

```
shared/src/          protocol types, constants, Kurdish normalisation (used by both sides)
server/src/
  game/Room.ts       server-authoritative room state machine (turns, timers, guesses, drawing)
  game/RoomManager   room registry, matchmaking, expiry
  game/scoring.ts    points & hints        game/words.ts   word picking
  socket.ts          Socket.IO event handlers, validation (zod), rate limits
  admin/             admin auth (scrypt + HMAC tokens), REST API, CSV import
  db.ts              SQLite schema, demo seed, statistics
  data/demo-words.ts demonstration vocabulary (unverified)
server/test/         unit + integration tests
client/src/
  screens/           Home, Lobby, Game, Final, Settings/How-to modals
  game/              Canvas + renderer (flood fill), chat, player list, overlays
  components/        UI kit, SVG avatars, logo, scene backdrops, Kurdish keyboard
  lib/               socket client & state, i18n (ckb/en), prefs, sound synth
  admin/Admin.tsx    admin dashboard
e2e/two-players.cjs  Playwright two-browser game run
```

## Security summary

- Every socket event is validated with zod schemas and checked against room state: host-only actions, artist-only drawing, palette and brush whitelists, coordinate bounds, op and point limits.
- Guessers never receive the secret word or the choices. Views are built per player, and correct guesses are not broadcast.
- Rate limits cover connections, room joins per IP, chat, drawing, reactions, reports, word suggestions and admin login.
- Chat and names are length-limited and stripped of control and bidi-override characters, and rendered as text (no HTML injection). Blocked terms reject names and mask chat.
- The admin uses a scrypt password hash, HMAC-signed `HttpOnly; SameSite=Strict` cookie (`Secure` in production), CSRF header check, and a login rate limit.
- Security headers: CSP, `X-Frame-Options`, `nosniff`, `Referrer-Policy`. CORS is closed by default in production.

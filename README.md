# GrowthOS

GrowthOS is a personal development app built around a simple daily loop: plan a few priorities, practise them, and reflect without self-punishment.

## Implemented so far

Phase 1 provides the React 19/Vite client, Redux Toolkit for client-only state, TanStack Query with IndexedDB persistence for API state, light/dark/system themes, responsive app layouts, cookie-based authentication, and an Express/Mongoose API base. Phase 2 adds the six identities, starter/custom habits, daily plan, priority and habit check-ins, evening review, study notes, and values moments. Phase 3 adds server-computed overall and per-habit streaks, one weekly recovery day, an idempotent XP ledger, levels, badges, milestone celebrations, and hourly timezone-aware rollover. Phase 4 completes the daily-to-monthly flow with a 30-day journey, monthly reflection, money notes and summaries, growth insights, and a calendar journal.

Account recovery adds email verification during signup and one-time password reset links. Tokens are stored as SHA-256 hashes and expire after one hour; password reset revokes refresh sessions. Resend is the production email provider. When mail is not configured in development, the verification and reset pages display local one-time links for manual testing. Optional morning, evening, and Monday check-in reminders are sent using each account’s saved time zone.

## Requirements

- Node.js 20 or newer
- MongoDB (local or hosted)

## Run locally

1. Copy `server/.env.example` to `server/.env` and set two distinct, random JWT secrets and your MongoDB URI. For delivered verification, password-reset, and reminder email, set `RESEND_API_KEY` and `MAIL_FROM` to a sender configured in Resend. Without these in development, use the local account links shown by the app; reminder delivery stays disabled.
2. In `server/`, run `npm install` and `npm run dev`.
3. In `client/`, run `npm install` and `npm run dev`.
4. Open the Vite URL printed in the client terminal. The Vite development server proxies `/api` to `http://localhost:4000`.

The API health endpoint is `GET /api/health`. When MongoDB is unavailable, the API stays running, retries the connection, and returns HTTP 503 with a clear message for database-backed endpoints. Auth endpoints are under `/api/auth/v1`; profile and settings endpoints are under `/api/user/v1`. Practice modules are under `/api/identity/v1`, `/api/habit/v1`, `/api/checkin/v1`, `/api/dailyPlan/v1`, `/api/review/v1`, `/api/studySession/v1`, and `/api/courageMoment/v1`. Streak and recovery endpoints are under `/api/streak/v1`; XP and badge endpoints are under `/api/gamification/v1`. Phase 4 adds `/api/journey/v1` for the 30-day cycle, `/api/finance/v1` for finance entries and summaries, and `/api/analytics/v1` for trends, practice heatmaps, area scores, and observations. Monthly journey reflections use `POST /api/review/v1/monthly`. On smaller screens, Today, Journal, Journey, Insights, and Finance are available from the bottom navigation; Plan, Habits, Identities, and Settings are in the More menu.

## Environment variables

See [`server/.env.example`](server/.env.example). `RESEND_API_KEY` and `MAIL_FROM` are required in production for verification, password recovery, and reminder emails. `COOKIE_SECURE` should be `true` when serving over HTTPS. The client uses same-origin `/api` requests and httpOnly auth cookies.

For MongoDB Atlas, set `MONGODB_URI` to the cluster's application connection string in `server/.env`. In Atlas, allow the development machine's IP under **Network Access** and use a **Database Access** user in the URI. Keep the URI private and URL-encode reserved characters in its password.

## Project structure

- `client/src/app`: Redux store, query client, providers, and lazy route table.
- `client/src/features`: feature screens and API hooks.
- `client/src/layouts` and `client/src/components`: shared shell and UI primitives.
- `server/src/modules`: route/controller/service/repository/model modules.
- `server/src/config` and `server/src/utils`: environment, database, auth, and shared middleware.

## Deployment

Before deployment, set `VITE_SITE_URL` in the client build environment to the public HTTPS origin (see `client/.env.example`). This generates the canonical URL and absolute Open Graph/X preview image links in the built HTML. Build the client with `npm run build` from `client/` and serve the generated `client/dist` directory from a static host. Run the API with `npm start` from `server/`, set production environment variables, use HTTPS, and configure `CLIENT_ORIGIN` to the deployed client origin.

The client includes a web app manifest and service worker. Serve the static build from the site root so `/sw.js`, `/manifest.webmanifest`, `/icon.svg`, and `/offline.html` are available. The worker caches the offline fallback and static assets; it never caches `/api` responses. Habit check-ins made on an already-open Today screen are stored in IndexedDB as a user ID, habit ID, date, and desired completion state, then synced idempotently on reconnect. Plans and reflections need a connection. Check-ins older than yesterday are kept for review instead of being silently applied to the wrong day.

Users can download a JSON export from Settings or delete their account after confirming their current password. Optional quality measurements are off by default. When enabled, GrowthOS stores daily aggregate counts and summary values for browser errors and LCP/CLS/INP/TTFB; it does not store user identifiers, paths, error text, or practice content. Aggregates expire after 90 days in the `qualitymetrics` collection. Inspect daily totals with a MongoDB query such as `db.qualitymetrics.find({}, { _id: 0 }).sort({ dateKey: -1 })`.

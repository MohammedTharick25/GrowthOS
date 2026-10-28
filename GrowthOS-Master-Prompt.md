# GrowthOS — Master Prompt

> Paste everything below the line into Claude Code / Cursor / any coding AI.
> Tip: tell it to **"complete one phase at a time and wait for my 'continue'"** (Section 12) so output stays accurate.
> Attach `HM-SaaS.zip` (or keep it in the repo) so it can copy the backend module convention.

---

## 0. ROLE

You are a senior full-stack engineer and award-level UI/UX designer. Build **GrowthOS**, a premium, mobile-first personal-development web app (installable PWA) that turns six life identities into a daily practice system with streaks, XP, growth charts and a 30-day journey. It must feel like a high-end native app: smooth, rich, fast, calm.

Product philosophy (reflect it in UX and copy):
- "Your note tells you who you want to become. Your habits teach you how. Your daily actions are the evidence."
- Practise the identity through actions; don't just repeat affirmations.
- Accountability **without self-punishment**: missed days produce gentle "adjust the plan" prompts, never shame, red alarms or guilt copy.
- Start small. Don't force all six areas at full intensity.
- Rest and recovery are part of the system.

---

## 1. TECH STACK (fixed)

**Language: plain JavaScript (ES2022+), no TypeScript.** HTML5, modern CSS, JS.

| Layer | Choice |
|---|---|
| Frontend | React 19 + Vite (JS), React Router v7 |
| Client state | **Redux Toolkit** (auth session, theme, UI state, today's draft/optimistic state, onboarding) |
| Server state | **TanStack Query v5** (all API data, caching, optimistic updates, offline persistence) |
| Styling | Tailwind CSS with a custom design system, reusable React components, and CSS variables for theme tokens. Support light and dark modes. No UI kits.|
| Animation | **GSAP + ScrollTrigger** (scroll storytelling), **Lenis** (smooth scroll), **Framer Motion** (component/route transitions, gestures), CSS 3D transforms for cards. **Three.js** only for the landing hero (lazy-loaded, optional, with CSS fallback). Lottie only for small celebration moments (lazy). |
| Charts | Recharts (lazy-loaded per route) |
| Backend | Node.js + Express (ES modules), MongoDB + Mongoose |
| Auth | JWT access + refresh tokens in httpOnly cookies (same pattern as HM-SaaS: `auth_token`, `refreshToken`) |
| Security | helmet, cors (credentials), express-rate-limit, input validation (Zod), bcryptjs |
| Jobs | node-cron (daily reminders, streak rollover, weekly review prompt) |
| Misc | axios, date-fns + date-fns-tz, react-hook-form, vite-plugin-pwa |

Resolve conflicts like this: Redux + TanStack Query imply React, so React is used; everything else stays vanilla JS/CSS with animation libraries.

---

## 2. THE CONTENT THE APP MUST CONTAIN

### 2.1 Six identities (seed data; user can edit text, not delete areas)

| # | Identity | Qualities to develop | Daily habit (default) |
|---|---|---|---|
| 1 | **Career & Skills** — skilled web developer | Curiosity, Consistency, Patience, Problem-solving, Independence, Adaptability, Attention to detail, Communication | Learn something, practise it, explain what you learned (30–60 min). Weekly: build/improve a real project |
| 2 | **Health & Fitness** — healthy, energetic person | Discipline, Patience, Consistency, Self-care, Balance, Respect for body's limits | One thing to take care of my body (20 min exercise/walk, balanced meal, sleep on time, water) |
| 3 | **Confidence & Self-respect** — someone who trusts himself | Self-awareness, Assertiveness, Courage, Emotional resilience, Self-respect, Self-acceptance | One action that expresses my real thoughts, respects my needs, or faces a manageable fear |
| 4 | **Financial Growth** — financially responsible | Responsibility, Long-term thinking, Self-control, Resourcefulness, Willingness to learn, Risk evaluation | One small step: track an expense, learn a concept, improve portfolio, work toward a career opportunity (review a few times/week) |
| 5 | **Family & Relationships** — care without losing myself | Empathy, Reliability, Honesty, Patience, Communication, Healthy boundaries | One thoughtful thing for someone I care about, while respecting my own needs |
| 6 | **Discipline & Growth** — someone who follows through | Consistency, Patience, Accountability, Flexibility, Self-awareness, Learning from mistakes | Choose three important actions each morning and make a realistic effort to complete them |

Each identity has: name, icon, accent colour, identity statement ("I am becoming…"), qualities list, "how to practise" micro-guides (e.g. the 7-step debugging routine for Career, the 5-step "notice the thought → balanced statement" routine for Confidence, assertiveness phrases, boundary phrases). Show these as swipeable cards in an **Identity Library**.

### 2.2 Daily system (the core loop)

**Morning (5 min) — "Plan"**
1. Read identity reminder (rotating statement).
2. Pick **3 priorities**: Career, Health, Self-respect/Growth (each with a specific text prompt: "What specific skill or project will I work on?", "What will I do to take care of my body?", "What action will help me practise confidence, communication, or discipline?").
3. Tick "Qualities I will practise today": Patience, Consistency, Curiosity, Self-respect, Courage, Responsibility.
4. "If–then" plan card (pre-filled, editable): *If I feel unmotivated → start with a small task. If I make a mistake → understand it, don't insult myself. If I'm afraid to express myself → one manageable step. If I miss a commitment → adjust the plan and begin again.*

**During the day — "Practise"**
- Habit checklist (the 6 default daily habits + user custom habits), each with optional timer (focus timer for study / workout).
- Quick-add: expense, a "courage moment" (one-liner), a "win".
- Study session log: minutes + "what I learned" + "explain aloud" checkbox.

**Evening (5 min) — "Review"**
Six questions: Career (learned/built), Health (cared for body), Self-respect (considered my needs / expressed honestly), Relationships (care + boundaries), Discipline (followed through on most important commitment), Learning (what I'll do differently tomorrow). Plus: *What did I do well? What did I learn? When did I respect myself? What challenged me? One thing to improve tomorrow?* Plus mood (1–5) and energy (1–5) sliders and a "moment I acted on my values instead of fear" field.
Closing line shown after submit: *"I can be a beginner and still be making progress."*

**Weekly Review (Sunday prompt):** one thing that worked, one that didn't, one lesson, one adjustment for next week; auto-shown weekly stats and radar chart.

**Finance mini-module:** log income / essential / optional / saved; weekly "review spending or career progress" reminder; pre-purchase pause question ("Does this support my priorities?"). Keep it simple: no bank integration.

### 2.3 30-Day Journey
Day 1–7 **Awareness**, 8–14 **Consistency**, 15–21 **Confidence**, 22–30 **Integration**. Each phase has a focus + suggested practices and a gentle auto-adjusting target. Day 30 opens a **Month Review** (What have I learned? Which habits became easier? Where am I struggling? Which habits to continue? Next month focus?) and offers to start the next cycle. Starter plan "Your first task for tomorrow": 30–60 min web dev, 20 min activity, one values-moment at night.

Onboarding asks: daily time available (1h / 2h / 3h+) and builds a default timetable (Morning 5m plan → exercise 20–30m → study 60m → opinion/decision → family/self responsibility → evening 5m review). Start with a **Starter mode** (3 habits only) and let the user unlock more areas.

### 2.4 Streaks, XP, badges (gamified but calm)
- **Active day** = at least 1 of 3 priorities completed (configurable 1–3). **Perfect day** = all 3 + evening review.
- **Streak** counts consecutive active days in the user's timezone (default `Asia/Kolkata`). Compute **server-side**.
- **Recovery token**: 1 free "rest/recovery day" per week that preserves the streak (matches the "recovery" principle). Show "streak saved" gracefully; show "welcome back, adjust your plan" after a break instead of "you lost your streak". Track best streak.
- Per-habit streaks plus overall streak.
- **XP**: priority done +10, habit +5, evening review +15, weekly review +30, 30-day phase completion +100. **Levels** with names (Beginner → Builder → Steady → Resilient → Self-trusting → Anchor).
- **Badges** (server-evaluated): First Step, 3/7/14/30/100-day streak, First Perfect Day, 10 Courage Moments, First Project Shipped, 4 Weekly Reviews, 30-Day Journey Complete, Comeback (returned within 2 days after a break).
- Confetti/particle celebration on milestones (respect reduced-motion).

### 2.5 Growth charts (Analytics screen + dashboard widgets)
1. **Consistency heatmap** (GitHub-style, 365 days, intensity = completion).
2. **Streak card** with flame animation: current, best, recovery tokens left.
3. **Six-area radar** (weekly score per identity) with week-over-week comparison.
4. **Weekly completion bar chart** + 30-day trend area chart.
5. **Study minutes** per day (line) with weekly total.
6. **Mood & energy** trend (dual line).
7. **Finance**: income vs spending, savings trend, essential vs optional donut.
8. **Courage/Assertiveness moments** count over time.
9. Insight cards (rule-based, kind tone): e.g. "You're strongest on Mondays", "Health is your lowest area this week; try a 10-minute walk."
Range switcher: 7d / 30d / 90d / all.

### 2.6 Export & offline
- **Today's notebook sheet**: printable/PDF page matching the notebook template ("MY DAILY IDENTITY PRACTICE") so the user can also copy it by hand.
- **CSV / Excel (.xlsx) export** of habit logs, daily plans, reviews, finance (backend with exceljs).
- PWA: installable, offline shell, queue check-ins while offline and sync when online.
- Web Push or in-app reminders for morning plan, evening review, weekly review (user-set times).

---

## 3. SCREENS (mobile-first, bottom tab bar; sidebar on ≥1024px)

1. **Landing / Intro** (public) — the **3D scroll experience** (see Section 5).
2. **Auth** — signup/login/forgot password, with animated transitions.
3. **Onboarding** (4 steps) — name, which identities to start with, daily time, reminder times.
4. **Home / Today** — greeting, streak flame, today's 3 priorities (swipe/tap to complete with haptic-style animation), habit checklist, XP progress ring, quick-add FAB, "Plan" and "Review" call-to-action states by time of day.
5. **Plan** (morning) and **Review** (evening) — step-by-step wizard with progress dots.
6. **Habits** — list, create/edit, per-habit streak + mini heatmap, archive (soft delete).
7. **Identities** — six identity cards with 3D tilt, detail pages with qualities, guides, area score.
8. **Journey** — 30-day timeline with phases, current day marker, phase tasks.
9. **Insights** — all charts from 2.5.
10. **Finance** — quick log + charts.
11. **Journal / History** — calendar view of past days, tap to see plan + review.
12. **Profile & Settings** — theme (light / dark / system), timezone, reminders, streak rule, recovery tokens, export, data delete, install-app prompt.

---

## 4. DESIGN SYSTEM

- **Premium feel**: layered glassmorphism cards (backdrop blur used sparingly for perf), soft gradients, subtle noise, generous spacing, large confident typography, rounded 20–28px corners, soft multi-layer shadows, tiny micro-interactions everywhere.
- **Themes**: `light`, `dark`, `system`; tokens as CSS variables on `[data-theme]`; instant switch with a circular reveal transition (View Transitions API with graceful fallback); persisted in Redux + localStorage; no flash on load (inline script in `index.html` sets theme before paint).
- **Tokens**: colour scale per theme, six identity accent colours, spacing (4pt grid), radius, elevation, motion durations/easings (`--ease-out`, `--ease-spring`), z-index scale, safe-area insets.
- **Typography**: one display font + one text font (self-hosted variable fonts, `font-display: swap`, preloaded). Fluid type with `clamp()`.
- **Mobile**: 360–430px first. Min touch target 44px. Bottom sheet modals, swipe gestures, pull-to-refresh, thumb-zone primary actions, `dvh` units, `env(safe-area-inset-*)`, `touch-action` tuned, no hover-only interactions.
- **Accessibility**: WCAG AA contrast in both themes, visible focus rings, ARIA for tabs/dialogs/progress, keyboard support, `prefers-reduced-motion` disables parallax/3D/confetti and uses simple fades.
- **Copy tone**: warm, calm, encouraging, plain language. Never guilt-tripping.

---

## 5. 3D SCROLL EXPERIENCE (Landing + selected pages)

Landing page (public, lazy chunks, 60fps target on mid-range phones):
1. **Hero** — pinned scene: "Become the person through your actions." A 3D object (Three.js low-poly orb/crystal OR pure CSS 3D rotating cube/rings as fallback) reacts to scroll progress and device tilt (gyro optional). Lenis smooth scroll.
2. **Six identities carousel** — GSAP ScrollTrigger pins the section; six 3D cards rotate around a Y-axis ring as the user scrolls; active card lifts and its accent colour washes the background.
3. **Daily loop** — Plan → Practise → Review shown as three layered parallax phone mockups (real UI components) that slide/rotate in with scrub.
4. **Streak & growth** — animated count-up numbers, flame, heatmap that "fills" on scroll, radar chart drawing itself.
5. **30-day journey** — horizontal scroll timeline (4 phases) driven by vertical scroll.
6. **CTA** — magnetic button, install-as-app prompt.

Inside the app, use lighter 3D: card tilt (pointer/gyro), perspective page transitions, depth-parallax on Home header, shared-element transitions between a habit card and its detail view. Rules: animate only `transform` and `opacity`, `will-change` only during animation, kill ScrollTriggers on unmount, throttle on low-end devices (`navigator.hardwareConcurrency`, `deviceMemory`), and never block interaction on animation.

---

## 6. PERFORMANCE REQUIREMENTS

- Lighthouse mobile: Performance ≥ 90, A11y ≥ 95, PWA pass. LCP < 2.0s on 4G, INP < 200ms, CLS < 0.05.
- Route-level code splitting (`React.lazy`), lazy-load Three.js, GSAP plugins, Recharts, Lottie and confetti only where used. Initial JS < 170KB gzip for app routes (landing 3D is a separate chunk).
- Manual vendor chunks in Vite, preload critical font, compress images to AVIF/WebP, inline critical CSS for the shell, skeleton loaders instead of spinners.
- TanStack Query: sensible `staleTime`, `select` to limit re-renders, **optimistic updates** for check-ins (UI responds instantly, rollback on failure), prefetch next likely route/data, `persistQueryClient` to IndexedDB for instant cold start and offline.
- Redux: small slices, memoised selectors (`createSelector`), no server data in Redux.
- Virtualise long lists (history), debounce inputs, use `content-visibility: auto` for offscreen sections.
- Backend: indexes on `(userId, date)`, lean queries, aggregation pipelines for analytics, response compression, ETag/cache headers for static config, pagination on lists, Mongo projection.

---

## 7. BACKEND ARCHITECTURE — follow HM-SaaS-BE conventions exactly

Reference: `HM-SaaS/HM-SaaS-BE`. Use the same style:
- ES modules (`"type": "module"`), root `app.js` that wires middleware, mounts routers and starts cron.
- `src/modules/<feature>/` containing **`<feature>.routes.js`, `<feature>.controller.js`, `<feature>.service.js`, `<feature>.repository.js`, `<feature>.model.js`** (+ `<feature>.validation.js` for Zod schemas).
- Layering: **routes → controller (HTTP only) → service (business logic) → repository (Mongoose queries only)**. Controllers never touch models directly.
- `src/utils/authMiddleware.js` (`protect`, cookie JWT), `errorHandler.js` (`handleError`), `role.js`, `scheduler.js` (cron), `generateToken.js`.
- `src/config/dbConfig.js`.
- Soft delete with `isDeleted`/`deletedAt` (as in HM-SaaS recycle-bin pattern) for habits, journal entries and finance entries.
- Single-user data isolation: every document has `userId` (indexed); every repository query filters by `userId` from `req.user`. (Multi-tenant `tenantId` from HM-SaaS is **not** needed.)
- Route prefix style like HM-SaaS: `/api/<module>/v1/...`.
- Responses: `{ success: boolean, data?, message?, error? }`.

```
growthos/
├── server/
│   ├── app.js
│   ├── package.json
│   ├── .env.example
│   ├── scripts/                      # seed.js (identities, badges, journey template)
│   └── src/
│       ├── config/
│       │   ├── dbConfig.js
│       │   └── env.js
│       ├── utils/
│       │   ├── authMiddleware.js
│       │   ├── errorHandler.js
│       │   ├── generateToken.js
│       │   ├── role.js
│       │   ├── validate.js           # Zod middleware
│       │   ├── dateHelpers.js        # timezone-safe day keys (YYYY-MM-DD)
│       │   ├── excelFormatter.js
│       │   └── scheduler.js          # node-cron jobs
│       └── modules/
│           ├── auth/                 # signup, login, refresh, logout, me, forgot/reset
│           ├── user/                 # profile, settings, theme, timezone, reminder times
│           ├── identity/             # six identities + user's custom statements
│           ├── habit/                # habit CRUD + soft delete + archive
│           ├── checkin/              # habit completion logs (per day)
│           ├── dailyPlan/            # morning plan: 3 priorities, qualities, if-then
│           ├── review/               # evening review + weekly review + month review
│           ├── studySession/         # career: minutes + learned text
│           ├── courageMoment/        # confidence: values-moments / wins
│           ├── finance/              # entries + summaries
│           ├── journey/              # 30-day program state + phases
│           ├── streak/               # streak engine, recovery tokens
│           ├── gamification/         # XP, levels, badges
│           ├── analytics/            # heatmap, radar, trends, insights
│           ├── notification/         # reminders, push subscriptions
│           └── export/               # csv / xlsx / notebook sheet data
└── client/   (see Section 8)
```

### 7.1 Data models (Mongoose)
- **User**: name, email (unique), passwordHash, refreshTokens[], timezone, theme, dailyTimeMinutes, reminderTimes {morning, evening, weekly}, streakRule {minPriorities}, activeIdentityIds[], onboardingDone, xp, level, recoveryTokens {available, lastGrantedWeek}.
- **Identity**: key (career|health|confidence|finance|family|discipline), name, icon, color, statement, qualities[], guides[] (seed + per-user override).
- **Habit**: userId, identityKey, title, description, schedule (daily / weekdays[]), targetMinutes?, isDefault, order, isArchived, soft-delete fields.
- **Checkin**: userId, habitId, dateKey, completedAt, minutes?, note?. Unique `(userId, habitId, dateKey)`.
- **DailyPlan**: userId, dateKey (unique pair), priorities[{ identityKey, text, done, doneAt }] (max 3), qualitiesToday[], ifThen[], morningDoneAt.
- **Review**: userId, type (daily|weekly|monthly), dateKey/weekKey, answers {career, health, selfRespect, relationships, discipline, tomorrow}, didWell, learned, respectedSelf, challenge, improveTomorrow, valuesMoment, mood(1–5), energy(1–5), weekly {worked, didntWork, lesson, adjustment}.
- **StudySession**: userId, dateKey, minutes, topic, learned, explainedAloud, projectId?.
- **CourageMoment**: userId, dateKey, text, kind (courage|assertive|boundary|win).
- **FinanceEntry**: userId, dateKey, type (income|essential|optional|saved), amount, category, note.
- **Journey**: userId, startDate, currentDay, phase (awareness|consistency|confidence|integration), status, cycleNumber.
- **StreakState**: userId, current, best, lastActiveDateKey, recoveryUsedWeeks[], history[].
- **Badge / UserBadge**, **XPEvent** (append-only ledger: userId, type, points, refId, dateKey), **PushSubscription**.

### 7.2 API (all under `/api/<module>/v1`, all `protect`ed except auth)
- **auth**: `POST /signup`, `/login`, `/refresh`, `/logout`, `GET /me`, `POST /forgot`, `/reset`
- **user**: `GET/PUT /profile`, `PUT /settings`, `PUT /theme`, `POST /complete-onboarding`, `DELETE /account`
- **identity**: `GET /all`, `GET /:key`, `PUT /:key/statement`
- **habit**: `POST /add`, `GET /all`, `PUT /update/:id`, `DELETE /delete/:id`, `PUT /archive/:id`, `GET /deleted`, `PUT /recover/:id`
- **checkin**: `POST /toggle` (idempotent; returns updated streak + XP delta + new badges), `GET /range?from&to`, `GET /today`
- **dailyPlan**: `GET /today`, `PUT /today`, `PUT /priority/:index/toggle`, `GET /range`
- **review**: `POST /daily`, `GET /daily/:dateKey`, `POST /weekly`, `GET /weekly/current`, `POST /monthly`, `GET /history`
- **studySession**: `POST /add`, `GET /range`, `DELETE /:id`
- **courageMoment**: `POST /add`, `GET /range`
- **finance**: `POST /add`, `GET /range`, `GET /summary`, `PUT /:id`, `DELETE /:id`
- **journey**: `GET /current`, `POST /start`, `POST /advance`, `POST /restart`
- **streak**: `GET /` , `POST /recovery/use`
- **gamification**: `GET /profile` (xp, level, next level), `GET /badges`
- **analytics**: `GET /heatmap?year`, `/radar?week`, `/trends?range`, `/study?range`, `/mood?range`, `/insights`
- **notification**: `POST /subscribe`, `DELETE /unsubscribe`, `GET /preferences`
- **export**: `GET /csv?type`, `GET /xlsx`, `GET /notebook/:dateKey`
- **health**: `GET /health` → `{ status: "ok" }`

Business rules to implement server-side: timezone-correct `dateKey`, idempotent check-ins, streak recompute on check-in + nightly cron, recovery token grant weekly (max 1) and auto/manual use, XP ledger (no double-award), badge evaluation after relevant events, journey day auto-advance via cron, weekly-review reminder cron.

---

## 8. FRONTEND ARCHITECTURE (feature-based, mirrors backend modules)

```
client/
├── index.html                  # inline theme script, preloads
├── vite.config.js              # manualChunks, pwa plugin, aliases (@/…)
├── public/                     # icons, manifest, fonts
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── app/
    │   ├── store.js            # configureStore
    │   ├── queryClient.js      # TanStack client + persister
    │   ├── router.jsx          # lazy routes
    │   └── providers.jsx
    ├── routes/
    │   ├── ProtectedRoute.jsx
    │   └── PublicRoute.jsx
    ├── layouts/
    │   ├── AppLayout.jsx       # bottom tab bar (mobile) / sidebar (desktop)
    │   └── PublicLayout.jsx
    ├── features/               # one folder per backend module
    │   ├── auth/        { api.js, hooks.js, slice.js, components/, pages/ }
    │   ├── user/
    │   ├── identity/
    │   ├── habit/
    │   ├── checkin/
    │   ├── dailyPlan/
    │   ├── review/
    │   ├── studySession/
    │   ├── courageMoment/
    │   ├── finance/
    │   ├── journey/
    │   ├── streak/
    │   ├── gamification/
    │   ├── analytics/
    │   ├── notification/
    │   ├── export/
    │   └── landing/            # 3D scroll scenes
    ├── components/
    │   ├── ui/                 # Button, Card, Sheet, Tabs, Toggle, Progress, Skeleton, Toast…
    │   ├── charts/             # Heatmap, RadarChart, TrendArea, Donut, StreakFlame
    │   ├── motion/             # Reveal, Tilt3D, MagneticButton, PageTransition, CountUp
    │   └── feedback/           # Confetti, EmptyState, ErrorBoundary
    ├── hooks/                  # useTheme, useReducedMotion, useMediaQuery, useOnline, useLenis
    ├── lib/
    │   ├── axios.js            # axios instance, withCredentials, 401 → refresh → retry
    │   ├── queryKeys.js        # central key factory
    │   ├── date.js             # dateKey helpers (tz-aware)
    │   └── gsap.js             # one-time plugin registration
    ├── store/
    │   └── slices/             # uiSlice (theme, sheets, toasts), sessionSlice, onboardingSlice, draftSlice
    ├── styles/
    │   ├── tokens.css          # CSS variables for light/dark
    │   ├── base.css            # reset, typography
    │   ├── utilities.css
    │   └── motion.css
    └── assets/                 # svg, lottie, fonts
```

**State rules**
- **TanStack Query** owns everything that comes from the API. Each feature has `api.js` (axios calls), `hooks.js` (`useTodayPlan`, `useToggleCheckin` with optimistic update, etc.) and uses keys from `lib/queryKeys.js`.
- **Redux Toolkit** owns client-only state: auth session flags, theme, bottom sheets/toasts, onboarding wizard, in-progress Plan/Review drafts (autosaved so nothing is lost), celebration queue.
- Mutations invalidate/patch only the affected keys (e.g. a check-in updates `today`, `streak`, `gamification` and the current heatmap cell).
- Global error boundary + toast for errors; skeletons for loading; empty states with a friendly first action.

---

## 9. QUALITY BAR

- Clean, commented-where-needed, consistent naming, no dead code, no giant files (>300 lines → split).
- Environment variables via `.env.example`; no secrets in code.
- Validation on client (react-hook-form) **and** server (Zod).
- Seed script creates the six identities, default habits, badges and the 30-day journey template.
- Basic tests: streak engine, XP ledger, timezone dateKey helper (Vitest/Jest).
- README with setup, scripts, env vars, folder structure, and deployment notes (Vercel/Netlify for client, Render/VPS for server, MongoDB Atlas).

---

## 10. DELIVERABLES

1. Complete working code for `server/` and `client/` per the structures above.
2. `seed.js` and a demo account with 45 days of realistic sample data so charts look rich on first run.
3. PWA manifest, icons, service worker.
4. README.md.

---

## 11. DEFINITION OF DONE (acceptance checklist)

- [ ] Works smoothly at 360px width; usable one-handed.
- [ ] Light/dark/system themes with no flash and animated switch.
- [ ] Landing page 3D scroll experience runs at 60fps on a mid-range phone and degrades gracefully with reduced motion.
- [ ] Completing a priority/habit updates the UI instantly (optimistic), then syncs; works offline and syncs later.
- [ ] Streak, recovery token, XP, level and badges behave per Section 2.4 and are computed on the server.
- [ ] All eight chart types render from real API data with 7d/30d/90d ranges.
- [ ] Plan → Practise → Review loop, weekly review and 30-day journey fully functional.
- [ ] Notebook sheet print/PDF and CSV/XLSX export work.
- [ ] Lighthouse mobile targets from Section 6 met.
- [ ] Backend follows the HM-SaaS module convention (routes/controller/service/repository/model) with no controller touching models.

---

## 12. HOW TO WORK (important)

Build in phases. **After each phase, summarise what was built, how to run/test it, then stop and wait for me to say "continue".**

1. **Phase 1 – Foundation:** monorepo scaffold, server base (app.js, config, utils, auth + user modules), client base (tokens, themes, router, store, queryClient, axios refresh flow, layouts, UI primitives).
2. **Phase 2 – Core loop:** identity, habit, checkin, dailyPlan, review, studySession, courageMoment modules (BE + FE), Home/Today, Plan, Review wizards.
3. **Phase 3 – Gamification:** streak, gamification modules, recovery tokens, XP/levels/badges, celebrations, cron jobs.
4. **Phase 4 – Insights:** analytics module + all charts, History calendar, Finance module, Journey module.
5. **Phase 5 – Landing & motion polish:** 3D scroll landing, page transitions, micro-interactions, reduced-motion fallbacks.
6. **Phase 6 – PWA, export, performance:** offline queue, push/in-app reminders, exports, notebook sheet, bundle/perf audit, tests, README, seed demo data.

Start now with **Phase 1**. If anything is ambiguous, make the most sensible assumption, state it in one line, and continue.

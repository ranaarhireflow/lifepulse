# LifePulse — Development Guide

## What is LifePulse?
A personal habit/metric tracker app. Each tracked item = a **Pulse**. Philosophy: "Track habits. Achieve monk mode."

## Tech Stack
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend:** FastAPI + SQLAlchemy + Alembic + PostgreSQL
- **Auth:** Firebase (Google sign-in) with dev-mode bypass
- **Mobile:** Capacitor (iOS + Android)
- **Database:** PostgreSQL on Railway

## Running

```bash
# Backend
cd backend && source .venv/bin/activate
DATABASE_URL="postgresql://..." uvicorn app.main:app --port 8000 --reload

# Frontend
cd frontend && npm run dev
```

## Key Architecture Decisions

- **Pulse** = each tracked item (not "tracker" or "habit")
- **6 input types:** NUMERIC, DUAL_NUMERIC, BOOLEAN, DURATION, TIME, TEXT
- **Soft-delete everywhere** — `is_active` + `deleted_at`, never hard delete
- **Deactivate vs Delete:** deactivate = flag off (re-login reactivates), delete = 7-day grace period
- **Multiple alerts per pulse** via `tracker_alerts` table
- **5-day edit window** for past entries
- **Timezone:** auto-detected, stored on every entry as `logged_timezone`
- **Default behaviors:** CARRY_FORWARD, ZERO, NULL per pulse

## Brand & Design

- **Sidebar:** Deep forest green (#0F1F17)
- **Primary:** #16A34A (darker green for buttons)
- **Accent:** #22C55E (success/active states)
- **Cards/surfaces:** Green-tinted (#EFF3EF), not white
- **Logo:** Meditation monk + progress ring on gradient square
- **Font:** Plus Jakarta Sans / Geist Variable
- **NOT shiny/polished** — saturated, earthy, app-like
- **All charts/rings use brand green** — no multi-color clash

## API Endpoints

All under `/api/v1`:

| Area | Endpoints |
|------|-----------|
| Auth | POST /auth/login, /auth/dev-login, GET/PATCH /auth/me, POST /auth/deactivate, DELETE /auth/me |
| Trackers | GET/POST /trackers, GET/PATCH/DELETE /trackers/:id, POST /trackers/:id/archive, /trackers/:id/alerts |
| Entries | GET /entries, GET /entries/bulk, PUT /entries/:trackerId/:date, DELETE /entries/:trackerId/:date |
| Analytics | GET /analytics/:trackerId, GET /analytics/:trackerId/heatmap |
| Templates | GET /templates, POST /templates/:id/create |
| Push | POST /push/subscribe, DELETE /push/unsubscribe |

## Database

- PostgreSQL on Railway: `ballast.proxy.rlwy.net:16370`
- Old tables archived as `*_archive` (never deleted)
- Alembic for migrations: `alembic revision --autogenerate -m "desc"` then `alembic upgrade head`

## Firebase

- Project: `my-personal-tracker-6089c`
- Frontend config in `frontend/.env` (VITE_ vars)
- Backend: lightweight JWT decode when no service account, full verification with service account JSON

## Key Files

| File | Purpose |
|------|---------|
| `frontend/src/pages/dashboard/DailyPage.tsx` | Today — swipe card carousel with date dial |
| `frontend/src/pages/progress/ProgressPage.tsx` | Progress — habit row list |
| `frontend/src/pages/score/MonkScorePage.tsx` | Score — RPG stats, XP, suggested habits |
| `frontend/src/pages/alarms/AlarmsPage.tsx` | Alarms — centralized reminder management |
| `frontend/src/pages/trackers/TrackerDetailPage.tsx` | Pokemon card detail with edit + charts |
| `frontend/src/pages/trackers/TrackerCreatePage.tsx` | Create tracker — templates + custom form |
| `frontend/src/components/common/ConfigDrawer.tsx` | Bottom sheet drawer (phone-frame scoped) |
| `frontend/src/components/common/PulseLogo.tsx` | SVG logo — monk + progress ring |
| `frontend/src/components/layout/AppLayout.tsx` | Phone frame wrapper with cream bg |
| `frontend/src/components/layout/BottomNav.tsx` | 5-tab bottom navigation |
| `frontend/src/components/today/RulerInput.tsx` | Tactile drag ruler input |
| `frontend/src/components/today/HabitCard.tsx` | Today card with ruler + inputs |
| `frontend/src/services/alarm-sync.ts` | Notification scheduling (Capacitor) |
| `frontend/src/services/widget-sync.ts` | Widget data sync (SharedPreferences) |
| `frontend/src/services/notifications.ts` | Web notification helpers |
| `frontend/src/data/notification-messages.ts` | 40+ creative per-habit messages |
| `frontend/src/data/suggested-habits.ts` | 25 habit suggestions with metadata |
| `frontend/src/index.css` | Theme (dark + light) with Plus Jakarta Sans |
| `backend/app/models/` | All SQLAlchemy models |
| `backend/app/routers/` | All API route handlers |
| `backend/app/services/monk_score.py` | XP/level scoring engine |

## Commands

```bash
# Type check frontend
cd frontend && npx tsc --noEmit

# Build frontend
cd frontend && npm run build

# Capacitor sync
cd frontend && npx cap sync

# Generate migration
cd backend && alembic revision --autogenerate -m "description"

# Apply migration
cd backend && alembic upgrade head

# Seed templates
cd backend && python seed.py

# Seed dummy data
cd backend && python seed_dummy.py
```

## Native Builds (iOS + Android)

### Prerequisites
- Xcode 15+ (iOS)
- Android Studio (Android)
- Node 20+

### Build & Run
```bash
cd frontend

# Build web assets
npm run build

# Sync to native projects
npx cap sync

# Open in Xcode (iOS)
npx cap open ios

# Open in Android Studio
npx cap open android
```

### Android APK
```bash
cd frontend
npm run build
npx cap sync android
JAVA_HOME="/Applications/Android Studio.app/Contents/jbr/Contents/Home" \
  cd android && ./gradlew assembleDebug
# APK at: android/app/build/outputs/apk/debug/app-debug.apk
```

### Push Notifications
- Android: `@capacitor/local-notifications` with `schedule.at` + `repeats: true`
- **Important:** `schedule.on` (cron-style) does NOT work on Pixel/modern Android
- Use `schedule.at` with calculated next-occurrence Date + `repeats: true`
- Static imports only (dynamic imports silently fail on native)
- Web: Service Worker (sw.js) handles push events
- iOS: APNs via @capacitor/push-notifications (when iOS app built)
- Apple Watch: notifications auto-forward when paired

### Widgets (Android)
- 3 widget types: Overview (4x2), Habit Card (2x2 with picker), Streak (2x1)
- Habit Card shows config picker to select which habit
- Data synced via SharedPreferences (`CapacitorStorage`)
- Widget provider + layouts in `android/app/src/main/`

### Firebase Auth (Android)
- Uses `@capacitor-firebase/authentication` for native Google Sign-In
- `signInWithPopup` doesn't work in Capacitor WebView
- Native plugin shows bottom-sheet account picker
- Requires `google-services.json` with SHA-1 fingerprint
- `providers: ["google.com"]` in capacitor.config.ts

## v4.2 — Current Version

### RPG Gamification
- **Multi-dimension weights** — each habit affects 5 stats (Wisdom/Strength/Focus/Discipline/Confidence)
- **RPG stat bars** on Pokemon card detail page (animated, colored per dimension)
- **5 dimension sliders** in create + edit forms (0-100 per stat)
- **Scoring engine** — real XP from entries, streak multipliers, target bonuses
- **Quadratic leveling** — level² × 100 XP, no cap
- **Awards tab** — XP progress ring, unlockable achievements

### Ruler Input
- Tactile drag ruler for NUMERIC + DURATION habits (like Life Reset)
- Touch-native, no Framer Motion drag (WebView-friendly)
- `stopPropagation` prevents card swipe conflicts

### Navigation
- Bottom nav: Progress | Score | **TODAY** (center) | Awards | Settings
- Logo only on Today + Login pages
- Sub-pages have back buttons

### Add a Pulse (Discover)
- 6 category pills: Popular, Body, Mind, Life, Focus, Quit
- 30+ pre-built habits with dimension metadata
- Search across all habits
- "Build Your Own" at top, quiz accessible anytime

### Notifications
- Creative Zomato-style messages per habit (40+ messages)
- Permission request on app launch
- Alarms auto-sync from tracker alerts
- Test button in Settings

### Mobile-First
- iPhone 14 Pro phone frame on desktop (393×852)
- Safe area insets (Dynamic Island, home indicator)
- `100dvh` for mobile browser
- PWA: manifest, service worker, installable

### Git Remotes
- `origin` — git@github.com:rajatsaxena2504/lifepulse.git (default push)
- `upstream` — github.com/ranaarhireflow/lifepulse.git (push when asked)

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
| `frontend/src/index.css` | Theme (dark + light) with Plus Jakarta Sans |
| `backend/app/models/` | All SQLAlchemy models |
| `backend/app/routers/` | All API route handlers |

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

### Push Notifications
- Web: Service Worker (sw.js) handles push events
- iOS: APNs via @capacitor/push-notifications
- Android: FCM via @capacitor/push-notifications
- Local notifications: @capacitor/local-notifications

### Widgets (planned)
- iOS: WidgetKit extension (requires native Swift code)
- Android: App Widget (requires native Kotlin code)
- Both need native project setup beyond Capacitor

## v4.1.0 — Life Reset Redesign

Major UI overhaul inspired by Life Reset app + Tinder swipe UX + RPG gamification.

### New Features
- **Swipe card carousel** — Tinder-style daily tracking, adjacent cards peek from sides
- **Date dial** — Full week (Sun-Sat) with selectable past dates, future disabled
- **RPG Score page** — 5 dimensions (Wisdom, Confidence, Strength, Discipline, Focus) with 64px numbers, XP/Level system, "No level cap. Keep rising."
- **25 suggested habits** — Expandable row list with stat boosts and Accept/Decline
- **Progress page** — Clean row list of all habits
- **Centralized Alarms page** — Manage all reminders with toggles
- **Achievements page** — Streak, entry, consistency, milestone badges
- **Pokemon card detail** — Gradient hero, heatmap, trend charts, inline edit
- **Phone frame on desktop** — Cream background with rounded phone container
- **Plus Jakarta Sans** font
- **Bottom sheet drawers** — Constrained to phone frame, not full viewport
- **Logo on all pages** — Clicking navigates home

### Design System
- Dark mode: true black (#000) + card (#1C1C1E) + green (#22C55E)
- Light mode: cream frame (#F5F0EB) + white cards + green accents
- All pages mobile-width (max-w-md) centered
- 5-tab bottom nav: Today, Progress, Score, Alarms, Settings

### Previous (v1.0.0)
- [x] Firebase Google auth + dev mode bypass
- [x] 6 pulse types with all input variants
- [x] Daily tracking with auto-save
- [x] GitHub-style activity heatmap (3Mo/6Mo/Year)
- [x] Trend charts (7 range options)
- [x] Alert management (add/edit/delete)
- [x] Create pulse from templates or custom
- [x] Edit pulse (name, icon, color, unit, target, default)
- [x] Archive/unarchive/soft-delete
- [x] Dark mode + light mode
- [x] PWA + Capacitor
- [x] Soft-delete + 7-day grace period

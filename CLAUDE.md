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
| `frontend/src/pages/dashboard/DailyPage.tsx` | Main daily view — week strip, stats, pulse cards |
| `frontend/src/components/trackers/TrackerCard.tsx` | Pulse card with type-dispatched input |
| `frontend/src/components/entries/EntryInput.tsx` | Input dispatcher (120px fixed container) |
| `frontend/src/components/common/ConfigDrawer.tsx` | Right-side sheet drawer (JiraForge pattern) |
| `frontend/src/components/common/PulseLogo.tsx` | SVG logo — monk + progress ring |
| `frontend/src/lib/brand.ts` | Brand constants |
| `frontend/src/index.css` | Full theme (green-tinted light + dark) |
| `backend/app/models/` | All SQLAlchemy models |
| `backend/app/routers/` | All API route handlers |
| `backend/app/services/default_trackers.py` | 8 default trackers for new users |

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

## v1.0.0 Status

All core features built and functional:
- [x] Firebase Google auth + dev mode bypass
- [x] 6 pulse types with all input variants
- [x] Daily tracking with auto-save
- [x] Week date strip navigation
- [x] Progress ring + stats
- [x] GitHub-style activity heatmap (3Mo/6Mo/Year)
- [x] Trend charts (7 range options)
- [x] Cross-pulse analytics with insights
- [x] Alert management (add/edit/delete)
- [x] Create pulse from templates or custom
- [x] Edit pulse (name, icon, color, unit, target, default)
- [x] Archive/unarchive/soft-delete
- [x] Collapsible sidebar
- [x] Dark mode
- [x] PWA (manifest, service worker)
- [x] Capacitor (iOS + Android initialized)
- [x] Docker + Railway deployment config
- [x] Soft-delete + 7-day grace period
- [x] Timezone auto-detection

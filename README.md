# LifePulse — Track Your Day

> Your life, one tap at a time. Track habits. Build streaks. Achieve monk mode.

LifePulse is a personal tracker app where you can track anything — weight, water, gym, deep work, sleep, books, blood pressure, or any custom metric. Each tracked item is called a **Pulse**.

## Features

- **Track Anything** — 6 input types: Number, Dual Number (BP), Yes/No, Duration, Time, Notes
- **GitHub-style Heatmaps** — contribution grid per pulse showing consistency over time
- **Streak Tracking** — Snapchat-style streaks with fire badges and celebration animations
- **Smart Alerts** — multiple reminders per pulse (e.g., water 4x/day), configurable time + days
- **Analytics** — cross-pulse insights: most consistent, needs attention, best day, streak leader
- **Trend Charts** — line/bar charts with Week/Month/3Mo/6Mo/YTD/Year/All range
- **Default Values** — carry forward yesterday's value, default to 0, or leave empty
- **5-Day Edit Window** — edit entries up to 5 days back
- **Dark Mode** — full dark mode support
- **PWA** — installable as a web app on any device
- **Mobile Ready** — Capacitor setup for iOS/Android app store submission

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS + shadcn/ui |
| Backend | FastAPI + Python + SQLAlchemy + Alembic |
| Auth | Firebase Authentication (Google sign-in) |
| Database | PostgreSQL (Railway) |
| Charts | Recharts + react-activity-calendar |
| Animation | Framer Motion |
| Mobile | Capacitor (iOS + Android) |
| Deploy | Docker + Railway |

## Brand

- **Name**: LifePulse
- **Logo**: Meditation monk + progress ring on green gradient
- **Colors**: Deep forest green sidebar (#0F1F17), green accent (#16A34A), green-tinted surfaces
- **Philosophy**: Track habits → achieve monk mode

## Quick Start

```bash
# Backend
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
DATABASE_URL="your-postgres-url" alembic upgrade head
DATABASE_URL="your-postgres-url" python seed.py
DATABASE_URL="your-postgres-url" uvicorn app.main:app --port 8000 --reload

# Frontend
cd frontend
npm install
npm run dev
```

Open http://localhost:5173

## Docker

```bash
docker-compose up    # Dev: PostgreSQL + Backend + Frontend
```

## Project Structure

```
lifepulse/
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI app
│   │   ├── models/           # SQLAlchemy models (User, Tracker, Entry, TrackerAlert, etc.)
│   │   ├── schemas/          # Pydantic request/response schemas
│   │   ├── routers/          # API endpoints (auth, trackers, entries, analytics, push, templates)
│   │   ├── services/         # Business logic (firebase, defaults, notifications)
│   │   └── middleware/       # Auth middleware (Firebase + dev mode)
│   ├── alembic/              # Database migrations
│   ├── seed.py               # Template seeder (27 templates)
│   └── seed_dummy.py         # Dummy data for testing
├── frontend/
│   ├── src/
│   │   ├── components/       # Layout, entries, trackers, common
│   │   ├── pages/            # Auth, Dashboard, Trackers, Analytics, Settings
│   │   ├── services/         # API client + type definitions
│   │   ├── hooks/            # useTheme, etc.
│   │   ├── store/            # AuthContext
│   │   └── lib/              # Firebase, brand, utils
│   ├── capacitor.config.ts   # iOS/Android config
│   └── public/               # PWA manifest, service worker, favicon
├── docker-compose.yml
└── railway.json
```

## Data Model

- **Users** — synced from Firebase, soft-delete with 7-day grace period
- **Trackers** (Pulses) — 6 types, configurable defaults, streak goals
- **Entries** — one per pulse per day, typed value columns, timezone-aware
- **TrackerAlerts** — multiple per pulse, time + days of week
- **TrackerTemplates** — 27 pre-built templates across Health/Fitness/Productivity/Lifestyle

## Security

- Firebase Auth (Google) — no password management
- Soft-delete everywhere — data is never hard deleted
- Deactivate vs Delete: deactivate preserves data, delete has 7-day grace period
- Timezone auto-detection + manual override
- CORS, trusted hosts, input validation

## License

Private — All rights reserved.

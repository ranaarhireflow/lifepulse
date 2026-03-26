#!/bin/bash
set -e

echo "🔄 Running database migrations..."
cd /app
alembic upgrade head 2>/dev/null || echo "⚠️  No migrations to run (generate first with: alembic revision --autogenerate -m 'initial')"

echo "🌱 Seeding templates..."
python seed.py 2>/dev/null || echo "⚠️  Seeding skipped"

echo "🚀 Starting server..."
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

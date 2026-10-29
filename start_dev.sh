#!/bin/bash
echo "========================================================"
echo "  Starting PathFinder AI Systems (Full Stack Dev)"
echo "========================================================"

echo "Starting FastAPI Backend on http://localhost:8000..."
source .venv/bin/activate 2>/dev/null || true
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --app-dir backend &
BACKEND_PID=$!

echo "Starting Next.js Frontend on http://localhost:3000..."
cd frontend && npm run dev &
FRONTEND_PID=$!

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait

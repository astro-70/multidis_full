@echo off
echo ========================================================
echo   Starting PathFinder AI Systems (Full Stack Dev)
echo ========================================================
echo.

echo 1. Starting FastAPI Backend on http://localhost:8000 ...
start "PathFinder Backend (FastAPI)" cmd /k ".\.venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload --app-dir backend"

echo 2. Starting Next.js Frontend on http://localhost:3005 ...
start "PathFinder Frontend (Next.js)" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are launching!
echo - API Documentation: http://localhost:8000/docs
echo - Web Application:   http://localhost:3005
echo.
pause


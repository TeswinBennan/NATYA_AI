@echo off
echo ============================================================
echo Starting Natyaa AI Full-Stack Environment
echo ============================================================

REM Start MongoDB (assuming it runs as a service, but print a reminder)
echo [INFO] Ensure MongoDB is running locally on port 27017.

REM Start FastAPI Backend
echo [INFO] Starting FastAPI Backend on http://127.0.0.1:8000
start cmd /k "cd backend && python -m uvicorn main:app --reload --host 127.0.0.1 --port 8000"

REM Wait a couple of seconds
timeout /t 2 /nobreak > NUL

REM Start Vite Frontend
echo [INFO] Starting Vite Frontend on http://127.0.0.1:5173
start cmd /k "cd frontend && npm run dev"

echo ============================================================
echo Both servers are launching in separate windows!
echo Access the web app at: http://127.0.0.1:5173
echo API Docs at: http://127.0.0.1:8000/docs
echo ============================================================
pause

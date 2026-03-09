@echo off
echo ====================================================
echo      Negotiara: Autonomous Logistics Platform
echo ====================================================
echo.

:: Start AI Engine (FastAPI)
echo [1/3] Starting AI Negotiation Engine (Port 8000)...
start "Negotiara - AI Engine" cmd /c "cd ai-engine && call venv\Scripts\activate.bat && python app.py"

:: Start Backend (Express)
echo [2/3] Starting Express Backend (Port 4000)...
start "Negotiara - Backend" cmd /c "cd backend && node server.js"

:: Start Frontend (Next.js)
echo [3/3] Starting Next.js Frontend (Port 3000)...
start "Negotiara - Frontend" cmd /c "cd frontend && npm run dev"

echo.
echo ====================================================
echo All services are starting in separate windows.
echo AI Engine: http://localhost:8000
echo Backend:   http://localhost:4000
echo Frontend:  http://localhost:3000
echo ====================================================
pause

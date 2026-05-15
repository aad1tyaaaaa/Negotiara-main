@echo off
setlocal
set ROOT=%~dp0

echo ====================================================
echo      Negotiara: Autonomous Logistics Platform
echo ====================================================
echo.
echo Tip: Inside VS Code, press Ctrl+Shift+B to start all
echo      services in separate integrated terminal panels.
echo.
echo Starting services in PowerShell windows...
echo.

echo [1/3] AI Engine  ^(port 8000^)...
start "AI Engine :8000" powershell -NoExit -Command "Set-Location '%ROOT%ai-engine'; uvicorn app:app --host 0.0.0.0 --port 8000 --reload"

echo [2/3] Backend    ^(port 4000^)...
start "Backend :4000" powershell -NoExit -Command "Set-Location '%ROOT%backend'; node server.js"

echo [3/3] Frontend   ^(port 3000^)...
start "Frontend :3000" powershell -NoExit -Command "Set-Location '%ROOT%frontend'; npm run dev"

echo.
echo ====================================================
echo  AI Engine : http://localhost:8000
echo  Backend   : http://localhost:4000
echo  Frontend  : http://localhost:3000
echo ====================================================
endlocal

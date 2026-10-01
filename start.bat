@echo off
title MediaDrop Launcher
echo ========================================================
echo   Launching MediaDrop (Backend FastAPI + Frontend Vite)
echo ========================================================
echo.

start "MediaDrop Backend" cmd /k "backend\venv\Scripts\python.exe backend\run.py"
timeout /t 2 /nobreak > nul

start "MediaDrop Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo MediaDrop services started!
echo Frontend: http://localhost:5173
echo Backend:  http://localhost:8000
echo.
pause

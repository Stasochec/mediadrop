@echo off
title MediaDrop Stopper
echo ========================================================
echo   Stopping MediaDrop Services (Backend and Frontend)
echo ========================================================
echo.

echo Stopping processes on port 8000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :8000 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Stopping processes on port 5173...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :5173 ^| findstr LISTENING') do (
    taskkill /F /PID %%a >nul 2>&1
)

echo Stopping any leftover python and node instances...
taskkill /F /IM python3.11.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1

echo.
echo All MediaDrop services have been stopped successfully!
echo.
pause

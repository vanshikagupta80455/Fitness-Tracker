@echo off
title Fitness Tracker Server Launcher
echo ==============================================
echo Starting Fitness Tracker Services
echo ==============================================

:: Check if MySQL is already running
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe" >NUL
if "%ERRORLEVEL%"=="0" (
    echo [INFO] MySQL is already running.
) else (
    echo [INFO] MySQL is not running. Starting MySQL...
    start /b "" "C:\xampp\mysql\bin\mysqld.exe" --defaults-file="C:\xampp\mysql\bin\my.ini" --standalone
    :: Give MySQL a moment to start up
    timeout /t 3 /nobreak >nul
)

:: Verify MySQL started successfully
tasklist /FI "IMAGENAME eq mysqld.exe" 2>NUL | find /I /N "mysqld.exe" >NUL
if "%ERRORLEVEL%"=="0" (
    echo [SUCCESS] MySQL is active.
) else (
    echo [WARNING] Could not start MySQL. Please check your XAMPP installation.
)

echo.
echo [INFO] Starting Next.js development server...
echo.
npm run dev

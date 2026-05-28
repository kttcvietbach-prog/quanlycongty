@echo off
echo.
echo 🤖 VIETBACHERP Chatbot - Quick Start
echo ======================================
echo.

REM Check if .env exists
if not exist .env (
    echo ⚠️  .env file not found!
    echo.
    echo Please create .env from .env.example:
    echo   1. Copy: copy .env.example .env
    echo   2. Edit: Add your ANTHROPIC_API_KEY
    echo.
    pause
    exit /b 1
)

REM Check if node_modules exists
if not exist node_modules (
    echo 📦 Installing dependencies...
    call npm install
    echo.
)

REM ─── Kill any existing process on port 8080 ───────────────────────────────
echo 🔍 Checking for existing processes on port 8080...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8080 ^| findstr LISTENING') do (
    echo ⚠️  Found process PID %%a on port 8080 - killing it...
    taskkill /PID %%a /F >nul 2>&1
)
echo ✅ Port 8080 is now free.
echo.
REM ─────────────────────────────────────────────────────────────────────────

REM Start the server
echo 🚀 Starting chatbot server...
echo.
echo 📡 Server URL:  http://localhost:8080
echo 📖 API Status:  http://localhost:8080/api/chat/status
echo.

node chatbot-api.js
pause

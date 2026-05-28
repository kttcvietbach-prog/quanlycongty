@echo off
REM Chuyển hướng về thư mục chứa file .bat này
cd /d %~dp0
REM Quay lại thư mục gốc của project (nếu file bat nằm trong features/chatbot)
cd ../../
REM =========================================
REM VIETBACHCORP ERP - Chatbot Service Launcher
REM =========================================

echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║   🤖 VIETBACHCORP ERP - Chatbot Service Launcher    ║
echo ╚══════════════════════════════════════════════════════╝
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo ✅ Node.js found: 
node --version
echo.

REM Check if we're in the correct directory
if not exist "chatbot-service.js" (
    echo ❌ ERROR: chatbot-service.js not found in current directory
    echo Please run this script from the project root directory
    pause
    exit /b 1
)

echo ✅ Chatbot service file found
echo.

REM Check for .env file
if not exist ".env" (
    echo ⚠️  WARNING: .env file not found
    echo Copy .env.example to .env and configure it
    echo Example config:
    echo   CHATBOT_PORT=3001
    echo   ANTHROPIC_API_KEY=sk-ant-...
    echo.
)

REM Install dependencies if needed
echo 📦 Checking dependencies...
if not exist "node_modules" (
    echo Installing npm packages...
    call npm install
) else (
    echo ✅ Dependencies already installed
)

echo.
echo 🚀 Starting Chatbot Service...
echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║  Service will start on http://localhost:3001       ║
echo ║  Press Ctrl+C to stop the service                   ║
echo ║  Check browser console for client connection        ║
echo ╚══════════════════════════════════════════════════════╝
echo.

REM Start the service
node chatbot-service.mjs

REM If service exits with error
if %errorlevel% neq 0 (
    echo.
    echo ❌ Service failed to start
    echo Check the error messages above
    pause
)

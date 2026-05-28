@echo off
echo.
echo 🚀 Khoi dong VIETBACH ERP Server (Node.js)...
echo ===========================================
echo.

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Loi: Khong tim thay Node.js!
    echo Vui long tai va cai dat Node.js tai: https://nodejs.org/
    echo.
    pause
    exit /b 1
)

echo ✅ Node.js da san sang.
node server.mjs
pause

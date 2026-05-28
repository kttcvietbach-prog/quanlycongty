@echo off
echo.
echo 🚀 Khoi dong VIETBACH Bidding Scraper Service...
echo ===============================================
echo.

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Loi: Khong tim thay Node.js!
    pause
    exit /b 1
)

echo ✅ Node.js da san sang. Dang khoi chay Scraper tren cong 3002...
node scraper-api.js
pause

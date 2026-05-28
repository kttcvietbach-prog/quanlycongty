@echo off
title Day code len GitHub - VIETBACH CORP
echo --- Bat dau qua trinh cau hinh va day code len GitHub ---
echo.

:: 1. Khoi tao Git neu chua co
if not exist .git (
    echo [1/4] Khoi tao kho luu tru Git moi...
    git init
) else (
    echo [1/4] Kho luu tru Git da ton tai.
)

:: 2. Cau hinh Remote
echo [2/4] Dang thiet lap dia chi GitHub...
git remote remove origin >nul 2>&1
git remote add origin https://github.com/kttcvietbach-prog/quanlycongty.git

:: 3. Them file va Commit
echo [3/4] Dang dong goi du lieu (Add and Commit)...
git add .
git commit -m "Cap nhat VIETBACHERP V5.2 - Sync to Master"

:: 4. Day code
echo [4/4] Dang day code len GitHub... (Nhanh master)
git push -f origin master
if %errorlevel% neq 0 (
    echo.
    echo Thu day len nhanh main...
    git push -f origin main
)

if %errorlevel% equ 0 (
    echo.
    echo --- THANH CONG: Code da duoc cap nhat len GitHub! ---
) else (
    echo.
    echo --- THAT BAI: Co loi xay ra. Vui long kiem tra tai khoan GitHub hoac ket noi mang. ---
)

echo.
pause

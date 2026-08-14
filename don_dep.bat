@echo off
chcp 65001 > nul
echo.
echo ========================================
echo   DỌN DẸP FILE RÁC - VIETBACH V5.29
echo ========================================
echo.

cd /d "%~dp0"

set FILES=bisect_js_parse.py count_js_delimiters.py count_js_delimiters2.py find_js_mismatch.py scratch_find_contract.py scratch_sync_temp_files.py inspect_vehicles.mjs "New Text Document.txt" pm_modals_prefix.js

echo [*] Đang xóa các file debug/scratch/rác...
echo.

for %%F in (%FILES%) do (
    if exist %%F (
        del /f /q %%F
        echo [OK] Da xoa: %%F
    ) else (
        echo [--] Khong ton tai: %%F
    )
)

echo.
echo ========================================
echo   HOAN THANH! He thong da duoc don dep.
echo ========================================
echo.
pause

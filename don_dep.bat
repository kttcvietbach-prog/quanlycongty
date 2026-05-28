@echo off
echo ===================================================
echo   DANG DON DEP CAC FILE RAC / DEBUG TAM THOI
echo ===================================================
echo.

del /F /Q debug_braces.js 2>nul
del /F /Q find_funcs.js 2>nul
del /F /Q nuclear_reset.js 2>nul
del /F /Q read_lines.js 2>nul
del /F /Q test_pmSaveMaterial.js 2>nul
rmdir /S /Q scratch 2>nul

echo.
echo ===================================================
echo   DON DEP HOAN TAT!
echo   Luu y: Cac file nay rat nho (chi khoang 10KB).
echo   De giam dung luong that su, ban can xoa thu muc 
echo   'node_modules' hoac nen hinh anh.
echo ===================================================
pause

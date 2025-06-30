@echo off
chcp 65001 > nul
title "فحص النظام"

echo ========================================
echo        فحص متطلبات النظام
echo ========================================
echo.

echo فحص Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Node.js غير مثبت
    echo يرجى تحميله من: https://nodejs.org
) else (
    echo ✓ Node.js مثبت
    node --version
)

echo.
echo فحص npm...
npm --version >nul 2>&1
if errorlevel 1 (
    echo ✗ npm غير مثبت
) else (
    echo ✓ npm مثبت
    npm --version
)

echo.
echo فحص مجلد المشروع...
if exist "package.json" (
    echo ✓ ملف package.json موجود
) else (
    echo ✗ ملف package.json غير موجود
)

if exist "server\" (
    echo ✓ مجلد server موجود
) else (
    echo ✗ مجلد server غير موجود
)

if exist "client\" (
    echo ✓ مجلد client موجود
) else (
    echo ✗ مجلد client غير موجود
)

echo.
echo انتهى الفحص
pause
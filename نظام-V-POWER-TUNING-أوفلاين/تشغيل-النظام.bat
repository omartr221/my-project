@echo off
title V POWER TUNING Server
color 0A

echo.
echo ========================================
echo    V POWER TUNING - نظام إدارة المهام
echo ========================================
echo.

echo التحقق من Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js غير مثبت!
    echo يرجى تحميل وتثبيت Node.js من: https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js متوفر
echo.

echo تثبيت المكتبات المطلوبة...
call npm install

if %errorlevel% neq 0 (
    echo ❌ فشل في تثبيت المكتبات
    pause
    exit /b 1
)

echo.
echo 🚀 بدء تشغيل النظام...
echo.
echo لإيقاف النظام: اضغط Ctrl+C
echo.

node server.js

pause
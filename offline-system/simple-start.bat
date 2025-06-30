@echo off
chcp 65001 > nul
title "نظام V POWER TUNING - تشغيل مبسط"

echo تشغيل نظام توزيع المهام...
echo.

REM Try to run with full path
cd /d "%~dp0"

REM Check if Node.js is in PATH
where node >nul 2>&1
if errorlevel 1 (
    echo Node.js غير موجود في مسار النظام
    echo يرجى إعادة تثبيت Node.js من nodejs.org
    echo وإعادة تشغيل الكمبيوتر
    pause
    exit /b 1
)

REM Check if npm is available
where npm >nul 2>&1
if errorlevel 1 (
    echo npm غير موجود
    echo يرجى إعادة تثبيت Node.js
    pause
    exit /b 1
)

echo Node.js متوفر ✓
echo npm متوفر ✓
echo.

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules\" (
    echo تثبيت المكتبات...
    npm install
    if errorlevel 1 (
        echo فشل في تثبيت المكتبات
        pause
        exit /b 1
    )
)

echo بدء تشغيل النظام...
echo.
echo النظام يعمل على: http://localhost:3000
echo لإيقاف النظام: اضغط Ctrl+C
echo.

npm run dev
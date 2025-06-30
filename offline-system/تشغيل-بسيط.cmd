@echo off
chcp 65001 > nul
title نظام V POWER TUNING

REM Change to script directory
cd /d "%~dp0"

REM Set NODE_PATH to common locations
set PATH=%PATH%;C:\Program Files\nodejs;C:\Program Files (x86)\nodejs;%LOCALAPPDATA%\Programs\nodejs;%APPDATA%\npm

echo تحقق من Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo Node.js غير موجود في المسار
    echo ابحث عن "Node.js command prompt" في قائمة Start
    pause
    exit /b 1
)

echo Node.js موجود ✓

REM Check package.json
if not exist package.json (
    echo خطأ: تأكد من تشغيل الملف من مجلد offline-system
    pause
    exit /b 1
)

echo تثبيت المكتبات...
npm install --force --silent

echo تشغيل النظام...
echo افتح المتصفح على: http://localhost:3000
echo.

npm run dev
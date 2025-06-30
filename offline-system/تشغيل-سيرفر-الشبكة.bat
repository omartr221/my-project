@echo off
chcp 65001 > nul
title "V POWER TUNING - خادم الشبكة المركزي"
color 0A
cls

echo ========================================
echo       V POWER TUNING - خادم الشبكة
echo ========================================
echo.

REM Change to script directory
cd /d "%~dp0"

echo فحص الإعدادات...
echo.

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Node.js غير موجود
    echo الرجاء تثبيت Node.js أولاً من nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js: %NODE_VERSION%

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ✗ npm غير متوفر
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✓ npm: %NPM_VERSION%
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo تثبيت المكتبات...
    call npm install --no-optional --force
    if errorlevel 1 (
        echo فشل في التثبيت
        pause
        exit /b 1
    )
    echo ✓ تم التثبيت
    echo.
)

REM Get local IP address
echo الحصول على عنوان IP...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set "ip=%%a"
    goto :got_ip
)
:got_ip
set ip=%ip: =%

echo.
echo ========================================
echo           إعدادات الخادم
echo ========================================
echo.
echo المنفذ: 3000
echo عنوان IP المحلي: %ip%
echo.
echo للوصول من نفس الجهاز:
echo http://localhost:3000
echo.
echo للوصول من أجهزة أخرى في الشبكة:
echo http://%ip%:3000
echo.
echo ========================================
echo.

REM Set environment
set NODE_ENV=production
set PORT=3000

echo بدء تشغيل الخادم...
echo الخادم سيبقى يعمل حتى تضغط Ctrl+C
echo.
echo ⚠️  هام: اتركه يعمل لكي تستطيع الأجهزة الأخرى الوصول إليه
echo.

npm run dev

echo.
echo تم إيقاف الخادم
pause
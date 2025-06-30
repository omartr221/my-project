@echo off
chcp 65001 > nul
title "نظام V POWER TUNING - التشغيل المحلي"
color 0A
cls

echo =====================================
echo   نظام توزيع المهام V POWER TUNING
echo =====================================
echo.

REM Change to script directory
cd /d "%~dp0"
echo المجلد الحالي: %CD%
echo.

REM Check if Node.js is available
echo فحص Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Node.js غير مثبت أو غير معترف به
    echo.
    echo الرجاء:
    echo 1. تثبيت Node.js من https://nodejs.org
    echo 2. أو البحث عن "Node.js command prompt" في قائمة Start
    echo.
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js موجود: %NODE_VERSION%

REM Check npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ✗ npm غير متوفر
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✓ npm موجود: %NPM_VERSION%
echo.

REM Check project files
if not exist "package.json" (
    echo ✗ ملف package.json غير موجود
    echo تأكد من تشغيل الملف داخل مجلد offline-system
    pause
    exit /b 1
)
echo ✓ ملفات المشروع موجودة

REM Check if tasks.db exists
if not exist "tasks.db" (
    echo ✓ سيتم إنشاء قاعدة البيانات تلقائياً
) else (
    echo ✓ قاعدة البيانات موجودة
)
echo.

REM Install dependencies if needed
if not exist "node_modules" (
    echo تثبيت المكتبات المطلوبة...
    echo هذا يحدث مرة واحدة فقط ويحتاج اتصال بالإنترنت
    echo الرجاء الانتظار...
    echo.
    
    call npm install --no-optional --force
    if errorlevel 1 (
        echo.
        echo ✗ فشل في تثبيت المكتبات
        echo تأكد من:
        echo 1. الاتصال بالإنترنت
        echo 2. تشغيل Command Prompt كمدير
        echo.
        pause
        exit /b 1
    )
    echo ✓ تم تثبيت المكتبات بنجاح
    echo.
)

REM Set environment for offline operation
set NODE_ENV=development
set PORT=3000

echo ================================
echo      بدء التشغيل الأوفلاين
echo ================================
echo.
echo المنفذ: 3000
echo العنوان: http://localhost:3000
echo.
echo بعد ظهور "serving on port 3000":
echo 1. افتح المتصفح
echo 2. اذهب إلى: http://localhost:3000
echo 3. يمكنك فصل الإنترنت والنظام سيستمر في العمل
echo.
echo لإيقاف النظام: اضغط Ctrl+C
echo ================================
echo.

REM Start the application
npm run dev

echo.
echo تم إيقاف النظام
pause
@echo off
chcp 65001 > nul
title "تشغيل النظام بعد تثبيت Node.js"
color 0A
cls

echo ========================================
echo     تشغيل نظام V POWER TUNING
echo     بعد تثبيت Node.js بنجاح
echo ========================================
echo.

REM Change to script directory
cd /d "%~dp0"

echo المجلد الحالي: %CD%
echo.

echo الخطوة 1: فحص Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ✗ Node.js لا يزال غير معترف به
    echo الحل: أعد تشغيل الكمبيوتر أولاً
    echo أو ابحث عن "Node.js command prompt" واستخدمه
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✓ Node.js يعمل: %NODE_VERSION%

npm --version >nul 2>&1
if errorlevel 1 (
    echo ✗ npm غير متوفر
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version') do set NPM_VERSION=%%i
echo ✓ npm يعمل: %NPM_VERSION%
echo.

echo الخطوة 2: فحص ملفات المشروع...
if not exist "package.json" (
    echo ✗ ملف package.json غير موجود
    echo تأكد من أنك في مجلد offline-system
    pause
    exit /b 1
)
echo ✓ ملفات المشروع موجودة
echo.

echo الخطوة 3: تثبيت المكتبات...
echo هذا يحدث مرة واحدة فقط
echo الرجاء الانتظار...
echo.

call npm install --no-optional --force
if errorlevel 1 (
    echo.
    echo ✗ فشل في تثبيت المكتبات
    echo.
    echo الحلول:
    echo 1. تأكد من الاتصال بالإنترنت
    echo 2. شغل Command Prompt كمدير
    echo 3. أو جرب: npm install --force
    echo.
    pause
    exit /b 1
)

echo.
echo ✓ تم تثبيت المكتبات بنجاح!
echo.

echo الخطوة 4: بدء التشغيل...
set NODE_ENV=development
set PORT=3000

echo =====================================
echo      النظام يعمل الآن!
echo =====================================
echo.
echo المنفذ: 3000
echo العنوان: http://localhost:3000
echo.
echo بعد ظهور "serving on port 3000":
echo 1. افتح المتصفح
echo 2. اذهب إلى: http://localhost:3000
echo 3. ابدأ استخدام النظام
echo.
echo النظام يعمل أوفلاين بعد التحميل الأولي
echo لإيقاف النظام: اضغط Ctrl+C
echo =====================================
echo.

npm run dev

echo.
echo تم إيقاف النظام
pause
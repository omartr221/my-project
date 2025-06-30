@echo off
chcp 65001 > nul
title "تشغيل نهائي - V POWER TUNING"

echo =========================================
echo    نظام توزيع المهام - V POWER TUNING
echo =========================================
echo.

REM Change to the script's directory
cd /d "%~dp0"

echo المجلد الحالي: %CD%
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ✗ خطأ: ملف package.json غير موجود
    echo تأكد من تشغيل الملف من داخل مجلد offline-system
    echo.
    pause
    exit /b 1
)

echo ✓ تم العثور على ملفات المشروع
echo.

REM Install dependencies if needed
if not exist "node_modules\" (
    echo تثبيت المكتبات...
    echo يرجى الانتظار...
    npm install --force
    if errorlevel 1 (
        echo فشل في تثبيت المكتبات
        echo تأكد من الاتصال بالإنترنت
        pause
        exit /b 1
    )
    echo تم التثبيت بنجاح ✓
    echo.
)

echo بدء تشغيل النظام...
echo.
echo ========================================
echo   النظام سيعمل على: http://localhost:3000
echo   افتح المتصفح وادخل العنوان أعلاه
echo ========================================
echo.
echo لإيقاف النظام: اضغط Ctrl+C
echo.

npm run dev
@echo off
chcp 65001 > nul
title "نظام توزيع المهام - V POWER TUNING"
cls
echo =========================================
echo    نظام توزيع المهام - V POWER TUNING
echo =========================================
echo.
echo تشغيل النظام...
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo تثبيت المكتبات للمرة الأولى...
    echo يرجى التأكد من الاتصال بالإنترنت...
    echo.
    call npm install
    if errorlevel 1 (
        echo.
        echo خطأ في التثبيت! تأكد من:
        echo 1. الاتصال بالإنترنت
        echo 2. تثبيت Node.js صحيح
        echo.
        pause
        exit /b 1
    )
    echo.
    echo تم التثبيت بنجاح!
    echo.
)

echo بدء تشغيل النظام...
echo.
echo ========================================
echo   النظام يعمل على: http://localhost:3000
echo   افتح المتصفح وادخل العنوان أعلاه
echo ========================================
echo.
echo لإيقاف النظام: اضغط Ctrl+C
echo.

npm run dev

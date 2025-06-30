@echo off
chcp 65001 > nul
title "تنظيف وإعادة تثبيت - V POWER TUNING"
cls
echo =========================================
echo     تنظيف وإعادة تثبيت المكتبات
echo =========================================
echo.

echo حذف المكتبات القديمة...
if exist "node_modules" rmdir /s /q "node_modules"
if exist "package-lock.json" del "package-lock.json"

echo.
echo تنظيف ذاكرة npm...
call npm cache clean --force

echo.
echo تثبيت المكتبات من جديد...
echo يرجى التأكد من الاتصال بالإنترنت...
call npm install --no-optional --legacy-peer-deps

if errorlevel 1 (
    echo.
    echo خطأ في التثبيت! جرب:
    echo 1. تأكد من الاتصال بالإنترنت
    echo 2. شغل Command Prompt كمدير
    echo.
    pause
    exit /b 1
)

echo.
echo تم التثبيت بنجاح!
echo يمكنك الآن استخدام start.bat
echo.
pause
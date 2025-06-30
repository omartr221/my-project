@echo off
chcp 65001 > nul
echo تشغيل نظام توزيع المهام...
echo.
echo تثبيت المكتبات المطلوبة...
call npm install
if errorlevel 1 (
    echo خطأ في تثبيت المكتبات - تأكد من الاتصال بالإنترنت
    pause
    exit /b 1
)
echo.
echo بدء تشغيل النظام...
echo افتح المتصفح على: http://localhost:3000
echo.
echo لإغلاق النظام اضغط Ctrl+C
call npm run dev

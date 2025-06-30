@echo off
chcp 65001 > nul
echo تثبيت المكتبات للمرة الأولى...
echo.
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
echo الآن يمكنك استخدام start.bat لتشغيل النظام
echo.
pause
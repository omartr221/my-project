@echo off
echo تثبيت وتشغيل V POWER TUNING...

npm install
if %errorlevel% neq 0 (
    echo خطأ في تثبيت المتطلبات
    pause
    exit /b 1
)

echo بدء تشغيل السيرفر...
npm start

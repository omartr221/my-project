@echo off
chcp 65001 > nul
echo تشغيل نظام توزيع المهام...
echo.
echo تثبيت المكتبات المطلوبة...
call npm install
echo.
echo بدء تشغيل النظام...
echo افتح المتصفح على: http://localhost:5000
call npm run dev
pause

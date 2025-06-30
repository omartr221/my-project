@echo off
chcp 65001 > nul
echo تشغيل نظام توزيع المهام على المنفذ 4000...
echo.
echo تثبيت المكتبات المطلوبة...
call npm install
echo.
echo بدء تشغيل النظام...
echo افتح المتصفح على: http://localhost:4000
set PORT=4000
call npm run dev
pause
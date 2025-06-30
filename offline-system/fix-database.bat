@echo off
chcp 65001 > nul
echo إصلاح قاعدة البيانات...
echo.

echo حذف قاعدة البيانات القديمة...
if exist tasks.db del tasks.db

echo تثبيت المكتبات...
call npm install

echo إنشاء قاعدة بيانات جديدة...
call npm run dev &

timeout /t 5 > nul

echo تم إصلاح قاعدة البيانات بنجاح!
echo يمكنك الآن استخدام start.bat لتشغيل النظام
pause
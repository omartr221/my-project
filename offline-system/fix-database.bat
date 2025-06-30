@echo off
chcp 65001 > nul
title "إصلاح قاعدة البيانات"

echo إصلاح قاعدة البيانات...
echo.

REM Backup existing database
if exist "tasks.db" (
    copy "tasks.db" "tasks_backup.db"
    echo تم عمل نسخة احتياطية ✓
)

REM Delete existing database
if exist "tasks.db" del "tasks.db"

echo إعادة إنشاء قاعدة البيانات...
npm run db:push

echo تم إصلاح قاعدة البيانات ✓
echo.
pause
@echo off
title V POWER TUNING - SQLite - بدون إنترنت
color 0A
echo.
echo  ██╗   ██╗    ██████╗  ██████╗ ██╗    ██╗███████╗██████╗ 
echo  ██║   ██║    ██╔══██╗██╔═══██╗██║    ██║██╔════╝██╔══██╗
echo  ██║   ██║    ██████╔╝██║   ██║██║ █╗ ██║█████╗  ██████╔╝
echo  ╚██╗ ██╔╝    ██╔═══╝ ██║   ██║██║███╗██║██╔══╝  ██╔══██╗
echo   ╚████╔╝     ██║     ╚██████╔╝╚███╔███╔╝███████╗██║  ██║
echo    ╚═══╝      ╚═╝      ╚═════╝  ╚══╝╚══╝ ╚══════╝╚═╝  ╚═╝
echo.
echo                    🗄️ إصدار SQLite المحلي
echo                    ========================
echo.
echo ⚡ تشغيل النظام مع قاعدة بيانات SQLite المحلية...
echo 🔒 لا يحتاج إنترنت - كل البيانات على جهازك
echo 💾 نسخ احتياطية تلقائية كل ساعة
echo.

echo ⏳ تشغيل السيرفر...
start "V POWER SQLite Server" cmd /k "npm run dev:sqlite"

echo ⏳ انتظار 5 ثوان لتشغيل السيرفر...
timeout /t 5 /nobreak > nul

echo 🖥️ تشغيل التطبيق المكتبي...
npx electron electron-lightweight.js

echo.
echo ✅ النظام جاهز للاستخدام!
echo 📍 قاعدة البيانات: v-power-tuning.db (محلية)
echo 🔒 يعمل بدون إنترنت تماماً
echo 💾 النسخ الاحتياطية في مجلد backups/
echo.
pause
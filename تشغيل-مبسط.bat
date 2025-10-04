@echo off
echo 🚀 V POWER TUNING Desktop - تشغيل مبسط
echo =======================================
echo.
echo تأكد أن السيرفر يعمل على http://localhost:5000
echo إذا لم يعمل، شغل في نافذة أخرى: npm run dev
echo.
pause
echo تشغيل التطبيق المكتبي...
npx electron electron-lightweight.js
pause
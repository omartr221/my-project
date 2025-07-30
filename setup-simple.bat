@echo off
echo 🔧 إعداد V POWER TUNING - مبسط
echo ============================
echo.

echo ⏳ تثبيت المكتبات الأساسية فقط...
npm install --omit=optional --no-optional

echo.
echo ⏳ تثبيت Electron بدون dependencies معقدة...
npm install electron --no-save --ignore-scripts

echo.
echo ✅ انتهى الإعداد!
echo.
echo 📋 للتشغيل:
echo 1. شغل: npm run dev
echo 2. شغل: تشغيل-مبسط.bat
echo.
pause
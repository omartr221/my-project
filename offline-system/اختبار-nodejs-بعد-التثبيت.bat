@echo off
chcp 65001 > nul
title "اختبار Node.js بعد إعادة التثبيت"
color 0A
cls

echo ========================================
echo        اختبار Node.js بعد التثبيت
echo ========================================
echo.

echo فحص Node.js...
echo.

REM Test Node.js
echo تجربة: node --version
node --version
if errorlevel 1 (
    echo ✗ Node.js غير معترف به
    echo.
    echo ما يجب فعله:
    echo 1. تأكد من إعادة تشغيل الكمبيوتر بعد التثبيت
    echo 2. افتح Command Prompt جديد
    echo 3. أو ابحث عن "Node.js command prompt"
    echo.
    goto :error
) else (
    echo ✓ Node.js يعمل بشكل صحيح
)

echo.
echo تجربة: npm --version
npm --version
if errorlevel 1 (
    echo ✗ npm غير معترف به
    goto :error
) else (
    echo ✓ npm يعمل بشكل صحيح
)

echo.
echo ========================================
echo ✓ Node.js مثبت ويعمل بشكل صحيح!
echo ========================================
echo.

echo الآن يمكنك:
echo 1. استخدام ملف "تشغيل-محلي-كامل.bat"
echo 2. أو تشغيل الأوامر يدوياً في Command Prompt:
echo    - npm install
echo    - npm run dev
echo.

echo اضغط أي زر للمتابعة...
pause >nul
exit /b 0

:error
echo.
echo ========================================
echo          Node.js لا يعمل بعد
echo ========================================
echo.

echo الحلول:
echo.
echo 1. إعادة تثبيت Node.js:
echo    - حمل من: https://nodejs.org
echo    - اختر النسخة LTS
echo    - شغل كمدير (Run as administrator)
echo    - اختر "Add to PATH" أثناء التثبيت
echo    - أعد تشغيل الكمبيوتر
echo.

echo 2. استخدام Node.js Command Prompt:
echo    - ابحث في قائمة Start
echo    - "Node.js command prompt"
echo.

echo 3. النسخة البديلة:
echo    - استخدم ملف "نسخة-بدون-nodejs.html"
echo    - يعمل بدون Node.js
echo.

echo 4. إضافة PATH يدوياً:
echo    - Windows + R ثم اكتب: sysdm.cpl
echo    - Environment Variables
echo    - أضف: C:\Program Files\nodejs
echo.

echo اضغط أي زر للخروج...
pause >nul
exit /b 1
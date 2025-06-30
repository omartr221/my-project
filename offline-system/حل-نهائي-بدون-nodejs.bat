@echo off
chcp 65001 > nul
title "حل مشكلة Node.js - V POWER TUNING"
color 0E
cls

echo ========================================
echo      حل مشكلة Node.js غير معترف به
echo ========================================
echo.

echo المشكلة: Node.js غير معترف به في النظام
echo.

echo الحلول المتاحة:
echo ================
echo.

echo 1. تثبيت Node.js من جديد:
echo    - اذهب إلى: https://nodejs.org
echo    - حمل النسخة LTS (مستطيل أخضر)
echo    - شغل الملف المحمل
echo    - اختر "Add to PATH" أثناء التثبيت
echo    - أعد تشغيل الكمبيوتر
echo.

echo 2. استخدام Node.js Command Prompt:
echo    - اضغط Windows + S
echo    - ابحث عن: "Node.js command prompt"
echo    - افتحه إذا وُجد
echo.

echo 3. تحقق من التثبيت الحالي:
echo    - ابحث في: C:\Program Files\nodejs
echo    - أو في: C:\Program Files (x86)\nodejs
echo.

echo 4. استخدام PowerShell:
echo    - اضغط Windows + X
echo    - اختر "Windows PowerShell (Admin)"
echo.

echo ========================================
echo.

echo جرب هذه الأوامر في Command Prompt:
echo.
echo where node
echo where npm
echo.

echo إذا ظهرت مسارات، Node.js مثبت لكن ليس في PATH
echo.

echo لإضافة Node.js للـ PATH يدوياً:
echo 1. اضغط Windows + R
echo 2. اكتب: sysdm.cpl
echo 3. اضغط "Environment Variables"
echo 4. في "System Variables" ابحث عن "Path"
echo 5. اضغط "Edit"
echo 6. اضغط "New"
echo 7. أضف: C:\Program Files\nodejs
echo 8. اضغط OK واعد تشغيل الكمبيوتر
echo.

echo ========================================
echo        بديل - نسخة مختصرة للنظام
echo ========================================
echo.

echo إذا لم تنجح جميع الطرق أعلاه:
echo يمكنني إنشاء نسخة مبسطة تعمل بدون Node.js
echo (باستخدام HTML و JavaScript فقط)
echo.

echo هل تريد المتابعة مع Node.js أم النسخة المبسطة؟
echo.

pause
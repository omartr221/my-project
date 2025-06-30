@echo off
chcp 65001 > nul
title "حل مشكلة Node.js PATH"
color 0C
cls

echo ========================================
echo        حل مشكلة Node.js PATH
echo ========================================
echo.

echo المشكلة: Node.js مثبت لكن غير معترف به
echo.

echo الحلول المتاحة:
echo ==================
echo.

echo 1. إضافة PATH يدوياً (الحل الأفضل):
echo    أ. اضغط Windows + R
echo    ب. اكتب: sysdm.cpl
echo    ج. اضغط "Environment Variables"
echo    د. ابحث عن "Path" في "System variables"
echo    هـ. اضغط "Edit"
echo    و. اضغط "New" وأضف:
echo       C:\Program Files\nodejs
echo    ز. اضغط "New" مرة أخرى وأضف:
echo       C:\Users\%USERNAME%\AppData\Roaming\npm
echo    ح. اضغط OK على جميع النوافذ
echo    ط. أعد تشغيل الكمبيوتر
echo.

echo 2. البحث عن Node.js Command Prompt:
echo    أ. اضغط Windows + S
echo    ب. ابحث عن: "Node.js command prompt"
echo    ج. افتحه إذا وُجد
echo    د. انتقل لمجلد offline-system
echo    هـ. شغل: npm install ثم npm run dev
echo.

echo 3. فحص مجلدات التثبيت:
echo    تحقق من وجود Node.js في:
echo    - C:\Program Files\nodejs
echo    - C:\Program Files (x86)\nodejs
echo    - %LOCALAPPDATA%\Programs\node
echo.

echo 4. إعادة تثبيت Node.js:
echo    أ. احذف Node.js من Control Panel
echo    ب. حمل النسخة الجديدة من nodejs.org
echo    ج. شغل التثبيت كمدير (Run as administrator)
echo    د. تأكد من اختيار "Add to PATH"
echo    هـ. أعد تشغيل الكمبيوتر
echo.

echo ========================================
echo           الحل البديل الفوري
echo ========================================
echo.

echo إذا استمرت المشاكل، استخدم:
echo ملف "نسخة-بدون-nodejs.html"
echo.
echo يعمل فوراً بدون Node.js مع:
echo ✓ جميع العمال الـ11
echo ✓ إنشاء وإدارة المهام
echo ✓ تتبع الوقت
echo ✓ حفظ البيانات
echo ✓ واجهة عربية كاملة
echo.

echo فقط اضغط مرتين على الملف!
echo.

echo ========================================
echo.

echo هل تريد فتح النسخة البديلة الآن؟
echo اضغط Y للفتح أو أي زر آخر للمتابعة
echo.

set /p choice="اختيارك: "
if /i "%choice%"=="Y" (
    start "" "نسخة-بدون-nodejs.html"
    echo تم فتح النسخة البديلة في المتصفح
)

echo.
pause
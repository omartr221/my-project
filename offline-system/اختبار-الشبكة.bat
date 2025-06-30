@echo off
chcp 65001 > nul
title "اختبار اتصال الشبكة - V POWER TUNING"
color 0E
cls

echo ========================================
echo       اختبار اتصال الشبكة المحلية
echo ========================================
echo.

echo فحص إعدادات الشبكة...
echo.

REM Get network information
echo معلومات الشبكة:
echo ================
ipconfig | findstr /C:"IPv4" /C:"Subnet Mask" /C:"Default Gateway"
echo.

REM Get local IP
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set "ip=%%a"
    goto :got_ip
)
:got_ip
set ip=%ip: =%

echo عنوان IP الحالي: %ip%
echo.

echo فحص المنفذ 3000...
echo.

REM Check if port 3000 is available
netstat -an | findstr :3000 >nul
if %errorlevel% == 0 (
    echo ✓ المنفذ 3000 مستخدم (الخادم قد يكون يعمل)
) else (
    echo ○ المنفذ 3000 متاح
)

echo.
echo ========================================
echo          عناوين الاتصال المتاحة
echo ========================================
echo.

echo للوصول من نفس الجهاز:
echo http://localhost:3000
echo http://127.0.0.1:3000
echo.

echo للوصول من أجهزة أخرى في الشبكة:
echo http://%ip%:3000
echo.

echo فحص الاتصال بالشبكة المحلية...
echo.

REM Test ping to gateway
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"Default Gateway"') do (
    set "gateway=%%a"
    goto :got_gateway
)
:got_gateway
set gateway=%gateway: =%

if not "%gateway%"=="" (
    echo اختبار الاتصال بالراوتر: %gateway%
    ping -n 2 %gateway% >nul
    if %errorlevel% == 0 (
        echo ✓ الاتصال بالراوتر يعمل
    ) else (
        echo ✗ مشكلة في الاتصال بالراوتر
    )
) else (
    echo ✗ لم يتم العثور على الراوتر
)

echo.
echo ========================================
echo           تعليمات الاستخدام
echo ========================================
echo.

echo 1. تشغيل الخادم:
echo    - شغل ملف "تشغيل-سيرفر-الشبكة.bat"
echo    - انتظر رسالة "Server is running"
echo.

echo 2. الاتصال من أجهزة أخرى:
echo    - افتح المتصفح على الجهاز الآخر
echo    - اكتب: http://%ip%:3000
echo    - اضغط Enter
echo.

echo 3. حل المشاكل:
echo    - تأكد من نفس الشبكة (WiFi)
echo    - أغلق جدار الحماية مؤقتاً للاختبار
echo    - جرب إعادة تشغيل الراوتر
echo.

echo ========================================
echo.

pause
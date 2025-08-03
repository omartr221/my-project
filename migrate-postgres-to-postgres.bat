@echo off
chcp 65001 >nul
title V POWER TUNING - Database Migration

echo 🚀 بدء عملية نقل البيانات من PostgreSQL إلى PostgreSQL...

REM متغيرات قاعدة البيانات المصدر (القديمة)
set SOURCE_DB=postgresql://neondb_owner:npg_kpKv9l0QYdsB@ep-delicate-sunset-a2xc8ixw.eu-central-1.aws.neon.tech/neondb?sslmode=require

REM متغيرات قاعدة البيانات الهدف (الجديدة)  
set TARGET_DB=postgresql://neondb_owner:npg_VtkKIpy0P2nW@ep-falling-union-aehti4wu-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require^&channel_binding=require

REM اسم ملف النسخة الاحتياطية
for /f "tokens=2 delims==" %%a in ('wmic OS Get localdatetime /value') do set "dt=%%a"
set "YY=%dt:~2,2%" & set "YYYY=%dt:~0,4%" & set "MM=%dt:~4,2%" & set "DD=%dt:~6,2%"
set "HH=%dt:~8,2%" & set "Min=%dt:~10,2%" & set "Sec=%dt:~12,2%"
set "BACKUP_FILE=v-power-tuning-backup-%YYYY%%MM%%DD%_%HH%%Min%%Sec%.sql"

echo 📋 معلومات العملية:
echo    - المصدر: قاعدة البيانات القديمة (ep-delicate-sunset)
echo    - الهدف: قاعدة البيانات الجديدة (ep-falling-union)
echo    - ملف النسخة الاحتياطية: %BACKUP_FILE%
echo.

REM التحقق من وجود pg_dump و psql
where pg_dump >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ خطأ: pg_dump غير مثبت على النظام
    echo 💡 تحتاج إلى تثبيت PostgreSQL client tools
    echo    - تحميل من https://www.postgresql.org/download/windows/
    echo    - أو تثبيت PostgreSQL كاملاً
    pause
    exit /b 1
)

where psql >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ خطأ: psql غير مثبت على النظام
    pause
    exit /b 1
)

echo ✅ تم التحقق من أدوات PostgreSQL

REM الخطوة 1: اختبار الاتصال بقاعدة البيانات المصدر
echo.
echo 🔗 اختبار الاتصال بقاعدة البيانات المصدر...
psql "%SOURCE_DB%" -c "SELECT 'اتصال ناجح' as status;" >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ نجح الاتصال بقاعدة البيانات المصدر
) else (
    echo ❌ فشل الاتصال بقاعدة البيانات المصدر
    echo 💡 تأكد من صحة رابط قاعدة البيانات وإعدادات الشبكة
    pause
    exit /b 1
)

REM الخطوة 2: اختبار الاتصال بقاعدة البيانات الهدف
echo.
echo 🔗 اختبار الاتصال بقاعدة البيانات الهدف...
psql "%TARGET_DB%" -c "SELECT 'اتصال ناجح' as status;" >nul 2>nul
if %errorlevel% equ 0 (
    echo ✅ نجح الاتصال بقاعدة البيانات الهدف
) else (
    echo ❌ فشل الاتصال بقاعدة البيانات الهدف
    echo 💡 تأكد من صحة رابط قاعدة البيانات وإعدادات الشبكة
    pause
    exit /b 1
)

REM الخطوة 3: إنشاء نسخة احتياطية من قاعدة البيانات المصدر
echo.
echo 📦 إنشاء نسخة احتياطية من البيانات...
echo ⏳ جاري تصدير البيانات من المصدر...

pg_dump "%SOURCE_DB%" --verbose --no-owner --no-privileges --format=custom --file="%BACKUP_FILE%" --exclude-table-data=pg_stat_statements

if %errorlevel% equ 0 (
    echo ✅ تم إنشاء النسخة الاحتياطية بنجاح: %BACKUP_FILE%
    
    REM عرض حجم الملف
    for %%A in ("%BACKUP_FILE%") do set file_size=%%~zA
    echo 📊 حجم النسخة الاحتياطية: %file_size% bytes
) else (
    echo ❌ فشل في إنشاء النسخة الاحتياطية
    pause
    exit /b 1
)

REM الخطوة 4: تنظيف قاعدة البيانات الهدف (اختياري)
echo.
set /p clean_target="🗑️ هل تريد مسح البيانات الموجودة في قاعدة البيانات الهدف؟ (y/N): "

if /i "%clean_target%"=="y" (
    echo 🧹 مسح البيانات الموجودة في قاعدة البيانات الهدف...
    
    REM الحصول على قائمة الجداول ومسحها
    psql "%TARGET_DB%" -c "DO $$ DECLARE r RECORD; BEGIN FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE'; END LOOP; FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE'; END LOOP; END $$;"
    
    if %errorlevel% equ 0 (
        echo ✅ تم مسح البيانات القديمة
    ) else (
        echo ⚠️ حدث خطأ أثناء مسح البيانات القديمة، سيتم المتابعة
    )
)

REM الخطوة 5: استيراد البيانات إلى قاعدة البيانات الهدف
echo.
echo 📥 استيراد البيانات إلى قاعدة البيانات الهدف...
echo ⏳ جاري استيراد البيانات...

pg_restore --verbose --clean --no-owner --no-privileges --dbname="%TARGET_DB%" "%BACKUP_FILE%"

if %errorlevel% equ 0 (
    echo ✅ تم استيراد البيانات بنجاح!
) else (
    echo ❌ حدث خطأ أثناء استيراد البيانات
    echo 💡 تحقق من رسائل الخطأ أعلاه للمزيد من التفاصيل
    pause
    exit /b 1
)

REM الخطوة 6: التحقق من البيانات المستوردة
echo.
echo 🔍 التحقق من البيانات المستوردة...

echo 📊 عدد الجداول في قاعدة البيانات الهدف:
psql "%TARGET_DB%" -c "SELECT schemaname as \"المخطط\", tablename as \"اسم الجدول\", (SELECT count(*) FROM information_schema.columns WHERE table_name = tablename AND table_schema = schemaname) as \"عدد الأعمدة\" FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;"

echo.
echo 📈 عدد السجلات في كل جدول:
psql "%TARGET_DB%" -c "DO $$ DECLARE table_record RECORD; row_count INTEGER; BEGIN FOR table_record IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP EXECUTE 'SELECT count(*) FROM ' || quote_ident(table_record.tablename) INTO row_count; RAISE NOTICE 'الجدول %%: %% سجل', table_record.tablename, row_count; END LOOP; END $$;"

REM الخطوة 7: إنشاء ملف إعدادات للنظام
echo.
echo ⚙️ تحديث إعدادات النظام...

echo # إعدادات قاعدة البيانات المحدثة - V POWER TUNING > database-config.txt
echo # تاريخ التحديث: %date% %time% >> database-config.txt
echo. >> database-config.txt
echo # قاعدة البيانات الجديدة (Render PostgreSQL) >> database-config.txt
echo DATABASE_URL=postgresql://neondb_owner:npg_VtkKIpy0P2nW@ep-falling-union-aehti4wu-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require^&channel_binding=require >> database-config.txt
echo. >> database-config.txt
echo # معلومات التطبيق >> database-config.txt
echo APP_NAME=V POWER TUNING >> database-config.txt
echo APP_VERSION=2.0.0 >> database-config.txt
echo MIGRATION_DATE=%date% %time% >> database-config.txt
echo BACKUP_FILE=%BACKUP_FILE% >> database-config.txt
echo. >> database-config.txt
echo # ملاحظات: >> database-config.txt
echo # - تم نقل البيانات من PostgreSQL القديم إلى الجديد >> database-config.txt
echo # - النسخة الاحتياطية محفوظة في: %BACKUP_FILE% >> database-config.txt
echo # - مستخدم الاستقبال: كلمة المرور 11 >> database-config.txt

echo ✅ تم إنشاء ملف إعدادات قاعدة البيانات: database-config.txt

REM الخطوة 8: تنظيف الملفات المؤقتة (اختياري)
echo.
set /p delete_backup="🗑️ هل تريد حذف ملف النسخة الاحتياطية؟ (N/y): "

if /i "%delete_backup%"=="y" (
    del "%BACKUP_FILE%"
    echo 🗑️ تم حذف ملف النسخة الاحتياطية
) else (
    echo 💾 تم الاحتفاظ بملف النسخة الاحتياطية: %BACKUP_FILE%
)

echo.
echo 🎉 تمت عملية نقل البيانات بنجاح!
echo.
echo 📋 ملخص العملية:
echo    ✅ تم نقل جميع الجداول والبيانات
echo    ✅ قاعدة البيانات الجديدة جاهزة للاستخدام
echo    ✅ تم إنشاء ملف الإعدادات: database-config.txt
echo.
echo 🔄 الخطوات التالية:
echo    1. تحديث متغير DATABASE_URL في تطبيق Replit
echo    2. إعادة تشغيل التطبيق
echo    3. اختبار تسجيل الدخول بمستخدم الاستقبال (كلمة المرور: 11)
echo.
echo ✨ عملية النقل مكتملة!
echo.
pause
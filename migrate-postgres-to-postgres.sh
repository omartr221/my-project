#!/bin/bash

# نقل البيانات من PostgreSQL القديم إلى الجديد
# V POWER TUNING Migration Script

echo "🚀 بدء عملية نقل البيانات من PostgreSQL إلى PostgreSQL..."

# متغيرات قاعدة البيانات المصدر (القديمة)
SOURCE_DB="postgresql://neondb_owner:npg_kpKv9l0QYdsB@ep-delicate-sunset-a2xc8ixw.eu-central-1.aws.neon.tech/neondb?sslmode=require"

# متغيرات قاعدة البيانات الهدف (الجديدة)  
TARGET_DB="postgresql://neondb_owner:npg_VtkKIpy0P2nW@ep-falling-union-aehti4wu-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

# اسم ملف النسخة الاحتياطية
BACKUP_FILE="v-power-tuning-backup-$(date +%Y%m%d_%H%M%S).sql"

echo "📋 معلومات العملية:"
echo "   - المصدر: قاعدة البيانات القديمة (ep-delicate-sunset)"
echo "   - الهدف: قاعدة البيانات الجديدة (ep-falling-union)"
echo "   - ملف النسخة الاحتياطية: $BACKUP_FILE"
echo ""

# التحقق من وجود pg_dump و psql
if ! command -v pg_dump &> /dev/null; then
    echo "❌ خطأ: pg_dump غير مثبت على النظام"
    echo "💡 تحتاج إلى تثبيت PostgreSQL client tools"
    echo "   - Windows: تحميل من https://www.postgresql.org/download/windows/"
    echo "   - macOS: brew install postgresql"
    echo "   - Ubuntu/Debian: sudo apt install postgresql-client"
    exit 1
fi

if ! command -v psql &> /dev/null; then
    echo "❌ خطأ: psql غير مثبت على النظام"
    exit 1
fi

echo "✅ تم التحقق من أدوات PostgreSQL"

# الخطوة 1: اختبار الاتصال بقاعدة البيانات المصدر
echo ""
echo "🔗 اختبار الاتصال بقاعدة البيانات المصدر..."
if psql "$SOURCE_DB" -c "SELECT 'اتصال ناجح' as status;" &> /dev/null; then
    echo "✅ نجح الاتصال بقاعدة البيانات المصدر"
else
    echo "❌ فشل الاتصال بقاعدة البيانات المصدر"
    echo "💡 تأكد من صحة رابط قاعدة البيانات وإعدادات الشبكة"
    exit 1
fi

# الخطوة 2: اختبار الاتصال بقاعدة البيانات الهدف
echo ""
echo "🔗 اختبار الاتصال بقاعدة البيانات الهدف..."
if psql "$TARGET_DB" -c "SELECT 'اتصال ناجح' as status;" &> /dev/null; then
    echo "✅ نجح الاتصال بقاعدة البيانات الهدف"
else
    echo "❌ فشل الاتصال بقاعدة البيانات الهدف"
    echo "💡 تأكد من صحة رابط قاعدة البيانات وإعدادات الشبكة"
    exit 1
fi

# الخطوة 3: إنشاء نسخة احتياطية من قاعدة البيانات المصدر
echo ""
echo "📦 إنشاء نسخة احتياطية من البيانات..."
echo "⏳ جاري تصدير البيانات من المصدر..."

pg_dump "$SOURCE_DB" \
    --verbose \
    --no-owner \
    --no-privileges \
    --format=custom \
    --file="$BACKUP_FILE" \
    --exclude-table-data=pg_stat_statements

if [ $? -eq 0 ]; then
    echo "✅ تم إنشاء النسخة الاحتياطية بنجاح: $BACKUP_FILE"
    
    # عرض حجم الملف
    if command -v ls &> /dev/null; then
        file_size=$(ls -lh "$BACKUP_FILE" | awk '{print $5}')
        echo "📊 حجم النسخة الاحتياطية: $file_size"
    fi
else
    echo "❌ فشل في إنشاء النسخة الاحتياطية"
    exit 1
fi

# الخطوة 4: تنظيف قاعدة البيانات الهدف (اختياري)
echo ""
read -p "🗑️ هل تريد مسح البيانات الموجودة في قاعدة البيانات الهدف؟ (y/N): " clean_target

if [[ $clean_target =~ ^[Yy]$ ]]; then
    echo "🧹 مسح البيانات الموجودة في قاعدة البيانات الهدف..."
    
    # الحصول على قائمة الجداول ومسحها
    psql "$TARGET_DB" -c "
    DO \$\$ DECLARE
        r RECORD;
    BEGIN
        -- مسح جميع الجداول
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
            EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
        
        -- مسح جميع التسلسلات
        FOR r IN (SELECT sequence_name FROM information_schema.sequences WHERE sequence_schema = 'public') LOOP
            EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequence_name) || ' CASCADE';
        END LOOP;
    END \$\$;
    "
    
    if [ $? -eq 0 ]; then
        echo "✅ تم مسح البيانات القديمة"
    else
        echo "⚠️ حدث خطأ أثناء مسح البيانات القديمة، سيتم المتابعة"
    fi
fi

# الخطوة 5: استيراد البيانات إلى قاعدة البيانات الهدف
echo ""
echo "📥 استيراد البيانات إلى قاعدة البيانات الهدف..."
echo "⏳ جاري استيراد البيانات..."

pg_restore \
    --verbose \
    --clean \
    --no-owner \
    --no-privileges \
    --dbname="$TARGET_DB" \
    "$BACKUP_FILE"

if [ $? -eq 0 ]; then
    echo "✅ تم استيراد البيانات بنجاح!"
else
    echo "❌ حدث خطأ أثناء استيراد البيانات"
    echo "💡 تحقق من رسائل الخطأ أعلاه للمزيد من التفاصيل"
    exit 1
fi

# الخطوة 6: التحقق من البيانات المستوردة
echo ""
echo "🔍 التحقق من البيانات المستوردة..."

echo "📊 عدد الجداول في قاعدة البيانات الهدف:"
psql "$TARGET_DB" -c "
SELECT 
    schemaname as \"المخطط\",
    tablename as \"اسم الجدول\",
    (SELECT count(*) FROM information_schema.columns WHERE table_name = tablename AND table_schema = schemaname) as \"عدد الأعمدة\"
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
"

echo ""
echo "📈 عدد السجلات في كل جدول:"
psql "$TARGET_DB" -c "
DO \$\$ 
DECLARE 
    table_record RECORD;
    row_count INTEGER;
BEGIN
    FOR table_record IN 
        SELECT tablename FROM pg_tables WHERE schemaname = 'public'
    LOOP
        EXECUTE 'SELECT count(*) FROM ' || quote_ident(table_record.tablename) INTO row_count;
        RAISE NOTICE 'الجدول %: % سجل', table_record.tablename, row_count;
    END LOOP;
END \$\$;
"

# الخطوة 7: إنشاء ملف إعدادات للنظام
echo ""
echo "⚙️ تحديث إعدادات النظام..."

cat > database-config.txt << EOF
# إعدادات قاعدة البيانات المحدثة - V POWER TUNING
# تاريخ التحديث: $(date)

# قاعدة البيانات الجديدة (Render PostgreSQL)
DATABASE_URL=postgresql://neondb_owner:npg_VtkKIpy0P2nW@ep-falling-union-aehti4wu-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# معلومات التطبيق
APP_NAME=V POWER TUNING
APP_VERSION=2.0.0
MIGRATION_DATE=$(date)
BACKUP_FILE=$BACKUP_FILE

# ملاحظات:
# - تم نقل البيانات من PostgreSQL القديم إلى الجديد
# - النسخة الاحتياطية محفوظة في: $BACKUP_FILE
# - مستخدم الاستقبال: كلمة المرور 11
EOF

echo "✅ تم إنشاء ملف إعدادات قاعدة البيانات: database-config.txt"

# الخطوة 8: تنظيف الملفات المؤقتة (اختياري)
echo ""
read -p "🗑️ هل تريد حذف ملف النسخة الاحتياطية؟ (N/y): " delete_backup

if [[ $delete_backup =~ ^[Yy]$ ]]; then
    rm -f "$BACKUP_FILE"
    echo "🗑️ تم حذف ملف النسخة الاحتياطية"
else
    echo "💾 تم الاحتفاظ بملف النسخة الاحتياطية: $BACKUP_FILE"
fi

echo ""
echo "🎉 تمت عملية نقل البيانات بنجاح!"
echo ""
echo "📋 ملخص العملية:"
echo "   ✅ تم نقل جميع الجداول والبيانات"
echo "   ✅ قاعدة البيانات الجديدة جاهزة للاستخدام"
echo "   ✅ تم إنشاء ملف الإعدادات: database-config.txt"
echo ""
echo "🔄 الخطوات التالية:"
echo "   1. تحديث متغير DATABASE_URL في تطبيق Replit"
echo "   2. إعادة تشغيل التطبيق"
echo "   3. اختبار تسجيل الدخول بمستخدم الاستقبال (كلمة المرور: 11)"
echo ""
echo "✨ عملية النقل مكتملة!"
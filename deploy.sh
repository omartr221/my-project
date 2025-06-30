#!/bin/bash

echo "🚀 نشر نظام V POWER TUNING"
echo "=========================="

# إنشاء مجلد النشر
echo "📁 إنشاء مجلد النشر..."
mkdir -p v-power-production
cd v-power-production

# نسخ الملفات المطلوبة
echo "📋 نسخ الملفات..."
cp ../production-server.js ./server.js
cp ../production-package.json ./package.json

# نسخ ملفات الواجهة المبنية
if [ -d "../dist" ]; then
    cp -r ../dist ./
    echo "✅ تم نسخ ملفات الواجهة"
else
    echo "⚠️  ملفات الواجهة غير موجودة - تشغيل البناء..."
    cd ..
    npm run build
    cd v-power-production
    cp -r ../dist ./
fi

# إنشاء ملف البيئة
echo "🔧 إنشاء ملف البيئة..."
cat > .env << EOL
# V POWER TUNING Production Environment
NODE_ENV=production
PORT=5000
HOST=0.0.0.0

# Database Configuration
# استبدل بـ URL قاعدة البيانات الخاصة بك
DATABASE_URL=your_database_url_here
EOL

# إنشاء سكريبت التشغيل للويندوز
cat > start-windows.bat << 'EOL'
@echo off
title V POWER TUNING Production Server
color 0A

echo.
echo ==========================================
echo    V POWER TUNING - Production Server
echo ==========================================
echo.

echo التحقق من Node.js...
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js غير مثبت!
    echo يرجى تحميل وتثبيت Node.js من: https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js متوفر
echo.

echo تثبيت المكتبات...
call npm install --production

if %errorlevel% neq 0 (
    echo ❌ فشل في تثبيت المكتبات
    pause
    exit /b 1
)

echo.
echo 🚀 بدء تشغيل السيرفر...
echo.
echo للوصول للنظام:
echo - من هذا الجهاز: http://localhost:5000
echo - من أجهزة أخرى: http://[IP-ADDRESS]:5000
echo.
echo لإيقاف النظام: اضغط Ctrl+C
echo.

node server.js

pause
EOL

# إنشاء سكريبت التشغيل للينكس/ماك
cat > start-linux.sh << 'EOL'
#!/bin/bash

# إعداد الألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

clear

echo -e "${BLUE}"
echo "=========================================="
echo "   V POWER TUNING - Production Server"
echo "=========================================="
echo -e "${NC}"

echo "التحقق من Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js غير مثبت!${NC}"
    echo "يرجى تحميل وتثبيت Node.js من: https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✅ Node.js متوفر${NC}"
echo ""

echo "تثبيت المكتبات..."
npm install --production

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ فشل في تثبيت المكتبات${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🚀 بدء تشغيل السيرفر...${NC}"
echo ""
echo -e "${YELLOW}للوصول للنظام:${NC}"
echo "- من هذا الجهاز: http://localhost:5000"
echo "- من أجهزة أخرى: http://[IP-ADDRESS]:5000"
echo ""
echo -e "${YELLOW}لإيقاف النظام: اضغط Ctrl+C${NC}"
echo ""

node server.js
EOL

chmod +x start-linux.sh

# إنشاء دليل الإعداد
cat > README.md << 'EOL'
# V POWER TUNING - Production Deployment

## المتطلبات:
- Node.js 18 أو أحدث
- قاعدة بيانات PostgreSQL (Neon أو أي مزود آخر)

## خطوات الإعداد:

### 1. إعداد قاعدة البيانات:
- أنشئ حساب في Neon.tech أو استخدم PostgreSQL محلي
- احصل على DATABASE_URL
- استبدل `your_database_url_here` في ملف `.env`

### 2. تشغيل النظام:

**Windows:**
انقر نقرة مزدوجة على `start-windows.bat`

**Linux/Mac:**
```bash
./start-linux.sh
```

**يدوياً:**
```bash
npm install --production
node server.js
```

### 3. الوصول للنظام:
- محلياً: http://localhost:5000
- من أجهزة أخرى: http://[YOUR-IP]:5000

## الميزات:
- ✅ سيرفر production مستقل
- ✅ قاعدة بيانات PostgreSQL
- ✅ تحديثات مباشرة عبر WebSocket
- ✅ واجهة عربية كاملة
- ✅ جميع ميزات النظام الأصلي

## استكشاف الأخطاء:
1. تأكد من تثبيت Node.js
2. تحقق من DATABASE_URL في ملف .env
3. تأكد من عدم استخدام المنفذ 5000
4. تحقق من اتصال الإنترنت لقاعدة البيانات

## النسخ الاحتياطي:
- البيانات محفوظة في قاعدة البيانات
- يمكن عمل backup من لوحة تحكم Neon
EOL

# إنشاء خدمة systemd (للينكس)
cat > v-power.service << 'EOL'
[Unit]
Description=V POWER TUNING Task Management System
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/path/to/v-power-production
ExecStart=/usr/bin/node server.js
Restart=always
RestartSec=10
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOL

echo ""
echo "✅ تم إنشاء حزمة النشر بنجاح!"
echo ""
echo "📁 المجلد: v-power-production"
echo "🔧 الملفات المطلوبة:"
echo "   - server.js (السيرفر الرئيسي)"
echo "   - package.json (إعدادات المشروع)"
echo "   - dist/ (ملفات الواجهة)"
echo "   - .env (متغيرات البيئة)"
echo "   - start-windows.bat (للويندوز)"
echo "   - start-linux.sh (للينكس/ماك)"
echo "   - README.md (دليل الإعداد)"
echo ""
echo "📋 الخطوات التالية:"
echo "1. انسخ مجلد v-power-production للجهاز المطلوب"
echo "2. عدّل DATABASE_URL في ملف .env"
echo "3. شغل النظام حسب نظام التشغيل"
echo ""
echo "🎯 النظام سيعمل على: http://[IP]:5000"
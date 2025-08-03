#!/bin/bash

echo "🚀 إعداد المشروع للنشر على Render..."

# نسخ إعدادات Render
echo "📦 تحديث package.json..."
cp package-render.json package.json

# التحقق من الملفات المطلوبة
echo "🔍 التحقق من الملفات..."
if [ ! -f "src/main.tsx" ]; then
    echo "❌ خطأ: src/main.tsx غير موجود!"
    exit 1
fi

if [ ! -f "index.html" ]; then
    echo "❌ خطأ: index.html غير موجود!"
    exit 1
fi

echo "✅ جميع الملفات موجودة"

# إضافة الملفات لـ Git
echo "📤 إضافة الملفات لـ Git..."
git add src/main.tsx
git add index.html
git add package.json
git add render.yaml
git add RENDER-DEPLOYMENT-GUIDE.md
git add render-setup.md
git add deploy-to-render.sh

# رفع التحديثات
echo "🔄 رفع التحديثات..."
git commit -m "🚀 Add complete Render deployment support

- Fix /src/main.tsx path issue for Render
- Add index.html in root for Vite
- Update package.json with Render settings
- Add render.yaml for auto-deployment
- Include deployment guides and scripts

All files ready for Render deployment!"

git push

echo "✅ تم! الآن يمكنك:"
echo "1. الذهاب إلى Render Dashboard"
echo "2. ربط المشروع بـ GitHub"  
echo "3. ضبط Build Command: npm run build"
echo "4. ضبط Start Command: npm start"
echo "5. إضافة DATABASE_URL في Environment Variables"
echo ""
echo "🌐 رابط قاعدة البيانات:"
echo "postgresql://neondb_owner:npg_VtkKIpy0P2nW@ep-falling-union-aehti4wu-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
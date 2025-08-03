# دليل نشر V POWER TUNING على Render

## المشكلة
Render لا يجد ملف `/src/main.tsx` لأن بنية المشروع تستخدم `client/src/main.tsx`.

## الحل المطبق

### 1. ملفات تم إنشاؤها لحل المشكلة:

- ✅ `src/main.tsx` - نقطة الدخول الرئيسية لـ Render
- ✅ `index.html` - ملف HTML الجذر
- ✅ `package-render.json` - إعدادات خاصة بـ Render
- ✅ `render.yaml` - إعدادات نشر Render
- ✅ `render-build.sh` - سكريبت البناء
- ✅ `Dockerfile.render` - Docker خاص بـ Render

### 2. خطوات النشر على Render:

#### الطريقة الأولى: استخدام الملفات الجديدة
```bash
# 1. نسخ package-render.json فوق package.json
cp package-render.json package.json

# 2. رفع الملفات إلى GitHub
git add .
git commit -m "Add Render deployment files"
git push

# 3. في Render Dashboard:
# - Build Command: npm run build
# - Start Command: npm start
# - Node Version: 20
```

#### الطريقة الثانية: استخدام Docker
```bash
# استخدام Dockerfile.render
# في Render اختر Docker deployment
```

### 3. متغيرات البيئة المطلوبة في Render:

```
NODE_ENV=production
DATABASE_URL=postgresql://[your-neon-db-url]
```

### 4. إعدادات قاعدة البيانات:

استخدم قاعدة البيانات الحالية:
```
postgresql://neondb_owner:npg_VtkKIpy0P2nW@ep-falling-union-aehti4wu-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

### 5. تحقق من النشر:

- ✅ يجب أن يعمل API endpoint: `/api/login`
- ✅ يجب أن يعمل تسجيل الدخول بـ "الاستقبال" / "11"
- ✅ يجب أن تظهر الواجهة العربية بشكل صحيح

## إزالة الأخطاء

إذا استمرت مشكلة `main.tsx`:
1. تأكد من وجود `src/main.tsx` في الجذر
2. تأكد من وجود `index.html` في الجذر
3. استخدم `package-render.json` بدلاً من `package.json`

## اختبار محلي قبل النشر:

```bash
# استخدام الإعدادات الجديدة
cp package-render.json package.json
npm install
npm run build
npm start
```

يجب أن يعمل المشروع على `http://localhost:5000`
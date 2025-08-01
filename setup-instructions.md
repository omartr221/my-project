# تشغيل نظام V POWER TUNING على جهاز منفصل

## المتطلبات:
- Node.js (إصدار 18 أو أحدث)
- مساحة 100 ميجابايت على القرص الصلب

## خطوات التثبيت:

### 1. تحميل Node.js:
- اذهب إلى: https://nodejs.org
- حمل النسخة LTS
- ثبت البرنامج على الجهاز

### 2. نسخ ملفات النظام:
- انسخ مجلد النظام كاملاً إلى الجهاز الجديد
- تأكد من وجود جميع الملفات

### 3. تثبيت المكتبات:
افتح Command Prompt أو Terminal في مجلد النظام واكتب:
```
npm install
```

### 4. تشغيل النظام:
```
npm start
```

### 5. الوصول للنظام:
- من نفس الجهاز: http://localhost:5000
- من أجهزة أخرى: http://[IP-ADDRESS]:5000

## التشغيل التلقائي (اختيارية):

### Windows:
1. أنشئ ملف .bat:
```
cd C:\path\to\system
npm start
```
2. ضع الملف في مجلد Startup

### Mac/Linux:
أضف إلى .bashrc أو .profile:
```
cd /path/to/system && npm start
```

## استكشاف الأخطاء:
- تأكد من تثبيت Node.js بشكل صحيح
- تأكد من وجود اتصال إنترنت أثناء التثبيت
- تأكد من عدم استخدام المنفذ 5000 من برنامج آخر

## النسخ الاحتياطي:
- انسخ مجلد النظام بانتظام
- احفظ ملف قاعدة البيانات منفصلاً
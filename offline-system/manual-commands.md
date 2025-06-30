# تشغيل النظام يدوياً

## إذا لم تعمل الملفات التلقائية

### الطريقة الأولى: Node.js Command Prompt
1. ابحث في قائمة Start عن "Node.js command prompt"
2. افتحه
3. انتقل لمجلد النظام:
   ```
   cd "المسار\الكامل\للمجلد\offline-system"
   ```
4. ثبت المكتبات:
   ```
   npm install
   ```
5. شغل النظام:
   ```
   npm run dev
   ```

### الطريقة الثانية: تشغيل مباشر
1. افتح مجلد offline-system
2. اضغط Shift + كليك يمين في المجلد
3. اختر "Open PowerShell window here"
4. اكتب:
   ```
   npm install
   npm run dev
   ```

### الطريقة الثالثة: استخدام المسار الكامل
1. افتح Command Prompt عادي
2. انتقل للمجلد
3. استخدم المسار الكامل:
   ```
   "C:\Program Files\nodejs\npm.cmd" install
   "C:\Program Files\nodejs\npm.cmd" run dev
   ```

### إذا ظهر "npm run dev" مع رسالة نجاح:
- افتح المتصفح
- اذهب إلى: http://localhost:3000
- النظام يعمل!

### علامات النجاح:
- "serving on port 3000"
- "SQLite database initialized"
- لا توجد رسائل خطأ حمراء

### للمساعدة:
شغل "find-nodejs.bat" لمعرفة مكان Node.js في نظامك
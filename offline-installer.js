#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 إنشاء نسخة محلية للعمل بدون إنترنت...\n');

// Create offline directory
const offlineDir = './offline-system';
if (!fs.existsSync(offlineDir)) {
  fs.mkdirSync(offlineDir, { recursive: true });
}

// Files to copy for offline system
const filesToCopy = [
  'package.json',
  'package-lock.json',
  'tsconfig.json',
  'vite.config.ts',
  'tailwind.config.ts',
  'postcss.config.js',
  'components.json',
  'server/',
  'client/',
  'shared/',
  'attached_assets/'
];

// Copy function
function copyRecursive(src, dest) {
  const stats = fs.statSync(src);
  
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    
    const files = fs.readdirSync(src);
    for (const file of files) {
      if (file === 'node_modules' || file === 'dist' || file === '.git') {
        continue;
      }
      copyRecursive(path.join(src, file), path.join(dest, file));
    }
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Copy all necessary files
console.log('📁 نسخ الملفات...');
for (const file of filesToCopy) {
  if (fs.existsSync(file)) {
    const destPath = path.join(offlineDir, file);
    copyRecursive(file, destPath);
    console.log(`✅ تم نسخ: ${file}`);
  }
}

// Create offline README
const offlineReadme = `# نظام توزيع المهام - النسخة المحلية

## تشغيل النظام بدون إنترنت

### متطلبات التشغيل:
- Node.js v18 أو أحدث
- npm

### خطوات التشغيل:

1. تثبيت المكتبات:
\`\`\`bash
npm install
\`\`\`

2. تشغيل النظام:
\`\`\`bash
npm run dev
\`\`\`

3. فتح المتصفح على:
\`\`\`
http://localhost:5000
\`\`\`

### ملاحظات هامة:
- النظام يحفظ البيانات في ملف tasks.db محلياً
- يعمل بدون الحاجة للإنترنت
- جميع الميزات متاحة: المهام، التوقيت، الأرشيف
- العمال المتاحون: غدير، يحيى، حسام، مصطفى، زياد، سليمان، علي، حسن، بدوي، عبد الحفيظ، محمد علي

### كلمة مرور إضافة العمال:
0000

تم تطوير النظام بواسطة V POWER TUNING
`;

fs.writeFileSync(path.join(offlineDir, 'README.md'), offlineReadme);

// Create startup script
const startupScript = `@echo off
echo تشغيل نظام توزيع المهام...
echo.
echo تثبيت المكتبات المطلوبة...
call npm install
echo.
echo بدء تشغيل النظام...
call npm run dev
pause
`;

fs.writeFileSync(path.join(offlineDir, 'start.bat'), startupScript);

// Create Linux/Mac startup script
const startupScriptUnix = `#!/bin/bash
echo "تشغيل نظام توزيع المهام..."
echo ""
echo "تثبيت المكتبات المطلوبة..."
npm install
echo ""
echo "بدء تشغيل النظام..."
npm run dev
`;

fs.writeFileSync(path.join(offlineDir, 'start.sh'), startupScriptUnix);
fs.chmodSync(path.join(offlineDir, 'start.sh'), '755');

console.log('\n🎉 تم إنشاء النسخة المحلية بنجاح!');
console.log(`📂 مجلد النظام: ${offlineDir}`);
console.log('\n📋 خطوات الاستخدام:');
console.log('1. انسخ مجلد offline-system إلى الكمبيوتر المطلوب');
console.log('2. قم بتثبيت Node.js إذا لم يكن مثبتاً');
console.log('3. شغل ملف start.bat (Windows) أو start.sh (Linux/Mac)');
console.log('4. افتح المتصفح على http://localhost:5000');
console.log('\n✨ النظام جاهز للعمل بدون إنترنت!');
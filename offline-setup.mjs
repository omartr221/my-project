import fs from 'fs';
import path from 'path';

console.log('🚀 إعداد النظام للعمل بدون إنترنت...\n');

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
  'attached_assets/',
  'tasks.db'
];

// Copy function
function copyRecursive(src, dest) {
  try {
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
      const destDir = path.dirname(dest);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.copyFileSync(src, dest);
    }
  } catch (error) {
    console.log(`⚠️  تخطي: ${src} - ${error.message}`);
  }
}

// Copy all necessary files
console.log('📁 نسخ الملفات...');
for (const file of filesToCopy) {
  if (fs.existsSync(file)) {
    const destPath = path.join(offlineDir, file);
    copyRecursive(file, destPath);
    console.log(`✅ تم نسخ: ${file}`);
  } else {
    console.log(`⚠️  غير موجود: ${file}`);
  }
}

// Create offline package.json with correct dependencies
const packageJson = {
  "name": "task-management-offline",
  "version": "1.0.0",
  "type": "module",
  "description": "نظام توزيع المهام - النسخة المحلية",
  "scripts": {
    "dev": "tsx server/index.ts",
    "build": "vite build",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "@hookform/resolvers": "^3.3.2",
    "@neondatabase/serverless": "^0.9.0",
    "@radix-ui/react-accordion": "^1.1.2",
    "@radix-ui/react-alert-dialog": "^1.0.5",
    "@radix-ui/react-aspect-ratio": "^1.0.3",
    "@radix-ui/react-avatar": "^1.0.4",
    "@radix-ui/react-checkbox": "^1.0.4",
    "@radix-ui/react-collapsible": "^1.0.3",
    "@radix-ui/react-context-menu": "^2.1.5",
    "@radix-ui/react-dialog": "^1.0.5",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-hover-card": "^1.0.7",
    "@radix-ui/react-label": "^2.0.2",
    "@radix-ui/react-menubar": "^1.0.4",
    "@radix-ui/react-navigation-menu": "^1.1.4",
    "@radix-ui/react-popover": "^1.0.7",
    "@radix-ui/react-progress": "^1.0.3",
    "@radix-ui/react-radio-group": "^1.1.3",
    "@radix-ui/react-scroll-area": "^1.0.5",
    "@radix-ui/react-select": "^2.0.0",
    "@radix-ui/react-separator": "^1.0.3",
    "@radix-ui/react-slider": "^1.1.2",
    "@radix-ui/react-slot": "^1.0.2",
    "@radix-ui/react-switch": "^1.0.3",
    "@radix-ui/react-tabs": "^1.0.4",
    "@radix-ui/react-toast": "^1.1.5",
    "@radix-ui/react-toggle": "^1.0.3",
    "@radix-ui/react-toggle-group": "^1.0.4",
    "@radix-ui/react-tooltip": "^1.0.7",
    "@tanstack/react-query": "^5.17.19",
    "@types/better-sqlite3": "^7.6.8",
    "@types/express": "^4.17.21",
    "@types/node": "^20.11.5",
    "@types/react": "^18.2.48",
    "@types/react-dom": "^18.2.18",
    "@types/ws": "^8.5.10",
    "@vitejs/plugin-react": "^4.2.1",
    "better-sqlite3": "^9.2.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "cmdk": "^0.2.0",
    "date-fns": "^3.2.0",
    "date-fns-tz": "^2.0.0",
    "drizzle-orm": "^0.29.3",
    "drizzle-zod": "^0.5.1",
    "express": "^4.18.2",
    "framer-motion": "^10.18.0",
    "input-otp": "^1.2.4",
    "lucide-react": "^0.312.0",
    "react": "^18.2.0",
    "react-day-picker": "^8.10.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.49.3",
    "react-icons": "^5.0.1",
    "tailwind-merge": "^2.2.1",
    "tailwindcss": "^3.4.1",
    "tailwindcss-animate": "^1.0.7",
    "tsx": "^4.7.0",
    "typescript": "^5.3.3",
    "vite": "^5.0.12",
    "wouter": "^3.0.0",
    "ws": "^8.16.0",
    "zod": "^3.22.4"
  }
};

fs.writeFileSync(path.join(offlineDir, 'package.json'), JSON.stringify(packageJson, null, 2));

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

### استكشاف الأخطاء:
- إذا لم يعمل النظام، تأكد من تثبيت Node.js
- إذا كان المنفذ 5000 مشغولاً، غير الرقم في server/index.ts
- تأكد من وجود ملف tasks.db في المجلد الجذر

تم تطوير النظام بواسطة V POWER TUNING
`;

fs.writeFileSync(path.join(offlineDir, 'README.md'), offlineReadme);

// Create startup script for Windows
const startupScript = `@echo off
chcp 65001 > nul
echo تشغيل نظام توزيع المهام...
echo.
echo تثبيت المكتبات المطلوبة...
call npm install
echo.
echo بدء تشغيل النظام...
echo افتح المتصفح على: http://localhost:5000
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
echo "افتح المتصفح على: http://localhost:5000"
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
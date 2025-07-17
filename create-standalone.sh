#!/bin/bash

echo "🔧 إنشاء نسخة مستقلة من V POWER TUNING..."

# Create standalone directory
mkdir -p vpower-standalone
cd vpower-standalone

# Copy built files
cp -r ../dist/* .

# Create simple server
cat > server.js << 'EOF'
const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const port = 3000;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS for local network
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
    return;
  }
  
  next();
});

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path} from ${req.ip}`);
  next();
});

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Handle all routes with index.html
app.get('*', (req, res) => {
  const indexPath = path.join(__dirname, 'public', 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send('Application not found. Please ensure public/index.html exists.');
  }
});

app.listen(port, '0.0.0.0', () => {
  console.log('🚀 V POWER TUNING Server جاهز!');
  console.log(`   - البورت: ${port}`);
  console.log(`   - من هذا الجهاز: http://localhost:${port}`);
  console.log(`   - من أجهزة أخرى: http://192.168.1.102:${port}`);
  console.log('🔧 السيرفر يعمل على جميع عناوين الشبكة (0.0.0.0)');
  console.log('💡 للتوقف: اضغط Ctrl+C');
});
EOF

# Create package.json
cat > package.json << 'EOF'
{
  "name": "vpower-standalone",
  "version": "1.0.0",
  "description": "V POWER TUNING Standalone Server",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF

# Create installation script
cat > install-and-run.sh << 'EOF'
#!/bin/bash

echo "🔧 تثبيت وتشغيل V POWER TUNING..."

# Install dependencies
npm install

# Start server
echo "🚀 بدء تشغيل السيرفر..."
npm start
EOF

chmod +x install-and-run.sh

# Create Windows batch file
cat > install-and-run.bat << 'EOF'
@echo off
echo تثبيت وتشغيل V POWER TUNING...

npm install
if %errorlevel% neq 0 (
    echo خطأ في تثبيت المتطلبات
    pause
    exit /b 1
)

echo بدء تشغيل السيرفر...
npm start
EOF

# Create README
cat > README.md << 'EOF'
# V POWER TUNING - نسخة مستقلة

## التشغيل السريع

### على Linux/Mac:
```bash
chmod +x install-and-run.sh
./install-and-run.sh
```

### على Windows:
```cmd
install-and-run.bat
```

### يدوياً:
```bash
npm install
npm start
```

## الوصول للنظام
- من نفس الجهاز: http://localhost:3000
- من أجهزة أخرى: http://192.168.1.102:3000

## متطلبات التشغيل
- Node.js (إصدار 14 أو أحدث)
- إتصال بالشبكة المحلية
- البورت 3000 متاح

## استكشاف الأخطاء
1. تأكد من تثبيت Node.js
2. تأكد من إيقاف الفايروول
3. تأكد من أن الجهاز في نفس الشبكة
4. جرب IP address مختلف إذا تغير

## للمطورين
هذه نسخة مستقلة مبسطة من النظام. للتطوير الكامل، استخدم المشروع الأصلي على Replit.
EOF

cd ..

echo "✅ تم إنشاء النسخة المستقلة في مجلد: vpower-standalone"
echo "📁 انسخ المجلد إلى الجهاز المطلوب"
echo "🚀 شغل: ./install-and-run.sh (Linux/Mac) أو install-and-run.bat (Windows)"
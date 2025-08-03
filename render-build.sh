#!/bin/bash

echo "🔄 بناء مشروع V POWER TUNING لـ Render..."

# تثبيت المعتمدات
echo "📦 تثبيت المعتمدات..."
npm install

# بناء Frontend
echo "🏗️ بناء Frontend..."
npm run build

# نسخ ملفات الخادم إلى dist
echo "📂 نسخ ملفات الخادم..."
mkdir -p dist
cp -r server dist/
cp -r shared dist/
cp package.json dist/
cp drizzle.config.ts dist/

echo "✅ تم البناء بنجاح!"
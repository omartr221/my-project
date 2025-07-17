#!/bin/bash

echo "🔧 بناء النظام للشبكة المحلية..."

# Build the frontend
npm run build

# Copy the local server
cp local-server.js dist/

# Create a simple package.json for the local server
cat > dist/package.json << 'EOF'
{
  "name": "vpower-local",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "start": "node local-server.js"
  },
  "dependencies": {
    "express": "^4.18.2"
  }
}
EOF

echo "✅ النظام جاهز في مجلد dist"
echo "📁 انسخ مجلد dist إلى أي جهاز"
echo "🚀 اكتب: npm install && npm start"
echo "🌐 سيعمل على البورت 3000"
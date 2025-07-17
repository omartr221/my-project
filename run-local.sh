#!/bin/bash

echo "🚀 تشغيل النظام على الشبكة المحلية..."

# Kill any existing process on port 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Install dependencies if needed
if [ ! -d "dist/node_modules" ]; then
    echo "📦 تثبيت المكتبات..."
    cd dist
    npm install
    cd ..
fi

# Start the local server
echo "🌐 تشغيل السيرفر على البورت 3000..."
cd dist
node local-server.js &

# Show the IP address
echo "📱 العناوين المتاحة:"
echo "   - localhost: http://localhost:3000"
echo "   - IP محلي: http://$(hostname -I | cut -d' ' -f1):3000"

# Keep the script running
wait
#!/bin/bash

echo "🚀 تشغيل V POWER TUNING Desktop..."
echo "=================================="

# التأكد من تثبيت المتطلبات
if ! command -v node &> /dev/null; then
    echo "❌ Node.js غير مثبت"
    exit 1
fi

if ! command -v npm &> /dev/null; then
    echo "❌ npm غير مثبت"
    exit 1
fi

# تشغيل التطبيق
node start-desktop.js
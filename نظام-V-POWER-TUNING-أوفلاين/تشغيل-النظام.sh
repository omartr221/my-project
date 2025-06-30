#!/bin/bash

# إعداد الألوان
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

clear

echo -e "${BLUE}"
echo "========================================"
echo "   V POWER TUNING - نظام إدارة المهام"
echo "========================================"
echo -e "${NC}"

echo "التحقق من Node.js..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js غير مثبت!${NC}"
    echo "يرجى تحميل وتثبيت Node.js من: https://nodejs.org"
    exit 1
fi

echo -e "${GREEN}✅ Node.js متوفر${NC}"
echo ""

echo "تثبيت المكتبات المطلوبة..."
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ فشل في تثبيت المكتبات${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}🚀 بدء تشغيل النظام...${NC}"
echo ""
echo -e "${YELLOW}لإيقاف النظام: اضغط Ctrl+C${NC}"
echo ""

node server.js
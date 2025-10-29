#!/bin/bash

###############################################
# 🚀 ملف تشغيل سريع لمشروع المعلم العراقي
# Quick Start Script for Iraqi Teacher Project
###############################################

echo "🎓 بسم الله الرحمن الرحيم"
echo "=================================="
echo "🚀 تشغيل مشروع المعلم العراقي - عمو أحمد"
echo "=================================="
echo ""

# الانتقال لمجلد المشروع
cd /media/amir/Boot/aliai

# التحقق من وجود node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 تثبيت المكتبات للمرة الأولى..."
    npm install
    echo "✅ تم تثبيت المكتبات"
    echo ""
fi

# حذف مجلد .next القديم (للتأكد من build نظيف)
echo "🧹 تنظيف الملفات القديمة..."
rm -rf .next

echo "✅ تم التنظيف"
echo ""

# تشغيل السيرفر
echo "🔥 تشغيل السيرفر..."
echo ""
echo "📍 الموقع راح يكون على:"
echo "   http://localhost:3000"
echo ""
echo "📍 صفحة المعلم العراقي:"
echo "   http://localhost:3000/teacher"
echo ""
echo "⚠️  للإيقاف اضغط: Ctrl+C"
echo "=================================="
echo ""

# تشغيل npm run dev
npm run dev

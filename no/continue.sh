#!/bin/bash

# ============================================
# 🚀 سكريبت تشغيل مشروع عقول AI
# Start Script for Oqool AI Project
# ============================================

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎓 بسم الله الرحمن الرحيم"
echo "🚀 بدء تشغيل مشروع عقول AI"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# 1️⃣ التحقق من mount الهارد
echo "🔍 التحقق من الهارد..."
if [ ! -d "/home/amir/boot_mount/aliai/src" ]; then
    echo "⚠️  الهارد غير موجود! محاولة mount..."

    # إنشاء مجلد mount إذا لم يكن موجوداً
    mkdir -p ~/boot_mount/aliai

    # محاولة mount الهارد
    echo "🔐 mount الهارد..."
    echo "1975" | sudo -S mount /dev/nvme0n1p3 ~/boot_mount/aliai

    if [ $? -eq 0 ]; then
        echo "✅ تم mount الهارد بنجاح!"
    else
        echo "❌ فشل mount الهارد!"
        echo "💡 حاول يدوياً:"
        echo "   sudo mount /dev/nvme0n1p3 ~/boot_mount/aliai"
        exit 1
    fi
else
    echo "✅ الهارد موجود ومُوصل!"
fi

echo ""

# 2️⃣ الانتقال لمجلد المشروع
echo "📂 الانتقال لمجلد المشروع..."
cd /home/amir/boot_mount/aliai

if [ $? -ne 0 ]; then
    echo "❌ فشل الدخول لمجلد المشروع!"
    exit 1
fi

echo "✅ المجلد الحالي: $(pwd)"
echo ""

# 3️⃣ التحقق من node_modules
if [ ! -d "node_modules" ]; then
    echo "📦 تثبيت dependencies..."
    npm install
    echo ""
fi

# 4️⃣ إيقاف أي خوادم قديمة
echo "🧹 تنظيف الخوادم القديمة..."
pkill -f "next dev" 2>/dev/null
lsof -ti:3000 | xargs kill -9 2>/dev/null
lsof -ti:3001 | xargs kill -9 2>/dev/null
lsof -ti:3002 | xargs kill -9 2>/dev/null
sleep 2
echo "✅ تم تنظيف الخوادم القديمة!"
echo ""

# 5️⃣ تشغيل الخادم
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 بدء تشغيل الخادم..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📍 الرابط: http://localhost:3000/chat"
echo ""
echo "⚡ لإيقاف الخادم: اضغط Ctrl+C"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# تشغيل الخادم
npm run dev

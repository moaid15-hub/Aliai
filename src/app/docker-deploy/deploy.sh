#!/bin/bash
# 🚀 Oqool AI - Quick VPS Deployment Script
# Usage: chmod +x deploy.sh && ./deploy.sh

set -e

echo "🚀 بدء نشر Oqool AI على VPS..."

# التحقق من وجود Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker غير مثبت. يتم تثبيت Docker..."
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo "✅ تم تثبيت Docker. يرجى تسجيل الخروج وإعادة تسجيل الدخول ثم تشغيل هذا السكريبت مرة أخرى."
    exit 0
fi

# التحقق من وجود Docker Compose
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose غير مثبت. يتم تثبيته..."
    sudo apt update
    sudo apt install -y docker-compose-plugin
fi

# إنشاء .env إذا لم يكن موجود
if [ ! -f .env ]; then
    echo "📝 إنشاء ملف .env..."
    cp .env.example .env
    echo "⚠️  يرجى تعديل ملف .env بالقيم الصحيحة قبل المتابعة"
    echo "📝 nano .env"
    read -p "اضغط Enter عندما تنتهي من تعديل .env..."
fi

# إعداد Firewall
echo "🔧 إعداد Firewall..."
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp   # HTTP  
sudo ufw allow 443/tcp  # HTTPS
echo "y" | sudo ufw enable || true

# إنشاء مجلد backend وملء البيانات
echo "📂 إعداد مجلد Backend..."
mkdir -p backend
cp -r ../backend-supabase/* backend/ 2>/dev/null || echo "تحذير: لم يتم العثور على backend-supabase"

# بناء وتشغيل المشروع
echo "🏗️  بناء وتشغيل Docker Containers..."
docker compose down || true
docker compose up -d --build

# انتظار بدء الخدمات
echo "⏳ انتظار بدء الخدمات..."
sleep 10

# اختبار الخدمات
echo "🧪 اختبار الخدمات..."

# اختبار API محلي
API_LOCAL=$(curl -s http://localhost:8000/health 2>/dev/null || echo "failed")
if [[ $API_LOCAL == *"ok"* ]]; then
    echo "✅ API يعمل محلياً"
else
    echo "❌ API لا يعمل محلياً"
    docker compose logs api
fi

# عرض حالة الخدمات
echo ""
echo "📊 حالة الخدمات:"
docker compose ps

echo ""
echo "📋 الخطوات التالية:"
echo "1. تأكد من إعداد DNS: api.oqool.net -> $(curl -s ifconfig.me)"
echo "2. اختبر API: https://api.oqool.net/health"
echo "3. راجع API Docs: https://api.oqool.net/docs"
echo "4. راقب Logs: docker compose logs -f"
echo ""
echo "✅ النشر مكتمل!"
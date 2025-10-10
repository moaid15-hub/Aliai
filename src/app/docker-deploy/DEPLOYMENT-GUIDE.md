# 🚀 دليل النشر على VPS بـ Docker

## 📋 نظرة عامة
هذا الدليل لنشر Oqool AI على VPS باستخدام Docker Compose + Caddy للـ SSL التلقائي.

## 🎯 الهيكل النهائي:
```
Frontend (Vercel): https://oqool.net
Backend (VPS): https://api.oqool.net  
Database: Supabase PostgreSQL
```

---

## 🔧 متطلبات VPS:

### 1️⃣ إعداد VPS الجديد:
```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER && newgrp docker

# تثبيت Docker Compose
sudo apt install -y docker-compose-plugin

# تثبيت Git
sudo apt install -y git curl
```

### 2️⃣ فتح Ports المطلوبة:
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

---

## 📂 نشر المشروع:

### 3️⃣ تنزيل المشروع:
```bash
cd /home/$USER
git clone https://github.com/moaid15-hub/nextjs-boilerplate.git
cd nextjs-boilerplate
```

### 4️⃣ نسخ ملفات Docker:
```bash
# نسخ مجلد docker-deploy إلى المجلد الرئيسي
cp -r frontend/src/app/docker-deploy/* ./
cp -r backend-supabase/* backend/

# إعداد متغيرات البيئة
cp .env.example .env
nano .env  # تعديل القيم
```

### 5️⃣ إعداد DNS في Cloudflare:
```
Type: A Record
Name: api.oqool.net
Value: YOUR_VPS_IP_ADDRESS
Proxy: ON (Orange Cloud)
```

### 6️⃣ تشغيل المشروع:
```bash
# بناء وتشغيل
docker compose up -d --build

# مراقبة Logs
docker compose logs -f

# التحقق من الحالة
docker compose ps
```

---

## ✅ اختبار النشر:

### 7️⃣ اختبار API:
```bash
# Health Check
curl https://api.oqool.net/health

# API Docs
https://api.oqool.net/docs

# Chat Test
curl -X POST https://api.oqool.net/chat/send \
  -H "Content-Type: application/json" \
  -d '{"content":"مرحبا"}'
```

### 8️⃣ اختبار Frontend:
```bash
# تحديث Frontend API URL
# في Vercel Environment Variables:
NEXT_PUBLIC_API_URL=https://api.oqool.net
```

---

## 🔧 إدارة المشروع:

### إعادة النشر بعد تحديث الكود:
```bash
cd /home/$USER/nextjs-boilerplate
git pull origin main
docker compose up -d --build
```

### مراقبة النظام:
```bash
# مشاهدة Logs
docker compose logs -f api
docker compose logs -f caddy

# إعادة تشغيل خدمة معينة
docker compose restart api

# التحقق من استهلاك الموارد
docker stats
```

### النسخ الاحتياطية:
```bash
# نسخ احتياطي لمتغيرات البيئة
cp .env .env.backup.$(date +%Y%m%d)

# نسخ احتياطي لبيانات Caddy SSL
sudo tar -czf caddy-data-backup-$(date +%Y%m%d).tar.gz \
  /var/lib/docker/volumes/oqool_vps_caddy_data/
```

---

## 🚨 استكشاف الأخطاء:

### مشاكل شائعة:
```bash
# 1. API لا يعمل
docker compose logs api

# 2. SSL لا يعمل
docker compose logs caddy

# 3. إعادة تشغيل كامل
docker compose down
docker compose up -d --build

# 4. تنظيف النظام
docker system prune -a
```

---

## 🎯 النتيجة النهائية:

✅ **Frontend**: https://oqool.net (Vercel)  
✅ **Backend API**: https://api.oqool.net (VPS + Docker)  
✅ **Database**: Supabase PostgreSQL  
✅ **SSL**: تلقائي مع Caddy  
✅ **Monitoring**: Docker health checks  

**المشروع الآن مستقل ومعتمد على VPS مع SSL تلقائي!** 🚀
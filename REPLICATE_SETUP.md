# 🎨 إعداد ترميم الصور - Replicate AI

## 📋 **ملخص:**
تم إضافة ميزة ترميم الصور بالذكاء الاصطناعي باستخدام **Replicate AI**.

---

## 🔧 **الخطوة 1: الحصول على API Token**

1. اذهب إلى: https://replicate.com
2. سجّل دخول أو أنشئ حساب جديد
3. اذهب إلى: https://replicate.com/account/api-tokens
4. انسخ الـ API Token

---

## 🔐 **الخطوة 2: إضافة API Token**

### طريقة 1: ملف `.env.local` (موصى به)

أنشئ ملف `.env.local` في جذر المشروع وأضف:

```env
# Replicate AI Token
REPLICATE_API_TOKEN=r8_your_token_here

# Base URL (اختياري)
NEXT_PUBLIC_BASE_URL=http://localhost:3002
```

### طريقة 2: متغيرات البيئة مباشرة

```bash
export REPLICATE_API_TOKEN=r8_your_token_here
```

---

## 📦 **الخطوة 3: تثبيت المكتبات**

```bash
npm install replicate tesseract.js
```

أو

```bash
cd /media/hussein/MO88/aliai
npm install
```

---

## 🚀 **الخطوة 4: تشغيل المشروع**

```bash
npm run dev
```

---

## 🌐 **الاستخدام:**

### الصفحة الرئيسية:
```
http://localhost:3002/restore-photo
```

### API Endpoints:
```
POST /api/upload-image      - رفع الصورة
POST /api/restore-photo      - ترميم الصورة
GET  /api/restore-photo      - معلومات عن النماذج
```

---

## 🎯 **المميزات:**

### 1️⃣ **ترميم شامل** (GFPGAN):
- إصلاح الخدوش والتلف
- تحسين الوجوه
- رفع جودة الصور القديمة
- **التكلفة:** ~$0.002 للصورة
- **المدة:** 30 ثانية

### 2️⃣ **تكبير 4x** (Real-ESRGAN):
- زيادة الدقة حتى 4 أضعاف
- تحسين التفاصيل
- تحسين الوجوه (اختياري)
- **التكلفة:** ~$0.002 للصورة
- **المدة:** 45 ثانية

---

## 📁 **الملفات المضافة:**

```
src/
├── app/
│   ├── api/
│   │   ├── upload-image/
│   │   │   └── route.ts         ✅ رفع الصور
│   │   └── restore-photo/
│   │       └── route.ts         ✅ ترميم الصور (Replicate AI)
│   └── restore-photo/
│       └── page.tsx             ✅ واجهة المستخدم
│
└── public/
    └── uploads/                 ✅ مجلد حفظ الصور
```

---

## 🧪 **اختبار:**

### 1. رفع صورة:
```bash
curl -X POST http://localhost:3002/api/upload-image \
  -F "image=@/path/to/your/image.jpg"
```

### 2. ترميم صورة:
```bash
curl -X POST http://localhost:3002/api/restore-photo \
  -H "Content-Type: application/json" \
  -d '{"imageUrl": "http://localhost:3002/uploads/image.jpg", "action": "restore"}'
```

### 3. معلومات النماذج:
```bash
curl http://localhost:3002/api/restore-photo
```

---

## 💰 **التكلفة:**

| النموذج | الوقت | التكلفة | الاستخدام |
|---------|-------|---------|-----------|
| **GFPGAN** | ~30s | $0.002 | ترميم الوجوه والصور القديمة |
| **Real-ESRGAN** | ~45s | $0.002 | تكبير وتحسين الجودة |

**مثال:** 100 صورة = ~$0.20

---

## ⚠️ **ملاحظات:**

1. ✅ **الأمان:** الصور تُحذف تلقائياً بعد المعالجة
2. ✅ **الخصوصية:** لا يتم تخزين الصور على Replicate
3. ✅ **الحجم:** الحد الأقصى 10MB للصورة
4. ✅ **الأنواع:** JPG, PNG, WebP

---

## 🔗 **روابط مفيدة:**

- Replicate: https://replicate.com
- GFPGAN: https://replicate.com/tencentarc/gfpgan
- Real-ESRGAN: https://replicate.com/nightmareai/real-esrgan
- التوثيق: https://replicate.com/docs

---

## ❓ **استكشاف الأخطاء:**

### خطأ: "API Token غير موجود"
- تأكد من إضافة `REPLICATE_API_TOKEN` في `.env.local`
- أعد تشغيل الخادم بعد إضافة المتغير

### خطأ: "فشل رفع الصورة"
- تحقق من حجم الصورة (أقل من 10MB)
- تأكد من نوع الملف (JPG, PNG, WebP)

### خطأ: "فشل ترميم الصورة"
- تحقق من صحة الـ API Token
- تأكد من وجود رصيد في حسابك على Replicate

---

**✨ كل شيء جاهز! استمتع بترميم صورك! 🎨**


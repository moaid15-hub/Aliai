# 🔐 إعداد مفاتيح API

## ✅ تم إنشاء ملف `.env.local`

---

## 📝 **كيفية إضافة المفاتيح:**

### 1️⃣ افتح ملف `.env.local`
```bash
nano .env.local
# أو
code .env.local
```

### 2️⃣ استبدل `your_xxx_here` بمفاتيحك الفعلية

مثال:
```env
# قبل
REPLICATE_API_TOKEN=your_replicate_token_here

# بعد
REPLICATE_API_TOKEN=r8_abc123xyz456...
```

### 3️⃣ احفظ الملف

### 4️⃣ أعد تشغيل الخادم
```bash
# أوقف الخادم (Ctrl+C)
# ثم شغّله من جديد
npm run dev
```

---

## 🔑 **المفاتيح المطلوبة لترميم الصور:**

### **Replicate API Token** (ضروري)
1. اذهب إلى: https://replicate.com
2. سجّل دخول أو أنشئ حساب
3. اذهب إلى: https://replicate.com/account/api-tokens
4. انسخ Token (يبدأ بـ `r8_`)
5. ضعه في `.env.local`:
   ```env
   REPLICATE_API_TOKEN=r8_abc123...
   ```

---

## 🎨 **المفاتيح الأخرى (اختيارية):**

### **Anthropic Claude** (موجود عندك):
```env
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### **OpenAI GPT**:
```env
OPENAI_API_KEY=sk-...
```

### **Google Search**:
```env
GOOGLE_API_KEY=AIza...
GOOGLE_SEARCH_ENGINE_ID=...
```

---

## ✅ **التحقق من الإعداد:**

### طريقة 1: عبر API
```bash
curl http://localhost:3002/api/restore-photo
```

**النتيجة المتوقعة:**
```json
{
  "availableActions": {...},
  "status": "configured"  ← يجب أن تكون "configured"
}
```

### طريقة 2: عبر المتصفح
1. افتح: `http://localhost:3002/restore-photo`
2. اختر صورة
3. اضغط "رمم الصورة"
4. إذا عمل → ✅ الإعداد صحيح
5. إذا ظهر خطأ "API Token غير موجود" → أعد التحقق من `.env.local`

---

## ⚠️ **ملاحظات مهمة:**

1. ✅ ملف `.env.local` موجود في `.gitignore` (لن يُرفع لـ Git)
2. ✅ احفظ نسخة احتياطية من مفاتيحك في مكان آمن
3. ✅ لا تشارك المفاتيح مع أحد
4. ✅ أعد تشغيل الخادم بعد تعديل `.env.local`

---

## 🔧 **استكشاف الأخطاء:**

### المشكلة: "API Token غير موجود"
**الحل:**
1. تأكد من وجود `REPLICATE_API_TOKEN` في `.env.local`
2. تأكد من عدم وجود مسافات زائدة
3. تأكد من بدء Token بـ `r8_`
4. أعد تشغيل الخادم

### المشكلة: "فشل ترميم الصورة"
**الحل:**
1. تحقق من صحة Token
2. تأكد من وجود رصيد في حسابك على Replicate
3. تحقق من اتصال الإنترنت

---

## 💰 **التكلفة:**

| الخدمة | التكلفة |
|--------|---------|
| **Replicate GFPGAN** | $0.002 لكل صورة |
| **Replicate Real-ESRGAN** | $0.002 لكل صورة |

**مثال:** 100 صورة = $0.20

---

**✨ كل شيء جاهز! أضف المفاتيح وابدأ! 🚀**


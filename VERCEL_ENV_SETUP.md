# 🔐 إضافة Environment Variables في Vercel

## خطوات الإضافة:

### 1️⃣ افتح Vercel Dashboard:
```
https://vercel.com/moaid15-hub/aliai
```

### 2️⃣ اذهب إلى Settings:
- اضغط **Settings** من القائمة العلوية
- اضغط **Environment Variables** من القائمة الجانبية

### 3️⃣ أضف المفاتيح التالية:

#### ✅ المفاتيح الأساسية (مطلوبة):

**1. OpenAI API Key**
```
Name: OPENAI_API_KEY
Value: [Your OpenAI API Key here]
Environment: Production, Preview, Development
```

**2. Claude (Anthropic) API Key**
```
Name: ANTHROPIC_API_KEY
Value: [Your Claude API Key here]
Environment: Production, Preview, Development
```

**3. DeepSeek API Key**
```
Name: DEEPSEEK_API_KEY
Value: [Your DeepSeek API Key here]
Environment: Production, Preview, Development
```

**4. Google Search API Key**
```
Name: GOOGLE_SEARCH_API_KEY
Value: [Your Google API Key here]
Environment: Production, Preview, Development
```

**5. Google Search Engine ID**
```
Name: GOOGLE_SEARCH_ENGINE_ID
Value: [Your Search Engine ID here]
Environment: Production, Preview, Development
```

**6. YouTube API Key**
```
Name: YOUTUBE_API_KEY
Value: [Your YouTube API Key here]
Environment: Production, Preview, Development
```

**7. Tavily Search API Key**
```
Name: TAVILY_API_KEY
Value: [Your Tavily API Key here]
Environment: Production, Preview, Development
```

---

## 📝 طريقة الإضافة في Vercel:

### لكل مفتاح:
1. **اضغط "Add New"** أو "New Variable"
2. **Name**: انسخ الاسم (مثل: `OPENAI_API_KEY`)
3. **Value**: انسخ القيمة (المفتاح الطويل)
4. **Environment**: اختر **All** (Production, Preview, Development)
5. **اضغط Save**

### كرر العملية لجميع المفاتيح الـ 5!

---

## 🔄 بعد إضافة المفاتيح:

### 1. Redeploy المشروع:
- اذهب إلى **Deployments**
- اضغط على آخر deployment
- اضغط **"..." (More)**
- اختر **Redeploy**
- ✅ اضغط **Redeploy** للتأكيد

### 2. انتظر 2-3 دقائق للبناء

### 3. افتح الموقع:
```
https://aliai.vercel.app
```

---

## ✅ التحقق من نجاح العملية:

بعد Redeploy:
1. افتح الموقع
2. جرب كتابة: **"ابحث عن الذكاء الاصطناعي"**
3. المفروض تشوف:
   - ✅ نتائج بحث من Google
   - ✅ نتائج من YouTube
   - ✅ نتائج من Wikipedia
   - ✅ رد من AI

---

## ⚠️ ملاحظات مهمة:

1. **لا تحذف المفاتيح القديمة** - استبدلها فقط
2. **اختر All Environments** - حتى يشتغل في Production
3. **Redeploy ضروري** - التغييرات ما تطبق بدونه
4. **انتظر البناء يخلص** - لا تقفل الصفحة

---

## 🆘 لو فيه مشكلة:

### أخطاء شائعة:
- ❌ نسيان اختيار "All Environments"
- ❌ وجود مسافات زائدة في المفتاح
- ❌ عدم عمل Redeploy بعد الإضافة
- ❌ المفتاح منتهي أو خطأ

### الحل:
1. تأكد من نسخ المفاتيح **بالكامل** بدون مسافات
2. تأكد من اختيار **All Environments**
3. اعمل **Redeploy** بعد الإضافة
4. شوف **Build Logs** إذا فشل البناء

---

## 📊 متابعة الحالة:

في Vercel Dashboard، شوف:
- **Status**: Building 🟡 → Ready 🟢
- **Duration**: عادة 1-3 دقائق
- **Logs**: لو فيه خطأ، الـ logs توضح المشكلة

---

✨ **بالتوفيق!** إذا احتجت مساعدة، أنا هنا! 😊

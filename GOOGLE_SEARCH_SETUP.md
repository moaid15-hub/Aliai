# 🔍 دليل إعداد Google Custom Search API

## 📋 نظرة عامة

تم دمج **Google Custom Search API** مع نظام البحث العام في `web-search.ts` لتوفير:

### ✨ الميزات المدمجة:

1. **🎯 Google Custom Search كأولوية أولى**
   - أفضل نتائج بحث بدقة عالية
   - دعم كامل للغة العربية
   - تصفية آمنة للمحتوى

2. **💾 نظام Cache متقدم**
   - تخزين مؤقت 30 دقيقة
   - حد أقصى 200 نتيجة
   - LRU Eviction (حذف الأقدم تلقائياً)
   - تقليل استهلاك API

3. **🔄 Retry Logic**
   - 3 محاولات عند الفشل
   - تأخير متزايد (1s, 2s, 3s)
   - معالجة أخطاء ذكية

4. **📊 Usage Tracker**
   - تتبع الاستخدام اليومي
   - حد أقصى 100 استعلام/يوم
   - حماية من تجاوز Quota
   - إحصائيات مفصلة

5. **🧠 Smart Search**
   - `recentOnly`: نتائج حديثة فقط
   - `exactMatch`: بحث دقيق
   - تعديل تلقائي للاستعلام

---

## 🚀 خطوات الإعداد

### 1️⃣ الحصول على API Key

1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. أنشئ مشروع جديد أو اختر مشروع موجود
3. فعّل **Custom Search API**:
   - اذهب إلى **APIs & Services** > **Library**
   - ابحث عن "Custom Search API"
   - اضغط **Enable**

4. أنشئ API Key:
   - اذهب إلى **APIs & Services** > **Credentials**
   - اضغط **Create Credentials** > **API Key**
   - انسخ المفتاح

### 2️⃣ إنشاء Search Engine

1. اذهب إلى [Programmable Search Engine](https://programmablesearchengine.google.com/)
2. اضغط **Add** لإنشاء محرك بحث جديد
3. إعدادات البحث:
   - **Sites to search**: اختر "Search the entire web"
   - **Name**: "Oqool AI Web Search"
   - **Language**: Arabic
   
4. بعد الإنشاء:
   - اذهب إلى **Setup**
   - انسخ **Search engine ID** (يبدأ بـ cx:...)

### 3️⃣ إضافة المفاتيح إلى `.env.local`

```bash
# Google Custom Search API
GOOGLE_SEARCH_API_KEY=AIzaSy...your-actual-key...
GOOGLE_SEARCH_ENGINE_ID=your-cx-id-here
```

---

## 📊 استخدام النظام

### البحث العادي
```typescript
import { searchWeb, formatSearchResults } from '@/app/chat/web-search';

const result = await searchWeb('أفضل مطاعم في الرياض', {
  maxResults: 5
});

console.log(formatSearchResults(result));
```

### بحث بنتائج حديثة فقط
```typescript
const result = await searchWeb('أخبار التقنية', {
  maxResults: 10,
  recentOnly: true  // آخر سنة فقط
});
```

### بحث دقيق
```typescript
const result = await searchWeb('الذكاء الاصطناعي', {
  exactMatch: true  // بحث دقيق بعلامات اقتباس
});
```

### بحث محمي مع تتبع
```typescript
import { protectedSearch } from '@/app/chat/web-search';

const formatted = await protectedSearch('أخبار اليوم', {
  maxResults: 5,
  recentOnly: true
});

console.log(formatted); // نص منسّق جاهز للعرض
```

---

## 🛠️ Utility Functions

### إحصائيات الـ Cache
```typescript
import { getCacheStats, clearCache } from '@/app/chat/web-search';

const stats = getCacheStats();
console.log(stats);
// { size: 15, maxSize: 200, maxAge: 1800000 }

// مسح الـ Cache
clearCache();
```

### إحصائيات الاستخدام
```typescript
import { getUsageStats, resetUsage } from '@/app/chat/web-search';

const usage = getUsageStats();
console.log(usage);
// { used: 45, remaining: 55, limit: 100 }

// إعادة تعيين العداد (يومي تلقائياً)
resetUsage();
```

---

## 🔄 ترتيب الأولويات

النظام يحاول البحث بالترتيب التالي:

```
1. Google Custom Search (أولوية أولى) ✨
   ↓ (إذا فشل أو تجاوز الحد)
   
2. Tavily API (أولوية ثانية)
   ↓ (إذا فشل)
   
3. Serper API (أولوية ثالثة)
   ↓ (إذا فشل)
   
4. Fallback Results (نتائج افتراضية)
```

---

## 📈 الحدود والـ Quota

### Google Custom Search Free Tier:
- **100 استعلام/يوم** مجاناً
- **10,000 استعلام/يوم** للخطة المدفوعة
- يتم التتبع تلقائياً بواسطة `UsageTracker`

### الحماية التلقائية:
- عند الوصول للحد، يتم التحويل تلقائياً لـ Tavily
- رسالة واضحة للمستخدم عن الاستخدام
- إعادة تعيين تلقائية يومياً

---

## 🎯 تنسيق النتائج

النتائج تُعرض بتنسيق احترافي:

```
🔍 نتائج البحث عن: "أفضل مطاعم في الرياض"

📊 وجدت حوالي 1,250,000 نتيجة في 0.85 ثانية
🔎 المصدر: Google Custom Search

---

**1. أفضل 10 مطاعم في الرياض**

🌐 example.com
مجموعة من أفضل المطاعم في مدينة الرياض...

🔗 [اضغط للزيارة](https://example.com)

---

📊 استخدام API اليوم: 45/100 استعلام (متبقي: 55)

💡 تبي تفاصيل أكثر عن نتيجة معينة؟ أو تبي أبحث عن شيء آخر؟ 😊
```

---

## ⚡ الأداء

### Cache Hit Rate:
- **أول بحث**: 0.5-1.5 ثانية (من Google API)
- **من Cache**: 0.001-0.01 ثانية (⚡ 100x أسرع)
- **صلاحية**: 30 دقيقة

### Retry Logic:
- **محاولة 1**: فورية
- **محاولة 2**: بعد 1 ثانية
- **محاولة 3**: بعد 2 ثانية إضافية
- **إجمالي**: 3 محاولات خلال ~3 ثواني

---

## 🐛 استكشاف الأخطاء

### خطأ: "API key not valid"
```bash
# تحقق من المفتاح في .env.local
GOOGLE_SEARCH_API_KEY=AIzaSy...

# تأكد أن Custom Search API مفعّل في Google Cloud Console
```

### خطأ: "Quota exceeded"
```bash
# تحقق من الاستخدام
import { getUsageStats } from '@/app/chat/web-search';
console.log(getUsageStats());

# سيتحول النظام تلقائياً لـ Tavily
```

### خطأ: "Invalid CX"
```bash
# تحقق من Search Engine ID
GOOGLE_SEARCH_ENGINE_ID=your-cx-id-here

# يجب أن يبدأ بـ: [a-z0-9]+
```

---

## 📚 الموارد

- [Google Custom Search API Docs](https://developers.google.com/custom-search/v1/overview)
- [Programmable Search Engine](https://programmablesearchengine.google.com/)
- [Pricing Calculator](https://developers.google.com/custom-search/v1/overview#pricing)

---

## 🎉 الخلاصة

النظام الآن **جاهز للاستخدام** ويوفر:

✅ بحث احترافي من Google  
✅ تخزين مؤقت ذكي  
✅ معالجة أخطاء متقدمة  
✅ تتبع استخدام تلقائي  
✅ نتائج منسقة جميلة  
✅ fallback تلقائي  

**فقط أضف المفاتيح وابدأ البحث! 🚀**

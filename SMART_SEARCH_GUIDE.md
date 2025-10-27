# 🧠 نظام البحث الذكي متعدد المصادر

## 📋 نظرة عامة

نظام بحث ذكي يختار **المصدر الأنسب** تلقائياً حسب نوع السؤال!

---

## 🎯 المصادر المتاحة:

### 1️⃣ **Google Search** 🔍
**متى يُستخدم:**
- الأخبار والأحداث الجارية
- معلومات عامة
- مقارنات ومراجعات
- أسعار ومنتجات

**مثال:**
```
"أخبار الذكاء الاصطناعي اليوم"
"أفضل هواتف 2025"
"سعر الذهب"
```

---

### 2️⃣ **YouTube** 📹
**متى يُستخدم:**
- شروحات وتعليم
- فيديوهات تعليمية
- دروس ومحتوى مرئي

**كلمات مفتاحية:**
- فيديو، شرح، كيف، طريقة، تعليم، درس
- video, how to, tutorial, learn, watch

**مثال:**
```
"شرح React بالعربي"
"كيف أسوي كيكة"
"فيديو عن البرمجة"
```

---

### 3️⃣ **Wikipedia** 📚
**متى يُستخدم:**
- تعريفات وموسوعات
- معلومات تاريخية
- شخصيات وأماكن
- مفاهيم علمية

**كلمات مفتاحية:**
- من هو، ما هي، ما هو، تعريف، معنى
- who is, what is, define, meaning

**مثال:**
```
"من هو ستيف جوبز"
"ما هو الذكاء الاصطناعي"
"تعريف البرمجة"
```

---

### 4️⃣ **Stack Overflow** 💻
**متى يُستخدم:**
- أسئلة برمجية
- حل مشاكل تقنية
- أكواد وأمثلة

**كلمات مفتاحية:**
- كود، برمجة، خطأ، error, code, function
- javascript, python, react, typescript

**مثال:**
```
"حل مشكلة useEffect في React"
"كود Python للبحث"
"error في TypeScript"
```

---

## 🚀 كيف يعمل النظام؟

### خطوة 1: تحليل السؤال
```typescript
const sources = detectSearchSources(query);
// يحلل الكلمات المفتاحية ويحدد المصادر المناسبة
```

### خطوة 2: ترتيب الأولويات
```
Priority 1: المصدر الأنسب (YouTube/Wikipedia/Stack Overflow)
Priority 2: Google Search (كخيار احتياطي)
```

### خطوة 3: البحث المتوازي
```typescript
// يبحث في كل المصادر المناسبة
const results = await smartMultiSourceSearch(query);
```

### خطوة 4: دمج النتائج
```
Primary: النتائج من المصدر الرئيسي
Secondary: نتائج إضافية من مصادر أخرى
```

---

## 📝 أمثلة الاستخدام:

### مثال 1: بحث ذكي تلقائي
```typescript
import { searchWeb } from '@/app/chat/web-search';

const result = await searchWeb('شرح React للمبتدئين', {
  useSmartSearch: true  // ✨ تفعيل البحث الذكي
});

// سيبحث في YouTube أولاً لأنه فيه كلمة "شرح"
```

### مثال 2: بحث متعدد المصادر
```typescript
import { smartMultiSourceSearch, formatMultiSourceResults } from '@/app/chat/smart-multi-source-search';

const result = await smartMultiSourceSearch('من هو إيلون ماسك');

// النتائج:
// Primary: Wikipedia (تعريف)
// Secondary: Google (أخبار), YouTube (فيديوهات)

const formatted = formatMultiSourceResults(result);
console.log(formatted);
```

### مثال 3: إجبار مصادر محددة
```typescript
const result = await smartMultiSourceSearch('React Tutorial', {
  maxResults: 5,
  forcedSources: ['youtube', 'stackoverflow']
  // سيبحث فقط في YouTube و Stack Overflow
});
```

---

## 🎨 تنسيق النتائج:

```markdown
🔍 **نتائج البحث متعددة المصادر**

## 🎯 YouTube (المصدر الرئيسي)

**1. شرح React بالعربي - كامل**

📹 قناة: Code Academy
🖼️ [معاينة](thumbnail.jpg)
شرح شامل لـ React من الصفر حتى الاحتراف...

🔗 [اضغط للمشاهدة](https://youtube.com/...)

---

## 📚 مصادر إضافية:

### Wikipedia

**1. React (JavaScript library)**
...

### Google

**1. React - A JavaScript library**
...

💡 تبي تفاصيل أكثر من مصدر معين؟ 😊
```

---

## ⚙️ إعداد المفاتيح:

### 1. YouTube API Key

**الخطوات:**
1. اذهب إلى [Google Cloud Console](https://console.cloud.google.com/)
2. فعّل **YouTube Data API v3**
3. أنشئ **API Key**
4. أضفه للـ `.env.local`:

```bash
YOUTUBE_API_KEY=AIzaSy...your-key...
```

**الحصة المجانية:**
- 10,000 استعلام/يوم
- كل بحث = 100 وحدة
- = 100 بحث/يوم مجاناً

### 2. Wikipedia API

✅ **مجاني بالكامل!**
- لا يحتاج API Key
- بدون حدود
- يعمل مباشرة

### 3. Stack Overflow API

✅ **مجاني بالكامل!**
- لا يحتاج API Key
- 300 استعلام/يوم (بدون key)
- 10,000 استعلام/يوم (مع key)

---

## 📊 مقارنة الأداء:

### البحث العادي (Google فقط):
```
🔍 Google Search
⏱️ 500-1000ms
📄 5-10 نتائج
🎯 مصدر واحد
```

### البحث الذكي (متعدد المصادر):
```
🧠 Smart Multi-Source
⏱️ 800-1500ms
📄 15-30 نتيجة
🎯 3-4 مصادر مختلفة
✨ أكثر تنوعاً وشمولاً
```

---

## 🎯 متى تستخدم أيش؟

### استخدم `searchWeb()` العادي عندما:
- ✅ تحتاج سرعة
- ✅ بحث بسيط
- ✅ نتائج من Google كافية

```typescript
const result = await searchWeb('أخبار اليوم');
```

### استخدم `searchWeb({ useSmartSearch: true })` عندما:
- ✅ تحتاج تنوع
- ✅ السؤال يحتاج مصادر متعددة
- ✅ تريد أفضل مصدر تلقائياً

```typescript
const result = await searchWeb('شرح Python', {
  useSmartSearch: true  // ⭐ ذكي
});
```

### استخدم `smartMultiSourceSearch()` عندما:
- ✅ تحتاج تحكم كامل
- ✅ تريد كل المصادر
- ✅ تحتاج تنسيق خاص

```typescript
const result = await smartMultiSourceSearch('React');
```

---

## 🔄 التكامل مع الكود الحالي:

النظام **متوافق 100%** مع `web-search.ts`:

```typescript
// الطريقة القديمة (لا زالت تعمل)
const result = await searchWeb('السؤال');

// الطريقة الجديدة (ذكية)
const result = await searchWeb('السؤال', {
  useSmartSearch: true
});
```

---

## 🎉 الخلاصة:

النظام الآن يدعم:

✅ **4 مصادر**: Google, YouTube, Wikipedia, Stack Overflow  
✅ **ذكاء تلقائي**: يختار المصدر الأنسب  
✅ **بحث متوازي**: نتائج من مصادر متعددة  
✅ **تنسيق احترافي**: نتائج منظمة وجميلة  
✅ **توافق كامل**: يعمل مع الكود القديم  
✅ **مجاني**: Wikipedia و Stack Overflow  

**جرّبه الآن! 🚀**

---

## 📚 الموارد:

- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Wikipedia API](https://www.mediawiki.org/wiki/API:Main_page)
- [Stack Exchange API](https://api.stackexchange.com/docs)
- [Google Custom Search](https://developers.google.com/custom-search)

---

**🎊 استمتع بالبحث الذكي! 😊**

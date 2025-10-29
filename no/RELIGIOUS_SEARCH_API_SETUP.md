# 🕌 دليل إعداد نظام البحث الديني

## 📌 نظرة عامة

النظام الحالي مُعَد للبحث في المواقع الدينية الحقيقية بدلاً من قاعدة بيانات ثابتة.

---

## 🔑 الخطوات المطلوبة:

### 1️⃣ **اختيار خدمة البحث:**

يمكنك استخدام واحدة من هذه الخدمات:

#### أ) Google Custom Search API (الأفضل)
- **المميزات:** دقة عالية، نتائج محدثة
- **التكلفة:** 100 استعلام مجاني يومياً
- **الموقع:** https://developers.google.com/custom-search

**الخطوات:**
```bash
1. سجل في Google Cloud Console
2. فعّل Custom Search API
3. احصل على API Key
4. أنشئ Search Engine ID (cx)
5. حدد المواقع المستهدفة:
   - sistani.org
   - alkhoei.net
   - leader.ir
```

#### ب) SerpAPI (موصى به)
- **المميزات:** سهل الاستخدام، نتائج جاهزة
- **التكلفة:** 100 استعلام مجاني شهرياً
- **الموقع:** https://serpapi.com

```bash
1. سجل في serpapi.com
2. احصل على API Key
3. استخدم endpoint: /search.json
```

#### ج) Bing Search API
- **المميزات:** Microsoft Azure، موثوق
- **التكلفة:** 1000 استعلام مجاني شهرياً
- **الموقع:** https://azure.microsoft.com/en-us/services/cognitive-services/bing-web-search-api/

---

### 2️⃣ **إضافة المفاتيح إلى `.env.local`:**

```env
# Google Custom Search
GOOGLE_SEARCH_API_KEY=your_google_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here

# أو SerpAPI
SERPAPI_KEY=your_serpapi_key_here

# أو Bing Search
BING_SEARCH_API_KEY=your_bing_api_key_here
```

---

### 3️⃣ **تحديث الكود في `religious_search_component.ts`:**

#### مثال باستخدام Google Custom Search:

```typescript
async function searchShiiteWebsites(query: string): Promise<ReligiousSearchResult[]> {
  const GOOGLE_API_KEY = process.env.GOOGLE_SEARCH_API_KEY;
  const SEARCH_ENGINE_ID = process.env.GOOGLE_SEARCH_ENGINE_ID;
  
  const searchQuery = `${query} site:sistani.org OR site:alkhoei.net OR site:leader.ir`;
  
  const response = await fetch(
    `https://www.googleapis.com/customsearch/v1?` +
    `key=${GOOGLE_API_KEY}&` +
    `cx=${SEARCH_ENGINE_ID}&` +
    `q=${encodeURIComponent(searchQuery)}&` +
    `num=5&` +
    `lr=lang_ar`
  );
  
  const data = await response.json();
  
  return data.items.map((item: any) => ({
    text: item.snippet,
    source: item.displayLink,
    reference: item.link
  }));
}
```

#### مثال باستخدام SerpAPI:

```typescript
async function searchShiiteWebsites(query: string): Promise<ReligiousSearchResult[]> {
  const SERPAPI_KEY = process.env.SERPAPI_KEY;
  
  const searchQuery = `${query} site:sistani.org OR site:alkhoei.net`;
  
  const response = await fetch(
    `https://serpapi.com/search.json?` +
    `api_key=${SERPAPI_KEY}&` +
    `q=${encodeURIComponent(searchQuery)}&` +
    `num=5&` +
    `hl=ar`
  );
  
  const data = await response.json();
  
  return data.organic_results.map((result: any) => ({
    text: result.snippet,
    source: result.source,
    reference: result.link
  }));
}
```

---

### 4️⃣ **المواقع المستهدفة:**

#### المواقع الشيعية:
```
✅ sistani.org      - موقع السيد السيستاني (الرسمي)
✅ alkhoei.net      - مؤسسة الإمام الخوئي الخيرية
✅ leader.ir        - موقع السيد الخامنئي
✅ alhaydari.com    - مواقع فقهية شيعية
```

#### المواقع السنية:
```
✅ islamqa.info     - الإسلام سؤال وجواب
✅ dar-alifta.org   - دار الإفتاء المصرية
```

---

### 5️⃣ **تحسين النتائج:**

```typescript
// إضافة فلترة للنتائج
function filterReligiousResults(results: any[]): ReligiousSearchResult[] {
  return results
    .filter(result => {
      // استبعد النتائج غير المفيدة
      const lowerText = result.snippet.toLowerCase();
      return (
        lowerText.includes('حكم') ||
        lowerText.includes('فتوى') ||
        lowerText.includes('الجواب') ||
        lowerText.includes('يجوز') ||
        lowerText.includes('لا يجوز')
      );
    })
    .slice(0, 3) // خذ أفضل 3 نتائج
    .map(result => ({
      text: result.snippet,
      source: result.displayLink,
      reference: result.link
    }));
}
```

---

### 6️⃣ **Caching (التخزين المؤقت):**

لتحسين الأداء وتقليل التكلفة:

```typescript
// في ملف منفصل: cache.ts
const searchCache = new Map<string, { result: any, timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 ساعة

async function getCachedSearch(query: string): Promise<any | null> {
  const cached = searchCache.get(query);
  if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
    return cached.result;
  }
  return null;
}

async function setCachedSearch(query: string, result: any): Promise<void> {
  searchCache.set(query, { result, timestamp: Date.now() });
}
```

---

## 🧪 اختبار النظام:

```bash
# 1. أضف API Keys في .env.local
# 2. أعد تشغيل الخادم
npm run dev

# 3. اختبر سؤال ديني
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"messages":[{"role":"user","content":"هل شرب البيرة حرام؟"}]}'
```

---

## 📊 مراقبة الاستخدام:

```typescript
// إضافة logging
console.log(`🔍 بحث ديني: "${query}"`);
console.log(`📊 استخدام API: ${apiCallCount}/100`);
console.log(`💰 التكلفة المقدرة: $${cost}`);
```

---

## 🚀 البدائل (إذا لم تتوفر API):

### 1. Web Scraping مباشر:
```typescript
import * as cheerio from 'cheerio';

async function scrapeWebsite(url: string, query: string) {
  const response = await fetch(url);
  const html = await response.text();
  const $ = cheerio.load(html);
  
  // استخرج المحتوى المطلوب
  const results = $('.fatwa-content').text();
  return results;
}
```

### 2. استخدام AI للبحث:
```typescript
// استخدم OpenAI أو Claude للبحث في محتوى المواقع
const prompt = `
ابحث عن فتوى حول "${query}" من مصادر شيعية معتمدة مثل:
- السيد السيستاني
- الإمام الخوئي
قدم الجواب مع المصدر والمرجع.
`;
```

---

## ⚠️ ملاحظات مهمة:

1. ✅ **احترم حدود API** - لا تتجاوز العدد المسموح
2. ✅ **استخدم Caching** - لتقليل التكلفة
3. ✅ **أضف Error Handling** - لمعالجة الأخطاء
4. ✅ **راجع شروط الاستخدام** - لكل موقع
5. ✅ **حافظ على سرية API Keys** - لا ترفعها على Git

---

## 📝 الخلاصة:

النظام الحالي جاهز للربط مع أي API بحث. فقط:
1. اختر الخدمة المناسبة
2. احصل على API Key
3. حدّث الدوال في `religious_search_component.ts`
4. اختبر النظام

**النتيجة:** بحث ديني حقيقي ومحدث في المواقع المعتمدة! 🎉

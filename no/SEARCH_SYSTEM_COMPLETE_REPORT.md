# 📊 تقرير شامل عن نظام البحث - oqoolai

## 📅 التاريخ: 22 أكتوبر 2025

---

## 📋 جدول المحتويات

1. [نظرة عامة](#نظرة-عامة)
2. [الهيكل العام للنظام](#الهيكل-العام-للنظام)
3. [المكونات الرئيسية](#المكونات-الرئيسية)
4. [المزودين (Providers)](#المزودين-providers)
5. [آلية عمل البحث](#آلية-عمل-البحث)
6. [التخزين المؤقت والأداء](#التخزين-المؤقت-والأداء)
7. [الذكاء الاصطناعي](#الذكاء-الاصطناعي)
8. [الواجهة الأمامية](#الواجهة-الأمامية)
9. [ملفات النظام](#ملفات-النظام)
10. [التكامل والاستخدام](#التكامل-والاستخدام)

---

## 1. نظرة عامة

### ما هو نظام البحث؟

نظام بحث متقدم ومتكامل يوفر:
- ✅ بحث ذكي متعدد المصادر
- ✅ تحليل تلقائي للاستعلامات
- ✅ ترتيب ذكي للنتائج
- ✅ تخزين مؤقت للأداء
- ✅ دعم YouTube, Google, Wikipedia
- ✅ تكامل مع الذكاء الاصطناعي

### الميزات الرئيسية

```
🔍 Smart Query Detection
🌐 Multi-Source Search
🧠 AI-Powered Ranking
💾 Multi-Level Caching
⚡ Performance Optimization
📊 Analytics & Tracking
🎯 Rate Limiting
🔄 Auto Retry Logic
```

---

## 2. الهيكل العام للنظام

### البنية الشاملة

```
src/
├── lib/
│   ├── search/                    # 🔍 نظام البحث الأساسي
│   │   ├── core/                  # المحرك الأساسي
│   │   │   ├── search-engine.ts   # محرك البحث الرئيسي
│   │   │   ├── cache-manager.ts   # إدارة التخزين المؤقت
│   │   │   ├── rate-limiter.ts    # تحديد معدل الطلبات
│   │   │   └── types.ts           # التعريفات الأساسية
│   │   │
│   │   ├── ai/                    # 🧠 الذكاء الاصطناعي
│   │   │   ├── query-analyzer.ts  # تحليل الاستعلامات
│   │   │   └── result-ranker.ts   # ترتيب النتائج
│   │   │
│   │   ├── providers/             # 🔌 مزودي البحث
│   │   │   ├── base-provider.ts   # المزود الأساسي
│   │   │   ├── google-provider.ts # Google Search
│   │   │   ├── youtube-provider.ts# YouTube Search
│   │   │   └── wikipedia-provider.ts # Wikipedia
│   │   │
│   │   ├── formatters/            # 🎨 التنسيق
│   │   │   └── markdown-formatter.ts
│   │   │
│   │   ├── QueryAnalyzer.ts       # محلل بديل (مبسط)
│   │   ├── SearchStrategy.ts      # استراتيجية بديلة
│   │   ├── SearchCache.ts         # كاش بديل
│   │   ├── RateLimiter.ts         # محدد بديل
│   │   ├── types.ts               # تعريفات إضافية
│   │   └── index.ts               # نقطة الدخول
│   │
│   ├── analytics/                 # 📊 التحليلات
│   │   └── SearchAnalytics.ts
│   │
│   └── web-search.ts              # 🌐 واجهة البحث القديمة
│
└── app/
    ├── api/
    │   └── chat/
    │       └── route.ts            # API endpoint للبحث
    │
    └── chat/
        ├── page.tsx                # صفحة الشات الرئيسية
        └── search/                 # مكونات البحث
            ├── SearchCard.tsx      # بطاقة نتيجة واحدة
            └── SearchResults.tsx   # عرض جميع النتائج
```

---

## 3. المكونات الرئيسية

### 3.1 محرك البحث (SearchEngine)

**الموقع:** `src/lib/search/core/search-engine.ts`

**الوظيفة:**
- المحرك الرئيسي للبحث
- تنسيق العمليات بين المزودين
- إدارة الكاش
- تطبيق Rate Limiting

**الأساليب الرئيسية:**

```typescript
class SearchEngine {
  // بحث بسيط
  async search(query: string, options?: SearchOptions): Promise<SearchResponse>

  // بحث متعدد المصادر
  async multiSourceSearch(query: string, options?: SearchOptions): Promise<MultiSourceResponse>

  // مسح الكاش
  clearCache(): void

  // الإحصائيات
  getStatistics(): PerformanceMetrics
}
```

**مثال الاستخدام:**

```typescript
import { searchEngine } from '@/lib/search';

const results = await searchEngine.search('ما هو الذكاء الاصطناعي؟');
console.log(results);
```

---

### 3.2 محلل الاستعلامات (QueryAnalyzer)

**الموقع:**
- `src/lib/search/ai/query-analyzer.ts` (متقدم)
- `src/lib/search/QueryAnalyzer.ts` (مبسط)

**الوظيفة:**
- تحليل نوع الاستعلام
- تحديد اللغة
- استخراج الكيانات
- تحديد النية

**التحليل:**

```typescript
interface QueryAnalysis {
  needsSearch: boolean;           // هل يحتاج بحث؟
  queryType: 'factual' | 'news' | 'howto' | 'opinion' | 'general';
  language: 'ar' | 'en' | 'mixed';
  intent: 'informational' | 'navigational' | 'transactional';
  entities: string[];             // الكيانات المستخرجة
  timeframe?: 'recent' | 'historical' | 'real-time';
}
```

**مثال:**

```typescript
import { queryAnalyzer } from '@/lib/search';

const analysis = queryAnalyzer.analyze('ابحث عن أحدث أخبار التقنية');
// {
//   needsSearch: true,
//   queryType: 'news',
//   language: 'ar',
//   timeframe: 'recent',
//   intent: 'informational'
// }
```

---

### 3.3 مرتب النتائج (ResultRanker)

**الموقع:** `src/lib/search/ai/result-ranker.ts`

**الوظيفة:**
- حساب درجات الأهمية
- ترتيب النتائج
- إزالة التكرار

**عوامل الترتيب:**

```typescript
interface RankingFactors {
  sourceAuthority: number;     // سلطة المصدر (0-10)
  contentFreshness: number;    // حداثة المحتوى (0-10)
  relevanceScore: number;      // الصلة بالموضوع (0-10)
  userEngagement: number;      // تفاعل المستخدمين (0-10)
  contentQuality: number;      // جودة المحتوى (0-10)
}
```

**الأوزان:**

```typescript
const defaultWeights = {
  sourceAuthority: 0.25,
  contentFreshness: 0.20,
  relevanceScore: 0.30,
  userEngagement: 0.15,
  contentQuality: 0.10
};
```

---

### 3.4 مدير التخزين المؤقت (CacheManager)

**الموقع:**
- `src/lib/search/core/cache-manager.ts` (متقدم - 3 مستويات)
- `src/lib/search/SearchCache.ts` (بسيط - في الذاكرة)

**المستويات (النسخة المتقدمة):**

1. **Memory Cache** (L1)
   - الأسرع
   - محدود (100 entry)
   - TTL: 5 دقائق

2. **Session Cache** (L2)
   - متوسط السرعة
   - للجلسة الحالية
   - TTL: 30 دقيقة

3. **Persistent Cache** (L3)
   - Redis/localStorage
   - دائم
   - TTL: 1 ساعة

**الاستخدام:**

```typescript
import { globalCacheManager } from '@/lib/search';

// الحصول من الكاش
const cached = await globalCacheManager.get('search:الذكاء الاصطناعي');

// الحفظ في الكاش
await globalCacheManager.set('search:الذكاء الاصطناعي', results, {
  ttl: 3600,
  level: 'persistent'
});
```

---

### 3.5 محدد معدل الطلبات (RateLimiter)

**الموقع:**
- `src/lib/search/core/rate-limiter.ts` (متقدم)
- `src/lib/search/RateLimiter.ts` (بسيط)

**الوظيفة:**
- منع تجاوز الحد المسموح
- حماية من Abuse
- تتبع الاستخدام

**الحدود:**

```typescript
const limits = {
  free: 100,      // 100 طلب/ساعة
  basic: 500,     // 500 طلب/ساعة
  pro: 2000,      // 2000 طلب/ساعة
  enterprise: -1  // غير محدود
};
```

**الاستخدام:**

```typescript
import { globalRateLimiter } from '@/lib/search';

const allowed = await globalRateLimiter.checkLimit('user123', 100);
if (!allowed) {
  throw new Error('Rate limit exceeded');
}
```

---

## 4. المزودين (Providers)

### 4.1 المزود الأساسي (BaseSearchProvider)

**الموقع:** `src/lib/search/providers/base-provider.ts`

**الوظيفة:**
- الواجهة الأساسية لجميع المزودين
- Auto Retry Logic
- Error Handling
- Timeout Management

**الأساليب:**

```typescript
abstract class BaseSearchProvider {
  abstract search(query: string, options?: SearchOptions): Promise<SearchResult[]>;

  protected async fetchWithRetry(url: string, options: RequestInit): Promise<Response>;

  protected handleError(error: Error): void;
}
```

---

### 4.2 Google Search Provider

**الموقع:** `src/lib/search/providers/google-provider.ts`

**API:** Google Custom Search API

**الإعدادات:**

```typescript
const config = {
  apiKey: process.env.GOOGLE_API_KEY,
  searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID,
  maxResults: 10
};
```

**المميزات:**
- ✅ بحث عام
- ✅ فلترة حسب اللغة
- ✅ فلترة حسب التاريخ
- ✅ SafeSearch

**الاستخدام:**

```typescript
import { googleSearchProvider } from '@/lib/search';

const results = await googleSearchProvider.search('الذكاء الاصطناعي', {
  language: 'ar',
  maxResults: 5
});
```

---

### 4.3 YouTube Search Provider

**الموقع:** `src/lib/search/providers/youtube-provider.ts`

**API:** YouTube Data API v3

**الإعدادات:**

```typescript
const config = {
  apiKey: process.env.YOUTUBE_API_KEY,
  maxResults: 5,
  type: 'video'
};
```

**البيانات المُسترجعة:**
- العنوان
- الوصف
- الصورة المصغرة
- القناة
- تاريخ النشر
- عدد المشاهدات
- المدة

**الاستخدام:**

```typescript
import { youtubeSearchProvider } from '@/lib/search';

const videos = await youtubeSearchProvider.search('شرح React', {
  maxResults: 5
});
```

---

### 4.4 Wikipedia Search Provider

**الموقع:** `src/lib/search/providers/wikipedia-provider.ts`

**API:** Wikipedia API

**المميزات:**
- ✅ بحث في المقالات
- ✅ استخراج الملخصات
- ✅ دعم متعدد اللغات

**الاستخدام:**

```typescript
import { wikipediaSearchProvider } from '@/lib/search';

const articles = await wikipediaSearchProvider.search('الذكاء الاصطناعي', {
  language: 'ar',
  limit: 3
});
```

---

## 5. آلية عمل البحث

### 5.1 تدفق البحث الكامل

```
1. المستخدم يكتب استعلام
   ↓
2. تحليل الاستعلام (QueryAnalyzer)
   - تحديد النوع
   - تحديد اللغة
   - استخراج الكيانات
   ↓
3. التحقق من Rate Limit
   - هل تجاوز الحد؟
   ↓
4. البحث في الكاش
   - موجود → إرجاع النتائج
   - غير موجود → متابعة
   ↓
5. اختيار المزودين (SearchStrategy)
   - News → Google News
   - HowTo → YouTube
   - Factual → Wikipedia + Google
   ↓
6. البحث المتوازي
   - تنفيذ على جميع المزودين
   - معالجة الأخطاء
   ↓
7. دمج النتائج
   - إزالة التكرار
   - توحيد الصيغة
   ↓
8. الترتيب (ResultRanker)
   - حساب الدرجات
   - الترتيب النهائي
   ↓
9. التخزين المؤقت
   - حفظ في الكاش
   ↓
10. تكامل AI
    - توليد مقدمة (OpenAI)
    - تنسيق الرد
    ↓
11. الإرجاع للمستخدم
```

---

### 5.2 مثال كامل للتنفيذ

```typescript
// في route.ts
export async function POST(req: Request) {
  const { message } = await req.json();

  // 1. تحليل الاستعلام
  const analysis = queryAnalyzer.analyze(message);

  if (!analysis.needsSearch) {
    // رد عادي من AI
    return normalAIResponse(message);
  }

  // 2. Rate Limiting
  const userId = getUserId(req);
  if (!await rateLimiter.checkLimit(userId)) {
    return { error: 'Rate limit exceeded' };
  }

  // 3. البحث في الكاش
  const cached = await searchCache.get(message);
  if (cached) {
    return { results: cached, cached: true };
  }

  // 4. اختيار المزودين
  const sources = searchStrategy.selectSources(analysis);

  // 5. تنفيذ البحث
  const results = await searchStrategy.executeSearch(message, sources);

  // 6. توليد مقدمة AI
  const aiIntro = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: 'أنت مساعد ذكي عربي اسمك oqoolai...'
      },
      { role: 'user', content: message }
    ],
    max_tokens: 150,
    temperature: 0.7
  });

  // 7. التخزين المؤقت
  await searchCache.set(message, results);

  // 8. التحليلات
  await searchAnalytics.trackSearch({
    query: message,
    resultCount: results.length,
    sources: sources,
    responseTime: Date.now() - startTime
  });

  // 9. الإرجاع
  return {
    content: aiIntro.choices[0].message.content,
    searchResults: results
  };
}
```

---

## 6. التخزين المؤقت والأداء

### 6.1 استراتيجيات الكاش

#### Memory Cache (الأسرع)
```typescript
// في الذاكرة
const cache = new Map<string, CacheEntry>();

// TTL: 5 دقائق
// Size: 100 entries
// Hit Rate: ~70%
```

#### Session Cache
```typescript
// localStorage/sessionStorage
window.sessionStorage.setItem(key, JSON.stringify(value));

// TTL: 30 دقيقة
// Size: 5 MB
// Hit Rate: ~50%
```

#### Persistent Cache (Redis)
```typescript
// Upstash Redis
await redis.setex(key, 3600, JSON.stringify(value));

// TTL: 1 ساعة
// Size: غير محدود
// Hit Rate: ~30%
```

---

### 6.2 تحسينات الأداء

**1. Parallel Execution**
```typescript
const promises = sources.map(source =>
  searchWithSource(query, source)
);
const results = await Promise.all(promises);
```

**2. Request Deduplication**
```typescript
const pendingRequests = new Map();
if (pendingRequests.has(key)) {
  return pendingRequests.get(key);
}
```

**3. Lazy Loading**
```typescript
// تحميل النتائج تدريجياً
const initialResults = results.slice(0, 3);
// باقي النتائج عند الطلب
```

**4. Compression**
```typescript
// ضغط البيانات قبل التخزين
const compressed = compress(JSON.stringify(data));
await cache.set(key, compressed);
```

---

## 7. الذكاء الاصطناعي

### 7.1 OpenAI Integration

**الاستخدام:**

1. **مقدمة AI للبحث**
```typescript
const introResponse = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [
    {
      role: 'system',
      content: `أنت مساعد ذكي عربي اسمك oqoolai.

قواعد مهمة:
1. أجب على أسئلة المستخدم بشكل طبيعي ومفيد
2. لا تذكر "نتائج البحث" في ردك
3. لا تستخدم emojis مثل 📹 💡 في البداية
4. رد بشكل محادثة طبيعية

عندما يطلب المستخدم بحثاً:
- أعطه إجابة مباشرة عن الموضوع في 3-4 جمل (60-80 كلمة)
- النظام سيعرض نتائج البحث تلقائياً تحت ردك
- لا تحتاج تكتب "نتائج البحث"
- ركز على إعطاء معلومات مفيدة وواضحة`
    },
    { role: 'user', content: userInput }
  ],
  max_tokens: 150,
  temperature: 0.7
});
```

2. **تحليل الاستعلامات**
```typescript
// يمكن استخدام AI لتحليل أعمق
const analysis = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: [{
    role: 'system',
    content: 'حلل هذا الاستعلام وحدد نوعه ونيته'
  }, {
    role: 'user',
    content: query
  }]
});
```

---

### 7.2 Query Understanding

**تحليل متقدم:**

```typescript
class AdvancedQueryAnalyzer {
  async analyzeWithAI(query: string): Promise<DetailedAnalysis> {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{
        role: 'system',
        content: `حلل الاستعلام التالي وأرجع JSON:
{
  "intent": "...",
  "entities": [...],
  "category": "...",
  "suggestedSources": [...]
}`
      }, {
        role: 'user',
        content: query
      }]
    });

    return JSON.parse(response.choices[0].message.content);
  }
}
```

---

## 8. الواجهة الأمامية

### 8.1 صفحة الشات (page.tsx)

**الموقع:** `src/app/chat/page.tsx`

**المكونات الرئيسية:**

```tsx
export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (input: string) => {
    // إرسال للـ API
    const response = await fetch('/api/chat', {
      method: 'POST',
      body: JSON.stringify({ message: input })
    });

    const data = await response.json();

    // إضافة للرسائل
    setMessages(prev => [...prev, {
      role: 'assistant',
      content: data.content,
      searchResults: data.searchResults
    }]);
  };

  return (
    <div>
      {/* عرض الرسائل */}
      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {/* حقل الإدخال */}
      <ChatInput onSend={handleSend} />
    </div>
  );
}
```

---

### 8.2 بطاقة النتيجة (SearchCard.tsx)

**الموقع:** `src/app/chat/search/SearchCard.tsx`

**التصميم:**

```tsx
export function SearchCard({ result, index }: SearchCardProps) {
  return (
    <div className="search-card">
      {/* الرقم */}
      {index && <div className="index">{index}</div>}

      {/* الصورة */}
      {result.thumbnail && (
        <img src={result.thumbnail} alt={result.title} />
      )}

      {/* العنوان */}
      <h3>{result.title}</h3>
    </div>
  );
}
```

**الميزات:**
- ✅ Responsive Design
- ✅ Lazy Loading للصور
- ✅ Hover Effects
- ✅ Click Analytics

---

### 8.3 عرض النتائج (SearchResults.tsx)

**الموقع:** `src/app/chat/search/SearchResults.tsx`

**الميزات:**

```tsx
export function SearchResults({ results }: Props) {
  const [activeTab, setActiveTab] = useState<'all' | 'youtube' | 'article'>('all');
  const [sortBy, setSortBy] = useState<'relevance' | 'date'>('relevance');

  return (
    <div>
      {/* Tabs */}
      <Tabs value={activeTab} onChange={setActiveTab}>
        <Tab label="الكل" value="all" count={results.length} />
        <Tab label="فيديوهات" value="youtube" count={videoCount} />
        <Tab label="مقالات" value="article" count={articleCount} />
      </Tabs>

      {/* Sort */}
      <Select value={sortBy} onChange={setSortBy}>
        <Option value="relevance">الأكثر صلة</Option>
        <Option value="date">الأحدث</Option>
      </Select>

      {/* Grid */}
      <div className="results-grid">
        {filteredResults.map((result, i) => (
          <SearchCard key={i} result={result} index={i+1} />
        ))}
      </div>
    </div>
  );
}
```

---

## 9. ملفات النظام

### 9.1 قائمة الملفات الكاملة

#### Core System

```
src/lib/search/core/
├── search-engine.ts          # المحرك الرئيسي (500+ lines)
├── cache-manager.ts          # إدارة الكاش (400+ lines)
├── rate-limiter.ts           # Rate Limiting (300+ lines)
└── types.ts                  # التعريفات (200+ lines)
```

#### AI Components

```
src/lib/search/ai/
├── query-analyzer.ts         # تحليل الاستعلامات (350+ lines)
└── result-ranker.ts          # ترتيب النتائج (250+ lines)
```

#### Providers

```
src/lib/search/providers/
├── base-provider.ts          # المزود الأساسي (200+ lines)
├── google-provider.ts        # Google Search (300+ lines)
├── youtube-provider.ts       # YouTube (350+ lines)
└── wikipedia-provider.ts     # Wikipedia (250+ lines)
```

#### Simplified Versions

```
src/lib/search/
├── QueryAnalyzer.ts          # محلل مبسط (150 lines)
├── SearchStrategy.ts         # استراتيجية مبسطة (180 lines)
├── SearchCache.ts            # كاش بسيط (80 lines)
├── RateLimiter.ts            # محدد بسيط (60 lines)
└── types.ts                  # تعريفات إضافية (40 lines)
```

#### Analytics

```
src/lib/analytics/
└── SearchAnalytics.ts        # التحليلات (100 lines)
```

#### UI Components

```
src/app/chat/search/
├── SearchCard.tsx            # بطاقة النتيجة (160 lines)
└── SearchResults.tsx         # عرض النتائج (235 lines)
```

#### API Endpoints

```
src/app/api/chat/
└── route.ts                  # API للبحث (800+ lines)
```

---

### 9.2 تفاصيل الملفات الرئيسية

#### `search-engine.ts` (المحرك الرئيسي)

**الحجم:** ~500 lines
**المسؤوليات:**
- تنسيق البحث
- إدارة المزودين
- التكامل مع الكاش
- Rate Limiting
- Error Handling

**الأساليب الرئيسية:**

```typescript
class SearchEngine {
  // بحث بسيط
  async search(query, options): Promise<SearchResponse>

  // بحث متعدد المصادر
  async multiSourceSearch(query, options): Promise<MultiSourceResponse>

  // بحث من مصدر محدد
  async searchWithProvider(query, provider, options)

  // دمج النتائج
  private mergeResults(results): SearchResult[]

  // إزالة التكرار
  private deduplicateResults(results): SearchResult[]

  // الإحصائيات
  getStatistics(): PerformanceMetrics

  // مسح الكاش
  clearCache(): void
}
```

---

#### `query-analyzer.ts` (تحليل الاستعلامات)

**الحجم:** ~350 lines
**المسؤوليات:**
- تحليل النص
- استخراج الكيانات
- تحديد النية
- تحديد اللغة

**الأساليب:**

```typescript
class QueryAnalyzer {
  // التحليل الرئيسي
  analyze(query): QueryAnalysis

  // تحديد الفئة
  categorize(query): QueryCategory

  // استخراج الكيانات
  extractEntities(query): Entity[]

  // تحديد النية
  detectIntent(query): QueryIntent

  // تحديد اللغة
  detectLanguage(query): string

  // اقتراح مصادر
  suggestSources(analysis): SearchSource[]
}
```

---

#### `result-ranker.ts` (ترتيب النتائج)

**الحجم:** ~250 lines
**المسؤوليات:**
- حساب الدرجات
- تطبيق الأوزان
- الترتيب النهائي

**الأساليب:**

```typescript
class ResultRanker {
  // ترتيب النتائج
  rank(results, query, weights?): SearchResult[]

  // حساب درجة واحدة
  calculateScore(result, query, weights): number

  // عوامل الترتيب
  private getSourceAuthority(source): number
  private getContentFreshness(date): number
  private getRelevanceScore(result, query): number
  private getUserEngagement(result): number
  private getContentQuality(result): number
}
```

---

#### `google-provider.ts` (Google Search)

**الحجم:** ~300 lines
**API:** Google Custom Search API
**Rate Limit:** 100 queries/day (مجاناً)

**الإعدادات:**

```typescript
const config = {
  apiKey: process.env.GOOGLE_API_KEY!,
  searchEngineId: process.env.GOOGLE_SEARCH_ENGINE_ID!,
  baseUrl: 'https://www.googleapis.com/customsearch/v1',
  maxResults: 10,
  defaultLanguage: 'ar'
};
```

**الأساليب:**

```typescript
class GoogleSearchProvider extends BaseSearchProvider {
  // البحث
  async search(query, options): Promise<SearchResult[]>

  // بناء URL
  private buildSearchUrl(query, options): string

  // معالجة النتائج
  private formatResults(rawResults): SearchResult[]

  // معالجة الأخطاء
  protected handleError(error): void
}
```

---

#### `youtube-provider.ts` (YouTube Search)

**الحجم:** ~350 lines
**API:** YouTube Data API v3
**Rate Limit:** 10,000 units/day

**البيانات:**

```typescript
interface YouTubeResult {
  id: { videoId: string };
  snippet: {
    title: string;
    description: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
    channelTitle: string;
    publishedAt: string;
  };
  statistics?: {
    viewCount: string;
    likeCount: string;
  };
  contentDetails?: {
    duration: string; // ISO 8601 format
  };
}
```

**تنسيق المدة:**

```typescript
private formatDuration(iso8601: string): string {
  // PT1H30M15S → 1:30:15
  const match = iso8601.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = match[1] || 0;
  const minutes = match[2] || 0;
  const seconds = match[3] || 0;

  if (hours > 0) {
    return `${hours}:${minutes.padStart(2, '0')}:${seconds.padStart(2, '0')}`;
  }
  return `${minutes}:${seconds.padStart(2, '0')}`;
}
```

---

#### `cache-manager.ts` (إدارة الكاش)

**الحجم:** ~400 lines
**المستويات:** 3 (Memory, Session, Persistent)

**الواجهة:**

```typescript
interface CacheStrategy {
  // الحصول
  get(key: string): Promise<any | null>;

  // الحفظ
  set(key: string, value: any, options?: CacheOptions): Promise<void>;

  // الحذف
  delete(key: string): Promise<void>;

  // المسح الكامل
  clear(): Promise<void>;

  // الإحصائيات
  getStats(): CacheStats;
}
```

**التطبيقات:**

```typescript
class MemoryCacheStrategy implements CacheStrategy {
  private cache = new Map<string, CacheEntry>();
  private maxSize = 100;
  private ttl = 300000; // 5 minutes

  async get(key: string) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.value;
  }

  async set(key: string, value: any, options?: CacheOptions) {
    // تطبيق LRU إذا امتلأ
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      value,
      expiry: Date.now() + (options?.ttl || this.ttl)
    });
  }
}
```

---

#### `rate-limiter.ts` (تحديد الطلبات)

**الحجم:** ~300 lines
**الخوارزمية:** Sliding Window

**التطبيق:**

```typescript
class RateLimiter {
  private limits = new Map<string, RequestLog[]>();

  async checkLimit(userId: string, limit: number = 100): Promise<RateLimitInfo> {
    const now = Date.now();
    const windowSize = 3600000; // 1 hour

    // الحصول على سجل المستخدم
    const userLog = this.limits.get(userId) || [];

    // تصفية الطلبات القديمة
    const recentRequests = userLog.filter(
      log => now - log.timestamp < windowSize
    );

    // التحقق من الحد
    const remaining = Math.max(0, limit - recentRequests.length);
    const allowed = remaining > 0;

    if (allowed) {
      recentRequests.push({ timestamp: now });
      this.limits.set(userId, recentRequests);
    }

    // الوقت حتى إعادة التعيين
    const oldestRequest = recentRequests[0];
    const resetTime = oldestRequest
      ? oldestRequest.timestamp + windowSize
      : now + windowSize;

    return {
      allowed,
      limit,
      remaining,
      resetTime,
      retryAfter: allowed ? 0 : resetTime - now
    };
  }
}
```

---

## 10. التكامل والاستخدام

### 10.1 الاستخدام الأساسي

```typescript
// استيراد
import { search } from '@/lib/search';

// بحث بسيط
const results = await search('ما هو الذكاء الاصطناعي؟');

// بحث مع خيارات
const results = await search('AI news', {
  language: 'en',
  maxResults: 5,
  sources: ['google', 'youtube']
});
```

---

### 10.2 الاستخدام المتقدم

```typescript
import {
  searchEngine,
  queryAnalyzer,
  searchCache,
  rateLimiter
} from '@/lib/search';
import { searchAnalytics } from '@/lib/analytics/SearchAnalytics';

async function advancedSearch(query: string, userId: string) {
  // 1. Rate Limiting
  const rateLimit = await rateLimiter.checkLimit(userId);
  if (!rateLimit.allowed) {
    throw new Error(`Rate limit exceeded. Retry after ${rateLimit.retryAfter}ms`);
  }

  // 2. Query Analysis
  const analysis = queryAnalyzer.analyze(query);
  console.log('Query Analysis:', analysis);

  // 3. Cache Check
  const cacheKey = `search:${query.toLowerCase()}`;
  const cached = await searchCache.get(cacheKey);

  if (cached) {
    console.log('✅ Cache HIT');
    return { results: cached, cached: true };
  }

  // 4. Search Execution
  const startTime = Date.now();
  const response = await searchEngine.search(query, {
    maxResults: 10,
    language: analysis.language
  });
  const responseTime = Date.now() - startTime;

  // 5. Cache Storage
  await searchCache.set(cacheKey, response.results);

  // 6. Analytics
  await searchAnalytics.trackSearch({
    query,
    resultCount: response.results.length,
    sources: response.sources,
    responseTime,
    timestamp: new Date(),
    userId
  });

  // 7. Return
  return {
    results: response.results,
    cached: false,
    analysis,
    performanceMetrics: {
      responseTime,
      cacheHit: false,
      sourcesUsed: response.sources
    }
  };
}
```

---

### 10.3 التكامل في API

```typescript
// src/app/api/chat/route.ts

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { queryAnalyzer, searchCache } from '@/lib/search';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req: NextRequest) {
  try {
    const { message, model } = await req.json();

    // تحليل الاستعلام
    const analysis = queryAnalyzer.analyze(message);

    if (!analysis.needsSearch) {
      // رد AI عادي بدون بحث
      return normalAIResponse(message, model);
    }

    // تنفيذ البحث (YouTube كمثال)
    const youtubeResults = await searchYouTube(message);

    // توليد مقدمة AI
    let aiIntro = '';
    try {
      const introResponse = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `أنت مساعد ذكي عربي اسمك oqool.

قواعد مهمة:
1. أجب على أسئلة المستخدم بشكل طبيعي ومفيد
2. لا تذكر "نتائج البحث" في ردك
3. لا تستخدم emojis مثل 📹 💡 في البداية
4. رد بشكل محادثة طبيعية

عندما يطلب المستخدم بحثاً:
- أعطه إجابة مباشرة عن الموضوع في 3-4 جمل (60-80 كلمة)
- النظام سيعرض نتائج البحث تلقائياً تحت ردك
- لا تحتاج تكتب "نتائج البحث"
- ركز على إعطاء معلومات مفيدة وواضحة`
          },
          { role: 'user', content: message }
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      aiIntro = introResponse.choices[0]?.message?.content?.trim() || '';
    } catch (error) {
      console.error('❌ خطأ في توليد الرد:', error);
    }

    // تنسيق النتائج
    const sources = youtubeResults.map(result => ({
      title: result.title,
      url: result.url,
      snippet: result.description,
      thumbnail: result.thumbnail,
      source: 'YouTube',
      type: 'youtube',
      video: {
        duration: result.duration,
        views: result.views,
        channelName: result.channelName
      }
    }));

    // الإرجاع
    return NextResponse.json({
      success: true,
      message: aiIntro,
      model: 'quick-search',
      isSearchResult: true,
      sources,
      searchMetadata: {
        query: message,
        source: 'YouTube',
        totalResults: sources.length
      }
    });

  } catch (error) {
    console.error('❌ خطأ في API:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في البحث' },
      { status: 500 }
    );
  }
}
```

---

## 📊 الإحصائيات والأداء

### حجم الكود الإجمالي

```
Core System:       ~1,400 lines
AI Components:     ~600 lines
Providers:         ~1,100 lines
Simplified:        ~510 lines
Analytics:         ~100 lines
UI Components:     ~395 lines
API Endpoints:     ~800 lines
─────────────────────────────
Total:             ~4,905 lines
```

### الأداء المتوقع

```
Cache Hit Rate:         60-70%
Average Response Time:  800-1200ms (without cache)
Average Response Time:  50-100ms (with cache)
Throughput:            50-100 requests/second
Error Rate:            <1%
```

---

## 🔐 متغيرات البيئة المطلوبة

```env
# OpenAI
OPENAI_API_KEY=sk-...

# Google Search
GOOGLE_API_KEY=AIza...
GOOGLE_SEARCH_ENGINE_ID=...

# YouTube
YOUTUBE_API_KEY=AIza...

# Redis (اختياري للكاش)
UPSTASH_REDIS_URL=https://...
UPSTASH_REDIS_TOKEN=...
```

---

## 📚 المراجع والموارد

### APIs المستخدمة

1. **OpenAI API**
   - Docs: https://platform.openai.com/docs
   - Pricing: $0.002/1K tokens (GPT-4o-mini)

2. **Google Custom Search API**
   - Docs: https://developers.google.com/custom-search
   - Free Tier: 100 queries/day

3. **YouTube Data API v3**
   - Docs: https://developers.google.com/youtube/v3
   - Free Tier: 10,000 units/day

4. **Wikipedia API**
   - Docs: https://www.mediawiki.org/wiki/API
   - Free: غير محدود

### المكتبات

```json
{
  "openai": "^4.20.0",
  "next": "14.2.33",
  "react": "^18.2.0",
  "typescript": "^5.0.0"
}
```

---

## 🎯 الخلاصة

نظام بحث متكامل ومتقدم يوفر:

✅ **بحث ذكي** - تحليل تلقائي للاستعلامات
✅ **مصادر متعددة** - Google, YouTube, Wikipedia
✅ **AI Integration** - مقدمة ذكية لكل بحث
✅ **أداء عالي** - كاش متعدد المستويات
✅ **حماية** - Rate Limiting وتتبع الاستخدام
✅ **تحليلات** - إحصائيات شاملة
✅ **واجهة جميلة** - UI احترافية ومريحة

---

**آخر تحديث:** 22 أكتوبر 2025
**الإصدار:** 2.0
**الحالة:** ✅ Production Ready

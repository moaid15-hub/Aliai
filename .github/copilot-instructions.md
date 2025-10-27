# Copilot Instructions for OqoolAI (عقول)

**OqoolAI** هو منصة شات ذكي عربية متقدمة مع نظام متعدد المزودين، قدرات بحث متقدمة، ومعالجة محتوى متخصصة.

## 🏗️ البنية المعمارية

### الهيكل الأساسي
- **Next.js 14** App Router مع TypeScript
- **تصميم RTL أولاً** - العربية كلغة أساسية
- **نظام AI متعدد المزودين** مع fallback ذكي (OpenAI → Claude → DeepSeek)
- **محرك بحث معياري** يدعم Google, YouTube, Wikipedia مع تصنيف ذكي للاستعلامات
- **تنظيم قائم على الميزات** في `src/features/` للشخصيات ومعالجة الصور
- **نظام اشتراكات متقدم** مع حدود استخدام يومية (Free, Premium, Enterprise)

### الدلائل الرئيسية
```
src/
├── app/                    # Next.js routes & API endpoints
│   ├── api/               # API routes (chat, search, subscription)
│   ├── chat/              # صفحة الدردشة الرئيسية
│   ├── ai-selector.ts     # نظام اختيار المزود الذكي
│   ├── ai-service.ts      # خدمات AI الأساسية
│   └── config.ts          # تكوين المزودين والألوان
├── lib/                   # Core business logic
│   ├── search/            # محرك البحث المعياري
│   ├── subscription/      # نظام الاشتراكات والحدود
│   ├── ai/                # خدمات AI (OpenAI, Claude)
│   └── types.ts           # أنواع TypeScript المشتركة
├── features/              # ميزات مستقلة
│   ├── personas/          # نظام الشخصيات
│   └── image-processing/  # معالجة الصور
├── contexts/              # React Contexts
│   └── SubscriptionContext.tsx
└── components/            # مكونات UI المشتركة
```

## 🤖 نظام AI Provider الذكي

### اختيار المزود التلقائي (`ai-selector.ts`)
النظام يحلل محتوى الرسالة ويختار المزود الأمثل بناءً على:

```typescript
// تصنيفات ذكية مع confidence scores
intelligentCategories = {
  simpleChat: { provider: 'openai', confidence: 0.9 },
  simpleCoding: { provider: 'claude', confidence: 0.95 },
  deepCoding: { provider: 'claude', confidence: 0.9 },
  medical: { provider: 'claude', requiresBoth: true },
  religious: { provider: 'religious_search', confidence: 0.98 },
  mathematics: { provider: 'claude', confidence: 0.9 },
  translation: { provider: 'openai', confidence: 0.9 },
  creativeWriting: { provider: 'openai', confidence: 0.95 }
}
```

### تكوين المزودين
**OpenAI (عقول)** - المحادثات العامة، الترجمة، الكتابة الإبداعية
- نموذج: `gpt-4o-mini`
- الأولوية للأسئلة البسيطة والودية
- لون: أخضر `from-green-100 to-green-200`

**Claude (MuayadAi)** - البرمجة، الرياضيات، التحليل المعقد
- نموذج: `claude-3-haiku`
- مفضل للمحتوى التقني والطبي
- لون: بنفسجي `from-purple-100 to-purple-200`

**DeepSeek (عقول)** - احتياطي نهائي فقط
- نموذج: `deepseek-chat`
- يُستخدم عند فشل جميع المزودين
- لون: برتقالي `from-orange-100 to-orange-200`

**Religious Search** - نظام متخصص للأسئلة الدينية
- بحث في قواعد بيانات إسلامية متخصصة
- أولوية قصوى عند اكتشاف كلمات مفتاحية دينية
- لون: سماوي `from-cyan-100 to-cyan-200`

### سلسلة Fallback
```typescript
// عند فشل مزود، النظام يحاول البديل تلقائياً
OpenAI → Claude → DeepSeek
Claude → DeepSeek → OpenAI
DeepSeek → OpenAI → Claude
```

### تتبع الأداء
```typescript
// إحصائيات لكل مزود مع localStorage persistence
providerStats = {
  success: number,    // عدد الطلبات الناجحة
  total: number,      // إجمالي الطلبات
  avgTime: number,    // متوسط وقت الاستجابة بالـ ms
  lastUsed: number    // timestamp آخر استخدام
}
```

### نمط التنفيذ
```typescript
// دائماً استخدم sendToAIIntelligent للاختيار التلقائي
const result = await sendToAIIntelligent(messages, userMessage);

// النظام يتضمن:
// 1. تحليل محتوى الرسالة
// 2. اختيار المزود الأمثل
// 3. محاولة مع fallback تلقائي
// 4. تسجيل إحصائيات الأداء
```

## 🔍 نظام البحث المتقدم

### بنية محرك البحث (`src/lib/search/`)
**نمط Provider-based** مع واجهة موحدة `BaseSearchProvider`:

```typescript
// تسجيل المزودين في SearchEngine
ProviderFactory.register(googleSearchProvider);
ProviderFactory.register(youtubeSearchProvider);
ProviderFactory.register(wikipediaSearchProvider);

// كل مزود يطبق:
interface BaseSearchProvider {
  search(query: string, options?: SearchOptions): Promise<SearchResult[]>;
  isAvailable(): Promise<boolean>;
  getSource(): SearchSource;
  getPriority(): number;
}
```

### تدفق البحث الذكي
1. **تحليل الاستعلام** - `QueryAnalyzer.analyze()` يحدد النية والفئة
2. **اختيار المصادر** - يقترح 3-5 مصادر بناءً على التحليل
3. **تنفيذ متوازي/تسلسلي** - حسب الاستراتيجية المحددة
4. **ترتيب النتائج** - `ResultRanker.rank()` مع عوامل ذكاء
5. **إزالة التكرار** - `deduplicateResults()` للنتائج المتشابهة
6. **تخزين مؤقت** - `globalCacheManager` للأداء العالي

### أوضاع البحث
```typescript
// من src/app/chat/search.ts
getSearchMode('fast')  → { maxResults: 3, sources: ['youtube'] }
getSearchMode('deep')  → { maxResults: 50, sources: ['all'] }
```

**Fast Mode** - بحث سريع:
- YouTube فقط (للمحتوى المرئي)
- 2-3 نتائج
- مقدمة AI مختصرة (60-80 كلمة)

**Deep Mode** - بحث متقدم:
- جميع المصادر (YouTube + Google + Wikipedia + StackOverflow)
- 21-27 نتيجة منظمة
- ترتيب بالتناوب: 3 يوتيوب، 2 جوجل، 2 ويكي، 2 ستاك
- شرح AI تفصيلي

### تصنيف الأسئلة (`src/lib/search-classifier.ts`)
```typescript
enum QuestionType {
  RELIGIOUS,         // أسئلة دينية - أولوية قصوى
  GENERAL_INFO,      // معلومات عامة - بحث محسّن
  TECH_CODE,         // برمجة وتقنية
  CASUAL_CHAT        // محادثة عادية
}

// التصنيف يحدد مسار المعالجة في /api/chat/route.ts
```

### فلترة المحتوى (`src/lib/content-filter.ts`)
```typescript
// حماية تلقائية من المحتوى غير المناسب
filterContent(text) → { isAllowed, severity: 'blocked' | 'warning' }
filterSearchResults(results) → cleanedResults

// يحظر: محتوى إباحي، عنف، كراهية
// ينبه: محتوى مشبوه يحتاج مراجعة
```

### التكامل في الـ API
```typescript
// في /api/chat/route.ts
if (classification.type === QuestionType.RELIGIOUS) {
  // مسار ديني خاص مع فيديوهات YouTube
  const results = await searchWeb(query, { 
    sources: ['youtube', 'google'] 
  });
  return formatReligiousResults(results);
}

if (classification.type === QuestionType.GENERAL_INFO) {
  // بحث محسّن مع اختيار ذكي للمصادر
  const smartSources = detectBestSources(query);
  const results = await searchWeb(query, { sources: smartSources });
  return formatSearchResults(results);
}
```

### نتائج البحث في الواجهة
```typescript
// في chat/page.tsx - النتائج تُعرض inline
interface Message {
  searchResults?: SearchCardProps[];  // نتائج البحث
  searchQuery?: string;               // الاستعلام الأصلي
  searchMeta?: {
    totalResults: number;
    searchTime: number;
    sources: string[];
    cached: boolean;
  };
}
```

## � نظام الاشتراكات المتقدم

### الباقات الثلاث (`src/lib/subscription/plans.ts`)
```typescript
Free Plan:
  - 10 رسائل يومياً
  - 3 صور
  - 5 دقائق صوت
  - نموذج AI مجاني فقط

Premium ($9.99/شهر):
  - 100 رسالة يومياً  
  - رفع صور غير محدود
  - 60 دقيقة صوت
  - Gemini Pro + النماذج المجانية

Enterprise ($29.99/شهر):
  - رسائل غير محدودة
  - جميع الميزات
  - Claude 3 Opus + Gemini Pro
  - دعم مخصص 24/7
```

### آلية التحقق والحدود
```typescript
// في /api/chat/route.ts قبل كل طلب
const subscriptionCheck = await checkSubscriptionPermissions(userId, message);

if (!subscriptionCheck.allowed) {
  return NextResponse.json({
    errorType: 'subscription_limit',
    upgradeRequired: true,
    currentPlan: 'free',
    suggestedPlan: 'premium'
  }, { status: 402 }); // 402 Payment Required
}

// تحديث الاستخدام بعد النجاح
await updateUserUsage(userId, subscription);
```

### Context للاشتراكات (`SubscriptionContext.tsx`)
```typescript
// استخدام في المكونات
const { state, actions } = useSubscription();

// فحص الصلاحية قبل الإرسال
const permission = await actions.checkPermission('message', 'gpt-4');
if (!permission.allowed) {
  showUpgradeModal(permission.reason);
}

// تحديث تلقائي للإحصائيات
await actions.updateUsage('message', 1);
```

### إعادة التعيين اليومية
```typescript
// تلقائياً كل يوم عند منتصف الليل
subscription.usage.lastResetDate !== today → fetchSubscriptionData()

// أو يدوياً من الـ API
POST /api/subscription/check { action: 'reset_daily' }
```



## 🔧 Development Workflows

### Environment Setup
Required `.env.local` variables (see `ENV_EXAMPLE.md`):
```bash
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DEEPSEEK_API_KEY=sk-...
GOOGLE_SEARCH_API_KEY=AIza...
GOOGLE_SEARCH_ENGINE_ID=...
YOUTUBE_API_KEY=AIza...    # نفس Google API Key
```

### Development Commands
```bash
npm run dev     # Start development server with hot reload
npm run build   # Production build
npm run lint    # ESLint check
```

### Task Runner
Available VS Code task: `next-dev` (background Next.js server)

### معالج API الرئيسي (`/api/chat/route.ts`)
```typescript
// تدفق معالجة الطلبات:
1. فحص المحتوى (content-filter) → حظر المحتوى غير المناسب
2. فحص الاشتراك (subscription check) → 402 إذا تجاوز الحد
3. تصنيف السؤال (question classification) → RELIGIOUS | GENERAL_INFO | TECH_CODE
4. المسار المناسب:
   - RELIGIOUS → searchWeb + YouTube results + AI intro
   - GENERAL_INFO → Smart search (fast/deep mode)
   - TECH_CODE → Direct AI with Claude preference
   - CASUAL_CHAT → OpenAI direct
5. تحديث إحصائيات الاستخدام
6. إرجاع الرد مع metadata
```

### مثال طلب API
```typescript
POST /api/chat
{
  "messages": [
    { "role": "user", "content": "ما حكم الصلاة؟" }
  ],
  "provider": "auto",  // أو openai, claude, deepseek
  "searchMode": "fast" // أو deep
}

// Response with search results
{
  "success": true,
  "message": "مقدمة AI عن الموضوع...",
  "sources": [
    { 
      "title": "...", 
      "url": "...", 
      "snippet": "...",
      "thumbnail": "...",
      "source": "YouTube"
    }
  ],
  "classificationInfo": {
    "type": "RELIGIOUS",
    "confidence": 0.98
  },
  "subscriptionInfo": {
    "planId": "free",
    "remainingMessages": 7
  }
}
```


## 📱 UI/UX Patterns

### RTL-First Design
- All layouts use `dir="rtl"` and Arabic fonts
- Tailwind configured for RTL with custom animations
- Icon positioning and UI flows designed for Arabic UX

### Chat Interface (`src/app/chat/page.tsx`)
- **State-driven UI**: Toggles between landing and chat modes
- **Real-time features**: Voice search, file uploads, camera capture
- **Search integration**: Inline search results with source cards
- **Provider branding**: Dynamic AI provider labels and colors from `config.ts`

### Message Structure
```typescript
interface Message {
  id: string;
  type: 'user' | 'ai';
  content: string;
  time: string;
  searchResults?: SearchCardProps[];  // نتائج البحث المضمنة
  searchQuery?: string;
  searchMeta?: {
    totalResults: number;
    searchTime: number;
    sources: string[];
    cached: boolean;
  };
}
```

### Component Architecture
- **Compound components** for complex features (SearchResults, SearchCard)
- **Shared utilities** in `ui-components.tsx`
- **Consistent theming** via `AI_PROVIDERS` object in `config.ts`:

```typescript
AI_PROVIDERS = {
  openai: { name: 'عقول', color: 'from-green-100 to-green-200' },
  claude: { name: 'MuayadAi', color: 'from-purple-100 to-purple-200' },
  deepseek: { name: 'عقول', color: 'from-orange-100 to-orange-200' }
}
```

### Sidebar Navigation
```typescript
// في chat/page.tsx - عناصر التنقل الجانبية
navigateToPersonas()        → /personas
navigateToPricing()         → /pricing  
navigateToImageProcessing() → /image-processing
navigateToRestorePhoto()    → /restore-photo
openCodeEditor()            → /code-editor
navigateToDashboard()       → /dashboard
```

## 🔐 Security & Performance

### API Route Protection
All API routes in `src/app/api/` handle:
- Provider key validation and rotation
- Request rate limiting and error handling
- Response caching where appropriate

### Performance Optimizations
- **Provider statistics tracking** for intelligent routing
- **Search result caching** to minimize API calls
- **Lazy loading** for heavy components (Monaco editor, image processing)

## 🚨 Critical Conventions

### Error Handling Pattern
```typescript
try {
  const result = await provider.process(request);
  recordProviderStats(provider, responseTime, true);
  return { success: true, data: result };
} catch (error) {
  recordProviderStats(provider, responseTime, false);
  // Try next provider or return fallback
}
```

### Arabic Content
- **Always preserve Arabic text** direction and formatting
- **Use Arabic-first naming** in UI labels and messages
- **Support Arabic search queries** with proper encoding
- **System prompts** تُحمّل من ملفات نصية منفصلة في `src/app/api/chat/`

### Message Flow
```typescript
// Standard message interface across all features
interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  provider?: string;         // Track which AI responded
  sources?: SearchResult[];  // Attach search context
  needsUserChoice?: boolean; // إذا كان السؤال يحتاج توضيح
  videos?: VideoResult[];    // فيديوهات YouTube
}
```

### Content Filtering
```typescript
// دائماً افحص المحتوى قبل المعالجة
const contentCheck = filterContent(userInput);
if (!contentCheck.isAllowed) {
  return getBlockedMessage();
}

// فلتر نتائج البحث أيضاً
const cleanResults = filterSearchResults(searchResults);
```

### Performance Best Practices
- **استخدم التخزين المؤقت** - `globalCacheManager.set(key, data, { tags: [] })`
- **سجل الإحصائيات** - `recordProviderStats(provider, time, success)`
- **فحص Rate Limits** - `globalRateLimiter.consume(source)`
- **تتبع الاستخدام** - `globalUsageTracker.incrementUsage(source)`

## 📦 Adding New Features

### Search Providers
1. Extend `BaseSearchProvider` in `src/lib/search/providers/`
2. Register in `SearchEngine.initialize()`
3. Add source type to `SearchSource` union in types

### AI Providers  
1. Add configuration to `AI_PROVIDERS` in `config.ts`
2. Implement routing logic in `ai-selector.ts`
3. Add API route handler in `src/app/api/`

### UI Features
1. Create feature directory in `src/features/`
2. Add route in `src/app/` if needed
3. Register navigation in sidebar (chat page)

## 🎯 Common Patterns

### Smart Source Detection
```typescript
// في src/app/chat/search.ts
const smartSources = detectBestSources(query);
// يحلل السؤال ويختار: primary source + secondary sources
// مثال: سؤال ديني → YouTube primary, Google + Wikipedia secondary
```

### Deep Search Implementation
```typescript
// عند searchMode === 'deep'
// - جمع 21-27 نتيجة من مصادر متعددة
// - ترتيب بالتناوب: 3 YT + 2 Google + 2 Wiki + 2 Stack
// - عرض 8 نتائج أولاً، ثم زر "عرض المزيد"
```

### AI Response Formatting
```typescript
// مقدمات AI دائماً:
// - Fast Mode: 60-80 كلمة
// - Deep Mode: 100-150 كلمة
// - بدون emojis في البداية
// - محادثة طبيعية، لا تذكر "نتائج البحث"
```

## ⚠️ Known Issues & Workarounds

### Search API Fallbacks
- إذا فشل Google Search، النظام يحاول YouTube فقط
- إذا فشلت جميع APIs، يستخدم AI direct response
- يسجل الفشل في `globalUsageTracker`

### Subscription Limitations
- حالياً يستخدم بيانات demo
- التكامل الكامل مع Stripe قيد التطوير
- الحدود اليومية تُعاد تلقائياً عند منتصف الليل

### Provider API Issues
- DeepSeek يُستخدم فقط كاحتياطي نهائي
- Claude مفضل للمحتوى التقني المعقد
- OpenAI هو الافتراضي للمحادثات العامة

## 🔍 Debugging Tips

### Check AI Provider Selection
```typescript
// في Console
console.log('🧠 AI Selector initialized');
console.log('🤖 Trying provider: openai (attempt 1/3)');
console.log('✅ Success with openai in 1234ms');
```

### Search Flow Debugging
```typescript
console.log('🔍 ========== NEW SEARCH ==========');
console.log('Query: "..."');
console.log('Intent: question, Category: general');
console.log('Suggested Sources: youtube, google, wikipedia');
```

### Subscription Checks
```typescript
console.log('🔒 فحص صلاحيات الاشتراك...');
console.log('✅ صلاحيات الاشتراك مؤكدة');
console.log('📊 تحديث إحصائيات الاستخدام...');
```

Remember: This codebase prioritizes Arabic user experience, intelligent AI routing, and comprehensive search capabilities. Always maintain these core principles when extending functionality.
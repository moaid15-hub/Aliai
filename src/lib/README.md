# 📚 مكتبة البحث الذكي - Smart Search Library

## 🎯 نظرة عامة

مكتبة شاملة ومتطورة للبحث الذكي مع دعم متعدد المصادر والتصنيف التلقائي للأسئلة. تدعم البحث الديني المتخصص والبحث التقني والبحث العام مع ميزات متقدمة.

## 📁 هيكل المكتبة

```
src/lib/
├── index.ts              # نقطة الدخول الرئيسية
├── web-search.ts         # نظام البحث الأساسي
├── search-classifier.ts  # تصنيف الأسئلة الذكي  
├── enhanced-search.ts    # البحث المتقدم متعدد المصادر
├── types.ts             # تعريفات الأنواع
└── README.md            # هذا الملف
```

## 🚀 المزايا الرئيسية

### 1. 🕌 البحث الديني المتخصص
- كشف تلقائي للأسئلة الدينية
- مصادر موثوقة ومتخصصة
- تنسيق محترف للنتائج الدينية
- دعم الكلمات المفتاحية الإسلامية

### 2. 💻 البحث التقني والبرمجي
- كشف الأسئلة البرمجية والتقنية
- نتائج من مصادر تقنية موثوقة
- دعم أكواد البرمجة والحلول التقنية

### 3. 🔍 البحث العام الذكي
- نتائج شاملة من Google Search
- تصفية وترتيب ذكي للنتائج
- دعم البحث في YouTube
- نظام تخزين مؤقت متقدم

### 4. 🎯 تصنيف الأسئلة التلقائي
- كشف نوع السؤال تلقائياً
- مستوى ثقة للتصنيف
- توجيه ذكي لمصادر البحث المناسبة

## 📖 كيفية الاستخدام

### استيراد المكتبة

```typescript
import { 
  searchWeb, 
  classifyQuestion, 
  enhancedSearch,
  QuestionType 
} from '../lib';
```

### 1. البحث الأساسي

```typescript
const results = await searchWeb("ما هي فوائد الصلاة؟", {
  maxResults: 5,
  smartSearch: true
});
```

### 2. تصنيف الأسئلة

```typescript
const classification = classifyQuestion("كيف أتعلم React؟");
console.log(classification.type); // QuestionType.TECH_CODE
console.log(classification.confidence); // 0.95
```

### 3. البحث المتقدم

```typescript
const advanced = await enhancedSearch("شرح الذكاء الاصطناعي", {
  maxResults: 10,
  sources: ['google', 'youtube'],
  smartFilter: true
});
```

## 🛠️ إعدادات البحث

### خيارات البحث الأساسي

```typescript
interface SearchOptions {
  maxResults?: number;        // عدد النتائج (افتراضي: 10)
  smartSearch?: boolean;      // البحث الذكي (افتراضي: true)
  fastMode?: boolean;         // الوضع السريع
  language?: 'ar' | 'en' | 'auto'; // اللغة
}
```

### خيارات البحث المتقدم

```typescript
interface EnhancedSearchOptions {
  maxResults?: number;
  category?: 'religious' | 'technical' | 'general';
  smartFilter?: boolean;
  language?: string;
  sources?: ('google' | 'youtube')[];
}
```

## 🎨 أنواع النتائج

### 1. نتائج البحث الديني
- عنوان واضح ومفصل
- مصادر موثوقة
- تنسيق مناسب للمحتوى الديني
- روابط للمراجع الأصلية

### 2. نتائج البحث التقني
- أكواد وحلول برمجية
- شروحات تقنية مفصلة
- مصادر من GitHub وStack Overflow
- أمثلة عملية

### 3. نتائج البحث العام
- معلومات شاملة ومتنوعة
- صور ومقاطع فيديو
- روابط موثوقة
- ملخصات مفيدة

## 🔧 ميزات متقدمة

### 1. نظام التخزين المؤقت
- تخزين النتائج لتسريع الاستعلامات المتكررة
- مدة صالحية قابلة للتخصيص
- توفير في استهلاك API

### 2. نظام الإحصائيات
- تتبع أداء البحث
- معدلات نجاح التصنيف
- أوقات الاستجابة

### 3. الفلترة الذكية
- إزالة النتائج المكررة
- ترتيب حسب الصلة والجودة
- تحسين جودة المحتوى

## 🌟 أمثلة عملية

### مثال: البحث الديني

```typescript
const religiousQuery = "ما هي أركان الإسلام؟";
const classification = classifyQuestion(religiousQuery);

if (classification.type === QuestionType.RELIGIOUS) {
  const results = await searchWeb(religiousQuery);
  const formatted = formatReligiousResults(results);
  console.log(formatted);
}
```

### مثال: البحث التقني

```typescript
const techQuery = "كيفية إنشاء API بـ Node.js";
const results = await enhancedSearch(techQuery, {
  category: 'technical',
  sources: ['google']
});
```

### مثال: البحث المتقدم

```typescript
const advancedQuery = "تطبيقات الذكاء الاصطناعي في الطب";
const results = await enhancedSearch(advancedQuery, {
  maxResults: 15,
  smartFilter: true,
  sources: ['google', 'youtube']
});
```

## 🔗 التكامل مع النظام

### في صفحة Chat

```typescript
import { searchWeb, classifyQuestion } from '../../lib';

const handleSearch = async (query: string) => {
  const classification = classifyQuestion(query);
  const results = await searchWeb(query);
  return { classification, results };
};
```

### في API Route

```typescript
import { searchWeb, formatReligiousResults } from '../../../lib';

export async function POST(request: NextRequest) {
  const { query } = await request.json();
  const results = await searchWeb(query);
  return NextResponse.json(results);
}
```

## 📊 مؤشرات الأداء

- **سرعة البحث**: أقل من ثانيتين للنتائج الأساسية
- **دقة التصنيف**: أكثر من 90% للأسئلة الواضحة  
- **معدل نجاح البحث**: أكثر من 95%
- **دعم اللغات**: العربية والإنجليزية

## 🛡️ أفضل الممارسات

1. **استخدم التصنيف أولاً** لتحديد نوع البحث المناسب
2. **فعّل التخزين المؤقت** لتحسين الأداء
3. **حدد عدد النتائج المناسب** حسب الحاجة
4. **استخدم البحث المتقدم** للاستعلامات المعقدة
5. **راقب مؤشرات الأداء** بانتظام

## 🔮 التطويرات المستقبلية

- [ ] دعم مصادر بحث إضافية
- [ ] تحسين خوارزمية التصنيف
- [ ] واجهة مرئية للبحث المتقدم
- [ ] دعم البحث الصوتي
- [ ] تحليل المشاعر للنتائج
- [ ] ترجمة تلقائية للنتائج

---

**الإصدار**: 3.0.0  
**آخر تحديث**: أكتوبر 2024  
**المطور**: فريق عقول AI
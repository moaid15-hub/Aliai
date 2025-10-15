# 📚 دليل نظام البحث - Search System Guide

## 🎯 التنظيم الجديد (المُحَسَّن)

تم إعادة تنظيم نظام البحث ليكون **أكثر وضوحاً وسهولة**:

---

## 🌐 البحث العام (الإنترنت)

### 📁 الملف الرئيسي:
```
/src/app/chat/web-search.ts
```

**يحتوي على كل شيء:**
- ✅ `needsWebSearch()` - كشف الحاجة للبحث
- ✅ `searchWeb()` - البحث الرئيسي
- ✅ `searchWithTavily()` - Tavily API
- ✅ `searchWithSerper()` - Serper/Google API  
- ✅ `generateFallbackResults()` - نتائج احتياطية
- ✅ `formatSearchResults()` - تنسيق العرض

### 🔑 API Keys المطلوبة:
```env
TAVILY_API_KEY=your_tavily_key_here
SERPER_API_KEY=your_serper_key_here
```

### 📝 مثال الاستخدام:
```typescript
import { needsWebSearch, searchWeb, formatSearchResults } from './web-search';

// 1. التحقق من الحاجة للبحث
if (needsWebSearch(userQuery)) {
  // 2. البحث
  const results = await searchWeb(userQuery, { maxResults: 5 });
  
  // 3. تنسيق النتائج
  const formatted = formatSearchResults(results);
  console.log(formatted);
}
```

---

## 🕌 البحث الديني (منفصل تماماً)

### 📁 الملفات:
```
/src/app/chat/religious_search_component.ts  ← المنطق الكامل
/src/app/api/religious-search/route.ts      ← API Endpoint
/src/app/api/chat/religious_search_prompt.txt ← System Prompt
```

**يحتوي على:**
- ✅ `isReligiousQuestion()` - كشف الأسئلة الدينية
- ✅ `searchShiiteWebsites()` - البحث في المواقع الشيعية
- ✅ `searchSunniWebsites()` - البحث في المواقع السنية
- ✅ `religiousSearch()` - البحث الديني الرئيسي
- ✅ `formatReligiousResponse()` - تنسيق الردود
- ✅ `handleUserMessage()` - المعالج الرئيسي

### 🔑 API Keys المستقبلية:
```env
GOOGLE_SEARCH_API_KEY=your_google_key_here
GOOGLE_SEARCH_ENGINE_ID=your_cx_here
```

### 📝 مثال الاستخدام:
```typescript
import { isReligiousQuestion, handleUserMessage } from './religious_search_component';

// 1. التحقق من السؤال الديني
if (isReligiousQuestion(userQuery)) {
  // 2. المعالجة الكاملة
  const response = await handleUserMessage(userQuery);
  console.log(response);
}
```

---

## 🔄 التكامل في Chat API

### 📁 `/src/app/api/chat/route.ts`

```typescript
import { isReligiousQuestion, handleUserMessage } from '../../chat/religious_search_component';
import { needsWebSearch, searchWeb } from '../../chat/web-search';

// في دالة POST:
const userInput = lastMessage?.content || '';

// 1️⃣ أولوية للأسئلة الدينية
if (isReligiousQuestion(userInput)) {
  const religiousResponse = await handleUserMessage(userInput);
  return NextResponse.json({ message: religiousResponse });
}

// 2️⃣ البحث العام
if (needsWebSearch(userInput)) {
  const searchResults = await searchWeb(userInput);
  const formatted = formatSearchResults(searchResults);
  return NextResponse.json({ message: formatted });
}

// 3️⃣ رد عادي من AI
// ... كود AI العادي
```

---

## 📊 مقارنة التنظيم القديم vs الجديد

### ❌ التنظيم القديم (مُعَقَّد):
```
/chat/search.ts           → كشف فقط
/api/search/route.ts      → تنفيذ 525 سطر!
/chat/ai-selector.ts      → تداخل
```

### ✅ التنظيم الجديد (واضح):
```
/chat/web-search.ts                    → كل البحث العام
/chat/religious_search_component.ts    → كل البحث الديني
/api/chat/route.ts                     → التكامل فقط
```

---

## 🎯 الفوائد:

1. **✅ وضوح تام** - كل نوع بحث في ملف منفصل
2. **✅ سهولة الصيانة** - تعديل ملف واحد فقط
3. **✅ لا تداخل** - البحث العام لا يتدخل بالديني
4. **✅ قابل للتوسع** - سهل إضافة مزودات بحث جديدة
5. **✅ اختبار أسهل** - كل وحدة مستقلة

---

## 🚀 الخطوات التالية:

### للبحث العام:
1. ✅ أضف `TAVILY_API_KEY` في `.env.local`
2. ✅ أو أضف `SERPER_API_KEY`
3. ✅ استخدم `web-search.ts` في أي مكان

### للبحث الديني:
1. ✅ أضف `GOOGLE_SEARCH_API_KEY`
2. ✅ أضف `GOOGLE_SEARCH_ENGINE_ID`
3. ✅ حدّث دوال البحث في `religious_search_component.ts`

---

## 📞 الدعم:

إذا واجهت أي مشكلة:
1. تحقق من API Keys في `.env.local`
2. راجع console logs
3. اختبر كل دالة على حدة

---

**تم التحديث:** 15 أكتوبر 2025
**الحالة:** ✅ جاهز للاستخدام

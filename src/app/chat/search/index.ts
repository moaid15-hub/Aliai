// search/index.ts
// ============================================
// 🔍 نظام البحث الذكي
// ============================================

// كلمات البحث التلقائي المحسنة
const SEARCH_KEYWORDS = [
  // البحث المباشر
  'ابحث عن', 'دور على', 'ابحث لي عن', 'find me', 'search for',
  'معلومات عن', 'أريد معرفة', 'أخبرني عن', 'وضح لي',
  
  // الأخبار والأحداث الحالية
  'آخر أخبار', 'أحدث', 'جديد في', 'ما الجديد', 'latest news',
  'أخبار اليوم', 'حديث عن', 'معلومات حديثة عن', 'الأخبار',
  'ما يحدث', 'الوضع الحالي', 'حالياً', 'الآن', 'اليوم',
  'current situation', 'right now', 'today', "what's happening",
  
  // المقارنات والتقييمات
  'قارن بين', 'مقارنة', 'الفرق بين', 'أيهما أفضل',
  'ما أفضل', 'أفضل طريقة', 'compare between', 'which is better',
  
  // الأسعار والتكاليف
  'سعر', 'كم سعر', 'كم يكلف', 'تكلفة', 'price of', 'cost of',
  'كم ثمن', 'بكام', 'كم يبلغ سعر',
  
  // التواريخ والمواعيد
  'متى', 'تاريخ', 'موعد', 'when will', 'when is', 'when did',
  'في أي وقت', 'كم الساعة', 'ما التاريخ',
  
  // الإحصائيات والبيانات
  'إحصائيات', 'أرقام', 'بيانات', 'statistics', 'data about',
  'النسبة', 'المعدل', 'الكمية', 'العدد',
  
  // موضوعات تحتاج بحث حديث
  'الطقس', 'درجة الحرارة', 'weather', 'temperature',
  'الأسهم', 'البورصة', 'stock price', 'market',
  'كورونا', 'كوفيد', 'covid', 'coronavirus',
  'الانتخابات', 'السياسة', 'الحكومة', 'politics',
  'الرياضة', 'كرة القدم', 'المباراة', 'sports', 'football'
];

// هل السؤال يحتاج بحث؟ - نسخة محسنة
export const needsSearch = (query: string): boolean => {
  const lowerQuery = query.toLowerCase().trim();
  
  // استبعاد التحيات والمحادثات العامة
  const excludePatterns = [
    'مرحبا', 'مرحباً', 'أهلا', 'أهلاً', 'سلام', 'السلام عليكم', 'وعليكم السلام',
    'صباح الخير', 'مساء الخير', 'تصبح على خير', 'شكرا', 'شكراً', 'عفوا', 'عفواً',
    'hello', 'hi', 'hey', 'thanks', 'thank you', 'bye', 'goodbye',
    'كيف حالك', 'كيفك', 'شلونك', 'how are you', 'ما اسمك', 'what is your name',
    'كيف يمكنني', 'ماذا تستطيع', 'ما قدراتك', 'what can you do'
  ];
  
  // إذا كان النص قصير جداً أو يحتوي على تحيات
  if (lowerQuery.length < 8 || excludePatterns.some(pattern => lowerQuery.includes(pattern))) {
    return false;
  }
  
  // البحث عن كلمات مفتاحية للبحث
  const hasSearchKeywords = SEARCH_KEYWORDS.some(keyword => {
    const keywordLower = keyword.toLowerCase();
    return lowerQuery.includes(keywordLower) || 
           lowerQuery.startsWith(keywordLower) ||
           (keyword.includes(' ') && lowerQuery.includes(keyword.split(' ')[0]));
  });
  
  // أنماط إضافية تدل على الحاجة للبحث
  const searchPatterns = [
    /\b(في|من|حول|عن|about|of|in)\s+\w{4,}/g, // "عن الذكاء الاصطناعي"
    /\b(كيف|how)\s+(يمكن|أستطيع|can|to)\s+\w+/g, // "كيف يمكن أن أفعل"
    /\b(ما هو|what is|what are)\s+\w{3,}/g, // "ما هو البرمجة"
    /\b(أين|where)\s+(يقع|توجد|is|are)\s+\w+/g, // "أين يقع المكان"
    /\b(لماذا|why)\s+(يحدث|تحدث|does|is)\s+\w+/g, // "لماذا يحدث هذا"
    /\d{4}|\b(عام|سنة|year)\b/g, // تواريخ وسنوات
    /\b(شركة|company|مؤسسة|منظمة|organization)\s+\w+/g // أسماء الشركات
  ];
  
  const hasSearchPatterns = searchPatterns.some(pattern => pattern.test(lowerQuery));
  
  // إذا كان النص طويل نسبياً ولا يحتوي على تحيات، فغالباً يحتاج بحث
  const isLongQuery = lowerQuery.length > 15;
  
  // القرار النهائي
  const needsWebSearch = hasSearchKeywords || hasSearchPatterns || 
    (isLongQuery && !excludePatterns.some(pattern => lowerQuery.includes(pattern)));
  
  console.log('🤔 Search analysis:', {
    query: lowerQuery.substring(0, 50),
    hasKeywords: hasSearchKeywords,
    hasPatterns: hasSearchPatterns,
    isLong: isLongQuery,
    needsSearch: needsWebSearch
  });
  
  return needsWebSearch;
};

// البحث السريع المحسن
export const searchWeb = async (
  query: string, 
  options: {
    maxResults?: number;
    useAI?: boolean;
    retries?: number;
  } = {}
): Promise<any> => {
  const { maxResults = 3, useAI = false, retries = 1 } = options;

  try {
    console.log('🔍 Fast Search:', query);
    
    // طلب مبسط وسريع
    const response = await fetch('/api/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query, max_results: maxResults }),
      signal: AbortSignal.timeout(3000) // timeout بعد 3 ثواني
    });
    
    if (!response.ok) {
      throw new Error(`Search failed: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('✅ Fast Search Result:', result.totalResults || 0, 'results');
    
    return result;
  } catch (error) {
    console.error('Search error:', error);
    
    // إعادة محاولة واحدة فقط لتوفير الوقت
    if (retries > 0) {
      console.log('🔄 Quick retry...');
      return searchWeb(query, { ...options, retries: 0 });
    }
    
    // نتائج افتراضية سريعة
    return { 
      results: [
        {
          title: `بحث عن: ${query}`,
          url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
          snippet: `نتائج البحث حول ${query}`,
          content: `معلومات متعلقة بـ ${query}`
        }
      ], 
      totalResults: 1,
      searchTime: 0,
      source: 'بحث سريع'
    };
  }
};

// دالة البحث المبسطة للتوافق مع النسخة القديمة
export const simpleSearchWeb = async (query: string, retries = 2): Promise<any> => {
  return searchWeb(query, { useAI: false, retries });
};

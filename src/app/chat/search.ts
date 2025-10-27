// search.ts
// ============================================
// 🔍 نظام البحث الذكي المحسّن
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
  'current situation', 'right now', 'today', 'what\'s happening',

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

// كلمات مفتاحية للفيديوهات (YouTube)
const VIDEO_KEYWORDS = [
  'فيديو', 'شرح', 'كيف', 'طريقة', 'تعليم', 'درس', 'محاضرة',
  'video', 'how to', 'tutorial', 'learn', 'watch', 'lesson',
  'شوف', 'أرني', 'show me', 'watch'
];

// كلمات مفتاحية للموسوعة (Wikipedia)
const WIKI_KEYWORDS = [
  'من هو', 'ما هي', 'ما هو', 'تعريف', 'معنى', 'مفهوم',
  'who is', 'what is', 'what are', 'define', 'meaning', 'concept',
  'تاريخ', 'نبذة عن', 'history of', 'about'
];

// كلمات مفتاحية للبرمجة (Stack Overflow)
const CODE_KEYWORDS = [
  'كود', 'برمجة', 'خطأ', 'error', 'code', 'function', 'bug',
  'javascript', 'python', 'react', 'typescript', 'html', 'css',
  'api', 'database', 'sql', 'git'
];

// ============================================
// 🧠 تحليل ذكي للسؤال
// ============================================

export const needsSearch = (query: string): boolean => {
  const lowerQuery = query.toLowerCase().trim();

  // استبعاد التحيات والمحادثات العامة فقط
  const excludePatterns = [
    'مرحبا', 'مرحباً', 'أهلا', 'أهلاً', 'سلام', 'السلام عليكم',
    'صباح الخير', 'مساء الخير', 'شكرا', 'شكراً',
    'hello', 'hi', 'hey', 'thanks', 'bye',
    'كيف حالك', 'شلونك', 'how are you'
  ];

  // إذا كان تحية أو نص قصير جداً (أقل من 5 أحرف)
  if (lowerQuery.length < 5 || excludePatterns.some(pattern => lowerQuery.includes(pattern))) {
    return false;
  }

  // 🎯 الآن: كل شيء يحتاج بحث! (إلا التحيات)
  // النظام الجديد البسيط: أي سؤال = مقدمة AI + فيديوهات
  console.log('🎯 كل شيء يبحث!', {
    query: lowerQuery.substring(0, 50),
    needsSearch: true
  });

  return true;
};

// ============================================
// 🎯 تصنيف ذكي للمصادر
// ============================================

export type SearchSource = 'youtube' | 'wikipedia' | 'stackoverflow' | 'google';

export interface SmartSourceSelection {
  primary: SearchSource;
  secondary: SearchSource[];
  reason: string;
}

export const detectBestSources = (query: string): SmartSourceSelection => {
  // 📹 نظام بسيط وذكي: YouTube فقط!
  // إذا احتاج بحث → YouTube
  // إذا ما احتاج بحث → AI يجيب

  return {
    primary: 'youtube',
    secondary: ['google'], // احتياطي فقط
    reason: 'بحث YouTube ذكي'
  };
};

// ============================================
// 🚀 أوضاع البحث المتعددة
// ============================================

export interface SearchMode {
  mode: 'quick' | 'fast' | 'normal' | 'deep';
  maxResults: number;
  timeout: number;
  sources: SearchSource[];
  retries: number;
}

export const getSearchMode = (mode: 'quick' | 'fast' | 'normal' | 'deep' = 'normal'): SearchMode => {
  const modes: Record<string, SearchMode> = {
    quick: {
      mode: 'quick',
      maxResults: 2,
      timeout: 2000,
      sources: ['youtube', 'google'],
      retries: 0
    },
    fast: {
      mode: 'fast',
      maxResults: 3, // 🎬 تحديد الفيديوهات
      timeout: 3000,
      sources: ['youtube', 'google'],
      retries: 1
    },
    normal: {
      mode: 'normal',
      maxResults: 3, // 🎬 تحديد الفيديوهات
      timeout: 5000,
      sources: ['youtube', 'google'],
      retries: 2
    },
    deep: {
      mode: 'deep',
      maxResults: 3, // 🎬 تحديد الفيديوهات
      timeout: 10000,
      sources: ['youtube', 'google', 'wikipedia', 'stackoverflow'],
      retries: 3
    }
  };

  return modes[mode];
};

// ============================================
// 📊 Exports
// ============================================

export {
  SEARCH_KEYWORDS,
  VIDEO_KEYWORDS,
  WIKI_KEYWORDS,
  CODE_KEYWORDS
};

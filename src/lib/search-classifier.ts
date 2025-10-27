// Search Classifier - نظام تصنيف الأسئلة المحسن
// يفصل بين البحث الديني والعام بدقة عالية

/**
 * تصنيف أنواع الأسئلة
 */
export enum QuestionType {
  RELIGIOUS = 'religious',     // أسئلة دينية (فتاوى وأحكام)
  GENERAL_INFO = 'general',    // أسئلة عامة تحتاج بحث
  TECH_CODE = 'technical',     // أسئلة تقنية وبرمجة
  AI_RESPONSE = 'ai_response'  // أسئلة عادية للذكاء الاصطناعي
}

/**
 * نتيجة تصنيف السؤال
 */
interface ClassificationResult {
  type: QuestionType;
  confidence: number;  // مستوى الثقة من 0 إلى 1
  reason: string;      // سبب التصنيف
  keywords: string[];  // الكلمات المفتاحية التي أدت للتصنيف
}

/**
 * دالة تصنيف الأسئلة الذكية
 */
export function classifyQuestion(question: string): ClassificationResult {
  const questionLower = question.toLowerCase().trim();

  // ❌ استبعاد التحيات فقط
  const greetings = ['مرحبا', 'مرحباً', 'أهلا', 'أهلاً', 'صباح الخير', 'مساء الخير', 'شكرا', 'شكراً', 'hello', 'hi', 'hey', 'thanks', 'bye'];

  // تحيات كاملة (يجب أن تكون النص بالكامل)
  const exactGreetings = ['سلام', 'السلام عليكم', 'وعليكم السلام'];

  // فحص التحيات العادية (substring)
  const hasGreeting = greetings.some(g => questionLower.includes(g));

  // فحص التحيات الكاملة (exact match أو standalone word)
  const hasExactGreeting = exactGreetings.some(g => {
    const trimmed = questionLower.trim();
    return trimmed === g || trimmed.startsWith(g + ' ') || trimmed.endsWith(' ' + g);
  });

  if (questionLower.length < 3 || hasGreeting || hasExactGreeting) {
    return {
      type: QuestionType.AI_RESPONSE,
      confidence: 0.9,
      reason: 'تحية أو نص قصير',
      keywords: []
    };
  }

  // 🕌 فحص الأسئلة الدينية أولاً
  const religiousResult = checkReligiousQuestion(question);
  if (religiousResult.type === QuestionType.RELIGIOUS) {
    return religiousResult;
  }

  // 🎯 النظام الجديد: كل شيء آخر يبحث!
  // افتراضياً، أي سؤال يحتاج مقدمة AI + فيديوهات
  return {
    type: QuestionType.GENERAL_INFO,
    confidence: 0.95,
    reason: 'طلب بحث مباشر',
    keywords: ['ابحث']
  };
}

/**
 * فحص الأسئلة الدينية مع دقة عالية
 */
function checkReligiousQuestion(question: string): ClassificationResult {
  const questionLower = question.toLowerCase().trim();
  
  // 🚫 استثناءات قوية: أسئلة عامة حتى لو احتوت كلمات دينية
  const strongExceptions = [
    // أسئلة تاريخية ومعلوماتية
    /(تاريخ|متى|كيف|أين).*(الإسلام|المسلمين|انتشر)/i,
    /(عدد|كم|نسبة|إحصائيات).*(المسلمين|الدول الإسلامية)/i,
    /(معلومات|بحث|ابحث|دور|شرح).*(عن|حول).*(الإسلام|المسلمين)/i,
    /(أخبار|آخر|جديد).*(مسلم|إسلام)/i,
    /(مقارنة|فرق|الفرق).*(بين|الأديان|المذاهب)/i,
    /ما هو الإسلام/i,
    /من هو (محمد|النبي)/i
  ];
  
  for (const pattern of strongExceptions) {
    if (pattern.test(question)) {
      console.log(`📚 استثناء قوي - سؤال عام: "${question.substring(0, 50)}..."`);
      return {
        type: QuestionType.GENERAL_INFO,
        confidence: 0.9,
        reason: 'سؤال عام عن معلومات دينية وليس فتوى',
        keywords: ['معلومات عامة']
      };
    }
  }
  
  // 🕌 كلمات الفتاوى والأحكام المحددة
  const fatwaKeywords = [
    'حكم', 'حلال', 'حرام', 'جائز', 'يجوز', 'لا يجوز', 'مكروه', 'مباح',
    'واجب', 'فرض', 'سنة', 'مستحب', 'محرم', 'فتوى', 'حكم الشرع'
  ];
  
  const worshipKeywords = [
    'صلاة', 'صيام', 'زكاة', 'حج', 'عمرة', 'وضوء', 'غسل', 'تيمم', 
    'طهارة', 'قبلة', 'أذان', 'فجر', 'ظهر', 'عصر', 'مغرب', 'عشاء'
  ];
  
  const marriageKeywords = [
    'نكاح', 'زواج', 'طلاق', 'ميراث', 'وراثة', 'معاملات إسلامية',
    'ربا', 'بنوك إسلامية', 'تجارة إسلامية', 'خمس'
  ];
  
  const scholarKeywords = [
    'السيستاني', 'الخامنئي', 'الخوئي', 'فضل الله', 'الصدر', 'النجفي',
    'ابن باز', 'ابن عثيمين', 'الألباني', 'القرضاوي', 'الشيرازي'
  ];
  
  // فحص الكلمات المفتاحية
  const allReligiousKeywords = [...fatwaKeywords, ...worshipKeywords, ...marriageKeywords, ...scholarKeywords];
  const foundKeywords = allReligiousKeywords.filter(keyword => 
    questionLower.includes(keyword.toLowerCase())
  );
  
  if (foundKeywords.length > 0) {
    // أنماط الفتاوى المحددة
    const fatwaPatterns = [
      /\b(ما حكم|هل يجوز|هل يحل|هل يحرم)\b/i,
      /\b(كيف أصلي|كيف أصوم|متى يجب|أين القبلة)\b/i,
      /\b(حلال أم حرام|حسب الشريعة|حسب المذهب)\b/i,
      /\b(فتوى في|حكم الشرع|يا شيخ|سؤال ديني)\b/i,
      /\b(عند|حسب|رأي|فتوى)\s+(السيستاني|الخامنئي|ابن باز)/i
    ];
    
    const hasStrongPattern = fatwaPatterns.some(pattern => pattern.test(question));
    
    return {
      type: QuestionType.RELIGIOUS,
      confidence: hasStrongPattern ? 0.95 : 0.8,
      reason: hasStrongPattern ? 'نمط فتوى محدد' : 'كلمات مفتاحية دينية',
      keywords: foundKeywords
    };
  }
  
  // ليس سؤالاً دينياً
  return {
    type: QuestionType.AI_RESPONSE,
    confidence: 0.1,
    reason: 'لا يحتوي على مؤشرات دينية',
    keywords: []
  };
}

/**
 * فحص الأسئلة التقنية والبرمجية
 */
function checkTechnicalQuestion(question: string): ClassificationResult {
  const questionLower = question.toLowerCase().trim();
  
  const techKeywords = [
    // لغات برمجة
    'javascript', 'python', 'java', 'c++', 'react', 'vue', 'angular', 'node.js',
    'html', 'css', 'php', 'sql', 'mongodb', 'mysql', 'postgresql',
    'جافاسكريبت', 'بايثون', 'ريأكت', 'نود جي اس',
    
    // مفاهيم برمجية
    'كود', 'برمجة', 'algorithm', 'function', 'دالة', 'متغير', 'variable',
    'array', 'object', 'class', 'مصفوفة', 'كائن', 'صف', 'فئة',
    
    // تطوير الويب
    'api', 'rest', 'graphql', 'frontend', 'backend', 'fullstack',
    'تطوير ويب', 'موقع إلكتروني', 'تطبيق ويب',
    
    // أدوات تقنية
    'git', 'github', 'docker', 'kubernetes', 'aws', 'azure', 'deployment',
    'database', 'قاعدة بيانات', 'خادم', 'server'
  ];
  
  const foundTechKeywords = techKeywords.filter(keyword => 
    questionLower.includes(keyword.toLowerCase())
  );
  
  if (foundTechKeywords.length > 0) {
    return {
      type: QuestionType.TECH_CODE,
      confidence: 0.9,
      reason: 'سؤال تقني أو برمجي',
      keywords: foundTechKeywords
    };
  }
  
  return {
    type: QuestionType.AI_RESPONSE,
    confidence: 0.1,
    reason: 'ليس سؤالاً تقنياً',
    keywords: []
  };
}

/**
 * فحص أسئلة البحث العام
 */
function checkGeneralSearchQuestion(question: string): ClassificationResult {
  const questionLower = question.toLowerCase().trim();
  
  // كلمات البحث المباشر
  const directSearchKeywords = [
    'ابحث', 'دور', 'شوف', 'لقي', 'جيب', 'تتبع', 'اعثر على',
    'ابحثلي', 'دورلي', 'شوفلي', 'جيبلي', 'لقيلي',
    'search', 'find', 'look', 'google', 'show me'
  ];
  
  // كلمات المعلومات والأخبار
  const infoKeywords = [
    'معلومات', 'تفاصيل', 'شرح', 'توضيح', 'بيانات',
    'أخبار', 'آخر', 'جديد', 'أحدث', 'حديث', 'مستجدات',
    'information', 'details', 'news', 'latest', 'recent'
  ];
  
  // أسئلة استفهام عامة
  const questionWords = [
    'ما هو', 'من هو', 'ما هي', 'من هي', 'كيف', 'متى', 'أين', 'لماذا',
    'what is', 'who is', 'how', 'when', 'where', 'why'
  ];
  
  // مقارنات ومراجعات
  const comparisonKeywords = [
    'أفضل', 'أحسن', 'الأفضل', 'الأحسن', 'مقارنة', 'فرق', 'مراجعة',
    'best', 'better', 'compare', 'review', 'vs', 'versus'
  ];
  
  const allSearchKeywords = [
    ...directSearchKeywords, 
    ...infoKeywords, 
    ...questionWords, 
    ...comparisonKeywords
  ];
  
  const foundSearchKeywords = allSearchKeywords.filter(keyword => 
    questionLower.includes(keyword.toLowerCase())
  );
  
  if (foundSearchKeywords.length > 0) {
    // تحديد نوع البحث المطلوب
    const hasDirectSearch = directSearchKeywords.some(k => questionLower.includes(k.toLowerCase()));
    const hasNewsRequest = ['أخبار', 'آخر', 'جديد', 'news', 'latest'].some(k => questionLower.includes(k));
    
    return {
      type: QuestionType.GENERAL_INFO,
      confidence: hasDirectSearch ? 0.95 : hasNewsRequest ? 0.9 : 0.8,
      reason: hasDirectSearch ? 'طلب بحث مباشر' : hasNewsRequest ? 'طلب معلومات حديثة' : 'سؤال يحتاج معلومات',
      keywords: foundSearchKeywords
    };
  }
  
  return {
    type: QuestionType.AI_RESPONSE,
    confidence: 0.1,
    reason: 'لا يحتاج بحث خارجي',
    keywords: []
  };
}

/**
 * دوال مساعدة للتحقق من نوع السؤال
 */
export function isReligiousQuestion(question: string): boolean {
  const result = classifyQuestion(question);
  return result.type === QuestionType.RELIGIOUS && result.confidence >= 0.7;
}

export function needsGeneralSearch(question: string): boolean {
  const result = classifyQuestion(question);
  return result.type === QuestionType.GENERAL_INFO && result.confidence >= 0.7;
}

export function isTechnicalQuestion(question: string): boolean {
  const result = classifyQuestion(question);
  return result.type === QuestionType.TECH_CODE && result.confidence >= 0.7;
}

/**
 * دالة لوج مفصلة لتتبع التصنيف
 */
export function logClassification(question: string): ClassificationResult {
  const result = classifyQuestion(question);
  
  console.log(`🎯 تصنيف السؤال: "${question.substring(0, 50)}..."`);
  console.log(`   📊 النوع: ${result.type}`);
  console.log(`   📈 الثقة: ${(result.confidence * 100).toFixed(1)}%`);
  console.log(`   💭 السبب: ${result.reason}`);
  if (result.keywords.length > 0) {
    console.log(`   🔑 الكلمات المفتاحية: ${result.keywords.join(', ')}`);
  }
  
  return result;
}

export type { ClassificationResult };
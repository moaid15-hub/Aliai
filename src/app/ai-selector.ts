// ===================================
// نظام اختيار الذكاء الاصطناعي الذكي
// ===================================

export interface CategoryConfig {
  keywords: string[];
  provider: string;
  confidence: number;
  fallback: string;
  lengthLimit?: number;
  providers?: string[];
  requiresBoth?: boolean;
}

export interface ProviderStats {
  success: number;
  total: number;
  avgTime: number;
  lastUsed: number;
}

export interface MessageAnalysis {
  wordCount: number;
  complexity: number;
  language: 'ar' | 'en';
  hasCode: boolean;
  isMedical: boolean;
}

// 📊 التصنيفات الذكية المدمجة
export const intelligentCategories: Record<string, CategoryConfig> = {
  // محادثة عامة - OpenAI أولاً، Claude ثانياً
  simpleChat: {
    keywords: ['مرحبا', 'مرحباً', 'السلام عليكم', 'كيف حالك', 'شكرا', 'شكراً', 'وداع', 'صباح الخير', 'مساء الخير', 'hello', 'hi', 'thanks', 'bye'],
    provider: 'openai',
    confidence: 0.9,
    fallback: 'claude'
  },

  // برمجة - Claude أولاً، DeepSeek ثانياً
  simpleCoding: {
    keywords: ['function', 'متغير', 'console.log', 'if else', 'loop', 'for', 'while', 'var', 'let', 'const', 'html', 'css', 'كود', 'code', 'برمجة', 'javascript', 'python', 'react'],
    lengthLimit: 50,
    provider: 'claude',
    confidence: 0.95,
    fallback: 'deepseek'
  },

  // برمجة عميقة ومعمارية - Claude أولاً، DeepSeek ثانياً
  deepCoding: {
    keywords: ['architecture', 'design pattern', 'optimization', 'performance', 'scalability', 'معمارية', 'تحسين الأداء', 'نمط التصميم', 'algorithms', 'data structure', 'framework', 'library', 'مكتبة', 'إطار عمل'],
    lengthLimit: 100,
    provider: 'claude',
    confidence: 0.9,
    fallback: 'deepseek'
  },

  // طب وصحة (نظام مزدوج)
  medical: {
    keywords: ['طب', 'مرض', 'علاج', 'دواء', 'صحة', 'طبيب', 'مستشفى', 'medicine', 'doctor', 'health', 'disease', 'treatment'],
    providers: ['claude', 'openai'],
    requiresBoth: true,
    provider: 'claude',
    confidence: 0.95,
    fallback: 'openai'
  },

  // أسئلة دينية - نظام خاص
  religious: {
    keywords: ['حكم', 'حلال', 'حرام', 'جائز', 'يجوز', 'صلاة', 'صيام', 'زكاة', 'حج', 'عمرة', 'فتوى', 'شرع', 'فقه', 'مذهب', 'وضوء', 'غسل', 'تيمم', 'طهارة', 'نكاح', 'طلاق', 'ميراث', 'معاملات', 'ربا', 'قرض', 'دين', 'شريعة'],
    provider: 'religious_search', // نظام خاص
    confidence: 0.98,
    fallback: 'claude'
  },

  // أسئلة معقدة وتحليلية - OpenAI أولاً، Claude ثانياً
  complexQuestions: {
    keywords: ['لماذا', 'كيف يعمل', 'اشرح بالتفصيل', 'حلل', 'قارن', 'why', 'how does', 'explain', 'analyze', 'compare'],
    provider: 'openai',
    confidence: 0.8,
    fallback: 'claude'
  },

  // ترجمة - OpenAI أولاً، Claude ثانياً
  translation: {
    keywords: ['ترجم', 'translate', 'معنى', 'باللغة', 'meaning', 'in english', 'بالعربية', 'بالإنجليزية'],
    provider: 'openai',
    confidence: 0.9,
    fallback: 'claude'
  },

  // رياضيات - Claude أولاً، DeepSeek ثانياً
  mathematics: {
    keywords: ['رياضيات', 'حساب', 'معادلة', 'math', 'calculate', 'equation', 'solve', 'حل', '+', '-', '*', '/', '='],
    provider: 'claude',
    confidence: 0.9,
    fallback: 'deepseek'
  },

  // كتابة إبداعية - OpenAI أولاً، Claude ثانياً
  creativeWriting: {
    keywords: ['اكتب', 'قصة', 'مقال', 'شعر', 'إبداع', 'write', 'story', 'poem', 'article', 'creative'],
    provider: 'openai',
    confidence: 0.95,
    fallback: 'claude'
  }
};

// 📈 إحصائيات الأداء
export const providerStats: Record<string, ProviderStats> = {
  openai: { success: 0, total: 0, avgTime: 0, lastUsed: 0 },
  claude: { success: 0, total: 0, avgTime: 0, lastUsed: 0 },
  deepseek: { success: 0, total: 0, avgTime: 0, lastUsed: 0 },
  local: { success: 0, total: 0, avgTime: 0, lastUsed: 0 }
};

// 🔍 تحليل الرسالة
export function analyzeMessage(message: string): MessageAnalysis {
  const wordCount = message.trim().split(/\s+/).length;
  const hasArabic = /[\u0600-\u06FF]/.test(message);
  const hasEnglish = /[a-zA-Z]/.test(message);
  const hasCode = /[{}();]|function|const|let|var|class|import|export/.test(message);
  const isMedical = /طب|مرض|علاج|دواء|صحة|طبيب|medicine|doctor|health|disease/.test(message.toLowerCase());

  return {
    wordCount,
    complexity: calculateComplexity(message),
    language: hasArabic ? 'ar' : 'en',
    hasCode,
    isMedical
  };
}

// 📊 حساب درجة التعقيد
function calculateComplexity(message: string): number {
  let complexity = 0;
  
  // طول النص
  complexity += Math.min(message.length / 100, 3);
  
  // وجود كلمات تقنية
  const technicalWords = ['algorithm', 'optimization', 'architecture', 'معمارية', 'تحسين'];
  technicalWords.forEach(word => {
    if (message.toLowerCase().includes(word)) complexity += 1;
  });
  
  // وجود أسئلة متعددة
  const questionMarks = (message.match(/[؟?]/g) || []).length;
  complexity += questionMarks * 0.5;
  
  return Math.min(complexity, 10); // حد أقصى 10
}

// 🎯 حساب النقاط للفئة
export function calculateScore(message: string, config: CategoryConfig): number {
  const analysis = analyzeMessage(message);
  let score = 0;
  
  // البحث عن الكلمات المفتاحية
  const lowerMessage = message.toLowerCase();
  const keywordMatches = config.keywords.filter(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  ).length;
  
  if (keywordMatches > 0) {
    score = (keywordMatches / config.keywords.length) * config.confidence;
  }
  
  // تعديل النقاط حسب طول النص
  if (config.lengthLimit) {
    if (analysis.wordCount <= config.lengthLimit && score > 0) {
      score *= 1.2; // زيادة للنصوص القصيرة المناسبة
    } else if (analysis.wordCount > config.lengthLimit * 2) {
      score *= 0.8; // تقليل للنصوص الطويلة جداً
    }
  }
  
  // تعزيز للمواضيع الطبية
  if (config.requiresBoth && analysis.isMedical) {
    score *= 1.3;
  }
  
  return Math.min(score, 1); // حد أقصى 1
}

// ⚡ اختيار المزود الأمثل
export function selectOptimalProvider(message: string, context: any = {}): string {
  let selectedCategory: string | null = null;
  let maxScore = 0;
  
  // البحث عن أفضل فئة
  for (const [category, config] of Object.entries(intelligentCategories)) {
    const score = calculateScore(message, config);
    if (score > maxScore && score > 0.6) {
      maxScore = score;
      selectedCategory = category;
    }
  }
  
  // إذا وُجدت فئة مناسبة
  if (selectedCategory) {
    const config = intelligentCategories[selectedCategory];
    
    // للمواضيع الطبية، أرجع المزود الأول (سنتعامل مع المزدوج لاحقاً)
    if (config.requiresBoth) {
      return config.providers![0];
    }
    
    return config.provider;
  }
  
  // توزيع الأحمال للحالات العامة
  return getLoadBalancedProvider();
}

// 📊 توزيع الأحمال الذكي - OpenAI أولاً للمحادثات العامة
export function getLoadBalancedProvider(): string {
  const now = Date.now();
  const hour = new Date().getHours();
  
  // OpenAI دائماً للمحادثات العامة والودية
  return 'openai';
}

// 📈 أفضل مزود أداءً
export function getBestPerformingProvider(): string {
  const providers = Object.entries(providerStats)
    .filter(([_, stats]) => stats.total > 0)
    .sort((a, b) => {
      const successRateA = a[1].success / a[1].total;
      const successRateB = b[1].success / b[1].total;
      return successRateB - successRateA;
    });
  
  return providers.length > 0 ? providers[0][0] : 'openai';
}

// 🔄 مزود بديل - DeepSeek احتياطي أخير فقط
export function getAlternativeProvider(provider: string): string {
  const alternatives: Record<string, string> = {
    'openai': 'claude',      // إذا فشل OpenAI → Claude
    'claude': 'deepseek',    // إذا فشل Claude → DeepSeek (احتياطي أخير)
    'deepseek': 'openai',    // إذا فشل DeepSeek → OpenAI
    'local': 'openai'        // إذا فشل Local → OpenAI
  };
  
  return alternatives[provider] || 'deepseek';
}

// 🆘 DeepSeek كاحتياطي أخير عند فشل الكل (OpenAI وClaude)
export function getEmergencyFallback(): string {
  return 'deepseek';
}

// 📊 تسجيل الإحصائيات
export function recordProviderStats(provider: string, responseTime: number, success: boolean): void {
  if (!providerStats[provider]) {
    providerStats[provider] = { success: 0, total: 0, avgTime: 0, lastUsed: 0 };
  }
  
  const stats = providerStats[provider];
  stats.total += 1;
  if (success) stats.success += 1;
  
  // حساب متوسط الوقت
  stats.avgTime = (stats.avgTime * (stats.total - 1) + responseTime) / stats.total;
  stats.lastUsed = Date.now();
  
  // حفظ الإحصائيات في التخزين المحلي
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('providerStats', JSON.stringify(providerStats));
  }
}

// 📥 تحميل الإحصائيات المحفوظة
export function loadProviderStats(): void {
  if (typeof localStorage !== 'undefined') {
    try {
      const saved = localStorage.getItem('providerStats');
      if (saved) {
        const parsed = JSON.parse(saved);
        Object.assign(providerStats, parsed);
      }
    } catch (error) {
      console.warn('Failed to load provider stats:', error);
    }
  }
}

// 🚀 التهيئة
export function initializeAISelector(): void {
  loadProviderStats();
  console.log('🧠 AI Selector initialized with intelligent categories');
}
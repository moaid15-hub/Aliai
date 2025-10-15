// 🏷️ تكوين العلامة التجارية الموحدة
// =====================================

export const BRAND_CONFIG = {
  // الأسماء المختلفة حسب نوع الاستخدام
  GENERAL_NAME: 'عقول',
  SPECIALIZED_NAME: 'MuayadAi',
  
  // الهوية الأساسية
  IDENTITY: 'muayadai',
  
  // التواقيع المختلفة
  GENERAL_SIGNATURE: '🤖 *عقول - muayadai*',
  SPECIALIZED_SIGNATURE: '🤖 *MuayadAi - muayadai*',
  
  // رسائل الترحيب
  WELCOME_MESSAGES: {
    general: 'مرحباً بك في عقول',
    specialized: 'مرحباً بك في MuayadAi'
  },
  
  // أوصاف التخصصات
  SPECIALIZATIONS: {
    general: 'المحادثات العامة والإجابة على الأسئلة',
    programming: 'البرمجة والتطوير التقني',
    mathematics: 'الرياضيات والحسابات',
    medical: 'الاستشارات الطبية والصحية',
    depth: 'التحليل العميق والتخصصي'
  }
};

// دالة الحصول على الاسم حسب النوع
export function getProviderName(type: 'general' | 'specialized' = 'general'): string {
  return type === 'specialized' ? BRAND_CONFIG.SPECIALIZED_NAME : BRAND_CONFIG.GENERAL_NAME;
}

// دالة الحصول على التوقيع حسب النوع
export function getProviderSignature(type: 'general' | 'specialized' = 'general'): string {
  return type === 'specialized' ? BRAND_CONFIG.SPECIALIZED_SIGNATURE : BRAND_CONFIG.GENERAL_SIGNATURE;
}

// دالة تنسيق الرسالة بدون اسم المزود تحت النص
export function formatMessageWithSignature(message: string, type: 'general' | 'specialized' = 'general'): string {
  return message;
}

// للتوافق مع النظام القديم
export function getUnifiedProviderName(): string {
  return BRAND_CONFIG.GENERAL_NAME;
}

// دالة تحديد نوع السؤال (عام أم متخصص)
export function determineQuestionType(message: string, selectedProvider: string): 'general' | 'specialized' {
  const lowerMessage = message.toLowerCase();
  
  // كلمات تدل على التخصص والعمق
  const specializedKeywords = [
    // برمجة متقدمة
    'algorithm', 'architecture', 'design pattern', 'optimization', 'performance', 'scalability',
    'معمارية', 'تحسين الأداء', 'نمط التصميم', 'خوارزمية', 'تحسين',
    
    // طب متخصص
    'diagnosis', 'differential', 'pathophysiology', 'تشخيص تفريقي', 'علاج متخصص', 'استشارة طبية',
    
    // رياضيات متقدمة
    'calculus', 'differential equation', 'linear algebra', 'حساب التفاضل', 'معادلة تفاضلية', 'جبر خطي',
    
    // تحليل عميق
    'analyze deeply', 'complex analysis', 'detailed explanation', 'تحليل عميق', 'شرح مفصل', 'دراسة معمقة'
  ];
  
  // فحص وجود كلمات متخصصة
  const hasSpecializedContent = specializedKeywords.some(keyword => 
    lowerMessage.includes(keyword.toLowerCase())
  );
  
  // فحص طول الرسالة (الأسئلة المعقدة عادة أطول)
  const isComplexQuestion = message.length > 100 && message.split('?').length > 1;
  
  // إذا كان المزود المختار Claude أو DeepSeek، فهو متخصص
  const isSpecializedProvider = selectedProvider === 'claude' || selectedProvider === 'deepseek';
  
  return (hasSpecializedContent || isComplexQuestion || isSpecializedProvider) 
    ? 'specialized' 
    : 'general';
}

export default BRAND_CONFIG;
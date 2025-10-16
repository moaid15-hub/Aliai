// إعدادات الشخصيات

export const PERSONA_CONFIG = {
  // الحد الأقصى للشخصيات
  MAX_PERSONAS_PER_USER: 50,
  
  // الحد الأقصى للوسوم
  MAX_TAGS_PER_PERSONA: 10,
  
  // الحد الأقصى لمجالات المعرفة
  MAX_KNOWLEDGE_AREAS: 10,
  
  // الحد الأقصى للتخصصات
  MAX_SPECIALIZATIONS: 15,
  
  // الحد الأقصى لطول الاسم
  MAX_NAME_LENGTH: 50,
  
  // الحد الأقصى لطول الوصف
  MAX_DESCRIPTION_LENGTH: 500,
  
  // الحد الأقصى لطول System Prompt
  MAX_SYSTEM_PROMPT_LENGTH: 2000,
  
  // الحد الأقصى لطول أسلوب التحية
  MAX_GREETING_LENGTH: 200,
  
  // الإعدادات الافتراضية
  DEFAULTS: {
    AVATAR: '🤖',
    CATEGORY: 'general',
    TONE: 'friendly',
    LANGUAGE_STYLE: 'moderate',
    RESPONSE_LENGTH: 'medium',
    USE_EXAMPLES: true,
    ASK_CLARIFYING_QUESTIONS: false,
    PROVIDE_SOURCES: false,
    USE_EMOJIS: false,
    IS_PUBLIC: false,
    IS_FEATURED: false
  },
  
  // الفئات المدعومة
  SUPPORTED_CATEGORIES: [
    'education',
    'professional', 
    'creative',
    'technical',
    'health',
    'business',
    'entertainment',
    'general'
  ],
  
  // النبرات المدعومة
  SUPPORTED_TONES: [
    'formal',
    'friendly',
    'professional',
    'casual',
    'humorous',
    'empathetic'
  ],
  
  // مستويات اللغة المدعومة
  SUPPORTED_LANGUAGE_STYLES: [
    'simple',
    'moderate',
    'advanced',
    'technical'
  ],
  
  // أطوال الردود المدعومة
  SUPPORTED_RESPONSE_LENGTHS: [
    'short',
    'medium',
    'long'
  ]
} as const;


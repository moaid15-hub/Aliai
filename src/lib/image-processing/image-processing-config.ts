// @ts-nocheck
// src/config/image-processing-config.ts

/**
 * إعدادات معالجة الصور - النظام الهجين الذكي
 */

import {
  ProcessingConfig,
  ProcessingStrategy,
  ContentType,
  VisionProvider,
  OCRProvider,
} from '@/types/image-processing.types';

// ====================================
// الإعدادات الرئيسية
// ====================================

export const IMAGE_PROCESSING_CONFIG: ProcessingConfig = {
  
  // ====================================
  // حدود الجودة (Quality Thresholds)
  // ====================================
  qualityThresholds: {
    excellent: 0.95,  // جودة ممتازة
    good: 0.80,       // جودة جيدة
    fair: 0.60,       // جودة مقبولة
    poor: 0.40,       // جودة ضعيفة
  },

  // ====================================
  // حدود الثقة (Confidence Thresholds)
  // ====================================
  confidenceThresholds: {
    high: 0.90,    // ثقة عالية - نقبل النتيجة مباشرة
    medium: 0.70,  // ثقة متوسطة - نراجع
    low: 0.50,     // ثقة منخفضة - نستخدم fallback
  },

  // ====================================
  // استراتيجيات حسب نوع المحتوى
  // ====================================
  strategyByContent: {
    'text-clear': 'ocr-first',        // نص واضح → OCR أولاً (أرخص)
    'text-handwritten': 'vision-first', // خط يدوي → Vision أولاً (أدق)
    'math-problem': 'parallel',        // رياضيات → الاثنين معاً
    'diagram': 'vision-first',         // رسم → Vision فقط
    'drawing': 'vision-first',         // رسمة → Vision فقط
    'mixed': 'adaptive',               // محتوى مختلط → ذكي تكيفي
    'unknown': 'adaptive',             // غير معروف → ذكي تكيفي
  },

  // ====================================
  // ترتيب Fallback للـ Vision
  // ====================================
  visionFallbackOrder: [
    'claude',   // الأول: Claude (الأفضل للعربي)
    'gpt4',     // الثاني: GPT-4 (قوي جداً)
    'gemini',   // الثالث: Gemini (احتياطي)
  ],

  // ====================================
  // ترتيب Fallback للـ OCR
  // ====================================
  ocrFallbackOrder: [
    'google-vision', // الأول: Google (الأفضل للعربي)
    'azure',         // الثاني: Azure (قوي)
    'tesseract',     // الثالث: Tesseract (مجاني)
  ],

  // ====================================
  // المهلات الزمنية (Timeouts)
  // ====================================
  timeouts: {
    vision: 30000,  // 30 ثانية للـ Vision
    ocr: 20000,     // 20 ثانية للـ OCR
    total: 60000,   // 60 ثانية إجمالي
  },

  // ====================================
  // التكلفة التقديرية (بالدولار)
  // ====================================
  costs: {
    vision: {
      claude: 0.005,   // $0.005 للصورة
      gpt4: 0.01,      // $0.01 للصورة
      gemini: 0.002,   // $0.002 للصورة
    },
    ocr: {
      'google-vision': 0.0015, // $0.0015 للصورة
      azure: 0.001,            // $0.001 للصورة
      tesseract: 0,            // مجاني!
    },
  },
};

// ====================================
// إعدادات إضافية
// ====================================

/**
 * حجم الصورة الأقصى المسموح به
 */
export const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * صيغ الصور المدعومة
 */
export const SUPPORTED_IMAGE_FORMATS = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
];

/**
 * الحد الأدنى لأبعاد الصورة
 */
export const MIN_IMAGE_DIMENSIONS = {
  width: 100,
  height: 100,
};

/**
 * الحد الأقصى لأبعاد الصورة
 */
export const MAX_IMAGE_DIMENSIONS = {
  width: 4096,
  height: 4096,
};

/**
 * عدد المحاولات القصوى للـ Fallback
 */
export const MAX_RETRY_ATTEMPTS = 3;

/**
 * مدة صلاحية الكاش (بالثواني)
 */
export const CACHE_TTL = 60 * 60 * 24; // 24 ساعة

/**
 * تفعيل الكاش
 */
export const ENABLE_CACHE = true;

/**
 * تفعيل المعالجة المسبقة للصور
 */
export const ENABLE_IMAGE_PREPROCESSING = true;

/**
 * تفعيل تحسين الصور تلقائياً
 */
export const AUTO_ENHANCE_IMAGES = true;

/**
 * تفعيل إصلاح النصوص العربية
 */
export const FIX_ARABIC_TEXT = true;

// ====================================
// إعدادات المعالجة المسبقة
// ====================================

export const PREPROCESSING_CONFIG = {
  // تحسين التباين
  enhanceContrast: true,
  contrastLevel: 1.2,

  // إزالة التشويش
  removeNoise: true,
  noiseThreshold: 0.1,

  // تدوير تلقائي
  autoRotate: true,

  // تحويل لأبيض وأسود (للنصوص)
  convertToGrayscale: false, // نتركها ملونة للمعلم

  // ضبط السطوع
  adjustBrightness: true,
  brightnessLevel: 1.1,
};

// ====================================
// إعدادات الأداء
// ====================================

export const PERFORMANCE_CONFIG = {
  // تفعيل المعالجة المتوازية
  enableParallelProcessing: true,

  // الحد الأقصى للطلبات المتزامنة
  maxConcurrentRequests: 5,

  // تفعيل مراقبة الأداء
  enablePerformanceMonitoring: true,

  // حفظ الإحصائيات
  saveStatistics: true,
};

// ====================================
// مفاتيح API (من المتغيرات البيئية)
// ====================================

export const API_KEYS = {
  // Vision APIs
  claude: process.env.NEXT_PUBLIC_CLAUDE_API_KEY || '',
  openai: process.env.NEXT_PUBLIC_OPENAI_API_KEY || '',
  gemini: process.env.NEXT_PUBLIC_GEMINI_API_KEY || '',

  // OCR APIs
  googleVision: process.env.NEXT_PUBLIC_GOOGLE_VISION_API_KEY || '',
  azure: process.env.NEXT_PUBLIC_AZURE_OCR_API_KEY || '',
};

// ====================================
// دوال مساعدة للإعدادات
// ====================================

/**
 * الحصول على الاستراتيجية المثلى حسب نوع المحتوى
 */
export function getStrategyForContent(contentType: ContentType): ProcessingStrategy {
  return IMAGE_PROCESSING_CONFIG.strategyByContent[contentType];
}

/**
 * التحقق من صلاحية مفاتيح API
 */
export function validateAPIKeys(): {
  vision: boolean;
  ocr: boolean;
} {
  return {
    vision: !!(API_KEYS.claude || API_KEYS.openai || API_KEYS.gemini),
    ocr: !!(API_KEYS.googleVision || API_KEYS.azure),
  };
}

/**
 * حساب التكلفة المتوقعة
 */
export function estimateCost(
  strategy: ProcessingStrategy,
  contentType: ContentType
): number {
  const { vision, ocr } = IMAGE_PROCESSING_CONFIG.costs;

  switch (strategy) {
    case 'vision-first':
      return vision.claude; // نستخدم Claude افتراضياً

    case 'ocr-first':
      return ocr['google-vision']; // نستخدم Google افتراضياً

    case 'parallel':
      return vision.claude + ocr['google-vision'];

    case 'adaptive':
      // نحسب متوسط التكلفة
      return (vision.claude + ocr['google-vision']) / 2;

    default:
      return 0;
  }
}

/**
 * الحصول على Timeout المناسب
 */
export function getTimeout(processorType: 'vision' | 'ocr' | 'total'): number {
  return IMAGE_PROCESSING_CONFIG.timeouts[processorType];
}

// ====================================
// رسائل الأخطاء (بالعربي)
// ====================================

export const ERROR_MESSAGES = {
  IMAGE_TOO_LARGE: 'الصورة كبيرة جداً! الحجم الأقصى 10 ميجابايت',
  IMAGE_TOO_SMALL: 'الصورة صغيرة جداً! الحد الأدنى 100x100 بكسل',
  UNSUPPORTED_FORMAT: 'صيغة الصورة غير مدعومة',
  IMAGE_CORRUPTED: 'الصورة تالفة أو غير قابلة للقراءة',
  NO_API_KEY: 'مفتاح API غير موجود',
  PROCESSING_TIMEOUT: 'انتهت مهلة المعالجة',
  ALL_PROVIDERS_FAILED: 'فشلت جميع المحاولات',
  NETWORK_ERROR: 'خطأ في الاتصال بالإنترنت',
  UNKNOWN_ERROR: 'حدث خطأ غير معروف',
};
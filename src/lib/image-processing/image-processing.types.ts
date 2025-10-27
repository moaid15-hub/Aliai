// @ts-nocheck
// src/types/image-processing.types.ts

/**
 * أنواع معالجة الصور - النظام الهجين الذكي
 */

// ====================================
// أنواع الصور
// ====================================

export type ImageFormat = 'jpeg' | 'jpg' | 'png' | 'webp' | 'heic' | 'heif';

export interface UploadedImage {
  file: File;
  preview: string;
  format: ImageFormat;
  size: number; // بالبايت
  width?: number;
  height?: number;
  uploadedAt: Date;
}

// ====================================
// تحليل الصورة
// ====================================

export type ContentType = 
  | 'text-clear'           // نص واضح مطبوع
  | 'text-handwritten'     // نص مكتوب باليد
  | 'math-problem'         // مسألة رياضية
  | 'diagram'              // مخطط أو رسم بياني
  | 'drawing'              // رسمة
  | 'mixed'                // محتوى مختلط
  | 'unknown';             // غير معروف

export type ImageQuality = 'excellent' | 'good' | 'fair' | 'poor' | 'very-poor';

export interface ImageAnalysisResult {
  contentType: ContentType;
  quality: ImageQuality;
  hasArabicText: boolean;
  hasEnglishText: boolean;
  hasMath: boolean;
  hasDiagrams: boolean;
  isHandwritten: boolean;
  rotation?: number; // درجة الدوران المطلوبة
  needsEnhancement: boolean;
  confidence: number; // 0-1
}

// ====================================
// استراتيجيات المعالجة
// ====================================

export type ProcessingStrategy = 
  | 'ocr-first'      // OCR أولاً ثم Vision إن فشل
  | 'vision-first'   // Vision أولاً ثم OCR إن فشل
  | 'parallel'       // الاثنين معاً بشكل متوازي
  | 'adaptive';      // تكيفي ذكي (يختار تلقائياً)

export type ProcessorType = 'ocr' | 'vision' | 'hybrid';

// ====================================
// مزودي الخدمات
// ====================================

export type VisionProvider = 'claude' | 'gpt4' | 'gemini';
export type OCRProvider = 'tesseract' | 'google-vision' | 'azure';

// ====================================
// نتائج المعالجة
// ====================================

export interface OCRResult {
  provider: OCRProvider;
  text: string;
  confidence: number;
  language: string;
  processingTime: number; // ميلي ثانية
  success: boolean;
  error?: string;
}

export interface VisionResult {
  provider: VisionProvider;
  description: string;
  extractedText?: string;
  detectedObjects?: string[];
  confidence: number;
  processingTime: number;
  success: boolean;
  error?: string;
}

export interface ProcessingResult {
  strategy: ProcessingStrategy;
  processorUsed: ProcessorType;
  finalText: string;
  confidence: number;
  totalProcessingTime: number;
  ocrResult?: OCRResult;
  visionResult?: VisionResult;
  analysisResult: ImageAnalysisResult;
  success: boolean;
  error?: string;
  timestamp: Date;
}

// ====================================
// إعدادات المعالجة
// ====================================

export interface ProcessingOptions {
  strategy?: ProcessingStrategy;
  preferredVisionProvider?: VisionProvider;
  preferredOCRProvider?: OCRProvider;
  enableFallback?: boolean;
  maxRetries?: number;
  timeout?: number; // ميلي ثانية
  enhanceImage?: boolean;
  fixArabicText?: boolean;
  cacheResults?: boolean;
}

export interface ProcessingConfig {
  // حدود الجودة
  qualityThresholds: {
    excellent: number;
    good: number;
    fair: number;
    poor: number;
  };
  
  // حدود الثقة
  confidenceThresholds: {
    high: number;    // > 0.9
    medium: number;  // > 0.7
    low: number;     // > 0.5
  };
  
  // استراتيجيات حسب نوع المحتوى
  strategyByContent: Record<ContentType, ProcessingStrategy>;
  
  // Fallback order
  visionFallbackOrder: VisionProvider[];
  ocrFallbackOrder: OCRProvider[];
  
  // Timeouts
  timeouts: {
    vision: number;
    ocr: number;
    total: number;
  };
  
  // التكلفة (تقديرية)
  costs: {
    vision: Record<VisionProvider, number>;
    ocr: Record<OCRProvider, number>;
  };
}

// ====================================
// Cache
// ====================================

export interface CachedResult {
  imageHash: string;
  result: ProcessingResult;
  cachedAt: Date;
  expiresAt: Date;
}

// ====================================
// الإحصائيات والمراقبة
// ====================================

export interface ProcessingStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageProcessingTime: number;
  strategyUsageCount: Record<ProcessingStrategy, number>;
  providerUsageCount: {
    vision: Record<VisionProvider, number>;
    ocr: Record<OCRProvider, number>;
  };
  totalCost: number;
  cacheHitRate: number;
}

// ====================================
// Errors
// ====================================

export type ProcessingErrorType =
  | 'image-invalid'
  | 'image-too-large'
  | 'image-corrupted'
  | 'ocr-failed'
  | 'vision-failed'
  | 'all-providers-failed'
  | 'timeout'
  | 'api-error'
  | 'network-error'
  | 'unknown';

export interface ProcessingError {
  type: ProcessingErrorType;
  message: string;
  details?: any;
  timestamp: Date;
}

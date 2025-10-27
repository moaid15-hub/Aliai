// أنواع معالجة الصور

export enum ImageProcessingMethod {
  AI_VISION = 'ai_vision',      // Claude/GPT-4
  OCR = 'ocr',                   // استخراج النص فقط
  HYBRID = 'hybrid'              // الاثنين معاً
}

export interface ImageProcessingConfig {
  method: ImageProcessingMethod;
  fallbackToVision?: boolean;    // للـ Hybrid: استخدم Vision إذا فشل OCR
  maxImageSize?: number;         // الحد الأقصى لحجم الصورة
  supportedFormats?: string[];   // الصيغ المدعومة
}

export interface ImageProcessingResult {
  success: boolean;
  method: ImageProcessingMethod;
  extractedText?: string;
  visionAnalysis?: {
    description: string;
    detectedObjects?: string[];
    isMath?: boolean;
    isDiagram?: boolean;
    confidence: number;
  };
  error?: string;
  processingTime: number;
}

export interface ImageUpload {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  result?: ImageProcessingResult;
}



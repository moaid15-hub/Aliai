// خدمة معالجة الصور الرئيسية

import { 
  ImageProcessingMethod, 
  ImageProcessingConfig, 
  ImageProcessingResult 
} from '@/features/image-processing/types/image-processing.types';
import { processWithOCR } from './ocr-service';
import { processWithAIVision } from './ai-vision-service';

export class ImageProcessor {
  private config: ImageProcessingConfig;

  constructor(config: ImageProcessingConfig) {
    this.config = config;
  }

  /**
   * معالجة الصورة حسب الطريقة المحددة
   */
  async processImage(imageFile: File): Promise<ImageProcessingResult> {
    const startTime = Date.now();

    try {
      switch (this.config.method) {
        case ImageProcessingMethod.AI_VISION:
          return await this.processWithVision(imageFile, startTime);

        case ImageProcessingMethod.OCR:
          return await this.processWithOCROnly(imageFile, startTime);

        case ImageProcessingMethod.HYBRID:
          return await this.processWithHybrid(imageFile, startTime);

        default:
          throw new Error('طريقة معالجة غير مدعومة');
      }
    } catch (error) {
      return {
        success: false,
        method: this.config.method,
        error: error instanceof Error ? error.message : 'خطأ غير معروف',
        processingTime: Date.now() - startTime
      };
    }
  }

  /**
   * أ) AI Vision (Claude/GPT-4)
   * - يشوف الصورة كاملة
   * - يفهم الرسومات والمخططات
   * - يقرأ الخط حتى لو مو واضح
   * - الأفضل للرياضيات والرسومات
   */
  private async processWithVision(
    imageFile: File, 
    startTime: number
  ): Promise<ImageProcessingResult> {
    const visionAnalysis = await processWithAIVision(imageFile);

    return {
      success: true,
      method: ImageProcessingMethod.AI_VISION,
      visionAnalysis,
      processingTime: Date.now() - startTime
    };
  }

  /**
   * ب) OCR (استخراج النص فقط)
   * - يحول الصورة لنص
   * - أسرع
   * - أرخص
   * - يشتغل بس للنصوص الواضحة
   */
  private async processWithOCROnly(
    imageFile: File, 
    startTime: number
  ): Promise<ImageProcessingResult> {
    const extractedText = await processWithOCR(imageFile);

    return {
      success: true,
      method: ImageProcessingMethod.OCR,
      extractedText,
      processingTime: Date.now() - startTime
    };
  }

  /**
   * ج) الاثنين معاً (Hybrid)
   * - OCR أول شي (لو نجح)
   * - لو فشل → نستخدم AI Vision
   * - الأذكى لكن أعقد
   */
  private async processWithHybrid(
    imageFile: File, 
    startTime: number
  ): Promise<ImageProcessingResult> {
    try {
      // نجرب OCR أول شي (أسرع وأرخص)
      const extractedText = await processWithOCR(imageFile);
      
      // نتحقق إذا النص واضح وكافي
      if (extractedText && extractedText.length > 10) {
        return {
          success: true,
          method: ImageProcessingMethod.OCR,
          extractedText,
          processingTime: Date.now() - startTime
        };
      }

      // لو فشل OCR أو النتيجة ضعيفة، نستخدم AI Vision
      throw new Error('OCR failed, falling back to Vision');

    } catch (ocrError) {
      // نستخدم AI Vision كـ fallback
      if (this.config.fallbackToVision !== false) {
        const visionAnalysis = await processWithAIVision(imageFile);
        
        return {
          success: true,
          method: ImageProcessingMethod.HYBRID,
          visionAnalysis,
          extractedText: visionAnalysis.description,
          processingTime: Date.now() - startTime
        };
      }

      throw ocrError;
    }
  }

  /**
   * التحقق من صلاحية الصورة
   */
  validateImage(file: File): { valid: boolean; error?: string } {
    // التحقق من الحجم
    if (this.config.maxImageSize && file.size > this.config.maxImageSize) {
      return {
        valid: false,
        error: `حجم الصورة كبير جداً. الحد الأقصى: ${this.config.maxImageSize / 1024 / 1024}MB`
      };
    }

    // التحقق من الصيغة
    if (this.config.supportedFormats) {
      const fileType = file.type.split('/')[1];
      if (!this.config.supportedFormats.includes(fileType)) {
        return {
          valid: false,
          error: `صيغة غير مدعومة. الصيغ المدعومة: ${this.config.supportedFormats.join(', ')}`
        };
      }
    }

    return { valid: true };
  }
}



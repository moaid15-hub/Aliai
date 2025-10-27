// @ts-nocheck
/**
 * OCR Fallback Service
 * خدمة الاحتياط للتعرف على النصوص
 */

import { OCRResult, UploadedImage } from '../../../types/image-processing.types';
import { TesseractOCRService } from './tesseract-ocr';
import { GoogleVisionOCRService } from './google-vision-ocr';
import { AzureOCRService } from './azure-ocr';

export class OCRFallbackService {
  private services: Map<string, any> = new Map();
  private fallbackOrder: string[] = ['google-vision', 'azure', 'tesseract'];

  constructor(apiKeys: { 
    googleVision?: string; 
    azure?: { key: string; endpoint: string }; 
    tesseract?: boolean;
  }) {
    if (apiKeys.googleVision) {
      this.services.set('google-vision', new GoogleVisionOCRService(apiKeys.googleVision));
    }
    if (apiKeys.azure) {
      this.services.set('azure', new AzureOCRService(apiKeys.azure.key, apiKeys.azure.endpoint));
    }
    if (apiKeys.tesseract) {
      this.services.set('tesseract', new TesseractOCRService());
    }
  }

  async extractWithFallback(image: UploadedImage): Promise<OCRResult> {
    let lastError = '';

    for (const provider of this.fallbackOrder) {
      const service = this.services.get(provider);
      if (!service) continue;

      try {
        console.log(`🔄 محاولة استخراج النص باستخدام ${provider}...`);
        const result = await service.extractText(image);
        
        if (result.success && result.text && result.text.trim()) {
          console.log(`✅ نجح الاستخراج باستخدام ${provider}`);
          return result;
        } else {
          console.log(`⚠️ فشل ${provider}: لا توجد نتيجة مفيدة`);
          lastError = result.error || `لا توجد نتيجة من ${provider}`;
        }
      } catch (error) {
        console.log(`❌ خطأ في ${provider}:`, error);
        lastError = error instanceof Error ? error.message : `خطأ في ${provider}`;
        continue;
      }
    }

    // إذا فشلت جميع الخدمات
    return {
      provider: 'tesseract',
      text: '',
      confidence: 0,
      language: 'ar',
      processingTime: Date.now(),
      success: false,
      error: `فشل جميع خدمات OCR. آخر خطأ: ${lastError}`
    };
  }

  setFallbackOrder(order: string[]) {
    this.fallbackOrder = order;
  }

  getFallbackOrder(): string[] {
    return [...this.fallbackOrder];
  }

  getAvailableProviders(): string[] {
    return Array.from(this.services.keys());
  }
}
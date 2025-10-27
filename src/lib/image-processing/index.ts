// @ts-nocheck
/**
 * Image Processing Services Entry Point
 * نقطة الدخول الرئيسية لخدمات معالجة الصور
 */

import { UploadedImage } from '../../types/image-processing.types';

// تصدير الخدمات الرئيسية
export { ClaudeVisionService } from './vision/claude-vision';
export { GPT4VisionService } from './vision/gpt4-vision';
export { GeminiVisionService } from './vision/gemini-vision';
export { VisionFallbackService } from './vision/vision-fallback';

export { TesseractOCRService } from './ocr/tesseract-ocr';
export { GoogleVisionOCRService } from './ocr/google-vision-ocr';
export { AzureOCRService } from './ocr/azure-ocr';
export { OCRFallbackService } from './ocr/ocr-fallback';

export { ProcessorSelectorService } from './processor-selector';

/**
 * دوال مساعدة سريعة
 */
export const ImageProcessingUtils = {
  validateImage: (image: UploadedImage): boolean => {
    return image && image.file && image.size > 0;
  },

  getSupportedFormats: (): string[] => {
    return ['jpeg', 'jpg', 'png', 'webp', 'heic', 'heif'];
  },

  isFormatSupported: (format: string): boolean => {
    return ImageProcessingUtils.getSupportedFormats().includes(format.toLowerCase());
  },

  getMaxFileSize: (): number => {
    return 10 * 1024 * 1024; // 10MB
  }
};

/**
 * مصنع خدمات معالجة الصور
 */
export class ImageProcessingFactory {
  static async createFullService(config: {
    apiKeys: {
      gpt4?: string;
      claude?: string;
      gemini?: string;
      googleVision?: string;
      azure?: { key: string; endpoint: string };
    };
    enableTesseract?: boolean;
  }) {
    console.log('🏭 إنشاء خدمة معالجة الصور الكاملة...');
    
    return {
      processImage: async (image: UploadedImage) => {
        console.log('⚙️ معالجة الصورة...');
        // سيتم ربطها بالخدمات الفعلية لاحقاً
        return null;
      },
      config
    };
  }
}

export default ImageProcessingFactory;
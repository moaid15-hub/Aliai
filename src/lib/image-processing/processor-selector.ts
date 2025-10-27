// @ts-nocheck
/**
 * Processor Selector Service
 * خدمة اختيار المعالج المناسب
 */

import { ProcessingStrategy, UploadedImage, ProcessorType } from '../../types/image-processing.types';

export class ProcessorSelectorService {
  
  /**
   * اختيار أفضل استراتيجية معالجة للصورة
   */
  selectOptimalStrategy(image: UploadedImage): ProcessingStrategy {
    // تحليل خصائص الصورة
    const imageFeatures = this.analyzeImageFeatures(image);
    
    if (imageFeatures.hasText && imageFeatures.isHighQuality) {
      return 'ocr-first';
    } else if (imageFeatures.hasComplexContent) {
      return 'vision-first';
    } else if (imageFeatures.isUncertain) {
      return 'parallel';
    } else {
      return 'adaptive';
    }
  }

  /**
   * اختيار أفضل معالج للاستراتيجية المحددة
   */
  selectProcessor(strategy: ProcessingStrategy, imageFeatures?: any): ProcessorType {
    switch (strategy) {
      case 'ocr-first':
        return 'ocr';
      case 'vision-first':
        return 'vision';
      case 'parallel':
        return 'hybrid';
      case 'adaptive':
      default:
        return 'hybrid';
    }
  }

  /**
   * تحليل خصائص الصورة
   */
  private analyzeImageFeatures(image: UploadedImage) {
    const features = {
      hasText: false,
      hasComplexContent: false,
      isHighQuality: false,
      isUncertain: false,
      fileSize: image.size,
      format: image.format,
      dimensions: {
        width: image.width || 0,
        height: image.height || 0
      }
    };

    // تحليل الحجم والجودة
    features.isHighQuality = image.size > 500000 && // أكبر من 500KB
                           (image.width || 0) > 1000 && 
                           (image.height || 0) > 1000;

    // تحليل تقريبي للمحتوى بناءً على النسبة
    const aspectRatio = (image.width || 1) / (image.height || 1);
    
    // النصوص عادة تكون في تنسيق عمودي أو مربع
    features.hasText = aspectRatio > 0.5 && aspectRatio < 2.0;
    
    // المحتوى المعقد في الصور العريضة أو المربعة الكبيرة
    features.hasComplexContent = aspectRatio > 2.0 || (image.size > 1000000);
    
    // حالة عدم اليقين للصور المتوسطة
    features.isUncertain = !features.hasText && !features.hasComplexContent;

    return features;
  }

  /**
   * تقييم مدى ملاءمة معالج معين للصورة
   */
  evaluateProcessorSuitability(processor: ProcessorType, image: UploadedImage): number {
    const features = this.analyzeImageFeatures(image);
    
    switch (processor) {
      case 'ocr':
        return features.hasText ? 0.9 : 0.3;
      case 'vision':
        return features.hasComplexContent ? 0.95 : 0.5;
      case 'hybrid':
        return 0.8; // دائماً خيار جيد
      default:
        return 0.5;
    }
  }

  /**
   * اقتراح ترتيب المعالجات بناءً على الأولوية
   */
  suggestProcessorOrder(image: UploadedImage): ProcessorType[] {
    const processors: ProcessorType[] = [
      'ocr',
      'vision',
      'hybrid'
    ];

    // ترتيب حسب درجة الملاءمة
    return processors.sort((a, b) => {
      return this.evaluateProcessorSuitability(b, image) - 
             this.evaluateProcessorSuitability(a, image);
    });
  }
}
// @ts-nocheck
/**
 * المحرك الهجين - Hybrid Engine
 * 
 * ينفذ استراتيجيات المعالجة المختلفة
 * يجمع بين OCR و Vision API بذكاء
 * 
 * @module hybrid-engine
 * @path src/services/image-processing/hybrid-engine.ts
 */

import {
  ProcessingStrategy,
  HybridProcessingResult,
  ImageAnalysisResult,
  VisionProcessingResult,
  OCRProcessingResult,
  MergedProcessingResult
} from '../../types/image-processing.types';

import VisionProcessor from './vision-processor';
import OCRProcessor from './ocr-processor';
import ResultMerger from './result-merger';

import { IMAGE_PROCESSING_CONFIG } from '../../config/image-processing-config';

// ============================================
// 1. الواجهات المحلية
// ============================================

interface EngineOptions {
  strategy?: ProcessingStrategy;
  enableFallback?: boolean;
  maxRetries?: number;
  timeout?: number;
}

interface ExecutionPlan {
  steps: ProcessingStep[];
  estimatedTime: number;
  fallbackPlan?: ProcessingStep[];
}

interface ProcessingStep {
  type: 'vision' | 'ocr' | 'merge' | 'analyze';
  order: number;
  parallel?: boolean;
  required: boolean;
}

interface PerformanceMetrics {
  visionTime: number;
  ocrTime: number;
  mergeTime: number;
  totalTime: number;
  cacheHits: number;
  retries: number;
}

// ============================================
// 2. فئة المحرك الهجين
// ============================================

export class HybridEngine {
  private visionProcessor: VisionProcessor;
  private ocrProcessor: OCRProcessor;
  private resultMerger: ResultMerger;
  private config = IMAGE_PROCESSING_CONFIG;
  private performanceMetrics: PerformanceMetrics;
  
  constructor() {
    this.visionProcessor = new VisionProcessor();
    this.ocrProcessor = new OCRProcessor();
    this.resultMerger = new ResultMerger();
    this.initializeMetrics();
  }
  
  /**
   * تهيئة المقاييس
   */
  private initializeMetrics(): void {
    this.performanceMetrics = {
      visionTime: 0,
      ocrTime: 0,
      mergeTime: 0,
      totalTime: 0,
      cacheHits: 0,
      retries: 0
    };
  }
  
  // ============================================
  // 3. المعالجة الرئيسية
  // ============================================
  
  /**
   * معالجة صورة باستخدام استراتيجية معينة
   */
  async processImage(
    imageData: string | Blob,
    analysisResult: ImageAnalysisResult,
    options?: EngineOptions
  ): Promise<HybridProcessingResult> {
    
    const startTime = Date.now();
    
    try {
      // تحديد الاستراتيجية
      const strategy = options?.strategy || 
        analysisResult.suggestedStrategy;
      
      // إنشاء خطة التنفيذ
      const plan = this.createExecutionPlan(strategy, analysisResult);
      
      // تنفيذ الاستراتيجية
      const result = await this.executeStrategy(
        imageData,
        strategy,
        plan,
        options
      );
      
      // إضافة معلومات الأداء
      const totalTime = Date.now() - startTime;
      this.performanceMetrics.totalTime = totalTime;
      
      return {
        ...result,
        strategy,
        performance: { ...this.performanceMetrics },
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      return this.handleError(error, startTime);
    }
  }
  
  // ============================================
  // 4. إنشاء خطة التنفيذ
  // ============================================
  
  /**
   * إنشاء خطة تنفيذ حسب الاستراتيجية
   */
  private createExecutionPlan(
    strategy: ProcessingStrategy,
    analysis: ImageAnalysisResult
  ): ExecutionPlan {
    
    const steps: ProcessingStep[] = [];
    let estimatedTime = 0;
    
    switch (strategy) {
      case 'ocr-only':
        steps.push({
          type: 'ocr',
          order: 1,
          required: true
        });
        estimatedTime = 2000;
        break;
        
      case 'vision-only':
        steps.push({
          type: 'vision',
          order: 1,
          required: true
        });
        estimatedTime = 3000;
        break;
        
      case 'ocr-first':
        steps.push(
          {
            type: 'ocr',
            order: 1,
            required: true
          },
          {
            type: 'vision',
            order: 2,
            required: false
          },
          {
            type: 'merge',
            order: 3,
            required: false
          }
        );
        estimatedTime = 5000;
        break;
        
      case 'vision-first':
        steps.push(
          {
            type: 'vision',
            order: 1,
            required: true
          },
          {
            type: 'ocr',
            order: 2,
            required: false
          },
          {
            type: 'merge',
            order: 3,
            required: false
          }
        );
        estimatedTime = 6000;
        break;
        
      case 'parallel':
        steps.push(
          {
            type: 'vision',
            order: 1,
            parallel: true,
            required: true
          },
          {
            type: 'ocr',
            order: 1,
            parallel: true,
            required: true
          },
          {
            type: 'merge',
            order: 2,
            required: true
          }
        );
        estimatedTime = 4000;
        break;
        
      case 'adaptive':
        // يتم تحديدها ديناميكياً
        steps.push({
          type: 'analyze',
          order: 1,
          required: true
        });
        estimatedTime = analysis.complexity.estimatedProcessingTime;
        break;
    }
    
    return {
      steps,
      estimatedTime,
      fallbackPlan: this.createFallbackPlan(strategy)
    };
  }
  
  /**
   * إنشاء خطة احتياطية
   */
  private createFallbackPlan(strategy: ProcessingStrategy): ProcessingStep[] {
    // في حالة فشل الاستراتيجية الأساسية
    return [
      {
        type: 'vision',
        order: 1,
        required: true
      },
      {
        type: 'ocr',
        order: 1,
        parallel: true,
        required: true
      },
      {
        type: 'merge',
        order: 2,
        required: true
      }
    ];
  }
  
  // ============================================
  // 5. تنفيذ الاستراتيجيات
  // ============================================
  
  /**
   * تنفيذ الاستراتيجية المختارة
   */
  private async executeStrategy(
    imageData: string | Blob,
    strategy: ProcessingStrategy,
    plan: ExecutionPlan,
    options?: EngineOptions
  ): Promise<HybridProcessingResult> {
    
    switch (strategy) {
      case 'ocr-only':
        return this.executeOCROnly(imageData);
        
      case 'vision-only':
        return this.executeVisionOnly(imageData);
        
      case 'ocr-first':
        return this.executeOCRFirst(imageData, options);
        
      case 'vision-first':
        return this.executeVisionFirst(imageData, options);
        
      case 'parallel':
        return this.executeParallel(imageData);
        
      case 'adaptive':
        return this.executeAdaptive(imageData, options);
        
      default:
        return this.executeParallel(imageData);
    }
  }
  
  /**
   * تنفيذ OCR فقط
   */
  private async executeOCROnly(
    imageData: string | Blob
  ): Promise<HybridProcessingResult> {
    
    const startTime = Date.now();
    
    const ocrResult = await this.ocrProcessor.processImage(imageData);
    
    this.performanceMetrics.ocrTime = Date.now() - startTime;
    
    return {
      finalText: ocrResult.fullText,
      blocks: ocrResult.blocks,
      confidence: ocrResult.confidence,
      sources: {
        ocr: ocrResult,
        vision: null,
        merged: null
      },
      processingTime: this.performanceMetrics.ocrTime,
      success: ocrResult.success
    };
  }
  
  /**
   * تنفيذ Vision فقط
   */
  private async executeVisionOnly(
    imageData: string | Blob
  ): Promise<HybridProcessingResult> {
    
    const startTime = Date.now();
    
    const visionResult = await this.visionProcessor.processImage(imageData);
    
    this.performanceMetrics.visionTime = Date.now() - startTime;
    
    return {
      finalText: visionResult.extractedText,
      blocks: [],
      confidence: visionResult.confidence,
      sources: {
        ocr: null,
        vision: visionResult,
        merged: null
      },
      processingTime: this.performanceMetrics.visionTime,
      success: visionResult.success
    };
  }
  
  /**
   * تنفيذ OCR أولاً
   */
  private async executeOCRFirst(
    imageData: string | Blob,
    options?: EngineOptions
  ): Promise<HybridProcessingResult> {
    
    let startTime = Date.now();
    
    // 1. تنفيذ OCR
    const ocrResult = await this.ocrProcessor.processImage(imageData);
    this.performanceMetrics.ocrTime = Date.now() - startTime;
    
    // 2. فحص جودة OCR
    if (ocrResult.confidence >= 0.8 && ocrResult.success) {
      // OCR جيد، لا حاجة للـ Vision
      return {
        finalText: ocrResult.fullText,
        blocks: ocrResult.blocks,
        confidence: ocrResult.confidence,
        sources: {
          ocr: ocrResult,
          vision: null,
          merged: null
        },
        processingTime: this.performanceMetrics.ocrTime,
        success: true
      };
    }
    
    // 3. تنفيذ Vision كمساعد
    startTime = Date.now();
    const visionResult = await this.visionProcessor.processImage(imageData);
    this.performanceMetrics.visionTime = Date.now() - startTime;
    
    // 4. دمج النتائج
    startTime = Date.now();
    const mergedResult = await this.resultMerger.mergeResults(
      visionResult,
      ocrResult
    );
    this.performanceMetrics.mergeTime = Date.now() - startTime;
    
    return {
      finalText: mergedResult.finalText,
      blocks: mergedResult.blocks,
      confidence: mergedResult.confidence,
      sources: {
        ocr: ocrResult,
        vision: visionResult,
        merged: mergedResult
      },
      processingTime: 
        this.performanceMetrics.ocrTime +
        this.performanceMetrics.visionTime +
        this.performanceMetrics.mergeTime,
      success: mergedResult.success
    };
  }
  
  /**
   * تنفيذ Vision أولاً
   */
  private async executeVisionFirst(
    imageData: string | Blob,
    options?: EngineOptions
  ): Promise<HybridProcessingResult> {
    
    let startTime = Date.now();
    
    // 1. تنفيذ Vision
    const visionResult = await this.visionProcessor.processImage(imageData);
    this.performanceMetrics.visionTime = Date.now() - startTime;
    
    // 2. فحص جودة Vision
    if (visionResult.confidence >= 0.85 && visionResult.success) {
      // Vision جيد، لا حاجة للـ OCR
      return {
        finalText: visionResult.extractedText,
        blocks: [],
        confidence: visionResult.confidence,
        sources: {
          ocr: null,
          vision: visionResult,
          merged: null
        },
        processingTime: this.performanceMetrics.visionTime,
        success: true
      };
    }
    
    // 3. تنفيذ OCR كمساعد
    startTime = Date.now();
    const ocrResult = await this.ocrProcessor.processImage(imageData);
    this.performanceMetrics.ocrTime = Date.now() - startTime;
    
    // 4. دمج النتائج
    startTime = Date.now();
    const mergedResult = await this.resultMerger.mergeResults(
      visionResult,
      ocrResult
    );
    this.performanceMetrics.mergeTime = Date.now() - startTime;
    
    return {
      finalText: mergedResult.finalText,
      blocks: mergedResult.blocks,
      confidence: mergedResult.confidence,
      sources: {
        ocr: ocrResult,
        vision: visionResult,
        merged: mergedResult
      },
      processingTime:
        this.performanceMetrics.visionTime +
        this.performanceMetrics.ocrTime +
        this.performanceMetrics.mergeTime,
      success: mergedResult.success
    };
  }
  
  /**
   * تنفيذ متوازي
   */
  private async executeParallel(
    imageData: string | Blob
  ): Promise<HybridProcessingResult> {
    
    const startTime = Date.now();
    
    // 1. تنفيذ Vision و OCR معاً
    const [visionResult, ocrResult] = await Promise.all([
      this.visionProcessor.processImage(imageData),
      this.ocrProcessor.processImage(imageData)
    ]);
    
    const parallelTime = Date.now() - startTime;
    this.performanceMetrics.visionTime = parallelTime;
    this.performanceMetrics.ocrTime = parallelTime;
    
    // 2. دمج النتائج
    const mergeStart = Date.now();
    const mergedResult = await this.resultMerger.mergeResults(
      visionResult,
      ocrResult
    );
    this.performanceMetrics.mergeTime = Date.now() - mergeStart;
    
    return {
      finalText: mergedResult.finalText,
      blocks: mergedResult.blocks,
      confidence: mergedResult.confidence,
      sources: {
        ocr: ocrResult,
        vision: visionResult,
        merged: mergedResult
      },
      processingTime: parallelTime + this.performanceMetrics.mergeTime,
      success: mergedResult.success
    };
  }
  
  /**
   * تنفيذ تكيفي
   */
  private async executeAdaptive(
    imageData: string | Blob,
    options?: EngineOptions
  ): Promise<HybridProcessingResult> {
    
    // محاولة OCR أولاً (أسرع)
    let startTime = Date.now();
    const ocrResult = await this.ocrProcessor.processImage(imageData);
    this.performanceMetrics.ocrTime = Date.now() - startTime;
    
    // إذا كان OCR ممتاز، نكتفي به
    if (ocrResult.confidence >= 0.9 && ocrResult.success) {
      return {
        finalText: ocrResult.fullText,
        blocks: ocrResult.blocks,
        confidence: ocrResult.confidence,
        sources: {
          ocr: ocrResult,
          vision: null,
          merged: null
        },
        processingTime: this.performanceMetrics.ocrTime,
        success: true
      };
    }
    
    // إذا كان ضعيف جداً، نجرب Vision
    if (ocrResult.confidence < 0.5 || !ocrResult.success) {
      startTime = Date.now();
      const visionResult = await this.visionProcessor.processImage(imageData);
      this.performanceMetrics.visionTime = Date.now() - startTime;
      
      if (visionResult.confidence > ocrResult.confidence) {
        return {
          finalText: visionResult.extractedText,
          blocks: [],
          confidence: visionResult.confidence,
          sources: {
            ocr: ocrResult,
            vision: visionResult,
            merged: null
          },
          processingTime:
            this.performanceMetrics.ocrTime +
            this.performanceMetrics.visionTime,
          success: visionResult.success
        };
      }
    }
    
    // في الحالات المتوسطة، ندمج
    startTime = Date.now();
    const visionResult = await this.visionProcessor.processImage(imageData);
    this.performanceMetrics.visionTime = Date.now() - startTime;
    
    const mergeStart = Date.now();
    const mergedResult = await this.resultMerger.mergeResults(
      visionResult,
      ocrResult
    );
    this.performanceMetrics.mergeTime = Date.now() - mergeStart;
    
    return {
      finalText: mergedResult.finalText,
      blocks: mergedResult.blocks,
      confidence: mergedResult.confidence,
      sources: {
        ocr: ocrResult,
        vision: visionResult,
        merged: mergedResult
      },
      processingTime:
        this.performanceMetrics.ocrTime +
        this.performanceMetrics.visionTime +
        this.performanceMetrics.mergeTime,
      success: mergedResult.success
    };
  }
  
  // ============================================
  // 6. معالجة الأخطاء
  // ============================================
  
  /**
   * معالجة الأخطاء
   */
  private handleError(
    error: any,
    startTime: number
  ): HybridProcessingResult {
    
    return {
      finalText: '',
      blocks: [],
      confidence: 0,
      sources: {
        ocr: null,
        vision: null,
        merged: null
      },
      processingTime: Date.now() - startTime,
      success: false,
      error: {
        code: 'HYBRID_ENGINE_ERROR',
        message: error.message,
        timestamp: new Date().toISOString()
      }
    };
  }
  
  // ============================================
  // 7. دوال مساعدة
  // ============================================
  
  /**
   * الحصول على الأداء
   */
  getPerformanceMetrics(): PerformanceMetrics {
    return { ...this.performanceMetrics };
  }
  
  /**
   * إعادة تعيين الأداء
   */
  resetMetrics(): void {
    this.initializeMetrics();
  }
  
  /**
   * فحص صحة المحركات
   */
  async checkEnginesHealth(): Promise<{
    vision: boolean;
    ocr: boolean;
    overall: boolean;
  }> {
    
    const visionHealth = await this.visionProcessor
      .checkProviderAvailability('claude')
      .catch(() => false);
    
    const ocrHealth = await this.ocrProcessor
      .checkProviderAvailability('google-vision')
      .catch(() => false);
    
    return {
      vision: visionHealth,
      ocr: ocrHealth,
      overall: visionHealth || ocrHealth
    };
  }
  
  /**
   * الحصول على إحصائيات المزودين
   */
  getProvidersStats(): {
    vision: Record<string, number>;
    ocr: Record<string, number>;
  } {
    
    return {
      vision: this.visionProcessor.getProvidersStats(),
      ocr: this.ocrProcessor.getProvidersStats()
    };
  }
  
  /**
   * تقييم فعالية الاستراتيجية
   */
  evaluateStrategy(
    result: HybridProcessingResult,
    expectedTime: number
  ): {
    efficiency: number;
    quality: number;
    recommendation: string;
  } {
    
    const timeEfficiency = Math.min(
      1,
      expectedTime / result.processingTime
    );
    
    const quality = result.confidence;
    
    let recommendation = '';
    
    if (timeEfficiency < 0.5 && quality > 0.8) {
      recommendation = 'Good quality but slow. Consider caching.';
    } else if (timeEfficiency > 0.8 && quality < 0.6) {
      recommendation = 'Fast but low quality. Consider parallel strategy.';
    } else if (timeEfficiency > 0.7 && quality > 0.8) {
      recommendation = 'Optimal performance. Keep current strategy.';
    } else {
      recommendation = 'Consider adaptive strategy for better balance.';
    }
    
    return {
      efficiency: timeEfficiency,
      quality,
      recommendation
    };
  }
  
  /**
   * اختيار أفضل استراتيجية تلقائياً
   */
  async selectOptimalStrategy(
    imageData: string | Blob,
    analysis: ImageAnalysisResult
  ): Promise<ProcessingStrategy> {
    
    // بناءً على التحليل
    const { contentType, quality, complexity } = analysis;
    
    // نص واضح مطبوع
    if (
      contentType === 'printed_text' &&
      quality.overall === 'excellent' &&
      complexity.level === 'simple'
    ) {
      return 'ocr-only';
    }
    
    // خط يدوي أو معادلات
    if (
      contentType === 'handwritten' ||
      contentType === 'math_equations'
    ) {
      return 'vision-first';
    }
    
    // محتوى معقد
    if (complexity.level === 'very_complex') {
      return 'parallel';
    }
    
    // جودة متوسطة
    if (quality.overall === 'acceptable') {
      return 'parallel';
    }
    
    // افتراضي
    return 'adaptive';
  }
}

// ============================================
// 8. دوال مساعدة عامة
// ============================================

/**
 * إنشاء محرك هجين
 */
export function createHybridEngine(): HybridEngine {
  return new HybridEngine();
}

/**
 * معالجة سريعة باستراتيجية تلقائية
 */
export async function quickHybridProcess(
  imageData: string | Blob,
  analysis: ImageAnalysisResult
): Promise<HybridProcessingResult> {
  
  const engine = createHybridEngine();
  return engine.processImage(imageData, analysis);
}

/**
 * معالجة مع استراتيجية محددة
 */
export async function processWithStrategy(
  imageData: string | Blob,
  analysis: ImageAnalysisResult,
  strategy: ProcessingStrategy
): Promise<HybridProcessingResult> {
  
  const engine = createHybridEngine();
  return engine.processImage(imageData, analysis, { strategy });
}

// ============================================
// 9. التصدير
// ============================================

export default HybridEngine;
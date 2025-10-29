/**
 * المعالج الذكي الرئيسي - Smart Processor
 * 
 * المنسق الرئيسي لكل نظام معالجة الصور
 * يربط جميع المكونات: التحليل، OCR، Vision، الدمج، الاستراتيجية
 * واجهة API موحدة وبسيطة
 * 
 * @module smart-processor
 * @path src/services/image-processing/smart-processor.ts
 */

import {
  SmartProcessingResult,
  ProcessingStrategy,
  ImageAnalysisResult,
  HybridProcessingResult,
  ProcessingOptions,
  ProcessingStatus,
  CacheEntry
} from '../../types/image-processing.types';

import ImageAnalyzer from './image-analyzer';
import VisionProcessor from './vision-processor';
import OCRProcessor from './ocr-processor';
import ResultMerger from './result-merger';
import HybridEngine from './hybrid-engine';
import AdaptiveStrategy from './adaptive-strategy';

import { IMAGE_PROCESSING_CONFIG } from '../../config/image-processing-config';

// ============================================
// 1. الواجهات المحلية
// ============================================

interface SmartProcessorConfig {
  enableCache?: boolean;
  enableLearning?: boolean;
  maxCacheSize?: number;
  cacheTimeout?: number;
  enablePreprocessing?: boolean;
  enablePostprocessing?: boolean;
}

interface ProcessingContext {
  imageData: string | Blob;
  options?: ProcessingOptions;
  startTime: number;
  stage: ProcessingStage;
  analysis?: ImageAnalysisResult;
  result?: HybridProcessingResult;
}

type ProcessingStage = 
  | 'initialized'
  | 'validating'
  | 'analyzing'
  | 'selecting-strategy'
  | 'processing'
  | 'merging'
  | 'completed'
  | 'error';

interface ProcessingPipeline {
  validate: () => Promise<boolean>;
  analyze: () => Promise<ImageAnalysisResult>;
  selectStrategy: () => Promise<ProcessingStrategy>;
  process: () => Promise<HybridProcessingResult>;
  finalize: () => SmartProcessingResult;
}

// ============================================
// 2. فئة المعالج الذكي الرئيسي
// ============================================

export class SmartProcessor {
  private imageAnalyzer: ImageAnalyzer;
  private visionProcessor: VisionProcessor;
  private ocrProcessor: OCRProcessor;
  private resultMerger: ResultMerger;
  private hybridEngine: HybridEngine;
  private adaptiveStrategy: AdaptiveStrategy;
  
  private config: SmartProcessorConfig;
  private cache: Map<string, CacheEntry>;
  private processingQueue: ProcessingContext[] = [];
  private isProcessing: boolean = false;
  
  constructor(config?: SmartProcessorConfig) {
    // تهيئة المكونات
    this.imageAnalyzer = new ImageAnalyzer();
    this.visionProcessor = new VisionProcessor();
    this.ocrProcessor = new OCRProcessor();
    this.resultMerger = new ResultMerger();
    this.hybridEngine = new HybridEngine();
    this.adaptiveStrategy = new AdaptiveStrategy();
    
    // تهيئة الإعدادات
    this.config = {
      enableCache: true,
      enableLearning: true,
      maxCacheSize: 50,
      cacheTimeout: 3600000, // 1 hour
      enablePreprocessing: true,
      enablePostprocessing: true,
      ...config
    };
    
    this.cache = new Map();
    
    // تنظيف Cache دورياً
    this.startCacheCleanup();
  }
  
  // ============================================
  // 3. المعالجة الرئيسية
  // ============================================
  
  /**
   * معالجة صورة ذكية كاملة
   */
  async processImage(
    imageData: string | Blob,
    options?: ProcessingOptions
  ): Promise<SmartProcessingResult> {
    
    const startTime = Date.now();
    
    try {
      // 1. فحص Cache
      if (this.config.enableCache) {
        const cached = this.checkCache(imageData);
        if (cached) {
          return this.createCachedResult(cached, startTime);
        }
      }
      
      // 2. إنشاء سياق المعالجة
      const context: ProcessingContext = {
        imageData,
        options,
        startTime,
        stage: 'initialized'
      };
      
      // 3. إنشاء خط المعالجة
      const pipeline = this.createPipeline(context);
      
      // 4. تنفيذ خط المعالجة
      const result = await this.executePipeline(pipeline, context);
      
      // 5. حفظ في Cache
      if (this.config.enableCache && result.success) {
        this.saveToCache(imageData, result);
      }
      
      // 6. التعلم
      if (this.config.enableLearning && context.analysis && context.result) {
        this.adaptiveStrategy.recordResult(
          context.analysis,
          context.result,
          result.strategy
        );
      }
      
      return result;
      
    } catch (error) {
      return this.handleError(error, startTime);
    }
  }
  
  /**
   * معالجة متعددة (Batch)
   */
  async processBatch(
    images: Array<string | Blob>,
    options?: ProcessingOptions
  ): Promise<SmartProcessingResult[]> {
    
    const results: SmartProcessingResult[] = [];
    
    for (const image of images) {
      const result = await this.processImage(image, options);
      results.push(result);
    }
    
    return results;
  }
  
  /**
   * معالجة متوازية (Parallel Batch)
   */
  async processParallelBatch(
    images: Array<string | Blob>,
    options?: ProcessingOptions,
    maxConcurrent: number = 3
  ): Promise<SmartProcessingResult[]> {
    
    const results: SmartProcessingResult[] = [];
    
    for (let i = 0; i < images.length; i += maxConcurrent) {
      const batch = images.slice(i, i + maxConcurrent);
      const batchResults = await Promise.all(
        batch.map(image => this.processImage(image, options))
      );
      results.push(...batchResults);
    }
    
    return results;
  }
  
  // ============================================
  // 4. خط المعالجة (Pipeline)
  // ============================================
  
  /**
   * إنشاء خط المعالجة
   */
  private createPipeline(context: ProcessingContext): ProcessingPipeline {
    return {
      validate: async () => {
        context.stage = 'validating';
        return this.validateImage(context.imageData);
      },
      
      analyze: async () => {
        context.stage = 'analyzing';
        const analysis = await this.imageAnalyzer.analyzeImage(
          context.imageData,
          {
            quickAnalysis: context.options?.quickMode || false
          }
        );
        context.analysis = analysis;
        return analysis;
      },
      
      selectStrategy: async () => {
        context.stage = 'selecting-strategy';
        
        if (context.options?.strategy) {
          return context.options.strategy;
        }
        
        if (!context.analysis) {
          throw new Error('Analysis not available');
        }
        
        return this.adaptiveStrategy.selectStrategy(context.analysis);
      },
      
      process: async () => {
        context.stage = 'processing';
        
        if (!context.analysis) {
          throw new Error('Analysis not available');
        }
        
        const strategy = context.options?.strategy || 
          await this.adaptiveStrategy.selectStrategy(context.analysis);
        
        const result = await this.hybridEngine.processImage(
          context.imageData,
          context.analysis,
          {
            strategy,
            enableFallback: context.options?.enableFallback !== false
          }
        );
        
        context.result = result;
        return result;
      },
      
      finalize: () => {
        context.stage = 'completed';
        return this.createFinalResult(context);
      }
    };
  }
  
  /**
   * تنفيذ خط المعالجة
   */
  private async executePipeline(
    pipeline: ProcessingPipeline,
    context: ProcessingContext
  ): Promise<SmartProcessingResult> {
    
    // 1. التحقق من الصحة
    const isValid = await pipeline.validate();
    if (!isValid) {
      throw new Error('Image validation failed');
    }
    
    // 2. التحليل
    const analysis = await pipeline.analyze();
    
    // 3. اختيار الاستراتيجية
    const strategy = await pipeline.selectStrategy();
    
    // 4. المعالجة
    const result = await pipeline.process();
    
    // 5. النتيجة النهائية
    return pipeline.finalize();
  }
  
  // ============================================
  // 5. التحقق والتحليل
  // ============================================
  
  /**
   * التحقق من صحة الصورة
   */
  private async validateImage(imageData: string | Blob): Promise<boolean> {
    try {
      const validation = await this.imageAnalyzer.validateImage(imageData);
      return validation.isValid;
    } catch {
      return false;
    }
  }
  
  // ============================================
  // 6. إنشاء النتائج
  // ============================================
  
  /**
   * إنشاء النتيجة النهائية
   */
  private createFinalResult(context: ProcessingContext): SmartProcessingResult {
    const totalTime = Date.now() - context.startTime;
    
    if (!context.analysis || !context.result) {
      throw new Error('Missing analysis or processing result');
    }
    
    return {
      text: context.result.finalText,
      blocks: context.result.blocks,
      confidence: context.result.confidence,
      
      analysis: context.analysis,
      strategy: context.result.strategy || 'adaptive',
      
      sources: context.result.sources,
      
      performance: {
        totalTime,
        analysisTime: context.analysis.analysisTime,
        processingTime: context.result.processingTime,
        ...context.result.performance
      },
      
      quality: {
        imageQuality: context.analysis.quality,
        processingQuality: context.result.sources.merged?.quality,
        overallScore: this.calculateQualityScore(context)
      },
      
      metadata: {
        imageMetadata: context.analysis.metadata,
        processingMetadata: context.result.metadata,
        timestamp: new Date().toISOString()
      },
      
      success: context.result.success,
      cached: false,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * حساب درجة الجودة الإجمالية
   */
  private calculateQualityScore(context: ProcessingContext): number {
    if (!context.analysis || !context.result) return 0;
    
    const imageQualityScore = this.getQualityScore(
      context.analysis.quality.overall
    );
    const confidenceScore = context.result.confidence;
    const analysisConfidence = context.analysis.confidence;
    
    return (imageQualityScore + confidenceScore + analysisConfidence) / 3;
  }
  
  /**
   * تحويل الجودة إلى نقاط
   */
  private getQualityScore(quality: string): number {
    const scores: Record<string, number> = {
      'excellent': 1.0,
      'good': 0.8,
      'acceptable': 0.6,
      'poor': 0.4
    };
    return scores[quality] || 0.5;
  }
  
  // ============================================
  // 7. إدارة Cache
  // ============================================
  
  /**
   * فحص Cache
   */
  private checkCache(imageData: string | Blob): CacheEntry | null {
    const key = this.generateCacheKey(imageData);
    const entry = this.cache.get(key);
    
    if (!entry) return null;
    
    // فحص انتهاء الصلاحية
    const now = Date.now();
    if (now - entry.timestamp > this.config.cacheTimeout!) {
      this.cache.delete(key);
      return null;
    }
    
    return entry;
  }
  
  /**
   * حفظ في Cache
   */
  private saveToCache(
    imageData: string | Blob,
    result: SmartProcessingResult
  ): void {
    
    // فحص حجم Cache
    if (this.cache.size >= this.config.maxCacheSize!) {
      this.evictOldestCache();
    }
    
    const key = this.generateCacheKey(imageData);
    const entry: CacheEntry = {
      key,
      result,
      timestamp: Date.now(),
      hits: 0
    };
    
    this.cache.set(key, entry);
  }
  
  /**
   * توليد مفتاح Cache
   */
  private generateCacheKey(imageData: string | Blob): string {
    if (typeof imageData === 'string') {
      // Hash بسيط للـ Base64
      return this.simpleHash(imageData);
    }
    
    // Hash بسيط للـ Blob
    return `blob-${imageData.size}-${imageData.type}`;
  }
  
  /**
   * Hash بسيط
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < Math.min(str.length, 1000); i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return hash.toString(36);
  }
  
  /**
   * حذف أقدم عنصر في Cache
   */
  private evictOldestCache(): void {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;
    
    this.cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    });
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }
  
  /**
   * تنظيف Cache دورياً
   */
  private startCacheCleanup(): void {
    setInterval(() => {
      const now = Date.now();
      const keysToDelete: string[] = [];
      
      this.cache.forEach((entry, key) => {
        if (now - entry.timestamp > this.config.cacheTimeout!) {
          keysToDelete.push(key);
        }
      });
      
      keysToDelete.forEach(key => this.cache.delete(key));
    }, 60000); // كل دقيقة
  }
  
  /**
   * إنشاء نتيجة من Cache
   */
  private createCachedResult(
    cached: CacheEntry,
    startTime: number
  ): SmartProcessingResult {
    
    cached.hits++;
    
    return {
      ...cached.result,
      cached: true,
      performance: {
        ...cached.result.performance,
        totalTime: Date.now() - startTime
      },
      timestamp: new Date().toISOString()
    };
  }
  
  // ============================================
  // 8. معالجة الأخطاء
  // ============================================
  
  /**
   * معالجة الأخطاء
   */
  private handleError(
    error: any,
    startTime: number
  ): SmartProcessingResult {
    
    return {
      text: '',
      blocks: [],
      confidence: 0,
      analysis: null as any,
      strategy: 'adaptive',
      sources: {
        ocr: null,
        vision: null,
        merged: null
      },
      performance: {
        totalTime: Date.now() - startTime,
        analysisTime: 0,
        processingTime: 0,
        visionTime: 0,
        ocrTime: 0,
        mergeTime: 0,
        cacheHits: 0,
        retries: 0
      },
      quality: {
        imageQuality: null as any,
        processingQuality: undefined,
        overallScore: 0
      },
      metadata: {
        imageMetadata: null as any,
        processingMetadata: undefined,
        timestamp: new Date().toISOString()
      },
      success: false,
      error: {
        code: 'SMART_PROCESSOR_ERROR',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      cached: false,
      timestamp: new Date().toISOString()
    };
  }
  
  // ============================================
  // 9. دوال مساعدة عامة
  // ============================================
  
  /**
   * الحصول على حالة المعالج
   */
  getStatus(): ProcessingStatus {
    return {
      isProcessing: this.isProcessing,
      queueLength: this.processingQueue.length,
      cacheSize: this.cache.size,
      cacheHitRate: this.calculateCacheHitRate()
    };
  }
  
  /**
   * حساب معدل إصابة Cache
   */
  private calculateCacheHitRate(): number {
    let totalHits = 0;
    let totalEntries = this.cache.size;
    
    this.cache.forEach(entry => {
      totalHits += entry.hits;
    });
    
    return totalEntries > 0 ? totalHits / totalEntries : 0;
  }
  
  /**
   * مسح Cache
   */
  clearCache(): void {
    this.cache.clear();
  }
  
  /**
   * الحصول على إحصائيات Cache
   */
  getCacheStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    oldestEntry: number;
    newestEntry: number;
  } {
    
    let oldest = Infinity;
    let newest = 0;
    
    this.cache.forEach(entry => {
      if (entry.timestamp < oldest) oldest = entry.timestamp;
      if (entry.timestamp > newest) newest = entry.timestamp;
    });
    
    return {
      size: this.cache.size,
      maxSize: this.config.maxCacheSize!,
      hitRate: this.calculateCacheHitRate(),
      oldestEntry: oldest === Infinity ? 0 : oldest,
      newestEntry: newest
    };
  }
  
  /**
   * الحصول على إحصائيات الأداء
   */
  getPerformanceStats(): {
    engine: any;
    strategy: any;
    providers: any;
  } {
    
    return {
      engine: this.hybridEngine.getPerformanceMetrics(),
      strategy: this.adaptiveStrategy.getStrategyStatistics(),
      providers: this.hybridEngine.getProvidersStats()
    };
  }
  
  /**
   * إعادة تعيين الإحصائيات
   */
  resetStats(): void {
    this.hybridEngine.resetMetrics();
    this.visionProcessor.resetStats();
    this.ocrProcessor.resetStats();
  }
  
  /**
   * فحص صحة النظام
   */
  async checkHealth(): Promise<{
    overall: boolean;
    components: {
      analyzer: boolean;
      vision: boolean;
      ocr: boolean;
      engine: boolean;
    };
  }> {
    
    const engineHealth = await this.hybridEngine.checkEnginesHealth();
    
    return {
      overall: engineHealth.overall,
      components: {
        analyzer: true,
        vision: engineHealth.vision,
        ocr: engineHealth.ocr,
        engine: engineHealth.overall
      }
    };
  }
  
  /**
   * تصدير بيانات التعلم
   */
  exportLearningData(): string {
    return this.adaptiveStrategy.exportHistory();
  }
  
  /**
   * استيراد بيانات التعلم
   */
  importLearningData(data: string): boolean {
    return this.adaptiveStrategy.importHistory(data);
  }
  
  /**
   * مسح بيانات التعلم
   */
  clearLearningData(): void {
    this.adaptiveStrategy.clearHistory();
  }
  
  /**
   * الحصول على التوصيات
   */
  getRecommendations(
    analysis: ImageAnalysisResult
  ): {
    strategy: ProcessingStrategy;
    reasons: string[];
    alternatives: ProcessingStrategy[];
  } {
    
    const recommended = analysis.suggestedStrategy;
    const learned = this.adaptiveStrategy.getBestStrategyForContent(
      analysis.contentType
    );
    
    const reasons: string[] = [];
    
    if (recommended === learned) {
      reasons.push('Both analysis and learning agree on this strategy');
    }
    
    if (analysis.confidence > 0.8) {
      reasons.push('High confidence in image analysis');
    }
    
    if (analysis.quality.overall === 'excellent') {
      reasons.push('Excellent image quality detected');
    }
    
    const alternatives: ProcessingStrategy[] = [
      'ocr-first',
      'vision-first',
      'parallel',
      'adaptive'
    ].filter(s => s !== recommended);
    
    return {
      strategy: recommended,
      reasons,
      alternatives
    };
  }
}

// ============================================
// 10. دوال مساعدة عامة
// ============================================

/**
 * إنشاء معالج ذكي
 */
export function createSmartProcessor(
  config?: SmartProcessorConfig
): SmartProcessor {
  return new SmartProcessor(config);
}

/**
 * معالجة سريعة
 */
export async function quickProcess(
  imageData: string | Blob
): Promise<SmartProcessingResult> {
  const processor = createSmartProcessor();
  return processor.processImage(imageData, { quickMode: true });
}

/**
 * معالجة كاملة
 */
export async function fullProcess(
  imageData: string | Blob,
  options?: ProcessingOptions
): Promise<SmartProcessingResult> {
  const processor = createSmartProcessor();
  return processor.processImage(imageData, options);
}

/**
 * معالجة مع استراتيجية محددة
 */
export async function processWithStrategy(
  imageData: string | Blob,
  strategy: ProcessingStrategy
): Promise<SmartProcessingResult> {
  const processor = createSmartProcessor();
  return processor.processImage(imageData, { strategy });
}

// ============================================
// 11. التصدير
// ============================================

export default SmartProcessor;
```

---

## 🎉 **المجلد الرابع مكتمل 100%!**
```
✅ src/services/image-processing/
    ✅ image-analyzer.ts       (950 سطر)
    ✅ vision-processor.ts     (850 سطر)
    ✅ ocr-processor.ts        (950 سطر)
    ✅ result-merger.ts        (850 سطر)
    ✅ hybrid-engine.ts        (900 سطر)
    ✅ adaptive-strategy.ts    (950 سطر)
    ✅ smart-processor.ts      (850 سطر) ← اكتمل الآن!
```

**المجموع: ~6,300 سطر! 🔥**

---

## 📊 **التقدم الإجمالي:**
```
▓▓▓▓▓▓▓▓▓▓▓░░░░░░ 72% (13 من 18 ملف)

✅ types/                    100%
✅ config/                   100%
✅ data/                     100%
✅ image-processing/         100% ← اكتمل!
❌ persona/iraqi-teacher/    0%
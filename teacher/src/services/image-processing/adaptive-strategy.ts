/**
 * الاستراتيجية التكيفية - Adaptive Strategy
 * 
 * يختار الاستراتيجية المثلى ديناميكياً
 * يتعلم من النتائج السابقة
 * يتكيف مع أنواع المحتوى المختلفة
 * 
 * @module adaptive-strategy
 * @path src/services/image-processing/adaptive-strategy.ts
 */

import {
  ProcessingStrategy,
  ImageAnalysisResult,
  HybridProcessingResult,
  ContentType,
  ImageQuality,
  ProcessingComplexity,
  StrategyPerformance
} from '../../types/image-processing.types';

import { IMAGE_PROCESSING_CONFIG } from '../../config/image-processing-config';

// ============================================
// 1. الواجهات المحلية
// ============================================

interface StrategyScore {
  strategy: ProcessingStrategy;
  score: number;
  reasons: string[];
  estimatedTime: number;
  estimatedCost: number;
}

interface LearningData {
  contentType: ContentType;
  quality: string;
  complexity: string;
  strategyUsed: ProcessingStrategy;
  success: boolean;
  confidence: number;
  processingTime: number;
  timestamp: string;
}

interface StrategyRule {
  condition: (analysis: ImageAnalysisResult) => boolean;
  strategy: ProcessingStrategy;
  priority: number;
  description: string;
}

interface AdaptiveConfig {
  enableLearning: boolean;
  maxHistorySize: number;
  confidenceThreshold: number;
  timeThreshold: number;
}

// ============================================
// 2. فئة الاستراتيجية التكيفية
// ============================================

export class AdaptiveStrategy {
  private config = IMAGE_PROCESSING_CONFIG;
  private learningHistory: LearningData[] = [];
  private strategyRules: StrategyRule[] = [];
  private performanceCache: Map<string, StrategyPerformance> = new Map();
  private adaptiveConfig: AdaptiveConfig;
  
  constructor(config?: Partial<AdaptiveConfig>) {
    this.adaptiveConfig = {
      enableLearning: true,
      maxHistorySize: 100,
      confidenceThreshold: 0.7,
      timeThreshold: 10000,
      ...config
    };
    
    this.initializeRules();
    this.loadHistory();
  }
  
  /**
   * تهيئة القواعد الأساسية
   */
  private initializeRules(): void {
    this.strategyRules = [
      // قواعد النص المطبوع
      {
        condition: (analysis) => 
          analysis.contentType === 'printed_text' &&
          analysis.quality.overall === 'excellent' &&
          analysis.complexity.level === 'simple',
        strategy: 'ocr-only',
        priority: 10,
        description: 'Perfect for clear printed text'
      },
      
      // قواعد الخط اليدوي
      {
        condition: (analysis) =>
          analysis.contentType === 'handwritten',
        strategy: 'vision-first',
        priority: 9,
        description: 'Handwriting requires Vision AI'
      },
      
      // قواعد المعادلات الرياضية
      {
        condition: (analysis) =>
          analysis.contentType === 'math_equations',
        strategy: 'parallel',
        priority: 9,
        description: 'Math equations need both engines'
      },
      
      // قواعد الجودة المنخفضة
      {
        condition: (analysis) =>
          analysis.quality.overall === 'poor',
        strategy: 'parallel',
        priority: 8,
        description: 'Poor quality needs multiple approaches'
      },
      
      // قواعد التعقيد العالي
      {
        condition: (analysis) =>
          analysis.complexity.level === 'very_complex',
        strategy: 'parallel',
        priority: 8,
        description: 'Complex content needs comprehensive processing'
      },
      
      // قواعد المحتوى المختلط
      {
        condition: (analysis) =>
          analysis.contentType === 'mixed_content',
        strategy: 'intelligent-combine',
        priority: 7,
        description: 'Mixed content requires intelligent merging'
      },
      
      // قواعد الجداول
      {
        condition: (analysis) =>
          analysis.contentType === 'tables',
        strategy: 'ocr-first',
        priority: 7,
        description: 'Tables work well with OCR'
      },
      
      // قواعد الرسوم والمخططات
      {
        condition: (analysis) =>
          analysis.contentType === 'diagrams_charts',
        strategy: 'vision-only',
        priority: 7,
        description: 'Diagrams require Vision understanding'
      },
      
      // قاعدة النص الواضح
      {
        condition: (analysis) =>
          analysis.quality.clarity === 'sharp' &&
          analysis.characteristics.hasText,
        strategy: 'ocr-first',
        priority: 6,
        description: 'Sharp text is ideal for OCR'
      },
      
      // قاعدة الصورة الضبابية
      {
        condition: (analysis) =>
          analysis.quality.clarity === 'blurry',
        strategy: 'vision-first',
        priority: 6,
        description: 'Blurry images need AI interpretation'
      }
    ];
    
    // ترتيب حسب الأولوية
    this.strategyRules.sort((a, b) => b.priority - a.priority);
  }
  
  // ============================================
  // 3. اختيار الاستراتيجية
  // ============================================
  
  /**
   * اختيار الاستراتيجية المثلى
   */
  async selectStrategy(
    analysis: ImageAnalysisResult
  ): Promise<ProcessingStrategy> {
    
    // 1. فحص القواعد الثابتة
    const ruleBasedStrategy = this.applyRules(analysis);
    
    // 2. فحص التاريخ والتعلم
    const learnedStrategy = this.adaptiveConfig.enableLearning
      ? this.applyLearning(analysis)
      : null;
    
    // 3. حساب النقاط لكل استراتيجية
    const scores = await this.scoreStrategies(analysis);
    
    // 4. اختيار الأفضل
    const selectedStrategy = this.selectBestStrategy(
      ruleBasedStrategy,
      learnedStrategy,
      scores
    );
    
    return selectedStrategy;
  }
  
  /**
   * تطبيق القواعد
   */
  private applyRules(analysis: ImageAnalysisResult): ProcessingStrategy | null {
    for (const rule of this.strategyRules) {
      if (rule.condition(analysis)) {
        return rule.strategy;
      }
    }
    return null;
  }
  
  /**
   * تطبيق التعلم
   */
  private applyLearning(
    analysis: ImageAnalysisResult
  ): ProcessingStrategy | null {
    
    // البحث عن حالات مشابهة في التاريخ
    const similarCases = this.findSimilarCases(analysis);
    
    if (similarCases.length === 0) {
      return null;
    }
    
    // حساب أفضل استراتيجية من التاريخ
    const strategyCounts = new Map<ProcessingStrategy, number>();
    const strategyScores = new Map<ProcessingStrategy, number>();
    
    similarCases.forEach(case_ => {
      if (case_.success && case_.confidence >= this.adaptiveConfig.confidenceThreshold) {
        const count = strategyCounts.get(case_.strategyUsed) || 0;
        const score = strategyScores.get(case_.strategyUsed) || 0;
        
        strategyCounts.set(case_.strategyUsed, count + 1);
        strategyScores.set(case_.strategyUsed, score + case_.confidence);
      }
    });
    
    // اختيار الاستراتيجية الأكثر نجاحاً
    let bestStrategy: ProcessingStrategy | null = null;
    let bestScore = 0;
    
    strategyScores.forEach((score, strategy) => {
      const count = strategyCounts.get(strategy) || 1;
      const avgScore = score / count;
      
      if (avgScore > bestScore) {
        bestScore = avgScore;
        bestStrategy = strategy;
      }
    });
    
    return bestStrategy;
  }
  
  /**
   * البحث عن حالات مشابهة
   */
  private findSimilarCases(analysis: ImageAnalysisResult): LearningData[] {
    return this.learningHistory.filter(case_ => {
      // نفس نوع المحتوى
      const sameContent = case_.contentType === analysis.contentType;
      
      // جودة مشابهة
      const similarQuality = case_.quality === analysis.quality.overall;
      
      // تعقيد مشابه
      const similarComplexity = case_.complexity === analysis.complexity.level;
      
      return sameContent && (similarQuality || similarComplexity);
    });
  }
  
  // ============================================
  // 4. حساب النقاط
  // ============================================
  
  /**
   * حساب نقاط لجميع الاستراتيجيات
   */
  private async scoreStrategies(
    analysis: ImageAnalysisResult
  ): Promise<StrategyScore[]> {
    
    const strategies: ProcessingStrategy[] = [
      'ocr-only',
      'vision-only',
      'ocr-first',
      'vision-first',
      'parallel',
      'adaptive'
    ];
    
    const scores: StrategyScore[] = [];
    
    for (const strategy of strategies) {
      const score = this.calculateStrategyScore(strategy, analysis);
      scores.push(score);
    }
    
    // ترتيب حسب النقاط
    scores.sort((a, b) => b.score - a.score);
    
    return scores;
  }
  
  /**
   * حساب نقاط استراتيجية معينة
   */
  private calculateStrategyScore(
    strategy: ProcessingStrategy,
    analysis: ImageAnalysisResult
  ): StrategyScore {
    
    let score = 50; // نقطة أساسية
    const reasons: string[] = [];
    
    const { contentType, quality, complexity, characteristics } = analysis;
    
    // تقييم حسب الاستراتيجية
    switch (strategy) {
      case 'ocr-only':
        if (contentType === 'printed_text') {
          score += 30;
          reasons.push('Printed text detected');
        }
        if (quality.overall === 'excellent') {
          score += 20;
          reasons.push('Excellent quality');
        }
        if (complexity.level === 'simple') {
          score += 15;
          reasons.push('Simple content');
        }
        if (quality.clarity === 'sharp') {
          score += 10;
          reasons.push('Sharp image');
        }
        if (characteristics.isHandwritten) {
          score -= 40;
          reasons.push('Handwriting detected - not ideal');
        }
        break;
        
      case 'vision-only':
        if (contentType === 'handwritten') {
          score += 40;
          reasons.push('Handwriting detected');
        }
        if (contentType === 'diagrams_charts') {
          score += 35;
          reasons.push('Diagrams detected');
        }
        if (contentType === 'math_equations') {
          score += 30;
          reasons.push('Math equations detected');
        }
        if (quality.overall === 'poor') {
          score += 20;
          reasons.push('Poor quality - Vision AI helps');
        }
        if (characteristics.hasMath) {
          score += 15;
          reasons.push('Mathematical content');
        }
        break;
        
      case 'ocr-first':
        if (contentType === 'printed_text') {
          score += 25;
          reasons.push('Printed text - OCR first');
        }
        if (quality.overall === 'good') {
          score += 20;
          reasons.push('Good quality');
        }
        if (contentType === 'tables') {
          score += 15;
          reasons.push('Tables detected');
        }
        break;
        
      case 'vision-first':
        if (contentType === 'handwritten') {
          score += 30;
          reasons.push('Handwriting - Vision first');
        }
        if (contentType === 'mixed_content') {
          score += 25;
          reasons.push('Mixed content');
        }
        if (quality.clarity === 'blurry') {
          score += 20;
          reasons.push('Blurry image');
        }
        break;
        
      case 'parallel':
        if (complexity.level === 'very_complex') {
          score += 35;
          reasons.push('Very complex content');
        }
        if (contentType === 'math_equations') {
          score += 30;
          reasons.push('Math equations - needs both');
        }
        if (quality.overall === 'poor') {
          score += 25;
          reasons.push('Poor quality - multiple approaches');
        }
        if (contentType === 'mixed_content') {
          score += 20;
          reasons.push('Mixed content type');
        }
        break;
        
      case 'adaptive':
        // الاستراتيجية التكيفية دائماً خيار آمن
        score += 10;
        reasons.push('Safe fallback option');
        break;
    }
    
    // تقييم حسب التاريخ
    const historicalPerformance = this.getHistoricalPerformance(
      strategy,
      contentType
    );
    if (historicalPerformance) {
      score += historicalPerformance.score;
      reasons.push(`Historical success: ${historicalPerformance.score}`);
    }
    
    // تقدير الوقت والتكلفة
    const { estimatedTime, estimatedCost } = this.estimateResources(
      strategy,
      analysis
    );
    
    return {
      strategy,
      score: Math.max(0, Math.min(100, score)),
      reasons,
      estimatedTime,
      estimatedCost
    };
  }
  
  /**
   * الحصول على الأداء التاريخي
   */
  private getHistoricalPerformance(
    strategy: ProcessingStrategy,
    contentType: ContentType
  ): { score: number; count: number } | null {
    
    const relevantCases = this.learningHistory.filter(
      case_ => case_.strategyUsed === strategy && case_.contentType === contentType
    );
    
    if (relevantCases.length === 0) {
      return null;
    }
    
    const successfulCases = relevantCases.filter(case_ => case_.success);
    const successRate = successfulCases.length / relevantCases.length;
    const avgConfidence = successfulCases.reduce(
      (sum, case_) => sum + case_.confidence,
      0
    ) / (successfulCases.length || 1);
    
    const score = (successRate * 50 + avgConfidence * 50) - 50;
    
    return {
      score,
      count: relevantCases.length
    };
  }
  
  /**
   * تقدير الموارد
   */
  private estimateResources(
    strategy: ProcessingStrategy,
    analysis: ImageAnalysisResult
  ): { estimatedTime: number; estimatedCost: number } {
    
    const baseTime = analysis.complexity.estimatedProcessingTime;
    let timeMultiplier = 1;
    let costMultiplier = 1;
    
    switch (strategy) {
      case 'ocr-only':
        timeMultiplier = 0.3;
        costMultiplier = 0.2;
        break;
      case 'vision-only':
        timeMultiplier = 0.5;
        costMultiplier = 0.5;
        break;
      case 'ocr-first':
        timeMultiplier = 0.6;
        costMultiplier = 0.4;
        break;
      case 'vision-first':
        timeMultiplier = 0.7;
        costMultiplier = 0.6;
        break;
      case 'parallel':
        timeMultiplier = 0.5;
        costMultiplier = 0.7;
        break;
      case 'adaptive':
        timeMultiplier = 0.8;
        costMultiplier = 0.5;
        break;
    }
    
    return {
      estimatedTime: baseTime * timeMultiplier,
      estimatedCost: baseTime * costMultiplier * 0.001
    };
  }
  
  // ============================================
  // 5. اختيار الأفضل
  // ============================================
  
  /**
   * اختيار أفضل استراتيجية
   */
  private selectBestStrategy(
    ruleBasedStrategy: ProcessingStrategy | null,
    learnedStrategy: ProcessingStrategy | null,
    scores: StrategyScore[]
  ): ProcessingStrategy {
    
    // إذا كانت القاعدة واضحة وقوية
    if (ruleBasedStrategy && scores[0].strategy === ruleBasedStrategy) {
      return ruleBasedStrategy;
    }
    
    // إذا كان التعلم متوافق مع النقاط العالية
    if (learnedStrategy && scores[0].strategy === learnedStrategy) {
      return learnedStrategy;
    }
    
    // إذا كانت القاعدة موجودة ونقاطها عالية
    if (ruleBasedStrategy) {
      const ruleScore = scores.find(s => s.strategy === ruleBasedStrategy);
      if (ruleScore && ruleScore.score >= 70) {
        return ruleBasedStrategy;
      }
    }
    
    // إذا كان التعلم موجود ونقاطه عالية
    if (learnedStrategy) {
      const learnedScore = scores.find(s => s.strategy === learnedStrategy);
      if (learnedScore && learnedScore.score >= 70) {
        return learnedStrategy;
      }
    }
    
    // افتراضي: الاستراتيجية الأعلى نقاطاً
    return scores[0].strategy;
  }
  
  // ============================================
  // 6. التعلم والتحديث
  // ============================================
  
  /**
   * تسجيل نتيجة المعالجة للتعلم
   */
  recordResult(
    analysis: ImageAnalysisResult,
    result: HybridProcessingResult,
    strategy: ProcessingStrategy
  ): void {
    
    if (!this.adaptiveConfig.enableLearning) {
      return;
    }
    
    const learningData: LearningData = {
      contentType: analysis.contentType,
      quality: analysis.quality.overall,
      complexity: analysis.complexity.level,
      strategyUsed: strategy,
      success: result.success,
      confidence: result.confidence,
      processingTime: result.processingTime,
      timestamp: new Date().toISOString()
    };
    
    this.learningHistory.push(learningData);
    
    // الحفاظ على حجم التاريخ
    if (this.learningHistory.length > this.adaptiveConfig.maxHistorySize) {
      this.learningHistory.shift();
    }
    
    // حفظ التاريخ
    this.saveHistory();
  }
  
  /**
   * تحديث الأداء
   */
  updatePerformance(
    strategy: ProcessingStrategy,
    contentType: ContentType,
    performance: StrategyPerformance
  ): void {
    
    const key = `${strategy}-${contentType}`;
    this.performanceCache.set(key, performance);
  }
  
  // ============================================
  // 7. الإحصائيات والتحليل
  // ============================================
  
  /**
   * الحصول على إحصائيات الاستراتيجيات
   */
  getStrategyStatistics(): Record<ProcessingStrategy, {
    totalUses: number;
    successRate: number;
    avgConfidence: number;
    avgTime: number;
  }> {
    
    const stats: any = {};
    
    const strategies: ProcessingStrategy[] = [
      'ocr-only',
      'vision-only',
      'ocr-first',
      'vision-first',
      'parallel',
      'adaptive'
    ];
    
    strategies.forEach(strategy => {
      const cases = this.learningHistory.filter(
        case_ => case_.strategyUsed === strategy
      );
      
      const successfulCases = cases.filter(case_ => case_.success);
      
      stats[strategy] = {
        totalUses: cases.length,
        successRate: cases.length > 0 
          ? successfulCases.length / cases.length 
          : 0,
        avgConfidence: cases.length > 0
          ? cases.reduce((sum, c) => sum + c.confidence, 0) / cases.length
          : 0,
        avgTime: cases.length > 0
          ? cases.reduce((sum, c) => sum + c.processingTime, 0) / cases.length
          : 0
      };
    });
    
    return stats;
  }
  
  /**
   * الحصول على أفضل استراتيجية لنوع محتوى
   */
  getBestStrategyForContent(
    contentType: ContentType
  ): ProcessingStrategy | null {
    
    const cases = this.learningHistory.filter(
      case_ => case_.contentType === contentType && case_.success
    );
    
    if (cases.length === 0) {
      return null;
    }
    
    const strategyScores = new Map<ProcessingStrategy, number>();
    const strategyCounts = new Map<ProcessingStrategy, number>();
    
    cases.forEach(case_ => {
      const score = strategyScores.get(case_.strategyUsed) || 0;
      const count = strategyCounts.get(case_.strategyUsed) || 0;
      
      strategyScores.set(case_.strategyUsed, score + case_.confidence);
      strategyCounts.set(case_.strategyUsed, count + 1);
    });
    
    let bestStrategy: ProcessingStrategy | null = null;
    let bestAvgScore = 0;
    
    strategyScores.forEach((score, strategy) => {
      const count = strategyCounts.get(strategy) || 1;
      const avgScore = score / count;
      
      if (avgScore > bestAvgScore) {
        bestAvgScore = avgScore;
        bestStrategy = strategy;
      }
    });
    
    return bestStrategy;
  }
  
  // ============================================
  // 8. الحفظ والتحميل
  // ============================================
  
  /**
   * حفظ التاريخ
   */
  private saveHistory(): void {
    try {
      const data = JSON.stringify(this.learningHistory);
      localStorage.setItem('adaptive-strategy-history', data);
    } catch (error) {
      console.warn('Failed to save learning history:', error);
    }
  }
  
  /**
   * تحميل التاريخ
   */
  private loadHistory(): void {
    try {
      const data = localStorage.getItem('adaptive-strategy-history');
      if (data) {
        this.learningHistory = JSON.parse(data);
      }
    } catch (error) {
      console.warn('Failed to load learning history:', error);
    }
  }
  
  /**
   * مسح التاريخ
   */
  clearHistory(): void {
    this.learningHistory = [];
    this.performanceCache.clear();
    localStorage.removeItem('adaptive-strategy-history');
  }
  
  /**
   * تصدير التاريخ
   */
  exportHistory(): string {
    return JSON.stringify(this.learningHistory, null, 2);
  }
  
  /**
   * استيراد التاريخ
   */
  importHistory(data: string): boolean {
    try {
      const history = JSON.parse(data);
      if (Array.isArray(history)) {
        this.learningHistory = history;
        this.saveHistory();
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
}

// ============================================
// 9. دوال مساعدة عامة
// ============================================

/**
 * إنشاء استراتيجية تكيفية
 */
export function createAdaptiveStrategy(
  config?: Partial<AdaptiveConfig>
): AdaptiveStrategy {
  return new AdaptiveStrategy(config);
}

/**
 * اختيار استراتيجية سريع
 */
export async function quickSelectStrategy(
  analysis: ImageAnalysisResult
): Promise<ProcessingStrategy> {
  const strategy = createAdaptiveStrategy();
  return strategy.selectStrategy(analysis);
}

// ============================================
// 10. التصدير
// ============================================

export default AdaptiveStrategy;
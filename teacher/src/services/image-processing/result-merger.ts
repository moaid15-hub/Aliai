/**
 * دامج النتائج - Result Merger
 * 
 * يدمج نتائج OCR و Vision API بذكاء
 * يقارن ويختار الأفضل أو يدمج النتائج
 * 
 * @module result-merger
 * @path src/services/image-processing/result-merger.ts
 */

import {
  VisionProcessingResult,
  OCRProcessingResult,
  MergedProcessingResult,
  MergeStrategy,
  ConflictResolution,
  TextBlock,
  MergeQualityMetrics
} from '../../types/image-processing.types';

// ============================================
// 1. الواجهات المحلية
// ============================================

interface MergeOptions {
  strategy?: MergeStrategy;
  conflictResolution?: ConflictResolution;
  preserveFormatting?: boolean;
  combineConfidence?: boolean;
}

interface ComparisonResult {
  similarity: number;
  visionBetter: boolean;
  ocrBetter: boolean;
  conflicts: string[];
}

interface TextSegment {
  text: string;
  source: 'vision' | 'ocr' | 'merged';
  confidence: number;
  startIndex: number;
  endIndex: number;
}

// ============================================
// 2. فئة دامج النتائج
// ============================================

export class ResultMerger {
  
  /**
   * دمج نتائج Vision و OCR
   */
  async mergeResults(
    visionResult: VisionProcessingResult,
    ocrResult: OCRProcessingResult,
    options?: MergeOptions
  ): Promise<MergedProcessingResult> {
    
    const startTime = Date.now();
    
    try {
      // تحديد الاستراتيجية
      const strategy = options?.strategy || this.determineStrategy(
        visionResult,
        ocrResult
      );
      
      // تنفيذ الدمج حسب الاستراتيجية
      let mergedText: string;
      let confidence: number;
      let blocks: TextBlock[] = [];
      
      switch (strategy) {
        case 'vision-only':
          mergedText = visionResult.extractedText;
          confidence = visionResult.confidence;
          break;
          
        case 'ocr-only':
          mergedText = ocrResult.fullText;
          confidence = ocrResult.confidence;
          blocks = ocrResult.blocks;
          break;
          
        case 'best-of-both':
          const best = this.selectBest(visionResult, ocrResult);
          mergedText = best.text;
          confidence = best.confidence;
          blocks = best.blocks;
          break;
          
        case 'weighted-merge':
          const weighted = this.weightedMerge(visionResult, ocrResult);
          mergedText = weighted.text;
          confidence = weighted.confidence;
          blocks = weighted.blocks;
          break;
          
        case 'intelligent-combine':
          const combined = await this.intelligentCombine(
            visionResult,
            ocrResult,
            options
          );
          mergedText = combined.text;
          confidence = combined.confidence;
          blocks = combined.blocks;
          break;
          
        default:
          mergedText = visionResult.extractedText || ocrResult.fullText;
          confidence = Math.max(visionResult.confidence, ocrResult.confidence);
      }
      
      // حساب الجودة
      const quality = this.assessMergeQuality(
        visionResult,
        ocrResult,
        mergedText,
        confidence
      );
      
      // إنشاء النتيجة المدمجة
      const result: MergedProcessingResult = {
        finalText: mergedText,
        blocks,
        strategy,
        confidence,
        quality,
        sources: {
          vision: {
            text: visionResult.extractedText,
            confidence: visionResult.confidence,
            provider: visionResult.provider
          },
          ocr: {
            text: ocrResult.fullText,
            confidence: ocrResult.confidence,
            provider: ocrResult.provider
          }
        },
        processingTime: Date.now() - startTime,
        metadata: {
          visionTime: visionResult.processingTime,
          ocrTime: ocrResult.processingTime,
          totalTime: visionResult.processingTime + ocrResult.processingTime,
          strategyUsed: strategy
        },
        success: true,
        timestamp: new Date().toISOString()
      };
      
      return result;
      
    } catch (error) {
      return this.handleError(error, visionResult, ocrResult, startTime);
    }
  }
  
  // ============================================
  // 3. تحديد الاستراتيجية
  // ============================================
  
  /**
   * تحديد استراتيجية الدمج المثلى
   */
  private determineStrategy(
    visionResult: VisionProcessingResult,
    ocrResult: OCRProcessingResult
  ): MergeStrategy {
    
    // إذا فشل أحدهما
    if (!visionResult.success) return 'ocr-only';
    if (!ocrResult.success) return 'vision-only';
    
    // فحص الثقة
    const visionConf = visionResult.confidence;
    const ocrConf = ocrResult.confidence;
    
    // فرق كبير في الثقة
    if (Math.abs(visionConf - ocrConf) > 0.3) {
      return 'best-of-both';
    }
    
    // كلاهما جيد
    if (visionConf > 0.7 && ocrConf > 0.7) {
      return 'intelligent-combine';
    }
    
    // ثقة متوسطة
    if (visionConf > 0.5 && ocrConf > 0.5) {
      return 'weighted-merge';
    }
    
    // افتراضي
    return 'best-of-both';
  }
  
  // ============================================
  // 4. اختيار الأفضل
  // ============================================
  
  /**
   * اختيار الأفضل من النتيجتين
   */
  private selectBest(
    visionResult: VisionProcessingResult,
    ocrResult: OCRProcessingResult
  ): {
    text: string;
    confidence: number;
    blocks: TextBlock[];
  } {
    
    // مقارنة الثقة
    if (visionResult.confidence > ocrResult.confidence + 0.1) {
      return {
        text: visionResult.extractedText,
        confidence: visionResult.confidence,
        blocks: []
      };
    }
    
    if (ocrResult.confidence > visionResult.confidence + 0.1) {
      return {
        text: ocrResult.fullText,
        confidence: ocrResult.confidence,
        blocks: ocrResult.blocks
      };
    }
    
    // مقارنة طول النص
    const visionLength = visionResult.extractedText.length;
    const ocrLength = ocrResult.fullText.length;
    
    if (visionLength > ocrLength * 1.2) {
      return {
        text: visionResult.extractedText,
        confidence: visionResult.confidence,
        blocks: []
      };
    }
    
    if (ocrLength > visionLength * 1.2) {
      return {
        text: ocrResult.fullText,
        confidence: ocrResult.confidence,
        blocks: ocrResult.blocks
      };
    }
    
    // افتراضي: OCR (أكثر دقة للنصوص)
    return {
      text: ocrResult.fullText,
      confidence: ocrResult.confidence,
      blocks: ocrResult.blocks
    };
  }
  
  // ============================================
  // 5. الدمج الموزون
  // ============================================
  
  /**
   * دمج موزون حسب الثقة
   */
  private weightedMerge(
    visionResult: VisionProcessingResult,
    ocrResult: OCRProcessingResult
  ): {
    text: string;
    confidence: number;
    blocks: TextBlock[];
  } {
    
    const visionWeight = visionResult.confidence;
    const ocrWeight = ocrResult.confidence;
    const totalWeight = visionWeight + ocrWeight;
    
    // إذا كانت النصوص متشابهة جداً
    const similarity = this.calculateSimilarity(
      visionResult.extractedText,
      ocrResult.fullText
    );
    
    if (similarity > 0.9) {
      // نستخدم OCR (عادة أدق)
      return {
        text: ocrResult.fullText,
        confidence: (visionWeight + ocrWeight) / 2,
        blocks: ocrResult.blocks
      };
    }
    
    // اختيار حسب الوزن
    if (visionWeight > ocrWeight) {
      return {
        text: visionResult.extractedText,
        confidence: visionWeight,
        blocks: []
      };
    } else {
      return {
        text: ocrResult.fullText,
        confidence: ocrWeight,
        blocks: ocrResult.blocks
      };
    }
  }
  
  // ============================================
  // 6. الدمج الذكي
  // ============================================
  
  /**
   * دمج ذكي يجمع أفضل من الاثنين
   */
  private async intelligentCombine(
    visionResult: VisionProcessingResult,
    ocrResult: OCRProcessingResult,
    options?: MergeOptions
  ): Promise<{
    text: string;
    confidence: number;
    blocks: TextBlock[];
  }> {
    
    // تقسيم النصوص إلى أجزاء
    const visionSegments = this.segmentText(visionResult.extractedText);
    const ocrSegments = this.segmentText(ocrResult.fullText);
    
    // مقارنة الأجزاء
    const mergedSegments = this.mergeSegments(
      visionSegments,
      ocrSegments,
      visionResult.confidence,
      ocrResult.confidence
    );
    
    // إعادة بناء النص
    const finalText = mergedSegments
      .map(seg => seg.text)
      .join('\n');
    
    // حساب الثقة المجمعة
    const avgConfidence = mergedSegments.reduce(
      (sum, seg) => sum + seg.confidence,
      0
    ) / mergedSegments.length;
    
    return {
      text: finalText,
      confidence: avgConfidence,
      blocks: ocrResult.blocks // نحتفظ بـ blocks من OCR
    };
  }
  
  /**
   * تقسيم النص إلى أجزاء
   */
  private segmentText(text: string): string[] {
    return text
      .split(/\n+/)
      .filter(line => line.trim().length > 0);
  }
  
  /**
   * دمج الأجزاء
   */
  private mergeSegments(
    visionSegments: string[],
    ocrSegments: string[],
    visionConf: number,
    ocrConf: number
  ): TextSegment[] {
    
    const merged: TextSegment[] = [];
    const maxLength = Math.max(visionSegments.length, ocrSegments.length);
    
    for (let i = 0; i < maxLength; i++) {
      const visionSeg = visionSegments[i] || '';
      const ocrSeg = ocrSegments[i] || '';
      
      if (!visionSeg && ocrSeg) {
        merged.push({
          text: ocrSeg,
          source: 'ocr',
          confidence: ocrConf,
          startIndex: i,
          endIndex: i
        });
      } else if (visionSeg && !ocrSeg) {
        merged.push({
          text: visionSeg,
          source: 'vision',
          confidence: visionConf,
          startIndex: i,
          endIndex: i
        });
      } else if (visionSeg && ocrSeg) {
        // مقارنة الجزئين
        const similarity = this.calculateSimilarity(visionSeg, ocrSeg);
        
        if (similarity > 0.8) {
          // متشابهان - نختار OCR (أدق)
          merged.push({
            text: ocrSeg,
            source: 'ocr',
            confidence: Math.max(visionConf, ocrConf),
            startIndex: i,
            endIndex: i
          });
        } else {
          // مختلفان - نختار الأطول أو الأوثق
          if (visionSeg.length > ocrSeg.length || visionConf > ocrConf + 0.1) {
            merged.push({
              text: visionSeg,
              source: 'vision',
              confidence: visionConf,
              startIndex: i,
              endIndex: i
            });
          } else {
            merged.push({
              text: ocrSeg,
              source: 'ocr',
              confidence: ocrConf,
              startIndex: i,
              endIndex: i
            });
          }
        }
      }
    }
    
    return merged;
  }
  
  // ============================================
  // 7. حساب التشابه
  // ============================================
  
  /**
   * حساب التشابه بين نصين
   */
  private calculateSimilarity(text1: string, text2: string): number {
    // تنظيف النصوص
    const clean1 = this.cleanText(text1);
    const clean2 = this.cleanText(text2);
    
    // Levenshtein distance مبسط
    const distance = this.levenshteinDistance(clean1, clean2);
    const maxLength = Math.max(clean1.length, clean2.length);
    
    if (maxLength === 0) return 1;
    
    return 1 - (distance / maxLength);
  }
  
  /**
   * تنظيف النص
   */
  private cleanText(text: string): string {
    return text
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s\u0600-\u06FF]/g, '')
      .trim();
  }
  
  /**
   * حساب Levenshtein Distance
   */
  private levenshteinDistance(str1: string, str2: string): number {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix: number[][] = [];
    
    // تهيئة المصفوفة
    for (let i = 0; i <= len1; i++) {
      matrix[i] = [i];
    }
    for (let j = 0; j <= len2; j++) {
      matrix[0][j] = j;
    }
    
    // حساب المسافة
    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // حذف
          matrix[i][j - 1] + 1,      // إضافة
          matrix[i - 1][j - 1] + cost // استبدال
        );
      }
    }
    
    return matrix[len1][len2];
  }
  
  // ============================================
  // 8. تقييم الجودة
  // ============================================
  
  /**
   * تقييم جودة الدمج
   */
  private assessMergeQuality(
    visionResult: VisionProcessingResult,
    ocrResult: OCRProcessingResult,
    mergedText: string,
    confidence: number
  ): MergeQualityMetrics {
    
    // حساب التوافق
    const visionSimilarity = this.calculateSimilarity(
      visionResult.extractedText,
      mergedText
    );
    const ocrSimilarity = this.calculateSimilarity(
      ocrResult.fullText,
      mergedText
    );
    
    const agreement = (visionSimilarity + ocrSimilarity) / 2;
    
    // تقييم الاتساق
    const consistency = this.calculateSimilarity(
      visionResult.extractedText,
      ocrResult.fullText
    );
    
    // تحديد الموثوقية
    let reliability: MergeQualityMetrics['reliability'] = 'low';
    if (confidence > 0.8 && agreement > 0.7) {
      reliability = 'high';
    } else if (confidence > 0.6 && agreement > 0.5) {
      reliability = 'medium';
    }
    
    return {
      agreement,
      consistency,
      reliability,
      completeness: mergedText.length > 0 ? 1 : 0
    };
  }
  
  // ============================================
  // 9. معالجة الأخطاء
  // ============================================
  
  /**
   * معالجة الأخطاء
   */
  private handleError(
    error: any,
    visionResult: VisionProcessingResult,
    ocrResult: OCRProcessingResult,
    startTime: number
  ): MergedProcessingResult {
    
    // محاولة استخدام أي نتيجة متاحة
    const fallbackText = visionResult.extractedText || ocrResult.fullText || '';
    const fallbackConf = Math.max(
      visionResult.confidence || 0,
      ocrResult.confidence || 0
    );
    
    return {
      finalText: fallbackText,
      blocks: ocrResult.blocks || [],
      strategy: 'best-of-both',
      confidence: fallbackConf,
      quality: {
        agreement: 0,
        consistency: 0,
        reliability: 'low',
        completeness: fallbackText.length > 0 ? 0.5 : 0
      },
      sources: {
        vision: {
          text: visionResult.extractedText,
          confidence: visionResult.confidence,
          provider: visionResult.provider
        },
        ocr: {
          text: ocrResult.fullText,
          confidence: ocrResult.confidence,
          provider: ocrResult.provider
        }
      },
      processingTime: Date.now() - startTime,
      success: false,
      error: {
        code: 'MERGE_ERROR',
        message: error.message,
        timestamp: new Date().toISOString()
      },
      timestamp: new Date().toISOString()
    };
  }
  
  // ============================================
  // 10. دوال مساعدة
  // ============================================
  
  /**
   * مقارنة النتائج
   */
  compareResults(
    visionResult: VisionProcessingResult,
    ocrResult: OCRProcessingResult
  ): ComparisonResult {
    
    const similarity = this.calculateSimilarity(
      visionResult.extractedText,
      ocrResult.fullText
    );
    
    const visionBetter = visionResult.confidence > ocrResult.confidence + 0.1;
    const ocrBetter = ocrResult.confidence > visionResult.confidence + 0.1;
    
    const conflicts: string[] = [];
    
    if (similarity < 0.5) {
      conflicts.push('Low text similarity');
    }
    
    if (Math.abs(visionResult.confidence - ocrResult.confidence) > 0.3) {
      conflicts.push('Large confidence difference');
    }
    
    const lengthDiff = Math.abs(
      visionResult.extractedText.length - ocrResult.fullText.length
    );
    if (lengthDiff > 100) {
      conflicts.push('Significant length difference');
    }
    
    return {
      similarity,
      visionBetter,
      ocrBetter,
      conflicts
    };
  }
  
  /**
   * تحديد مصدر كل جزء من النص
   */
  getTextSources(
    mergedResult: MergedProcessingResult
  ): Array<{ text: string; source: 'vision' | 'ocr' | 'both' }> {
    
    const sources: Array<{ text: string; source: 'vision' | 'ocr' | 'both' }> = [];
    
    const lines = mergedResult.finalText.split('\n');
    const visionLines = mergedResult.sources.vision.text.split('\n');
    const ocrLines = mergedResult.sources.ocr.text.split('\n');
    
    lines.forEach((line, index) => {
      const inVision = visionLines[index] && 
        this.calculateSimilarity(line, visionLines[index]) > 0.8;
      const inOCR = ocrLines[index] && 
        this.calculateSimilarity(line, ocrLines[index]) > 0.8;
      
      let source: 'vision' | 'ocr' | 'both' = 'vision';
      if (inVision && inOCR) source = 'both';
      else if (inOCR) source = 'ocr';
      
      sources.push({ text: line, source });
    });
    
    return sources;
  }
  
  /**
   * الحصول على إحصائيات الدمج
   */
  getMergeStatistics(
    mergedResult: MergedProcessingResult
  ): {
    totalCharacters: number;
    totalWords: number;
    totalLines: number;
    averageConfidence: number;
    processingTime: number;
  } {
    
    const text = mergedResult.finalText;
    
    return {
      totalCharacters: text.length,
      totalWords: text.split(/\s+/).filter(w => w.length > 0).length,
      totalLines: text.split('\n').length,
      averageConfidence: mergedResult.confidence,
      processingTime: mergedResult.processingTime
    };
  }
}

// ============================================
// 11. دوال مساعدة عامة
// ============================================

/**
 * إنشاء دامج نتائج
 */
export function createResultMerger(): ResultMerger {
  return new ResultMerger();
}

/**
 * دمج سريع
 */
export async function quickMerge(
  visionResult: VisionProcessingResult,
  ocrResult: OCRProcessingResult
): Promise<MergedProcessingResult> {
  
  const merger = createResultMerger();
  return merger.mergeResults(visionResult, ocrResult);
}

/**
 * دمج مع استراتيجية محددة
 */
export async function mergeWithStrategy(
  visionResult: VisionProcessingResult,
  ocrResult: OCRProcessingResult,
  strategy: MergeStrategy
): Promise<MergedProcessingResult> {
  
  const merger = createResultMerger();
  return merger.mergeResults(visionResult, ocrResult, { strategy });
}

// ============================================
// 12. التصدير
// ============================================

export default ResultMerger;
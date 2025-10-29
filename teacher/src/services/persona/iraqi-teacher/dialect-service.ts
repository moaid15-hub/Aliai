/**
 * خدمة اللهجة العراقية - Iraqi Dialect Service
 * 
 * يدير استخدام اللهجة العراقية في الردود
 * يختار العبارات المناسبة حسب السياق
 * 
 * @module dialect-service
 * @path src/services/persona/iraqi-teacher/dialect-service.ts
 */

import {
  DialectPhrase,
  DialectCategory,
  TeacherResponse,
  ConversationContext
} from '../../../types/iraqi-teacher.types';

import {
  DIALECT_PHRASES_BY_CATEGORY,
  ALL_DIALECT_PHRASES,
  getRandomPhrase,
  findPhrasesByContext
} from '../../../components/personas/iraqi-teacher/data/dialectPhrases';

import {
  PHRASES_BY_PERFORMANCE,
  PHRASES_BY_TYPE,
  getEncouragementByPerformance,
  getEncouragementByScore
} from '../../../components/personas/iraqi-teacher/data/encouragementPhrases';

import { IRAQI_TEACHER_CONFIG } from '../../../config/iraqi-teacher-config';

// ============================================
// 1. الواجهات المحلية
// ============================================

interface DialectUsageOptions {
  intensity?: 'light' | 'moderate' | 'heavy';
  context?: string;
  studentLevel?: number;
  formality?: 'casual' | 'warm' | 'enthusiastic';
}

interface ResponseEnhancement {
  opening: string;
  closing: string;
  encouragement?: string;
  transitions: string[];
}

interface DialectPattern {
  pattern: RegExp;
  replacement: string;
  description: string;
}

// ============================================
// 2. فئة خدمة اللهجة
// ============================================

export class DialectService {
  private config = IRAQI_TEACHER_CONFIG;
  private usageHistory: Map<string, number> = new Map();
  private recentPhrases: string[] = [];
  private maxRecentPhrases = 10;
  
  /**
   * تحسين النص بإضافة اللهجة العراقية
   */
  enhanceWithDialect(
    text: string,
    options?: DialectUsageOptions
  ): string {
    
    const intensity = options?.intensity || 'moderate';
    
    // إضافة افتتاحية
    const opening = this.getOpening(options);
    
    // تحسين النص الأساسي
    let enhanced = this.applyDialectPatterns(text, intensity);
    
    // إضافة تحولات
    enhanced = this.addTransitions(enhanced, intensity);
    
    // إضافة خاتمة
    const closing = this.getClosing(options);
    
    // بناء الرد النهائي
    const parts: string[] = [];
    if (opening) parts.push(opening);
    parts.push(enhanced);
    if (closing) parts.push(closing);
    
    return parts.join('\n\n');
  }
  
  /**
   * الحصول على افتتاحية
   */
  private getOpening(options?: DialectUsageOptions): string {
    const greetings = DIALECT_PHRASES_BY_CATEGORY.greeting;
    
    // تصفية حسب الرسمية
    const filtered = options?.formality
      ? greetings.filter(p => p.formality === options.formality)
      : greetings;
    
    return this.selectUniquePhrase(filtered);
  }
  
  /**
   * الحصول على خاتمة
   */
  private getClosing(options?: DialectUsageOptions): string {
    const farewells = DIALECT_PHRASES_BY_CATEGORY.farewell;
    return this.selectUniquePhrase(farewells);
  }
  
  /**
   * تطبيق أنماط اللهجة على النص
   */
  private applyDialectPatterns(text: string, intensity: string): string {
    const patterns = this.getDialectPatterns(intensity);
    
    let result = text;
    
    patterns.forEach(pattern => {
      result = result.replace(pattern.pattern, pattern.replacement);
    });
    
    return result;
  }
  
  /**
   * الحصول على أنماط اللهجة
   */
  private getDialectPatterns(intensity: string): DialectPattern[] {
    const basePatterns: DialectPattern[] = [
      {
        pattern: /\bماذا\b/g,
        replacement: 'شنو',
        description: 'ماذا → شنو'
      },
      {
        pattern: /\bكيف\b/g,
        replacement: 'شلون',
        description: 'كيف → شلون'
      },
      {
        pattern: /\bهل\b/g,
        replacement: 'هل',
        description: 'هل تبقى كما هي'
      },
      {
        pattern: /\bالآن\b/g,
        replacement: 'هسه',
        description: 'الآن → هسه'
      },
      {
        pattern: /\bجداً\b/g,
        replacement: 'كلش',
        description: 'جداً → كلش'
      },
      {
        pattern: /\bقليلاً\b/g,
        replacement: 'شوية',
        description: 'قليلاً → شوية'
      },
      {
        pattern: /\bمعاً\b/g,
        replacement: 'سوية',
        description: 'معاً → سوية'
      },
      {
        pattern: /\bأريد\b/g,
        replacement: 'اريد',
        description: 'أريد → اريد'
      },
      {
        pattern: /\bنريد\b/g,
        replacement: 'نريد',
        description: 'نريد → نريد'
      },
      {
        pattern: /\bانظر\b/g,
        replacement: 'شوف',
        description: 'انظر → شوف'
      },
      {
        pattern: /\bتعال\b/g,
        replacement: 'تعال',
        description: 'تعال تبقى'
      },
      {
        pattern: /\bهيا\b/g,
        replacement: 'يلا',
        description: 'هيا → يلا'
      },
      {
        pattern: /\bجيد\b/g,
        replacement: 'زين',
        description: 'جيد → زين'
      },
      {
        pattern: /\bممتاز\b/g,
        replacement: 'ممتاز',
        description: 'ممتاز تبقى'
      },
      {
        pattern: /\bصحيح\b/g,
        replacement: 'صح',
        description: 'صحيح → صح'
      }
    ];
    
    const moderatePatterns: DialectPattern[] = [
      {
        pattern: /\bأين\b/g,
        replacement: 'وين',
        description: 'أين → وين'
      },
      {
        pattern: /\bمتى\b/g,
        replacement: 'متى',
        description: 'متى تبقى'
      },
      {
        pattern: /\bلماذا\b/g,
        replacement: 'ليش',
        description: 'لماذا → ليش'
      },
      {
        pattern: /\bمن\b(?= هو| هي)/g,
        replacement: 'منو',
        description: 'من → منو'
      },
      {
        pattern: /\bهذا\b/g,
        replacement: 'هذا',
        description: 'هذا تبقى'
      },
      {
        pattern: /\bذلك\b/g,
        replacement: 'هاك',
        description: 'ذلك → هاك'
      }
    ];
    
    const heavyPatterns: DialectPattern[] = [
      {
        pattern: /\bلا يوجد\b/g,
        replacement: 'ماكو',
        description: 'لا يوجد → ماكو'
      },
      {
        pattern: /\bيوجد\b/g,
        replacement: 'اكو',
        description: 'يوجد → اكو'
      },
      {
        pattern: /\bأيضاً\b/g,
        replacement: 'هم',
        description: 'أيضاً → هم'
      }
    ];
    
    switch (intensity) {
      case 'light':
        return basePatterns.slice(0, 5);
      case 'moderate':
        return [...basePatterns, ...moderatePatterns];
      case 'heavy':
        return [...basePatterns, ...moderatePatterns, ...heavyPatterns];
      default:
        return basePatterns;
    }
  }
  
  /**
   * إضافة تحولات في النص
   */
  private addTransitions(text: string, intensity: string): string {
    if (intensity === 'light') return text;
    
    const transitions = [
      'خلينا نشوف',
      'طيب',
      'زين',
      'تمام',
      'اوكي',
      'ممتاز'
    ];
    
    const sentences = text.split(/\.\s+/);
    if (sentences.length < 2) return text;
    
    // إضافة transition عشوائية
    const randomIndex = Math.floor(Math.random() * (sentences.length - 1));
    const transition = transitions[Math.floor(Math.random() * transitions.length)];
    
    sentences[randomIndex] += `. ${transition}،`;
    
    return sentences.join('. ');
  }
  
  /**
   * اختيار عبارة فريدة
   */
  private selectUniquePhrase(phrases: DialectPhrase[]): string {
    // تصفية العبارات المستخدمة مؤخراً
    const available = phrases.filter(
      p => !this.recentPhrases.includes(p.arabic)
    );
    
    const selected = available.length > 0
      ? available[Math.floor(Math.random() * available.length)]
      : phrases[Math.floor(Math.random() * phrases.length)];
    
    // إضافة للسجل
    this.recentPhrases.push(selected.arabic);
    if (this.recentPhrases.length > this.maxRecentPhrases) {
      this.recentPhrases.shift();
    }
    
    // تحديث الاستخدام
    const count = this.usageHistory.get(selected.arabic) || 0;
    this.usageHistory.set(selected.arabic, count + 1);
    
    return selected.arabic;
  }
  
  // ============================================
  // 3. التشجيع والمدح
  // ============================================
  
  /**
   * إضافة تشجيع حسب الأداء
   */
  addEncouragement(
    text: string,
    performance: 'excellent' | 'good' | 'average' | 'needs_improvement'
  ): string {
    
    const encouragement = getEncouragementByPerformance(performance);
    
    return `${encouragement.phrase}\n\n${text}`;
  }
  
  /**
   * إضافة تشجيع حسب الدرجة
   */
  addEncouragementByScore(text: string, score: number): string {
    const encouragement = getEncouragementByScore(score);
    return `${encouragement.phrase}\n\n${text}`;
  }
  
  /**
   * إضافة مدح
   */
  addPraise(text: string, context?: string): string {
    const praise = DIALECT_PHRASES_BY_CATEGORY.praise;
    const selected = this.selectUniquePhrase(praise);
    
    return `${selected} ${text}`;
  }
  
  // ============================================
  // 4. السياق والموقف
  // ============================================
  
  /**
   * اختيار عبارات حسب السياق
   */
  getPhrasesByContext(context: string): DialectPhrase[] {
    return findPhrasesByContext(context);
  }
  
  /**
   * اختيار سؤال مناسب
   */
  getQuestion(context?: string): string {
    const questions = DIALECT_PHRASES_BY_CATEGORY.question;
    
    if (context) {
      const contextual = questions.filter(
        q => q.context.includes(context)
      );
      if (contextual.length > 0) {
        return this.selectUniquePhrase(contextual);
      }
    }
    
    return this.selectUniquePhrase(questions);
  }
  
  /**
   * اختيار توجيه
   */
  getGuidance(context?: string): string {
    const guidance = DIALECT_PHRASES_BY_CATEGORY.guidance;
    return this.selectUniquePhrase(guidance);
  }
  
  /**
   * اختيار تعاطف
   */
  getEmpathy(): string {
    const empathy = DIALECT_PHRASES_BY_CATEGORY.empathy;
    return this.selectUniquePhrase(empathy);
  }
  
  /**
   * اختيار شرح
   */
  getExplanation(): string {
    const explanation = DIALECT_PHRASES_BY_CATEGORY.explanation;
    return this.selectUniquePhrase(explanation);
  }
  
  // ============================================
  // 5. بناء الردود
  // ============================================
  
  /**
   * بناء رد كامل مع لهجة
   */
  buildResponse(
    content: string,
    context: ConversationContext
  ): TeacherResponse {
    
    const options: DialectUsageOptions = {
      intensity: this.determineIntensity(context),
      context: context.currentTopic || undefined,
      studentLevel: context.studentGrade,
      formality: this.determineFormality(context)
    };
    
    // إضافة تشجيع إذا كان هناك أداء
    let enhanced = content;
    if (context.lastPerformance) {
      enhanced = this.addEncouragement(content, context.lastPerformance);
    }
    
    // تحسين باللهجة
    enhanced = this.enhanceWithDialect(enhanced, options);
    
    return {
      text: enhanced,
      dialect: 'iraqi',
      formality: options.formality || 'warm',
      hasEncouragement: !!context.lastPerformance,
      timestamp: new Date().toISOString()
    };
  }
  
  /**
   * تحديد شدة اللهجة
   */
  private determineIntensity(
    context: ConversationContext
  ): 'light' | 'moderate' | 'heavy' {
    
    // للصفوف الصغيرة: لهجة أخف
    if (context.studentGrade <= 2) return 'light';
    
    // للصفوف المتوسطة: متوسطة
    if (context.studentGrade <= 4) return 'moderate';
    
    // للصفوف الكبيرة: يمكن أن تكون أثقل
    return 'moderate';
  }
  
  /**
   * تحديد مستوى الرسمية
   */
  private determineFormality(
    context: ConversationContext
  ): 'casual' | 'warm' | 'enthusiastic' {
    
    // حسب الأداء
    if (context.lastPerformance === 'excellent') return 'enthusiastic';
    if (context.lastPerformance === 'needs_improvement') return 'warm';
    
    // افتراضي
    return 'casual';
  }
  
  // ============================================
  // 6. معالجة خاصة بالمواد
  // ============================================
  
  /**
   * إضافة عبارات خاصة بالرياضيات
   */
  addMathPhrases(text: string): string {
    const mathPhrases = DIALECT_PHRASES_BY_CATEGORY.math_specific;
    if (mathPhrases.length === 0) return text;
    
    const phrase = this.selectUniquePhrase(mathPhrases);
    return `${phrase} ${text}`;
  }
  
  /**
   * تحسين شرح رياضيات
   */
  enhanceMathExplanation(explanation: string): string {
    const opening = 'خلني اشرحها بطريقة سهلة يبه:';
    const enhanced = this.applyDialectPatterns(explanation, 'moderate');
    const closing = 'فهمت عليّ؟ لو عندك سؤال، اتفضل';
    
    return `${opening}\n\n${enhanced}\n\n${closing}`;
  }
  
  // ============================================
  // 7. الإحصائيات
  // ============================================
  
  /**
   * الحصول على الإحصائيات
   */
  getUsageStatistics(): {
    totalPhrases: number;
    mostUsed: Array<{ phrase: string; count: number }>;
    recentCount: number;
  } {
    
    const sorted = Array.from(this.usageHistory.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([phrase, count]) => ({ phrase, count }));
    
    return {
      totalPhrases: this.usageHistory.size,
      mostUsed: sorted,
      recentCount: this.recentPhrases.length
    };
  }
  
  /**
   * إعادة تعيين السجل
   */
  resetHistory(): void {
    this.usageHistory.clear();
    this.recentPhrases = [];
  }
}

// ============================================
// 8. دوال مساعدة عامة
// ============================================

/**
 * إنشاء خدمة اللهجة
 */
export function createDialectService(): DialectService {
  return new DialectService();
}

/**
 * تحسين نص سريع
 */
export function quickEnhance(text: string): string {
  const service = createDialectService();
  return service.enhanceWithDialect(text);
}

/**
 * إضافة تشجيع سريع
 */
export function quickEncourage(
  text: string,
  score: number
): string {
  const service = createDialectService();
  return service.addEncouragementByScore(text, score);
}

// ============================================
// 9. التصدير
// ============================================

export default DialectService;
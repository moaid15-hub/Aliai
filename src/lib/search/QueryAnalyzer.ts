// ============================================
// 🧠 QueryAnalyzer - محلل الاستعلامات الذكي
// ============================================

export interface QueryAnalysis {
  needsSearch: boolean;
  queryType: 'factual' | 'news' | 'howto' | 'opinion' | 'general';
  language: 'ar' | 'en' | 'mixed';
  intent: 'informational' | 'navigational' | 'transactional';
  entities: string[];
  timeframe?: 'recent' | 'historical' | 'real-time';
}

export class QueryAnalyzer {
  analyze(query: string): QueryAnalysis {
    return {
      needsSearch: this.detectSearchNeed(query),
      queryType: this.detectQueryType(query),
      language: this.detectLanguage(query),
      intent: this.detectIntent(query),
      entities: this.extractEntities(query),
      timeframe: this.detectTimeframe(query)
    };
  }

  private detectSearchNeed(query: string): boolean {
    // كلمات مفتاحية صريحة
    const explicitKeywords = ['ابحث', 'search', 'find', 'البحث'];
    if (explicitKeywords.some(k => query.toLowerCase().includes(k))) {
      return true;
    }

    // أسئلة عن معلومات حديثة
    const timeKeywords = ['أحدث', 'latest', 'الآن', 'now', 'جديد', 'new'];
    const hasTimeKeyword = timeKeywords.some(k => query.toLowerCase().includes(k));

    // أسئلة عن أشخاص/شركات/أحداث محددة
    const hasProperNoun = /[A-Z][a-z]+|[ء-ي]{2,}/.test(query);

    // أسئلة "كيف"
    const isHowTo = /كيف|how to/i.test(query);

    return hasTimeKeyword || (hasProperNoun && isHowTo);
  }

  private detectQueryType(query: string): QueryAnalysis['queryType'] {
    if (/أخبار|news|breaking/i.test(query)) return 'news';
    if (/كيف|how to|طريقة|شرح/i.test(query)) return 'howto';
    if (/ما هو|what is|تعريف/i.test(query)) return 'factual';
    if (/رأيك|opinion|تقييم|review/i.test(query)) return 'opinion';
    return 'general';
  }

  private detectLanguage(query: string): QueryAnalysis['language'] {
    const arabicChars = query.match(/[\u0600-\u06FF]/g)?.length || 0;
    const englishChars = query.match(/[a-zA-Z]/g)?.length || 0;

    if (arabicChars > englishChars * 2) return 'ar';
    if (englishChars > arabicChars * 2) return 'en';
    return 'mixed';
  }

  private detectIntent(query: string): QueryAnalysis['intent'] {
    if (/كيف|how|ماذا|what|لماذا|why/i.test(query)) return 'informational';
    if (/موقع|website|صفحة|page/i.test(query)) return 'navigational';
    if (/شراء|buy|احجز|book|سعر|price/i.test(query)) return 'transactional';
    return 'informational';
  }

  private extractEntities(query: string): string[] {
    // استخراج الكيانات (أسماء، أماكن، منتجات)
    const entities: string[] = [];

    // استخراج الكلمات التي تبدأ بحرف كبير
    const properNouns = query.match(/[A-Z][a-z]+/g) || [];
    entities.push(...properNouns);

    // استخراج الكلمات العربية الطويلة (محتمل تكون أسماء)
    const arabicNames = query.match(/[ء-ي]{4,}/g) || [];
    entities.push(...arabicNames);

    return [...new Set(entities)]; // إزالة التكرار
  }

  private detectTimeframe(query: string): QueryAnalysis['timeframe'] | undefined {
    if (/الآن|now|real[- ]?time|live/i.test(query)) return 'real-time';
    if (/أحدث|latest|recent|جديد|new/i.test(query)) return 'recent';
    if (/تاريخ|history|قديم|old/i.test(query)) return 'historical';
    return undefined;
  }
}

// Export singleton instance
export const queryAnalyzer = new QueryAnalyzer();

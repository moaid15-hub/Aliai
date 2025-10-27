// ============================================
// 🧠 AI-Powered Query Analyzer
// محلل الاستعلامات الذكي
// ============================================

import {
  QueryAnalysis,
  QueryIntent,
  QueryCategory,
  EntityType,
  Entity,
  SearchSource
} from '../core/types';

// ============================================
// 🎯 Smart Query Analyzer
// ============================================

export class QueryAnalyzer {

  // ============================================
  // 📊 Main Analysis Function
  // ============================================

  static analyze(query: string): QueryAnalysis {
    const normalized = this.normalizeQuery(query);
    const language = this.detectLanguage(query);
    const intent = this.detectIntent(query);
    const category = this.detectCategory(query);
    const entities = this.extractEntities(query);
    const keywords = this.extractKeywords(query);
    const requiresWebSearch = this.needsWebSearch(query);
    const suggestedSources = this.suggestSources(query, intent, category);
    const confidence = this.calculateConfidence(intent, category, entities);

    const analysis: QueryAnalysis = {
      originalQuery: query,
      normalizedQuery: normalized,
      intent,
      category,
      entities,
      keywords,
      language,
      requiresWebSearch,
      suggestedSources,
      confidence
    };

    console.log('🧠 Query Analysis:', {
      query: query.substring(0, 50),
      intent,
      category,
      sources: suggestedSources.slice(0, 3),
      confidence: `${Math.round(confidence * 100)}%`
    });

    return analysis;
  }

  // ============================================
  // 🔄 Normalize Query
  // ============================================

  private static normalizeQuery(query: string): string {
    return query
      .trim()
      .toLowerCase()
      // Remove extra spaces
      .replace(/\s+/g, ' ')
      // Remove special characters but keep Arabic, English, numbers
      .replace(/[^\u0600-\u06FF\w\s.-]/g, '')
      .trim();
  }

  // ============================================
  // 🌍 Detect Language
  // ============================================

  private static detectLanguage(query: string): string {
    // Check for Arabic characters
    const arabicPattern = /[\u0600-\u06FF]/;
    const hasArabic = arabicPattern.test(query);

    // Check for English characters
    const englishPattern = /[a-zA-Z]/;
    const hasEnglish = englishPattern.test(query);

    if (hasArabic && hasEnglish) return 'mixed';
    if (hasArabic) return 'ar';
    if (hasEnglish) return 'en';

    return 'unknown';
  }

  // ============================================
  // 🎯 Detect Intent
  // ============================================

  private static detectIntent(query: string): QueryIntent {
    const lowerQuery = query.toLowerCase();

    // NEWS - أخبار
    const newsKeywords = [
      'أخبار', 'خبر', 'جديد', 'حديث', 'آخر', 'أحدث', 'اليوم', 'الآن',
      'news', 'latest', 'breaking', 'today', 'current', 'recent'
    ];
    if (newsKeywords.some(kw => lowerQuery.includes(kw))) {
      return QueryIntent.NEWS;
    }

    // RELIGIOUS - ديني
    const religiousKeywords = [
      'القرآن', 'قرآن', 'حديث', 'فقه', 'شريعة', 'إسلام', 'صلاة', 'زكاة', 'حج', 'صيام',
      'الله', 'النبي', 'الرسول', 'الإمام', 'شيخ', 'مفتي', 'فتوى',
      'quran', 'hadith', 'islam', 'prayer', 'fasting', 'islamic'
    ];
    if (religiousKeywords.some(kw => lowerQuery.includes(kw))) {
      return QueryIntent.RELIGIOUS;
    }

    // TECHNICAL/PROGRAMMING - برمجي/تقني
    const technicalKeywords = [
      'كود', 'برمجة', 'خطأ', 'error', 'bug', 'code', 'function', 'api',
      'javascript', 'python', 'react', 'typescript', 'java', 'css', 'html',
      'algorithm', 'database', 'server', 'git', 'github'
    ];
    if (technicalKeywords.some(kw => lowerQuery.includes(kw))) {
      return QueryIntent.TECHNICAL;
    }

    // ACADEMIC - أكاديمي
    const academicKeywords = [
      'بحث', 'دراسة', 'ورقة', 'رسالة', 'أطروحة', 'علمي', 'أكاديمي',
      'research', 'paper', 'study', 'thesis', 'journal', 'academic', 'scholar'
    ];
    if (academicKeywords.some(kw => lowerQuery.includes(kw))) {
      return QueryIntent.ACADEMIC;
    }

    // MEDIA - وسائط (صور/فيديو)
    const mediaKeywords = [
      'فيديو', 'صورة', 'صور', 'شرح', 'تعليم', 'درس', 'محاضرة', 'دورة',
      'video', 'image', 'picture', 'tutorial', 'how to', 'watch', 'learn'
    ];
    if (mediaKeywords.some(kw => lowerQuery.includes(kw))) {
      return QueryIntent.MEDIA;
    }

    // COMMERCIAL - تجاري
    const commercialKeywords = [
      'سعر', 'شراء', 'بيع', 'منتج', 'متجر', 'تسوق', 'عرض', 'خصم',
      'price', 'buy', 'purchase', 'product', 'shop', 'store', 'deal', 'sale'
    ];
    if (commercialKeywords.some(kw => lowerQuery.includes(kw))) {
      return QueryIntent.COMMERCIAL;
    }

    // LOCAL - محلي
    const localKeywords = [
      'قريب', 'بالقرب', 'مكان', 'موقع', 'عنوان', 'خريطة',
      'near', 'nearby', 'location', 'address', 'map', 'directions'
    ];
    if (localKeywords.some(kw => lowerQuery.includes(kw))) {
      return QueryIntent.LOCAL;
    }

    // NAVIGATIONAL - بحث عن موقع
    const navKeywords = [
      'موقع', 'صفحة', 'رابط', 'موقع رسمي',
      'website', 'site', 'homepage', 'official'
    ];
    if (navKeywords.some(kw => lowerQuery.includes(kw))) {
      return QueryIntent.NAVIGATIONAL;
    }

    // TRANSACTIONAL - إجراء عملية
    const transactionalKeywords = [
      'تحميل', 'تنزيل', 'تسجيل', 'اشتراك', 'حجز',
      'download', 'register', 'sign up', 'subscribe', 'book'
    ];
    if (transactionalKeywords.some(kw => lowerQuery.includes(kw))) {
      return QueryIntent.TRANSACTIONAL;
    }

    // Default: INFORMATIONAL
    return QueryIntent.INFORMATIONAL;
  }

  // ============================================
  // 📚 Detect Category
  // ============================================

  private static detectCategory(query: string): QueryCategory {
    const lowerQuery = query.toLowerCase();

    // RELIGION
    if (/قرآن|حديث|فقه|إسلام|مسيحية|يهودية|islamic|quran|bible/.test(lowerQuery)) {
      return QueryCategory.RELIGION;
    }

    // PROGRAMMING
    if (/javascript|python|react|code|برمجة|كود|git|api/.test(lowerQuery)) {
      return QueryCategory.PROGRAMMING;
    }

    // TECHNOLOGY
    if (/تقنية|technology|computer|software|hardware|ai|ذكاء اصطناعي/.test(lowerQuery)) {
      return QueryCategory.TECHNOLOGY;
    }

    // SCIENCE
    if (/علم|science|physics|chemistry|biology|فيزياء|كيمياء|أحياء/.test(lowerQuery)) {
      return QueryCategory.SCIENCE;
    }

    // HEALTH
    if (/صحة|طب|مرض|علاج|health|medicine|disease|treatment/.test(lowerQuery)) {
      return QueryCategory.HEALTH;
    }

    // EDUCATION
    if (/تعليم|دراسة|جامعة|مدرسة|education|university|school|course/.test(lowerQuery)) {
      return QueryCategory.EDUCATION;
    }

    // ENTERTAINMENT
    if (/ترفيه|فيلم|مسلسل|لعبة|موسيقى|entertainment|movie|game|music/.test(lowerQuery)) {
      return QueryCategory.ENTERTAINMENT;
    }

    // SPORTS
    if (/رياضة|كرة|مباراة|sports|football|soccer|match|game/.test(lowerQuery)) {
      return QueryCategory.SPORTS;
    }

    // BUSINESS
    if (/أعمال|شركة|تجارة|business|company|trade|market/.test(lowerQuery)) {
      return QueryCategory.BUSINESS;
    }

    // NEWS
    if (/أخبار|خبر|news|breaking|latest/.test(lowerQuery)) {
      return QueryCategory.NEWS;
    }

    // MATH
    if (/رياضيات|حساب|معادلة|math|calculate|equation/.test(lowerQuery)) {
      return QueryCategory.MATH;
    }

    // HISTORY
    if (/تاريخ|history|historical|ancient/.test(lowerQuery)) {
      return QueryCategory.HISTORY;
    }

    // GEOGRAPHY
    if (/جغرافيا|دولة|مدينة|geography|country|city/.test(lowerQuery)) {
      return QueryCategory.GEOGRAPHY;
    }

    return QueryCategory.GENERAL;
  }

  // ============================================
  // 🏷️ Extract Entities
  // ============================================

  private static extractEntities(query: string): Entity[] {
    const entities: Entity[] = [];

    // Extract URLs
    const urlPattern = /(https?:\/\/[^\s]+)/g;
    const urls = query.match(urlPattern);
    if (urls) {
      urls.forEach(url => {
        entities.push({
          text: url,
          type: EntityType.URL,
          confidence: 1.0
        });
      });
    }

    // Extract Emails
    const emailPattern = /[\w.-]+@[\w.-]+\.\w+/g;
    const emails = query.match(emailPattern);
    if (emails) {
      emails.forEach(email => {
        entities.push({
          text: email,
          type: EntityType.EMAIL,
          confidence: 1.0
        });
      });
    }

    // Extract Dates (simple patterns)
    const datePattern = /\d{4}[-/]\d{1,2}[-/]\d{1,2}|\d{1,2}[-/]\d{1,2}[-/]\d{4}/g;
    const dates = query.match(datePattern);
    if (dates) {
      dates.forEach(date => {
        entities.push({
          text: date,
          type: EntityType.DATE,
          confidence: 0.9
        });
      });
    }

    // Extract Money
    const moneyPattern = /\$\d+|\d+\s*(دولار|ريال|جنيه|dollar|usd|sar)/gi;
    const money = query.match(moneyPattern);
    if (money) {
      money.forEach(amount => {
        entities.push({
          text: amount,
          type: EntityType.MONEY,
          confidence: 0.95
        });
      });
    }

    // Extract Percentages
    const percentPattern = /\d+\s*%/g;
    const percents = query.match(percentPattern);
    if (percents) {
      percents.forEach(percent => {
        entities.push({
          text: percent,
          type: EntityType.PERCENTAGE,
          confidence: 1.0
        });
      });
    }

    return entities;
  }

  // ============================================
  // 🔑 Extract Keywords
  // ============================================

  private static extractKeywords(query: string): string[] {
    // Remove stop words
    const stopWords = new Set([
      'ال', 'في', 'من', 'إلى', 'على', 'عن', 'هو', 'هي', 'أن', 'ما', 'كيف',
      'the', 'is', 'are', 'was', 'were', 'in', 'on', 'at', 'to', 'for', 'of', 'a', 'an'
    ]);

    const words = query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2)
      .filter(word => !stopWords.has(word));

    // Get unique keywords
    return Array.from(new Set(words));
  }

  // ============================================
  // 🔍 Check if Needs Web Search
  // ============================================

  private static needsWebSearch(query: string): boolean {
    const lowerQuery = query.toLowerCase();

    // Exclude greetings
    const greetings = [
      'مرحبا', 'مرحباً', 'أهلا', 'سلام', 'hello', 'hi', 'hey',
      'كيف حالك', 'how are you', 'ما اسمك', 'what is your name'
    ];

    if (greetings.some(g => lowerQuery.includes(g))) {
      return false;
    }

    // Too short
    if (query.trim().length < 5) {
      return false;
    }

    // Search indicators
    const searchIndicators = [
      'ابحث', 'ما هو', 'من هو', 'كيف', 'متى', 'أين', 'لماذا',
      'search', 'what is', 'who is', 'how', 'when', 'where', 'why',
      'أخبار', 'news', 'سعر', 'price', 'معلومات', 'information'
    ];

    return searchIndicators.some(indicator => lowerQuery.includes(indicator));
  }

  // ============================================
  // 🎯 Suggest Best Sources
  // ============================================

  private static suggestSources(
    query: string,
    intent: QueryIntent,
    category: QueryCategory
  ): SearchSource[] {
    const sources: SearchSource[] = [];

    // Based on Intent
    switch (intent) {
      case QueryIntent.RELIGIOUS:
        sources.push(SearchSource.RELIGIOUS, SearchSource.GOOGLE);
        break;

      case QueryIntent.TECHNICAL:
        sources.push(SearchSource.STACKOVERFLOW, SearchSource.GITHUB, SearchSource.GOOGLE);
        break;

      case QueryIntent.MEDIA:
        sources.push(SearchSource.YOUTUBE, SearchSource.GOOGLE);
        break;

      case QueryIntent.ACADEMIC:
        sources.push(SearchSource.SCHOLAR, SearchSource.WIKIPEDIA, SearchSource.GOOGLE);
        break;

      case QueryIntent.NEWS:
        sources.push(SearchSource.NEWS, SearchSource.GOOGLE, SearchSource.TWITTER);
        break;

      default:
        sources.push(SearchSource.GOOGLE, SearchSource.YOUTUBE); // 🎬 دائماً نضيف YouTube
    }

    // Add Wikipedia for informational queries
    if (intent === QueryIntent.INFORMATIONAL && !sources.includes(SearchSource.WIKIPEDIA)) {
      sources.splice(1, 0, SearchSource.WIKIPEDIA);
    }

    return sources;
  }

  // ============================================
  // 📊 Calculate Confidence
  // ============================================

  private static calculateConfidence(
    intent: QueryIntent,
    category: QueryCategory,
    entities: Entity[]
  ): number {
    let confidence = 0.5; // Base confidence

    // Strong intent indicators
    const strongIntents = [
      QueryIntent.RELIGIOUS,
      QueryIntent.TECHNICAL,
      QueryIntent.ACADEMIC
    ];

    if (strongIntents.includes(intent)) {
      confidence += 0.3;
    }

    // Entities increase confidence
    if (entities.length > 0) {
      confidence += Math.min(0.2, entities.length * 0.05);
    }

    // Specific categories increase confidence
    if (category !== QueryCategory.GENERAL) {
      confidence += 0.1;
    }

    return Math.min(1.0, confidence);
  }

  // ============================================
  // 🔄 Suggest Query Improvements
  // ============================================

  static suggestImprovements(query: string): string[] {
    const suggestions: string[] = [];
    const normalized = query.trim();

    // Too short
    if (normalized.length < 10) {
      suggestions.push('جرب إضافة المزيد من التفاصيل لنتائج أفضل');
    }

    // No question words
    if (!/كيف|ما|من|متى|أين|لماذا|how|what|who|when|where|why/.test(normalized)) {
      suggestions.push('ابدأ سؤالك بـ "ما هو" أو "كيف" للحصول على إجابات أفضل');
    }

    return suggestions;
  }
}

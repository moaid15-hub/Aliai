// ============================================
// 🎯 SearchStrategy - استراتيجية البحث المتقدم
// ============================================

import { QueryAnalysis } from './QueryAnalyzer';
import { SearchSource, SearchResult } from './types';

export class SearchStrategy {
  /**
   * اختيار المصادر المناسبة بناءً على تحليل الاستعلام
   */
  selectSources(analysis: QueryAnalysis): SearchSource[] {
    const sources: SearchSource[] = [];

    // Always include general search
    sources.push('google');

    // Add specialized sources based on query type
    switch (analysis.queryType) {
      case 'news':
        sources.push('google_news', 'bing_news');
        break;

      case 'howto':
        sources.push('youtube');
        break;

      case 'factual':
        sources.push('wikipedia');
        break;
    }

    // Add sources based on timeframe
    if (analysis.timeframe === 'real-time') {
      sources.push('twitter_api'); // إذا متاح
    }

    // Language-specific sources
    if (analysis.language === 'ar') {
      sources.push('arabic_sources');
    }

    return sources;
  }

  /**
   * تنفيذ البحث على مصادر متعددة بالتوازي
   */
  async executeSearch(
    query: string,
    sources: SearchSource[]
  ): Promise<SearchResult[]> {
    // Execute searches in parallel
    const promises = sources.map(source =>
      this.searchWithSource(query, source)
        .catch(error => {
          console.error(`${source} failed:`, error);
          return [];
        })
    );

    const results = await Promise.all(promises);

    // Merge and deduplicate
    return this.mergeAndRank(results.flat());
  }

  /**
   * البحث في مصدر محدد
   */
  private async searchWithSource(
    query: string,
    source: SearchSource
  ): Promise<SearchResult[]> {
    // هنا يمكن استخدام الدوال الموجودة في النظام
    // مثلاً استدعاء searchWeb من lib/web-search

    console.log(`🔍 Searching ${source}:`, query);

    // Placeholder - سيتم ربطه بالنظام الموجود
    return [];
  }

  /**
   * دمج النتائج وترتيبها
   */
  private mergeAndRank(results: SearchResult[]): SearchResult[] {
    // 1. Remove duplicates
    const unique = this.deduplicateByURL(results);

    // 2. Calculate relevance scores
    const scored = unique.map(r => ({
      ...r,
      score: this.calculateRelevanceScore(r)
    }));

    // 3. Sort by score
    scored.sort((a, b) => (b.score || 0) - (a.score || 0));

    // 4. Return top results (3 فيديوهات فقط)
    return scored.slice(0, 3);
  }

  /**
   * إزالة التكرار بناءً على URL
   */
  private deduplicateByURL(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    return results.filter(r => {
      if (seen.has(r.url)) {
        return false;
      }
      seen.add(r.url);
      return true;
    });
  }

  /**
   * حساب درجة الأهمية
   */
  private calculateRelevanceScore(result: SearchResult): number {
    let score = 0;

    // Source authority
    const authorityScores: Record<SearchSource, number> = {
      'wikipedia': 10,
      'google': 8,
      'youtube': 7,
      'bing': 6,
      'google_news': 7,
      'bing_news': 6,
      'twitter_api': 5,
      'arabic_sources': 6
    };
    score += authorityScores[result.source] || 5;

    // Content freshness
    if (result.publishedDate) {
      const daysOld = this.getDaysOld(result.publishedDate);
      score += Math.max(0, 10 - daysOld / 30);
    }

    // Content type diversity bonus
    if (result.type === 'youtube') score += 2;

    return score;
  }

  /**
   * حساب عمر المحتوى بالأيام
   */
  private getDaysOld(dateString: string): number {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
}

// Export singleton instance
export const searchStrategy = new SearchStrategy();

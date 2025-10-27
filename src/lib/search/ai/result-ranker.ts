// ============================================
// 📊 AI-Powered Result Ranker
// نظام ترتيب النتائج الذكي
// ============================================

import { SearchResult, QueryAnalysis } from '../core/types';

// ============================================
// 🎯 Ranking Factors
// ============================================

export interface RankingFactors {
  relevanceScore: number;      // 0-100
  freshnessScore: number;       // 0-100
  authorityScore: number;       // 0-100
  qualityScore: number;         // 0-100
  diversityScore: number;       // 0-100
}

export interface RankingWeights {
  relevance: number;
  freshness: number;
  authority: number;
  quality: number;
  diversity: number;
}

// ============================================
// 📊 Result Ranker
// ============================================

export class ResultRanker {
  private static readonly DEFAULT_WEIGHTS: RankingWeights = {
    relevance: 0.40,    // 40% - الأهم
    quality: 0.25,      // 25%
    authority: 0.20,    // 20%
    freshness: 0.10,    // 10%
    diversity: 0.05     // 5%
  };

  // ============================================
  // 📊 Rank Search Results
  // ============================================

  static rank(
    results: SearchResult[],
    query: string,
    analysis?: QueryAnalysis,
    weights?: Partial<RankingWeights>
  ): SearchResult[] {
    if (results.length === 0) return [];

    const finalWeights = { ...this.DEFAULT_WEIGHTS, ...weights };

    console.log(`📊 Ranking ${results.length} results...`);

    // Calculate scores for each result
    const scoredResults = results.map(result => {
      const factors = this.calculateRankingFactors(result, query, analysis);
      const finalScore = this.calculateFinalScore(factors, finalWeights);

      return {
        ...result,
        relevanceScore: finalScore,
        _rankingFactors: factors
      };
    });

    // Sort by score (highest first)
    scoredResults.sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));

    console.log('✅ Results ranked:', {
      topScore: scoredResults[0]?.relevanceScore?.toFixed(2),
      bottomScore: scoredResults[scoredResults.length - 1]?.relevanceScore?.toFixed(2)
    });

    return scoredResults;
  }

  // ============================================
  // 🧮 Calculate Ranking Factors
  // ============================================

  private static calculateRankingFactors(
    result: SearchResult,
    query: string,
    analysis?: QueryAnalysis
  ): RankingFactors {
    return {
      relevanceScore: this.calculateRelevance(result, query, analysis),
      freshnessScore: this.calculateFreshness(result),
      authorityScore: this.calculateAuthority(result),
      qualityScore: this.calculateQuality(result),
      diversityScore: this.calculateDiversity(result)
    };
  }

  // ============================================
  // 🎯 Calculate Relevance Score
  // ============================================

  private static calculateRelevance(
    result: SearchResult,
    query: string,
    analysis?: QueryAnalysis
  ): number {
    let score = 0;
    const queryLower = query.toLowerCase();
    const titleLower = result.title.toLowerCase();
    const snippetLower = result.snippet.toLowerCase();
    const contentLower = result.content.toLowerCase();

    // Exact match in title (40 points)
    if (titleLower.includes(queryLower)) {
      score += 40;
    }

    // Keywords in title (20 points)
    const keywords = analysis?.keywords || this.extractSimpleKeywords(query);
    const titleMatches = keywords.filter(kw => titleLower.includes(kw.toLowerCase())).length;
    score += Math.min(20, titleMatches * 5);

    // Keywords in snippet (20 points)
    const snippetMatches = keywords.filter(kw => snippetLower.includes(kw.toLowerCase())).length;
    score += Math.min(20, snippetMatches * 4);

    // Keywords in content (10 points)
    const contentMatches = keywords.filter(kw => contentLower.includes(kw.toLowerCase())).length;
    score += Math.min(10, contentMatches * 2);

    // Position bonus - earlier results tend to be more relevant (10 points)
    if (result.relevanceScore) {
      score += Math.min(10, result.relevanceScore * 10);
    }

    return Math.min(100, score);
  }

  // ============================================
  // ⏰ Calculate Freshness Score
  // ============================================

  private static calculateFreshness(result: SearchResult): number {
    if (!result.publishDate) return 50; // Neutral score if no date

    try {
      const publishDate = new Date(result.publishDate);
      const now = new Date();
      const ageInDays = (now.getTime() - publishDate.getTime()) / (1000 * 60 * 60 * 24);

      // Scoring based on age
      if (ageInDays < 1) return 100;        // Today
      if (ageInDays < 7) return 90;         // This week
      if (ageInDays < 30) return 75;        // This month
      if (ageInDays < 90) return 60;        // Last 3 months
      if (ageInDays < 365) return 40;       // This year
      if (ageInDays < 730) return 25;       // Last 2 years

      return 10; // Older than 2 years
    } catch {
      return 50;
    }
  }

  // ============================================
  // 🏆 Calculate Authority Score
  // ============================================

  private static calculateAuthority(result: SearchResult): number {
    let score = 50; // Base score

    // Trusted domains get higher scores
    const trustedDomains = [
      'wikipedia.org',
      'stackoverflow.com',
      'github.com',
      'youtube.com',
      'reddit.com',
      'medium.com',
      'scholar.google.com',
      'arxiv.org',
      'edu', // Educational domains
      'gov'  // Government domains
    ];

    const url = result.url.toLowerCase();
    if (trustedDomains.some(domain => url.includes(domain))) {
      score += 30;
    }

    // HTTPS bonus
    if (url.startsWith('https://')) {
      score += 10;
    }

    // Author bonus
    if (result.author) {
      score += 10;
    }

    return Math.min(100, score);
  }

  // ============================================
  // ✨ Calculate Quality Score
  // ============================================

  private static calculateQuality(result: SearchResult): number {
    let score = 0;

    // Title quality (30 points)
    if (result.title) {
      const titleLength = result.title.length;
      if (titleLength >= 20 && titleLength <= 100) {
        score += 30;
      } else if (titleLength >= 10 && titleLength <= 150) {
        score += 20;
      } else {
        score += 10;
      }
    }

    // Snippet quality (30 points)
    if (result.snippet) {
      const snippetLength = result.snippet.length;
      if (snippetLength >= 100 && snippetLength <= 300) {
        score += 30;
      } else if (snippetLength >= 50 && snippetLength <= 400) {
        score += 20;
      } else {
        score += 10;
      }
    }

    // Content quality (20 points)
    if (result.content) {
      const contentLength = result.content.length;
      if (contentLength > 500) {
        score += 20;
      } else if (contentLength > 200) {
        score += 15;
      } else if (contentLength > 50) {
        score += 10;
      }
    }

    // Metadata bonus (20 points)
    if (result.thumbnail) score += 5;
    if (result.author) score += 5;
    if (result.publishDate) score += 5;
    if (result.displayLink) score += 5;

    return Math.min(100, score);
  }

  // ============================================
  // 🎨 Calculate Diversity Score
  // ============================================

  private static calculateDiversity(result: SearchResult): number {
    // This is a simple implementation
    // In a real system, you'd compare with other results to ensure diversity
    let score = 50;

    // Different sources get diversity bonus
    if (result.source) {
      score += 20;
    }

    // Media content adds diversity
    if (result.thumbnail || result.image) {
      score += 15;
    }

    if (result.video) {
      score += 15;
    }

    return Math.min(100, score);
  }

  // ============================================
  // 🎯 Calculate Final Score
  // ============================================

  private static calculateFinalScore(
    factors: RankingFactors,
    weights: RankingWeights
  ): number {
    const score =
      factors.relevanceScore * weights.relevance +
      factors.freshnessScore * weights.freshness +
      factors.authorityScore * weights.authority +
      factors.qualityScore * weights.quality +
      factors.diversityScore * weights.diversity;

    return Math.round(score * 100) / 100;
  }

  // ============================================
  // 🧹 Remove Duplicates
  // ============================================

  static deduplicateResults(results: SearchResult[]): SearchResult[] {
    const seen = new Set<string>();
    const unique: SearchResult[] = [];

    for (const result of results) {
      // Create a signature for the result
      const signature = this.createSignature(result);

      if (!seen.has(signature)) {
        seen.add(signature);
        unique.push(result);
      }
    }

    const removed = results.length - unique.length;
    if (removed > 0) {
      console.log(`🧹 Removed ${removed} duplicate results`);
    }

    return unique;
  }

  // ============================================
  // 🔑 Create Result Signature
  // ============================================

  private static createSignature(result: SearchResult): string {
    // Normalize URL (remove query params and trailing slash)
    const cleanUrl = result.url.split('?')[0].replace(/\/$/, '');

    // Use URL + title for signature
    return `${cleanUrl}::${result.title.toLowerCase().trim()}`;
  }

  // ============================================
  // 🎯 Diversify Results
  // ============================================

  static diversifyResults(results: SearchResult[], maxPerSource: number = 3): SearchResult[] {
    const sourceCount = new Map<string, number>();
    const diversified: SearchResult[] = [];

    for (const result of results) {
      const source = result.source;
      const count = sourceCount.get(source) || 0;

      if (count < maxPerSource) {
        diversified.push(result);
        sourceCount.set(source, count + 1);
      }
    }

    const removed = results.length - diversified.length;
    if (removed > 0) {
      console.log(`🎨 Diversified results: ${removed} results filtered for balance`);
    }

    return diversified;
  }

  // ============================================
  // 🔑 Extract Simple Keywords
  // ============================================

  private static extractSimpleKeywords(query: string): string[] {
    const stopWords = new Set([
      'ال', 'في', 'من', 'إلى', 'على', 'عن', 'هو', 'هي', 'the', 'is', 'are', 'in', 'on', 'at'
    ]);

    return query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word));
  }

  // ============================================
  // 📊 Group by Source
  // ============================================

  static groupBySource(results: SearchResult[]): Map<string, SearchResult[]> {
    const grouped = new Map<string, SearchResult[]>();

    for (const result of results) {
      const source = result.source;
      const group = grouped.get(source) || [];
      group.push(result);
      grouped.set(source, group);
    }

    return grouped;
  }

  // ============================================
  // 🎯 Boost Results by Criteria
  // ============================================

  static boostResults(
    results: SearchResult[],
    boostCriteria: (result: SearchResult) => number
  ): SearchResult[] {
    return results.map(result => ({
      ...result,
      relevanceScore: (result.relevanceScore || 0) + boostCriteria(result)
    }));
  }
}

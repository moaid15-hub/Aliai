// ============================================
// 📦 Search System - Main Export
// نظام البحث الاحترافي الشامل
// ============================================

// ============================================
// 🔍 Core Exports
// ============================================

export { searchEngine, SearchEngine } from './core/search-engine';
export {
  MultiLevelCacheManager,
  CacheKeyGenerator,
  CacheStrategy,
  globalCacheManager
} from './core/cache-manager';
export {
  RateLimiter,
  UsageTracker,
  globalRateLimiter,
  globalUsageTracker
} from './core/rate-limiter';

// ============================================
// 📝 Types Exports
// ============================================

export type {
  SearchResult,
  SearchResponse,
  MultiSourceResponse,
  SearchOptions,
  SourceResults,
  QueryAnalysis,
  Entity,
  SearchConfig,
  PerformanceMetrics,
  RateLimitInfo,
  ProviderQuota,
  CacheEntry,
  FormatOptions
} from './core/types';

// Export enums with both names for compatibility
export {
  SearchSource,
  SearchSource as SearchSourceEnum,
  QueryIntent,
  QueryIntent as QueryIntentEnum,
  QueryCategory,
  QueryCategory as QueryCategoryEnum,
  EntityType,
  EntityType as EntityTypeEnum
} from './core/types';

// ============================================
// 🧠 AI Exports
// ============================================

export { QueryAnalyzer } from './ai/query-analyzer';
export { ResultRanker, type RankingFactors, type RankingWeights } from './ai/result-ranker';

// ============================================
// 🔌 Providers Exports
// ============================================

export { BaseSearchProvider, ProviderFactory } from './providers/base-provider';
export { GoogleSearchProvider, googleSearchProvider } from './providers/google-provider';
export { YouTubeSearchProvider, youtubeSearchProvider } from './providers/youtube-provider';
export { WikipediaSearchProvider, wikipediaSearchProvider } from './providers/wikipedia-provider';

// ============================================
// 🎨 Formatters Exports
// ============================================

export { MarkdownFormatter } from './formatters/markdown-formatter';

// ============================================
// 🚀 Quick Start Functions
// ============================================

import { searchEngine } from './core/search-engine';
import { SearchOptions, SearchResponse, MultiSourceResponse } from './core/types';
import { MarkdownFormatter } from './formatters/markdown-formatter';
import { QueryAnalyzer } from './ai/query-analyzer';
import { ResultRanker } from './ai/result-ranker';

/**
 * 🔍 Simple Search - البحث البسيط
 *
 * @example
 * ```typescript
 * const results = await search('ما هو الذكاء الاصطناعي؟');
 * console.log(results);
 * ```
 */
export async function search(query: string, options?: SearchOptions): Promise<SearchResponse> {
  return await searchEngine.search(query, options);
}

/**
 * 🌐 Multi-Source Search - البحث متعدد المصادر
 *
 * @example
 * ```typescript
 * const results = await multiSearch('شرح React');
 * console.log(results);
 * ```
 */
export async function multiSearch(query: string, options?: SearchOptions): Promise<MultiSourceResponse> {
  return await searchEngine.multiSourceSearch(query, options);
}

/**
 * 📝 Search and Format - البحث مع التنسيق
 *
 * @example
 * ```typescript
 * const markdown = await searchAndFormat('أخبار التقنية');
 * console.log(markdown);
 * ```
 */
export async function searchAndFormat(query: string, options?: SearchOptions): Promise<string> {
  const response = await searchEngine.search(query, options);
  return MarkdownFormatter.formatSearchResponse(response);
}

/**
 * 📊 Get Search Statistics - الحصول على الإحصائيات
 *
 * @example
 * ```typescript
 * const stats = getSearchStats();
 * console.log(stats);
 * ```
 */
export function getSearchStats() {
  return searchEngine.getStatistics();
}

/**
 * 🧹 Clear Search Cache - مسح التخزين المؤقت
 *
 * @example
 * ```typescript
 * clearSearchCache();
 * ```
 */
export function clearSearchCache(): void {
  searchEngine.clearCache();
}

// ============================================
// 📚 Default Export
// ============================================

export default {
  search,
  multiSearch,
  searchAndFormat,
  getSearchStats,
  clearSearchCache,

  // Core
  searchEngine,

  // AI
  QueryAnalyzer,
  ResultRanker,

  // Formatters
  MarkdownFormatter
};

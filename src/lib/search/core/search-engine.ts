// ============================================
// 🚀 Main Search Engine
// محرك البحث الرئيسي - قلب النظام
// ============================================

import {
  SearchResult,
  SearchOptions,
  SearchResponse,
  MultiSourceResponse,
  SearchSource,
  SourceResults
} from './types';

import { QueryAnalyzer } from '../ai/query-analyzer';
import { ResultRanker } from '../ai/result-ranker';
import { globalCacheManager, CacheKeyGenerator } from './cache-manager';
import { globalRateLimiter, globalUsageTracker } from './rate-limiter';

import { BaseSearchProvider, ProviderFactory } from '../providers/base-provider';
import { googleSearchProvider } from '../providers/google-provider';
import { youtubeSearchProvider } from '../providers/youtube-provider';
import { wikipediaSearchProvider } from '../providers/wikipedia-provider';

// ============================================
// 🚀 Professional Search Engine
// ============================================

export class SearchEngine {
  private providers: Map<SearchSource, BaseSearchProvider>;
  private initialized: boolean = false;

  constructor() {
    this.providers = new Map();
  }

  // ============================================
  // 🔧 Initialize Engine
  // ============================================

  async initialize(): Promise<void> {
    if (this.initialized) return;

    console.log('🚀 Initializing Search Engine...');

    // Register providers
    ProviderFactory.register(googleSearchProvider);
    ProviderFactory.register(youtubeSearchProvider);
    ProviderFactory.register(wikipediaSearchProvider);

    // Get all providers
    const allProviders = ProviderFactory.getAll();

    for (const provider of allProviders) {
      this.providers.set(provider.getSource(), provider);
    }

    this.initialized = true;

    console.log(`✅ Search Engine initialized with ${this.providers.size} providers`);
  }

  // ============================================
  // 🔍 Main Search Function
  // ============================================

  async search(query: string, options?: SearchOptions): Promise<SearchResponse> {
    await this.initialize();

    const startTime = Date.now();

    try {
      console.log(`\n🔍 ========== NEW SEARCH ==========`);
      console.log(`Query: "${query}"`);

      // 1. Analyze Query
      const analysis = QueryAnalyzer.analyze(query);

      console.log(`Intent: ${analysis.intent}, Category: ${analysis.category}`);
      console.log(`Suggested Sources: ${analysis.suggestedSources.join(', ')}`);

      // 2. Check Cache
      const cacheKey = CacheKeyGenerator.search(query, options);
      const cached = globalCacheManager.get<SearchResponse>(cacheKey);

      if (cached) {
        console.log('✅ Returning cached results');
        return {
          ...cached,
          cached: true,
          searchTime: Date.now() - startTime
        };
      }

      // 3. Determine Sources
      const sources = options?.sources || analysis.suggestedSources.slice(0, 3);

      // 4. Search from sources
      const results = await this.searchFromSources(query, sources, options);

      // 5. Rank results
      const rankedResults = ResultRanker.rank(results, query, analysis);

      // 6. Deduplicate
      const uniqueResults = ResultRanker.deduplicateResults(rankedResults);

      // 7. Limit results
      const maxResults = options?.maxResults || 10;
      const finalResults = uniqueResults.slice(0, maxResults);

      // 8. Build response
      const response: SearchResponse = {
        query,
        results: finalResults,
        totalResults: finalResults.length,
        searchTime: Date.now() - startTime,
        sources: sources,
        cached: false,
        suggestions: this.generateSuggestions(query, analysis)
      };

      // 9. Cache result
      globalCacheManager.set(cacheKey, response, {
        tags: ['search', analysis.category]
      });

      console.log(`✅ Search completed: ${finalResults.length} results in ${response.searchTime}ms`);
      console.log(`================================\n`);

      return response;

    } catch (error: any) {
      console.error('❌ Search Engine Error:', error);

      throw new Error(`Search failed: ${error.message}`);
    }
  }

  // ============================================
  // 🌐 Multi-Source Search
  // ============================================

  async multiSourceSearch(
    query: string,
    options?: SearchOptions
  ): Promise<MultiSourceResponse> {
    await this.initialize();

    const startTime = Date.now();

    try {
      console.log(`\n🌐 ========== MULTI-SOURCE SEARCH ==========`);
      console.log(`Query: "${query}"`);

      // Analyze query
      const analysis = QueryAnalyzer.analyze(query);

      // Get suggested sources
      const sources = analysis.suggestedSources.slice(0, 5);

      console.log(`Searching ${sources.length} sources: ${sources.join(', ')}`);

      // Search all sources in parallel
      const sourceResultsPromises = sources.map(source =>
        this.searchSingleSource(query, source, options)
      );

      const allSourceResults = await Promise.allSettled(sourceResultsPromises);

      // Process results
      const successfulResults: SourceResults[] = [];
      const allResults: SearchResult[] = [];

      for (let i = 0; i < allSourceResults.length; i++) {
        const result = allSourceResults[i];

        if (result.status === 'fulfilled' && result.value) {
          successfulResults.push(result.value);
          allResults.push(...result.value.results);
        }
      }

      // Determine primary source (best results)
      const primarySource = successfulResults[0] || this.createEmptySourceResults(sources[0]);

      // Rank all results
      const rankedResults = ResultRanker.rank(allResults, query, analysis);

      // Deduplicate
      const uniqueResults = ResultRanker.deduplicateResults(rankedResults);

      // Build response
      const response: MultiSourceResponse = {
        query,
        primarySource,
        additionalSources: successfulResults.slice(1),
        aggregatedResults: uniqueResults,
        totalResults: uniqueResults.length,
        searchTime: Date.now() - startTime
      };

      console.log(`✅ Multi-source search: ${uniqueResults.length} total results from ${successfulResults.length} sources`);
      console.log(`==========================================\n`);

      return response;

    } catch (error: any) {
      console.error('❌ Multi-Source Search Error:', error);
      throw error;
    }
  }

  // ============================================
  // 🔍 Search from Multiple Sources
  // ============================================

  private async searchFromSources(
    query: string,
    sources: SearchSource[],
    options?: SearchOptions
  ): Promise<SearchResult[]> {
    const allResults: SearchResult[] = [];

    // Search sources in order of priority
    for (const source of sources) {
      try {
        const sourceResults = await this.searchSingleSource(query, source, options);

        if (sourceResults && sourceResults.results.length > 0) {
          allResults.push(...sourceResults.results);

          // If we have enough results, stop
          const maxResults = options?.maxResults || 10;
          if (allResults.length >= maxResults * 2) {
            break;
          }
        }
      } catch (error) {
        console.warn(`⚠️ Failed to search ${source}:`, error);
        // Continue with next source
      }
    }

    return allResults;
  }

  // ============================================
  // 🔍 Search Single Source
  // ============================================

  private async searchSingleSource(
    query: string,
    source: SearchSource,
    options?: SearchOptions
  ): Promise<SourceResults | null> {
    const provider = this.providers.get(source);

    if (!provider) {
      console.warn(`⚠️ Provider not found for source: ${source}`);
      return null;
    }

    // Check rate limit
    const rateLimitInfo = await globalRateLimiter.consume(source);

    if (rateLimitInfo.remaining === 0) {
      console.warn(`⚠️ Rate limit reached for ${source}`);
      return null;
    }

    // Check if available
    const available = await provider.isAvailable();

    if (!available) {
      console.warn(`⚠️ Provider ${source} not available`);
      return null;
    }

    try {
      const startTime = Date.now();

      // Track usage
      globalUsageTracker.incrementUsage(source);

      // 🎬 تخصيص maxResults لليوتيوب (الحد الأقصى 3 فيديوهات)
      let providerOptions = options;
      if (source === SearchSource.YOUTUBE) {
        providerOptions = {
          ...options,
          maxResults: 3
        };
        console.log('🎬 تحديد عدد فيديوهات YouTube إلى 3');
      }

      // Search
      const results = await provider.search(query, providerOptions);

      const searchTime = Date.now() - startTime;

      // Record success
      globalUsageTracker.recordSuccess(source);

      return {
        source,
        sourceLabel: provider.getName(),
        icon: this.getSourceIcon(source),
        results,
        totalResults: results.length,
        searchTime
      };

    } catch (error: any) {
      console.error(`❌ Error searching ${source}:`, error);

      // Record failure
      globalUsageTracker.recordFailure(source);

      return null;
    }
  }

  // ============================================
  // 🎨 Get Source Icon
  // ============================================

  private getSourceIcon(source: SearchSource): string {
    const icons: Record<SearchSource, string> = {
      [SearchSource.GOOGLE]: '🔍',
      [SearchSource.YOUTUBE]: '📹',
      [SearchSource.WIKIPEDIA]: '📚',
      [SearchSource.STACKOVERFLOW]: '💻',
      [SearchSource.GITHUB]: '🐙',
      [SearchSource.REDDIT]: '🤖',
      [SearchSource.TWITTER]: '🐦',
      [SearchSource.TAVILY]: '🔎',
      [SearchSource.PERPLEXITY]: '🧠',
      [SearchSource.BING]: '🔎',
      [SearchSource.DUCKDUCKGO]: '🦆',
      [SearchSource.BRAVE]: '🦁',
      [SearchSource.SCHOLAR]: '🎓',
      [SearchSource.NEWS]: '📰',
      [SearchSource.RELIGIOUS]: '🕌',
      [SearchSource.CUSTOM]: '⚙️'
    };

    return icons[source] || '🔍';
  }

  // ============================================
  // 💡 Generate Suggestions
  // ============================================

  private generateSuggestions(query: string, analysis: any): string[] {
    const suggestions: string[] = [];

    // Add related keywords
    if (analysis.keywords.length > 0) {
      const mainKeyword = analysis.keywords[0];
      suggestions.push(`${mainKeyword} شرح`);
      suggestions.push(`${mainKeyword} بالعربي`);
    }

    // Add category-based suggestions
    if (analysis.category) {
      suggestions.push(`${query} تعلم`);
      suggestions.push(`${query} دليل`);
    }

    return suggestions.slice(0, 5);
  }

  // ============================================
  // 📊 Create Empty Source Results
  // ============================================

  private createEmptySourceResults(source: SearchSource): SourceResults {
    return {
      source,
      sourceLabel: source,
      icon: this.getSourceIcon(source),
      results: [],
      totalResults: 0,
      searchTime: 0
    };
  }

  // ============================================
  // 📊 Get Statistics
  // ============================================

  getStatistics() {
    return {
      cache: globalCacheManager.getStats(),
      usage: globalUsageTracker.getStats(),
      providers: Array.from(this.providers.entries()).map(([source, provider]) => ({
        source,
        name: provider.getName(),
        priority: provider.getPriority()
      }))
    };
  }

  // ============================================
  // 🧹 Clear Cache
  // ============================================

  clearCache(): void {
    globalCacheManager.clear();
    console.log('🧹 Search cache cleared');
  }
}

// ============================================
// 🌍 Export Global Instance
// ============================================

export const searchEngine = new SearchEngine();

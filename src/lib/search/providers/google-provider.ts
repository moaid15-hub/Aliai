// ============================================
// 🔍 Google Search Provider
// مزود بحث جوجل
// ============================================

import { BaseSearchProvider } from './base-provider';
import { SearchResult, SearchOptions, SearchSource, ProviderQuota } from '../core/types';

// ============================================
// 🔍 Google Search Provider
// ============================================

export class GoogleSearchProvider extends BaseSearchProvider {
  private searchEngineId: string;
  private requestCount: number = 0;
  private readonly DAILY_LIMIT = 100;

  constructor(apiKey?: string, searchEngineId?: string) {
    super(
      'Google Custom Search',
      SearchSource.GOOGLE,
      10, // Highest priority
      apiKey || process.env.GOOGLE_SEARCH_API_KEY
    );

    this.searchEngineId = searchEngineId || process.env.GOOGLE_SEARCH_ENGINE_ID || '';
    this.baseUrl = 'https://www.googleapis.com/customsearch/v1';
  }

  // ============================================
  // 🔍 Search Implementation
  // ============================================

  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    if (!this.apiKey || !this.searchEngineId) {
      console.warn('⚠️ Google Search: API key or Search Engine ID not configured');
      return [];
    }

    const maxResults = options?.maxResults || 10;
    const language = options?.language || 'ar';
    const country = options?.country || 'sa';
    const safeSearch = options?.safeSearch || 'medium';
    const timeout = options?.timeout || 10000;

    try {
      console.log(`🔍 Google Search: "${query}"`);

      // Build query params
      const params = new URLSearchParams({
        key: this.apiKey,
        cx: this.searchEngineId,
        q: query,
        num: String(Math.min(maxResults, 10)), // Max 10 per request
        lr: `lang_${language}`,
        gl: country,
        safe: safeSearch === 'off' ? 'off' : 'active'
      });

      // Add date range if specified
      if (options?.dateRange?.preset) {
        params.append('dateRestrict', this.getDateRestrict(options.dateRange.preset));
      }

      // Add exact match if specified
      if (options?.exactMatch) {
        params.set('q', `"${query}"`);
      }

      const url = `${this.baseUrl}?${params}`;

      const response = await this.fetchWithTimeout(url, {}, timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Check for errors
      if (data.error) {
        throw new Error(data.error.message || 'Google API Error');
      }

      this.requestCount++;

      // Parse results
      const results = this.parseResults(data);

      console.log(`✅ Google Search: ${results.length} results found`);

      return results;

    } catch (error: any) {
      this.handleError(error, 'search');
    }
  }

  // ============================================
  // 📊 Parse Google Results
  // ============================================

  private parseResults(data: any): SearchResult[] {
    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }

    return data.items.map((item: any, index: number) => {
      const result: SearchResult = {
        id: item.cacheId || `google-${index}`,
        title: item.title || 'No Title',
        url: item.link || '',
        snippet: item.snippet || '',
        content: item.snippet || '',
        source: SearchSource.GOOGLE,
        displayLink: item.displayLink,
        formattedUrl: item.formattedUrl,
        relevanceScore: 1 - (index * 0.1), // Decrease with position

        // Image
        image: item.pagemap?.cse_image?.[0] ? {
          url: item.pagemap.cse_image[0].src,
          thumbnailUrl: item.pagemap.cse_thumbnail?.[0]?.src,
          width: item.pagemap.cse_image[0].width,
          height: item.pagemap.cse_image[0].height
        } : undefined,

        // Metadata
        metadata: {
          kind: item.kind,
          htmlTitle: item.htmlTitle,
          htmlSnippet: item.htmlSnippet,
          pagemap: item.pagemap
        }
      };

      // Extract thumbnail
      if (item.pagemap?.cse_thumbnail?.[0]) {
        result.thumbnail = item.pagemap.cse_thumbnail[0].src;
      }

      // Extract publish date from pagemap
      if (item.pagemap?.metatags?.[0]) {
        const metatags = item.pagemap.metatags[0];
        result.publishDate =
          metatags['article:published_time'] ||
          metatags['datePublished'] ||
          metatags['date'];

        result.author =
          metatags['author'] ||
          metatags['article:author'];
      }

      return result;
    });
  }

  // ============================================
  // 📅 Get Date Restrict Parameter
  // ============================================

  private getDateRestrict(preset: string): string {
    switch (preset) {
      case 'today':
        return 'd1';
      case 'week':
        return 'w1';
      case 'month':
        return 'm1';
      case 'year':
        return 'y1';
      default:
        return 'm1';
    }
  }

  // ============================================
  // ✅ Check Availability
  // ============================================

  async isAvailable(): Promise<boolean> {
    if (!this.apiKey || !this.searchEngineId) {
      return false;
    }

    // Check quota
    const quota = await this.getQuota();
    return quota.remaining > 0;
  }

  // ============================================
  // 📊 Get Quota
  // ============================================

  async getQuota(): Promise<ProviderQuota> {
    return {
      used: this.requestCount,
      limit: this.DAILY_LIMIT,
      remaining: Math.max(0, this.DAILY_LIMIT - this.requestCount),
      resetAt: this.getNextResetDate()
    };
  }

  // ============================================
  // 🔄 Get Next Reset Date
  // ============================================

  private getNextResetDate(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  // ============================================
  // 🔄 Reset Daily Count
  // ============================================

  resetDailyCount(): void {
    this.requestCount = 0;
    console.log('🔄 Google Search: Daily count reset');
  }
}

// ============================================
// 🌍 Export default instance
// ============================================

export const googleSearchProvider = new GoogleSearchProvider();

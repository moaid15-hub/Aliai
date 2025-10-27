// ============================================
// 📚 Wikipedia Search Provider
// مزود بحث ويكيبيديا (مجاني)
// ============================================

import { BaseSearchProvider } from './base-provider';
import { SearchResult, SearchOptions, SearchSource, ProviderQuota } from '../core/types';

// ============================================
// 📚 Wikipedia Search Provider
// ============================================

export class WikipediaSearchProvider extends BaseSearchProvider {
  private requestCount: number = 0;

  constructor() {
    super(
      'Wikipedia API',
      SearchSource.WIKIPEDIA,
      7, // Good for informational queries
      undefined // No API key needed!
    );

    this.baseUrl = 'https://ar.wikipedia.org/w/api.php'; // Arabic Wikipedia
  }

  // ============================================
  // 🔍 Search Implementation
  // ============================================

  async search(query: string, options?: SearchOptions): Promise<SearchResult[]> {
    const maxResults = options?.maxResults || 10;
    const language = options?.language || 'ar';
    const timeout = options?.timeout || 10000;

    // Choose language-specific Wikipedia
    const baseUrl = language === 'ar'
      ? 'https://ar.wikipedia.org/w/api.php'
      : 'https://en.wikipedia.org/w/api.php';

    try {
      console.log(`📚 Wikipedia Search: "${query}"`);

      // Build query params for search
      const searchParams = new URLSearchParams({
        action: 'opensearch',
        search: query,
        limit: String(maxResults),
        namespace: '0',
        format: 'json',
        origin: '*' // CORS
      });

      const searchUrl = `${baseUrl}?${searchParams}`;

      const response = await this.fetchWithTimeout(searchUrl, {}, timeout);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      this.requestCount++;

      // Parse results
      const results = await this.parseResults(data, baseUrl, timeout);

      console.log(`✅ Wikipedia Search: ${results.length} results found`);

      return results;

    } catch (error: any) {
      this.handleError(error, 'search');
    }
  }

  // ============================================
  // 📊 Parse Wikipedia Results
  // ============================================

  private async parseResults(
    data: any,
    baseUrl: string,
    timeout: number
  ): Promise<SearchResult[]> {
    if (!Array.isArray(data) || data.length < 4) {
      return [];
    }

    const [query, titles, descriptions, urls] = data;

    const results: SearchResult[] = [];

    for (let i = 0; i < titles.length; i++) {
      const title = titles[i];
      const description = descriptions[i] || '';
      const url = urls[i] || '';

      // Get page extract (summary)
      const extract = await this.getPageExtract(title, baseUrl, timeout);

      // Get page image
      const image = await this.getPageImage(title, baseUrl, timeout);

      results.push({
        id: `wiki-${i}`,
        title: title,
        url: url,
        snippet: description || extract.substring(0, 200),
        content: extract,
        source: SearchSource.WIKIPEDIA,
        displayLink: 'wikipedia.org',
        relevanceScore: 1 - (i * 0.1),
        thumbnail: image,

        metadata: {
          language: baseUrl.includes('ar.wikipedia') ? 'ar' : 'en',
          type: 'encyclopedia'
        }
      });
    }

    return results;
  }

  // ============================================
  // 📄 Get Page Extract (Summary)
  // ============================================

  private async getPageExtract(title: string, baseUrl: string, timeout: number): Promise<string> {
    try {
      const params = new URLSearchParams({
        action: 'query',
        prop: 'extracts',
        exintro: 'true',
        explaintext: 'true',
        titles: title,
        format: 'json',
        origin: '*'
      });

      const url = `${baseUrl}?${params}`;

      const response = await this.fetchWithTimeout(url, {}, timeout);

      if (!response.ok) {
        return '';
      }

      const data = await response.json();

      const pages = data.query?.pages;
      if (!pages) return '';

      const pageId = Object.keys(pages)[0];
      return pages[pageId]?.extract || '';

    } catch (error) {
      console.warn('⚠️ Failed to get page extract:', error);
      return '';
    }
  }

  // ============================================
  // 🖼️ Get Page Image
  // ============================================

  private async getPageImage(title: string, baseUrl: string, timeout: number): Promise<string | undefined> {
    try {
      const params = new URLSearchParams({
        action: 'query',
        prop: 'pageimages',
        titles: title,
        pithumbsize: '300',
        format: 'json',
        origin: '*'
      });

      const url = `${baseUrl}?${params}`;

      const response = await this.fetchWithTimeout(url, {}, timeout);

      if (!response.ok) {
        return undefined;
      }

      const data = await response.json();

      const pages = data.query?.pages;
      if (!pages) return undefined;

      const pageId = Object.keys(pages)[0];
      return pages[pageId]?.thumbnail?.source;

    } catch (error) {
      console.warn('⚠️ Failed to get page image:', error);
      return undefined;
    }
  }

  // ============================================
  // ✅ Check Availability
  // ============================================

  async isAvailable(): Promise<boolean> {
    // Wikipedia API is always available (no key needed!)
    return true;
  }

  // ============================================
  // 📊 Get Quota
  // ============================================

  async getQuota(): Promise<ProviderQuota> {
    // No quota limits for Wikipedia API
    return {
      used: this.requestCount,
      limit: Infinity,
      remaining: Infinity
    };
  }
}

// ============================================
// 🌍 Export default instance
// ============================================

export const wikipediaSearchProvider = new WikipediaSearchProvider();

// ============================================
// 🔌 Base Search Provider
// الواجهة الأساسية لجميع مزودي البحث
// ============================================

import { SearchResult, SearchOptions, SearchSource, ProviderQuota } from '../core/types';

// ============================================
// 🎯 Abstract Base Provider
// ============================================

export abstract class BaseSearchProvider {
  protected name: string;
  protected source: SearchSource;
  protected priority: number;
  protected apiKey?: string;
  protected baseUrl?: string;

  constructor(
    name: string,
    source: SearchSource,
    priority: number = 5,
    apiKey?: string
  ) {
    this.name = name;
    this.source = source;
    this.priority = priority;
    this.apiKey = apiKey;
  }

  // ============================================
  // 🔍 Abstract Methods - Must be implemented
  // ============================================

  abstract search(query: string, options?: SearchOptions): Promise<SearchResult[]>;

  abstract isAvailable(): Promise<boolean>;

  abstract getQuota(): Promise<ProviderQuota>;

  // ============================================
  // 📊 Common Helper Methods
  // ============================================

  protected async fetchWithTimeout(
    url: string,
    options: RequestInit = {},
    timeout: number = 10000
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      clearTimeout(timeoutId);
      throw error;
    }
  }

  protected handleError(error: any, context: string): never {
    console.error(`❌ ${this.name} Error (${context}):`, error);

    if (error.name === 'AbortError') {
      throw new Error(`${this.name}: Request timeout`);
    }

    throw new Error(`${this.name}: ${error.message || 'Unknown error'}`);
  }

  protected normalizeResult(rawResult: any): SearchResult {
    return {
      title: rawResult.title || 'No Title',
      url: rawResult.url || rawResult.link || '',
      snippet: rawResult.snippet || rawResult.description || '',
      content: rawResult.content || rawResult.snippet || rawResult.description || '',
      source: this.source,
      relevanceScore: rawResult.relevanceScore || 0,
      displayLink: rawResult.displayLink,
      thumbnail: rawResult.thumbnail,
      publishDate: rawResult.publishDate,
      author: rawResult.author
    };
  }

  // ============================================
  // 📊 Provider Info
  // ============================================

  getInfo() {
    return {
      name: this.name,
      source: this.source,
      priority: this.priority,
      hasApiKey: !!this.apiKey
    };
  }

  getName(): string {
    return this.name;
  }

  getSource(): SearchSource {
    return this.source;
  }

  getPriority(): number {
    return this.priority;
  }

  setPriority(priority: number): void {
    this.priority = priority;
  }
}

// ============================================
// 🎯 Provider Factory
// ============================================

export class ProviderFactory {
  private static providers: Map<SearchSource, BaseSearchProvider> = new Map();

  static register(provider: BaseSearchProvider): void {
    this.providers.set(provider.getSource(), provider);
    console.log(`✅ Registered provider: ${provider.getName()}`);
  }

  static get(source: SearchSource): BaseSearchProvider | undefined {
    return this.providers.get(source);
  }

  static getAll(): BaseSearchProvider[] {
    return Array.from(this.providers.values());
  }

  static getAvailable(): Promise<BaseSearchProvider[]> {
    return Promise.all(
      Array.from(this.providers.values()).map(async provider => ({
        provider,
        available: await provider.isAvailable()
      }))
    ).then(results =>
      results
        .filter(r => r.available)
        .map(r => r.provider)
        .sort((a, b) => b.getPriority() - a.getPriority())
    );
  }
}

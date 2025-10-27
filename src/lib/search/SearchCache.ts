// ============================================
// 💾 SearchCache - نظام التخزين المؤقت للبحث
// ============================================

import { SearchResult } from './types';

/**
 * نظام تخزين مؤقت بسيط في الذاكرة
 * في Production يُنصح باستخدام Redis
 */
export class SearchCache {
  private cache = new Map<string, { data: SearchResult[]; expiry: number }>();
  private TTL = 3600000; // 1 hour in milliseconds

  async get(query: string): Promise<SearchResult[] | null> {
    const key = this.getCacheKey(query);
    const cached = this.cache.get(key);

    if (cached) {
      // Check if expired
      if (Date.now() > cached.expiry) {
        this.cache.delete(key);
        return null;
      }

      console.log('✅ Cache hit:', query);
      return cached.data;
    }

    return null;
  }

  async set(query: string, results: SearchResult[]): Promise<void> {
    const key = this.getCacheKey(query);
    this.cache.set(key, {
      data: results,
      expiry: Date.now() + this.TTL
    });
    console.log('💾 Cached:', query);
  }

  private getCacheKey(query: string): string {
    return `search:${query.toLowerCase().trim()}`;
  }

  /**
   * مسح الكاش المنتهي صلاحيته
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now > value.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const searchCache = new SearchCache();

// تنظيف الكاش كل 10 دقائق
setInterval(() => {
  searchCache.cleanup();
}, 600000);

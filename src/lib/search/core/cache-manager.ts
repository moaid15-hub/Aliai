// @ts-nocheck
// ============================================
// 💾 Advanced Multi-Level Cache System
// نظام التخزين المؤقت المتقدم متعدد المستويات
// ============================================

import { CacheEntry } from './types';

// 🎯 Cache Strategy
export enum CacheStrategy {
  LRU = 'lru',           // Least Recently Used
  LFU = 'lfu',           // Least Frequently Used
  FIFO = 'fifo',         // First In First Out
  TTL = 'ttl'            // Time To Live
}

// ⚙️ Cache Configuration
export interface CacheConfig {
  strategy: CacheStrategy;
  maxSize: number;
  maxAge: number;
  enableCompression?: boolean;
  persistToDisk?: boolean;
}

// ============================================
// 💾 Multi-Level Cache Manager
// ============================================

export class MultiLevelCacheManager {
  private l1Cache: Map<string, CacheEntry>;  // Memory cache (fast)
  private l2Cache: Map<string, CacheEntry>;  // Extended memory (larger)
  private config: CacheConfig;
  private stats: CacheStats;

  constructor(config?: Partial<CacheConfig>) {
    this.config = {
      strategy: CacheStrategy.LRU,
      maxSize: 500,
      maxAge: 30 * 60 * 1000, // 30 minutes
      enableCompression: false,
      persistToDisk: false,
      ...config
    };

    this.l1Cache = new Map();
    this.l2Cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      totalSize: 0
    };

    // Auto cleanup every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  // ============================================
  // 📥 Set Cache Entry
  // ============================================

  set<T>(key: string, data: T, options?: {
    ttl?: number;
    tags?: string[];
  }): void {
    const now = Date.now();
    const ttl = options?.ttl || this.config.maxAge;

    const entry: CacheEntry<T> = {
      key,
      data,
      timestamp: now,
      expiresAt: now + ttl,
      hits: 0,
      tags: options?.tags || []
    };

    // Check if we need to evict entries
    if (this.l1Cache.size >= this.config.maxSize) {
      this.evict();
    }

    this.l1Cache.set(key, entry);
    this.stats.sets++;
    this.stats.totalSize = this.l1Cache.size + this.l2Cache.size;

    console.log(`✅ Cache SET: ${key.substring(0, 50)}...`);
  }

  // ============================================
  // 📤 Get Cache Entry
  // ============================================

  get<T>(key: string): T | null {
    const now = Date.now();

    // Try L1 cache first (fast)
    let entry = this.l1Cache.get(key);
    let level = 'L1';

    // Try L2 cache if not found in L1
    if (!entry) {
      entry = this.l2Cache.get(key);
      level = 'L2';

      // Promote to L1 if found in L2
      if (entry) {
        this.l2Cache.delete(key);
        this.l1Cache.set(key, entry);
      }
    }

    // Not found in any cache
    if (!entry) {
      this.stats.misses++;
      console.log(`❌ Cache MISS: ${key.substring(0, 50)}...`);
      return null;
    }

    // Check if expired
    if (entry.expiresAt < now) {
      this.delete(key);
      this.stats.misses++;
      console.log(`⏰ Cache EXPIRED: ${key.substring(0, 50)}...`);
      return null;
    }

    // Update hit count and stats
    entry.hits++;
    this.stats.hits++;
    console.log(`✅ Cache HIT (${level}): ${key.substring(0, 50)}...`);

    return entry.data as T;
  }

  // ============================================
  // 🗑️ Delete Cache Entry
  // ============================================

  delete(key: string): boolean {
    const deleted = this.l1Cache.delete(key) || this.l2Cache.delete(key);
    if (deleted) {
      this.stats.totalSize = this.l1Cache.size + this.l2Cache.size;
      console.log(`🗑️ Cache DELETE: ${key.substring(0, 50)}...`);
    }
    return deleted;
  }

  // ============================================
  // 🏷️ Delete by Tags
  // ============================================

  deleteByTag(tag: string): number {
    let count = 0;

    for (const [key, entry] of this.l1Cache) {
      if (entry.tags?.includes(tag)) {
        this.l1Cache.delete(key);
        count++;
      }
    }

    for (const [key, entry] of this.l2Cache) {
      if (entry.tags?.includes(tag)) {
        this.l2Cache.delete(key);
        count++;
      }
    }

    this.stats.totalSize = this.l1Cache.size + this.l2Cache.size;
    console.log(`🏷️ Deleted ${count} entries with tag: ${tag}`);
    return count;
  }

  // ============================================
  // 🧹 Eviction - Remove least valuable entry
  // ============================================

  private evict(): void {
    let keyToEvict: string | null = null;

    switch (this.config.strategy) {
      case CacheStrategy.LRU:
        // Remove oldest entry
        keyToEvict = this.l1Cache.keys().next().value;
        break;

      case CacheStrategy.LFU:
        // Remove least frequently used
        let minHits = Infinity;
        for (const [key, entry] of this.l1Cache) {
          if (entry.hits < minHits) {
            minHits = entry.hits;
            keyToEvict = key;
          }
        }
        break;

      case CacheStrategy.FIFO:
        // Remove first entry
        keyToEvict = this.l1Cache.keys().next().value;
        break;

      case CacheStrategy.TTL:
        // Remove entry closest to expiration
        let earliestExpiry = Infinity;
        for (const [key, entry] of this.l1Cache) {
          if (entry.expiresAt < earliestExpiry) {
            earliestExpiry = entry.expiresAt;
            keyToEvict = key;
          }
        }
        break;
    }

    if (keyToEvict) {
      // Move to L2 cache instead of deleting
      const entry = this.l1Cache.get(keyToEvict);
      if (entry) {
        this.l2Cache.set(keyToEvict, entry);
      }

      this.l1Cache.delete(keyToEvict);
      this.stats.evictions++;
      console.log(`♻️ Cache EVICT: ${keyToEvict.substring(0, 50)}... → L2`);

      // If L2 is also full, actually delete oldest
      if (this.l2Cache.size > this.config.maxSize * 2) {
        const oldestKey = this.l2Cache.keys().next().value;
        if (oldestKey) {
          this.l2Cache.delete(oldestKey);
        }
      }
    }
  }

  // ============================================
  // 🧹 Cleanup - Remove expired entries
  // ============================================

  cleanup(): number {
    const now = Date.now();
    let cleaned = 0;

    // Cleanup L1
    for (const [key, entry] of this.l1Cache) {
      if (entry.expiresAt < now) {
        this.l1Cache.delete(key);
        cleaned++;
      }
    }

    // Cleanup L2
    for (const [key, entry] of this.l2Cache) {
      if (entry.expiresAt < now) {
        this.l2Cache.delete(key);
        cleaned++;
      }
    }

    if (cleaned > 0) {
      this.stats.totalSize = this.l1Cache.size + this.l2Cache.size;
      console.log(`🧹 Cleaned ${cleaned} expired entries`);
    }

    return cleaned;
  }

  // ============================================
  // 🗑️ Clear All Cache
  // ============================================

  clear(): void {
    this.l1Cache.clear();
    this.l2Cache.clear();
    this.stats.totalSize = 0;
    console.log('🗑️ Cache cleared completely');
  }

  // ============================================
  // 📊 Get Statistics
  // ============================================

  getStats(): CacheStats & {
    hitRate: number;
    l1Size: number;
    l2Size: number;
  } {
    const total = this.stats.hits + this.stats.misses;
    const hitRate = total > 0 ? (this.stats.hits / total) * 100 : 0;

    return {
      ...this.stats,
      hitRate: Math.round(hitRate * 100) / 100,
      l1Size: this.l1Cache.size,
      l2Size: this.l2Cache.size
    };
  }

  // ============================================
  // 🔄 Reset Statistics
  // ============================================

  resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      sets: 0,
      evictions: 0,
      totalSize: this.l1Cache.size + this.l2Cache.size
    };
    console.log('🔄 Cache statistics reset');
  }

  // ============================================
  // 🔍 Has Key
  // ============================================

  has(key: string): boolean {
    return this.l1Cache.has(key) || this.l2Cache.has(key);
  }

  // ============================================
  // 📦 Get All Keys
  // ============================================

  keys(): string[] {
    return [
      ...Array.from(this.l1Cache.keys()),
      ...Array.from(this.l2Cache.keys())
    ];
  }

  // ============================================
  // 📊 Get Size
  // ============================================

  size(): number {
    return this.l1Cache.size + this.l2Cache.size;
  }

  // ============================================
  // 🔥 Warm Cache - Preload common queries
  // ============================================

  async warm(queries: Array<{ key: string; fetcher: () => Promise<any> }>): Promise<void> {
    console.log(`🔥 Warming cache with ${queries.length} queries...`);

    const promises = queries.map(async ({ key, fetcher }) => {
      if (!this.has(key)) {
        try {
          const data = await fetcher();
          this.set(key, data);
        } catch (error) {
          console.error(`❌ Failed to warm cache for: ${key}`, error);
        }
      }
    });

    await Promise.all(promises);
    console.log('✅ Cache warming completed');
  }
}

// ============================================
// 📊 Cache Statistics Interface
// ============================================

interface CacheStats {
  hits: number;
  misses: number;
  sets: number;
  evictions: number;
  totalSize: number;
}

// ============================================
// 🌍 Global Cache Instance
// ============================================

export const globalCacheManager = new MultiLevelCacheManager({
  strategy: CacheStrategy.LRU,
  maxSize: 500,
  maxAge: 30 * 60 * 1000, // 30 minutes
  enableCompression: false
});

// ============================================
// 🔑 Cache Key Generator
// ============================================

export class CacheKeyGenerator {
  static search(query: string, options?: any): string {
    const opts = options || {};
    const parts = [
      'search',
      query.toLowerCase().trim(),
      opts.source || 'all',
      opts.maxResults || 10,
      opts.language || 'ar'
    ];
    return parts.join(':');
  }

  static query(query: string, source?: string): string {
    return `query:${source || 'all'}:${query.toLowerCase().trim()}`;
  }

  static custom(namespace: string, ...parts: any[]): string {
    return [namespace, ...parts.map(p => String(p))].join(':');
  }
}

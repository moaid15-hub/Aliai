// ============================================
// ⚡ Advanced Rate Limiter & Usage Tracker
// نظام متقدم للتحكم في معدل الاستخدام
// ============================================

import { RateLimitInfo, SearchSource } from './types';

// ============================================
// ⚡ Rate Limiter Configuration
// ============================================

export interface RateLimiterConfig {
  maxRequests: number;
  windowMs: number;
  keyGenerator?: (source: SearchSource) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  onLimitReached?: (info: RateLimitInfo) => void;
}

// ============================================
// ⚡ Rate Limiter Class
// ============================================

export class RateLimiter {
  private requests: Map<string, RequestRecord[]>;
  private config: RateLimiterConfig;

  constructor(config: Partial<RateLimiterConfig> = {}) {
    this.config = {
      maxRequests: 100,
      windowMs: 60 * 60 * 1000, // 1 hour
      keyGenerator: (source) => source,
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...config
    };

    this.requests = new Map();

    // Cleanup old records every minute
    setInterval(() => this.cleanup(), 60 * 1000);
  }

  // ============================================
  // ✅ Check if Request is Allowed
  // ============================================

  async consume(source: SearchSource): Promise<RateLimitInfo> {
    const key = this.config.keyGenerator!(source);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    // Get or create request records for this key
    let records = this.requests.get(key) || [];

    // Filter out old records outside the window
    records = records.filter(r => r.timestamp > windowStart);

    // Count requests in current window
    const requestCount = records.length;
    const remaining = Math.max(0, this.config.maxRequests - requestCount);
    const isAllowed = requestCount < this.config.maxRequests;

    // Calculate reset time
    const oldestRecord = records[0];
    const resetAt = oldestRecord
      ? new Date(oldestRecord.timestamp + this.config.windowMs)
      : new Date(now + this.config.windowMs);

    const info: RateLimitInfo = {
      requests: requestCount,
      limit: this.config.maxRequests,
      remaining,
      resetAt,
      retryAfter: isAllowed ? undefined : Math.ceil((resetAt.getTime() - now) / 1000)
    };

    if (!isAllowed) {
      console.warn(`⚠️ Rate limit reached for ${source}:`, info);
      this.config.onLimitReached?.(info);
      return info;
    }

    // Add new request record
    records.push({
      timestamp: now,
      source
    });

    this.requests.set(key, records);

    console.log(`✅ Rate limit OK for ${source}: ${remaining}/${this.config.maxRequests} remaining`);
    return info;
  }

  // ============================================
  // 📊 Get Current Status
  // ============================================

  getStatus(source: SearchSource): RateLimitInfo {
    const key = this.config.keyGenerator!(source);
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    let records = this.requests.get(key) || [];
    records = records.filter(r => r.timestamp > windowStart);

    const requestCount = records.length;
    const remaining = Math.max(0, this.config.maxRequests - requestCount);

    const oldestRecord = records[0];
    const resetAt = oldestRecord
      ? new Date(oldestRecord.timestamp + this.config.windowMs)
      : new Date(now + this.config.windowMs);

    return {
      requests: requestCount,
      limit: this.config.maxRequests,
      remaining,
      resetAt
    };
  }

  // ============================================
  // 🧹 Cleanup Old Records
  // ============================================

  private cleanup(): void {
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    let cleaned = 0;

    for (const [key, records] of this.requests) {
      const filtered = records.filter(r => r.timestamp > windowStart);

      if (filtered.length === 0) {
        this.requests.delete(key);
        cleaned++;
      } else if (filtered.length < records.length) {
        this.requests.set(key, filtered);
      }
    }

    if (cleaned > 0) {
      console.log(`🧹 Cleaned ${cleaned} expired rate limit records`);
    }
  }

  // ============================================
  // 🔄 Reset Limits
  // ============================================

  reset(source?: SearchSource): void {
    if (source) {
      const key = this.config.keyGenerator!(source);
      this.requests.delete(key);
      console.log(`🔄 Rate limit reset for ${source}`);
    } else {
      this.requests.clear();
      console.log('🔄 All rate limits reset');
    }
  }

  // ============================================
  // 📊 Get All Statistics
  // ============================================

  getAllStats(): Map<string, RateLimitInfo> {
    const stats = new Map<string, RateLimitInfo>();

    for (const source of Object.values(SearchSource)) {
      stats.set(source, this.getStatus(source));
    }

    return stats;
  }
}

// ============================================
// 📊 Usage Tracker - تتبع الاستخدام اليومي
// ============================================

export class UsageTracker {
  private dailyUsage: Map<string, DailyUsage>;
  private maxDailyQueries: number;

  constructor(maxDailyQueries: number = 1000) {
    this.dailyUsage = new Map();
    this.maxDailyQueries = maxDailyQueries;

    // Cleanup at midnight
    this.scheduleMidnightCleanup();
  }

  // ============================================
  // ✅ Check if Can Search
  // ============================================

  canSearch(source?: SearchSource): boolean {
    const today = this.getTodayKey();
    const usage = this.dailyUsage.get(today);

    if (!usage) return true;

    if (source) {
      const sourceUsage = usage.bySource.get(source) || 0;
      return sourceUsage < this.maxDailyQueries;
    }

    return usage.total < this.maxDailyQueries;
  }

  // ============================================
  // 📈 Increment Usage
  // ============================================

  incrementUsage(source: SearchSource, count: number = 1): void {
    const today = this.getTodayKey();
    let usage = this.dailyUsage.get(today);

    if (!usage) {
      usage = {
        date: today,
        total: 0,
        successful: 0,
        failed: 0,
        bySource: new Map(),
        byHour: new Map()
      };
      this.dailyUsage.set(today, usage);
    }

    // Update totals
    usage.total += count;

    // Update by source
    const sourceCount = usage.bySource.get(source) || 0;
    usage.bySource.set(source, sourceCount + count);

    // Update by hour
    const hour = new Date().getHours();
    const hourCount = usage.byHour.get(hour) || 0;
    usage.byHour.set(hour, hourCount + count);

    console.log(`📈 Usage tracked: ${source} (+${count}) - Total today: ${usage.total}/${this.maxDailyQueries}`);
  }

  // ============================================
  // ✅ Record Success
  // ============================================

  recordSuccess(source: SearchSource): void {
    const today = this.getTodayKey();
    const usage = this.dailyUsage.get(today);
    if (usage) {
      usage.successful++;
    }
  }

  // ============================================
  // ❌ Record Failure
  // ============================================

  recordFailure(source: SearchSource): void {
    const today = this.getTodayKey();
    const usage = this.dailyUsage.get(today);
    if (usage) {
      usage.failed++;
    }
  }

  // ============================================
  // 📊 Get Usage Statistics
  // ============================================

  getUsage(date?: string): DailyUsage | null {
    const key = date || this.getTodayKey();
    return this.dailyUsage.get(key) || null;
  }

  // ============================================
  // 📈 Get Remaining Quota
  // ============================================

  getRemainingQuota(): number {
    const today = this.getTodayKey();
    const usage = this.dailyUsage.get(today);
    const used = usage?.total || 0;
    return Math.max(0, this.maxDailyQueries - used);
  }

  // ============================================
  // 📊 Get Statistics Summary
  // ============================================

  getStats(): UsageStats {
    const today = this.getTodayKey();
    const usage = this.dailyUsage.get(today);

    if (!usage) {
      return {
        today: {
          total: 0,
          successful: 0,
          failed: 0,
          remaining: this.maxDailyQueries,
          limit: this.maxDailyQueries
        },
        bySource: {},
        successRate: 0
      };
    }

    const bySource: Record<string, number> = {};
    for (const [source, count] of usage.bySource) {
      bySource[source] = count;
    }

    const successRate = usage.total > 0
      ? (usage.successful / usage.total) * 100
      : 0;

    return {
      today: {
        total: usage.total,
        successful: usage.successful,
        failed: usage.failed,
        remaining: Math.max(0, this.maxDailyQueries - usage.total),
        limit: this.maxDailyQueries
      },
      bySource,
      successRate: Math.round(successRate * 100) / 100
    };
  }

  // ============================================
  // 🔄 Reset Usage
  // ============================================

  reset(): void {
    this.dailyUsage.clear();
    console.log('🔄 Usage statistics reset');
  }

  // ============================================
  // 🗓️ Helper: Get Today Key
  // ============================================

  private getTodayKey(): string {
    return new Date().toISOString().split('T')[0];
  }

  // ============================================
  // 🕐 Schedule Midnight Cleanup
  // ============================================

  private scheduleMidnightCleanup(): void {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const msUntilMidnight = tomorrow.getTime() - now.getTime();

    setTimeout(() => {
      this.cleanupOldData();
      // Reschedule for next day
      this.scheduleMidnightCleanup();
    }, msUntilMidnight);
  }

  // ============================================
  // 🧹 Cleanup Old Data
  // ============================================

  private cleanupOldData(): void {
    const today = this.getTodayKey();
    const keysToDelete: string[] = [];

    // Keep only last 7 days
    for (const key of this.dailyUsage.keys()) {
      const daysDiff = this.getDaysDifference(key, today);
      if (daysDiff > 7) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.dailyUsage.delete(key));

    if (keysToDelete.length > 0) {
      console.log(`🧹 Cleaned ${keysToDelete.length} old usage records`);
    }
  }

  // ============================================
  // 📅 Helper: Get Days Difference
  // ============================================

  private getDaysDifference(date1: string, date2: string): number {
    const d1 = new Date(date1);
    const d2 = new Date(date2);
    const diffTime = Math.abs(d2.getTime() - d1.getTime());
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}

// ============================================
// 📊 Interfaces
// ============================================

interface RequestRecord {
  timestamp: number;
  source: SearchSource;
}

interface DailyUsage {
  date: string;
  total: number;
  successful: number;
  failed: number;
  bySource: Map<SearchSource, number>;
  byHour: Map<number, number>;
}

interface UsageStats {
  today: {
    total: number;
    successful: number;
    failed: number;
    remaining: number;
    limit: number;
  };
  bySource: Record<string, number>;
  successRate: number;
}

// ============================================
// 🌍 Global Instances
// ============================================

export const globalRateLimiter = new RateLimiter({
  maxRequests: 100,
  windowMs: 60 * 60 * 1000, // 1 hour
});

export const globalUsageTracker = new UsageTracker(1000); // 1000 queries per day

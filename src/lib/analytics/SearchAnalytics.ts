// ============================================
// 📊 SearchAnalytics - نظام التحليلات
// ============================================

export interface SearchMetrics {
  query: string;
  resultCount: number;
  sources: string[];
  responseTime: number;
  userClicked?: string;
  timestamp: Date;
  userId?: string;
}

export class SearchAnalytics {
  private metrics: SearchMetrics[] = [];

  /**
   * تسجيل عملية بحث
   */
  async trackSearch(metrics: SearchMetrics): Promise<void> {
    this.metrics.push(metrics);

    // يمكن إرسال البيانات لخدمة analytics خارجية
    try {
      await fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metrics)
      });
    } catch (error) {
      console.error('❌ Failed to track search:', error);
    }
  }

  /**
   * الحصول على الاستعلامات الأكثر شعبية
   */
  async getPopularSearches(limit: number = 10): Promise<string[]> {
    const queryCounts = new Map<string, number>();

    for (const metric of this.metrics) {
      const count = queryCounts.get(metric.query) || 0;
      queryCounts.set(metric.query, count + 1);
    }

    return Array.from(queryCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([query]) => query);
  }

  /**
   * حساب متوسط وقت الاستجابة
   */
  async getAverageResponseTime(): Promise<number> {
    if (this.metrics.length === 0) return 0;

    const totalTime = this.metrics.reduce(
      (sum, m) => sum + m.responseTime,
      0
    );

    return totalTime / this.metrics.length;
  }

  /**
   * الحصول على إحصائيات المصادر
   */
  getSourceStats(): Record<string, number> {
    const stats: Record<string, number> = {};

    for (const metric of this.metrics) {
      for (const source of metric.sources) {
        stats[source] = (stats[source] || 0) + 1;
      }
    }

    return stats;
  }
}

// Export singleton instance
export const searchAnalytics = new SearchAnalytics();

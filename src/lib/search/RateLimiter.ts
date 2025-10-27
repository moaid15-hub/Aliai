// ============================================
// ⏱️ RateLimiter - محدد معدل الطلبات
// ============================================

export class RateLimiter {
  private limits = new Map<string, number[]>();

  /**
   * التحقق من عدم تجاوز الحد المسموح
   * @param userId معرف المستخدم
   * @param limit الحد الأقصى للطلبات في الساعة (افتراضي: 100)
   */
  async checkLimit(userId: string, limit: number = 100): Promise<boolean> {
    const now = Date.now();
    const userRequests = this.limits.get(userId) || [];

    // Remove requests older than 1 hour
    const recentRequests = userRequests.filter(
      time => now - time < 3600000 // 1 hour in milliseconds
    );

    if (recentRequests.length >= limit) {
      console.warn(`⚠️ Rate limit exceeded for user: ${userId}`);
      return false; // Rate limit exceeded
    }

    recentRequests.push(now);
    this.limits.set(userId, recentRequests);

    return true;
  }

  /**
   * الحصول على عدد الطلبات المتبقية
   */
  getRemainingRequests(userId: string, limit: number = 100): number {
    const now = Date.now();
    const userRequests = this.limits.get(userId) || [];
    const recentRequests = userRequests.filter(
      time => now - time < 3600000
    );

    return Math.max(0, limit - recentRequests.length);
  }

  /**
   * إعادة تعيين حد المستخدم
   */
  reset(userId: string): void {
    this.limits.delete(userId);
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();

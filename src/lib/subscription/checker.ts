// فحص الصلاحيات والاشتراكات
import { SubscriptionPlan, getPlanById } from './plans';
import { UsageStats, UsageLimits, usageLimitService } from './limits';

export interface UserSubscription {
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired' | 'past_due';
  startDate: Date;
  endDate?: Date;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  usage: UsageStats;
}

export interface PermissionResult {
  allowed: boolean;
  reason?: string;
  reasonArabic?: string;
  upgradeRequired?: boolean;
  currentPlan?: SubscriptionPlan;
  suggestedPlan?: SubscriptionPlan;
}

export class SubscriptionChecker {
  private static instance: SubscriptionChecker;
  
  static getInstance(): SubscriptionChecker {
    if (!SubscriptionChecker.instance) {
      SubscriptionChecker.instance = new SubscriptionChecker();
    }
    return SubscriptionChecker.instance;
  }

  // فحص صلاحية إرسال رسالة
  async checkMessagePermission(subscription: UserSubscription): Promise<PermissionResult> {
    if (!this.isSubscriptionActive(subscription)) {
      return this.createPermissionResult(false, 'Subscription expired', 'انتهت صلاحية الاشتراك');
    }

    const limits = usageLimitService.checkLimits(subscription.planId, subscription.usage);
    
    if (!limits.canSendMessage) {
      const plan = getPlanById(subscription.planId);
      const suggestedPlan = this.getSuggestedUpgrade(subscription.planId);
      
      return this.createPermissionResult(
        false, 
        'Daily message limit reached', 
        'تم الوصول للحد الأقصى من الرسائل اليومية',
        true,
        plan,
        suggestedPlan
      );
    }

    return this.createPermissionResult(true);
  }

  // فحص صلاحية رفع الصور
  async checkImageUploadPermission(subscription: UserSubscription): Promise<PermissionResult> {
    if (!this.isSubscriptionActive(subscription)) {
      return this.createPermissionResult(false, 'Subscription expired', 'انتهت صلاحية الاشتراك');
    }

    const limits = usageLimitService.checkLimits(subscription.planId, subscription.usage);
    
    if (!limits.canUploadImage) {
      const plan = getPlanById(subscription.planId);
      const suggestedPlan = this.getSuggestedUpgrade(subscription.planId);
      
      return this.createPermissionResult(
        false, 
        'Daily image upload limit reached', 
        'تم الوصول للحد الأقصى من رفع الصور اليومية',
        true,
        plan,
        suggestedPlan
      );
    }

    return this.createPermissionResult(true);
  }

  // فحص صلاحية استخدام الصوت
  async checkVoicePermission(subscription: UserSubscription): Promise<PermissionResult> {
    if (!this.isSubscriptionActive(subscription)) {
      return this.createPermissionResult(false, 'Subscription expired', 'انتهت صلاحية الاشتراك');
    }

    const limits = usageLimitService.checkLimits(subscription.planId, subscription.usage);
    
    if (!limits.canUseVoice) {
      const plan = getPlanById(subscription.planId);
      const suggestedPlan = this.getSuggestedUpgrade(subscription.planId);
      
      return this.createPermissionResult(
        false, 
        'Daily voice limit reached', 
        'تم الوصول للحد الأقصى من الدقائق الصوتية',
        true,
        plan,
        suggestedPlan
      );
    }

    return this.createPermissionResult(true);
  }

  // فحص صلاحية استخدام نموذج ذكاء اصطناعي معين
  async checkAIModelPermission(subscription: UserSubscription, modelId: string): Promise<PermissionResult> {
    if (!this.isSubscriptionActive(subscription)) {
      return this.createPermissionResult(false, 'Subscription expired', 'انتهت صلاحية الاشتراك');
    }

    const plan = getPlanById(subscription.planId);
    if (!plan) {
      return this.createPermissionResult(false, 'Invalid subscription plan', 'خطة اشتراك غير صحيحة');
    }

    if (!plan.limits.aiModels.includes(modelId)) {
      const suggestedPlan = this.getSuggestedUpgrade(subscription.planId);
      
      return this.createPermissionResult(
        false, 
        `AI model ${modelId} not available in current plan`, 
        `نموذج الذكاء الاصطناعي ${modelId} غير متاح في الخطة الحالية`,
        true,
        plan,
        suggestedPlan
      );
    }

    return this.createPermissionResult(true);
  }

  // فحص حالة الاشتراك
  isSubscriptionActive(subscription: UserSubscription): boolean {
    if (subscription.status !== 'active') {
      return false;
    }

    if (subscription.endDate && new Date() > subscription.endDate) {
      return false;
    }

    return true;
  }

  // الحصول على حدود الاستخدام الحالية
  getCurrentLimits(subscription: UserSubscription): UsageLimits {
    return usageLimitService.checkLimits(subscription.planId, subscription.usage);
  }

  // تحديث إحصائيات الاستخدام
  updateUsage(subscription: UserSubscription, type: 'message' | 'image' | 'voice', amount: number = 1): UserSubscription {
    subscription.usage = usageLimitService.updateUsage(subscription.usage, type, amount);
    return subscription;
  }

  // اقتراح ترقية الخطة
  private getSuggestedUpgrade(currentPlanId: string): SubscriptionPlan | undefined {
    const upgradePath: { [key: string]: string } = {
      'free': 'premium',
      'premium': 'enterprise'
    };

    const suggestedPlanId = upgradePath[currentPlanId];
    return suggestedPlanId ? getPlanById(suggestedPlanId) : undefined;
  }

  // إنشاء نتيجة فحص الصلاحية
  private createPermissionResult(
    allowed: boolean,
    reason?: string,
    reasonArabic?: string,
    upgradeRequired: boolean = false,
    currentPlan?: SubscriptionPlan,
    suggestedPlan?: SubscriptionPlan
  ): PermissionResult {
    return {
      allowed,
      reason,
      reasonArabic,
      upgradeRequired,
      currentPlan,
      suggestedPlan
    };
  }

  // التحقق من انتهاء الاشتراك قريباً
  isSubscriptionExpiringSoon(subscription: UserSubscription, daysThreshold: number = 7): boolean {
    if (!subscription.endDate) return false;
    
    const now = new Date();
    const daysUntilExpiry = Math.ceil((subscription.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysUntilExpiry <= daysThreshold && daysUntilExpiry > 0;
  }

  // الحصول على رسالة تحذيرية للمستخدم
  getWarningMessage(subscription: UserSubscription, language: 'ar' | 'en' = 'ar'): string | null {
    const limits = this.getCurrentLimits(subscription);
    return usageLimitService.getLimitWarningMessage(limits, language);
  }
}

export const subscriptionChecker = SubscriptionChecker.getInstance();
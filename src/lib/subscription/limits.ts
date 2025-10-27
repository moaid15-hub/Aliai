// حدود الاستخدام للباقات المختلفة
import { SubscriptionPlan, getPlanById } from './plans';

export interface UsageStats {
  messagesUsedToday: number;
  imagesUploadedToday: number;
  voiceMinutesUsedToday: number;
  lastResetDate: string;
}

export interface UsageLimits {
  canSendMessage: boolean;
  canUploadImage: boolean;
  canUseVoice: boolean;
  remainingMessages: number;
  remainingImages: number;
  remainingVoiceMinutes: number;
  resetDate: Date;
}

export class UsageLimitService {
  private static instance: UsageLimitService;
  
  static getInstance(): UsageLimitService {
    if (!UsageLimitService.instance) {
      UsageLimitService.instance = new UsageLimitService();
    }
    return UsageLimitService.instance;
  }

  // فحص حدود الاستخدام للمستخدم
  checkLimits(userPlanId: string, currentUsage: UsageStats): UsageLimits {
    const plan = getPlanById(userPlanId);
    if (!plan) {
      throw new Error(`خطة غير موجودة: ${userPlanId}`);
    }

    const today = new Date().toDateString();
    const usageToday = currentUsage.lastResetDate === today ? currentUsage : this.resetDailyUsage();

    return {
      canSendMessage: this.canSendMessage(plan, usageToday),
      canUploadImage: this.canUploadImage(plan, usageToday),
      canUseVoice: this.canUseVoice(plan, usageToday),
      remainingMessages: this.getRemainingMessages(plan, usageToday),
      remainingImages: this.getRemainingImages(plan, usageToday),
      remainingVoiceMinutes: this.getRemainingVoiceMinutes(plan, usageToday),
      resetDate: this.getNextResetDate()
    };
  }

  private canSendMessage(plan: SubscriptionPlan, usage: UsageStats): boolean {
    if (plan.limits.messagesPerDay === -1) return true; // unlimited
    return usage.messagesUsedToday < plan.limits.messagesPerDay;
  }

  private canUploadImage(plan: SubscriptionPlan, usage: UsageStats): boolean {
    if (plan.limits.imageUploads === -1) return true; // unlimited
    return usage.imagesUploadedToday < plan.limits.imageUploads;
  }

  private canUseVoice(plan: SubscriptionPlan, usage: UsageStats): boolean {
    if (plan.limits.voiceMinutes === -1) return true; // unlimited
    return usage.voiceMinutesUsedToday < plan.limits.voiceMinutes;
  }

  private getRemainingMessages(plan: SubscriptionPlan, usage: UsageStats): number {
    if (plan.limits.messagesPerDay === -1) return -1; // unlimited
    return Math.max(0, plan.limits.messagesPerDay - usage.messagesUsedToday);
  }

  private getRemainingImages(plan: SubscriptionPlan, usage: UsageStats): number {
    if (plan.limits.imageUploads === -1) return -1; // unlimited
    return Math.max(0, plan.limits.imageUploads - usage.imagesUploadedToday);
  }

  private getRemainingVoiceMinutes(plan: SubscriptionPlan, usage: UsageStats): number {
    if (plan.limits.voiceMinutes === -1) return -1; // unlimited
    return Math.max(0, plan.limits.voiceMinutes - usage.voiceMinutesUsedToday);
  }

  private resetDailyUsage(): UsageStats {
    return {
      messagesUsedToday: 0,
      imagesUploadedToday: 0,
      voiceMinutesUsedToday: 0,
      lastResetDate: new Date().toDateString()
    };
  }

  private getNextResetDate(): Date {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }

  // تحديث إحصائيات الاستخدام
  updateUsage(currentUsage: UsageStats, type: 'message' | 'image' | 'voice', amount: number = 1): UsageStats {
    const today = new Date().toDateString();
    
    // إعادة تعيين الإحصائيات إذا كان يوم جديد
    if (currentUsage.lastResetDate !== today) {
      currentUsage = this.resetDailyUsage();
    }

    switch (type) {
      case 'message':
        currentUsage.messagesUsedToday += amount;
        break;
      case 'image':
        currentUsage.imagesUploadedToday += amount;
        break;
      case 'voice':
        currentUsage.voiceMinutesUsedToday += amount;
        break;
    }

    currentUsage.lastResetDate = today;
    return currentUsage;
  }

  // رسائل التحذير للمستخدم
  getLimitWarningMessage(limits: UsageLimits, language: 'ar' | 'en' = 'ar'): string | null {
    const messages = {
      ar: {
        messagesLow: `تبقى لك ${limits.remainingMessages} رسائل اليوم`,
        messagesOut: 'لقد استنفدت الرسائل المسموحة اليوم',
        imagesLow: `تبقى لك ${limits.remainingImages} صور اليوم`,
        imagesOut: 'لقد استنفدت رفع الصور المسموح اليوم',
        voiceLow: `تبقى لك ${limits.remainingVoiceMinutes} دقائق صوتية`,
        voiceOut: 'لقد استنفدت الدقائق الصوتية المسموحة اليوم'
      },
      en: {
        messagesLow: `You have ${limits.remainingMessages} messages left today`,
        messagesOut: 'You have reached your daily message limit',
        imagesLow: `You have ${limits.remainingImages} images left today`,
        imagesOut: 'You have reached your daily image upload limit',
        voiceLow: `You have ${limits.remainingVoiceMinutes} voice minutes left`,
        voiceOut: 'You have reached your daily voice limit'
      }
    };

    const msgs = messages[language];

    if (!limits.canSendMessage) return msgs.messagesOut;
    if (limits.remainingMessages <= 2 && limits.remainingMessages > 0) return msgs.messagesLow;
    
    if (!limits.canUploadImage) return msgs.imagesOut;
    if (limits.remainingImages <= 1 && limits.remainingImages > 0) return msgs.imagesLow;
    
    if (!limits.canUseVoice) return msgs.voiceOut;
    if (limits.remainingVoiceMinutes <= 5 && limits.remainingVoiceMinutes > 0) return msgs.voiceLow;

    return null;
  }
}

export const usageLimitService = UsageLimitService.getInstance();
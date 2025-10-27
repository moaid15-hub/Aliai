// Context لإدارة حالة الاشتراكات عبر التطبيق
'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { subscriptionChecker } from '@/lib/subscription/checker';
import { SubscriptionPlan, getPlanById } from '@/lib/subscription/plans';

// أنواع البيانات
export interface UserSubscription {
  userId: string;
  planId: string;
  status: 'active' | 'canceled' | 'expired' | 'past_due';
  startDate: Date;
  endDate?: Date;
  stripeSubscriptionId?: string;
  stripeCustomerId?: string;
  usage: {
    messagesUsedToday: number;
    imagesUploadedToday: number;
    voiceMinutesUsedToday: number;
    lastResetDate: string;
  };
}

export interface SubscriptionLimits {
  canSendMessage: boolean;
  canUploadImage: boolean;
  canUseVoice: boolean;
  remainingMessages: number;
  remainingImages: number;
  remainingVoiceMinutes: number;
  resetDate: string;
}

export interface SubscriptionState {
  subscription: UserSubscription | null;
  limits: SubscriptionLimits | null;
  currentPlan: SubscriptionPlan | null;
  loading: boolean;
  error: string | null;
  isExpiringSoon: boolean;
  warningMessage: string | null;
}

// الإجراءات
type SubscriptionAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SUBSCRIPTION_DATA'; payload: { subscription: UserSubscription; limits: SubscriptionLimits } }
  | { type: 'UPDATE_USAGE'; payload: { type: 'message' | 'image' | 'voice'; amount: number } }
  | { type: 'SET_WARNING'; payload: string | null }
  | { type: 'RESET_STATE' };

// المخفض (Reducer)
const subscriptionReducer = (state: SubscriptionState, action: SubscriptionAction): SubscriptionState => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    
    case 'SET_ERROR':
      return { ...state, error: action.payload, loading: false };
    
    case 'SET_SUBSCRIPTION_DATA':
      const { subscription, limits } = action.payload;
      const currentPlan = getPlanById(subscription.planId) || null;
      const isExpiringSoon = subscription.endDate ? 
        subscriptionChecker.isSubscriptionExpiringSoon(subscription) : false;
      const warningMessage = subscriptionChecker.getWarningMessage(subscription);
      
      return {
        ...state,
        subscription,
        limits,
        currentPlan,
        isExpiringSoon,
        warningMessage,
        loading: false,
        error: null
      };
    
    case 'UPDATE_USAGE':
      if (!state.subscription) return state;
      
      const updatedSubscription = subscriptionChecker.updateUsage(
        state.subscription,
        action.payload.type,
        action.payload.amount
      );
      
      const updatedLimits = subscriptionChecker.getCurrentLimits(updatedSubscription);
      
      return {
        ...state,
        subscription: updatedSubscription,
        limits: {
          canSendMessage: updatedLimits.canSendMessage,
          canUploadImage: updatedLimits.canUploadImage,
          canUseVoice: updatedLimits.canUseVoice,
          remainingMessages: updatedLimits.remainingMessages,
          remainingImages: updatedLimits.remainingImages,
          remainingVoiceMinutes: updatedLimits.remainingVoiceMinutes,
          resetDate: updatedLimits.resetDate.toISOString()
        },
        warningMessage: subscriptionChecker.getWarningMessage(updatedSubscription)
      };
    
    case 'SET_WARNING':
      return { ...state, warningMessage: action.payload };
    
    case 'RESET_STATE':
      return initialState;
    
    default:
      return state;
  }
};

// الحالة الأولية
const initialState: SubscriptionState = {
  subscription: null,
  limits: null,
  currentPlan: null,
  loading: true,
  error: null,
  isExpiringSoon: false,
  warningMessage: null
};

// إنشاء Context
const SubscriptionContext = createContext<{
  state: SubscriptionState;
  dispatch: React.Dispatch<SubscriptionAction>;
  actions: {
    fetchSubscriptionData: () => Promise<void>;
    updateUsage: (type: 'message' | 'image' | 'voice', amount?: number) => Promise<void>;
    checkPermission: (type: 'message' | 'image' | 'voice', modelId?: string) => Promise<{ allowed: boolean; reason?: string }>;
    refreshData: () => Promise<void>;
  };
} | undefined>(undefined);

// مزود Context
export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(subscriptionReducer, initialState);

  // جلب بيانات الاشتراك
  const fetchSubscriptionData = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      const response = await fetch('/api/subscription/check', {
        headers: {
          'x-user-id': 'demo-user' // في التطبيق الحقيقي سيكون من session
        }
      });
      
      if (!response.ok) {
        throw new Error('فشل في جلب بيانات الاشتراك');
      }
      
      const data = await response.json();
      
      if (data.success) {
        dispatch({
          type: 'SET_SUBSCRIPTION_DATA',
          payload: {
            subscription: {
              userId: 'demo-user',
              planId: data.data.subscription.planId,
              status: data.data.subscription.status,
              startDate: new Date(),
              usage: data.data.usage
            },
            limits: data.data.limits
          }
        });
      } else {
        throw new Error(data.error || 'خطأ في البيانات');
      }
    } catch (error) {
      console.error('خطأ في جلب بيانات الاشتراك:', error);
      dispatch({
        type: 'SET_ERROR',
        payload: error instanceof Error ? error.message : 'خطأ غير متوقع'
      });
    }
  };

  // تحديث إحصائيات الاستخدام
  const updateUsage = async (type: 'message' | 'image' | 'voice', amount: number = 1) => {
    try {
      // تحديث محلي أولاً
      dispatch({ type: 'UPDATE_USAGE', payload: { type, amount } });
      
      // إرسال للخادم
      await fetch('/api/subscription/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user'
        },
        body: JSON.stringify({
          userId: 'demo-user',
          action: 'update_usage',
          type,
          amount
        })
      });
      
    } catch (error) {
      console.error('خطأ في تحديث الاستخدام:', error);
      // في حالة الفشل، أعد جلب البيانات
      await fetchSubscriptionData();
    }
  };

  // فحص الصلاحيات
  const checkPermission = async (
    type: 'message' | 'image' | 'voice',
    modelId?: string
  ): Promise<{ allowed: boolean; reason?: string }> => {
    try {
      const response = await fetch('/api/subscription/check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': 'demo-user'
        },
        body: JSON.stringify({
          userId: 'demo-user',
          action: 'check_permission',
          type,
          modelId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        return {
          allowed: data.permission.allowed,
          reason: data.permission.reasonArabic || data.permission.reason
        };
      } else {
        return { allowed: false, reason: 'خطأ في فحص الصلاحيات' };
      }
    } catch (error) {
      console.error('خطأ في فحص الصلاحيات:', error);
      return { allowed: false, reason: 'خطأ في الاتصال' };
    }
  };

  // تحديث البيانات
  const refreshData = async () => {
    await fetchSubscriptionData();
  };

  // جلب البيانات عند التحميل
  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  // إعادة تعيين البيانات يومياً
  useEffect(() => {
    const checkDailyReset = () => {
      const now = new Date();
      const today = now.toDateString();
      
      if (state.subscription && state.subscription.usage.lastResetDate !== today) {
        // إعادة تعيين الاستخدام اليومي
        fetchSubscriptionData();
      }
    };
    
    // فحص كل ساعة
    const interval = setInterval(checkDailyReset, 60 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [state.subscription]);

  const actions = {
    fetchSubscriptionData,
    updateUsage,
    checkPermission,
    refreshData
  };

  return (
    <SubscriptionContext.Provider value={{ state, dispatch, actions }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

// Hook لاستخدام Context
export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}

// Hook مبسط للتحقق من الصلاحيات
export function usePermission(type: 'message' | 'image' | 'voice') {
  const { state, actions } = useSubscription();
  
  const checkAndUpdate = async (modelId?: string) => {
    const permission = await actions.checkPermission(type, modelId);
    if (permission.allowed && type === 'message') {
      await actions.updateUsage(type);
    }
    return permission;
  };
  
  return {
    canUse: state.limits ? (
      type === 'message' ? state.limits.canSendMessage :
      type === 'image' ? state.limits.canUploadImage :
      state.limits.canUseVoice
    ) : false,
    remaining: state.limits ? (
      type === 'message' ? state.limits.remainingMessages :
      type === 'image' ? state.limits.remainingImages :
      state.limits.remainingVoiceMinutes
    ) : 0,
    checkAndUpdate,
    loading: state.loading
  };
}

// Hook للحصول على معلومات الباقة الحالية
export function useCurrentPlan() {
  const { state } = useSubscription();
  
  return {
    plan: state.currentPlan,
    subscription: state.subscription,
    isExpiringSoon: state.isExpiringSoon,
    warningMessage: state.warningMessage,
    loading: state.loading
  };
}
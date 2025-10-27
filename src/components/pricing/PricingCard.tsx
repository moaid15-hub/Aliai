// كارت عرض باقات الاشتراك
'use client';

import React from 'react';
import { Check, X, Crown, Zap, Star } from 'lucide-react';
import { SubscriptionPlan } from '@/lib/subscription/plans';

interface PricingCardProps {
  plan: SubscriptionPlan;
  currentPlanId?: string;
  onSelectPlan: (planId: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

export default function PricingCard({ 
  plan, 
  currentPlanId, 
  onSelectPlan, 
  loading = false,
  disabled = false 
}: PricingCardProps) {
  const isCurrentPlan = currentPlanId === plan.id;
  const isFree = plan.price === 0;
  const isPopular = plan.popular;

  const getPlanIcon = () => {
    switch (plan.id) {
      case 'free':
        return <Star className="w-6 h-6" />;
      case 'premium':
        return <Crown className="w-6 h-6" />;
      case 'enterprise':
        return <Zap className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  const getPlanColor = () => {
    switch (plan.id) {
      case 'free':
        return 'from-gray-500 to-gray-600';
      case 'premium':
        return 'from-blue-500 to-purple-600';
      case 'enterprise':
        return 'from-purple-600 to-pink-600';
      default:
        return 'from-gray-500 to-gray-600';
    }
  };

  const getCardStyle = () => {
    if (isCurrentPlan) {
      return 'border-green-500 bg-green-50 dark:bg-green-900/20';
    }
    if (isPopular) {
      return 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 transform scale-105';
    }
    return 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800';
  };

  return (
    <div className={`relative rounded-2xl border-2 p-6 shadow-lg transition-all duration-300 hover:shadow-xl ${getCardStyle()}`}>
      
      {/* Popular Badge */}
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
            الأكثر شعبية
          </span>
        </div>
      )}

      {/* Current Plan Badge */}
      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center gap-1">
            <Check className="w-4 h-4" />
            الحالية
          </span>
        </div>
      )}

      {/* Plan Header */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r ${getPlanColor()} text-white mb-4`}>
          {getPlanIcon()}
        </div>
        
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {plan.nameArabic}
        </h3>
        
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="text-4xl font-bold text-gray-900 dark:text-white">
            {isFree ? 'مجاني' : `$${plan.price}`}
          </span>
          {!isFree && (
            <span className="text-gray-500 dark:text-gray-400">
              / {plan.interval === 'month' ? 'شهر' : 'سنة'}
            </span>
          )}
        </div>
        
        {plan.limits.messagesPerDay === -1 ? (
          <p className="text-sm text-gray-600 dark:text-gray-300">رسائل غير محدودة</p>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {plan.limits.messagesPerDay} رسالة يومياً
          </p>
        )}
      </div>

      {/* Features List */}
      <div className="space-y-3 mb-8">
        {plan.featuresArabic.map((feature, index) => (
          <div key={index} className="flex items-center gap-3">
            <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
            <span className="text-gray-700 dark:text-gray-300">{feature}</span>
          </div>
        ))}
      </div>

      {/* Limits Display */}
      <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 mb-6">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">الحدود:</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">الرسائل:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {plan.limits.messagesPerDay === -1 ? '∞' : plan.limits.messagesPerDay}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">الصور:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {plan.limits.imageUploads === -1 ? '∞' : plan.limits.imageUploads}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">الصوت:</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {plan.limits.voiceMinutes === -1 ? '∞' : `${plan.limits.voiceMinutes} دقيقة`}
            </span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <button
        onClick={() => onSelectPlan(plan.id)}
        disabled={disabled || loading || isCurrentPlan}
        className={`w-full py-3 px-4 rounded-xl font-semibold transition-all duration-300 ${
          isCurrentPlan
            ? 'bg-green-100 text-green-700 cursor-not-allowed'
            : isFree
            ? 'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600'
            : isPopular
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl'
            : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
        } ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {loading ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
            جاري المعالجة...
          </div>
        ) : isCurrentPlan ? (
          'الخطة الحالية'
        ) : isFree ? (
          'البدء مجاناً'
        ) : (
          'ترقية الآن'
        )}
      </button>

      {/* AI Models Available */}
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">نماذج الذكاء المتاحة:</p>
        <div className="flex flex-wrap gap-1">
          {plan.limits.aiModels.map((model, index) => (
            <span
              key={index}
              className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-xs"
            >
              {model === 'free-ai' ? 'مجاني' : 
               model === 'gemini-pro' ? 'Gemini' : 
               model === 'claude-3-opus' ? 'Claude' : model}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
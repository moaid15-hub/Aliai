// شريط عرض استخدام الحدود اليومية
'use client';

import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

interface UsageBarProps {
  label: string;
  labelArabic: string;
  current: number;
  limit: number;
  unit?: string;
  color?: 'blue' | 'green' | 'orange' | 'red' | 'purple';
  showPercentage?: boolean;
  className?: string;
}

export default function UsageBar({
  label,
  labelArabic,
  current,
  limit,
  unit = '',
  color = 'blue',
  showPercentage = true,
  className = ''
}: UsageBarProps) {
  const isUnlimited = limit === -1;
  const percentage = isUnlimited ? 0 : Math.min((current / limit) * 100, 100);
  const isNearLimit = percentage >= 80;
  const isAtLimit = percentage >= 100;

  const getColorClasses = () => {
    if (isAtLimit) return 'from-red-500 to-red-600';
    if (isNearLimit) return 'from-orange-500 to-orange-600';
    
    switch (color) {
      case 'blue': return 'from-blue-500 to-blue-600';
      case 'green': return 'from-green-500 to-green-600';
      case 'orange': return 'from-orange-500 to-orange-600';
      case 'red': return 'from-red-500 to-red-600';
      case 'purple': return 'from-purple-500 to-purple-600';
      default: return 'from-blue-500 to-blue-600';
    }
  };

  const getStatusIcon = () => {
    if (isUnlimited) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (isAtLimit) return <XCircle className="w-5 h-5 text-red-500" />;
    if (isNearLimit) return <AlertTriangle className="w-5 h-5 text-orange-500" />;
    return <CheckCircle className="w-5 h-5 text-green-500" />;
  };

  const getStatusText = () => {
    if (isUnlimited) return 'غير محدود';
    if (isAtLimit) return 'تم الوصول للحد الأقصى';
    if (isNearLimit) return 'قريب من الحد الأقصى';
    return 'متاح';
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 ${className}`}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              {labelArabic}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {getStatusText()}
            </p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900 dark:text-white">
            {isUnlimited ? '∞' : `${current}${unit}`}
          </p>
          {!isUnlimited && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              من {limit}{unit}
            </p>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      {!isUnlimited && (
        <div className="mb-3">
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full bg-gradient-to-r ${getColorClasses()} transition-all duration-500 ease-out`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Details */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600 dark:text-gray-400">
          {isUnlimited ? 'استخدام غير محدود' : `المتبقي: ${Math.max(0, limit - current)}${unit}`}
        </span>
        
        {!isUnlimited && showPercentage && (
          <span className={`font-medium ${
            isAtLimit ? 'text-red-600' : 
            isNearLimit ? 'text-orange-600' : 
            'text-gray-600 dark:text-gray-400'
          }`}>
            {percentage.toFixed(0)}%
          </span>
        )}
      </div>

      {/* Warning Message */}
      {isNearLimit && !isAtLimit && (
        <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded text-xs text-orange-700 dark:text-orange-300">
          تنبيه: أنت قريب من الوصول للحد الأقصى اليومي
        </div>
      )}
      
      {isAtLimit && (
        <div className="mt-3 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-xs text-red-700 dark:text-red-300">
          لقد وصلت للحد الأقصى. ستتم إعادة التعيين غداً أو يمكنك ترقية خطتك.
        </div>
      )}
    </div>
  );
}
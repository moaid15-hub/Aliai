// شارة عرض نوع الباقة الحالية
'use client';

import React from 'react';
import { Crown, Star, Zap, Gift } from 'lucide-react';

interface PlanBadgeProps {
  planId: string;
  planName?: string;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

export default function PlanBadge({
  planId,
  planName,
  size = 'md',
  showIcon = true,
  className = ''
}: PlanBadgeProps) {
  
  const getPlanConfig = () => {
    switch (planId) {
      case 'free':
        return {
          name: planName || 'مجاني',
          icon: Gift,
          bgColor: 'bg-gray-100 dark:bg-gray-700',
          textColor: 'text-gray-700 dark:text-gray-300',
          borderColor: 'border-gray-300 dark:border-gray-600',
          gradient: 'from-gray-400 to-gray-500'
        };
      case 'premium':
        return {
          name: planName || 'مميز',
          icon: Crown,
          bgColor: 'bg-blue-100 dark:bg-blue-900/30',
          textColor: 'text-blue-700 dark:text-blue-300',
          borderColor: 'border-blue-300 dark:border-blue-600',
          gradient: 'from-blue-500 to-purple-600'
        };
      case 'enterprise':
        return {
          name: planName || 'مؤسسي',
          icon: Zap,
          bgColor: 'bg-purple-100 dark:bg-purple-900/30',
          textColor: 'text-purple-700 dark:text-purple-300',
          borderColor: 'border-purple-300 dark:border-purple-600',
          gradient: 'from-purple-600 to-pink-600'
        };
      default:
        return {
          name: planName || 'غير محدد',
          icon: Star,
          bgColor: 'bg-gray-100 dark:bg-gray-700',
          textColor: 'text-gray-700 dark:text-gray-300',
          borderColor: 'border-gray-300 dark:border-gray-600',
          gradient: 'from-gray-400 to-gray-500'
        };
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'px-2 py-1 text-xs',
          icon: 'w-3 h-3',
          gap: 'gap-1'
        };
      case 'md':
        return {
          container: 'px-3 py-1.5 text-sm',
          icon: 'w-4 h-4',
          gap: 'gap-1.5'
        };
      case 'lg':
        return {
          container: 'px-4 py-2 text-base',
          icon: 'w-5 h-5',
          gap: 'gap-2'
        };
      default:
        return {
          container: 'px-3 py-1.5 text-sm',
          icon: 'w-4 h-4',
          gap: 'gap-1.5'
        };
    }
  };

  const config = getPlanConfig();
  const sizeClasses = getSizeClasses();
  const IconComponent = config.icon;

  return (
    <div className={`
      inline-flex items-center rounded-full border font-semibold transition-all duration-200
      ${config.bgColor} ${config.textColor} ${config.borderColor}
      ${sizeClasses.container} ${sizeClasses.gap}
      ${className}
    `}>
      {showIcon && (
        <div className={`
          flex items-center justify-center rounded-full text-white
          bg-gradient-to-r ${config.gradient}
          ${size === 'sm' ? 'w-5 h-5' : size === 'lg' ? 'w-7 h-7' : 'w-6 h-6'}
        `}>
          <IconComponent className={sizeClasses.icon} />
        </div>
      )}
      
      <span className="font-medium">
        {config.name}
      </span>
      
      {planId === 'premium' && (
        <span className="text-xs bg-gradient-to-r from-blue-500 to-purple-600 text-white px-1.5 py-0.5 rounded-full">
          شائع
        </span>
      )}
      
      {planId === 'enterprise' && (
        <span className="text-xs bg-gradient-to-r from-purple-600 to-pink-600 text-white px-1.5 py-0.5 rounded-full">
          متقدم
        </span>
      )}
    </div>
  );
}
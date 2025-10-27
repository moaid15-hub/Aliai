// src/components/personas/PersonaCategoryBadge.tsx
'use client';

import React from 'react';
import { PersonaCategory } from '@/features/personas/types/persona.types';

interface PersonaCategoryBadgeProps {
  category: PersonaCategory;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const categoryConfig = {
  education: {
    label: 'تعليم',
    icon: '📚',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
  },
  professional: {
    label: 'مهني',
    icon: '💼',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
  },
  creative: {
    label: 'إبداعي',
    icon: '🎨',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300'
  },
  technical: {
    label: 'تقني',
    icon: '⚙️',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
  },
  health: {
    label: 'صحي',
    icon: '🏥',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
  },
  business: {
    label: 'أعمال',
    icon: '💼',
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
  },
  entertainment: {
    label: 'ترفيه',
    icon: '🎭',
    color: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300'
  },
  general: {
    label: 'عام',
    icon: '🌟',
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300'
  }
};

export default function PersonaCategoryBadge({ 
  category, 
  size = 'md',
  className = '' 
}: PersonaCategoryBadgeProps) {
  const config = categoryConfig[category];
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <span 
      className={`inline-flex items-center gap-1 rounded-lg font-medium ${config.color} ${sizeClasses[size]} ${className}`}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}


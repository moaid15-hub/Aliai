// src/components/personas/PersonaList.tsx
'use client';

import React from 'react';
import { Persona } from '@/features/personas/types/persona.types';
import PersonaCard from './PersonaCard';

interface PersonaListProps {
  personas: Persona[];
  onPersonaClick?: (persona: Persona) => void;
  onPersonaUse?: (persona: Persona) => void;
  loading?: boolean;
  emptyMessage?: string;
  compact?: boolean;
  className?: string;
}

export default function PersonaList({ 
  personas, 
  onPersonaClick,
  onPersonaUse,
  loading = false,
  emptyMessage = "لا توجد شخصيات متاحة",
  compact = false,
  className = ''
}: PersonaListProps) {
  if (loading) {
    return (
      <div className={`grid gap-6 ${compact ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'} ${className}`}>
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse"
          >
            <div className="flex items-start gap-4 mb-4">
              <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-300 dark:bg-gray-600 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-3/4"></div>
              </div>
            </div>
            <div className="flex justify-between items-center mb-4">
              <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-20"></div>
              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-16"></div>
            </div>
            <div className="h-10 bg-gray-300 dark:bg-gray-600 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (personas.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${className}`}>
        <div className="text-6xl mb-4">🤖</div>
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {emptyMessage}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
          لم يتم العثور على أي شخصيات تطابق معايير البحث الخاصة بك
        </p>
      </div>
    );
  }

  return (
    <div className={`grid gap-6 ${compact ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'} ${className}`}>
      {personas.map((persona) => (
        <PersonaCard
          key={persona.id}
          persona={persona}
          onClick={onPersonaClick}
          compact={compact}
          showActions={!!onPersonaUse}
        />
      ))}
    </div>
  );
}


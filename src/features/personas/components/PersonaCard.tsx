// src/components/personas/PersonaCard.tsx
'use client';

import React from 'react';
import { Persona } from '@/features/personas/types/persona.types';
import PersonaAvatar from './PersonaAvatar';
import PersonaCategoryBadge from './PersonaCategoryBadge';
import PersonaRating from './PersonaRating';
import { MessageCircle, TrendingUp, Clock } from 'lucide-react';

interface PersonaCardProps {
  persona: Persona;
  onClick?: (persona: Persona) => void;
  showActions?: boolean;
  compact?: boolean;
}

export default function PersonaCard({ 
  persona, 
  onClick, 
  showActions = true,
  compact = false 
}: PersonaCardProps) {
  const handleClick = () => {
    onClick?.(persona);
  };

  return (
    <div 
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 ${
        compact ? 'p-4' : 'p-6'
      }`}
      onClick={handleClick}
    >
      {/* Header */}
      <div className="flex items-start gap-4 mb-4">
        <PersonaAvatar 
          avatar={persona.avatar} 
          size={compact ? 'md' : 'lg'} 
        />
        
        <div className="flex-1 min-w-0">
          <h3 className={`font-bold text-gray-900 dark:text-white truncate ${
            compact ? 'text-lg' : 'text-xl'
          }`}>
            {persona.name}
          </h3>
          
          <p className={`text-gray-600 dark:text-gray-400 mt-1 ${
            compact ? 'text-sm line-clamp-2' : 'line-clamp-3'
          }`}>
            {persona.description}
          </p>
        </div>
      </div>

      {/* Category & Rating */}
      <div className="flex items-center justify-between mb-4">
        <PersonaCategoryBadge category={persona.category} />
        {persona.rating > 0 && (
          <PersonaRating rating={persona.rating} size="sm" />
        )}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
        <div className="flex items-center gap-1">
          <TrendingUp className="w-4 h-4" />
          <span>{persona.usage_count}</span>
        </div>
        
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          <span>{new Date(persona.created_at).toLocaleDateString('ar-SA')}</span>
        </div>
      </div>

      {/* Specializations */}
      {persona.specializations.length > 0 && (
        <div className="mb-4">
          <div className="flex flex-wrap gap-1">
            {persona.specializations.slice(0, compact ? 2 : 3).map((spec, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md text-xs font-medium"
              >
                {spec}
              </span>
            ))}
            {persona.specializations.length > (compact ? 2 : 3) && (
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-md text-xs">
                +{persona.specializations.length - (compact ? 2 : 3)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      {showActions && (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              // Handle use persona
            }}
            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm font-medium"
          >
            <MessageCircle className="w-4 h-4" />
            استخدام
          </button>
        </div>
      )}
    </div>
  );
}


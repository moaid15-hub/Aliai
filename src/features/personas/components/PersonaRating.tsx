// src/components/personas/PersonaRating.tsx
'use client';

import React from 'react';
import { Star } from 'lucide-react';

interface PersonaRatingProps {
  rating: number;
  size?: 'sm' | 'md' | 'lg';
  showNumber?: boolean;
  interactive?: boolean;
  onRate?: (rating: number) => void;
  className?: string;
}

export default function PersonaRating({ 
  rating, 
  size = 'md',
  showNumber = true,
  interactive = false,
  onRate,
  className = ''
}: PersonaRatingProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  const handleClick = (newRating: number) => {
    if (interactive && onRate) {
      onRate(newRating);
    }
  };

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => handleClick(star)}
          disabled={!interactive}
          className={`transition-all ${
            interactive 
              ? 'hover:scale-110 cursor-pointer' 
              : 'cursor-default'
          } ${
            star <= rating
              ? 'text-yellow-500'
              : 'text-gray-300 dark:text-gray-600'
          }`}
        >
          <Star 
            className={`${sizeClasses[size]} ${
              star <= rating ? 'fill-current' : ''
            }`} 
          />
        </button>
      ))}
      
      {showNumber && (
        <span className="mr-2 text-sm text-gray-600 dark:text-gray-400 font-medium">
          {rating > 0 ? rating.toFixed(1) : 'غير مقيم'}
        </span>
      )}
    </div>
  );
}


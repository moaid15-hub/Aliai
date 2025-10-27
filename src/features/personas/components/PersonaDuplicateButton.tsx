// src/components/personas/PersonaDuplicateButton.tsx
'use client';

import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Persona } from '@/features/personas/types/persona.types';
import { PersonaService } from '@/features/personas/services/personaService';

interface PersonaDuplicateButtonProps {
  persona: Persona;
  onDuplicate?: (duplicatedPersona: Persona) => void;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'button' | 'icon';
  className?: string;
}

export default function PersonaDuplicateButton({ 
  persona, 
  onDuplicate,
  size = 'md',
  variant = 'button',
  className = ''
}: PersonaDuplicateButtonProps) {
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleDuplicate = async () => {
    if (isDuplicating) return;
    
    setIsDuplicating(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const duplicatedPersona = PersonaService.duplicate(persona.id, 'current_user_id');
      
      if (duplicatedPersona) {
        setIsSuccess(true);
        onDuplicate?.(duplicatedPersona);
        
        // Reset success state after 2 seconds
        setTimeout(() => {
          setIsSuccess(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Error duplicating persona:', error);
    } finally {
      setIsDuplicating(false);
    }
  };

  const sizeClasses = {
    sm: variant === 'button' ? 'px-3 py-1.5 text-sm' : 'w-6 h-6',
    md: variant === 'button' ? 'px-4 py-2 text-sm' : 'w-8 h-8',
    lg: variant === 'button' ? 'px-6 py-3 text-base' : 'w-10 h-10'
  };

  const iconSizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleDuplicate}
        disabled={isDuplicating}
        className={`flex items-center justify-center rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all ${sizeClasses[size]} ${className} ${
          isDuplicating ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        title="نسخ الشخصية"
      >
        {isSuccess ? (
          <Check className={`${iconSizeClasses[size]} text-green-600`} />
        ) : (
          <Copy className={`${iconSizeClasses[size]} ${isDuplicating ? 'animate-pulse' : ''}`} />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleDuplicate}
      disabled={isDuplicating}
      className={`flex items-center gap-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all font-medium ${sizeClasses[size]} ${className} ${
        isDuplicating ? 'opacity-50 cursor-not-allowed' : ''
      }`}
    >
      {isSuccess ? (
        <>
          <Check className={`${iconSizeClasses[size]} text-green-600`} />
          <span>تم النسخ!</span>
        </>
      ) : (
        <>
          <Copy className={`${iconSizeClasses[size]} ${isDuplicating ? 'animate-pulse' : ''}`} />
          <span>{isDuplicating ? 'جاري النسخ...' : 'نسخ'}</span>
        </>
      )}
    </button>
  );
}


// src/components/personas/PersonaAvatar.tsx
'use client';

import React from 'react';

interface PersonaAvatarProps {
  avatar: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function PersonaAvatar({ 
  avatar, 
  size = 'md',
  className = '' 
}: PersonaAvatarProps) {
  const sizeClasses = {
    sm: 'text-2xl w-8 h-8',
    md: 'text-3xl w-10 h-10',
    lg: 'text-5xl w-16 h-16',
    xl: 'text-8xl w-24 h-24'
  };

  const isEmoji = /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u.test(avatar);

  if (isEmoji) {
    return (
      <div className={`flex items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border-2 border-purple-200 dark:border-purple-700 ${sizeClasses[size]} ${className}`}>
        <span className="select-none">{avatar}</span>
      </div>
    );
  }

  // If it's a URL or other format
  return (
    <div className={`flex items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 border-2 border-purple-200 dark:border-purple-700 overflow-hidden ${sizeClasses[size]} ${className}`}>
      {avatar.startsWith('http') ? (
        <img 
          src={avatar} 
          alt="Persona Avatar" 
          className="w-full h-full object-cover"
        />
      ) : (
        <span className="text-gray-600 dark:text-gray-400 font-bold">
          {avatar.charAt(0).toUpperCase()}
        </span>
      )}
    </div>
  );
}


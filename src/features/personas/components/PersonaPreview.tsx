// src/components/personas/PersonaPreview.tsx
'use client';

import React from 'react';
import { Persona } from '@/features/personas/types/persona.types';
import PersonaAvatar from './PersonaAvatar';
import PersonaCategoryBadge from './PersonaCategoryBadge';
import PersonaRating from './PersonaRating';
import { MessageCircle, TrendingUp, Clock, Tag, Code, ChevronDown, ChevronUp } from 'lucide-react';

interface PersonaPreviewProps {
  persona: Persona;
  expanded?: boolean;
  onToggleExpanded?: () => void;
  onUse?: (persona: Persona) => void;
  className?: string;
}

export default function PersonaPreview({ 
  persona, 
  expanded = false,
  onToggleExpanded,
  onUse,
  className = ''
}: PersonaPreviewProps) {
  const handleUse = () => {
    onUse?.(persona);
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="p-6">
        <div className="flex items-start gap-4">
          <PersonaAvatar avatar={persona.avatar} size="lg" />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white truncate">
                {persona.name}
              </h3>
              <PersonaCategoryBadge category={persona.category} />
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
              {persona.description}
            </p>
            
            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              {persona.rating > 0 && (
                <PersonaRating rating={persona.rating} size="sm" showNumber={false} />
              )}
              <div className="flex items-center gap-1">
                <TrendingUp className="w-4 h-4" />
                <span>{persona.usage_count} استخدام</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{new Date(persona.created_at).toLocaleDateString('ar-SA')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          {onUse && (
            <button
              onClick={handleUse}
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              <MessageCircle className="w-4 h-4" />
              استخدام
            </button>
          )}
          
          {onToggleExpanded && (
            <button
              onClick={onToggleExpanded}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-4 h-4" />
                  إخفاء التفاصيل
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4" />
                  عرض التفاصيل
                </>
              )}
            </button>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900">
          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">
                  النبرة
                </h4>
                <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm font-medium">
                  {persona.tone}
                </span>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">
                  مستوى اللغة
                </h4>
                <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-lg text-sm font-medium">
                  {persona.language_style}
                </span>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-1">
                  الخصوصية
                </h4>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                  persona.is_public
                    ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                }`}>
                  {persona.is_public ? 'عامة' : 'خاصة'}
                </span>
              </div>
            </div>

            {/* Specializations */}
            {persona.specializations.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">
                  التخصصات
                </h4>
                <div className="flex flex-wrap gap-2">
                  {persona.specializations.map((spec, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg text-sm font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Knowledge Areas */}
            {persona.knowledge_areas.length > 0 && (
              <div>
                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">
                  مجالات المعرفة
                </h4>
                <div className="space-y-2">
                  {persona.knowledge_areas.slice(0, 3).map(area => (
                    <div
                      key={area.id}
                      className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-medium text-gray-900 dark:text-white">
                          {area.name}
                        </h5>
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map(level => (
                            <div
                              key={level}
                              className={`w-3 h-3 rounded-full ${
                                level <= area.expertise_level
                                  ? 'bg-yellow-500'
                                  : 'bg-gray-300 dark:bg-gray-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {area.description}
                      </p>
                    </div>
                  ))}
                  {persona.knowledge_areas.length > 3 && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      +{persona.knowledge_areas.length - 3} مجالات أخرى
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Behavior */}
            <div>
              <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-2">
                السلوك والأسلوب
              </h4>
              <div className="p-3 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  <span className="font-medium">أسلوب التحية:</span> "{persona.behavior.greeting_style}"
                </p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {persona.behavior.response_length === 'short' ? 'مختصر' :
                       persona.behavior.response_length === 'long' ? 'مفصّل' : 'متوسط'}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">طول الرد</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {persona.behavior.use_examples ? '✓' : '✗'}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">الأمثلة</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {persona.behavior.ask_clarifying_questions ? '✓' : '✗'}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">الأسئلة</p>
                  </div>
                  <div className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {persona.behavior.use_emojis ? '✓' : '✗'}
                    </p>
                    <p className="text-gray-500 dark:text-gray-400">الإيموجي</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tags */}
            {persona.tags.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400">
                    الوسوم
                  </h4>
                </div>
                <div className="flex flex-wrap gap-2">
                  {persona.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-sm font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* System Prompt Preview */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Code className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                <h4 className="text-sm font-bold text-gray-500 dark:text-gray-400">
                  System Prompt
                </h4>
              </div>
              <div className="p-3 bg-gray-900 dark:bg-black rounded-lg">
                <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap overflow-x-auto line-clamp-4" dir="ltr">
                  {persona.system_prompt}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// src/components/personas/PersonaTemplateSelector.tsx
'use client';

import React, { useState } from 'react';
import { PersonaTemplate, PersonaCategory } from '@/types/persona.types';
import { PERSONA_TEMPLATES, getTemplatesByCategory } from '@/services/persona/personaTemplates';
import { Search, X, Sparkles } from 'lucide-react';

interface PersonaTemplateSelectorProps {
  onSelectTemplate: (template: PersonaTemplate) => void;
  onClose: () => void;
  className?: string;
}

export default function PersonaTemplateSelector({ 
  onSelectTemplate, 
  onClose,
  className = ''
}: PersonaTemplateSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PersonaCategory | 'all'>('all');

  const categories = [
    { value: 'all' as const, label: 'الكل', icon: '🌟' },
    { value: 'education' as const, label: 'تعليم', icon: '📚' },
    { value: 'professional' as const, label: 'مهني', icon: '💼' },
    { value: 'creative' as const, label: 'إبداعي', icon: '🎨' },
    { value: 'technical' as const, label: 'تقني', icon: '⚙️' },
    { value: 'health' as const, label: 'صحي', icon: '🏥' },
    { value: 'business' as const, label: 'أعمال', icon: '💼' },
    { value: 'entertainment' as const, label: 'ترفيه', icon: '🎭' },
    { value: 'general' as const, label: 'عام', icon: '🌟' }
  ];

  const filteredTemplates = PERSONA_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = (template: PersonaTemplate) => {
    onSelectTemplate(template);
    onClose();
  };

  return (
    <div className={`fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                اختر قالب شخصية
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            اختر من القوالب الجاهزة لتبدأ بسرعة
          </p>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="ابحث عن قالب..."
                  className="w-full pr-10 pl-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Category Filter */}
            <div className="md:w-64">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as PersonaCategory | 'all')}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.icon} {category.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {filteredTemplates.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                لم يتم العثور على قوالب
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                جرب تغيير معايير البحث
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTemplates.map((template) => (
                <div
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6 cursor-pointer hover:shadow-xl hover:border-purple-300 dark:hover:border-purple-600 transition-all duration-300"
                >
                  {/* Template Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-4xl">{template.icon}</div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                        {template.name}
                      </h3>
                      <span className="inline-block px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-md text-xs font-medium">
                        {template.category}
                      </span>
                    </div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                    {template.description}
                  </p>

                  {/* Template Preview */}
                  {template.template && (
                    <div className="space-y-2">
                      {template.template.tone && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500 dark:text-gray-400">النبرة:</span>
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded">
                            {template.template.tone}
                          </span>
                        </div>
                      )}
                      
                      {template.template.language_style && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500 dark:text-gray-400">اللغة:</span>
                          <span className="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded">
                            {template.template.language_style}
                          </span>
                        </div>
                      )}

                      {template.template.specializations && template.template.specializations.length > 0 && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-gray-500 dark:text-gray-400">التخصصات:</span>
                          <div className="flex flex-wrap gap-1">
                            {template.template.specializations.slice(0, 2).map((spec, index) => (
                              <span
                                key={index}
                                className="px-2 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded"
                              >
                                {spec}
                              </span>
                            ))}
                            {template.template.specializations!.length > 2 && (
                              <span className="text-gray-500 dark:text-gray-400">
                                +{template.template.specializations!.length - 2}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Select Button */}
                  <button className="w-full mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium">
                    اختر هذا القالب
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {filteredTemplates.length} قالب متاح
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


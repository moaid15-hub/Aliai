// src/components/personas/PersonaFilters.tsx
'use client';

import React from 'react';
import { PersonaCategory, PersonaTone, PersonaLanguageStyle, PersonaFilters as PersonaFiltersType } from '@/types/persona.types';
import { Search, Filter, X } from 'lucide-react';

interface PersonaFiltersProps {
  filters: PersonaFiltersType;
  onFiltersChange: (filters: PersonaFiltersType) => void;
  onClearFilters: () => void;
  className?: string;
}

const categoryOptions = [
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

const toneOptions = [
  { value: 'all' as const, label: 'الكل' },
  { value: 'formal' as const, label: 'رسمي' },
  { value: 'friendly' as const, label: 'ودود' },
  { value: 'professional' as const, label: 'احترافي' },
  { value: 'casual' as const, label: 'عفوي' },
  { value: 'humorous' as const, label: 'فكاهي' },
  { value: 'empathetic' as const, label: 'متعاطف' }
];

const languageOptions = [
  { value: 'all' as const, label: 'الكل' },
  { value: 'simple' as const, label: 'بسيط' },
  { value: 'moderate' as const, label: 'متوسط' },
  { value: 'advanced' as const, label: 'متقدم' },
  { value: 'technical' as const, label: 'تقني' }
];

export default function PersonaFilters({ 
  filters, 
  onFiltersChange, 
  onClearFilters,
  className = ''
}: PersonaFiltersProps) {
  const hasActiveFilters = filters.search || 
    (filters.category && filters.category !== 'all') ||
    (filters.tone && filters.tone !== 'all') ||
    (filters.min_rating && filters.min_rating > 0) ||
    filters.is_public !== undefined ||
    filters.is_featured !== undefined;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFiltersChange({
      ...filters,
      search: e.target.value || undefined
    });
  };

  const handleCategoryChange = (category: PersonaCategory | 'all') => {
    onFiltersChange({
      ...filters,
      category: category === 'all' ? undefined : category
    });
  };

  const handleToneChange = (tone: PersonaTone | 'all') => {
    onFiltersChange({
      ...filters,
      tone: tone === 'all' ? undefined : tone
    });
  };

  const handleLanguageChange = (language: PersonaLanguageStyle | 'all') => {
    onFiltersChange({
      ...filters,
      language_style: language === 'all' ? undefined : language
    });
  };

  const handleRatingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    onFiltersChange({
      ...filters,
      min_rating: value > 0 ? value : undefined
    });
  };

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Filter className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            فلاتر البحث
          </h3>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
            مسح الفلاتر
          </button>
        )}
      </div>

      {/* Search */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          البحث
        </label>
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={filters.search || ''}
            onChange={handleSearchChange}
            placeholder="ابحث عن شخصية..."
            className="w-full pr-10 pl-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          الفئة
        </label>
        <div className="grid grid-cols-3 gap-2">
          {categoryOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleCategoryChange(option.value)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.category === option.value || 
                (option.value === 'all' && !filters.category)
                  ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-2 border-purple-300 dark:border-purple-600'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <span>{option.icon}</span>
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tone Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          النبرة
        </label>
        <div className="grid grid-cols-2 gap-2">
          {toneOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleToneChange(option.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.tone === option.value || 
                (option.value === 'all' && !filters.tone)
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-2 border-blue-300 dark:border-blue-600'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Language Style Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          مستوى اللغة
        </label>
        <div className="grid grid-cols-2 gap-2">
          {languageOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => handleLanguageChange(option.value)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filters.language_style === option.value || 
                (option.value === 'all' && !filters.language_style)
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-2 border-green-300 dark:border-green-600'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          الحد الأدنى للتقييم: {filters.min_rating || 0}
        </label>
        <input
          type="range"
          min="0"
          max="5"
          step="0.5"
          value={filters.min_rating || 0}
          onChange={handleRatingChange}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
        />
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
          <span>0</span>
          <span>5</span>
        </div>
      </div>

      {/* Additional Filters */}
      <div className="space-y-3">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={filters.is_public === true}
            onChange={(e) => onFiltersChange({
              ...filters,
              is_public: e.target.checked ? true : undefined
            })}
            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            الشخصيات العامة فقط
          </span>
        </label>

        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            checked={filters.is_featured === true}
            onChange={(e) => onFiltersChange({
              ...filters,
              is_featured: e.target.checked ? true : undefined
            })}
            className="w-4 h-4 text-purple-600 bg-gray-100 border-gray-300 rounded focus:ring-purple-500 dark:focus:ring-purple-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
          />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            الشخصيات المميزة فقط
          </span>
        </label>
      </div>
    </div>
  );
}


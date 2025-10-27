// search/filters.tsx
// ============================================
// 🎯 نظام الفلاتر المرئية لنتائج البحث
// ============================================

"use client";

import React from 'react';
import { Video, FileText, BookOpen, Code, Package } from 'lucide-react';

type SearchSource = 'all' | 'google' | 'youtube' | 'wikipedia' | 'stackoverflow' | 'github';

interface SearchFiltersProps {
  sources?: {
    google?: any[];
    youtube?: any[];
    wikipedia?: any[];
    stackoverflow?: any[];
    github?: any[];
  };
  activeFilter: SearchSource;
  onFilterChange: (filter: SearchSource) => void;
}

export const SearchFilters: React.FC<SearchFiltersProps> = ({ sources, activeFilter, onFilterChange }) => {
  if (!sources) return null;

  const filters = [
    {
      key: 'all' as SearchSource,
      label: 'الكل',
      icon: <FileText className="w-4 h-4" />,
      count:
        (sources.google?.length || 0) +
        (sources.youtube?.length || 0) +
        (sources.wikipedia?.length || 0) +
        (sources.stackoverflow?.length || 0) +
        (sources.github?.length || 0),
      color: 'from-gray-600 to-gray-700',
      hoverColor: 'hover:from-gray-700 hover:to-gray-800',
    },
    {
      key: 'youtube' as SearchSource,
      label: 'فيديوهات',
      icon: <Video className="w-4 h-4" />,
      count: sources.youtube?.length || 0,
      color: 'from-red-600 to-rose-700',
      hoverColor: 'hover:from-red-700 hover:to-rose-800',
    },
    {
      key: 'google' as SearchSource,
      label: 'مقالات',
      icon: <FileText className="w-4 h-4" />,
      count: sources.google?.length || 0,
      color: 'from-blue-600 to-cyan-700',
      hoverColor: 'hover:from-blue-700 hover:to-cyan-800',
    },
    {
      key: 'wikipedia' as SearchSource,
      label: 'ويكيبيديا',
      icon: <BookOpen className="w-4 h-4" />,
      count: sources.wikipedia?.length || 0,
      color: 'from-gray-700 to-gray-800',
      hoverColor: 'hover:from-gray-800 hover:to-gray-900',
    },
    {
      key: 'stackoverflow' as SearchSource,
      label: 'برمجة',
      icon: <Code className="w-4 h-4" />,
      count: sources.stackoverflow?.length || 0,
      color: 'from-orange-600 to-orange-700',
      hoverColor: 'hover:from-orange-700 hover:to-orange-800',
    },
    {
      key: 'github' as SearchSource,
      label: 'GitHub',
      icon: <Package className="w-4 h-4" />,
      count: sources.github?.length || 0,
      color: 'from-purple-600 to-purple-700',
      hoverColor: 'hover:from-purple-700 hover:to-purple-800',
    },
  ];

  const visibleFilters = filters.filter((filter) => filter.key === 'all' || filter.count > 0);

  if (visibleFilters.length <= 1) return null;

  return (
    <div className="flex flex-wrap gap-2 mb-4 p-4 bg-gradient-to-r from-purple-50/50 via-blue-50/50 to-cyan-50/50 dark:from-purple-900/10 dark:via-blue-900/10 dark:to-cyan-900/10 rounded-2xl border border-purple-100 dark:border-purple-800/30">
      <div className="w-full mb-2">
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-2">
          🎯 تصفية النتائج:
        </h4>
      </div>

      {visibleFilters.map((filter) => (
        <button
          key={filter.key}
          onClick={() => onFilterChange(filter.key)}
          className={`
            flex items-center gap-2 px-4 py-2 rounded-xl font-semibold text-white
            transition-all duration-300 transform hover:scale-105 shadow-lg
            ${
              activeFilter === filter.key
                ? `bg-gradient-to-r ${filter.color} ring-2 ring-white dark:ring-gray-800 scale-105`
                : `bg-gradient-to-r ${filter.color} opacity-70 ${filter.hoverColor}`
            }
          `}
        >
          {filter.icon}
          <span>{filter.label}</span>
          <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs font-bold">{filter.count}</span>
        </button>
      ))}
    </div>
  );
};

export default SearchFilters;

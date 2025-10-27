// search-result-preview.tsx
// ============================================
// 🔍 نظام المعاينة السريعة لنتائج البحث
// ============================================

"use client";

import React, { useState } from 'react';
import { ExternalLink, Clock, Eye } from 'lucide-react';

interface SearchResultPreviewProps {
  result: {
    title: string;
    url: string;
    snippet?: string;
    thumbnail?: string;
    author?: string;
    duration?: string;
    views?: string;
    displayLink?: string;
  };
  children: React.ReactNode;
}

export const SearchResultPreview: React.FC<SearchResultPreviewProps> = ({ result, children }) => {
  const [showPreview, setShowPreview] = useState(false);
  const [previewPosition, setPreviewPosition] = useState({ x: 0, y: 0 });

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setPreviewPosition({
      x: rect.right + 10,
      y: rect.top
    });
    setShowPreview(true);
  };

  const handleMouseLeave = () => {
    setShowPreview(false);
  };

  return (
    <div 
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}
      
      {showPreview && (
        <div 
          className="fixed z-[60] w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden animate-fadeIn"
          style={{
            left: `${previewPosition.x}px`,
            top: `${previewPosition.y}px`,
            maxHeight: '500px'
          }}
        >
          {/* الصورة المصغرة */}
          {result.thumbnail && (
            <div className="relative h-48 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30">
              <img 
                src={result.thumbnail} 
                alt={result.title}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
              {result.duration && (
                <div className="absolute bottom-2 right-2 bg-black/80 text-white px-2 py-1 rounded text-xs font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {result.duration}
                </div>
              )}
            </div>
          )}
          
          {/* المحتوى */}
          <div className="p-4 space-y-3">
            {/* العنوان */}
            <h3 className="font-bold text-lg text-gray-900 dark:text-white line-clamp-2">
              {result.title}
            </h3>
            
            {/* المصدر والمؤلف */}
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              {result.displayLink && (
                <span className="font-medium text-blue-600 dark:text-blue-400">
                  {result.displayLink}
                </span>
              )}
              {result.author && (
                <>
                  <span>•</span>
                  <span>{result.author}</span>
                </>
              )}
            </div>
            
            {/* المشاهدات */}
            {result.views && (
              <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                <Eye className="w-4 h-4" />
                <span>{result.views} مشاهدة</span>
              </div>
            )}
            
            {/* الوصف */}
            {result.snippet && (
              <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-4">
                {result.snippet}
              </p>
            )}
            
            {/* زر الفتح */}
            <a
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2 px-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg font-semibold transition-all duration-300 transform hover:scale-[1.02] shadow-lg"
            >
              <ExternalLink className="w-4 h-4" />
              <span>فتح الرابط</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchResultPreview;
